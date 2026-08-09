import { createFileRoute, Link } from "@tanstack/react-router";
import { Bot, Coins, ShieldCheck, Users } from "lucide-react";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How Polka Works — Skill-Based Forecasting" },
      {
        name: "description",
        content: "Polka is parimutuel: no bookmaker and no fixed odds. Stake on an outcome, share the pool with everyone who read it right.",
      },
      { property: "og:title", content: "How Polka works — parimutuel forecasting" },
      { property: "og:description", content: "Pools, payouts, AI resolution and creator commission explained in plain language." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorks,
});

const steps = [
  { icon: Users, title: "Read the question", body: "Every market states exactly what resolves it and which sources count. Skill comes from reading the evidence better than the crowd." },
  { icon: Coins, title: "Join a pool", body: "Your stake joins one outcome's pool. There is no bookmaker and no fixed odds — implied probability is simply your pool's share of the total." },
  { icon: Bot, title: "AI resolves it", body: "At close, AI checks the stated criteria against the cited sources, publishes its rationale, and settles the pools." },
  { icon: ShieldCheck, title: "Payout splits", body: "The losing pools are distributed to the winning pool pro-rata, minus a platform fee and the creator's commission." },
];

function HowItWorks() {
  return (
    <AppShell>
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">How Polka works</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Skill-based forecasting on a parimutuel pool. You are never playing against the house.
        </p>
      </header>

      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex items-center gap-2">
              <s.icon className="size-4 text-primary" />
              <span className="font-display text-sm tabular text-muted-foreground">Step {i + 1}</span>
            </div>
            <h2 className="mt-2 text-sm font-semibold">{s.title}</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>

      <section className="mt-5 rounded-2xl border border-border bg-card p-4 shadow-card">
        <h2 className="text-sm font-semibold">The payout formula</h2>
        <p className="mt-2 rounded-xl bg-secondary/60 p-3 font-display text-sm leading-relaxed tabular">
          payout = stake + (stake / winning pool) × losing pools × (1 − fees)
        </p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Early, well-reasoned forecasts earn the most because the winning pool is still small. Fees are charged only on
          the losing pools, never on your own stake.
        </p>
      </section>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link to="/payouts" className="rounded-2xl bg-primary-soft p-4 text-sm font-semibold text-primary">
          See a worked payout example →
        </Link>
        <Link to="/disputes" className="rounded-2xl bg-teal-soft p-4 text-sm font-semibold text-teal">
          How resolution and disputes work →
        </Link>
      </div>
    </AppShell>
  );
}
