import { useMemo, useState } from "react";
import { Check, ChevronUp, Clock, Info, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { toneSoft } from "./tone";
import { cn } from "@/lib/utils";
import { formatKsh, formatPct, quotePayout } from "@/lib/parimutuel";
import { NOW, positions, probabilities, totalPool, type Market, type Outcome } from "@/lib/mock-data";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";

const AMOUNTS = [100, 200, 500, 1_000, 2_500];

function untilLabel(iso: string) {
  const ms = Date.parse(iso) - NOW;
  if (ms <= 0) return "any moment now";
  const days = ms / 86_400_000;
  if (days < 1) return `${Math.max(1, Math.round(ms / 3_600_000))} hours`;
  if (days < 45) return `${Math.round(days)} days`;
  return `${Math.round(days / 30)} months`;
}

type Phase = "idle" | "placing" | "placed";

/**
 * Thumb-height dock pinned above the bottom navigation.
 * Tap to open the forecasting panel; once a trade is placed the dock locks into
 * a "waiting for resolution" state with a route back to trading.
 */
export function ForecastDock({ market, initialOutcome }: { market: Market; initialOutcome?: string | undefined }) {
  const { account, openAuth } = useAuth();
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [outcomeId, setOutcomeId] = useState<string | null>(initialOutcome && market.outcomes.some((o) => o.id === initialOutcome) ? initialOutcome : null);
  const [stake, setStake] = useState(200);
  const [placed, setPlaced] = useState<{ outcome: Outcome; stake: number; payout: number } | null>(null);
  const held = account ? positions.find((p) => p.marketId === market.id && p.status === "open") : undefined;
  const locked = Boolean(held && outcomeId && outcomeId !== held.outcomeId);

  const probs = probabilities(market);
  const pool = totalPool(market);
  const selected = market.outcomes.find((o) => o.id === outcomeId) ?? null;
  const closed = market.status !== "open";

  const quote = useMemo(
    () =>
      quotePayout({
        stake,
        outcomePool: selected?.pool ?? market.outcomes[0]!.pool,
        totalPool: pool,
        platformFeeBps: market.platformFeeBps,
        creatorFeeBps: market.creatorFeeBps,
      }),
    [stake, selected, pool, market],
  );

  const trade = () => {
    if (!account) {
      openAuth("signup");
      return;
    }
    if (!selected || locked || stake <= 0 || closed) return;
    setPhase("placing");
    window.setTimeout(() => {
      setPhase("placed");
      setPlaced({ outcome: selected, stake, payout: quote.payout });
      setOpen(false);
      toast.success(`Forecast locked · ${formatKsh(stake)} on ${selected.label}`, {
        description: `Pays ${formatKsh(quote.payout)} if correct. Resolves in ${untilLabel(market.closesAt)}.`,
      });
    }, 900);
  };

  return (
    <>
      {/* ---------- Dock ---------- */}
      <div className="fixed inset-x-0 bottom-[calc(4.25rem+env(safe-area-inset-bottom))] z-40 px-3 lg:hidden">
        {placed ? (
          <div className="rounded-2xl border border-border bg-card px-4 py-3 bevel-raised rise-in">
            <div className="flex items-center gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-yes-soft text-yes">
                <Check className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">
                  Waiting for resolution · {untilLabel(market.closesAt)}
                </p>
                <p className="truncate text-xs text-muted-foreground tabular">
                  {formatKsh(placed.stake)} on {placed.outcome.label} · pays{" "}
                  <span className="font-semibold text-yes">{formatKsh(placed.payout)}</span>
                </p>
              </div>
            </div>
            <Button
              type="button"
              onClick={() => {
                setPlaced(null);
                setPhase("idle");
                setOutcomeId(null);
                setOpen(true);
              }}
              variant="outline" className="mt-2.5 w-full"
            >
              Make another trade
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            onClick={() => setOpen(true)}
            disabled={closed}
            className="flex h-auto w-full items-center justify-between gap-3 rounded-lg bg-yes px-4 py-3.5 text-left text-primary-foreground disabled:opacity-50"
          >
            <span className="min-w-0">
              <span className="block text-base leading-tight font-semibold">
                {closed ? "Market closed" : selected ? `Forecast ${selected.label}` : "Explore outcomes"}
              </span>
              <span className="block truncate text-xs opacity-90 tabular">
                {formatKsh(pool, { compact: true })} pool · closes in {untilLabel(market.closesAt)}
              </span>
            </span>
            <ChevronUp className="size-5 shrink-0" />
          </Button>
        )}
      </div>

      {/* Desktop: the same panel, docked in the sidebar column. */}
      <div className="hidden lg:block">
        <Panel
          market={market}
          probs={probs}
          outcomeId={outcomeId}
          setOutcomeId={setOutcomeId}
          stake={stake}
          setStake={setStake}
          quote={quote}
          phase={phase}
          placed={placed}
          onTrade={trade}
          requireAuth={() => openAuth("signup")}
          authenticated={Boolean(account)}
          heldOutcomeId={held?.outcomeId}
          locked={locked}
          onReset={() => {
            setPlaced(null);
            setPhase("idle");
            setOutcomeId(null);
          }}
        />
      </div>

      {/* ---------- Mobile sheet ---------- */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <Button
            type="button"
            aria-label="Close forecasting panel"
            onClick={() => setOpen(false)}
            className="absolute inset-0 h-full w-full rounded-none bg-background/70 backdrop-blur-sm hover:bg-background/70"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-3xl border-t border-border bg-card p-4 pb-8 bevel-raised sheet-up">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg leading-tight font-semibold">Place your forecast</h2>
                <p className="truncate text-xs text-muted-foreground">{market.shortTitle}</p>
              </div>
              <Button
                type="button"
                onClick={() => setOpen(false)}
                variant="secondary" size="icon" className="shrink-0 rounded-full"
                aria-label="Close"
              >
                <X className="size-4" />
              </Button>
            </div>
            <Panel
              market={market}
              probs={probs}
              outcomeId={outcomeId}
              setOutcomeId={setOutcomeId}
              stake={stake}
              setStake={setStake}
              quote={quote}
              phase={phase}
              placed={placed}
              onTrade={trade}
              requireAuth={() => openAuth("signup")}
              authenticated={Boolean(account)}
              heldOutcomeId={held?.outcomeId}
              locked={locked}
              onReset={() => {
                setPlaced(null);
                setPhase("idle");
                setOutcomeId(null);
              }}
              bare
            />
          </div>
        </div>
      )}
    </>
  );
}

