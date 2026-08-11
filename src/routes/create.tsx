import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Bot,
  Check,
  ImagePlus,
  Info,
  Plus,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { formatKsh } from "@/lib/parimutuel";
import { categories, type CategoryId } from "@/lib/mock-data";

export const Route = createFileRoute("/create")({
  head: () => ({
    meta: [
      { title: "Create a Market — Polka" },
      {
        name: "description",
        content:
          "Write a question, seed the pool, set your commission and let AI review it. Creators earn on every forecast their market attracts.",
      },
      { property: "og:title", content: "Create a market and earn commission — Polka" },
      {
        property: "og:description",
        content: "Seed liquidity, set your commission, share widely. AI reviews every market before it goes live.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreateMarket,
});

type Kind = "binary" | "multi" | "sports";

const STEPS = ["Question", "Outcomes", "Seed & commission", "AI review", "Share"] as const;

function CreateMarket() {
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<Kind>("binary");
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState<CategoryId>("politics");
  const [criteria, setCriteria] = useState("");
  const [emoji, setEmoji] = useState("📈");
  const [thumb, setThumb] = useState<string | null>(null);

  const [choices, setChoices] = useState(["", "", ""]);
  const [home, setHome] = useState("");
  const [away, setAway] = useState("");
  const [league, setLeague] = useState("KPL");
  const [seed, setSeed] = useState(20_000);
  /** The creator's opening stake sits on one side; the rest balances the book at 50/50. */
  const [openingStake, setOpeningStake] = useState(2_000);
  const [openingSide, setOpeningSide] = useState(0);
  const [commission, setCommission] = useState(1.2);
  const [aiFix, setAiFix] = useState(true);
  const [priority, setPriority] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const [published, setPublished] = useState(false);
  const [cardGenerating, setCardGenerating] = useState(false);
  const [cardReady, setCardReady] = useState(false);

  const outcomes = useMemo(() => {
    if (kind === "binary") return ["Yes", "No"];
    if (kind === "sports") return [home || "Home", "Draw", away || "Away"];
    return choices.filter((c) => c.trim().length > 0);
  }, [kind, choices, home, away]);

  const fees = (aiFix ? 150 : 0) + (priority ? 250 : 0);
  const canAdvance =
    step === 0
      ? question.trim().length > 12 && criteria.trim().length > 20
      : step === 1
        ? outcomes.length >= 2
        : step === 3
          ? published
          : true;

  const shareLink = `https://polka.co.ke/m/new?ref=you`;
  const shareText = `${question || "New market on Polka"} — forecast it on Polka, payouts straight to M-Pesa.`;


  return (
    <AppShell>
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 sm:flex sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold sm:text-2xl">Create a market</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            You seed the pool, you set your commission, you keep earning as forecasters arrive.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-yes-soft px-3 py-1.5 text-xs font-semibold text-yes">
          Earn {commission.toFixed(1)}%
        </span>
      </header>

      <ol className="mt-5 grid grid-cols-4 gap-1.5">
        {STEPS.map((s, i) => (
          <li key={s}>
            <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-secondary")} />
            <p className={cn("mt-1.5 truncate text-[0.65rem]", i <= step ? "text-primary" : "text-muted-foreground")}>
              {s}
            </p>
          </li>
        ))}
      </ol>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          {step === 0 && (
            <Card title="What are people forecasting?">
              <Field label="Question">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={2}
                  placeholder="Will the CBK hold the base rate at its next MPC meeting?"
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>

              <Field label="Category">
                <div className="flex flex-wrap gap-1.5">
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        category === c.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="Resolution criteria">
                <textarea
                  value={criteria}
                  onChange={(e) => setCriteria(e.target.value)}
                  rows={3}
                  placeholder="Resolves Yes if the published MPC statement leaves the Central Bank Rate unchanged. Source: CBK MPC statement."
                  className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </Field>

              <Field label="Thumbnail">
                <div className="flex items-center gap-3">
                  <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl border border-border bg-secondary text-2xl">
                    {thumb ? <img src={thumb} alt="" className="size-full object-cover" /> : emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-xs font-semibold press hover:bg-accent">
                      <ImagePlus className="size-3.5" /> {thumb ? "Replace image" : "Upload image"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const url = URL.createObjectURL(file);
                          setThumb(url);
                          toast.success("Thumbnail added", { description: file.name });
                        }}
                      />
                    </label>
                    {thumb && (
                      <button
                        type="button"
                        onClick={() => setThumb(null)}
                        className="ml-2 text-xs font-semibold text-no"
                      >
                        Remove
                      </button>
                    )}

                    <div className="mt-2 flex flex-wrap gap-1">
                      {["📈", "⚽", "🏛️", "₿", "🌧️", "🎤", "📡", "🏟️"].map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setEmoji(e)}
                          className={cn(
                            "grid size-8 place-items-center rounded-lg border text-base",
                            emoji === e ? "border-primary bg-primary-soft" : "border-border",
                          )}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Field>
            </Card>
          )}

          {step === 1 && (
            <Card title="Outcome structure">
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    ["binary", "Yes / No", "Two-sided question"],
                    ["multi", "Multi-outcome", "3 to 8 runners"],
                    ["sports", "Sports fixture", "Home / Draw / Away"],
                  ] as const
                ).map(([k, label, hint]) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setKind(k)}
                    className={cn(
                      "rounded-xl border p-3 text-left transition-colors",
                      kind === k ? "border-primary bg-primary-soft" : "border-border hover:bg-accent",
                    )}
                  >
                    <span className="block text-sm font-semibold">{label}</span>
                    <span className="mt-0.5 block text-[0.7rem] text-muted-foreground">{hint}</span>
                  </button>
                ))}
              </div>

              {kind === "binary" && (
                <p className="mt-4 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
                  Two pools: Yes and No. The losing pool is split pro-rata among correct forecasters after fees.
                </p>
              )}

              {kind === "multi" && (
                <div className="mt-4 space-y-2">
                  {choices.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={c}
                        onChange={(e) => setChoices(choices.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder={`Outcome ${i + 1}`}
                        className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <button
                        type="button"
                        onClick={() => setChoices(choices.filter((_, j) => j !== i))}
                        className="grid size-9 shrink-0 place-items-center rounded-xl border border-border text-muted-foreground hover:text-no"
                        aria-label={`Remove outcome ${i + 1}`}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                  {choices.length < 8 && (
                    <button
                      type="button"
                      onClick={() => setChoices([...choices, ""])}
                      className="flex items-center gap-1.5 rounded-xl border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                    >
                      <Plus className="size-3.5" /> Add outcome
                    </button>
                  )}
                  <p className="rounded-xl bg-amber-soft p-3 text-[0.7rem] leading-relaxed text-amber">
                    Multi-outcome markets must be exhaustive. AI review will add a “Field” or “Someone else” runner if
                    yours can end with none of the listed outcomes.
                  </p>
                </div>
              )}

              {kind === "sports" && (
                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <input
                    value={home}
                    onChange={(e) => setHome(e.target.value)}
                    placeholder="Home side"
                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <input
                    value={away}
                    onChange={(e) => setAway(e.target.value)}
                    placeholder="Away side"
                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <input
                    value={league}
                    onChange={(e) => setLeague(e.target.value)}
                    placeholder="League"
                    className="rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
              )}
            </Card>
          )}

          {step === 2 && (
            <Card title="Seed the pool and set your cut">
              <Field label="Seed liquidity (KSh)">
                <input
                  type="number"
                  min={5_000}
                  step={1_000}
                  value={seed}
                  onChange={(e) => setSeed(Math.max(0, Number(e.target.value)))}
                  className="w-full rounded-xl border border-input bg-background px-3 py-2.5 font-display text-lg tabular outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <div className="mt-2 flex gap-1.5">
                  {[5_000, 10_000, 20_000, 50_000].map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setSeed(v)}
                      className="flex-1 rounded-lg bg-secondary py-1.5 text-[0.7rem] font-semibold tabular transition-colors hover:bg-accent"
                    >
                      {v / 1000}K
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={`Your commission · ${commission.toFixed(1)}% of the losing pool`}>
                <input
                  type="range"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={commission}
                  onChange={(e) => setCommission(Number(e.target.value))}
                  className="w-full accent-[var(--primary)]"
                />
                <p className="mt-1 text-[0.7rem] text-muted-foreground">
                  Lower commission attracts deeper pools. Higher commission earns more per resolution.
                </p>
              </Field>

              <div className="rounded-xl bg-yes-soft p-3 text-xs leading-relaxed text-yes">
                On a KSh 400K pool with a 55/45 split, a {commission.toFixed(1)}% commission pays you about{" "}
                <strong className="tabular">{formatKsh(400_000 * 0.45 * (commission / 100))}</strong> at resolution.
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card title="AI review">
              <div className="space-y-2">
                <Toggle
                  checked={aiFix}
                  onChange={setAiFix}
                  title="Let AI fix ambiguous wording"
                  hint="KSh 150 · rewrites the question and criteria so it can resolve cleanly"
                />
                <Toggle
                  checked={priority}
                  onChange={setPriority}
                  title="Priority review"
                  hint="KSh 250 · front of the queue, usually under 5 minutes"
                />
              </div>

              {!reviewed ? (
                <button
                  type="button"
                  onClick={() => {
                    setReviewed(true);
                    toast.success("AI review complete", {
                      description: aiFix
                        ? "Criteria tightened and a source added. Ready to publish."
                        : "Approved as written. Ready to publish.",
                    });
                  }}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <Wand2 className="size-4" /> Run AI review {fees > 0 && `· ${formatKsh(fees)}`}
                </button>
              ) : (
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-2 rounded-xl bg-teal-soft p-3 text-xs leading-relaxed text-teal">
                    <Bot className="mt-0.5 size-4 shrink-0" />
                    <span>
                      <strong className="font-semibold">Approved {aiFix ? "with edits" : "as written"}</strong>
                      <br />
                      {aiFix
                        ? "Bound the question to a dated, publicly verifiable source and made the outcome set exhaustive."
                        : "Wording is dated, objective and verifiable. No edits needed."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setPublished(true);
                      setStep(4);
                      toast.success("Market published", {
                        description: `Opened at 50/50 with ${formatKsh(openingStake)} on ${outcomes[openingSide] ?? "your pick"}. Share it to fill the pool.`,
                      });
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-yes py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                  >
                    <Check className="size-4" /> Publish · seed {formatKsh(seed)}
                  </button>
                </div>
              )}
            </Card>
          )}

          {step === 4 && (
            <Card title="Share it and fill the pool">
              <p className="text-xs leading-relaxed text-muted-foreground">
                A market only pays you commission once forecasters arrive. Share the link, or generate a market card
                image with the link baked in.
              </p>

              <div className="grid gap-2 sm:grid-cols-2">
                {(
                  [
                    ["WhatsApp", `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareLink}`)}`, "yes"],
                    ["X / Twitter", `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareLink)}`, "primary"],
                    ["Facebook", `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`, "teal"],
                    ["Telegram", `https://t.me/share/url?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(shareText)}`, "grape"],
                  ] as const
                ).map(([label, href, tone]) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "flex items-center justify-between gap-2 rounded-xl px-3 py-3 text-sm font-semibold press",
                      tone === "yes"
                        ? "bg-yes-soft text-yes"
                        : tone === "primary"
                          ? "bg-primary-soft text-primary"
                          : tone === "teal"
                            ? "bg-teal-soft text-teal"
                            : "bg-grape-soft text-grape",
                    )}
                  >
                    {label} <Share2 className="size-4" />
                  </a>
                ))}
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 py-2.5">
                <span className="min-w-0 flex-1 truncate text-xs tabular text-muted-foreground">{shareLink}</span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(`${shareText} ${shareLink}`);
                    toast.success("Invite link copied", {
                      description: "KSh 500 lands once 10 invited forecasters deposit.",
                    });
                  }}
                  className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground press"
                >
                  <Copy className="mr-1 inline size-3" /> Copy
                </button>
              </div>

              <div className="rounded-2xl border border-border p-3">
                <p className="text-xs font-semibold">AI market card</p>
                {cardReady ? (
                  <div className="mt-2 overflow-hidden rounded-xl bg-primary p-4 text-primary-foreground bevel rise-in">
                    <p className="text-[0.62rem] tracking-[0.2em] uppercase opacity-80">Polka · forecast this</p>
                    <p className="mt-1.5 line-clamp-3 font-display text-lg leading-snug">
                      {question || "Your market question"}
                    </p>
                    <div className="mt-3 flex gap-1.5">
                      {outcomes.slice(0, 3).map((o) => (
                        <span key={o} className="flex-1 truncate rounded-lg bg-white/15 py-1.5 text-center text-xs font-semibold">
                          {o} 50%
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-[0.68rem] opacity-80 tabular">{shareLink}</p>
                  </div>
                ) : (
                  <div className={cn("mt-2 h-32 rounded-xl bg-secondary/70", cardGenerating && "shimmer")} />
                )}
                <button
                  type="button"
                  disabled={cardGenerating}
                  onClick={() => {
                    setCardGenerating(true);
                    setCardReady(false);
                    window.setTimeout(() => {
                      setCardGenerating(false);
                      setCardReady(true);
                      toast.success("Market card generated", { description: "Link attached. Post it anywhere." });
                    }, 1_400);
                  }}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-xs font-semibold press hover:bg-accent disabled:opacity-50"
                >
                  {cardGenerating ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Wand2 className="size-3.5" /> {cardReady ? "Regenerate card" : "Generate market card image"}
                    </>
                  )}
                </button>
              </div>

              <Link
                to="/"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-yes py-3 text-sm font-semibold text-primary-foreground bevel press"
              >
                Done · view the feed
              </Link>
            </Card>
          )}


          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-accent disabled:opacity-40"
            >
              Back
            </button>
            {step < 4 && (
              <button
                type="button"
                disabled={!canAdvance}
                onClick={() => setStep((s) => Math.min(4, s + 1))}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
              >
                Continue
              </button>
            )}

          </div>
        </div>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
            <h2 className="text-sm font-semibold">Preview</h2>
            <div className="mt-3 rounded-xl border border-border p-3">
              <div className="flex gap-3">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-lg">
                  {emoji}
                </span>
                <p className="line-clamp-3 min-w-0 text-sm font-medium">
                  {question || "Your question appears here as forecasters will see it."}
                </p>
              </div>
              <div className="mt-3 flex gap-1.5">
                {outcomes.slice(0, 2).map((o) => (
                  <span
                    key={o}
                    className="min-w-0 flex-1 truncate rounded-lg bg-secondary py-1.5 text-center text-xs font-semibold"
                  >
                    {o || "Outcome"}
                  </span>
                ))}
                {outcomes.length > 2 && (
                  <span className="shrink-0 rounded-lg bg-secondary px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    +{outcomes.length - 2}
                  </span>
                )}
              </div>
            </div>
            <dl className="mt-4 space-y-2 text-xs">
              <Row label="Seed" value={formatKsh(seed)} />
              <Row label="Your commission" value={`${commission.toFixed(1)}%`} />
              <Row label="Platform fee" value="2.0%" />
              <Row label="AI charges" value={fees ? formatKsh(fees) : "None"} />
            </dl>
            <p className="mt-3 flex items-start gap-1.5 text-[0.68rem] leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-3 shrink-0" />
              Seeding is not a stake. It balances the pools so the first forecasters get a fair price, and it comes back
              to you at resolution.
            </p>
          </div>

          <Link
            to="/invite"
            className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-grape-soft p-4 text-grape transition-shadow hover:shadow-lift"
          >
            <Sparkles className="size-5 shrink-0" />
            <span className="min-w-0 text-xs leading-relaxed">
              <strong className="block text-sm">Share to 10 new depositing players</strong>
              Earn KSh 500 on top of your commission.
            </span>
          </Link>
        </aside>
      </div>
    </AppShell>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={cn(
        "flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-colors",
        checked ? "border-primary bg-primary-soft" : "border-border hover:bg-accent",
      )}
    >
      <span
        className={cn(
          "mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border",
          checked ? "border-primary bg-primary text-primary-foreground" : "border-border",
        )}
      >
        {checked ? <Check className="size-3" /> : <X className="size-3 opacity-30" />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-[0.7rem] text-muted-foreground">{hint}</span>
      </span>
    </button>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="tabular font-medium">{value}</dd>
    </div>
  );
}
