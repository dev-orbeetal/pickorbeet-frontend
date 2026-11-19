import { motion } from 'framer-motion';
import BrandLogo from '@/components/brand/BrandLogo';

export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-72px)] bg-[#F3F6FC] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
      <aside className="relative flex min-h-[300px] items-center justify-center overflow-hidden bg-gradient-to-br from-[#04124A] via-[#0A2A86] to-[#163A9A] px-6 py-12 text-white sm:min-h-[340px] sm:px-10 lg:min-h-[calc(100vh-72px)] lg:px-14 xl:px-16">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <svg className="absolute inset-x-0 top-0 h-36 w-full sm:h-44" viewBox="0 0 800 200" preserveAspectRatio="none">
            <path d="M0 0h800v70C620 150 360 20 0 110V0Z" fill="white" fillOpacity="0.05" />
            <path d="M520-20c90 50 170 30 300 90V-20H520Z" fill="#FF861F" fillOpacity="0.55" />
          </svg>
          <svg className="absolute inset-x-0 bottom-0 h-28 w-full sm:h-36" viewBox="0 0 800 160" preserveAspectRatio="none">
            <path d="M0 70c150 70 300-50 470 8 110 36 210 24 330-36v118H0V70Z" fill="#04124A" fillOpacity="0.45" />
          </svg>
          <svg className="absolute bottom-6 left-1/2 h-40 w-40 -translate-x-1/2 text-white/15 sm:h-48 sm:w-48 lg:bottom-10 lg:h-56 lg:w-56" viewBox="0 0 120 140" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M28 50h64l-7 74H35L28 50Z" strokeLinejoin="round" />
            <path d="M44 50c0-14 7-26 16-26s16 12 16 26" strokeLinecap="round" />
            <path d="M58 78h4M46 50h28" strokeLinecap="round" />
          </svg>
        </div>
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center gap-8 text-center">
          <BrandLogo size="lg" tone="dark" />
          <h2 className="text-3xl font-bold leading-tight sm:text-4xl">
            Shop faster with an account that remembers{' '}
            <span className="relative inline-block">
              you.
              <svg aria-hidden="true" viewBox="0 0 88 14" className="absolute -bottom-2 left-0 h-3 w-full" fill="none">
                <path d="M2 9c14-7 28-7 42-2 12 4 26 3 42-5" stroke="#FF861F" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
          </h2>
          <p className="max-w-sm text-base leading-7 text-white/75">
            Track orders, save addresses, and check out in one step.
          </p>
        </div>
      </aside>

      <main className="flex items-center justify-center px-4 py-10 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[440px]"
        >
          <div className="mb-6 flex justify-center lg:hidden">
            <BrandLogo size="lg" tone="light" />
          </div>
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
