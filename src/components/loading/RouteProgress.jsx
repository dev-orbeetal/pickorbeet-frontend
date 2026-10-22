import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function RouteProgress() {
  const router = useRouter();
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer;

    const start = (_url, details) => {
      if (details?.shallow) return;
      clearTimeout(timer);
      timer = setTimeout(() => setActive(true), 160);
    };

    const stop = () => {
      clearTimeout(timer);
      setActive(false);
    };

    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', stop);
    router.events.on('routeChangeError', stop);

    return () => {
      clearTimeout(timer);
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', stop);
      router.events.off('routeChangeError', stop);
    };
  }, [router.events]);

  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-0 top-0 z-[70] h-0.5 overflow-hidden bg-navy-900/10"
      role="progressbar"
      aria-valuetext="Loading page"
    >
      <div className="brand-loader-progress h-full w-1/3 bg-gold-500" />
    </div>
  );
}
