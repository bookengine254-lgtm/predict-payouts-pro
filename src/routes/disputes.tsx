import { createFileRoute, Link } from "@tanstack/react-router";
import { Gavel, ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { toneSoft } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh } from "@/lib/parimutuel";
import { disputes, marketById, markets } from "@/lib/mock-data";

export const Route = createFileRoute("/disputes")({
  head: () => ({
    meta: [
      { title: "Resolutions & Disputes — Polka" },
      {
        name: "description",
        content: "How AI resolves markets, what evidence it cites, and how to dispute a resolution you believe is wrong.",
      },
      { property: "og:title", content: "Resolutions & disputes — Polka" },
      { property: "og:description", content: "Every resolution shows its outcome, criteria and sources. Disputes are reviewed in 48 hours." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Disputes,
});

function Disputes() {
  const resolved = markets.filter((m) => m.resolved);

  return (
    <AppShell>
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Resolutions & disputes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          AI resolves against the criteria written at creation, cites its sources, and shows its working.
        </p>
      </header>

      <section className="mt-5">
        <h2 className="text-sm font-semibold">Recently resolved</h2>
        <ul className="mt-3 space-y-2.5">
          {resolved.map((m) => {
            const outcome = m.outcomes.find((o) => o.id === m.resolved!.outcomeId)!;
            return (
              <li key={m.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
                  <Link
                    to="/market/$marketId"
                    params={{ marketId: m.id }}
                    className="min-w-0 text-sm font-medium hover:text-primary"
                  >
                    {m.question}
                  </Link>
                  <span
                    className={cn(
                      "shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold",
                      toneSoft[outcome.tone],
                    )}
                  >
                    {outcome.label}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.resolved!.rationale}</p>
                <div className="mt-2 rounded-xl bg-secondary/60 p-3 text-[0.7rem] leading-relaxed text-muted-foreground">
                  <strong className="font-semibold text-foreground">Criteria used · </strong>
                  {m.resolutionCriteria}
                  <br />
                  <strong className="font-semibold text-foreground">Sources · </strong>
                  {m.sources.join(" · ")}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-semibold">Open cases</h2>
        <ul className="mt-3 space-y-2.5">
          {disputes.map((d) => {
            const m = marketById(d.marketId);
            return (
              <li key={d.id} className="rounded-2xl border border-border bg-card p-4 shadow-card">
                <div className="flex items-start gap-3">
                  <Gavel className="mt-0.5 size-4 shrink-0 text-amber" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{m?.question}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">“{d.claim}”</p>
                    <p className="mt-1 text-[0.7rem] text-muted-foreground tabular">
                      Filed by @{d.openedBy} · {formatKsh(d.stakeAtRisk, { compact: true })} at stake ·{" "}
                      {d.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
                <ol className="mt-3 space-y-2 border-l border-border pl-3">
                  {d.timeline.map((t) => (
                    <li key={t.label}>
                      <p className="text-xs font-semibold">{t.label}</p>
                      <p className="text-[0.7rem] leading-relaxed text-muted-foreground">{t.detail}</p>
                    </li>
                  ))}
                </ol>
              </li>
            );
          })}
        </ul>
      </section>

      <div className="mt-5 flex items-start gap-2 rounded-2xl bg-teal-soft p-4 text-xs leading-relaxed text-teal">
        <ShieldCheck className="mt-0.5 size-4 shrink-0" />
        <span>
          Filing a dispute costs KSh 200, fully refunded when it is upheld. Cases close within 48 hours and every
          decision publishes its evidence.
        </span>
      </div>
    </AppShell>
  );
}