function Panel({
  market,
  probs,
  outcomeId,
  setOutcomeId,
  stake,
  setStake,
  quote,
  phase,
  placed,
  onTrade,
  onReset,
  requireAuth,
  authenticated,
  heldOutcomeId,
  locked,
  bare = false,
}: {
  market: Market;
  probs: number[];
  outcomeId: string | null;
  setOutcomeId: (id: string) => void;
  stake: number;
  setStake: (v: number) => void;
  quote: ReturnType<typeof quotePayout>;
  phase: Phase;
  placed: { outcome: Outcome; stake: number; payout: number } | null;
  onTrade: () => void;
  onReset: () => void;
  requireAuth: () => void;
  authenticated: boolean;
  heldOutcomeId?: string | undefined;
  locked: boolean;
  bare?: boolean;
}) {
  const selected = market.outcomes.find((o) => o.id === outcomeId) ?? null;
  const closed = market.status !== "open";

  return (
    <div className={cn(!bare && "rounded-2xl border border-border bg-card p-4 bevel")}>
      {!bare && <h2 className="text-base font-semibold">Explore this forecast</h2>}

      {placed ? (
        <div className="space-y-3">
          <div className="rounded-2xl bg-yes-soft p-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest opacity-80">Locked in</p>
            <p className="mt-1 font-display text-3xl tabular text-yes">{formatKsh(placed.payout)}</p>
            <p className="mt-1 text-xs">
              if <strong>{placed.outcome.label}</strong> resolves correct
            </p>
          </div>
          <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-muted-foreground">
            <Clock className="size-4" /> Waiting for resolution · {untilLabel(market.closesAt)}
          </p>
          <Button
            type="button"
            onClick={onReset}
            variant="outline" className="w-full"
          >
            Make another trade
          </Button>
        </div>
      ) : (
        <>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {market.outcomes.map((o, i) => {
              const active = outcomeId === o.id;
              return (
                <Button
                  key={o.id}
                  type="button"
                  onClick={() => setOutcomeId(o.id)}
                  variant="outline"
                  disabled={Boolean(heldOutcomeId && heldOutcomeId !== o.id)}
                  className={cn(
                    "h-auto min-h-11 justify-between gap-2 rounded-lg px-3 py-2 text-left",
                    active ? toneSoft[o.tone] : "border-border hover:bg-accent",
                  )}
                >
                  <span className="min-w-0 truncate text-base font-semibold">{o.label}</span>
                  <span className="shrink-0 font-display text-lg tabular">{formatPct(probs[i] ?? 0)}</span>
                </Button>
              );
            })}
          </div>
          {heldOutcomeId && <p className="mt-3 rounded-md bg-secondary p-3 text-xs leading-relaxed text-muted-foreground">You already hold {market.outcomes.find((o) => o.id === heldOutcomeId)?.label}. You can only add to this position, not take another side in this market.</p>}

          <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="dock-stake">
            Stake (KSh)
          </label>
          <input
            id="dock-stake"
            type="number"
            min={20}
            step={20}
            value={stake}
            onChange={(e) => setStake(Math.max(0, Number(e.target.value)))}
            className="mt-1 w-full rounded-xl border border-input bg-background px-3 py-3 font-display text-2xl tabular outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="mt-2 flex gap-1.5">
            {AMOUNTS.map((v) => (
              <Button
                key={v}
                type="button"
                onClick={() => setStake(v)}
                variant="secondary" size="sm" className="min-w-0 flex-1 px-1 text-xs tabular"
              >
                {v >= 1000 ? `${v / 1000}K` : v}
              </Button>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
            <p className="text-xs font-medium text-muted-foreground">If you're right, you receive</p>
            <p className="font-display text-4xl leading-none tabular text-yes">{formatKsh(quote.payout)}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
              <Mini label="Profit" value={formatKsh(quote.profit)} accent />
              <Mini label="Return" value={`${quote.multiple.toFixed(2)}×`} />
              <Mini label="Implied after" value={formatPct(quote.probabilityAfter, 1)} />
            </div>
          </div>

          <Button
            type="button"
            disabled={!selected || closed || stake <= 0 || phase === "placing" || locked}
            onClick={authenticated ? onTrade : requireAuth}
            className="mt-4 h-auto min-h-12 w-full whitespace-normal bg-yes py-3 text-center text-sm font-semibold text-primary-foreground hover:bg-yes/90"
          >
            {phase === "placing" ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Placing…
              </>
            ) : locked ? (
              `Position locked on ${market.outcomes.find((o) => o.id === heldOutcomeId)?.label}`
            ) : selected ? (
              authenticated ? `${heldOutcomeId ? "Add to your position" : "Confirm forecast"} · ${formatKsh(stake)}` : `Sign up to forecast · Pays ${formatKsh(quote.payout)}`
            ) : (
              authenticated ? "Select an outcome" : "Sign up to forecast"
            )}
          </Button>
          <p className="mt-2 flex items-start gap-1.5 text-[0.72rem] leading-relaxed text-muted-foreground">
            <Info className="mt-0.5 size-3.5 shrink-0" />
            Parimutuel: no fixed odds, no bookmaker. Your return depends on how the pool splits at resolution.
          </p>
        </>
      )}
    </div>
  );
}

function Mini({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-card px-2 py-2 bevel">
      <p className="text-[0.68rem] text-muted-foreground">{label}</p>
      <p className={cn("font-display text-base tabular", accent && "text-yes")}>{value}</p>
    </div>
  );
}
