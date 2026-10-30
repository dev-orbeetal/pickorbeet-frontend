import { Star } from 'lucide-react';

export default function Stars({ value = 0, size = 14, empty = '#E4E8F0' }) {
  const rating = Number(value);
  const score = Number.isFinite(rating) ? Math.max(0, Math.min(5, rating)) : 0;

  return (
    <span className="inline-flex items-center" aria-hidden="true">
      {Array.from({ length: 5 }, (_, index) => {
        const fill = Math.max(0, Math.min(1, score - index));
        return (
          <span key={index} className="relative inline-block shrink-0" style={{ width: size, height: size }}>
            <Star size={size} style={{ color: empty }} fill={empty} strokeWidth={0} />
            {fill > 0 && (
              <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <Star size={size} className="text-[#F5B400]" fill="#F5B400" strokeWidth={0} />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}
