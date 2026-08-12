import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownToLine, Plus, Search, Wallet, X, Zap } from "lucide-react";

import { MarketThumb } from "./market-thumb";
import { markets, totalPool } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [100, 500, 1_000, 2_500];

/**
 * Thumb-reach floating cluster on the right edge: a large search puck for
 * finding markets instantly, plus a quick M-Pesa top-up sheet.
 */
export function QuickActions() {
  const [open, setOpen] = useState<null | "search" | "topup">(null);
  const [q, setQ] = useState("");

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const pool = markets.filter((m) => m.status === "open");
    const list = term
      ? pool.filter((m) => `${m.question} ${m.shortTitle} ${m.category}`.toLowerCase().includes(term))
      : [...pool].sort((a, b) => totalPool(b) - totalPool(a));
    return list.slice(0, 7);
  }, [q]);

  return (
    <>
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2.5 lg:bottom-8">
        <button
          type="button"
          onClick={() => setOpen("topup")}
          aria-label="Quick M-Pesa top up"
          className="flex items-center gap-1.5 rounded-full bg-yes px-3.5 py-2.5 text-xs font-bold text-primary-foreground bevel-raised press"
        >
          <Plus className="size-4" /> Top up
        </button>
        <button
          type="button"
          onClick={() => setOpen("search")}
          aria-label="Search markets"
          className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground bevel-raised press"
        >
          <Search className="size-7" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center bg-background/70 p-3 backdrop-blur-md sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-card bevel-raised">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl leading-tight">
                {open === "search" ? "Find a market" : "Quick top up"}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4.5" />
              </button>
            </div>

            {open === "search" ? (
              <>
                <label className="mt-3 flex items-center gap-2.5 rounded-2xl border border-border bg-background px-3 py-3">
                  <Search className="size-5 text-muted-foreground" />
                  <input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Politics, Harambee Stars, BTC…"
                    className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
                  />
                </label>
                <ul className="mt-2 max-h-[55vh] space-y-1 overflow-y-auto">
                  {results.map((m) => (
                    <li key={m.id}>
                      <Link
                        to="/market/$marketId"
                        params={{ marketId: m.id }}
                        onClick={() => setOpen(null)}
                        className="flex items-center gap-3 rounded-2xl p-2 press hover:bg-accent/40"
                      >
                        <MarketThumb market={m} className="size-11 shrink-0" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{m.shortTitle}</span>
                          <span className="block text-xs text-muted-foreground tabular">
                            Pool {formatKsh(totalPool(m), { compact: true })} · {m.forecasters} forecasters
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                  {results.length === 0 && (
                    <li className="py-8 text-center text-sm text-muted-foreground">No open market matches that.</li>
                  )}
                </ul>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <ActionLink to="/wallet" label="Wallet" icon={Wallet} onDone={() => setOpen(null)} />
                  <ActionLink to="/portfolio" label="Portfolio" icon={Zap} onDone={() => setOpen(null)} />
                </div>
              </>
            ) : (
              <TopUp onDone={() => setOpen(null)} />
            )}
          </div>
        </div>
      )}
    </>
  );
}

function ActionLink({
  to,
  label,
  icon: Icon,
  onDone,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onDone: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onDone}
      className="flex items-center justify-center gap-2 rounded-xl border border-border py-2.5 text-sm font-semibold press hover:bg-accent"
    >
      <Icon className="size-4" /> {label}
    </Link>
  );
}

function TopUp({ onDone }: { onDone: () => void }) {
  const [amount, setAmount] = useState(500);

  return (
    <div className="mt-3">
      <p className="text-sm text-muted-foreground">Choose an amount — we'll send an M-Pesa STK push to your phone.</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {QUICK_AMOUNTS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAmount(a)}
            className={cn(
              "rounded-xl border py-3 font-display text-lg tabular press",
              amount === a ? "border-yes bg-yes-soft text-yes" : "border-border text-foreground hover:bg-accent",
            )}
          >
            {formatKsh(a, { compact: true })}
          </button>
        ))}
      </div>
      <Link
        to="/wallet"
        search={{ topup: true }}
        onClick={onDone}
        className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-yes py-3.5 text-sm font-semibold text-primary-foreground press"
      >
        <ArrowDownToLine className="size-4" /> Top up {formatKsh(amount)}
      </Link>
      <Link
        to="/wallet"
        search={{}}
        onClick={onDone}
        className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold press hover:bg-accent"
      >
        <Wallet className="size-4" /> Withdraw or view ledger
      </Link>
    </div>
  );
}
