import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, timeLeft } from "@/lib/parimutuel";
import { categoryOf, probabilities, totalPool, trendDelta, type Market } from "@/lib/mock-data";
import { MarketThumb } from "./market-thumb";
import { toneSoft } from "./tone";
import { BadgeCheck, CircleGauge, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "@tanstack/react-router";

/**
 * Compact market card. Binary, multi-outcome and sports markets all render in the
 * same fixed vertical rhythm: header row, one outcome row, one stats row.
 * Multi-outcome markets collapse to the top two runners plus a "+N" pill so a
 * five-way market never grows taller than a Yes/No card beside it.
 */
export function MarketCard({ market }: { market: Market }) {
  const navigate = useNavigate();
  const probs = probabilities(market);
  const pool = totalPool(market);
  const cat = categoryOf(market.category);
  const resolvedOutcome = market.resolved
    ? market.outcomes.find((o) => o.id === market.resolved!.outcomeId)
    : undefined;

  const ranked = market.outcomes
    .map((o, i) => ({ ...o, prob: probs[i] ?? 0 }))
    .sort((a, b) => b.prob - a.prob);
  const isBinary = market.outcomes.length === 2;
  const all = market.outcomes.map((o, i) => ({ ...o, prob: probs[i] ?? 0 }));
  /* Fixtures read best in fixture order (Home / Draw / Away) when they fit. */
  const shown = isBinary
    ? all
    : market.kind === "sports" && market.outcomes.length <= 3
      ? all
      : ranked.slice(0, 2);
  const hidden = market.outcomes.length - shown.length;
  const lead = ranked[0]!;
  /* Binary markets headline the Yes side as "chance"; multi/sports headline the leader. */
  const headline = isBinary ? { label: "chance", prob: probs[0] ?? 0 } : { label: lead.label, prob: lead.prob };
  const actionLabel = (label: string, index: number) => market.kind === "sports" && market.sports && market.outcomes.length === 3
    ? index === 1 ? "Draw" : index === 0 ? market.sports.home : market.sports.away
    : label;

  return (
    <article className="flex h-full min-w-0 flex-col gap-2.5 rounded-lg border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
      <Link to="/market/$marketId" params={{ marketId: market.id }} className="flex min-w-0 items-start gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <MarketThumb market={market} className="!size-9 !rounded-lg" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 break-words text-sm leading-snug font-medium text-card-foreground">{market.question}</h3>
          <p className="mt-1 truncate text-[0.68rem] text-muted-foreground"><span className={cn("rounded px-1 font-medium", toneSoft[cat.tone])}>{cat.label}</span> {market.sports?.league ?? (market.kind === "multi" ? `${market.outcomes.length} outcomes` : "")}</p>
        </div>
        <div className="w-14 shrink-0 text-right">
          <span className="block font-display text-xl leading-none tabular">{formatPct(headline.prob)}</span>
          <span className="block truncate text-[0.62rem] uppercase text-muted-foreground" title={headline.label}>{headline.label}</span>
        </div>
      </Link>

      {resolvedOutcome ? (
        <div className="flex items-center gap-2 rounded-lg bg-yes-soft px-2.5 py-1.5 text-xs font-semibold text-yes">
          <BadgeCheck className="size-3.5 shrink-0" />
          <span className="truncate">Resolved {resolvedOutcome.label}</span>
        </div>
      ) : (
        <div className="flex min-w-0 items-center gap-1.5">
          {shown.map((o) => (
            <Button
              key={o.id}
              type="button"
              size="sm"
              disabled={market.status !== "open"}
              title={`Forecast ${o.label} on ${market.question}`}
              onClick={() => navigate({ to: "/market/$marketId", params: { marketId: market.id }, search: { outcome: o.id } })}
              className={cn(
                "min-w-0 flex-1 justify-between gap-1 rounded-md px-2 text-xs font-semibold shadow-none",
                o.tone === "no"
                   ? "bg-no-soft text-no hover:bg-no hover:text-primary-foreground"
                  : o.tone === "yes"
                    ? "bg-yes-soft text-yes hover:bg-yes hover:text-primary-foreground"
                    : toneSoft[o.tone],
              )}
            >
              <span className="min-w-0 truncate" title={o.label}>{actionLabel(o.label, all.findIndex((item) => item.id === o.id))}</span>
              <span className="shrink-0 tabular">{formatPct(o.prob)}</span>
            </Button>
          ))}
          {hidden > 0 && (
            <span className="shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-xs font-semibold text-muted-foreground tabular">
              +{hidden}
            </span>
          )}
        </div>
      )}

      <div className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-1 border-t border-border/70 pt-2 text-[0.65rem] text-muted-foreground">
        <span className="tabular">{formatKsh(pool, { compact: true })} vol</span>
        <span className="flex items-center gap-1 tabular font-medium text-foreground">
          <Clock className="size-3" /> {market.resolved ? "Resolved" : timeLeft(market.closesAt)}
        </span>
        <span className="flex items-center gap-1 font-medium text-yes">
          <CircleGauge className="size-3" /> {pool >= 100_000 ? "Deep" : pool >= 40_000 ? "Active" : "New"}
        </span>
      </div>
    </article>
  );
}

export function MarketCardSkeleton() {
  return (
    <div className="flex flex-col gap-2.5 rounded-lg border border-border bg-card p-3">
      <div className="flex gap-3">
        <div className="size-9 shrink-0 animate-pulse rounded-lg bg-muted" />
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
