import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as ReTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeCheck,
  Bot,
  Clock,
  Gavel,
  Info,
  Share2,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { MarketThumb } from "@/components/market-thumb";
import { MarketCard } from "@/components/market-card";
import { toneSoft, toneText } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, quotePayout, timeLeft } from "@/lib/parimutuel";
import {
  categoryOf,
  marketById,
  markets,
  people,
  probabilities,
  totalPool,
  trendDelta,
} from "@/lib/mock-data";

export const Route = createFileRoute("/market/$marketId")({
  loader: ({ params }) => {
    const market = marketById(params.marketId);
    if (!market) throw notFound();
    return { market };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Market not found — Soko" }, { name: "robots", content: "noindex" }] };
    }
    const { market } = loaderData;
    const probs = probabilities(market);
    const title = `${market.question} — ${formatPct(probs[0] ?? 0)} Yes | Soko`;
    const description = `${formatKsh(totalPool(market), { compact: true })} in the pool, ${market.forecasters.toLocaleString("en-KE")} forecasters. ${market.resolutionCriteria}`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: market.question },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/market/${params.marketId}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/market/${params.marketId}` }],
    };
  },
  component: MarketDetail,
  errorComponent: () => (
    <AppShell>
      <p className="py-20 text-center text-sm text-muted-foreground">This market didn&apos;t load. Try again.</p>
    </AppShell>
  ),
  notFoundComponent: () => (
    <AppShell>
      <div className="py-20 text-center">
        <h1 className="font-display text-2xl">Market not found</h1>
        <Link to="/" className="mt-3 inline-block text-sm font-semibold text-primary">
          Back to markets
        </Link>
      </div>
    </AppShell>
  ),
});

const RANGES = [
  ["1D", 4],
  ["1W", 12],
  ["1M", 28],
  ["All", 40],
] as const;

function MarketDetail() {
  const { market } = Route.useLoaderData();
  const [range, setRange] = useState<(typeof RANGES)[number][0]>("1W");
  const [outcomeId, setOutcomeId] = useState(market.outcomes[0]!.id);
  const [stake, setStake] = useState(200);

  const probs = probabilities(market);
  const pool = totalPool(market);
  const delta = trendDelta(market);
  const cat = categoryOf(market.category);
  const creator = people.find((p) => p.handle === market.creator);
  const selected = market.outcomes.find((o) => o.id === outcomeId)!;
  const selectedIndex = market.outcomes.findIndex((o) => o.id === outcomeId);

  const quote = useMemo(
    () =>
      quotePayout({
        stake,
        outcomePool: selected.pool,
        totalPool: pool,
        platformFeeBps: market.platformFeeBps,
        creatorFeeBps: market.creatorFeeBps,
      }),
    [stake, selected.pool, pool, market.platformFeeBps, market.creatorFeeBps],
  );

  const points = RANGES.find(([r]) => r === range)?.[1] ?? 40;
  const chartData = market.history.slice(-points).map((h) => ({
    t: new Date(h.t).toLocaleDateString("en-KE", { month: "short", day: "numeric" }),
    yes: Math.round((h.values[0] ?? 0) * 100),
    no: Math.round((h.values[1] ?? 0) * 100),
  }));

  const related = markets.filter((m) => m.category === market.category && m.id !== market.id).slice(0, 3);
  const closed = market.status !== "open";

  return (
    <AppShell>
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Markets
        </Link>
        <span>/</span>
        <span className={toneText[cat.tone]}>{cat.label}</span>
      </nav>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          <header className="rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <MarketThumb market={market} size="lg" />
              <div className="min-w-0">
                <h1 className="text-lg leading-snug font-semibold text-foreground sm:text-2xl">{market.question}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[0.7rem]">
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", toneSoft[cat.tone])}>{cat.label}</span>
                  <span className="flex items-center gap-1 text-muted-foreground tabular">
                    <Clock className="size-3" /> {timeLeft(market.closesAt)}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground tabular">
                    <Users className="size-3" /> {market.forecasters.toLocaleString("en-KE")} forecasters
                  </span>
                  <StatusPill status={market.status} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div>
                <p className="text-[0.68rem] text-muted-foreground">Pool</p>
                <p className="font-display text-xl tabular">{formatKsh(pool, { compact: true })}</p>
              </div>
              <div>
                <p className="text-[0.68rem] text-muted-foreground">{market.outcomes[0]!.label} implied</p>
                <p className="font-display text-xl tabular text-yes">{formatPct(probs[0] ?? 0, 1)}</p>
              </div>
              <div>
                <p className="text-[0.68rem] text-muted-foreground">24h move</p>
                <p
                  className={cn(
                    "flex items-center gap-1 font-display text-xl tabular",
                    delta >= 0 ? "text-yes" : "text-no",
                  )}
                >
                  {delta >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                  {Math.abs(delta * 100).toFixed(1)}
                </p>
              </div>
            </div>

            <div className="mt-4 flex h-2 overflow-hidden rounded-full">
              {market.outcomes.map((o, i) => (
                <span
                  key={o.id}
                  className={o.tone === "yes" ? "bg-yes" : "bg-no"}
                  style={{ width: `${(probs[i] ?? 0) * 100}%` }}
                />
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[0.7rem] text-muted-foreground tabular">
              {market.outcomes.map((o, i) => (
                <span key={o.id}>
                  {o.label} · {formatKsh(o.pool, { compact: true })} ({formatPct(probs[i] ?? 0)})
                </span>
              ))}
            </div>
          </header>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold">Odds trend</h2>
              <div className="flex gap-1 rounded-lg bg-secondary p-0.5">
                {RANGES.map(([r]) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRange(r)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-[0.7rem] font-semibold transition-colors",
                      range === r ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-3 h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="yesFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--yes)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--yes)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} minTickGap={24} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} width={34} unit="%" />
                  <ReTooltip
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                    }}
                    formatter={(v) => [`${v}%`, "Yes"]}
                  />
                  <Area type="monotone" dataKey="yes" stroke="var(--yes)" strokeWidth={2} fill="url(#yesFill)" />
                  <Area type="monotone" dataKey="no" stroke="var(--no)" strokeWidth={1} fillOpacity={0} strokeDasharray="3 3" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck className="size-4 text-primary" /> Resolution criteria
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{market.resolutionCriteria}</p>
            <p className="mt-3 text-xs text-muted-foreground">
              Sources: {market.sources.join(" · ")}
            </p>
            <div className={cn("mt-3 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed", toneSoft["teal"])}>
              <Bot className="mt-0.5 size-4 shrink-0" />
              <span>
                <strong className="font-semibold">
                  AI review · {market.aiReview.verdict === "fixed" ? "approved with edits" : market.aiReview.verdict}
                </strong>
                <br />
                {market.aiReview.note}
              </span>
            </div>
            {market.resolved && (
              <div className={cn("mt-3 flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed", toneSoft["yes"])}>
                <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                <span>
                  <strong className="font-semibold">
                    Resolved {market.outcomes.find((o) => o.id === market.resolved!.outcomeId)?.label}
                  </strong>
                  <br />
                  {market.resolved.rationale}
                </span>
              </div>
            )}
            {market.status === "disputed" && (
              <Link
                to="/disputes"
                className="mt-3 flex items-center gap-2 rounded-xl bg-amber-soft p-3 text-xs font-semibold text-amber"
              >
                <Gavel className="size-4" /> A dispute is under review on this resolution — see the case file
              </Link>
            )}
          </section>

          <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold">Created by</h2>
            {creator && (
              <Link
                to="/profile/$handle"
                params={{ handle: creator.handle }}
                className="mt-3 flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent"
              >
                <span className={cn("grid size-10 place-items-center rounded-full font-display", toneSoft[creator.tone])}>
                  {creator.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{creator.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">
                    {formatPct(creator.accuracy)} accuracy · {creator.forecasts} forecasts
                  </span>
                </span>
                <span className="shrink-0 text-right text-xs text-muted-foreground tabular">
                  <span className="block">Seeded {formatKsh(market.seedLiquidity, { compact: true })}</span>
                  <span className="block">Commission {(market.creatorFeeBps / 100).toFixed(1)}%</span>
                </span>
              </Link>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold">More in {cat.label}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {related.map((m) => (
                <MarketCard key={m.id} market={m} />
              ))}
            </div>
          </section>
        </div>

        {/* Stake panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold">Place a forecast</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your stake joins the {selected.label.toLowerCase()} pool. Payout depends on the final pool split.
            </p>

            <div className="mt-3 grid grid-cols-2 gap-2">
              {market.outcomes.map((o, i) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => setOutcomeId(o.id)}
                  className={cn(
                    "rounded-xl border py-2.5 text-sm font-semibold transition-colors",
                    outcomeId === o.id
                      ? o.tone === "yes"
                        ? "border-yes bg-yes text-primary-foreground"
                        : "border-no bg-no text-primary-foreground"
                      : cn("border-transparent", toneSoft[o.tone]),
                  )}
                >
                  {o.label}
                  <span className="block text-[0.7rem] font-medium opacity-90 tabular">{formatPct(probs[i] ?? 0)}</span>
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="stake">
              Stake (KSh)
            </label>
            <input
              id="stake"
              type="number"
              min={20}
              step={20}
              value={stake}
              onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-2.5 font-display text-lg tabular outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex gap-1.5">
              {[100, 200, 500, 1000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setStake(v)}
                  className="flex-1 rounded-lg bg-secondary py-1.5 text-[0.7rem] font-semibold text-secondary-foreground transition-colors hover:bg-accent tabular"
                >
                  {v}
                </button>
              ))}
            </div>

            <dl className="mt-4 space-y-2 rounded-xl bg-secondary/60 p-3 text-xs">
              <Row label="Implied probability after" value={formatPct(quote.probabilityAfter, 1)} />
              <Row label="If correct, you receive" value={formatKsh(quote.payout)} strong />
              <Row label="Net profit" value={formatKsh(quote.profit)} tone="yes" />
              <Row label="Return multiple" value={`${quote.multiple.toFixed(2)}×`} />
              <Row
                label="Fees on the losing pool"
                value={`${((market.platformFeeBps + market.creatorFeeBps) / 100).toFixed(1)}%`}
              />
            </dl>

            <button
              type="button"
              disabled={closed || stake <= 0}
              onClick={() =>
                toast.success(`Forecast placed · ${formatKsh(stake)} on ${selected.label}`, {
                  description: `Estimated return ${formatKsh(quote.payout)} if correct. Pools move, so the final split may differ.`,
                })
              }
              className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
            >
              {closed ? "Market closed" : `Forecast ${selected.label} · ${formatKsh(stake)}`}
            </button>
            <p className="mt-2 flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3 shrink-0" />
              Parimutuel: no fixed odds and no bookmaker. Your return depends on how the pool splits when the market
              resolves.
            </p>
            <button
              type="button"
              onClick={() => toast.success("Share link copied", { description: "Every share deepens the pool." })}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold transition-colors hover:bg-accent"
            >
              <Share2 className="size-3.5" /> Share this market
            </button>
          </div>

          <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-card">
            <h3 className="text-sm font-semibold">Top forecasters here</h3>
            <ul className="mt-2 space-y-2">
              {people.slice(0, 4).map((p, i) => (
                <li key={p.handle} className="flex items-center gap-2 text-xs">
                  <span className="w-3 text-muted-foreground tabular">{i + 1}</span>
                  <span className={cn("grid size-7 place-items-center rounded-full font-display text-[0.62rem]", toneSoft[p.tone])}>
                    {p.initials}
                  </span>
                  <Link
                    to="/profile/$handle"
                    params={{ handle: p.handle }}
                    className="min-w-0 flex-1 truncate font-medium hover:text-primary"
                  >
                    {p.name}
                  </Link>
                  <span className="tabular text-muted-foreground">{formatPct(p.accuracy)}</span>
                  <span className={cn("tabular font-semibold", (selectedIndex === 0 ? "text-yes" : "text-no"))}>
                    {formatKsh(p.returns / 40, { compact: true })}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Row({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "yes" }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "tabular",
          strong && "font-display text-base",
          tone === "yes" ? "text-yes font-semibold" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Open", cls: toneSoft["yes"] },
    in_review: { label: "In AI review", cls: toneSoft["amber"] },
    resolved: { label: "Resolved", cls: toneSoft["primary"] },
    disputed: { label: "Disputed", cls: toneSoft["no"] },
  };
  const s = map[status] ?? map["open"]!;
  return <span className={cn("rounded-full px-2 py-0.5 font-semibold", s.cls)}>{s.label}</span>;
}
