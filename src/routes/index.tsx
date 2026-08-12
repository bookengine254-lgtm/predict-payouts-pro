import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BadgeCheck, Flame, Clock, Plus, Sparkles, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { InviteBanner, LearnBanner, PayoutBanner } from "@/components/banners";
import { categories, currentUser, markets, totalPool, type CategoryId } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";
import { cn } from "@/lib/utils";
import { toneSoft } from "@/components/tone";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { category?: CategoryId } => ({
    category: typeof search["category"] === "string" ? (search["category"] as CategoryId) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Polka — Skill-Based Forecasting Markets, Paid via M-Pesa" },
      {
        name: "description",
        content:
          "Forecast Kenyan politics, sport, crypto and weather. Stake into shared parimutuel pools, top up with M-Pesa, and get paid for being right.",
      },
      { property: "og:title", content: "Polka — Skill-Based Forecasting Markets" },
      {
        property: "og:description",
        content: "Shared pools, no bookmaker. Forecast the world, split the pool, cash out to M-Pesa.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Polka",
          description: "Skill-based forecasting markets with parimutuel payouts and M-Pesa settlement.",

        }),
      },
    ],
  }),
  component: Discover,
});

type Sort = "trending" | "new" | "closing";

function Discover() {
  const { category: searchCategory } = Route.useSearch();
  const [category, setCategory] = useState<CategoryId | "all">(searchCategory ?? "all");

  useEffect(() => {
    setCategory(searchCategory ?? "all");
  }, [searchCategory]);

  const [sort, setSort] = useState<Sort>("trending");

  const open = markets.filter((m) => m.status === "open");
  const visible = useMemo(() => {
    const list = open.filter((m) => category === "all" || m.category === category);
    const sorted = [...list];
    if (sort === "trending") sorted.sort((a, b) => totalPool(b) - totalPool(a));
    if (sort === "new") sorted.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    if (sort === "closing") sorted.sort((a, b) => +new Date(a.closesAt) - +new Date(b.closesAt));
    return sorted;
  }, [category, sort, open]);

  const featured = open.filter((m) => m.featured);
  const resolved = markets.filter((m) => m.status === "resolved" || m.status === "disputed").slice(0, 4);
  const volume = markets.reduce((sum, m) => sum + totalPool(m), 0);


  return (
    <AppShell>
      <section className="rounded-3xl border border-border bg-card p-5 shadow-card sm:p-7">
        <p className="font-display text-[0.68rem] tracking-[0.2em] uppercase text-primary">Skill-based forecasting</p>
        <h1 className="mt-2 max-w-2xl text-2xl leading-[1.1] font-semibold text-foreground sm:text-4xl">
          Read the world better than the crowd. The pool pays the difference.
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Every forecast joins one shared pool. No bookmaker sets odds, no house takes a side — accurate forecasters
          split what the pool holds. Top up and cash out with M-Pesa.
        </p>
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link
            to="/create"
            className="rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            Launch your own market
          </Link>
          <Link
            to="/how-it-works"
            className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-accent"
          >
            How payouts work
          </Link>
        </div>
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Open pools", value: formatKsh(volume, { compact: true }), tone: "yes" as const },
            { label: "Live markets", value: String(open.length), tone: "grape" as const },
            { label: "Your accuracy", value: `${Math.round(currentUser.accuracy * 100)}%`, tone: "teal" as const },
            { label: "Day streak", value: `${currentUser.streak}`, tone: "amber" as const },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-xl px-3 py-2.5", toneSoft[s.tone])}>
              <dt className="text-[0.68rem] font-medium opacity-80">{s.label}</dt>
              <dd className="font-display text-xl leading-tight tabular">{s.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-5 -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 hide-scrollbar lg:mx-0 lg:px-0">
        <Chip active={category === "all"} onClick={() => setCategory("all")} label="All" />
        {categories.map((c) => (
          <Chip key={c.id} active={category === c.id} onClick={() => setCategory(c.id)} label={c.label} tone={c.tone} />
        ))}
      </div>

      <section className="mt-6">
        <SectionHead icon={Flame} title="Featured pools" hint="Deepest liquidity right now" />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {featured.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <PayoutBanner />
        <InviteBanner />
      </div>

      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHead
            icon={sort === "closing" ? Clock : sort === "new" ? Sparkles : TrendingUp}
            title="All markets"
            hint={`${visible.length} open`}
          />
          <div className="flex gap-1 rounded-xl bg-secondary p-1">
            {(
              [
                ["trending", "Trending"],
                ["new", "New"],
                ["closing", "Closing"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setSort(key)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  sort === key ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => (
            <MarketCard key={m.id} market={m} />
          ))}
        </div>
      </section>

      {resolved.length > 0 && (
        <section className="mt-8">
          <SectionHead icon={BadgeCheck} title="Recently resolved" hint="Outcome summary and criteria used" />
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {resolved.map((m) => {
              const won = m.outcomes.find((o) => o.id === m.resolved?.outcomeId);
              return (
                <Link
                  key={m.id}
                  to="/market/$marketId"
                  params={{ marketId: m.id }}
                  className="rounded-2xl border border-border bg-card p-4 bevel press hover:bg-accent/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="min-w-0 text-sm leading-snug font-semibold">{m.question}</h3>
                    <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold", toneSoft["yes"])}>
                      {won?.label ?? "Resolved"}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {m.resolved?.rationale ?? m.resolutionCriteria}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground tabular">
                    Pool {formatKsh(totalPool(m), { compact: true })} · sources {m.sources.join(" · ")}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-6">
        <LearnBanner />
      </div>

      {/* Thumb-sized create button, Twitter-style */}
      <Link
        to="/create"
        aria-label="Create a market"
        className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] left-4 z-40 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground bevel-raised press lg:hidden"
      >
        <Plus className="size-7" />
      </Link>
    </AppShell>
  );
}


function Chip({
  label,
  active,
  onClick,
  tone,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  tone?: keyof typeof toneSoft;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : tone
            ? cn("border-transparent", toneSoft[tone])
            : "border-border bg-card text-muted-foreground hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function SectionHead({
  icon: Icon,
  title,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Icon className="size-4 shrink-0 text-primary" />
      <h2 className="truncate text-base font-semibold text-foreground">{title}</h2>
      <span className="shrink-0 text-xs text-muted-foreground">{hint}</span>
    </div>
  );
}
