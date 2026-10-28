import { BadgeCheck } from 'lucide-react';
import { useOfficialBadgeStyle } from '@/components/product/OfficialBadgeProvider';
import { checkInk } from '@/lib/officialBadge';

const COMPACT = {
  small: {
    row: 'gap-0.5 py-0.5 pl-0.5 pr-1.5 text-[9px]',
    mark: 'h-3 w-3',
    icon: 'h-2 w-2',
  },
  medium: {
    row: 'gap-1 py-0.5 pl-0.5 pr-1.5 text-[10px]',
    mark: 'h-3.5 w-3.5',
    icon: 'h-2.5 w-2.5',
  },
  large: {
    row: 'gap-1 py-1 pl-1 pr-2 text-xs',
    mark: 'h-4 w-4',
    icon: 'h-3 w-3',
  },
};

const REGULAR = {
  small: {
    row: 'gap-1 py-0.5 pl-0.5 pr-2 text-[10px]',
    mark: 'h-3.5 w-3.5',
    icon: 'h-2.5 w-2.5',
  },
  medium: {
    row: 'gap-1.5 py-1 pl-1 pr-2.5 text-[11px]',
    mark: 'h-4 w-4',
    icon: 'h-3 w-3',
  },
  large: {
    row: 'gap-1.5 py-1.5 pl-1.5 pr-3 text-[13px]',
    mark: 'h-5 w-5',
    icon: 'h-3.5 w-3.5',
  },
};

export default function OfficialBadge({ compact = false }) {
  const { size, color } = useOfficialBadgeStyle();
  const metrics = (compact ? COMPACT : REGULAR)[size] || (compact ? COMPACT.medium : REGULAR.medium);
  return (
    <span
      className={`inline-flex items-center rounded-full bg-white/95 font-bold leading-none tracking-wide shadow-[0_6px_16px_rgba(23,32,51,0.16)] ${metrics.row}`}
      style={{ color, boxShadow: `0 6px 16px rgba(23,32,51,0.16), 0 0 0 1px ${color}33` }}
    >
      <span
        className={`flex items-center justify-center rounded-full text-white ${metrics.mark}`}
        style={{ backgroundColor: color, color: checkInk(color) }}
      >
        <BadgeCheck className={metrics.icon} aria-hidden="true" />
      </span>
      Official
    </span>
  );
}
