import Link from 'next/link';
import { Gem, Headphones, ShoppingBag, Tag } from 'lucide-react';

const items = [
  { icon: Tag, title: 'Best Prices', description: 'Everyday' },
  { icon: Gem, title: 'Wide Range', description: 'Tech to Lifestyle' },
  { icon: Headphones, title: 'Dedicated Support', description: "We're Here to Help" },
];

export default function ValueBand() {
  return (
    <section className="bg-cream-200 pt-4 pb-8">
      <div className="container-custom">
        <div className="bg-navy-900 rounded-2xl overflow-hidden flex flex-col lg:flex-row">
          <div className="flex-1 grid sm:grid-cols-3 gap-4 px-6 py-6">
            {items.map((item) => (
              <div key={item.title} className="flex items-center gap-3 text-white">
                <span className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <item.icon className="w-5 h-5 text-gold-400" />
                </span>
                <div>
                  <p className="font-semibold leading-tight">{item.title}</p>
                  <p className="text-sm text-white/70">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/products"
            className="lg:w-72 bg-gold-500 text-white px-6 py-6 flex items-center justify-center gap-3 hover:bg-gold-400 transition-colors lg:[clip-path:polygon(8%_0,100%_0,100%_100%,0_100%)]"
          >
            <ShoppingBag className="w-8 h-8 shrink-0" />
            <span className="leading-tight">
              <span className="block text-lg font-bold">Shop Smarter</span>
              <span className="block text-sm font-medium text-white/90">Live Better</span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
