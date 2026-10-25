import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { supportAPI } from '@/lib/api';
import { supportSocketUrl } from '@/lib/notifications';
import { getMediaUrl } from '@/lib/siteConfig';

const TOPICS = [
  { id: 'track_order', label: 'Track my order' },
  { id: 'payment', label: 'Payment issue' },
  { id: 'return', label: 'Return or refund' },
  { id: 'product', label: 'Product question' },
];

function upsertMessage(list, message) {
  if (!message?.id) return list;
  const index = list.findIndex((item) => item.id === message.id);
  if (index === -1) return [...list, message];
  const next = list.slice();
  next[index] = { ...next[index], ...message };
  return next;
}

export default function HelpPage() {
  const router = useRouter();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [file, setFile] = useState(null);
  const [agentOnline, setAgentOnline] = useState(false);
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scroller = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?redirect=/help');
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let active = true;
    setLoading(true);
    supportAPI.conversation()
      .then((response) => {
        if (!active) return;
        setThread(response.data);
        setMessages(response.data.messages || []);
        setAgentOnline(Boolean(response.data.agent_online));
      })
      .catch(() => {
        if (active) toast.error('Could not open help chat');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    supportAPI.markRead().catch(() => {});
    return () => { active = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    let socket;
    let stopped = false;
    let retry;

    const connect = () => {
      const token = localStorage.getItem('access_token');
      if (!token || stopped) return;
      socket = new WebSocket(supportSocketUrl(token));
      socket.onmessage = (event) => {
        let payload;
        try {
          payload = JSON.parse(event.data);
        } catch {
          return;
        }
        if (payload.type === 'message.created' && payload.message) {
          setMessages((current) => upsertMessage(current, payload.message));
          if (payload.message.author !== 'customer') supportAPI.markRead().catch(() => {});
        }
        if (payload.type === 'presence') setAgentOnline(Boolean(payload.agent_online));
      };
      socket.onclose = () => {
        if (!stopped) retry = setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      if (socket) {
        socket.onclose = null;
        socket.close();
      }
    };
  }, [isAuthenticated]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages]);

  const send = async ({ topic = '', body = draft } = {}) => {
    const text = body.trim();
    if (!text && !topic && !file) {
      toast.error('Write a message or choose a topic');
      return;
    }
    setSending(true);
    try {
      let response;
      if (file) {
        const form = new FormData();
        if (text) form.append('body', text);
        if (topic) form.append('topic', topic);
        form.append('image', file);
        response = await supportAPI.sendMessage(form);
      } else {
        response = await supportAPI.sendMessage({ body: text, topic });
      }
      setMessages((current) => upsertMessage(current, response.data));
      setDraft('');
      setFile(null);
    } catch (error) {
      const data = error.response?.data || {};
      const message = data.body?.[0] || data.image?.[0] || data.topic?.[0] || data.detail || 'Message was not sent';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) return null;

  const phone = thread?.profile?.phone;

  return (
    <Layout title="Help - Pickorbeet" noindex>
      <div className="container-custom max-w-3xl py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold text-charcoal-900">Help</h1>
            <p className="mt-1 text-sm text-charcoal-600">
              {thread?.profile?.display_name || 'PickOrbeet support'}
              {agentOnline ? ' is online' : ' will reply soon'}
            </p>
          </div>
          {phone && (
            <a href={`tel:${phone}`} className="btn btn-secondary">
              Call {phone}
            </a>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div ref={scroller} className="h-[28rem] space-y-3 overflow-y-auto bg-cream-50 p-4">
            {loading && <p className="text-sm text-charcoal-500">Loading your conversation…</p>}
            {!loading && messages.length === 0 && (
              <p className="text-sm text-charcoal-500">Send a message and the store will reply here.</p>
            )}
            {messages.map((message) => {
              const mine = message.author === 'customer';
              return (
                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${mine ? 'bg-primary-600 text-white' : 'bg-white text-charcoal-800 shadow-sm'}`}>
                    {message.topic_label && <p className="mb-1 text-xs font-semibold opacity-80">{message.topic_label}</p>}
                    {message.body && <p className="whitespace-pre-wrap">{message.body}</p>}
                    {message.image && (
                      <img src={getMediaUrl(message.image)} alt="" className="mt-2 max-h-48 rounded-lg" />
                    )}
                    {message.order?.order_number && (
                      <Link href={`/orders?order=${message.order.id || ''}`} className={`mt-2 block text-xs underline ${mine ? 'text-white' : 'text-primary-700'}`}>
                        Order {message.order.order_number}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {TOPICS.map((topic) => (
                <button
                  key={topic.id}
                  type="button"
                  disabled={sending}
                  onClick={() => send({ topic: topic.id, body: '' })}
                  className="rounded-full border px-3 py-1 text-sm text-charcoal-700 hover:border-primary-500"
                >
                  {topic.label}
                </button>
              ))}
            </div>
            <form
              className="flex flex-col gap-3 sm:flex-row"
              onSubmit={(event) => {
                event.preventDefault();
                send();
              }}
            >
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="input flex-1"
                placeholder="Write a message"
                maxLength={2000}
                aria-label="Message"
              />
              <label className="btn btn-secondary cursor-pointer">
                {file ? file.name : 'Photo'}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </label>
              <button type="submit" disabled={sending} className="btn btn-primary">
                {sending ? 'Sending' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
