import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { formatKsh, formatPct, quotePayout } from "@/lib/parimutuel";

export const Route = createFileRoute("/payouts")({
  head: () => ({
    meta: [
      { title: "Payout Calculator — Polka" },
      {
        name: "description",
        content: "Model any parimutuel payout: set your stake and the pool sizes to see your share, fees and return multiple.",
      },
      { property: "og:title", content: "Parimutuel payout calculator — Polka" },
      { property: "og:description", content: "See exactly how the pool splits before you forecast." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Payouts,
});

function Payouts() {
  const [stake, setStake] = useState(500);
  const [outcomePool, setOutcomePool] = useState(180000);
  const [total, setTotal] = useState(420000);

  const quote = quotePayout({
    stake,
    outcomePool,
    totalPool: Math.max(total, outcomePool + stake),
    platformFeeBps: 200,
    creatorFeeBps: 100,
  });

  return (
    <AppShell>
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Payout calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fees apply only to the losing pools — never to your stake.</p>
      </header>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-2xl border border-border bg-card p-4 shadow-card">
          {(
            [
              ["Your stake (KSh)", stake, setStake],
              ["Your outcome's pool", outcomePool, setOutcomePool],
              ["Total pool", total, setTotal],
            ] as const
          ).map(([label, value, set]) => (
            <label key={label} className="block">
              <span className="text-xs font-medium text-muted-foreground">{label}</span>
              <input
                type="number"
                min={0}
                value={value}
                onChange={(e) => set(Math.max(0, Number(e.target.value)))}
                className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-display text-lg tabular outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>
          ))}
        </div>

        <dl className="space-y-2 rounded-2xl border border-border bg-card p-4 text-sm shadow-card">
          <Row label="Implied probability" value={formatPct(quote.probabilityAfter, 1)} />
          <Row label="Payout if correct" value={formatKsh(quote.payout)} />
          <Row label="Net profit" value={formatKsh(quote.profit)} />
          <Row label="Return multiple" value={`${quote.multiple.toFixed(2)}×`} />
          <Row label="Fees on losing pools" value="3.0%" />
        </dl>
      </div>
    </AppShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-display tabular">{value}</dd>
    </div>
  );
}
