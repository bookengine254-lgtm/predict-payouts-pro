import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Check,
  Gift,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Smartphone,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { cn } from "@/lib/utils";
import { formatKsh } from "@/lib/parimutuel";
import { currentUser, transactions, type Transaction } from "@/lib/mock-data";
import { AuthGate } from "@/components/auth-gate";
import { MIN_TOPUP, MIN_WITHDRAW, validateTopup, validateWithdraw, withdrawFee } from "@/lib/fees";

export const Route = createFileRoute("/wallet")({
  validateSearch: (search: Record<string, unknown>): { topup?: boolean } =>
    search["topup"] === true || search["topup"] === "true" ? { topup: true } : {},

  head: () => ({
    meta: [
      { title: "Wallet & M-Pesa Top-Up — Polka" },
      {
        name: "description",
        content:
          "Top up instantly with an M-Pesa STK push, track stakes and payouts, and withdraw to the same number you paid from.",
      },
      { property: "og:title", content: "Wallet & M-Pesa — Polka" },
      { property: "og:description", content: "Instant M-Pesa top-ups, transparent payout ledger, KSh 25 withdrawals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WalletPage,
});

type Phase = "idle" | "pushing" | "waiting" | "done";

function WalletPage() {
  const { topup } = Route.useSearch();
  const [amount, setAmount] = useState(1_000);
  const [phone, setPhone] = useState("0712 345 214");
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<"topup" | "withdraw">(topup ? "topup" : "topup");

  const fee = mode === "withdraw" ? withdrawFee(amount) : 0;
  const error = mode === "topup" ? validateTopup(amount) : validateWithdraw(amount, currentUser.balance);

  const shareReceipt = (t: Transaction) => {
    const ref = typeof window !== "undefined" ? `${window.location.origin}/?ref=${encodeURIComponent("polka")}` : "";
    const text = `I just ${t.amount >= 0 ? "received" : "moved"} ${formatKsh(Math.abs(t.amount))} on Polka — ${t.label}. Forecast East Africa and cash out to M-Pesa: ${ref}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  };

  const startPush = () => {
    if (error) return;
    setPhase("pushing");
    window.setTimeout(() => setPhase("waiting"), 900);
    window.setTimeout(() => {
      setPhase("done");
      toast.success(
        mode === "topup" ? `${formatKsh(amount)} added to your wallet` : `${formatKsh(amount)} sent to ${phone}`,
        { description: mode === "topup" ? "Free top-up — no fees." : `M-Pesa fee ${formatKsh(fee)} applied.` },
      );
    }, 3_200);
  };

  return (
    <AppShell>
      <AuthGate feature="your wallet">
      <div>
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          One balance for stakes, payouts and commission. M-Pesa in, M-Pesa out.
        </p>
      </header>

      <div className="mt-5 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-8">
          {/* Balance hero — borderless, a single deep navy field with a soft glow. */}
          <section className="relative overflow-hidden rounded-3xl bg-primary px-5 py-6 text-primary-foreground shadow-lift">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-yes/25 blur-3xl"
            />
            <p className="text-xs opacity-75">Available balance</p>
            <p className="font-display text-[2.75rem] leading-none tabular">{formatKsh(currentUser.balance)}</p>
            <div className="mt-5 grid grid-cols-3 gap-4 text-xs">
              {[
                ["In open pools", formatKsh(currentUser.locked, { compact: true })],
                ["Claimable", "KSh 1.2K"],
                ["Referral earnings", formatKsh(currentUser.referralEarnings, { compact: true })],
              ].map(([label, value]) => (
                <div key={label}>
                  <p className="opacity-65">{label}</p>
                  <p className="font-display text-lg tabular">{value}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-sm font-semibold">Ledger</h2>
            <ul className="mt-2 divide-y divide-border/50 rounded-lg border border-border bg-card px-4">
              {transactions.map((t) => (
                <li key={t.id} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
                  <span
                    className={cn(
                      "grid size-9 shrink-0 place-items-center rounded-full",
                      t.amount >= 0 ? "bg-yes-soft text-yes" : "bg-secondary text-muted-foreground",
                    )}
                  >
                    <KindIcon kind={t.kind} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{t.label}</span>
                    <span className="block truncate text-[0.7rem] text-muted-foreground">
                      {new Date(t.at).toLocaleDateString("en-KE", { month: "short", day: "numeric" })}
                      {t.channel ? ` · ${t.channel}` : ""}
                      {t.status !== "complete" ? ` · ${t.status}` : ""}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "shrink-0 font-display text-base tabular",
                      t.amount >= 0 ? "text-yes" : "text-foreground",
                    )}
                  >
                    {t.amount >= 0 ? "+" : "−"}
                    {formatKsh(Math.abs(t.amount))}
                  </span>
                  {(t.kind === "payout" || t.kind === "withdraw" || t.kind === "referral" || t.kind === "creator_fee") && (
                    <button type="button" onClick={() => shareReceipt(t)} aria-label="Share receipt on WhatsApp" className="col-start-3 justify-self-end text-[0.65rem] font-semibold text-primary hover:underline">Share receipt</button>
                  )}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl bg-card p-5 shadow-card">
            <div className="flex gap-1 rounded-full bg-secondary/70 p-1">
              {(
                [
                  ["topup", "Top up"],
                  ["withdraw", "Withdraw"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setMode(k);
                    setPhase("idle");
                  }}
                  className={cn(
                    "flex-1 rounded-full py-2 text-xs font-semibold transition-colors",
                    mode === k ? "bg-card text-foreground shadow-card" : "text-muted-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <label className="mt-5 block text-xs font-medium text-muted-foreground" htmlFor="amount">
              Amount (KSh)
            </label>
            <input
              id="amount"
              type="number"
              min={50}
              step={50}
              value={amount}
              onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              className="mt-1 w-full rounded-2xl bg-secondary/60 px-4 py-3 font-display text-3xl tabular outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <div className="mt-2 flex gap-1.5">
              {[500, 1_000, 2_500, 5_000].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setAmount(v)}
                  className={cn(
                    "flex-1 rounded-full py-1.5 text-[0.7rem] font-semibold tabular transition-colors",
                    amount === v ? "bg-primary text-primary-foreground" : "bg-secondary/70 hover:bg-accent",
                  )}
                >
                  {v >= 1000 ? `${v / 1000}K` : v}
                </button>
              ))}
            </div>

            <label className="mt-4 block text-xs font-medium text-muted-foreground" htmlFor="phone">
              M-Pesa number
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl bg-secondary/60 px-4 py-3">
              <Phone className="size-4 shrink-0 text-muted-foreground" />
              <input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="min-w-0 flex-1 bg-transparent text-sm tabular outline-none"
              />
            </div>

            <dl className="mt-4 space-y-1.5 rounded-2xl border border-border p-3 text-xs">
              <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="tabular">{formatKsh(amount)}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">M-Pesa fee</dt><dd className={cn("tabular", fee === 0 && "font-semibold text-yes")}>{fee === 0 ? "Free" : formatKsh(fee)}</dd></div>
              <div className="flex justify-between border-t border-border pt-1.5 font-semibold"><dt>{mode === "topup" ? "Added to wallet" : "You receive"}</dt><dd className="tabular">{formatKsh(amount)}</dd></div>
              {mode === "withdraw" && <div className="flex justify-between text-muted-foreground"><dt>Taken from balance</dt><dd className="tabular">{formatKsh(amount + fee)}</dd></div>}
            </dl>
            {error && amount > 0 && <p className="mt-2 text-xs text-no">{error}</p>}

            {phase === "idle" && (
              <button
                type="button"
                disabled={Boolean(error)}
                onClick={startPush}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40 press",
                  mode === "topup" ? "bg-yes" : "bg-primary",
                )}
              >
                <Smartphone className="size-4" />
                {mode === "topup" ? `Top up ${formatKsh(amount)}` : `Withdraw ${formatKsh(amount)}`}
              </button>
            )}

            {(phase === "pushing" || phase === "waiting") && (
              <div className="mt-5 rounded-2xl bg-secondary/60 p-4 text-center float-pop">
                <Loader2 className="mx-auto size-5 animate-spin text-primary" />
                <p className="mt-2 text-sm font-semibold">
                  {phase === "pushing" ? "Sending STK push…" : "Check your phone"}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {phase === "pushing"
                    ? `Requesting ${formatKsh(amount)} from ${phone}`
                    : "Enter your M-Pesa PIN on the prompt to confirm. This closes automatically."}
                </p>
              </div>
            )}

            {phase === "done" && (
              <div className="mt-5 rounded-2xl bg-yes-soft p-4 text-center text-yes float-pop">
                <Check className="mx-auto size-6" />
                <p className="mt-1 font-display text-xl tabular">{formatKsh(amount)}</p>
                <p className="text-xs">{mode === "topup" ? "Added to your wallet" : "Sent to your M-Pesa"}</p>
                <button
                  type="button"
                  onClick={() => setPhase("idle")}
                  className="mt-3 w-full rounded-full bg-yes/15 py-2 text-xs font-semibold"
                >
                  Done
                </button>
              </div>
            )}

            <ul className="mt-5 space-y-1.5 text-[0.7rem] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="size-3 shrink-0 text-yes" /> Top-ups are always free (minimum KSh {MIN_TOPUP}).
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="size-3 shrink-0 text-amber" /> Withdrawals from KSh {MIN_WITHDRAW}; you only pay the M-Pesa fee.
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="size-3 shrink-0 text-yes" /> Withdrawals only go to the number you paid from.
              </li>
            </ul>
          </div>

          <Link
            to="/invite"
            className="mt-4 flex items-center gap-3 rounded-3xl bg-grape-soft p-4 text-grape transition-shadow hover:shadow-lift"
          >
            <Gift className="size-5 shrink-0 tremble" />
            <span className="min-w-0 text-xs leading-relaxed">
              <strong className="block text-sm">KSh 500 per 10 funded invites</strong>
              Your referral bonus lands the moment they stake.
            </span>
          </Link>
        </aside>
      </div>
      </div>
      </AuthGate>
    </AppShell>
  );
}

function KindIcon({ kind }: { kind: Transaction["kind"] }) {
  const cls = "size-4";
  if (kind === "topup") return <ArrowDownLeft className={cls} />;
  if (kind === "withdraw") return <ArrowUpRight className={cls} />;
  if (kind === "payout" || kind === "creator_fee") return <Banknote className={cls} />;
  if (kind === "referral") return <Gift className={cls} />;
  return <Zap className={cls} />;
}
