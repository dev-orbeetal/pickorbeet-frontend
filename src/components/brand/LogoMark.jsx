import { useId } from 'react';
import { BAG_PATH_LENGTH, BAG_SILHOUETTE, LOGO_VIEWBOX } from './bagOutline';

function isDefaultBag(src) {
  if (!src || src === '/images/logo.png') return true;
  try {
    const pathname = src.startsWith('http') ? new URL(src).pathname : src.split('?')[0];
    return pathname === '/images/logo.png';
  } catch {
    return false;
  }
}

export default function LogoMark({
  src = '/images/logo.png',
  alt = '',
  width,
  height,
  className = '',
  imgClassName = '',
}) {
  const filterId = `logo-dot-${useId().replace(/:/g, '')}`;
  const trace = isDefaultBag(src);

  return (
    <span className={`relative inline-block leading-none ${className}`}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={imgClassName}
      />
      {trace ? (
        <svg
          viewBox={LOGO_VIEWBOX}
          preserveAspectRatio="xMidYMid meet"
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <filter
              id={filterId}
              filterUnits="userSpaceOnUse"
              primitiveUnits="userSpaceOnUse"
              x="-60"
              y="-60"
              width="808"
              height="929"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="glow" />
              <feColorMatrix
                in="glow"
                type="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.4 0"
                result="soft"
              />
              <feMerge>
                <feMergeNode in="soft" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            className="logo-silhouette-dot"
            d={BAG_SILHOUETTE}
            fill="none"
            stroke="#FF791F"
            strokeWidth="96"
            strokeLinecap="round"
            strokeDasharray={`0.8 ${BAG_PATH_LENGTH - 0.8}`}
            style={{ '--logo-path-length': BAG_PATH_LENGTH }}
            filter={`url(#${filterId})`}
          />
        </svg>
      ) : null}
    </span>
  );
}
