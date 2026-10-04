import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Clock, Flame, TrendingDown, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { MarketThumb } from "@/components/market-thumb";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, quotePayout, timeLeft } from "@/lib/parimutuel";
import { currentUser, marketById, positions, probabilities, totalPool } from "@/lib/mock-data";
import { AuthGate } from "@/components/auth-gate";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Your Portfolio — Polka" },
      {
        name: "description",
        content:
          "Track every open forecast, claimable payout and settled position, with live implied probability and projected returns.",
      },
      { property: "og:title", content: "Your forecasting portfolio — Polka" },
      { property: "og:description", content: "Open positions, claimable payouts and settled history in one view." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Portfolio,
});

type Tab = "open" | "claimable" | "settled";

function Portfolio() {
  const [tab, setTab] = useState<Tab>("open");

  const rows = useMemo(
    () =>
      positions
        .map((p) => {
          const market = marketById(p.marketId);
          if (!market) return null;
          const probs = probabilities(market);
          const idx = market.outcomes.findIndex((o) => o.id === p.outcomeId);
          const outcome = market.outcomes[idx]!;
          const quote = quotePayout({
            stake: p.stake,
            outcomePool: outcome.pool,
            totalPool: totalPool(market),
            platformFeeBps: market.platformFeeBps,
            creatorFeeBps: market.creatorFeeBps,
          });
          return { ...p, market, outcome, prob: probs[idx] ?? 0, quote };
        })
        .filter((r): r is NonNullable<typeof r> => Boolean(r)),
    [],
  );

  const visible = rows.filter((r) =>
    tab === "open" ? r.status === "open" : tab === "claimable" ? r.status === "claimable" : r.status !== "open",
  );

  const staked = rows.filter((r) => r.status === "open").reduce((s, r) => s + r.stake, 0);
  const projected = rows.filter((r) => r.status === "open").reduce((s, r) => s + r.quote.payout, 0);

  return (
    <AppShell>
      <AuthGate feature="your portfolio">
      <div>
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every forecast you hold, priced at the current pool split.
        </p>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Staked in open pools" value={formatKsh(staked)} tone="primary" />
        <Stat label="If all correct" value={formatKsh(projected)} tone="yes" />
        <Stat label="Accuracy" value={formatPct(currentUser.accuracy)} tone="teal" />
        <Stat label="Day streak" value={`${currentUser.streak}`} tone="amber" />
      </dl>

      <div className="mt-5 flex gap-1 rounded-xl bg-secondary p-1">
        {(
          [
            ["open", "Open"],
            ["claimable", "Claimable"],
            ["settled", "Settled"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setTab(k)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
              tab === k ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ul className="mt-4 grid gap-3 lg:grid-cols-2">
        {visible.map((r) => (
          <li key={`${r.marketId}-${r.outcomeId}`}>
            <div className="rounded-2xl bg-card p-3 shadow-card">
              <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3">
                <MarketThumb market={r.market} />
                <div className="min-w-0">
                  <Link
                    to="/market/$marketId"
                    params={{ marketId: r.marketId }}
                    className="line-clamp-2 text-sm font-medium hover:text-primary"
                  >
                    {r.market.question}
                  </Link>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[0.7rem] text-muted-foreground">
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 font-semibold",
                        r.outcome.tone === "no" ? "bg-no-soft text-no" : "bg-yes-soft text-yes",
                      )}
                    >
                      {r.outcome.label}
                    </span>
                    <span className="tabular">{formatKsh(r.stake)} staked</span>
                    <span className="flex items-center gap-1 tabular">
                      <Clock className="size-3" /> {timeLeft(r.market.closesAt)}
                    </span>
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-display text-lg leading-none tabular">{formatPct(r.prob)}</p>
                  <p
                    className={cn(
                      "mt-0.5 flex items-center justify-end gap-0.5 text-[0.7rem] tabular",
                      r.prob >= r.avgProbability ? "text-yes" : "text-no",
                    )}
                  >
                    {r.prob >= r.avgProbability ? (
                      <TrendingUp className="size-3" />
                    ) : (
                      <TrendingDown className="size-3" />
                    )}
                    entry {formatPct(r.avgProbability)}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 rounded-xl bg-secondary/60 px-3 py-2 text-xs">
                <span className="text-muted-foreground">
                  {r.status === "lost" ? "Settled" : "If correct"}
                </span>
                <span className="tabular font-semibold">
                  {r.status === "lost" ? `−${formatKsh(r.stake)}` : formatKsh(r.quote.payout)}
                </span>
              </div>

              {r.status === "claimable" && (
                <button
                  type="button"
                  onClick={() =>
                    toast.success(`Claimed ${formatKsh(r.quote.payout)}`, {
                      description: "Landing in your wallet now. Withdraw to M-Pesa any time.",
                    })
                  }
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-yes py-2.5 text-xs font-semibold text-primary-foreground"
                >
                  <BadgeCheck className="size-3.5" /> Claim {formatKsh(r.quote.payout)}
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {visible.length === 0 && (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center">
          <Flame className="mx-auto size-5 text-primary" />
          <p className="mt-2 text-sm font-semibold">Nothing here yet</p>
          <Link to="/" className="mt-2 inline-block text-xs font-semibold text-primary">
            Find a market to forecast
          </Link>
        </div>
      )}
      </div>
      </AuthGate>
    </AppShell>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "primary" | "yes" | "teal" | "amber" }) {
  const cls = {
    primary: "bg-primary-soft text-primary",
    yes: "bg-yes-soft text-yes",
    teal: "bg-teal-soft text-teal",
    amber: "bg-amber-soft text-amber",
  }[tone];
  return (
    <div className={cn("rounded-xl px-3 py-2.5", cls)}>
      <dt className="text-[0.68rem] font-medium opacity-80">{label}</dt>
      <dd className="font-display text-xl leading-tight tabular">{value}</dd>
    </div>
  );
}
