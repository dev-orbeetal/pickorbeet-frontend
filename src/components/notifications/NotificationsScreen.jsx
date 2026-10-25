import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  channels,
  emptyCopy,
  filters,
  groups,
  iconTints,
  loadChannels,
  saveChannels,
} from './catalog';
import { getNotificationState, loadNotifications, markAllNotificationsRead, markNotificationsRead, subscribeNotifications } from '@/lib/notifications';

const ease = [0.16, 1, 0.3, 1];

function Icon({ name }) {
  const common = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true };
  if (name === 'back') {
    return <svg {...common}><path d="M15 6 9 12l6 6" /></svg>;
  }
  if (name === 'cart') {
    return <svg {...common}><path d="M6 6h15l-1.5 9h-12z" /><path d="M6 6 5 3H2" /><circle cx="9" cy="20" r="1.2" fill="currentColor" stroke="none" /><circle cx="18" cy="20" r="1.2" fill="currentColor" stroke="none" /></svg>;
  }
  if (name === 'bell') {
    return <svg {...common}><path d="M6 9a6 6 0 1 1 12 0c0 7 2 7 2 9H4c0-2 2-2 2-9" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>;
  }
  if (name === 'package') {
    return <svg {...common}><path d="M12 3 20 7.5v9L12 21 4 16.5v-9L12 3z" /><path d="M12 12 20 7.5" /><path d="M12 12v9" /><path d="M12 12 4 7.5" /></svg>;
  }
  if (name === 'tag') {
    return <svg {...common}><path d="M3 12.5 11.5 4H20v8.5L11.5 21 3 12.5z" /><circle cx="15.5" cy="8.5" r="1.2" fill="currentColor" stroke="none" /></svg>;
  }
  if (name === 'truck') {
    return <svg {...common}><path d="M3 7h11v8H3z" /><path d="M14 10h4l3 3v2h-7" /><circle cx="7" cy="17.5" r="1.4" /><circle cx="17" cy="17.5" r="1.4" /></svg>;
  }
  if (name === 'heart') {
    return <svg {...common} fill="currentColor" stroke="none"><path d="M12 20s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" /></svg>;
  }
  if (name === 'star') {
    return <svg {...common} fill="currentColor" stroke="none"><path d="m12 3 2.4 5.4 5.8.6-4.4 3.8 1.3 5.7L12 15.8 6.9 18.5l1.3-5.7L3.8 9l5.8-.6L12 3z" /></svg>;
  }
  if (name === 'clipboard') {
    return <svg {...common}><rect x="6" y="4" width="12" height="16" rx="2" /><path d="M9 4.5h6v2H9z" /><path d="M9 11h6M9 15h4" /></svg>;
  }
  if (name === 'megaphone') {
    return <svg {...common}><path d="M4 10v4l12 4V6L4 10z" /><path d="M16 9.5a3 3 0 0 1 0 5" /><path d="M7 14.5 8.2 19" /></svg>;
  }
  if (name === 'user') {
    return <svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19.5c1.2-3 3.4-4.5 6.5-4.5s5.3 1.5 6.5 4.5" /></svg>;
  }
  if (name === 'gear') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M10.1 1.8h3.8l.6 2.6c.7.2 1.3.6 1.8 1l2.4-1.2 1.9 3.3-1.8 1.8c.1.6.1 1.1 0 1.7l1.8 1.8-1.9 3.3-2.4-1.2c-.5.4-1.1.8-1.8 1l-.6 2.6h-3.8l-.6-2.6c-.7-.2-1.3-.6-1.8-1l-2.4 1.2-1.9-3.3 1.8-1.8a6 6 0 0 1 0-1.7L3.4 7.5l1.9-3.3 2.4 1.2c.5-.4 1.1-.8 1.8-1l.6-2.6Zm1.9 6.4a3.8 3.8 0 1 0 .1 7.6 3.8 3.8 0 0 0-.1-7.6Z" />
      </svg>
    );
  }
  if (name === 'chevron') {
    return <svg {...common} strokeWidth="2.2"><path d="m9 6 6 6-6 6" /></svg>;
  }
  if (name === 'down') {
    return <svg {...common} strokeWidth="2.6"><path d="M12 6v10M8 12l4 4 4-4" /></svg>;
  }
  if (name === 'home') {
    return <svg {...common}><path d="M4 11.5 12 5l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" /></svg>;
  }
  if (name === 'grid') {
    return <svg {...common}><rect x="4" y="4" width="6.5" height="6.5" rx="1.4" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.4" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.4" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.4" /></svg>;
  }
  if (name === 'user-fill') {
    return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.4" fill="currentColor" /><path d="M5 19.6c1.3-3.4 3.6-5 7-5s5.7 1.6 7 5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>;
  }
  return null;
}

function ProductPhoto() {
  return <img src="/images/neckband-cutout.png" alt="" className="neckband-photo" />;
}

