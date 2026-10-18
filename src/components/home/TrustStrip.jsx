import { CreditCard, RotateCcw, ShieldCheck, Truck } from 'lucide-react';

const items = [
  {
    icon: ShieldCheck,
    title: '100% Original Products',
    description: 'Trusted Quality',
  },
  {
    icon: Truck,
    title: 'Fast & Reliable Delivery',
    description: 'All over Bangladesh',
  },
  {
    icon: CreditCard,
    title: 'Secure Payment',
    description: 'Multiple Payment Options',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    description: 'Hassle Free',
  },
];

export default function TrustStrip() {
  return (
    <section className="bg-cream-200">
      <div className="container-custom py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.title} className="flex items-center gap-3 bg-white rounded-xl border border-cream-400 px-4 py-3">
              <span className="w-11 h-11 shrink-0 rounded-lg bg-navy-50 text-navy-800 flex items-center justify-center">
                <item.icon className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-charcoal-900 leading-tight">{item.title}</p>
                <p className="text-xs text-charcoal-500 mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
