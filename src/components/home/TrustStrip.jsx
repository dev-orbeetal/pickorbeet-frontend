import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Headphones, PackageCheck, ShieldCheck, Truck } from 'lucide-react';

const WIDE_QUERY = '(min-width: 900px)';
const TRUCK_WIDTH = 228;
const TRUCK_HEIGHT = 104;
const ROW_HEIGHT = 108;
const TRAVEL_SECONDS = 11 / (1.5 * 1.5);

const ITEMS = [
  { title: '100% Authentic', description: 'Original Products', Icon: ShieldCheck },
  { title: 'Fast Delivery', description: 'All Over Bangladesh', Icon: Truck },
  { title: 'Cash on Delivery', description: 'No Pre Payment', Icon: PackageCheck },
  { title: '24/7 Support', description: 'Always Here', Icon: Headphones },
];

const hidden = [false, false, false, false];

function wheelSpinSeconds(distance) {
  const speed = (distance + TRUCK_WIDTH) / TRAVEL_SECONDS;
  const circumference = 2 * Math.PI * 5.2 * (TRUCK_WIDTH / 88);
  if (speed <= 0) return 0.85;
  return Math.max(0.35, circumference / speed);
}

function revealTransition(active, mode, index, part) {
  if (!active || mode === 'off') return { duration: 0, delay: 0 };
  const partDelay = part === 'title' ? 0.06 : part === 'copy' ? 0.12 : 0;
  const itemDelay = mode === 'stagger' ? index * 0.1 : 0;
  return { duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: itemDelay + partDelay };
}

function Wheel({ cx, cy }) {
  return (
    <g className="trust-wheel">
      <circle cx={cx} cy={cy} r="5.2" fill="#141824" />
      <circle cx={cx} cy={cy} r="2" fill="#FF861F" />
      <rect x={cx - 0.45} y={cy - 4.5} width="0.9" height="2.1" rx="0.4" fill="#FFF6ED" />
    </g>
  );
}

function DeliveryTruck({ spinSeconds }) {
  return (
    <svg
      viewBox="0 0 88 40"
      className="trust-truck is-moving h-[104px] w-[228px]"
      style={{ '--wheel-spin': `${spinSeconds}s` }}
      aria-hidden="true"
    >
      <g className="trust-bob">
        <rect x="3" y="8" width="48" height="20" rx="2.5" fill="#202D70" />
        <rect x="3" y="8" width="48" height="5" rx="2" fill="#2864E8" />
        <rect x="16" y="16" width="16" height="9" rx="1.2" fill="#FF861F" />
        <path d="M16 20.5h16M24 16v9" stroke="#FFF6ED" strokeWidth="1" />
        <path d="M51 13h14.5L75 21.2V28H51V13z" fill="#34338A" />
        <path d="M58 15.2h7.2l6.2 6H58v-6z" fill="#E8F0FF" />
        <rect x="73.5" y="23.2" width="5.2" height="2.4" rx="0.6" fill="#FF861F" />
        <Wheel cx="20" cy="30.5" />
        <Wheel cx="64" cy="30.5" />
      </g>
    </svg>
  );
}

function WaveDecor({ side }) {
  const isLeft = side === 'left';
  return (
    <svg
      className={`pointer-events-none absolute top-0 h-full w-24 opacity-70 sm:w-32 ${isLeft ? 'left-0' : 'right-0 -scale-x-100'}`}
      viewBox="0 0 120 120"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d="M0 0c18 18 28 38 28 60S18 102 0 120V0z" fill="#D7E6FF" />
      <path d="M0 10c22 16 34 34 34 50S22 94 0 110V10z" fill="#C9DCFF" opacity="0.55" />
      <path d="M0 28c16 12 24 24 24 32S16 80 0 92V28z" fill="#BFD6FF" opacity="0.45" />
    </svg>
  );
}

function BenefitItem({ item, index, active, mode }) {
  return (
    <li
      data-benefit
      className={[
        'flex min-w-0 items-center gap-3 px-3 py-3 sm:gap-3.5 sm:px-4 sm:py-4',
        index > 0 ? 'border-t border-[#D5E3F8]' : '',
        index % 2 === 1 ? 'min-[480px]:border-l min-[480px]:border-[#D5E3F8]' : '',
        index >= 2 ? 'min-[480px]:border-t min-[480px]:border-[#D5E3F8]' : 'min-[480px]:border-t-0',
        index > 0 ? 'lg:border-l lg:border-t-0 lg:border-[#D5E3F8]' : '',
        mode === 'truck' ? 'border-0 min-[480px]:border-0 lg:border-0' : '',
      ].filter(Boolean).join(' ')}
    >
      <motion.span
        initial={false}
        animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
        transition={revealTransition(active, mode, index, 'icon')}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-900 text-white shadow-[0_6px_14px_rgba(32,45,112,0.28)] sm:h-12 sm:w-12"
      >
        <item.Icon className="h-5 w-5 sm:h-[22px] sm:w-[22px]" strokeWidth={2.25} aria-hidden="true" />
      </motion.span>
      <div className="min-w-0">
        <motion.p
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
          transition={revealTransition(active, mode, index, 'title')}
          className="text-sm font-bold leading-tight text-navy-900 sm:text-[15px]"
        >
          {item.title}
        </motion.p>
        <motion.p
          initial={false}
          animate={{ opacity: active ? 1 : 0, y: active ? 0 : 6 }}
          transition={revealTransition(active, mode, index, 'copy')}
          className="mt-0.5 text-xs leading-snug text-charcoal-500 sm:text-[13px]"
        >
          {item.description}
        </motion.p>
      </div>
    </li>
  );
}