function Thumb({ kind }) {
  if (kind === 'save') {
    return (
      <span className="notif-thumb thumb-save">
        <span className="thumb-copy"><span>SAVE</span><strong>৳200</strong></span>
        <ProductPhoto />
      </span>
    );
  }
  if (kind === 'price') {
    return (
      <span className="notif-thumb thumb-price">
        <ProductPhoto />
        <span className="thumb-badge"><Icon name="down" /></span>
      </span>
    );
  }
  return (
    <span className="notif-thumb thumb-new">
      <span className="thumb-copy">NEW<br />ARRIVALS</span>
      <ProductPhoto />
    </span>
  );
}

function Body({ text, highlight }) {
  return text.split('\n').map((line, index) => {
    const code = highlight && line.includes(highlight);
    const [before, after] = code ? line.split(highlight) : [line, ''];
    return (
      <span key={line}>
        {index > 0 && <br />}
        {code ? <>{before}<span className="notif-code">{highlight}</span>{after}</> : line}
      </span>
    );
  });
}

export default function NotificationsScreen() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const { totalItems } = useSelector((state) => state.cart);
  const inbox = useSyncExternalStore(subscribeNotifications, getNotificationState, getNotificationState);
  const [filter, setFilter] = useState('all');
  const [channelState, setChannelState] = useState({ orders: true, offers: true, account: true, system: true });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    setChannelState(loadChannels());
    if (!localStorage.getItem('access_token')) {
      router.replace('/login?redirect=/notifications');
    }
  }, [router]);

  const visible = useMemo(
    () => inbox.items.filter((item) => {
      if (!channelState[item.category]) return false;
      if (filter !== 'all' && item.category !== filter) return false;
      return true;
    }),
    [channelState, filter, inbox.items],
  );

  const motionOf = (delay = 0) => (reduce
    ? { duration: 0 }
    : { duration: 0.42, delay, ease });

  const mark = (ids, message) => {
    markNotificationsRead(ids);
    if (message) setStatus(message);
  };

  const toggleChannel = (id) => {
    setChannelState((current) => {
      const next = { ...current, [id]: !current[id] };
      saveChannels(next);
      return next;
    });
  };

  const goBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push('/account');
  };

  const sections = groups
    .map((group) => ({ ...group, items: visible.filter((item) => item.group === group.id) }))
    .filter((group) => group.items.length > 0);

  let cardIndex = 0;

  return (
    <div className="notif-stage">
      <div className="notif-device">
        <header className="notif-header">
          <div className="notif-header-bar">
            <button type="button" className="notif-icon-btn" aria-label="Back" onClick={goBack}>
              <Icon name="back" />
            </button>
            <Link href="/" className="notif-brand" aria-label="PickOrbeet home">
              <img src="/images/bag-mark-on-dark.png" alt="" width={128} height={136} />
              <span className="notif-wordmark"><span>Pick</span><span>Orbeet</span></span>
            </Link>
            <Link href="/cart" className="notif-icon-btn notif-cart" aria-label={totalItems ? `Cart, ${totalItems} items` : 'Cart'}>
              <Icon name="cart" />
              {totalItems > 0 && <span className="notif-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
            </Link>
          </div>
        </header>

        <main className="notif-body">
          <div className="notif-heading">
            <div>
              <h1 className="notif-title">Notifications</h1>
              <p className="notif-subtitle">Stay updated with your orders, offers and more.</p>
            </div>
            {inbox.unreadCount > 0 && (
              <button
                type="button"
                className="notif-mark"
                onClick={() => {
                  markAllNotificationsRead();
                  setStatus('All notifications marked as read');
                }}
              >
                Mark all as read
              </button>
            )}
            <button type="button" className="notif-settings" onClick={() => setSettingsOpen(true)}>
              <motion.span
                style={{ display: 'inline-flex' }}
                whileHover={reduce ? undefined : { rotate: 40 }}
                transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              >
                <Icon name="gear" />
              </motion.span>
              Notification Settings
            </button>
          </div>

          <div className="notif-chips" role="tablist" aria-label="Notification categories">
            {filters.map((item) => {
              const active = filter === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`notif-chip${active ? ' is-active' : ''}`}
                  onClick={() => setFilter(item.id)}
                >
                  {active && (
                    <motion.span
                      layoutId="notif-chip"
                      className="notif-chip-pill"
                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 34 }}
                    />
                  )}
                  <Icon name={item.icon} />
                  <span className="notif-chip-label">{item.label}</span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="popLayout" initial={false}>
            {(inbox.loading && inbox.items.length === 0) || sections.length === 0 ? (
              <motion.div
                key={inbox.loading ? 'loading' : `empty-${filter}-${inbox.error ? 'error' : 'clear'}`}
                className="notif-empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={motionOf()}
              >
                <motion.div
                  className="notif-empty-icon"
                  animate={reduce ? undefined : { y: [0, -5, 0] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Icon name="bell" />
                </motion.div>
                <h2>
                  {inbox.loading && inbox.items.length === 0
                    ? 'Loading notifications'
                    : inbox.error
                      ? 'Couldn’t refresh notifications'
                      : emptyCopy(filter).title}
                </h2>
                <p>
                  {inbox.loading && inbox.items.length === 0
                    ? 'Fetching your latest updates.'
                    : inbox.error
                      ? 'Please try again in a moment.'
                      : emptyCopy(filter).body}
                </p>
                {inbox.error && !inbox.loading && (
                  <button type="button" className="notif-retry" onClick={() => loadNotifications()}>
                    Try again
                  </button>
                )}
              </motion.div>
            ) : null}
            {sections.map((section) => {
              const unread = section.items.filter((item) => item.unread);
              return (
                <motion.section
                  key={section.id}
                  className="notif-section"
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={motionOf()}
                >
                  <div className="notif-section-head">
                    <h2 className="notif-section-title">{section.label}</h2>
                    <AnimatePresence>
                      {unread.length > 0 && (
                        <motion.button
                          type="button"
                          className="notif-mark"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={motionOf()}
                          onClick={() => mark(unread.map((item) => item.id), `${section.label} marked as read`)}
                        >
                          Mark all as read
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="notif-list">
                    <AnimatePresence mode="popLayout" initial={false}>
                      {section.items.map((item) => {
                        const index = cardIndex;
                        cardIndex += 1;
                        const isUnread = item.unread;
                        const tint = iconTints[item.icon];
                        return (
                          <motion.div
                            key={item.id}
                            layout
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            transition={motionOf(Math.min(index, 8) * 0.045)}
                          >
                            <motion.div whileTap={reduce ? undefined : { scale: 0.985 }}>
                              <Link
                                href={item.href}
                                className="notif-card"
                                aria-label={isUnread ? `${item.title}, unread` : item.title}
                                onClick={() => mark([item.id])}
                              >
                                <span className="notif-icon" style={{ background: tint.background, color: tint.color }}>
                                  <Icon name={item.icon} />
                                </span>
                                <span className="notif-copy">
                                  <p className="notif-card-title">{item.title}</p>
                                  <p className="notif-card-body"><Body text={item.body} highlight={item.highlight} /></p>
                                  <time className="notif-card-time" dateTime={item.time}>{item.time}</time>
                                </span>
                                {item.thumb && <Thumb kind={item.thumb} />}
                                <AnimatePresence>
                                  {isUnread && (
                                    <motion.span
                                      className="notif-dot"
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 18 }}
                                    />
                                  )}
                                </AnimatePresence>
                                <span className="notif-chevron" aria-hidden="true"><Icon name="chevron" /></span>
                              </Link>
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                </motion.section>
              );
            })}
          </AnimatePresence>
        </main>

        <nav className="notif-nav" aria-label="Primary">
          <Link href="/" className="notif-tab"><Icon name="home" />Home<span className="notif-tab-slot" /></Link>
          <Link href="/products" className="notif-tab"><Icon name="grid" />Categories<span className="notif-tab-slot" /></Link>
          <Link href="/wishlist" className="notif-tab"><Icon name="heart" />Wishlist<span className="notif-tab-slot" /></Link>
          <Link href="/account" className="notif-tab is-active" aria-current="page">
            <Icon name="user-fill" />
            Account
            <span className="notif-tab-bar" />
          </Link>
          <Link href="/cart" className="notif-tab">
            <span className="relative">
              <Icon name="cart" />
              {totalItems > 0 && <span className="notif-badge">{totalItems > 99 ? '99+' : totalItems}</span>}
            </span>
            Cart
            <span className="notif-tab-slot" />
          </Link>
        </nav>

        <p className="notif-sr" aria-live="polite">{status}</p>

        <AnimatePresence>
          {settingsOpen && (
            <>
              <motion.button
                type="button"
                className="notif-scrim"
                aria-label="Close notification settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={motionOf()}
                onClick={() => setSettingsOpen(false)}
              />
              <div className="notif-sheet-anchor">
                <motion.div
                  className="notif-sheet"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="notif-settings-title"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 380, damping: 34 }}
                >
                  <div className="notif-grabber" />
                  <h2 id="notif-settings-title">Notification Settings</h2>
                  <p>Choose which updates PickOrbeet keeps in this inbox.</p>
                  {channels.map((channel, index) => {
                    const tint = iconTints[channel.icon];
                    const on = channelState[channel.id];
                    return (
                      <motion.button
                        key={channel.id}
                        type="button"
                        className="notif-setting"
                        role="switch"
                        aria-checked={on}
                        onClick={() => toggleChannel(channel.id)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={motionOf(0.05 + index * 0.04)}
                      >
                        <span className="notif-icon" style={{ background: tint.background, color: tint.color }}>
                          <Icon name={channel.icon} />
                        </span>
                        <span>
                          <strong>{channel.title}</strong>
                          <small>{channel.detail}</small>
                        </span>
                        <span className={`notif-switch${on ? ' is-on' : ''}`}><i /></span>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
