import { useState } from "react";
import { ArrowRight, BellRing, Check, MessageCircle, Phone, Smartphone, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

import { useAuth, WHATSAPP_COMMUNITY_URL } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/** Three-step onboarding for brand-new accounts. Floats above a blurred app. */
export function OnboardingSheet() {
  const { account, onboarding, completeOnboarding } = useAuth();
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(account?.username ?? "");
  const [phone, setPhone] = useState("");
  const [mpesaReady, setMpesaReady] = useState(true);
  const [smsUpdates, setSmsUpdates] = useState(true);
  const [joinedCommunity, setJoinedCommunity] = useState(false);

  if (!onboarding || !account) return null;

  const phoneOk = /^(?:\+?254|0)7\d{8}$/.test(phone.replace(/\s/g, ""));
  const usernameOk = username.trim().length >= 3;

  const finish = () => {
    completeOnboarding({ username: username.trim(), phone, mpesaReady, smsUpdates, joinedCommunity });
    toast.success(`Welcome to Polka, @${username.trim().toLowerCase()}`, {
      description: "Your forecaster profile is live.",
    });
  };

  return (
    <div className="fixed inset-0 z-[75] flex items-end justify-center bg-background/70 p-3 backdrop-blur-md sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-card bevel-raised">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn("h-1.5 flex-1 rounded-full transition-colors", i <= step ? "bg-primary" : "bg-secondary")}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="mt-5">
            <p className="font-display text-[0.68rem] uppercase tracking-[0.2em] text-primary">Step 1 of 3</p>
            <h2 className="mt-1 font-display text-2xl leading-tight">Pick your forecaster name</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              This is how you appear on the leaderboard and on markets you create.
            </p>
            <label className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
              <User className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">@</span>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="wanjiku"
                className="w-full bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
            </label>
            <button
              type="button"
              disabled={!usernameOk}
              onClick={() => setStep(1)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground press disabled:opacity-50"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {step === 1 && (
          <div className="mt-5">
            <p className="font-display text-[0.68rem] uppercase tracking-[0.2em] text-primary">Step 2 of 3</p>
            <h2 className="mt-1 font-display text-2xl leading-tight">Your M-Pesa number</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Used for instant top-ups and payouts. Nothing is charged now.
            </p>
            <label className="mt-4 flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-3">
              <Phone className="size-4 text-muted-foreground" />
              <input
                autoFocus
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="07XX XXX XXX"
                className="w-full bg-transparent text-base tabular outline-none placeholder:text-muted-foreground"
              />
            </label>
            {phone.length > 3 && !phoneOk && (
              <p className="mt-1.5 text-xs text-no">Enter a valid Safaricom number, e.g. 0712 345 678.</p>
            )}
            <Toggle
              icon={Smartphone}
              label="Ready to deposit & withdraw"
              hint="Enable STK push so top-ups land in one tap."
              value={mpesaReady}
              onChange={setMpesaReady}
            />
            <Toggle
              icon={BellRing}
              label="SMS updates"
              hint="Resolution results, payouts and market closes."
              value={smsUpdates}
              onChange={setSmsUpdates}
            />
            <button
              type="button"
              disabled={!phoneOk}
              onClick={() => setStep(2)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground press disabled:opacity-50"
            >
              Continue <ArrowRight className="size-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="mt-5">
            <p className="font-display text-[0.68rem] uppercase tracking-[0.2em] text-primary">Step 3 of 3</p>
            <h2 className="mt-1 font-display text-2xl leading-tight">Join the forecasters community</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Daily market drops, resolution notes and tips from top forecasters.
            </p>
            <a
              href={WHATSAPP_COMMUNITY_URL}
              target="_blank"
              rel="noreferrer noopener"
              onClick={() => setJoinedCommunity(true)}
              className="mt-4 flex items-center gap-3 rounded-2xl bg-yes-soft p-3.5 press"
            >
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-yes text-primary-foreground">
                <MessageCircle className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-yes">Open WhatsApp community</span>
                <span className="block text-xs text-yes/80">1,900+ Kenyan forecasters</span>
              </span>
              {joinedCommunity && <Check className="size-5 text-yes" />}
            </a>
            <div className="mt-3 flex items-start gap-2.5 rounded-2xl bg-grape-soft p-3.5 text-xs leading-relaxed text-grape">
              <Sparkles className="mt-0.5 size-4 shrink-0" />
              Invite 10 depositing friends and earn KSh 500 — plus commission on every market you create.
            </div>
            <button
              type="button"
              onClick={finish}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground press"
            >
              Start forecasting
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Toggle({
  icon: Icon,
  label,
  hint,
  value,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="mt-3 flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left press hover:bg-accent/40"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
        <Icon className="size-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          value ? "bg-yes" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-card transition-all",
            value ? "left-[1.4rem]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}
