import toast from 'react-hot-toast';
import { notificationsAPI } from '@/lib/api';

const listeners = new Set();
const presented = new Set();

let state = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: '',
};
let socket = null;
let stopped = true;
let retryTimer = null;
let attempt = 0;

export function getNotificationState() {
  return state;
}

export function subscribeNotifications(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function publish(next) {
  state = next;
  listeners.forEach((listener) => listener());
}

function apiOrigin() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  return base.replace(/\/api\/v1\/?$/, '');
}

export function notificationSocketUrl(token) {
  const stripped = apiOrigin();
  const absolute = /^https?:\/\//.test(stripped)
    ? stripped
    : `${window.location.origin}${stripped}`;
  const ws = absolute.replace(/\/$/, '').replace(/^http/, 'ws');
  return `${ws}/ws/notifications/?token=${encodeURIComponent(token)}`;
}

function dayDiff(created) {
  const value = new Date(created);
  if (Number.isNaN(value.getTime())) return 99;
  const start = new Date(value.getFullYear(), value.getMonth(), value.getDate());
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.round((todayStart - start) / 86400000);
}

function timeLabel(created) {
  const days = dayDiff(created);
  const value = new Date(created);
  if (days <= 0) {
    const minutes = Math.max(0, Math.round((Date.now() - value.getTime()) / 60000));
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    if (minutes < 60) return `${minutes} minutes ago`;
    const hours = Math.max(1, Math.round(minutes / 60));
    return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
  }
  const clock = value.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (days === 1) return `Yesterday, ${clock}`;
  const date = value.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${date}, ${clock}`;
}

function groupOf(created) {
  const days = dayDiff(created);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return 'week';
  return 'earlier';
}

function categoryOf(kind) {
  if (/^(order|payment|refund)\./.test(kind)) return 'orders';
  if (/^(offer|promo|price|arrival)\./.test(kind)) return 'offers';
  if (kind.startsWith('account.')) return 'account';
  return 'system';
}

function iconOf(kind) {
  if (kind === 'order.shipped' || kind === 'order.out_for_delivery' || kind === 'order.delivered') return 'truck';
  if (kind.startsWith('payment.') || kind.startsWith('refund.')) return 'clipboard';
  if (kind.startsWith('offer.') || kind.startsWith('promo.')) return 'tag';
  if (kind.startsWith('price.')) return 'heart';
  if (kind.startsWith('arrival.')) return 'star';
  if (kind.startsWith('account.')) return 'megaphone';
  if (kind.startsWith('system.')) return 'gear';
  return 'package';
}

function hrefOf(data) {
  if (data.order_id) return `/orders?order=${encodeURIComponent(data.order_id)}`;
  if (data.target === 'products') return '/products';
  if (data.target === 'wishlist') return '/wishlist';
  if (data.target === 'account') return '/account';
  return '/orders';
}

export function toInboxItem(row) {
  const data = row.data || {};
  const code = typeof data.code === 'string' ? data.code : '';
  const thumb = data.thumb === 'save' || data.thumb === 'price' || data.thumb === 'arrivals' ? data.thumb : undefined;
  return {
    id: row.id,
    group: groupOf(row.created_at),
    category: categoryOf(row.kind || ''),
    icon: iconOf(row.kind || ''),
    title: row.title,
    body: row.body || '',
    highlight: code && (row.body || '').includes(code) ? code : undefined,
    time: timeLabel(row.created_at),
    href: hrefOf(data),
    thumb,
    unread: !row.read_at,
  };
}

async function fetchAll() {
  const items = [];
  let page = 1;
  while (page <= 10) {
    const response = await notificationsAPI.list(page);
    const body = response.data || {};
    items.push(...(body.results || []).map(toInboxItem));
    if (!body.next) break;
    page += 1;
  }
  const unread = await notificationsAPI.unreadCount();
  return { items, unreadCount: unread.data?.unread_count || 0 };
}

export async function loadNotifications() {
  publish({ ...state, loading: true, error: '' });
  try {
    const loaded = await fetchAll();
    publish({ ...loaded, loading: false, error: '' });
  } catch (error) {
    publish({ ...state, loading: false, error: 'Could not load notifications.' });
  }
}

export async function markNotificationsRead(ids) {
  const pending = new Set(ids);
  if (pending.size === 0) return;
  const items = state.items.map((item) => (pending.has(item.id) ? { ...item, unread: false } : item));
  const marked = state.items.filter((item) => pending.has(item.id) && item.unread).length;
  publish({ ...state, items, unreadCount: Math.max(0, state.unreadCount - marked) });
  await Promise.all([...pending].map((id) => notificationsAPI.markRead(id).catch(() => null)));
}

function upsert(row, unreadCount) {
  const item = toInboxItem(row);
  const items = [item, ...state.items.filter((existing) => existing.id !== item.id)];
  publish({ ...state, items, unreadCount, loading: false, error: '' });
  if (!presented.has(item.id)) {
    presented.add(item.id);
    const path = `${window.location.pathname}${window.location.search}`;
    const orderId = row.data?.order_id;
    if (!(orderId && path.includes(orderId))) toast(item.body || item.title);
  }
}

async function refreshedToken() {
  const refresh = localStorage.getItem('refresh_token');
  if (!refresh) return null;
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
  const response = await fetch(`${base}/auth/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh }),
  });
  if (!response.ok) return null;
  const body = await response.json();
  if (body.access) localStorage.setItem('access_token', body.access);
  if (body.refresh) localStorage.setItem('refresh_token', body.refresh);
  return body.access || null;
}

function scheduleRetry() {
  if (stopped) return;
  const delay = Math.min(30000, 1000 * (2 ** Math.min(attempt, 5)));
  attempt += 1;
  clearTimeout(retryTimer);
  retryTimer = setTimeout(connect, delay);
}

function connect() {
  if (stopped) return;
  const token = localStorage.getItem('access_token');
  if (!token) return;
  if (socket) {
    socket.onclose = null;
    socket.close();
  }
  const current = new WebSocket(notificationSocketUrl(token));
  socket = current;
  current.onopen = () => {
    attempt = 0;
  };
  current.onmessage = (event) => {
    let message;
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    if (message.type === 'notification.read') {
      publish({ ...state, unreadCount: message.unread_count || 0 });
      return;
    }
    if (message.type === 'notification.created' && message.notification) {
      upsert(message.notification, message.unread_count || 0);
    }
  };
  current.onclose = (event) => {
    if (stopped || socket !== current) return;
    if (event.code === 4401) {
      refreshedToken().then((next) => {
        if (next) connect();
        else stopNotificationSocket();
      }).catch(() => scheduleRetry());
      return;
    }
    scheduleRetry();
  };
}

export function startNotificationSocket() {
  stopped = false;
  loadNotifications();
  connect();
}

export function stopNotificationSocket() {
  stopped = true;
  clearTimeout(retryTimer);
  if (socket) {
    socket.onclose = null;
    socket.close();
    socket = null;
  }
  publish({ items: [], unreadCount: 0, loading: false, error: '' });
}