export default function TrustStrip() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const statusRef = useRef('idle');
  const shownRef = useRef(hidden);
  const driveRef = useRef(null);
  const [mode, setMode] = useState('off');
  const [status, setStatus] = useState('idle');
  const [shown, setShown] = useState(hidden);
  const [travel, setTravel] = useState(0);
  const [run, setRun] = useState(0);

  useLayoutEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia(WIDE_QUERY);
    const apply = () => {
      const next = reduce.matches ? 'off' : wide.matches ? 'truck' : 'stagger';
      statusRef.current = 'idle';
      shownRef.current = hidden;
      setMode(next);
      setStatus('idle');
      setShown(hidden);
    };
    apply();
    reduce.addEventListener('change', apply);
    wide.addEventListener('change', apply);
    return () => {
      reduce.removeEventListener('change', apply);
      wide.removeEventListener('change', apply);
    };
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node || mode === 'off') return undefined;

    const reset = () => {
      statusRef.current = 'idle';
      shownRef.current = hidden.slice();
      setStatus('idle');
      setShown(hidden.slice());
      setTravel(0);
    };

    const begin = () => {
      if (statusRef.current !== 'idle') return;
      if (mode === 'stagger') {
        const next = ITEMS.map(() => true);
        shownRef.current = next;
        statusRef.current = 'playing';
        setShown(next);
        setStatus('playing');
        return;
      }
      const distance = trackRef.current?.clientWidth || 0;
      if (!distance) return;
      shownRef.current = hidden.slice();
      statusRef.current = 'playing';
      setShown(hidden.slice());
      setTravel(distance);
      setRun((value) => value + 1);
      setStatus('playing');
    };

    const assess = () => {
      const rect = node.getBoundingClientRect();
      if (rect.height <= 0) return;
      const visible = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
      const ratio = Math.max(0, visible) / rect.height;
      const offscreen = rect.bottom <= 0 || rect.top >= window.innerHeight;
      if (ratio >= 0.4) begin();
      else if (offscreen) reset();
    };

    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        assess();
      });
    };

    const observer = new IntersectionObserver(() => assess(), { threshold: [0, 0.4, 1] });
    const resizeObserver = new ResizeObserver(() => assess());

    observer.observe(node);
    if (trackRef.current) resizeObserver.observe(trackRef.current);
    assess();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const onPageShow = (event) => {
      if (event.persisted) reset();
      requestAnimationFrame(assess);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pageshow', onPageShow);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [mode]);

  const finish = () => {
    if (statusRef.current !== 'playing') return;
    const next = ITEMS.map(() => true);
    shownRef.current = next;
    statusRef.current = 'done';
    setShown(next);
    setStatus('done');
  };

  useEffect(() => {
    if (mode !== 'truck' || status !== 'playing' || travel <= 0) return undefined;
    const el = driveRef.current;
    if (!el) return undefined;
    let cancelled = false;
    const animation = el.animate(
      [
        { transform: `translateX(-${TRUCK_WIDTH}px)` },
        { transform: `translateX(${travel}px)` },
      ],
      { duration: TRAVEL_SECONDS * 1000, easing: 'linear', fill: 'both' },
    );
    animation.onfinish = () => {
      if (!cancelled) finish();
    };
    return () => {
      cancelled = true;
      animation.cancel();
    };
  }, [mode, status, travel, run]);

  useEffect(() => {
    if (mode !== 'truck' || status !== 'playing') return undefined;
    let frame = 0;
    const tick = () => {
      const track = trackRef.current;
      const truck = track?.querySelector('.trust-truck');
      if (track && truck && statusRef.current === 'playing') {
        const trackRect = track.getBoundingClientRect();
        const rear = truck.getBoundingClientRect().left - trackRect.left;
        const nodes = track.querySelectorAll('[data-benefit]');
        const next = shownRef.current.slice();
        let changed = false;
        nodes.forEach((item, index) => {
          if (next[index]) return;
          const itemRect = item.getBoundingClientRect();
          const trigger = itemRect.right - trackRect.left;
          if (rear >= trigger) {
            next[index] = true;
            changed = true;
          }
        });
        if (changed) {
          shownRef.current = next;
          setShown(next);
        }
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [mode, status]);

  const driving = mode === 'truck' && status === 'playing' && travel > 0;

  return (
    <section ref={sectionRef} className="bg-ice" aria-label="Service benefits">
      <div className="container-custom pb-2 pt-0 sm:py-3">
        <div
          ref={trackRef}
          className="relative overflow-hidden rounded-2xl border border-[#B7CFF5] bg-gradient-to-b from-[#F4F8FF] via-[#EEF4FF] to-[#E8F0FF] shadow-[0_1px_2px_rgba(32,45,112,0.06)]"
          style={mode === 'truck' ? { height: ROW_HEIGHT } : undefined}
        >
          <WaveDecor side="left" />
          <WaveDecor side="right" />

          <ul
            className={`relative z-[1] grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-4 ${
              mode === 'truck' ? 'h-full items-center' : ''
            }`}
          >
            {ITEMS.map((item, index) => {
              const active = mode === 'off' || shown[index];
              return (
                <BenefitItem
                  key={item.title}
                  item={item}
                  index={index}
                  active={active}
                  mode={mode}
                />
              );
            })}
          </ul>

          {driving && (
            <div
              key={run}
              ref={driveRef}
              className="pointer-events-none absolute left-0 top-1/2 z-10"
              style={{ marginTop: -(TRUCK_HEIGHT / 2) }}
            >
              <DeliveryTruck spinSeconds={wheelSpinSeconds(travel)} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
