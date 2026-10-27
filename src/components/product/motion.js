export const productEase = [0.16, 1, 0.3, 1];

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
