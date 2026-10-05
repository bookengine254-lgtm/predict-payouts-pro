import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BadgeCheck,
  Flame,
  Clock,
  ChevronLeft,
  ChevronRight,
  Gift,
  LineChart,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { MarketCard } from "@/components/market-card";
import { LearnBanner } from "@/components/banners";
import { categories, currentUser, markets, totalPool, type CategoryId, type Market } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";
import { cn } from "@/lib/utils";
import { toneSoft } from "@/components/tone";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): { category?: CategoryId | undefined } => ({
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
  const category: CategoryId | "all" = searchCategory ?? "all";

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

  const inCategory = (m: Market) => category === "all" || m.category === category;
  const featured = open.filter((m) => m.featured && inCategory(m));
  const resolved = markets
    .filter((m) => (m.status === "resolved" || m.status === "disputed") && inCategory(m))
    .slice(0, 4);


  return (
    <AppShell>
      <nav aria-label="Categories" className="sticky top-14 z-20 -mx-4 mb-3 flex gap-1.5 overflow-x-auto bg-background/95 px-4 py-2 backdrop-blur [scrollbar-width:none] lg:hidden">
        {[{ id: "all" as const, label: "All" }, ...categories].map((c) => (
          <Link
            key={c.id}
            to="/"
            search={c.id === "all" ? {} : { category: c.id }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground",
            )}
          >
            {c.label}
          </Link>
        ))}
      </nav>
      {category === "all" && <HeroSlider top={visible[0] ?? open[0]} />}

      <div className={cn("hidden items-center justify-between gap-4 border-b border-border py-3 lg:flex", category === "all" ? "mt-5" : "mt-0")}>
        <nav aria-label="Market categories" className="flex min-w-0 items-center gap-1 overflow-x-auto hide-scrollbar">
          {[{ id: "all" as const, label: "All" }, ...categories.filter((c) => ["politics", "sports", "crypto", "economy", "weather"].includes(c.id))].map((c) => (
            <Link key={c.id} to="/" search={c.id === "all" ? {} : { category: c.id }} className={cn("shrink-0 rounded-md px-3 py-2 text-sm font-medium", category === c.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground")}>{c.label}</Link>
          ))}
        </nav>
        <SortControls sort={sort} setSort={setSort} />
      </div>

      {featured.length > 0 && (
        <section className="mt-6">
          <SectionHead icon={Flame} title="Featured pools" hint="Deepest liquidity right now" />
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((m) => (
              <MarketCard key={m.id} market={m} />
            ))}
          </div>
        </section>
      )}


      <section className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <SectionHead
            icon={sort === "closing" ? Clock : sort === "new" ? Sparkles : TrendingUp}
            title="All markets"
            hint={`${visible.length} open`}
          />
          <div className="lg:hidden">
            <SortControls sort={sort} setSort={setSort} />
          </div>
        </div>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
                  className="rounded-2xl bg-card p-4 bevel press hover:bg-accent/30"
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
    </AppShell>
  );
}

function SortControls({ sort, setSort }: { sort: Sort; setSort: (sort: Sort) => void }) {
  return <div className="flex gap-1 rounded-md bg-secondary p-1">{([['trending', 'Trending'], ['new', 'New'], ['closing', 'Closing']] as const).map(([key, label]) => <Button key={key} type="button" size="sm" variant="ghost" onClick={() => setSort(key)} className={cn("h-7 rounded px-3 text-xs font-semibold", sort === key ? "bg-card text-foreground shadow-card" : "text-muted-foreground hover:text-foreground")}>{label}</Button>)}</div>;
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

type Slide = {
  key: string;
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  tone: keyof typeof toneSoft;
  icon: React.ComponentType<{ className?: string }>;
  link: { to: string; params?: Record<string, string> };
  stats?: { label: string; value: string }[];
};

/**
 * Slide-based hero: your own numbers and personal recommendations only —
 * no platform-wide volume or user counts.
 */
function HeroSlider({ top }: { top: Market | undefined }) {
  const { account } = useAuth();
  const slides: Slide[] = [
    ...(account ? [
    {
      key: "you",
      eyebrow: "Your standing",
      title: `${currentUser.tier} · ${Math.round(currentUser.accuracy * 100)}% accuracy`,
      body: `${currentUser.nextTierAt - currentUser.forecasts} more resolved forecasts to reach the next tier. Keep the streak alive.`,
      cta: "Open your portfolio",
      tone: "primary",
      icon: TrendingUp,
      link: { to: "/portfolio" },
      stats: [
        { label: "Available", value: formatKsh(currentUser.balance, { compact: true }) },
        { label: "In play", value: formatKsh(currentUser.locked, { compact: true }) },
        { label: "Day streak", value: String(currentUser.streak) },
      ],
    } satisfies Slide,
    ] : []),
    ...(top
      ? [
          {
            key: "rec",
            eyebrow: "Recommended for you",
            title: top.shortTitle,
            body: top.question,
            cta: "Read the pool",
            tone: "teal" as const,
            icon: Sparkles,
            link: { to: "/market/$marketId", params: { marketId: top.id } },
          },
        ]
      : []),
    {
      key: "invite",
      eyebrow: "Invite & earn",
      title: "Keep 10% of your friends' platform fees",
      body: "Your invite link pays you for a full year — track every referral in Rewards.",
      cta: "Get your invite link",
      tone: "grape",
      icon: Gift,
      link: { to: "/invite" },
    },
    {
      key: "create",
      eyebrow: "Creator commission",
      title: "Launch a market, earn on every stake",
      body: "Seed the pool at 50/50, share it, and collect commission as forecasters arrive.",
      cta: "Create a market",
      tone: "amber",
      icon: Flame,
      link: { to: "/create" },
    },
    {
      key: "payouts",
      eyebrow: "How the pool pays",
      title: "Parimutuel maths, no bookmaker",
      body: "Model your split before you stake with the payout calculator.",
      cta: "See the maths",
      tone: "yes",
      icon: LineChart,
      link: { to: "/payouts" },
    },
  ];

  const [i, setI] = useState(0);
  const count = slides.length;

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % count), 7000);
    return () => clearInterval(t);
  }, [count]);

  const slide = slides[i % count]!;
  const Icon = slide.icon;

  return (
    <section aria-label="Highlights" className={cn("overflow-hidden rounded-3xl p-5 sm:p-7", toneSoft[slide.tone])}>
      <div key={slide.key} className="rise-in">
        <p className="flex items-center gap-2 font-display text-[0.68rem] tracking-[0.2em] uppercase opacity-80">
          <Icon className="size-4" /> {slide.eyebrow}
        </p>
        <h1 className="mt-2 max-w-2xl text-2xl leading-[1.15] font-semibold sm:text-4xl">{slide.title}</h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed opacity-80">{slide.body}</p>

        {slide.stats && (
          <dl className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
            {slide.stats.map((s) => (
              <div key={s.label}>
                <dt className="text-[0.7rem] opacity-70">{s.label}</dt>
                <dd className="font-display text-xl leading-tight tabular">{s.value}</dd>
              </div>
            ))}
          </dl>
        )}

        <Link
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          to={slide.link.to as any}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          params={slide.link.params as any}
          className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-foreground/10 px-4 py-2.5 text-sm font-semibold press hover:bg-foreground/15"
        >
          {slide.cta} <ChevronRight className="size-4" />
        </Link>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          aria-label="Previous highlight"
          onClick={() => setI((v) => (v - 1 + count) % count)}
          className="grid size-8 place-items-center rounded-full bg-foreground/10 press"
        >
          <ChevronLeft className="size-4" />
        </button>
        <div className="flex flex-1 gap-1.5">
          {slides.map((s, idx) => (
            <button
              key={s.key}
              type="button"
              aria-label={`Show ${s.eyebrow}`}
              onClick={() => setI(idx)}
              className={cn("h-1.5 flex-1 rounded-full transition-opacity", idx === i ? "bg-foreground/70" : "bg-foreground/20")}
            />
          ))}
        </div>
        <button
          type="button"
          aria-label="Next highlight"
          onClick={() => setI((v) => (v + 1) % count)}
          className="grid size-8 place-items-center rounded-full bg-foreground/10 press"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </section>
  );
}
