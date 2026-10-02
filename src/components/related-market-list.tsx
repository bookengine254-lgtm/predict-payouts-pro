import { Link } from "@tanstack/react-router";
import { MarketThumb, VersusThumb } from "./market-thumb";
import { probabilities, type Market } from "@/lib/mock-data";
import { formatPct } from "@/lib/parimutuel";
import { cn } from "@/lib/utils";

function probabilityTone(value: number) {
  if (value > 0.5) return "bg-yes-soft text-yes";
  if (value < 0.5) return "bg-no-soft text-no";
  return "bg-amber-soft text-amber";
}

export function RelatedMarketList({ markets, title }: { markets: Market[]; title: string }) {
  return (
    <section>
      <h2 className="mb-2 text-sm font-semibold">{title}</h2>
      <div className="divide-y divide-border rounded-xl border border-border bg-card">
        {markets.map((market) => {
          const probs = probabilities(market);
          const lead = market.outcomes
            .map((outcome, index) => ({ outcome, probability: probs[index] ?? 0 }))
            .sort((a, b) => b.probability - a.probability)[0];
          if (!lead) return null;
          return (
            <Link
              key={market.id}
              to="/market/$marketId"
              params={{ marketId: market.id }}
              className="flex items-center gap-2.5 p-2.5 hover:bg-accent/50"
            >
              {market.kind === "sports" ? <VersusThumb market={market} size="sm" /> : <MarketThumb market={market} size="sm" />}
              <span className="line-clamp-2 min-w-0 flex-1 text-xs leading-snug font-medium">{market.question}</span>
              <span className={cn("shrink-0 rounded-md px-2 py-1 text-xs font-semibold tabular", probabilityTone(lead.probability))}>
                {formatPct(lead.probability)}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}