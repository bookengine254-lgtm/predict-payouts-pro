import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Medal, TrendingUp, Trophy } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { toneSoft } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct } from "@/lib/parimutuel";
import { people } from "@/lib/mock-data";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — Top Forecasters on Polka" },
      {
        name: "description",
        content:
          "Ranked by accuracy, returns and creator commission. See who reads Kenyan politics, sport and markets best.",
      },
      { property: "og:title", content: "Top forecasters — Polka leaderboard" },
      { property: "og:description", content: "Accuracy, returns and creator earnings for the sharpest forecasters." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Leaderboard,
});

type Metric = "accuracy" | "returns" | "creatorEarnings";

function Leaderboard() {
  const [metric, setMetric] = useState<Metric>("accuracy");
  const ranked = [...people].sort((a, b) => b[metric] - a[metric]);
  const podium = ranked.slice(0, 3);

  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">Leaderboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Skill, measured. Season resets in 18 days.</p>
        </div>
        <Trophy className="size-6 shrink-0 text-amber" />
      </header>

      <div className="mt-4 flex gap-1 rounded-xl bg-secondary p-1">
        {(
          [
            ["accuracy", "Accuracy"],
            ["returns", "Returns"],
            ["creatorEarnings", "Creators"],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            type="button"
            onClick={() => setMetric(k)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-colors",
              metric === k ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {podium.map((p, i) => (
          <Link
            key={p.handle}
            to="/profile/$handle"
            params={{ handle: p.handle }}
            className={cn(
              "rounded-2xl border border-border p-4 transition-shadow hover:shadow-lift",
              i === 0 ? "bg-amber-soft" : "bg-card shadow-card",
            )}
          >
            <div className="flex items-center gap-2">
              {i === 0 ? <Crown className="size-4 text-amber" /> : <Medal className="size-4 text-muted-foreground" />}
              <span className="font-display text-sm tabular">#{i + 1}</span>
            </div>
            <span className={cn("mt-3 grid size-11 place-items-center rounded-full font-display", toneSoft[p.tone])}>
              {p.initials}
            </span>
            <p className="mt-2 truncate text-sm font-semibold">{p.name}</p>
            <p className="font-display text-2xl tabular">
              {metric === "accuracy" ? formatPct(p.accuracy) : formatKsh(p[metric], { compact: true })}
            </p>
            <p className="mt-1 truncate text-[0.7rem] text-muted-foreground">{p.forecasts} forecasts</p>
          </Link>
        ))}
      </div>

      <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card shadow-card">
        {ranked.map((p, i) => (
          <li key={p.handle}>
            <Link
              to="/profile/$handle"
              params={{ handle: p.handle }}
              className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 p-3 transition-colors hover:bg-accent"
            >
              <span className="w-5 shrink-0 text-center text-xs text-muted-foreground tabular">{i + 1}</span>
              <span
                className={cn("grid size-9 shrink-0 place-items-center rounded-full font-display text-xs", toneSoft[p.tone])}
              >
                {p.initials}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{p.name}</span>
                <span className="block truncate text-[0.7rem] text-muted-foreground">{p.bio}</span>
              </span>
              <span className="shrink-0 text-right">
                <span className="block font-display text-base tabular">
                  {metric === "accuracy" ? formatPct(p.accuracy) : formatKsh(p[metric], { compact: true })}
                </span>
                <span className="flex items-center justify-end gap-0.5 text-[0.68rem] text-yes tabular">
                  <TrendingUp className="size-3" /> {p.followers.toLocaleString("en-KE")}
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </AppShell>
  );
}
