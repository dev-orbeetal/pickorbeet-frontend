import { useEffect } from 'react';
import LogoMark from '@/components/brand/LogoMark';

export default function BrandLoader() {
  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="brand-loader fixed inset-0 z-[80] flex items-center justify-center"
      role="status"
      aria-live="polite"
      aria-label="Loading PickOrbeet"
    >
      <div className="flex flex-col items-center px-6">
        <div className="brand-loader-bag">
          <LogoMark
            src="/images/logo.png"
            alt=""
            width={96}
            height={113}
            className="h-24 w-auto sm:h-28"
            imgClassName="block h-full w-auto"
          />
        </div>
        <p className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl" aria-hidden="true">
          <span className="text-navy-900">Pick</span>
          <span className="text-gold-500">Orbeet</span>
        </p>
        <div className="mt-5 h-0.5 w-32 overflow-hidden rounded-full bg-navy-900/10" aria-hidden="true">
          <div className="brand-loader-progress h-full w-2/5 rounded-full bg-gold-500" />
        </div>
      </div>
    </div>
  );
}
