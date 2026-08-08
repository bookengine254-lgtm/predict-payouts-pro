import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, timeLeft } from "@/lib/parimutuel";
import { categoryOf, probabilities, totalPool, trendDelta, type Market } from "@/lib/mock-data";
import { MarketThumb } from "./market-thumb";
import { Sparkline } from "./sparkline";
import { toneSoft } from "./tone";
import { TrendingDown, TrendingUp, Users } from "lucide-react";

export function MarketCard({ market }: { market: Market }) {
  const probs = probabilities(market);
  const pool = totalPool(market);
  const delta = trendDelta(market);
  const cat = categoryOf(market.category);
  const yes = market.outcomes[0]!;
  const no = market.outcomes[1]!;
  const yesProb = probs[0] ?? 0;
  const noProb = probs[1] ?? 0;
  const series = market.history.map((h) => h.values[0] ?? 0);

  return (
    <Link
      to="/market/$marketId"
      params={{ marketId: market.id }}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
        <MarketThumb market={market} />
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-[0.95rem] leading-snug font-medium tracking-normal text-card-foreground">
            {market.question}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-[0.7rem] text-muted-foreground">
            <span className={cn("rounded-full px-1.5 py-0.5 font-medium", toneSoft[cat.tone])}>{cat.label}</span>
            <span className="tabular">{timeLeft(market.closesAt)}</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="font-display text-xl leading-none tabular text-card-foreground">
            {formatPct(yesProb)}
          </span>
          <Sparkline values={series} tone={delta >= 0 ? "yes" : "no"} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex-1 rounded-lg bg-yes-soft py-1.5 text-center text-xs font-semibold text-yes transition-colors group-hover:bg-yes group-hover:text-primary-foreground">
          {yes.label} {formatPct(yesProb)}
        </span>
        <span className="flex-1 rounded-lg bg-no-soft py-1.5 text-center text-xs font-semibold text-no transition-colors group-hover:bg-no group-hover:text-primary-foreground">
          {no.label} {formatPct(noProb)}
        </span>
      </div>

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
