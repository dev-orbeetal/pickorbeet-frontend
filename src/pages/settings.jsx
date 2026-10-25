import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  Bell,
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  Globe,
  Headphones,
  Heart,
  Home,
  Info,
  LayoutGrid,
  LogOut,
  MapPin,
  Moon,
  Pencil,
  ShieldCheck,
  ShoppingCart,
  User,
  Banknote,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { logout } from '@/store/slices/authSlice';

const ease = [0.16, 1, 0.3, 1];
const versionLabel = 'v1.2.0';

const light = {
  dark: false,
  page: '#F4F7FE',
  card: '#FFFFFF',
  ink: '#0C1440',
  hint: '#9AA3B8',
  meta: '#8B93A6',
  divider: '#EEF1F6',
  chevron: '#C5CDD8',
  edit: '#3B6FE8',
  editFill: '#FFFFFF',
  logoutFill: '#FFF4F4',
  logoutInk: '#E23B35',
  blob: '#D9E7FB',
  blobSoft: '#E7F1FC',
  switchOff: '#E3E6EE',
  sheet: '#FFFFFF',
};

const dark = {
  dark: true,
  page: '#0E1628',
  card: '#172238',
  ink: '#F4F7FF',
  hint: '#8E99B3',
  meta: '#A3AEC6',
  divider: '#2C3850',
  chevron: '#8B97B0',
  edit: '#8EB0FF',
  editFill: '#1C2B48',
  logoutFill: '#3A1A22',
  logoutInk: '#FF8A86',
  blob: '#1A2A4A',
  blobSoft: '#15243F',
  switchOff: '#3A445C',
  sheet: '#172238',
};

const rise = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.42, ease } },
};

function displayPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  let local = '';
  if (digits.length === 13 && digits.startsWith('880')) local = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith('01')) local = digits.slice(1);
  else if (digits.length === 10 && digits.startsWith('1')) local = digits;
  else return String(raw || '').trim();
  return `+880 ${local.slice(0, 4)}-${local.slice(4)}`;
}

