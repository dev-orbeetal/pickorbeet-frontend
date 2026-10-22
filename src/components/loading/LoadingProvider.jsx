import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import BrandLoader from '@/components/loading/BrandLoader';
import RouteProgress from '@/components/loading/RouteProgress';

const LoadingContext = createContext({
  booted: false,
  retain() {
    return () => {};
  },
});

export function useBootGate(pending) {
  const { booted, retain } = useContext(LoadingContext);
  const releaseRef = useRef(null);

  useEffect(() => {
    if (booted) return undefined;

    if (!pending) {
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
      }
      return undefined;
    }

    if (!releaseRef.current) {
      releaseRef.current = retain();
    }

    return () => {
      if (releaseRef.current) {
        releaseRef.current();
        releaseRef.current = null;
      }
    };
  }, [pending, booted, retain]);
}

export default function LoadingProvider({ children }) {
  const [booted, setBooted] = useState(false);
  const [reveal, setReveal] = useState(false);
  const holders = useRef(0);
  const bootedRef = useRef(false);

  const finishIfIdle = useCallback(() => {
    queueMicrotask(() => {
      if (!bootedRef.current && holders.current === 0) {
        bootedRef.current = true;
        setBooted(true);
      }
    });
  }, []);

  const retain = useCallback(() => {
    if (bootedRef.current) return () => {};
    holders.current += 1;
    let released = false;
    return () => {
      if (released || bootedRef.current) return;
      released = true;
      holders.current = Math.max(0, holders.current - 1);
      finishIfIdle();
    };
  }, [finishIfIdle]);

  useEffect(() => {
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => {
        if (!bootedRef.current && holders.current === 0) {
          bootedRef.current = true;
          setBooted(true);
        }
      });
    });
    const safety = setTimeout(() => {
      if (!bootedRef.current) {
        bootedRef.current = true;
        setBooted(true);
      }
    }, 10000);
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
      clearTimeout(safety);
    };
  }, []);

  useEffect(() => {
    if (booted) {
      setReveal(false);
      return undefined;
    }
    const timer = setTimeout(() => setReveal(true), 180);
    return () => clearTimeout(timer);
  }, [booted]);

  return (
    <LoadingContext.Provider value={{ booted, retain }}>
      {children}
      {reveal && !booted ? <BrandLoader /> : null}
      <RouteProgress />
    </LoadingContext.Provider>
  );
}
