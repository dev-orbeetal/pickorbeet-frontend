import { useOfficialBadgeStyle } from '@/components/product/OfficialBadgeProvider';

const HEIGHT = {
  compact: { small: 18, medium: 22, large: 26 },
  regular: { small: 24, medium: 30, large: 36 },
};

export default function OfficialBadge({ compact = false }) {
  const { size } = useOfficialBadgeStyle();
  const height = (compact ? HEIGHT.compact : HEIGHT.regular)[size]
    || (compact ? HEIGHT.compact.medium : HEIGHT.regular.medium);

  return (
    <img
      src="/images/badges/official.png"
      alt="Official"
      width={Math.round(height * (452 / 146))}
      height={height}
      className="block max-w-none select-none"
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  );
}