function initialsOf(user) {
  const name = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`;
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '';
  const head = parts[0][0] || '';
  const tail = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return `${head}${tail}`.toUpperCase();
}

function readFlag(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  const stored = localStorage.getItem(key);
  if (stored == null) return fallback;
  return stored === '1';
}

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [sheet, setSheet] = useState(null);

  useEffect(() => {
    setNotifications(readFlag('pickorbeet_notifications', true));
    setDarkMode(readFlag('pickorbeet_dark', false));
  }, []);

  useEffect(() => {
    if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('access_token')) {
      router.replace('/login?redirect=/settings');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (!sheet) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setSheet(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [sheet]);

  const tone = darkMode ? dark : light;
  const name = user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || 'Your account';
  const phone = displayPhone(user?.phone);

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem('pickorbeet_notifications', next ? '1' : '0');
  };

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('pickorbeet_dark', next ? '1' : '0');
  };

  const logOut = () => {
    setSheet(null);
    dispatch(logout());
    toast.success('Signed out');
    router.push('/');
  };

  if (!isAuthenticated && typeof window !== 'undefined' && !localStorage.getItem('access_token')) return null;

  return (
    <Layout title="Settings - PickOrbeet" noindex appChrome>
      <MotionConfig reducedMotion="user">
        <div
          className="relative mx-auto flex h-[100dvh] w-full max-w-[411px] flex-col overflow-hidden shadow-[0_0_40px_rgba(15,42,98,0.08)]"
          style={{ backgroundColor: tone.page, color: tone.ink }}
        >
          <header className="relative z-30 shrink-0 overflow-hidden rounded-b-2xl bg-gradient-to-br from-[#0035A9] via-[#012783] to-[#01226F] text-white">
            <div className="pointer-events-none absolute -bottom-8 -right-4 h-24 w-28 rounded-full bg-[#0A3AAE]/50 blur-2xl" />
            <div className="pt-[env(safe-area-inset-top)]">
              <div className="flex h-[52px] items-center pl-0.5 pr-2">
                <button
                  type="button"
                  aria-label="Back"
                  onClick={() => (window.history.length > 1 ? router.back() : router.push('/account'))}
                  className="flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95"
                >
                  <ChevronLeft className="h-6 w-6" strokeWidth={2} />
                </button>
                <Link href="/" aria-label="PickOrbeet" className="flex items-center gap-[5.5px]">
                  <img src="/images/bag-mark-on-dark.png" alt="" className="h-[30px] w-7 object-contain" />
                  <span className="text-[18.2px] font-bold leading-none tracking-[-0.04em]">
                    Pick<span className="text-[#FF7D16]">Orbeet</span>
                  </span>
                </Link>
                <div className="ml-auto flex items-center">
                  <Link href="/notifications" aria-label="Notifications" className="flex h-11 w-11 items-center justify-center rounded-full transition active:scale-95">
                    <Bell className="h-[21px] w-[21px]" strokeWidth={2.2} />
                  </Link>
                  <span className="h-[15px] w-px bg-white/20" />
                  <Link href="/cart" aria-label={totalItems ? `Cart, ${totalItems} items` : 'Cart'} className="relative flex h-11 w-11 items-center justify-center">
                    <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={2.2} />
                    {totalItems > 0 && (
                      <span className="absolute right-1 top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#FE7818] px-1 text-[9px] font-semibold leading-none">
                        {totalItems > 99 ? '99+' : totalItems}
                      </span>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </header>

          <main className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-4 pt-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.section variants={rise} initial="hidden" animate="show" className="relative px-0.5 pb-0.5 pt-3.5">
              <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-6 h-[150px] w-[210px]"
                style={{ background: `radial-gradient(ellipse at center, color-mix(in srgb, ${tone.blob} ${tone.dark ? 46 : 80}%, transparent) 0%, transparent 70%)` }}
              />
              <span
                aria-hidden
                className="pointer-events-none absolute right-2 top-5 h-[78px] w-[110px]"
                style={{ background: `radial-gradient(ellipse at center, color-mix(in srgb, ${tone.blobSoft} ${tone.dark ? 36 : 92}%, transparent) 0%, transparent 72%)` }}
              />
              <div className="relative flex items-center gap-3">
                <Link href="/account" aria-label="Profile photo" className="relative h-16 w-16 shrink-0">
                  <span className="flex h-[62px] w-[62px] items-center justify-center rounded-full bg-gradient-to-br from-[#8EB4FF] to-[#2F6BFF] text-lg font-bold text-white shadow-[0_4px_12px_rgba(20,40,154,0.12)]">
                    {initialsOf(user)}
                  </span>
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 bg-[#2F6BFF] text-white" style={{ borderColor: tone.page }}>
                    <Camera className="h-[11px] w-[11px]" strokeWidth={2.4} />
                  </span>
                </Link>
                <div className="min-w-0 flex-1">
                  {user ? (
                    <>
                      <p className="truncate text-[16.5px] font-extrabold leading-tight tracking-[-0.02em]">{name}</p>
                      <p className="mt-0.5 truncate text-xs font-medium" style={{ color: tone.meta }}>{user.email}</p>
                      <p className="truncate text-xs font-medium" style={{ color: tone.meta }}>{phone || 'Add your phone number'}</p>
                    </>
                  ) : (
                    <div className="space-y-2" aria-hidden>
                      <span className="block h-3.5 w-32 rounded" style={{ backgroundColor: tone.divider }} />
                      <span className="block h-2.5 w-40 rounded" style={{ backgroundColor: tone.divider }} />
                      <span className="block h-2.5 w-28 rounded" style={{ backgroundColor: tone.divider }} />
                    </div>
                  )}
                </div>
                <Link
                  href="/account"
                  className="inline-flex h-[34px] shrink-0 items-center gap-1 rounded-full border px-2.5 text-xs font-semibold transition active:scale-95"
                  style={{ color: tone.edit, borderColor: tone.edit, backgroundColor: tone.editFill }}
                >
                  <Pencil className="h-3.5 w-3.5" strokeWidth={2.2} />
                  Edit Profile
                </Link>
              </div>
            </motion.section>

            <Section tone={tone} title="Account Settings" hint="Manage your account and personal information" delay={0.05}>
              <Row tone={tone} icon={User} tile="bg-[#EAF3FF] text-[#3B82F6]" title="Personal Information" subtitle="Name, email, phone number" href="/account" />
              <Row tone={tone} icon={ShieldCheck} tile="bg-[#F0EDFF] text-[#7C6AE8]" title="Security & Password" subtitle="Change your password" href="/account#password" />
              <Row tone={tone} icon={MapPin} tile="bg-[#FFF1E4] text-[#FF8A1F]" title="Addresses" subtitle="Manage your delivery addresses" href="/addresses" />
              <Row tone={tone} icon={CreditCard} tile="bg-[#E5F8EE] text-[#22A35A]" title="Payment" subtitle="bKash, Nagad, card, or cash at checkout" href="/cart" />
            </Section>

            <Section tone={tone} title="App Preferences" hint="Customize your shopping experience" delay={0.1}>
              <Row
                id="notifications-row"
                tone={tone}
                icon={Bell}
                tile="bg-[#FFF1E6] text-[#FF8A1A]"
                title="Notifications"
                subtitle="Order updates, offers, and more"
                onClick={toggleNotifications}
                pressed={notifications}
                trailing={<Switch on={notifications} off={tone.switchOff} />}
              />
              <Row
                tone={tone}
                icon={Moon}
                tile="bg-[#F3EEFF] text-[#8B6CF6]"
                title="Dark Mode"
                subtitle="Switch between light and dark theme"
                onClick={toggleDark}
                pressed={darkMode}
                trailing={<Switch on={darkMode} off={tone.switchOff} />}
              />
              <Row tone={tone} icon={Globe} tile="bg-[#EAF2FF] text-[#3B78F0]" title="Language" subtitle="English (US)" onClick={() => setSheet('language')} />
              <Row tone={tone} icon={Banknote} tile="bg-[#FFEEF1] text-[#F06070]" title="Currency" subtitle="Bangladeshi Taka (৳)" onClick={() => setSheet('currency')} />
            </Section>

            <Section tone={tone} title="Support & About" hint="Get help or learn more" delay={0.16}>
              <Row tone={tone} icon={Headphones} tile="bg-[#EAF1FF] text-[#3B78E8]" title="Help & Support" subtitle="Chat with the store" href="/help" />
              <Row tone={tone} icon={FileText} tile="bg-[#F3EEFF] text-[#7B5CFA]" title="Terms & Conditions" subtitle="Read our terms and policies" href="/terms" />
              <Row
                tone={tone}
                icon={Info}
                tile="bg-[#FFF1E6] text-[#FF8A1A]"
                title="About PickOrbeet"
                subtitle="App version, legal info"
                onClick={() => setSheet('about')}
                trailing={
                  <span className="flex items-center text-[12.5px] font-medium" style={{ color: tone.meta }}>
                    {versionLabel}
                    <ChevronRight className="h-3.5 w-3.5" style={{ color: tone.chevron }} />
                  </span>
                }
              />
            </Section>

            <motion.button
              type="button"
              variants={rise}
              initial="hidden"
              animate="show"
              transition={{ delay: 0.22 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSheet('logout')}
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-[14px] text-[15px] font-bold"
              style={{ backgroundColor: tone.logoutFill, color: tone.logoutInk }}
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={2.2} />
              Log Out
            </motion.button>
          </main>

          <AppBar count={totalItems} surface={tone.card} muted={darkMode ? '#9AA6C0' : '#666D7E'} active={darkMode ? '#7AA2FF' : '#0040EE'} />

          <AnimatePresence>
            {sheet && (
              <Sheet key={sheet} tone={tone} onClose={() => setSheet(null)}>
                {sheet === 'language' && (
                  <Choice title="Language" message="The store is shown in this language." label="English (US)" onPick={() => setSheet(null)} />
                )}
                {sheet === 'currency' && (
                  <Choice title="Currency" message="Prices are shown in Bangladeshi Taka." label="Bangladeshi Taka (৳)" onPick={() => setSheet(null)} />
                )}
                {sheet === 'about' && (
                  <div>
                    <h2 className="text-base font-bold">About PickOrbeet</h2>
                    <p className="mt-1.5 text-[13px]" style={{ color: tone.meta }}>Version {versionLabel}</p>
                    <p className="mt-2 text-[13.5px] leading-relaxed">
                      Shop electronics, fashion, home, and everyday essentials, with delivery across Bangladesh.
                    </p>
                    <Link href="/about" className="mt-4 flex h-[46px] items-center justify-center rounded-[14px] bg-[#2F6BFF] text-[14.5px] font-bold text-white">
                      Learn more
                    </Link>
                  </div>
                )}
                {sheet === 'logout' && (
                  <div>
                    <h2 className="text-base font-bold">Log out?</h2>
                    <p className="mt-1.5 text-[13px] leading-relaxed" style={{ color: tone.meta }}>
                      You can sign back in any time. Your cart stays on this device until then.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2.5">
                      <button type="button" onClick={() => setSheet(null)} className="h-[46px] rounded-[14px] border text-[14.5px] font-bold" style={{ borderColor: tone.divider }}>
                        Stay
                      </button>
                      <button type="button" onClick={logOut} className="h-[46px] rounded-[14px] text-[14.5px] font-bold text-white" style={{ backgroundColor: tone.logoutInk }}>
                        Log Out
                      </button>
                    </div>
                  </div>
                )}
              </Sheet>
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    </Layout>
  );
}

function Section({ tone, title, hint, delay, children }) {
  return (
    <motion.section variants={rise} initial="hidden" animate="show" transition={{ delay }} className="mt-[18px]">
      <div className="mb-2 flex items-baseline gap-2">
        <h2 className="shrink-0 text-[15px] font-extrabold tracking-[-0.02em]">{title}</h2>
        <p className="min-w-0 flex-1 truncate text-right text-[11px] font-medium tracking-[-0.01em]" style={{ color: tone.hint }}>{hint}</p>
      </div>
      <div className="overflow-hidden rounded-[18px] shadow-[0_8px_18px_rgba(20,40,154,0.06)]" style={{ backgroundColor: tone.card, '--row-line': tone.divider }}>
        {children}
      </div>
    </motion.section>
  );
}

function Row({ tone, icon: Icon, tile, title, subtitle, href, onClick, trailing, id, pressed }) {
  const body = (
    <>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${tile}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold tracking-[-0.01em]">{title}</span>
        <span className="mt-0.5 block truncate text-xs" style={{ color: tone.meta }}>{subtitle}</span>
      </span>
      {trailing || <ChevronRight className="h-3.5 w-3.5 shrink-0" style={{ color: tone.chevron }} />}
    </>
  );
  const className = "relative flex w-full items-center gap-3 px-3 py-[11px] text-left transition active:scale-[0.985] before:absolute before:left-3 before:right-3 before:top-0 before:h-px before:bg-[var(--row-line)] before:content-[''] first:before:hidden";
  if (href) {
    return (
      <Link id={id} href={href} className={className}>
        {body}
      </Link>
    );
  }
  return (
    <button id={id} type="button" onClick={onClick} aria-pressed={pressed} className={className}>
      {body}
    </button>
  );
}

function Switch({ on, off }) {
  return (
    <span
      aria-hidden
      className="relative h-7 w-[46px] shrink-0 rounded-full p-[3px]"
      style={{ backgroundColor: on ? '#FF7E14' : off }}
    >
      <motion.span
        className="block h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.16)]"
        animate={{ x: on ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 520, damping: 32 }}
      />
    </span>
  );
}

function Sheet({ tone, onClose, children }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <button type="button" aria-label="Close" className="absolute inset-0 bg-[#051340]/40" onClick={onClose} />
      <motion.div
        role="dialog"
        initial={{ y: 28 }}
        animate={{ y: 0 }}
        exit={{ y: 28 }}
        transition={{ duration: 0.28, ease }}
        className="relative w-full max-w-[411px] rounded-t-[20px] px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3"
        style={{ backgroundColor: tone.sheet, color: tone.ink }}
      >
        <span className="mx-auto mb-3 block h-1 w-9 rounded-full" style={{ backgroundColor: tone.divider }} />
        {children}
      </motion.div>
    </motion.div>
  );
}

function Choice({ title, message, label, onPick }) {
  return (
    <div>
      <h2 className="text-base font-bold">{title}</h2>
      <p className="mt-1 text-[13px] text-[#8B93A6]">{message}</p>
      <button type="button" onClick={onPick} className="mt-2 flex w-full items-center py-3 text-left text-[14.5px] font-bold">
        <span className="flex-1">{label}</span>
        <Check className="h-[18px] w-[18px] text-[#3B6FE8]" strokeWidth={2.4} />
      </button>
    </div>
  );
}

function AppBar({ count, surface, muted, active }) {
  const items = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/products', label: 'Categories', Icon: LayoutGrid },
    { href: '/wishlist', label: 'Wishlist', Icon: Heart },
    { href: '/account', label: 'Account', Icon: User, current: true },
    { href: '/cart', label: 'Cart', Icon: ShoppingCart, badge: count },
  ];
  return (
    <nav aria-label="Primary" className="z-20 grid h-[62px] shrink-0 grid-cols-5 rounded-t-3xl pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_rgba(15,42,98,0.08)]" style={{ backgroundColor: surface }}>
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          aria-current={item.current ? 'page' : undefined}
          className="relative flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-medium"
          style={{ color: item.current ? active : muted }}
        >
          <span className="relative">
            <item.Icon className="h-5 w-5" strokeWidth={item.current ? 2.4 : 1.8} fill={item.current ? 'currentColor' : 'none'} />
            {item.badge > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-3.5 min-w-[14px] items-center justify-center rounded-full bg-[#FE7818] px-1 text-[8px] font-bold leading-none text-white">
                {item.badge > 99 ? '99+' : item.badge}
              </span>
            )}
          </span>
          {item.label}
          {item.current && <span className="absolute bottom-1.5 h-[2.2px] w-[18px] rounded-full" style={{ backgroundColor: active }} />}
        </Link>
      ))}
    </nav>
  );
}
