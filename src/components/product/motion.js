export const productEase = [0.16, 1, 0.3, 1];

export const productShort = 0.2;
export const productMedium = 0.32;
export const productChip = 0.22;

export function riseProps(reduce, delay = 0) {
  if (reduce) {
    return {
      initial: false,
      animate: { opacity: 1 },
      transition: { duration: 0 },
    };
  }
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.42, ease: productEase, delay },
  };
}

export function pressScale(reduce, scale = 0.98) {
  if (reduce) return undefined;
  return { scale };
}
