import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toneStroke } from "./tone";
import { cn } from "@/lib/utils";
import type { Market } from "@/lib/mock-data";

const RANGES = [
  ["1D", 4],
  ["1W", 28],
  ["1M", 40],
  ["All", 40],
] as const;

type RangeKey = (typeof RANGES)[number][0];

/** A single pulsing marker parked at the end of the line — the live price. */
function endDot(color: string, lastIndex: number) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (props: any) => {
    const { cx, cy, index } = props as { cx?: number; cy?: number; index: number };
    if (index !== lastIndex || cx == null || cy == null) return <g key={`empty-${index}`} />;
    return (
      <g key={`end-${index}`}>
        <circle cx={cx} cy={cy} r={7} fill={color} opacity={0.22} />
        <circle cx={cx} cy={cy} r={4} fill={color} stroke="var(--card)" strokeWidth={2} />
      </g>
    );
  };
}

/**
 * Odds trend. Every outcome is a real series derived from the market history,
 * plotted as a percentage. Toggle a single outcome to isolate its curve.
 */
export function OddsChart({ market }: { market: Market }) {
  const [range, setRange] = useState<RangeKey>("1W");
  /* Default view is the single leading outcome — one clean line, not a thicket. */
  const leadingId = useMemo(() => {
    const last = market.history.at(-1)?.values ?? [];
    let best = 0;
    last.forEach((v, i) => {
      if (v > (last[best] ?? 0)) best = i;
    });
    return market.outcomes[best]?.id ?? market.outcomes[0]!.id;
  }, [market]);
  const [focus, setFocus] = useState<string | "all">(leadingId);

  const points = RANGES.find(([r]) => r === range)?.[1] ?? 40;

  const data = useMemo(() => {
    const slice = market.history.slice(-points);
    return slice.map((h) => {
      const row: Record<string, string | number> = {
        t: new Date(h.t).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
      };
      market.outcomes.forEach((o, i) => {
        row[o.id] = Number(((h.values[i] ?? 0) * 100).toFixed(1));
      });
      return row;
    });
  }, [market, points]);

  const visible = market.outcomes.filter((o) => focus === "all" || o.id === focus);

  // Scale the axis to the band the data actually occupies, with a little air.
  const [lo, hi] = useMemo(() => {
    const all = data.flatMap((row) => visible.map((o) => Number(row[o.id] ?? 0)));
    if (all.length === 0) return [0, 100];
    const min = Math.max(0, Math.floor((Math.min(...all) - 6) / 5) * 5);
    const max = Math.min(100, Math.ceil((Math.max(...all) + 6) / 5) * 5);
    return [min, Math.max(max, min + 20)];
  }, [data, visible]);

  return (
    <section className="-mx-4 border-y border-border bg-card py-4 sm:mx-0 sm:rounded-2xl sm:border sm:bevel">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4">
        <h2 className="text-base font-semibold">Odds trend</h2>
        <div className="flex gap-1 rounded-xl bg-secondary p-0.5">
          {RANGES.map(([r]) => (
            <button
              key={r}
              type="button"
              onClick={() => setRange(r)}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold press",
                range === r ? "bg-card text-foreground bevel" : "text-muted-foreground",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex gap-1.5 overflow-x-auto px-4 pb-1 hide-scrollbar">
        <button
          type="button"
          onClick={() => setFocus("all")}
          className={cn(
            "shrink-0 rounded-full border px-3 py-1 text-xs font-semibold press",
            focus === "all" ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
          )}
        >
          All outcomes
        </button>
        {market.outcomes.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setFocus(o.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold press",
              focus === o.id ? "border-current" : "border-border text-muted-foreground",
            )}
            style={focus === o.id ? { color: toneStroke[o.tone] } : undefined}
          >
            <span className="size-2 rounded-full" style={{ background: toneStroke[o.tone] }} />
            {o.label}
          </button>
        ))}
      </div>

      <div className="mt-3 h-72 pr-1 sm:pr-3">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              {visible.map((o) => (
                <linearGradient key={o.id} id={`fill-${o.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={toneStroke[o.tone]} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={toneStroke[o.tone]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 5" vertical={false} />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />
            <YAxis
              domain={[lo, hi]}
              tickCount={6}
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickFormatter={(v: number) => `${v}%`}
              tickLine={false}
              axisLine={false}
              orientation="right"
              width={42}
            />
            <ReTooltip
              cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "4 4" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                fontSize: 12,
              }}
              formatter={(v, name) => [
                `${v}%`,
                market.outcomes.find((o) => o.id === name)?.label ?? String(name),
              ]}
            />
            {visible.map((o) => (
              <Area
                key={o.id}
                type="monotone"
                dataKey={o.id}
                stroke={toneStroke[o.tone]}
                strokeWidth={2.4}
                fill={`url(#fill-${o.id})`}
                fillOpacity={visible.length > 2 ? 0.35 : 1}
                dot={endDot(toneStroke[o.tone], data.length - 1)}
                activeDot={{ r: 4, strokeWidth: 0 }}
                animationDuration={650}
                animationEasing="ease-out"
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/** Poll-style split: one labelled bar per outcome with its live percentage. */
export function OutcomePoll({ market, probs }: { market: Market; probs: number[] }) {
  return (
    <ul className="space-y-2">
      {market.outcomes.map((o, i) => {
        const pct = (probs[i] ?? 0) * 100;
        return (
          <li key={o.id}>
            <div className="flex items-baseline justify-between gap-2 text-sm">
              <span className="min-w-0 truncate font-medium">{o.label}</span>
              <span className="shrink-0 font-display tabular" style={{ color: toneStroke[o.tone] }}>
                {pct.toFixed(1)}%
              </span>
            </div>
            <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-secondary">
              <span
                className="block h-full rounded-full transition-[width] duration-700"
                style={{ width: `${pct}%`, background: toneStroke[o.tone] }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
