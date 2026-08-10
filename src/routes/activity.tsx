import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { BadgeCheck, Bell, Bot, Gavel, Sparkles, TrendingUp, Users, Wallet } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { toneSoft } from "@/components/tone";
import { cn } from "@/lib/utils";
import { activity, type ActivityItem } from "@/lib/mock-data";

export const Route = createFileRoute("/activity")({
  head: () => ({
    meta: [
      { title: "Activity — Polka" },
      {
        name: "description",
        content:
          "Every resolution, payout, odds swing and dispute on the markets you follow, in one calm timeline.",
      },
      { property: "og:title", content: "Activity — Polka" },
      { property: "og:description", content: "Resolutions, payouts, odds swings and disputes as they happen." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ActivityPage,
});

const FILTERS = ["All", "Resolutions", "Payouts", "Odds moves", "Disputes", "Social"] as const;

const ICONS: Record<ActivityItem["kind"], React.ComponentType<{ className?: string }>> = {
  resolution: BadgeCheck,
  payout: Wallet,
  move: TrendingUp,
  approval: Bot,
  dispute: Gavel,
  social: Users,
};

const MATCH: Record<(typeof FILTERS)[number], ActivityItem["kind"][] | null> = {
  All: null,
  Resolutions: ["resolution", "approval"],
  Payouts: ["payout"],
  "Odds moves": ["move"],
  Disputes: ["dispute"],
  Social: ["social"],
};

function relative(at: string) {
  const diff = Date.now() - Date.parse(at);
  const hours = diff / 3_600_000;
  if (hours < 1) return "just now";
  if (hours < 24) return `${Math.round(hours)}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

function ActivityPage() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("All");
  const kinds = MATCH[filter];
  const items = activity.filter((a) => !kinds || kinds.includes(a.kind));

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-display text-2xl">Activity</h1>
          <p className="text-sm text-muted-foreground">Resolutions, payouts and pool swings on what you follow.</p>
        </div>
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary bevel">
          <Bell className="size-5" />
        </span>
      </header>

      <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1 hide-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold press",
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <ul className="mt-4 space-y-2.5 rise-in">
        {items.map((a) => {
          const Icon = ICONS[a.kind];
          const body = (
            <>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", toneSoft[a.tone])}>
                <Icon className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm leading-tight font-semibold">{a.title}</span>
                <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{a.detail}</span>
              </span>
              <span className="shrink-0 self-start text-xs text-muted-foreground tabular">{relative(a.at)}</span>
            </>
          );
          return (
            <li key={a.id}>
              {a.marketId ? (
                <Link
                  to="/market/$marketId"
                  params={{ marketId: a.marketId }}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 bevel press hover:bg-accent/40"
                >
                  {body}
                </Link>
              ) : (
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5 bevel">{body}</div>
              )}
            </li>
          );
        })}
      </ul>

      {items.length === 0 && (
        <p className="mt-6 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground bevel">
          Nothing here yet. Follow a few markets and this fills up fast.
        </p>
      )}

      <Link
        to="/invite"
        className="mt-4 flex items-center gap-3 rounded-2xl border border-border bg-teal-soft p-4 bevel press"
      >
        <Sparkles className="size-5 shrink-0 text-teal" />
        <span className="min-w-0 text-sm font-semibold">
          Quiet feed? Invite three friends — arguments make better forecasts (and pay you commission).
        </span>
      </Link>
    </AppShell>
  );
}
