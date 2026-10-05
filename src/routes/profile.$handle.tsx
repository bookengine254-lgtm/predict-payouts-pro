import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Settings } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { toneSoft } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct } from "@/lib/parimutuel";
import { currentUser, markets, people, positions, type Person } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AuthGate } from "@/components/auth-gate";

export const Route = createFileRoute("/profile/$handle")({
  loader: ({ params }): { person: Person | null; handle: string } => ({
    person: people.find((p) => p.handle === params.handle) ?? null,
    handle: params.handle,
  }),
  head: ({ loaderData }) => {
    const person = loaderData?.person;
    if (!person) {
      return { meta: [{ title: "Profile — Polka" }, { name: "description", content: "Forecasting profiles on Polka." }, { property: "og:title", content: "Profile — Polka" }, { property: "og:description", content: "Forecasting profiles on Polka." }, { property: "og:type", content: "profile" }, { name: "twitter:card", content: "summary_large_image" }, { name: "robots", content: "noindex" }] };
    }
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
});

function Profile() {
  const { person: found, handle } = Route.useLoaderData() as { person: Person | null; handle: string };
  const { account, openAuth } = useAuth();
  const [tab, setTab] = useState<"positions" | "created" | "badges">("positions");

  /** A freshly created account always has a profile — build it from the session. */
  const own =
    account && (handle === "you" || handle.toLowerCase() === account.username.toLowerCase())
      ? ({
          handle: account.username || "you",
          name: account.name || account.username,
          initials: account.initials,
          tone: "grape",
          accuracy: currentUser.accuracy,
          forecasts: currentUser.forecasts,
          returns: currentUser.balance,
          followers: currentUser.referrals,
          creatorEarnings: currentUser.referralEarnings,
          bio:
            account.bio?.trim() ||
            "New forecaster on Polka. Building an accuracy record one pool at a time.",
        } satisfies Person)
      : null;

  const person = own ?? found;
  /* Only your own profile can show the photo saved in Settings. */
  const avatar = own && person === own ? account?.avatar : null;

  if (!person) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl">This profile isn't on Polka yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to claim your own forecaster profile.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button
              type="button"
              onClick={() => openAuth("signup")}
            >
              Create account
            </Button>
            <Link
              to="/leaderboard"
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold press hover:bg-accent"
            >
              Back to leaderboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const created = markets.filter((m) => m.creator === person.handle);


  return (
    <AppShell>
      {handle === "you" && !account ? <AuthGate feature="your profile"><div /></AuthGate> : <>
      <header className="border-b border-border py-4 sm:py-6">
        <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={person.name} className="size-14 shrink-0 rounded-full object-cover" />
          ) : (
            <span
              className={cn(
                "grid size-14 shrink-0 place-items-center rounded-full font-display text-lg",
                toneSoft[person.tone],
              )}
            >
              {person.initials}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-semibold sm:text-2xl">{person.name}</h1>
            <p className="truncate text-xs text-muted-foreground">@{person.handle}</p>
          </div>
          {own && <Button asChild variant="outline" size="sm"><Link to="/settings"><Settings /> Edit profile</Link></Button>}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{person.bio}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Accuracy" value={formatPct(person.accuracy)} />
          <Stat label="Forecasts" value={`${person.forecasts}`} />
          <Stat label="Returns" value={formatKsh(person.returns, { compact: true })} />
          <Stat label="Creator earnings" value={formatKsh(person.creatorEarnings, { compact: true })} />
        </dl>
      </header>
      <nav aria-label="Profile sections" className="mt-5 flex gap-1 overflow-x-auto border-b border-border">
        {([ ["positions", "Forecasts & positions"], ["created", "Created markets"], ["badges", "Badges & reputation"] ] as const).map(([id, label]) => <Button key={id} variant="ghost" onClick={() => setTab(id)} className={cn("h-10 shrink-0 rounded-none border-b-2 px-3 text-xs sm:text-sm", tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground")}>{label}</Button>)}
      </nav>
      {tab === "positions" && <section className="mt-4 space-y-2">{own ? positions.map((p) => { const market = markets.find((m) => m.id === p.marketId); return market ? <Link key={p.marketId} to="/market/$marketId" params={{ marketId: p.marketId }} className="flex items-center justify-between gap-3 border-b border-border py-3 text-sm hover:text-primary"><span className="min-w-0"><span className="block font-medium">{market.question}</span><span className="text-xs text-muted-foreground">{market.outcomes.find((o) => o.id === p.outcomeId)?.label} · {p.status}</span></span><span className="shrink-0 font-semibold tabular">{formatKsh(p.stake)}</span></Link> : null; }) : <p className="py-6 text-sm text-muted-foreground">Forecasts are visible to their owner.</p>}</section>}
      {tab === "created" && <section className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{created.length ? created.map((m) => <MarketCard key={m.id} market={m} />) : <p className="text-sm text-muted-foreground">No markets created yet.</p>}</section>}
      {tab === "badges" && <section className="mt-4 grid gap-4 border-b border-border py-5 sm:grid-cols-3"><Stat label="Forecaster tier" value={own ? currentUser.tier : "Forecaster"} /><Stat label="Win streak" value={own ? `${currentUser.streak}` : "—"} /><Stat label="Referrals" value={own ? `${currentUser.referrals}` : "—"} /></section>}
      </>}
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
