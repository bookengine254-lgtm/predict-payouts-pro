import { useState } from "react";
import { ArrowLeft, Loader2, Lock, Mail, X } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

/** Floating auth panel: blurs the app behind it, same feel as onboarding. */
export function AuthSheet() {
  const { authMode, closeAuth, openAuth, signIn, signUp, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (!authMode) return null;

  const title =
    authMode === "signin" ? "Welcome back" : authMode === "signup" ? "Create your account" : "Reset your password";
  const blurb =
    authMode === "signin"
      ? "Sign in to stake, claim payouts and track your accuracy."
      : authMode === "signup"
        ? "Forecast Kenyan politics, sport and markets. Free to join."
        : "We'll send a reset link to your email address.";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (authMode === "forgot") {
        toast.success("Reset link sent", { description: `Check ${email} for the link.` });
        openAuth("signin");
        return;
      }
      if (authMode === "signup") signUp({ email, password });
      else signIn({ email, password });
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-background/70 backdrop-blur-md p-3 sm:items-center">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-5 shadow-card bevel-raised">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {authMode === "forgot" && (
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="size-3.5" /> Back to sign in
              </button>
            )}
            <h2 className="font-display text-2xl leading-tight">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{blurb}</p>
          </div>
          <button
            type="button"
            onClick={closeAuth}
            aria-label="Close"
            className="grid size-9 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {authMode !== "forgot" && (
          <>
            <button
              type="button"
              onClick={signInWithGoogle}
              className="mt-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-border bg-background py-3 text-sm font-semibold press hover:bg-accent"
            >
              <GoogleGlyph /> Continue with Google
            </button>
            <div className="my-4 flex items-center gap-3 text-[0.68rem] uppercase tracking-widest text-muted-foreground">
              <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="space-y-3">
          <Field icon={Mail} label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </Field>
          {authMode !== "forgot" && (
            <Field icon={Lock} label="Password">
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </Field>
          )}
          <button
            type="submit"
            disabled={busy}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground press",
              busy && "opacity-70",
            )}
          >
            {busy && <Loader2 className="size-4 animate-spin" />}
            {authMode === "signin" ? "Sign in" : authMode === "signup" ? "Create account" : "Send reset link"}
          </button>
        </form>

        {authMode === "signin" && (
          <div className="mt-4 flex items-center justify-between text-xs">
            <button type="button" onClick={() => openAuth("forgot")} className="font-semibold text-muted-foreground hover:text-foreground">
              Forgot password?
            </button>
            <button type="button" onClick={() => openAuth("signup")} className="font-semibold text-primary">
              Create an account
            </button>
          </div>
        )}
        {authMode === "signup" && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Already forecasting?{" "}
            <button type="button" onClick={() => openAuth("signin")} className="font-semibold text-primary">
              Sign in
            </button>
          </p>
        )}
        <p className="mt-4 text-center text-[0.68rem] leading-relaxed text-muted-foreground">
          Polka is skill-based forecasting with parimutuel pools. 18+. Forecast within your means.
        </p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5">
      <Icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span className="block text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
        {children}
      </span>
    </label>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="size-4.5" aria-hidden="true">
      <path fill="#4285F4" d="M23 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.1a5.3 5.3 0 0 1-2.3 3.4v2.8h3.7c2.2-2 3.5-5 3.5-8.4Z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.8-1 7.5-2.8l-3.7-2.8c-1 .7-2.3 1.1-3.8 1.1a7 7 0 0 1-6.5-4.7H1.7v3A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.5 14.8a7.2 7.2 0 0 1 0-4.6v-3H1.7a12 12 0 0 0 0 10.6l3.8-3Z" />
      <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.3-3.3A12 12 0 0 0 1.7 7.2l3.8 3A7 7 0 0 1 12 4.8Z" />
    </svg>
  );
}
