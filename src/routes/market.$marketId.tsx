import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  BadgeCheck,
  Bot,
  Clock,
  Gavel,
  Megaphone,
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
import { OddsChart, OutcomePoll } from "@/components/odds-chart";
import { ForecastDock } from "@/components/forecast-dock";
import { toneSoft, toneText } from "@/components/tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, timeLeft } from "@/lib/parimutuel";
import {
  categoryOf,
  marketById,
  markets,
  people,
  positions,
  probabilities,
  totalPool,
  trendDelta,
  type Market,
} from "@/lib/mock-data";

export const Route = createFileRoute("/market/$marketId")({
  loader: ({ params }): { market: Market } => {
    const market = marketById(params.marketId);
    if (!market) throw notFound();
    return { market };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return { meta: [{ title: "Market not found — Polka" }, { name: "robots", content: "noindex" }] };
    }
    const { market } = loaderData;
    const probs = probabilities(market);
    const title = `${market.question} — ${formatPct(probs[0] ?? 0)} ${market.outcomes[0]!.label} | Polka`;
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

const TABS = ["Description", "My position", "My forecasts"] as const;

const SEED_COMMENTS = [
  { who: "amina_k", initials: "AK", tone: "grape" as const, when: "2h ago", text: "Pool is leaning heavy on Yes but the criteria only counts the published statement — careful." },
  { who: "brian_o", initials: "BO", tone: "teal" as const, when: "5h ago", text: "Added a small position on the underdog. Implied looks 6 points too low to me." },
  { who: "wanjiru", initials: "WM", tone: "amber" as const, when: "yesterday", text: "Sources listed are solid. This is the cleanest resolution wording I have seen on Polka." },
];

function MarketDetail() {
  const { market } = Route.useLoaderData() as { market: Market };
  const [tab, setTab] = useState<(typeof TABS)[number]>("Description");
  const [comments, setComments] = useState(SEED_COMMENTS);
  const [draft, setDraft] = useState("");

  const probs = probabilities(market);
  const pool = totalPool(market);
  const delta = trendDelta(market);
  const cat = categoryOf(market.category);
  const creator = people.find((p) => p.handle === market.creator);
  const myPositions = positions.filter((p) => p.marketId === market.id);
  const related = markets.filter((m) => m.category === market.category && m.id !== market.id).slice(0, 3);

  return (
    <AppShell>
      <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Markets
        </Link>
        <span>/</span>
        <span className={toneText[cat.tone]}>{cat.label}</span>
      </nav>

      <div className="grid gap-5 pb-32 lg:grid-cols-[minmax(0,1fr)_360px] lg:pb-0">
        <div className="min-w-0 space-y-4">
          <header className="rounded-2xl bg-card p-4 sm:p-5">
            {isVersus ? (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-4 rounded-2xl bg-secondary/50 px-3 py-4">
                  <VersusSide
                    label={market.sports!.home}
                    thumb={market.versus?.homeThumb}
                    emoji={market.versus?.homeEmoji ?? market.thumbnailEmoji}
                  />
                  <span className="font-display text-sm tracking-widest text-muted-foreground">VS</span>
                  <VersusSide
                    label={market.sports!.away}
                    thumb={market.versus?.awayThumb}
                    emoji={market.versus?.awayEmoji ?? market.thumbnailEmoji}
                    align="right"
                  />
                </div>
                <h1 className="text-xl leading-snug font-semibold text-foreground sm:text-2xl">{market.question}</h1>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={cn("rounded-full px-2 py-0.5 font-semibold", toneSoft[cat.tone])}>
                    {market.sports!.league}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground tabular">
                    <Clock className="size-3.5" /> {timeLeft(market.closesAt)}
                  </span>
                  <span className="flex items-center gap-1 text-muted-foreground tabular">
                    <Users className="size-3.5" /> {formatCount(market.forecasters)} traders
                  </span>
                  <StatusPill status={market.status} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <MarketThumb market={market} size="lg" />
                <div className="min-w-0">
                  <h1 className="text-xl leading-snug font-semibold text-foreground sm:text-2xl">{market.question}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", toneSoft[cat.tone])}>{cat.label}</span>
                    <span className="flex items-center gap-1 text-muted-foreground tabular">
                      <Clock className="size-3.5" /> {timeLeft(market.closesAt)}
                    </span>
                    <span className="flex items-center gap-1 text-muted-foreground tabular">
                      <Users className="size-3.5" /> {formatCount(market.forecasters)} traders
                    </span>
                    <StatusPill status={market.status} />
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 grid grid-cols-3 gap-3">
              <Stat label="Vol" value={formatKsh(pool, { compact: true })} />
              <Stat
                label={`${market.outcomes[0]!.label} implied`}
                value={formatPct(probs[0] ?? 0, 1)}
                className="text-yes"
              />
              <div>
                <p className="text-xs text-muted-foreground">24h move</p>
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

            <div className="mt-4">
              <OutcomePoll market={market} probs={probs} />
            </div>
          </header>

          {/* Share-to-earn */}
          <button
            type="button"
            onClick={() =>
              toast.success("Invite link copied", {
                description: "KSh 500 lands in your wallet once 10 invited forecasters deposit.",
              })
            }
            className="flex w-full items-center gap-3 rounded-2xl bg-grape-soft p-4 text-left bevel press"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-grape/15 text-grape">
              <Megaphone className="size-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm leading-tight font-semibold">
                Share this market to 10 new depositing players and make KSh 500
              </span>
              <span className="block text-xs text-foreground/70">
                Paid as commission once your invited forecasters top up. Track it in Rewards.
              </span>
            </span>
            <Share2 className="size-4 shrink-0 text-grape" />
          </button>

          <OddsChart market={market} />

          {/* Tabs */}
          <section className="rounded-2xl bg-card p-4 bevel">
            <div className="-mx-1 flex gap-1 overflow-x-auto px-1 hide-scrollbar">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={cn(
                    "shrink-0 rounded-xl px-3 py-2 text-sm font-semibold press",
                    tab === t ? "bg-secondary text-foreground bevel" : "text-muted-foreground",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-3 rise-in">
              {tab === "Description" && (
                <div className="space-y-3">
                  <h2 className="flex items-center gap-2 text-sm font-semibold">
                    <ShieldCheck className="size-4 text-primary" /> Resolution criteria
                  </h2>
                  <p className="text-sm leading-relaxed text-muted-foreground">{market.resolutionCriteria}</p>
                  <p className="text-xs text-muted-foreground">Sources: {market.sources.join(" · ")}</p>
                  <div className={cn("flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed", toneSoft["teal"])}>
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
                    <div className={cn("flex items-start gap-2 rounded-xl p-3 text-xs leading-relaxed", toneSoft["yes"])}>
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
                      className="flex items-center gap-2 rounded-xl bg-amber-soft p-3 text-xs font-semibold text-amber"
                    >
                      <Gavel className="size-4" /> A dispute is under review on this resolution — see the case file
                    </Link>
                  )}
                </div>
              )}

              {tab === "Comments" && (
                <div className="space-y-3">
                  <ul className="space-y-2">
                    {comments.map((c, idx) => (
                      <li key={`${c.who}-${idx}`} className="flex gap-2.5 rounded-xl bg-secondary/50 p-3">
                        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full font-display text-[0.7rem]", toneSoft[c.tone])}>
                          {c.initials}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs text-muted-foreground">
                            <span className="font-semibold text-foreground">@{c.who}</span> · {c.when}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed">{c.text}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const text = draft.trim();
                      if (!text) return;
                      setComments((prev) => [
                        { who: "you", initials: "YN", tone: "primary" as const, when: "just now", text },
                        ...prev,
                      ]);
                      setDraft("");
                      toast.success("Comment posted");
                    }}
                    className="flex items-end gap-2"
                  >
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={2}
                      placeholder="Share your read on this market…"
                      className="min-w-0 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                    <button
                      type="submit"
                      className="shrink-0 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground press"
                    >
                      Post
                    </button>
                  </form>
                </div>
              )}

              {tab === "My position" &&
                (myPositions.length ? (
                  <ul className="space-y-2">
                    {myPositions.map((p) => (
                      <li key={p.outcomeId} className="rounded-xl bg-secondary/60 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold">
                            {market.outcomes.find((o) => o.id === p.outcomeId)?.label ?? p.outcomeId}
                          </span>
                          <span className="tabular">{formatKsh(p.stake)}</span>
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground tabular">
                          Entry {formatPct(p.avgProbability)} · status {p.status}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text="No position here yet. Select an outcome below to open your first forecast." />
                ))}

              {tab === "My forecasts" &&
                (myPositions.length ? (
                  <ul className="space-y-2 text-sm">
                    {myPositions.map((p) => (
                      <li
                        key={p.outcomeId}
                        className="flex items-center justify-between gap-2 rounded-xl bg-secondary/60 p-3"
                      >
                        <span className="min-w-0 truncate">
                          {market.outcomes.find((o) => o.id === p.outcomeId)?.label ?? p.outcomeId} ·{" "}
                          <span className="text-muted-foreground">{p.status}</span>
                        </span>
                        <span className="shrink-0 tabular font-semibold">{formatKsh(p.stake)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <Empty text="Your forecast history on this market will show up here." />
                ))}

            </div>
          </section>

          <section className="rounded-2xl bg-card p-4 bevel">
            <h2 className="text-sm font-semibold">Created by</h2>
            {creator && (
              <Link
                to="/profile/$handle"
                params={{ handle: creator.handle }}
                className="mt-3 flex items-center gap-3 rounded-xl p-2 press hover:bg-accent"
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

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <ForecastDock market={market} />

          <div className="mt-3 hidden rounded-2xl bg-card p-4 bevel lg:block">
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
                  <span className="tabular font-semibold text-yes">
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

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("font-display text-xl tabular", className)}>{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-secondary/60 p-4 text-sm text-muted-foreground">{text}</p>;
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
