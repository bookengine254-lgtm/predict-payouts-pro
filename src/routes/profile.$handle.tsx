import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, Settings } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { toneSoft } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct } from "@/lib/parimutuel";
import { currentUser, markets, people, type Person } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/profile/$handle")({
  loader: ({ params }): { person: Person | null; handle: string } => ({
    person: people.find((p) => p.handle === params.handle) ?? null,
    handle: params.handle,
  }),
  head: ({ loaderData }) => {
    const person = loaderData?.person;
    if (!person) {
      return { meta: [{ title: "Your forecaster profile — Polka" }, { name: "robots", content: "noindex" }] };
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

  const person = found ?? own;
  /* Only your own profile can show the photo saved in Settings. */
  const avatar = own && person === own ? account?.avatar : null;

  if (!person) {
    return (
      <AppShell>
        <div className="py-20 text-center">
          <h1 className="font-display text-2xl">This profile isn't on Polka yet</h1>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to claim your own forecaster profile.</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => openAuth("signup")}
              className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground press"
            >
              Create account
            </button>
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
      <header className="rounded-2xl bg-card p-4 bevel sm:p-5">
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
          className="mt-4 flex items-center gap-3 rounded-xl bg-secondary/50 p-3 press hover:bg-accent"
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
