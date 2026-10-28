const VISITOR_KEY = 'pb_visitor_id';
const SESSION_KEY = 'pb_session_id';
const SESSION_AT = 'pb_session_at';
const IDLE_MS = 30 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

let lastPath = '';
let lastAt = 0;
let current = null;

function uuid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    const rand = Math.floor(Math.random() * 16);
    const value = char === 'x' ? rand : (rand & 0x3) | 0x8;
    return value.toString(16);
  });
}

function readStore(store, key) {
  try {
    return store.getItem(key);
  } catch {
    return null;
  }
}

function writeStore(store, key, value) {
  try {
    store.setItem(key, value);
  } catch {
    // Private mode can block storage. The visit is still sent for this page.
  }
}

function visitorId() {
  const existing = readStore(localStorage, VISITOR_KEY);
  if (UUID.test(existing || '')) return existing;
  const created = uuid();
  writeStore(localStorage, VISITOR_KEY, created);
  return created;
}

function sessionId() {
  const now = Date.now();
  const existing = readStore(sessionStorage, SESSION_KEY);
  const seenAt = Number(readStore(sessionStorage, SESSION_AT) || 0);
  const expired = !seenAt || now - seenAt > IDLE_MS;
  const id = !UUID.test(existing || '') || expired ? uuid() : existing;
  writeStore(sessionStorage, SESSION_KEY, id);
  writeStore(sessionStorage, SESSION_AT, String(now));
  return id;
}

function shouldSkip(path) {
  return (
    !path
    || path.startsWith('/api')
    || path.startsWith('/admin')
    || path.startsWith('/django-admin')
    || path.startsWith('/_next')
  );
}

function send(body) {
  const headers = { 'Content-Type': 'application/json' };
  try {
    const token = localStorage.getItem('access_token');
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // A guest visit is still useful.
  }
  fetch('/api/analytics/collect', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    keepalive: true,
    credentials: 'same-origin',
  }).catch(() => {});
}

function sendDuration() {
  if (!current) return;
  const duration = Date.now() - current.startedAt;
  if (duration <= 0) return;
  send({
    type: 'engagement',
    event_id: current.eventId,
    visitor_id: current.visitorId,
    session_id: current.sessionId,
    duration_ms: duration,
    channel: 'web',
  });
}

function trackPageView(url) {
  const pathAndQuery = String(url || '/').split('#')[0] || '/';
  const pathOnly = pathAndQuery.split('?')[0] || '/';
  if (shouldSkip(pathOnly)) {
    sendDuration();
    current = null;
    return;
  }

  const now = Date.now();
  if (pathOnly === lastPath && now - lastAt < 1000) return;

  sendDuration();
  lastPath = pathOnly;
  lastAt = now;

  const eventId = uuid();
  const visitor = visitorId();
  const session = sessionId();
  current = { eventId, visitorId: visitor, sessionId: session, startedAt: now };

  const params = new URLSearchParams(pathAndQuery.split('?')[1] || '');
  const body = {
    type: 'pageview',
    event_id: eventId,
    visitor_id: visitor,
    session_id: session,
    path: pathAndQuery,
    title: '',
    referrer: typeof document !== 'undefined' ? document.referrer || '' : '',
    channel: 'web',
    utm_source: params.get('utm_source') || '',
    utm_medium: params.get('utm_medium') || '',
    utm_campaign: params.get('utm_campaign') || '',
    utm_content: params.get('utm_content') || '',
    utm_term: params.get('utm_term') || '',
  };

  window.setTimeout(() => {
    body.title = (document.title || '').slice(0, 300);
    send(body);
  }, 50);
}

export function installAnalytics(router) {
  if (typeof window === 'undefined') return () => {};
  if (window.location.hostname === 'admin.pickorbeet.com') return () => {};

  const track = (url) => trackPageView(url || `${window.location.pathname}${window.location.search}`);
  track(router.asPath || `${window.location.pathname}${window.location.search}`);

  const onRoute = (url) => track(url);
  router.events.on('routeChangeComplete', onRoute);

  const onHide = () => {
    if (document.visibilityState === 'hidden') sendDuration();
  };
  document.addEventListener('visibilitychange', onHide);
  window.addEventListener('pagehide', sendDuration);

  return () => {
    router.events.off('routeChangeComplete', onRoute);
    document.removeEventListener('visibilitychange', onHide);
    window.removeEventListener('pagehide', sendDuration);
  };
}
