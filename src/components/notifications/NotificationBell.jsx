import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/router';
import { Bell } from 'lucide-react';
import { getNotificationState, markNotificationsRead, subscribeNotifications } from '@/lib/notifications';

export default function NotificationBell({ className }) {
  const router = useRouter();
  const inbox = useSyncExternalStore(subscribeNotifications, getNotificationState, getNotificationState);
  const [open, setOpen] = useState(false);
  const root = useRef(null);
  const count = inbox.unreadCount;
  const recent = inbox.items.slice(0, 6);

  useEffect(() => {
    const close = (event) => {
      if (root.current && !root.current.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="relative" ref={root}>
      <button
        type="button"
        className={className}
        aria-label={count ? `Notifications, ${count} unread` : 'Notifications'}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span className="relative">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-2 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold leading-none text-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </span>
        <span className="hidden text-[11px] font-medium leading-none lg:block">Alerts</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-[#E4E9F2] bg-white text-left text-charcoal-800 shadow-elegant-lg">
          <div className="flex items-center justify-between border-b border-[#E4E9F2] px-4 py-2.5">
            <p className="text-sm font-semibold text-charcoal-900">Notifications</p>
            <button
              type="button"
              className="text-xs font-semibold text-navy-800"
              onClick={() => {
                setOpen(false);
                router.push('/notifications');
              }}
            >
              See all
            </button>
          </div>
          {recent.length === 0 ? (
            <p className="px-4 py-6 text-sm text-charcoal-500">You&apos;re all caught up.</p>
          ) : recent.map((item) => (
            <button
              key={item.id}
              type="button"
              className="block w-full border-b border-[#F3F5F8] px-4 py-3 text-left last:border-b-0 hover:bg-[#F7F8FB]"
              onClick={() => {
                markNotificationsRead([item.id]);
                setOpen(false);
                router.push(item.href);
              }}
            >
              <p className={`text-sm ${item.unread ? 'font-semibold text-charcoal-900' : 'text-charcoal-700'}`}>{item.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-charcoal-500">{item.body}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
