import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ChevronRight, Settings } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { toneSoft } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct } from "@/lib/parimutuel";
import { markets, people, type Person } from "@/lib/mock-data";

export const Route = createFileRoute("/profile/$handle")({
  loader: ({ params }): { person: Person } => {
    const person = people.find((p) => p.handle === params.handle);
    if (!person) throw notFound();
    return { person };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return { meta: [{ title: "Forecaster not found — Polka" }, { name: "robots", content: "noindex" }] };
    }
    const { person } = loaderData;
    const description = `${person.name} · ${formatPct(person.accuracy)} accuracy across ${person.forecasts} forecasts on Polka.`;
    return {
      meta: [
        { title: `${person.name} (@${person.handle}) — Polka` },
        { name: "description", content: description },
        { property: "og:title", content: `${person.name} on Polka` },
        { property: "og:description", content: description },
        { property: "og:type", content: "profile" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Profile,
  notFoundComponent: () => (
    <AppShell>
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl">Forecaster not found</h1>
        <Link to="/leaderboard" className="mt-3 inline-block text-sm font-semibold text-primary">
          Back to leaderboard
        </Link>
      </div>
    </AppShell>
  ),
});

function Profile() {
  const { person } = Route.useLoaderData() as { person: Person };
  const created = markets.filter((m) => m.creator === person.handle);

  return (
    <AppShell>
      <header className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          <span className={cn("grid size-14 shrink-0 place-items-center rounded-full font-display text-lg", toneSoft[person.tone])}>
            {person.initials}
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold sm:text-2xl">{person.name}</h1>
            <p className="truncate text-xs text-muted-foreground">@{person.handle}</p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Accuracy" value={formatPct(person.accuracy)} />
          <Stat label="Forecasts" value={`${person.forecasts}`} />
          <Stat label="Returns" value={formatKsh(person.returns, { compact: true })} />
          <Stat label="Creator earnings" value={formatKsh(person.creatorEarnings, { compact: true })} />
        </dl>
        <Link
          to="/settings"
          className="mt-4 flex items-center gap-3 rounded-xl border border-border p-3 press hover:bg-accent"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
            <Settings className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold">Settings</span>
            <span className="block truncate text-xs text-muted-foreground">
              Appearance & light mode, text size, alerts, limits, privacy, payouts
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        </Link>
      </header>


      {created.length > 0 && (
        <section className="mt-5">
          <h2 className="mb-3 text-sm font-semibold">Markets created</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {created.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-secondary/60 px-3 py-2">
      <dt className="text-[0.68rem] text-muted-foreground">{label}</dt>
      <dd className="font-display text-lg tabular">{value}</dd>
    </div>
  );
}
