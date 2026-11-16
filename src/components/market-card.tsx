import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, timeLeft } from "@/lib/parimutuel";
import { categoryOf, probabilities, totalPool, type Market } from "@/lib/mock-data";
import { MarketThumb } from "./market-thumb";
import { toneSoft } from "./tone";
import { BadgeCheck } from "lucide-react";
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
  const actionLabel = (label: string, index: number) => market.kind === "sports" && market.sports && market.outcomes.length === 3
    ? index === 1 ? "Draw" : index === 0 ? market.sports.home : market.sports.away
    : label;

  const go = (id: string) => navigate({ to: "/market/$marketId", params: { marketId: market.id }, search: { outcome: id } });
  const closed = market.status !== "open";
  const versus = market.kind === "sports" && market.sports && market.outcomes.length <= 3;
  const kickoff = market.sports ? new Date(market.sports.kickoff).toLocaleTimeString("en-KE", { hour: "numeric", minute: "2-digit" }) : "";

  if (versus && !resolvedOutcome) {
    const sides = [
      { name: market.sports!.home, thumb: market.versus?.homeThumb, emoji: market.versus?.homeEmoji ?? market.thumbnailEmoji, o: all[0]! },
      { name: market.sports!.away, thumb: market.versus?.awayThumb, emoji: market.versus?.awayEmoji ?? market.thumbnailEmoji, o: all[all.length - 1]! },
    ];
    return (
      <article className="flex h-full min-w-0 flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
        <Link to="/market/$marketId" params={{ marketId: market.id }} className="flex flex-col gap-2.5">
          <p className="flex items-center gap-1.5 text-[0.7rem] text-muted-foreground tabular">
            <span className="rounded bg-secondary px-1.5 py-0.5 font-semibold text-foreground">{kickoff}</span>
            <span>·</span><span>{formatKsh(pool, { compact: true })} Vol</span>
            <span className="ml-auto truncate">{market.sports!.league}</span>
          </p>
          {sides.map((t) => (
            <div key={t.name} className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-md bg-secondary text-base">
                {t.thumb ? <img src={t.thumb} alt="" className="size-full object-cover" loading="lazy" /> : t.emoji}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t.name}</span>
              <span className="shrink-0 text-sm font-semibold tabular text-muted-foreground">{formatPct(t.o.prob)}</span>
            </div>
          ))}
        </Link>
        <div className="mt-auto flex gap-1.5">
          {all.map((o, i) => {
            const draw = all.length === 3 && i === 1;
            return (
              <button key={o.id} type="button" disabled={closed} onClick={() => go(o.id)} title={o.label}
                className={cn("chunky-solid min-w-0 flex-1 rounded-lg px-2 py-2 text-xs font-bold uppercase tabular disabled:opacity-50",
                  draw ? "border border-border bg-secondary text-foreground" : i === 0 ? "bg-yes text-primary-foreground" : "bg-primary text-primary-foreground")}>
                <span className="block truncate">{draw ? "Draw" : actionLabel(o.label, i).slice(0, 3)} {Math.round(o.prob * 100)}%</span>
              </button>
            );
          })}
        </div>
      </article>
    );
  }

  return (
    <article className="flex h-full min-w-0 flex-col gap-2.5 rounded-xl border border-border bg-card p-3 shadow-card transition-colors hover:border-primary/40">
      <Link to="/market/$marketId" params={{ marketId: market.id }} className="flex min-w-0 items-start gap-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <MarketThumb market={market} className="!size-10 !rounded-lg" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 break-words text-sm leading-snug font-semibold text-card-foreground">{market.question}</h3>
          <p className="mt-0.5 truncate text-[0.68rem] text-muted-foreground"><span className={cn("rounded px-1 font-medium", toneSoft[cat.tone])}>{cat.label}</span> {market.resolved ? "Resolved" : timeLeft(market.closesAt)}</p>
        </div>
      </Link>

      {resolvedOutcome ? (
        <div className="flex items-center gap-2 rounded-lg bg-yes-soft px-2.5 py-1.5 text-xs font-semibold text-yes">
          <BadgeCheck className="size-3.5 shrink-0" />
          <span className="truncate">Resolved {resolvedOutcome.label}</span>
        </div>
      ) : (
        <div className="flex flex-col gap-1.5">
          {shown.map((o, i) => {
            const neg = o.tone === "no" || (isBinary && i === 1);
            return (
              <div key={o.id} className="flex min-w-0 items-center gap-2">
                <span className={cn("h-5 w-1 shrink-0 rounded-full", neg ? "bg-no" : "bg-yes")} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium" title={o.label}>{actionLabel(o.label, all.findIndex((x) => x.id === o.id))}</span>
                <button type="button" disabled={closed} onClick={() => go(o.id)} title={`Forecast ${o.label}`}
                  className={cn("chunky-solid w-16 shrink-0 rounded-lg py-1.5 text-sm font-bold tabular text-primary-foreground disabled:opacity-50", neg ? "bg-no" : "bg-yes")}>
                  {formatPct(o.prob)}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-[0.68rem] text-muted-foreground">
        <span className="tabular">{formatKsh(pool, { compact: true })} Vol</span>
        {hidden > 0 && <span className="font-semibold tabular">{hidden} more</span>}
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
