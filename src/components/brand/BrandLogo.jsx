import Link from 'next/link';

const MARK = '/images/brand/pickorbeet-mark.png';
const MARK_RATIO = 442 / 520;

const SIZES = {
  xs: {
    mark: 22,
    markClass: 'h-[22px] w-[19px]',
    text: 'text-[15px]',
    gap: 'gap-1.5',
    tracking: 'tracking-[-0.03em]',
  },
  sm: {
    mark: 30,
    markClass: 'h-[28px] w-[24px] sm:h-[30px] sm:w-[26px]',
    text: 'text-[16px] sm:text-[17px]',
    gap: 'gap-1.5',
    tracking: 'tracking-[-0.035em]',
  },
  md: {
    mark: 36,
    markClass: 'h-[30px] w-[26px] md:h-[36px] md:w-[31px]',
    text: 'text-[16px] md:text-[20px]',
    gap: 'gap-1.5 md:gap-2',
    tracking: 'tracking-[-0.04em]',
  },
  lg: {
    mark: 46,
    markClass: 'h-[40px] w-[34px] sm:h-[46px] sm:w-[39px]',
    text: 'text-[22px] sm:text-[26px]',
    gap: 'gap-2 sm:gap-2.5',
    tracking: 'tracking-[-0.04em]',
  },
  xl: {
    mark: 58,
    markClass: 'h-[58px] w-[49px]',
    text: 'text-[28px] sm:text-[32px]',
    gap: 'gap-3',
    tracking: 'tracking-[-0.045em]',
  },
};

/**
 * Fixed PickOrbeet lockup: bag mark + Pick (blue) + Orbeet (orange).
 * tone="dark" for navy/charcoal surfaces; "light" for pale surfaces.
 */
export default function BrandLogo({
  href = '/',
  size = 'md',
  tone = 'dark',
  showWordmark = true,
  className = '',
  priority = false,
}) {
  const spec = SIZES[size] || SIZES.md;
  const markH = spec.mark;
  const markW = Math.round(markH * MARK_RATIO);
  const pickClass = tone === 'light' ? 'text-[#1E3A8A]' : 'text-[#6EA0FF]';
  const orbeetClass = 'text-[#FF861F]';

  const inner = (
    <>
      <span
        className={`inline-flex shrink-0 items-center justify-center leading-none ${spec.markClass} ${
          tone === 'light' ? 'rounded-[22%] bg-navy-800 p-[11%]' : ''
        }`}
      >
        <img
          src={MARK}
          alt=""
          width={markW}
          height={markH}
          className="block h-full w-full object-contain"
          draggable={false}
          decoding="async"
          {...(priority ? { fetchPriority: 'high' } : {})}
        />
      </span>
      {showWordmark ? (
        <span
          className={`font-extrabold leading-none ${spec.text} ${spec.tracking}`}
          aria-hidden="true"
        >
          <span className={pickClass}>Pick</span>
          <span className={orbeetClass}>Orbeet</span>
        </span>
      ) : null}
    </>
  );

  const classes = `inline-flex items-center ${spec.gap} leading-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 ${className}`;

  if (href) {
    return (
      <Link href={href} aria-label="PickOrbeet" className={classes}>
        {inner}
      </Link>
    );
  }

  return (
    <span className={classes} role="img" aria-label="PickOrbeet">
      {inner}
    </span>
  );
}
