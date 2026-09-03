import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, timeLeft } from "@/lib/parimutuel";
import { categoryOf, probabilities, totalPool, trendDelta, type Market } from "@/lib/mock-data";
import { MarketThumb, VersusThumb } from "./market-thumb";
import { Sparkline } from "./sparkline";
import { toneSoft } from "./tone";
import { BadgeCheck, TrendingDown, TrendingUp, Users } from "lucide-react";

/**
 * Compact market card. Binary, multi-outcome and sports markets all render in the
 * same fixed vertical rhythm: header row, one outcome row, one stats row.
 * Multi-outcome markets collapse to the top two runners plus a "+N" pill so a
 * five-way market never grows taller than a Yes/No card beside it.
 */
export function MarketCard({ market }: { market: Market }) {
  const probs = probabilities(market);
  const pool = totalPool(market);
  const delta = trendDelta(market);
  const cat = categoryOf(market.category);
  const series = market.history.map((h) => h.values[0] ?? 0);
  const resolvedOutcome = market.resolved
    ? market.outcomes.find((o) => o.id === market.resolved!.outcomeId)
    : undefined;

  const ranked = market.outcomes
    .map((o, i) => ({ ...o, prob: probs[i] ?? 0 }))
    .sort((a, b) => b.prob - a.prob);
  const isBinary = market.outcomes.length === 2;
  const shown = isBinary ? market.outcomes.map((o, i) => ({ ...o, prob: probs[i] ?? 0 })) : ranked.slice(0, 2);
  const hidden = market.outcomes.length - shown.length;
  const lead = ranked[0]!;
  /* Binary markets headline the Yes side as "chance"; multi/sports headline the leader. */
  const headline = isBinary ? { label: "chance", prob: probs[0] ?? 0 } : { label: lead.label, prob: lead.prob };
  const isVersus = market.kind === "sports" && Boolean(market.sports);

  return (
    <Link
      to="/market/$marketId"
      params={{ marketId: market.id }}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        {isVersus ? <VersusThumb market={market} /> : <MarketThumb market={market} />}
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-medium tracking-normal text-card-foreground">
            {market.question}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 overflow-hidden text-[0.7rem] text-muted-foreground">
            <span className={cn("shrink-0 rounded-full px-1.5 py-0.5 font-medium", toneSoft[cat.tone])}>
              {cat.label}
            </span>
            {market.kind === "sports" && market.sports && (
              <span className="truncate">{market.sports.league}</span>
            )}
            {market.kind === "multi" && <span className="shrink-0">{market.outcomes.length}-way</span>}
            <span className="shrink-0 tabular">{market.resolved ? "Resolved" : timeLeft(market.closesAt)}</span>
          </div>
        </div>
        <div className="flex max-w-[5.5rem] flex-col items-end gap-0.5">
          <span className="font-display text-2xl leading-none tabular text-card-foreground">
            {formatPct(headline.prob)}
          </span>
          {/* Yes/No markets read as "chance"; everything else labels the leader. */}
          <span className="w-full truncate text-right text-[0.65rem] leading-none tracking-wide text-muted-foreground uppercase">
            {isBinary ? "chance" : headline.label}
          </span>
          <Sparkline values={series} tone={delta >= 0 ? "yes" : "no"} />
        </div>

      </div>

      {resolvedOutcome ? (
        <div className="flex items-center gap-2 rounded-lg bg-yes-soft px-2.5 py-1.5 text-xs font-semibold text-yes">
          <BadgeCheck className="size-3.5 shrink-0" />
          <span className="truncate">Resolved {resolvedOutcome.label}</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {shown.map((o) => (
            <span
              key={o.id}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
                o.tone === "no"
                  ? "bg-no-soft text-no group-hover:bg-no group-hover:text-primary-foreground"
                  : o.tone === "yes"
                    ? "bg-yes-soft text-yes group-hover:bg-yes group-hover:text-primary-foreground"
                    : toneSoft[o.tone],
              )}
            >
              <span className="truncate">{o.label}</span>
              <span className="shrink-0 tabular">{formatPct(o.prob)}</span>
            </span>
          ))}
          {hidden > 0 && (
            <span className="shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-xs font-semibold text-muted-foreground tabular">
              +{hidden}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[0.7rem] text-muted-foreground">
        <span className="tabular">{formatKsh(pool, { compact: true })} pool</span>
        <span className="flex items-center gap-1 tabular">
          <Users className="size-3" /> {market.forecasters.toLocaleString("en-KE")}
        </span>
        <span className={cn("flex items-center gap-0.5 tabular font-medium", delta >= 0 ? "text-yes" : "text-no")}>
          {delta >= 0 ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
          {Math.abs(delta * 100).toFixed(1)} pts
        </span>
      </div>
    </Link>
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3">
      <div className="flex gap-3">
        <div className="size-11 shrink-0 animate-pulse rounded-xl bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-muted" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-7 flex-1 animate-pulse rounded-lg bg-muted" />
        <div className="h-7 flex-1 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
    </div>
  );
}
