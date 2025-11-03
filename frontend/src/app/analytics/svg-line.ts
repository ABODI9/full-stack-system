// Tiny helper to build an SVG path from a number series (sparkline-like).
export function buildSparkPath(values: number[], w = 680, h = 160, pad = 10) {
  if (!values?.length) return '';
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = Math.max(1, max - min);
  const n = values.length;
  const ix = (i: number) => pad + (i * (w - pad * 2)) / Math.max(1, n - 1);
  const iy = (v: number) => pad + (h - pad * 2) * (1 - (v - min) / span);
  let d = `M ${ix(0)} ${iy(values[0])}`;
  for (let i = 1; i < n; i++) d += ` L ${ix(i)} ${iy(values[i])}`;
  return d;
}
