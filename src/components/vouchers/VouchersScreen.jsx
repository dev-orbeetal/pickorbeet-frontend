import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Calendar, Check, ChevronLeft, Clock3, Percent, Search, ShoppingCart, Ticket, Truck, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { tones, voucherCount, voucherFilters, vouchersFor } from './voucherData';

const ease = [0.16, 1, 0.3, 1];

const statusStyle = {
  available: { label: 'Available', bg: '#E5F8EC', fg: '#12924A', Icon: Check },
  used: { label: 'Used', bg: '#F1F2F6', fg: '#8B93A3', Icon: Clock3 },
  expired: { label: 'Expired', bg: '#FDECEE', fg: '#E11D48', Icon: X },
};

function actionLabel(state) {
  if (state === 'used') return 'Used';
  if (state === 'expired') return 'Expired';
  return 'Use Now';
}

export default function VouchersScreen() {
  const reduced = useReducedMotion();
  const router = useRouter();
  const { totalItems } = useSelector((state) => state.cart);
  const [filter, setFilter] = useState('all');
  const [terms, setTerms] = useState(null);
  const list = vouchersFor(filter);

  const useVoucher = (voucher) => {
    toast.success(`Use ${voucher.code} at checkout`);
    window.setTimeout(() => router.push('/cart'), 700);
  };

  return (
    <div className="bg-[#F4F7FE]">
      <VoucherHeader count={totalItems} onBack={() => (window.history.length > 1 ? router.back() : router.push('/account'))} />
      <div className="mx-auto w-full max-w-[430px] px-[13px] pb-8 pt-3">
        <Hero reduced={reduced} />
        <FilterRow filter={filter} onSelect={setFilter} />
        <div className="mt-3 space-y-2.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((voucher, index) => (
              <VoucherTicket
                key={voucher.id}
                voucher={voucher}
                index={index}
                reduced={reduced}
                onUse={() => useVoucher(voucher)}
                onTerms={() => setTerms(voucher)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
      <AnimatePresence>
        {terms && <TermsDialog voucher={terms} onClose={() => setTerms(null)} />}
      </AnimatePresence>
    </div>
  );
}

function VoucherHeader({ count, onBack }) {
  const badge = count > 99 ? '99+' : String(count);
  return (
    <header className="sticky top-0 z-30 bg-gradient-to-br from-[#0035A9] via-[#012783] to-[#01226F] text-white lg:hidden">
      <div className="mx-auto flex h-11 max-w-[430px] items-center pr-1.5">
        <button type="button" onClick={onBack} aria-label="Back" className="flex h-11 w-10 items-center justify-center">
          <ChevronLeft className="h-6 w-6" strokeWidth={2.25} />
        </button>
        <Link href="/" aria-label="PickOrbeet" className="flex items-center gap-1.5">
          <img src="/images/bag-mark-on-dark.png" alt="" width={30} height={31} className="h-[31px] w-[30px] object-contain" />
          <span className="text-[19.5px] font-extrabold leading-none tracking-[-0.04em]">
            Pick<span className="text-[#FF7D16]">Orbeet</span>
          </span>
        </Link>
        <Link href="/cart" aria-label={`Cart, ${count} items`} className="relative ml-auto mr-1 flex h-11 w-11 items-center justify-center">
          <ShoppingCart className="h-[22px] w-[22px]" strokeWidth={2.4} />
          <span className="absolute right-1 top-1.5 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#FE7818] px-1 text-[9px] font-semibold leading-none text-white">
            {badge}
          </span>
        </Link>
      </div>
      <form action="/products" className="mx-auto max-w-[430px] px-4 pb-3" role="search">
        <label className="flex h-9 items-center gap-2 rounded-[11px] bg-[#ECF1FB] px-3 text-[#7781AB] shadow-[0_1px_3px_rgba(0,10,60,0.18)]">
          <Search className="h-4 w-4 text-[#001162]" aria-hidden="true" />
          <input
            name="search"
            placeholder="Search products, brands..."
            aria-label="Search products"
            className="w-full bg-transparent text-[12px] font-medium text-[#07133A] outline-none placeholder:text-[#7781AB]"
          />
        </label>
      </form>
    </header>
  );
}

function Hero({ reduced }) {
  return (
    <motion.section
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.42, ease }}
      className="relative h-[132px] overflow-hidden rounded-2xl bg-gradient-to-r from-[#FFFDFB] via-[#FFF4EA] to-[#FFE7D2] shadow-[0_5px_14px_rgba(20,40,154,0.05)]"
    >
      <div className="relative z-10 max-w-[250px] px-3.5 pb-3 pt-3.5">
        <p className="flex items-center gap-1.5 text-[12px] font-bold leading-none text-[#FF7A12]">
          <span className="h-[13px] w-[3px] rounded-sm bg-[#FF7A12]" aria-hidden="true" />
          My Vouchers
        </p>
        <h1 className="mt-2 text-[18.5px] font-extrabold leading-[1.12] tracking-[-0.02em] text-[#07133A]">
          Save More
          <br />
          Everytime You Shop
        </h1>
        <p className="mt-1.5 text-[11px] leading-[1.3] text-[#6A738C]">
          Collect vouchers, apply at checkout
          <br />
          and enjoy extra discounts.
        </p>
      </div>
      <motion.div
        className="absolute -bottom-2 -right-1 h-[118px] w-[150px]"
        animate={reduced ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      >
        <span className="absolute bottom-2.5 left-4 h-5 w-[78px] rounded-full bg-[#D7E8FF]" />
        <Gift />
        <Bag />
        <span className="absolute right-7 top-5 h-12 w-[72px] rotate-[12deg] rounded-lg bg-[#FFB15A] shadow-[0_4px_8px_rgba(255,122,18,0.35)]" />
        <span className="absolute right-2 top-1.5 flex h-12 w-[72px] -rotate-[8deg] items-center justify-center rounded-lg bg-[#FF7A12] text-[26px] font-extrabold leading-none text-white shadow-[0_4px_8px_rgba(255,122,18,0.35)]">
          %
        </span>
        <span className="absolute left-11 top-2 h-1 w-2 rotate-[30deg] rounded-sm bg-[#FF7A12]" />
        <span className="absolute right-4 top-0 h-1 w-2 -rotate-12 rounded-sm bg-[#7DB2FE]" />
      </motion.div>
    </motion.section>
  );
}

