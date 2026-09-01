import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowDownToLine, Plus, Wallet, X } from "lucide-react";

import { formatKsh } from "@/lib/parimutuel";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = [100, 500, 1_000, 2_500];

/**
 * Two thumb-reach actions only, and only on the markets feed on small screens:
 * a quick M-Pesa top-up and the create-market plus button.
 */
export function QuickActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  if (pathname !== "/") return null;

  return (
    <>
      <div className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-end gap-2.5 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Quick M-Pesa top up"
          className="flex items-center gap-1.5 rounded-full bg-yes px-3.5 py-2.5 text-xs font-bold text-primary-foreground bevel-raised press"
        >
          <Plus className="size-4" /> Top up
        </button>
        <Link
          to="/create"
          aria-label="Create a market"
          className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground bevel-raised press"
        >
          <Plus className="size-7" />
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-[65] flex items-end justify-center bg-background/70 p-3 backdrop-blur-md sm:items-center">
          <div className="w-full max-w-md rounded-3xl border border-border bg-card p-4 shadow-card bevel-raised">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl leading-tight">Quick top up</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="size-4.5" />
              </button>
            </div>
            <TopUp onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
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
