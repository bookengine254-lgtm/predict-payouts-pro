import { toneStroke } from "./tone";
import type { Tone } from "@/lib/mock-data";

export function Sparkline({
  values,
  tone = "primary",
  width = 56,
  height = 22,
  strokeWidth = 1.6,
  fill = true,
}: {
  values: number[];
  tone?: Tone;
  width?: number;
  height?: number;
  strokeWidth?: number;
  fill?: boolean;
}) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const pts = values.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / span) * (height - strokeWidth) - strokeWidth / 2;
    return [x, y] as const;
  });
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const stroke = toneStroke[tone];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className="overflow-visible"
      aria-hidden="true"
    >
      {fill && <path d={area} fill={stroke} opacity={0.1} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}