function Gift() {
  return (
    <span className="absolute bottom-4 left-2 block h-9 w-9">
      <span className="absolute bottom-0 left-1 h-[26px] w-[30px] rounded bg-[#3D7DFF]" />
      <span className="absolute left-0 top-1 h-2 w-[34px] rounded-sm bg-[#5B93FF]" />
      <span className="absolute left-4 top-0 h-[34px] w-1 bg-[#FFD36A]" />
      <span className="absolute left-0 top-0.5 h-1 w-[34px] bg-[#FFD36A]" />
    </span>
  );
}

function Bag() {
  return (
    <span className="absolute bottom-3.5 right-1.5 block h-10 w-8">
      <span className="absolute bottom-0 left-0.5 h-[30px] w-7 rounded-md bg-[#FF8A1E]" />
      <span className="absolute left-2 top-0 h-2.5 w-4 rounded-t-lg border-2 border-[#FFD7A8] border-b-0" />
    </span>
  );
}

function FilterRow({ filter, onSelect }) {
  const frame = useRef(null);
  const row = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const fit = () => {
      const available = frame.current?.clientWidth ?? 0;
      const needed = row.current?.scrollWidth ?? 0;
      setScale(available > 0 && needed > 0 ? Math.min(1, available / needed) : 1);
    };
    fit();
    const observer = new ResizeObserver(fit);
    if (frame.current) observer.observe(frame.current);
    window.addEventListener('resize', fit);
    document.fonts?.ready.then(fit);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', fit);
    };
  }, []);

  return (
    <div ref={frame} className="mt-3 h-8 overflow-hidden" role="tablist" aria-label="Voucher status">
      <div ref={row} className="flex w-max gap-1.5" style={{ transform: `scale(${scale})`, transformOrigin: 'left center' }}>
        {voucherFilters.map((item) => (
          <FilterChip
            key={item.id}
            item={item}
            count={voucherCount(item.id)}
            selected={filter === item.id}
            onSelect={() => onSelect(item.id)}
          />
        ))}
      </div>
    </div>
  );
}

function FilterChip({ item, count, selected, onSelect }) {
  const Icon = item.icon === 'ticket' ? Ticket : item.icon === 'check' ? Check : item.icon === 'clock' ? Clock3 : X;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className="flex h-8 shrink-0 items-center gap-1 rounded-full border-[1.4px] px-2 text-[11.5px] font-bold transition-colors duration-200"
      style={{
        background: selected ? item.accent : '#FFFFFF',
        borderColor: selected ? item.accent : item.border,
        color: selected ? '#FFFFFF' : item.accent,
        boxShadow: selected ? `0 3px 8px ${item.accent}38` : 'none',
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.6} aria-hidden="true" />
      {item.label}
      <span
        className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-extrabold"
        style={{ background: selected ? '#FFFFFF' : item.border, color: item.accent }}
      >
        {count}
      </span>
    </button>
  );
}

