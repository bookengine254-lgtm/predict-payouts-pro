import { useState } from "react";
import { CheckCircle2, Loader2, Plus, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatKsh } from "@/lib/parimutuel";
import { validateTopup } from "@/lib/fees";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

const PRESETS = [100, 250, 500, 1_000, 2_500];

/** Quick M-Pesa deposit: slides up from the bottom on mobile, floats centred on desktop. */
export function QuickTopup({ className, compact }: { className?: string; compact?: boolean }) {
  const { account } = useAuth();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(500);
  const [phone, setPhone] = useState(account?.phone ?? "");
  const [phase, setPhase] = useState<"idle" | "sending" | "done">("idle");
  const error = validateTopup(amount);

  const send = () => {
    if (error || phone.replace(/\D/g, "").length < 9) return;
    setPhase("sending");
    window.setTimeout(() => {
      setPhase("done");
      toast.success(`${formatKsh(amount)} added to your wallet`, { description: "Free top-up — Polka covers the M-Pesa fee." });
      window.setTimeout(() => { setOpen(false); setPhase("idle"); }, 1200);
    }, 1200);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className={cn(compact && "h-7 px-2 text-xs", className)}><Plus /> Top up</Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm max-lg:top-auto max-lg:bottom-0 max-lg:max-w-none max-lg:translate-y-0 max-lg:rounded-b-none max-lg:rounded-t-3xl max-lg:data-[state=open]:slide-in-from-bottom">
        <DialogHeader>
          <DialogTitle>Top up with M-Pesa</DialogTitle>
          <DialogDescription>Free — Polka covers the M-Pesa fee.</DialogDescription>
        </DialogHeader>
        {phase === "done" ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="size-12 text-yes" />
            <p className="font-display text-2xl tabular">{formatKsh(amount)}</p>
            <p className="text-sm text-muted-foreground">Added to your wallet</p>
          </div>
        ) : (
          <div className="space-y-3">
            <input type="number" inputMode="numeric" value={amount} onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
              aria-label="Amount in KSh" className="w-full rounded-xl border border-input bg-background px-3 py-3 font-display text-3xl tabular outline-none focus-visible:ring-2 focus-visible:ring-ring" />
            <div className="flex gap-1.5">
              {PRESETS.map((v) => (
                <Button key={v} type="button" size="sm" variant={amount === v ? "default" : "secondary"} onClick={() => setAmount(v)} className="min-w-0 flex-1 px-1 text-xs tabular">
                  {v >= 1000 ? `${v / 1000}K` : v}
                </Button>
              ))}
            </div>
            <label className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
              <Smartphone className="size-4 text-muted-foreground" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" inputMode="tel" aria-label="M-Pesa number" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
            </label>
            {error && <p className="text-xs text-no">{error}</p>}
            <Button type="button" onClick={send} disabled={Boolean(error) || phase === "sending"} className="chunky-solid h-12 w-full bg-yes text-base font-bold text-primary-foreground hover:bg-yes/90">
              {phase === "sending" ? <><Loader2 className="animate-spin" /> Check your phone…</> : `Send M-Pesa prompt · ${formatKsh(amount)}`}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
