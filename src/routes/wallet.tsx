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

  const startPush = () => {
    setPhase("pushing");
    window.setTimeout(() => setPhase("waiting"), 900);
    window.setTimeout(() => {
      setPhase("done");
      toast.success(
        mode === "topup" ? `${formatKsh(amount)} added to your wallet` : `${formatKsh(amount)} sent to ${phone}`,
        { description: mode === "topup" ? "M-Pesa confirmation NLJ7RT61SV." : "Withdrawal fee KSh 25 applied." },
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

            {phase === "idle" && (
              <button
                type="button"
                disabled={amount <= 0}
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
                <ShieldCheck className="size-3 shrink-0 text-yes" /> Top-ups are free. Withdrawals cost KSh 25.
              </li>
              <li className="flex items-center gap-1.5">
                <Lock className="size-3 shrink-0 text-yes" /> Withdrawals only go to the number you paid from.
              </li>
              <li className="flex items-center gap-1.5">
                <Zap className="size-3 shrink-0 text-amber" /> Instant payout available at 1.0%.
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
