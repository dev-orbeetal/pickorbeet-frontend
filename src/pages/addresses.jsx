import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Home,
  MapPin,
  Navigation,
  Pencil,
  Phone,
  Plus,
  Search,
  ShieldCheck,
  ShoppingCart,
  Trash2,
  Heart,
  LayoutGrid,
  User,
} from 'lucide-react';
import toast from 'react-hot-toast';
import Layout from '@/components/layout/Layout';
import { addressAPI } from '@/lib/api';

const ease = [0.16, 1, 0.3, 1];

function unwrap(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function phoneForApi(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('880')) return `0${digits.slice(3)}`;
  if (digits.length === 10 && digits.startsWith('1')) return `0${digits}`;
  return digits;
}

function displayPhone(raw) {
  const digits = String(raw || '').replace(/\D/g, '');
  let local = '';
  if (digits.length === 13 && digits.startsWith('880')) local = digits.slice(3);
  else if (digits.length === 11 && digits.startsWith('01')) local = digits.slice(1);
  else if (digits.length === 10 && digits.startsWith('1')) local = digits;
  else return String(raw || '').trim();
  return `+880 ${local.slice(0, 4)}-${local.slice(4)}`;
}

function placeName(address) {
  const label = String(address.label || '').trim();
  return label || 'Address';
}

function deliveryLine(address) {
  const parts = [address.address_line1, address.address_line2, address.city, address.district, address.country]
    .map((part) => String(part || '').trim())
    .filter(Boolean);
  return parts.filter((part, index) => index === 0 || part.toLowerCase() !== parts[index - 1].toLowerCase()).join(', ');
}

function placeKind(label) {
  const name = String(label || '').trim().toLowerCase();
  if (name === 'office' || name.includes('work')) {
    return { Icon: Building2, tint: 'bg-[#FFF1E0]', color: 'text-[#E07A1A]' };
  }
  if (name && name !== 'home') {
    return { Icon: MapPin, tint: 'bg-[#F0ECFF]', color: 'text-[#5B4BDB]' };
  }
  return { Icon: Home, tint: 'bg-[#EAF0FF]', color: 'text-[#3B6BFF]' };
}

