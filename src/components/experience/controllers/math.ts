export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export const range = (value: number, start: number, end: number) =>
  clamp01((value - start) / (end - start));

export const smooth = (value: number) => {
  const p = clamp01(value);
  return p * p * (3 - 2 * p);
};

export const bell = (value: number, start: number, middle: number, end: number) =>
  Math.min(smooth(range(value, start, middle)), 1 - smooth(range(value, middle, end)));

export const mix = (a: number, b: number, t: number) => a + (b - a) * t;
