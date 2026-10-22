import { CreditCard, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const fallback = [
  {
    icon: 'shield',
    title: '100% Original Products',
    description: 'Trusted Quality',
  },
  {
    icon: 'truck',
    title: 'Fast & Reliable Delivery',
    description: 'All over Bangladesh',
  },
  {
    icon: 'card',
    title: 'Secure Payment',
    description: 'Multiple Payment Options',
  },
  {
    icon: 'returns',
    title: 'Easy Returns',
    description: 'Hassle Free',
  },
];

const ICONS = {
  shield: { icon: ShieldCheck, className: 'bg-[#EEF1FA] text-navy-900' },
  truck: { icon: Truck, className: 'bg-[#E8F0FF] text-action' },
  card: { icon: CreditCard, className: 'bg-[#FFF3E8] text-gold-600' },
  returns: { icon: RotateCcw, className: 'bg-[#E7F6EF] text-savings' },
};

export default function TrustStrip({ items }) {
  const rows = (items && items.length ? items : fallback).slice(0, 4).map((item) => {
    const key = typeof item.icon === 'string' ? item.icon : 'shield';
    const visual = ICONS[key] || ICONS.shield;
    return { ...item, Icon: visual.icon, iconClass: visual.className };
  });

  return (
    <section className="bg-cream-200" aria-label="Service benefits">
      <div className="container-custom py-2 sm:py-3">
        <div className="rounded-xl border border-[#E4E9F2] bg-white px-2 py-3 shadow-[0_1px_2px_rgba(23,32,51,0.04)] sm:px-4">
          <ul className="grid grid-cols-2 gap-x-2 gap-y-3 min-[420px]:grid-cols-4">
            {rows.map((item) => (
              <li key={item.title} className="flex min-w-0 flex-col items-center px-1 text-center">
                <span className={`mb-1.5 flex h-9 w-9 items-center justify-center rounded-full ${item.iconClass}`}>
                  <item.Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                </span>
                <p className="text-[11px] font-semibold leading-tight text-charcoal-900 sm:text-sm">{item.title}</p>
                {item.description ? (
                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-charcoal-500 sm:text-xs">{item.description}</p>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
