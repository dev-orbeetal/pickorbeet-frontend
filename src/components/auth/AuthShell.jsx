import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, BadgePercent } from 'lucide-react';

const perks = [
  { icon: Truck, title: 'Fast delivery', text: 'Across Bangladesh, cash on delivery.' },
  { icon: ShieldCheck, title: 'Secure account', text: 'Your orders and addresses stay private.' },
  { icon: BadgePercent, title: 'Member offers', text: 'Vouchers and early access when you sign in.' },
];

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F3F6FC] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#04124A] via-[#0A2A86] to-[#163A9A] text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FE7818]/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-10 h-64 w-64 rounded-full bg-[#4C7DFF]/30 blur-3xl" />
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-3">
            <img src="/images/logo.png" alt="" className="h-12 w-12 rounded-2xl bg-white/10 p-1" />
            <span className="text-2xl font-bold tracking-tight">Pick<span className="text-[#FF8A3D]">Orbeet</span></span>
          </Link>
          <h2 className="mt-12 max-w-md text-4xl font-bold leading-tight">Shop faster with an account that remembers you.</h2>
          <p className="mt-4 max-w-sm text-base text-white/75">Track orders, save addresses, and check out in one step.</p>
        </div>
        <ul className="relative space-y-4">
          {perks.map(({ icon: Icon, title: perkTitle, text }) => (
            <li key={perkTitle} className="flex items-start gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold">{perkTitle}</span>
                <span className="text-sm text-white/70">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[440px]"
        >
          <Link href="/" className="mb-6 flex items-center justify-center lg:hidden">
            <img src="/images/logo.png" alt="PickOrbeet" className="h-14" />
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-[#051340]">{title}</h1>
          {subtitle && <p className="mt-2 text-sm leading-6 text-[#5C6984]">{subtitle}</p>}
          <div className="mt-6 rounded-3xl border border-[#E6ECF8] bg-white p-6 shadow-[0_18px_50px_rgba(10,30,90,0.08)] sm:p-8">
            {children}
          </div>
          {footer && <div className="mt-5 text-center text-sm text-[#5C6984]">{footer}</div>}
        </motion.div>
      </main>
    </div>
  );
}

export const authInputClass =
  'w-full rounded-xl border border-[#E3E8F4] bg-[#F7F9FD] py-3 pl-11 pr-4 text-[15px] text-[#051340] outline-none transition placeholder:text-[#98A2BE] focus:border-[#0040EE] focus:bg-white focus:ring-4 focus:ring-[#0040EE]/10';

export const authButtonClass =
  'flex w-full items-center justify-center rounded-xl bg-[#FE7818] py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_rgba(254,120,24,0.35)] transition hover:bg-[#F06A0C] disabled:cursor-not-allowed disabled:opacity-60';
