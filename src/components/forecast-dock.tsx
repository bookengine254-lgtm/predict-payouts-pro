import { useMemo, useState } from "react";
import { Clock, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
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
      toast.success(`Forecast locked · ${formatKsh(stake)} on ${selected.label}`, {
        description: `Pays ${formatKsh(quote.payout)} if correct. Resolves in ${untilLabel(market.closesAt)}.`,
      });
    }, 900);
  };

  return (
    <>
      {/* Desktop: the same panel, docked in the sidebar column. */}
      <div>
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
      {!bare && <h2 className="text-base font-semibold">Pick your side</h2>}

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
          <div className={cn("mt-3 grid gap-2.5", market.outcomes.length === 2 ? "grid-cols-2" : "grid-cols-1")}>
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
                    "chunky h-auto min-h-14 justify-between gap-2 rounded-xl border-2 px-4 py-3 text-left",
                    active
                      ? (o.tone === "no" || (market.outcomes.length === 2 && i === 1)) ? "border-no bg-no text-primary-foreground hover:bg-no/90 hover:text-primary-foreground" : "border-yes bg-yes text-primary-foreground hover:bg-yes/90 hover:text-primary-foreground"
                      : (o.tone === "no" || (market.outcomes.length === 2 && i === 1)) ? "border-no/40 text-no hover:bg-no-soft" : "border-yes/40 text-yes hover:bg-yes-soft",
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