function VoucherTicket({ voucher, index, reduced, onUse, onTerms }) {
  const tone = tones[voucher.tone];
  const status = statusStyle[voucher.state];
  const enabled = voucher.state === 'available';
  const StatusIcon = status.Icon;
  return (
    <motion.article
      layout
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: 0.38, delay: reduced ? 0 : Math.min(index, 6) * 0.04, ease }}
      className="voucher-ticket grid grid-cols-[104px_1fr] overflow-hidden rounded-[14px] bg-white shadow-[0_6px_16px_rgba(20,40,154,0.07)]"
    >
      <div className="flex flex-col items-center justify-center px-1.5 py-2.5 text-center" style={{ background: tone.stub, color: tone.ink }}>
        {voucher.kind === 'shipping' ? (
          <>
            <Truck className="h-5 w-5" aria-hidden="true" />
            <p className="mt-0.5 text-[11px] font-extrabold leading-[1.05] tracking-wide">FREE<br />SHIPPING</p>
          </>
        ) : (
          <>
            <p className="text-[22px] font-extrabold leading-none tracking-[-0.03em]">{voucher.headline}</p>
            <p className="text-[11px] font-extrabold leading-none tracking-wide">{voucher.caption}</p>
          </>
        )}
        <p className="mt-1.5 text-[8.5px] font-medium leading-tight opacity-85">{voucher.minimum}</p>
      </div>
      <div className="relative flex items-center gap-2 border-l border-dashed border-[#D5DCEA] px-3 py-2.5">
        <span className="pointer-events-none absolute -bottom-1 right-2 text-[#FF7A12] opacity-10" aria-hidden="true">
          {voucher.kind === 'shipping' ? <Truck className="h-14 w-14" /> : <Percent className="h-14 w-14" style={{ color: tone.accent }} />}
        </span>
        <div className="relative min-w-0 flex-1">
          <span className="inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9px] font-bold leading-none" style={{ background: status.bg, color: status.fg }}>
            <StatusIcon className="h-2.5 w-2.5" strokeWidth={3} aria-hidden="true" />
            {status.label}
          </span>
          <h2 className="mt-1 truncate text-[13px] font-extrabold leading-tight text-[#07133A]">{voucher.title}</h2>
          <p className="mt-0.5 line-clamp-2 text-[10.5px] leading-snug text-[#6A738C]">{voucher.detail}</p>
          <p className="mt-1 flex items-center gap-1 text-[10px] text-[#8B93A7]">
            <Calendar className="h-2.5 w-2.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{voucher.when}</span>
          </p>
          <button type="button" onClick={onTerms} className="mt-0.5 text-left text-[9px] font-semibold leading-[1.05] text-[#8B93A7]">
            T&amp;C
            <br />
            Apply
          </button>
        </div>
        <button
          type="button"
          disabled={!enabled}
          onClick={onUse}
          className="relative h-[30px] shrink-0 rounded-lg px-3 text-[11.5px] font-bold text-white disabled:border disabled:border-[#E3E7EF] disabled:bg-[#F1F3F7] disabled:text-[#A0A8B8] disabled:shadow-none"
          style={enabled ? { background: tone.button, boxShadow: `0 3px 8px ${tone.button}47` } : undefined}
        >
          {actionLabel(voucher.state)}
        </button>
      </div>
    </motion.article>
  );
}

function TermsDialog({ voucher, onClose }) {
  const tone = tones[voucher.tone];
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#07133A]/40 p-3 sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="voucher-terms-title"
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 16, opacity: 0 }}
        transition={{ duration: 0.28, ease }}
        className="w-full max-w-md rounded-2xl bg-white p-5 text-left shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="voucher-terms-title" className="text-lg font-extrabold text-[#07133A]">{voucher.title}</h2>
        <p className="mt-1 text-sm font-bold" style={{ color: tone.ink }}>Code {voucher.code}</p>
        <p className="mt-3 text-sm leading-relaxed text-[#4C556E]">{voucher.terms}</p>
        <p className="mt-2 text-xs text-[#8B93A7]">{voucher.when}</p>
        <button type="button" onClick={onClose} className="mt-4 h-10 rounded-lg bg-[#07133A] px-4 text-sm font-bold text-white">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}