async function locatePlace() {
  if (!navigator.geolocation) throw new Error('Location is not available in this browser.');
  const position = await new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, () => reject(new Error('Location permission is off. You can still type the address.')), {
      enableHighAccuracy: false,
      timeout: 12000,
    });
  });
  const { latitude, longitude } = position.coords;
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) throw new Error('Could not read this location. Enter the address instead.');
  const body = await response.json();
  const address = body.address || {};
  const pick = (...keys) => {
    for (const key of keys) {
      if (address[key]) return String(address[key]);
    }
    return '';
  };
  const line1 = [pick('house_number'), pick('road', 'pedestrian')].filter(Boolean).join(' ');
  return {
    address_line1: line1 || pick('building', 'amenity'),
    address_line2: pick('suburb', 'neighbourhood'),
    city: pick('city', 'town', 'municipality', 'village'),
    district: pick('state_district', 'county', 'state'),
    postal_code: pick('postcode'),
    country: pick('country') || 'Bangladesh',
  };
}

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { totalItems } = useSelector((state) => state.cart);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [editor, setEditor] = useState(null);
  const [busyId, setBusyId] = useState('');
  const [locating, setLocating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await addressAPI.list();
      setAddresses(unwrap(response.data));
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not load addresses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('access_token')) {
      router.replace('/login?redirect=/addresses');
      return;
    }
    if (isAuthenticated) load();
  }, [isAuthenticated, router]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return addresses;
    return addresses.filter((item) =>
      [placeName(item), item.full_name, item.phone, deliveryLine(item)].join(' ').toLowerCase().includes(needle),
    );
  }, [addresses, query]);

  const openCreate = (seed = {}) => {
    setEditor({
      label: seed.label || '',
      full_name: user?.full_name || `${user?.first_name || ''} ${user?.last_name || ''}`.trim(),
      phone: user?.phone || '',
      address_line1: seed.address_line1 || '',
      address_line2: seed.address_line2 || '',
      city: seed.city || '',
      district: seed.district || '',
      postal_code: seed.postal_code || '',
      country: seed.country || 'Bangladesh',
      is_default: addresses.length === 0,
    });
  };

  const useLocation = async () => {
    setLocating(true);
    try {
      const place = await locatePlace();
      openCreate(place);
    } catch (error) {
      toast.error(error.message || 'Could not read this location.');
      openCreate();
    } finally {
      setLocating(false);
    }
  };

  const setDefault = async (address) => {
    if (address.is_default) return;
    setBusyId(address.id);
    try {
      await addressAPI.update(address.id, { is_default: true });
      setAddresses((current) =>
        current
          .map((item) => ({ ...item, is_default: item.id === address.id }))
          .sort((a, b) => Number(b.is_default) - Number(a.is_default)),
      );
      toast.success(`${placeName(address)} is now the default`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not update this address');
    } finally {
      setBusyId('');
    }
  };

  const remove = async (address) => {
    setBusyId(address.id);
    try {
      await addressAPI.remove(address.id);
      setAddresses((current) => current.filter((item) => item.id !== address.id));
      setPendingDelete(null);
      toast.success('Address deleted');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Could not delete this address');
    } finally {
      setBusyId('');
    }
  };

  return (
    <Layout title="Delivery addresses - PickOrbeet" noindex appChrome>
      <MotionConfig reducedMotion="user">
        <div className="relative mx-auto flex h-[100dvh] w-full max-w-[430px] flex-col overflow-hidden bg-[#E9EFFD] shadow-[0_0_40px_rgba(15,42,98,0.08)]">
          <header className="z-20 shrink-0 rounded-b-[18px] bg-gradient-to-b from-[#0035A9] via-[#012783] to-[#01226F] px-4 pb-3.5 pt-[max(10px,env(safe-area-inset-top))] text-white">
            <div className="flex h-[50px] items-center">
              <button type="button" aria-label="Back" onClick={() => router.push('/account')} className="flex h-10 w-10 items-center justify-center">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <Link href="/" className="mx-auto flex items-center gap-2" aria-label="PickOrbeet">
                <img src="/images/logo.png" alt="" className="h-8 w-8 rounded-lg bg-white/10 object-contain" />
                <span className="text-[20px] font-bold tracking-[-0.04em]">
                  Pick<span className="text-[#FF7D16]">Orbeet</span>
                </span>
              </Link>
              <Link href="/cart" aria-label="Cart" className="relative flex h-10 w-10 items-center justify-center">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute right-0.5 top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#FE7818] px-1 text-[10px] font-semibold">
                  {totalItems > 99 ? '99+' : totalItems || 0}
                </span>
              </Link>
            </div>
            <label className="mt-0.5 flex h-11 items-center gap-2 rounded-xl bg-white px-3 text-[#5C6578]">
              <Search className="h-[18px] w-[18px]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search addresses..."
                className="h-full w-full bg-transparent text-sm text-[#051340] outline-none placeholder:text-[#8B93A7]"
              />
            </label>
          </header>

          <main className="flex-1 overflow-y-auto px-4 pb-6 pt-3.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, ease }}
              className="flex items-center rounded-[18px] bg-white px-4 py-4 shadow-[0_8px_18px_rgba(15,42,98,0.07)]"
            >
              <div className="min-w-0 flex-1 pr-1">
                <h1 className="text-[17px] font-bold leading-[1.15] tracking-[-0.03em] text-[#051340]">Where should we deliver?</h1>
                <p className="mt-1.5 text-[12.5px] leading-snug text-[#6E7890]">Manage your saved delivery locations</p>
              </div>
              <HeroScene />
            </motion.section>

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => openCreate()}
              className="mt-3.5 flex h-[52px] w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#FF8A1D] to-[#FF5E00] text-[16px] font-bold text-white shadow-[0_6px_14px_rgba(255,106,0,0.25)]"
            >
              <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-white text-[#FF6A00]">
                <Plus className="h-3.5 w-3.5" strokeWidth={3} />
              </span>
              Add New Address
            </motion.button>

            <div className="mb-2.5 mt-5 flex items-baseline justify-between">
              <h2 className="text-[18px] font-bold text-[#051340]">Saved addresses</h2>
              <p className="text-[13px] text-[#8A93A8]">{loading ? '' : visible.length === 1 ? '1 address' : `${visible.length} addresses`}</p>
            </div>

            {loading ? (
              <div className="space-y-3">
                <div className="h-36 animate-pulse rounded-2xl bg-[#E6EBF5]" />
                <div className="h-36 animate-pulse rounded-2xl bg-[#E6EBF5]" />
              </div>
            ) : visible.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-[#6E7890]">
                {addresses.length === 0 ? 'No saved addresses yet. Add a home, office, or any place you want orders delivered.' : 'No addresses match that search.'}
              </p>
            ) : (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {visible.map((address, index) => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      index={index}
                      busy={busyId === address.id}
                      onSelect={() => setDefault(address)}
                      onEdit={() => setEditor({ ...address })}
                      onDelete={() => setPendingDelete(address)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              disabled={locating}
              onClick={useLocation}
              className="mt-4 flex h-[52px] w-full items-center rounded-2xl border-[1.4px] border-[#0040EE] bg-white px-4 text-[15px] font-bold text-[#0040EE] disabled:opacity-70"
            >
              {locating ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0040EE] border-t-transparent" /> : <Navigation className="h-[18px] w-[18px]" />}
              <span className="flex-1 text-center">Use current location</span>
              <ChevronRight className="h-4 w-4" />
            </motion.button>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[12px] text-[#9AA3B5]">
              <ShieldCheck className="h-3.5 w-3.5" />
              Your addresses are kept private and secure.
            </p>
          </main>

          <AppBar />

          <AnimatePresence>
            {editor && (
              <AddressEditor
                draft={editor}
                onClose={() => setEditor(null)}
                onSaved={(saved, created) => {
                  setAddresses((current) => {
                    const next = created ? [saved, ...current] : current.map((item) => (item.id === saved.id ? saved : item));
                    if (!saved.is_default) return next;
                    return next.map((item) => ({ ...item, is_default: item.id === saved.id }));
                  });
                  setEditor(null);
                  toast.success(created ? 'Address saved' : 'Address updated');
                }}
              />
            )}
            {pendingDelete && (
              <ConfirmDelete
                address={pendingDelete}
                busy={busyId === pendingDelete.id}
                onCancel={() => setPendingDelete(null)}
                onConfirm={() => remove(pendingDelete)}
              />
            )}
          </AnimatePresence>
        </div>
      </MotionConfig>
    </Layout>
  );
}

function AddressCard({ address, index, busy, onSelect, onEdit, onDelete }) {
  const kind = placeKind(address.label);
  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.32, delay: Math.min(index, 8) * 0.04, ease }}
      className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_16px_rgba(15,42,98,0.06)]"
    >
      <div className="flex gap-2.5 px-3 pb-2.5 pt-3.5">
        <span className={`flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full ${kind.tint} ${kind.color}`}>
          <kind.Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[16px] font-bold text-[#051340]">{placeName(address)}</h3>
            {address.is_default && (
              <span className="rounded-md bg-[#0040EE] px-1.5 py-0.5 text-[9px] font-bold tracking-[0.04em] text-white">DEFAULT</span>
            )}
          </div>
          <p className="text-[13px] text-[#3C4660]">{address.full_name}</p>
          <p className="mt-1.5 flex gap-1.5 text-[12px] leading-snug text-[#6A738A]">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8B93A7]" />
            <span>{deliveryLine(address)}</span>
          </p>
          <p className="mt-0.5 flex gap-1.5 text-[12px] text-[#6A738A]">
            <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8B93A7]" />
            <span>{displayPhone(address.phone)}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button type="button" aria-label={address.is_default ? 'Default address' : 'Set as default'} onClick={onSelect} className="mt-0.5">
            <span className={`flex h-[22px] w-[22px] items-center justify-center rounded-full border-[1.6px] ${address.is_default ? 'border-[#0040EE] bg-[#0040EE]' : 'border-[#C5CDDC]'}`}>
              {busy ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : address.is_default ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
            </span>
          </button>
          <MapThumb />
        </div>
      </div>
      <div className="grid h-[42px] grid-cols-[1fr_1px_1fr] items-center border-t border-[#E8EDF5]">
        <button type="button" onClick={onEdit} className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#0040EE]">
          <Pencil className="h-4 w-4" /> Edit
        </button>
        <span className="h-[18px] bg-[#E1E6F0]" />
        <button type="button" onClick={onDelete} className="flex items-center justify-center gap-1.5 text-sm font-semibold text-[#E11D2E]">
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      </div>
    </motion.article>
  );
}

function AddressEditor({ draft, onClose, onSaved }) {
  const [form, setForm] = useState(draft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const created = !draft.id;
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    const phone = phoneForApi(form.phone);
    const district = form.district.trim() || form.city.trim();
    if (!form.label.trim() || !form.full_name.trim() || phone.length < 11 || !form.address_line1.trim() || !form.city.trim()) {
      setError('Add a label, name, phone, street, and city.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      address_type: 'shipping',
      label: form.label.trim(),
      full_name: form.full_name.trim(),
      phone,
      address_line1: form.address_line1.trim(),
      address_line2: form.address_line2.trim(),
      city: form.city.trim(),
      district,
      postal_code: form.postal_code.trim(),
      country: form.country || 'Bangladesh',
      is_default: Boolean(form.is_default),
    };
    try {
      const response = created ? await addressAPI.create(payload) : await addressAPI.update(draft.id, payload);
      onSaved(response.data, created);
    } catch (err) {
      const data = err.response?.data;
      const first = data && typeof data === 'object' ? Object.values(data).flat()[0] : null;
      setError(typeof first === 'string' ? first : 'Could not save this address');
      setSaving(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#051340]/40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={save}
        onClick={(event) => event.stopPropagation()}
        initial={{ y: 40 }}
        animate={{ y: 0 }}
        exit={{ y: 40 }}
        transition={{ duration: 0.28, ease }}
        className="relative max-h-[92vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-white px-5 pb-6 pt-3"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-[#D7DEEA]" />
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-[#051340]">{created ? 'Add New Address' : 'Edit address'}</h2>
          <button type="button" onClick={onClose} className="text-sm font-semibold text-[#6E7890]">
            Close
          </button>
        </div>
        <div className="mt-3 flex gap-2">
          {['Home', 'Office'].map((label) => (
            <button
              key={label}
              type="button"
              onClick={() => setForm((current) => ({ ...current, label }))}
              className={`rounded-full border px-3.5 py-2 text-[13px] font-semibold ${form.label === label ? 'border-[#0040EE] bg-[#EDF3FE] text-[#0040EE]' : 'border-[#E1E7F0] bg-[#F4F7FB] text-[#051340]'}`}
            >
              {label}
            </button>
          ))}
        </div>
        {[
          ['label', 'Label', 'Home, Office, Parents…'],
          ['full_name', 'Full name', ''],
          ['phone', 'Phone', ''],
          ['address_line1', 'Street address', ''],
          ['address_line2', 'Area or landmark', 'Optional'],
          ['city', 'City', ''],
          ['district', 'District', 'Same as city if you leave this blank'],
          ['postal_code', 'Postal code', 'Optional'],
        ].map(([key, label, hint]) => (
          <label key={key} className="mt-2.5 block text-sm font-medium text-[#3C4660]">
            {label}
            <input
              value={form[key] || ''}
              onChange={set(key)}
              placeholder={hint}
              className="mt-1 h-11 w-full rounded-xl border border-[#E3E8F1] bg-[#F7F9FC] px-3 text-[#051340] outline-none focus:border-[#0040EE]"
            />
          </label>
        ))}
        <label className="mt-3 flex items-center justify-between text-sm font-medium text-[#051340]">
          Use as default delivery address
          <input type="checkbox" checked={Boolean(form.is_default)} onChange={(event) => setForm((current) => ({ ...current, is_default: event.target.checked }))} />
        </label>
        {error && <p className="mt-2 text-sm text-[#E11D2E]">{error}</p>}
        <button type="submit" disabled={saving} className="mt-4 flex h-[52px] w-full items-center justify-center rounded-2xl bg-gradient-to-r from-[#FF8A1D] to-[#FF5E00] text-base font-bold text-white disabled:opacity-70">
          {saving ? 'Saving…' : created ? 'Add New Address' : 'Save changes'}
        </button>
      </motion.form>
    </motion.div>
  );
}

function ConfirmDelete({ address, busy, onCancel, onConfirm }) {
  return (
    <motion.div className="fixed inset-0 z-50 flex items-end justify-center bg-[#051340]/40" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div initial={{ y: 24 }} animate={{ y: 0 }} exit={{ y: 24 }} className="mb-6 w-[calc(100%-32px)] max-w-[398px] rounded-2xl bg-white p-5">
        <h2 className="text-lg font-bold text-[#051340]">Delete this address?</h2>
        <p className="mt-1 text-sm text-[#6E7890]">{placeName(address)} will be removed from your saved locations.</p>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={onCancel} className="h-11 flex-1 rounded-xl bg-[#F4F7FB] font-semibold text-[#051340]">Keep</button>
          <button type="button" onClick={onConfirm} disabled={busy} className="h-11 flex-1 rounded-xl bg-[#E11D2E] font-semibold text-white disabled:opacity-70">
            {busy ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function AppBar() {
  const items = [
    { href: '/', label: 'Home', Icon: Home },
    { href: '/products', label: 'Categories', Icon: LayoutGrid },
    { href: '/wishlist', label: 'Wishlist', Icon: Heart },
    { href: '/account', label: 'Account', Icon: User },
    { href: '/cart', label: 'Cart', Icon: ShoppingCart },
  ];
  return (
    <nav className="z-20 grid h-[62px] shrink-0 grid-cols-5 rounded-t-3xl bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_18px_rgba(15,42,98,0.08)]">
      {items.map((item) => (
        <Link key={item.label} href={item.href} className="flex flex-col items-center justify-center gap-0.5 text-[8.5px] font-medium text-[#666D7E]">
          <item.Icon className="h-5 w-5" strokeWidth={1.8} />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function HeroScene() {
  return (
    <svg viewBox="0 0 128 84" className="h-[70px] w-[96px] shrink-0" aria-hidden="true">
      <rect width="128" height="84" rx="14" fill="#E7F2FF" />
      <path d="M0 58h128v12c0 8-6 14-14 14H14C6 84 0 78 0 70V58z" fill="#D7E7F8" />
      <rect x="8" y="34" width="16" height="24" rx="2" fill="#C5D8F2" />
      <rect x="28" y="26" width="14" height="32" rx="2" fill="#B7CEEA" />
      <circle cx="18" cy="22" r="7" fill="#8FCB7A" />
      <rect x="16" y="22" width="4" height="10" fill="#6E9A5C" />
      <circle cx="108" cy="24" r="6" fill="#8FCB7A" />
      <rect x="106" y="24" width="4" height="9" fill="#6E9A5C" />
      <path d="M78 18c8 0 12 7 12 14 0 10-12 22-12 22S66 42 66 32c0-7 4-14 12-14z" fill="#2F6BFF" />
      <circle cx="78" cy="31" r="4" fill="#fff" />
      <rect x="40" y="60" width="26" height="12" rx="3" fill="#FF7A1A" />
      <rect x="60" y="62" width="10" height="8" rx="2" fill="#FFB067" />
      <circle cx="47" cy="73" r="3" fill="#334155" />
      <circle cx="62" cy="73" r="3" fill="#334155" />
    </svg>
  );
}

function MapThumb() {
  return (
    <svg viewBox="0 0 72 54" className="h-[54px] w-[72px]" aria-hidden="true">
      <rect width="72" height="54" rx="8" fill="#E7F6E4" />
      <path d="M0 19 H72 M29 0 L40 54" stroke="#F7F4EA" strokeWidth="5" />
      <circle cx="42" cy="23" r="4.5" fill="#E23B3B" />
    </svg>
  );
}
