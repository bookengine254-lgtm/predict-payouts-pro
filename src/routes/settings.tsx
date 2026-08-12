import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Bell,
  ChevronRight,
  Eye,
  Gauge,
  LogOut,
  Moon,
  Phone,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Sun,
  Trash2,
  Type,
  Volume2,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { formatKsh } from "@/lib/parimutuel";
import { usePrefs, type TextScale } from "@/hooks/use-prefs";
import { currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Polka" },
      {
        name: "description",
        content:
          "Control your Polka appearance, text size, notifications, forecasting limits, privacy and M-Pesa payout number.",
      },
      { property: "og:title", content: "Your Polka settings" },
      { property: "og:description", content: "Theme, text size, alerts, limits, privacy and payout details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const SCALES: { id: TextScale; label: string; hint: string }[] = [
  { id: "compact", label: "Compact", hint: "More on screen" },
  { id: "default", label: "Default", hint: "Recommended" },
  { id: "large", label: "Large", hint: "Thumb-friendly" },
];

function SettingsPage() {
  const { signOut } = useAuth();
  const { prefs, set, reset } = usePrefs();
  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [phone, setPhone] = useState("0712 345 214");

  return (
    <AppShell>
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold sm:text-2xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Appearance, alerts, limits and payouts. Everything saves the moment you change it.
          </p>
        </div>
        <Link
          to="/profile/$handle"
          params={{ handle: "you" }}
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold press hover:bg-accent"
        >
          Back to profile <ChevronRight className="size-3.5" />
        </Link>
      </header>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        {/* ---------- Appearance ---------- */}
        <Section icon={Moon} title="Appearance" hint="Dark is the house style. Light is there when you need it.">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["dark", "Dark", Moon],
                ["light", "Light", Sun],
              ] as const
            ).map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => set("theme", mode)}
                className={cn(
                  "flex items-center gap-2 rounded-xl border p-3 text-sm font-semibold press",
                  prefs.theme === mode ? "border-primary bg-primary-soft text-primary" : "border-border hover:bg-accent",
                )}
              >
                <Icon className="size-4" /> {label}
              </button>
            ))}
          </div>

          <Divider />

          <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Type className="size-3.5" /> Text & tap-target size
          </p>
          <div className="grid grid-cols-3 gap-2">
            {SCALES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => set("textScale", s.id)}
                className={cn(
                  "rounded-xl border p-2.5 text-left press",
                  prefs.textScale === s.id ? "border-primary bg-primary-soft" : "border-border hover:bg-accent",
                )}
              >
                <span className="block text-sm font-semibold">{s.label}</span>
                <span className="block text-[0.68rem] text-muted-foreground">{s.hint}</span>
              </button>
            ))}
          </div>

          <Toggle
            checked={prefs.reduceMotion}
            onChange={(v) => set("reduceMotion", v)}
            title="Reduce motion"
            hint="Calms transitions, shimmer and the trembling rewards icon"
          />
          <Toggle
            checked={prefs.sounds}
            onChange={(v) => set("sounds", v)}
            title="Sound on forecast placed"
            hint="A short confirmation tick when a stake lands"
            icon={Volume2}
          />
        </Section>

        {/* ---------- Notifications ---------- */}
        <Section icon={Bell} title="Notifications" hint="Only the alerts that move your money.">
          <Toggle
            checked={prefs.notifyResolutions}
            onChange={(v) => set("notifyResolutions", v)}
            title="Resolutions & payouts"
            hint="When a market you forecast settles and your share is credited"
          />
          <Toggle
            checked={prefs.notifyPriceMoves}
            onChange={(v) => set("notifyPriceMoves", v)}
            title="Big pool moves"
            hint="When an outcome you hold shifts more than 5 points"
          />
          <Toggle
            checked={prefs.notifyInvites}
            onChange={(v) => set("notifyInvites", v)}
            title="Invites & commission"
            hint="When an invited forecaster deposits and your bonus unlocks"
          />
          <Toggle
            checked={prefs.notifyWhatsapp}
            onChange={(v) => set("notifyWhatsapp", v)}
            title="WhatsApp digest"
            hint="One daily summary of your open forecasts"
            icon={Phone}
          />
        </Section>

        {/* ---------- Forecasting & safety ---------- */}
        <Section icon={ShieldCheck} title="Forecasting & limits" hint="Skill-based forecasting, played within your means.">
          <Toggle
            checked={prefs.stakeConfirm}
            onChange={(v) => set("stakeConfirm", v)}
            title="Confirm before every stake"
            hint="Adds a review step to the forecasting panel"
          />
          <Toggle
            checked={prefs.hideBalances}
            onChange={(v) => set("hideBalances", v)}
            title="Hide amounts in public"
            hint="Masks your balance and returns on shared screens"
            icon={Eye}
          />
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Gauge className="size-3.5" /> Weekly stake ceiling · {formatKsh(prefs.weeklyLimit)}
            </span>
            <input
              type="range"
              min={1_000}
              max={100_000}
              step={1_000}
              value={prefs.weeklyLimit}
              onChange={(e) => set("weeklyLimit", Number(e.target.value))}
              className="w-full accent-[var(--primary)]"
            />
            <span className="mt-1 block text-[0.7rem] text-muted-foreground">
              Polka blocks new forecasts once you hit the ceiling until the week rolls over.
            </span>
          </label>
        </Section>

        {/* ---------- Account & payouts ---------- */}
        <Section icon={Wallet} title="Account & payouts" hint="Withdrawals only ever go to the number you paid from.">
          <Input label="Display name" value={name} onChange={setName} />
          <Input label="Handle" value={handle} onChange={setHandle} prefix="@" />
          <Input label="M-Pesa number" value={phone} onChange={setPhone} icon={Smartphone} />
          <button
            type="button"
            onClick={() => toast.success("Account details saved", { description: "Your payout number is verified." })}
            className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground bevel press"
          >
            Save account details
          </button>
          <Divider />
          <Toggle
            checked={prefs.publicProfile}
            onChange={(v) => set("publicProfile", v)}
            title="Public profile"
            hint="Let others see your accuracy and the markets you create"
          />
          <Toggle
            checked={prefs.showOnLeaderboard}
            onChange={(v) => set("showOnLeaderboard", v)}
            title="Appear on the leaderboard"
            hint="Turn off to forecast quietly"
          />
        </Section>

        {/* ---------- Danger zone ---------- */}
        <Section icon={RotateCcw} title="Reset & sign out" hint="Nothing here touches your wallet balance.">
          <button
            type="button"
            onClick={() => {
              reset();
              toast.success("Preferences reset to Polka defaults");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold press hover:bg-accent"
          >
            <RotateCcw className="size-4" /> Reset preferences
          </button>
          <button
            type="button"
            onClick={() => {
              signOut();
              toast("Signed out of this device");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold press hover:bg-accent"
          >
            <LogOut className="size-4" /> Sign out
          </button>
          <button
            type="button"
            onClick={() =>
              toast.error("Account closure requested", {
                description: "Support will confirm after your open pools resolve.",
              })
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-no-soft py-3 text-sm font-semibold text-no press"
          >
            <Trash2 className="size-4" /> Close my account
          </button>
        </Section>
      </div>
    </AppShell>
  );
}

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 bevel">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" /> {title}
      </h2>
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      <div className="mt-3 space-y-2.5">{children}</div>
    </section>
  );
}

function Divider() {
  return <div className="h-px bg-border" />;
}

function Toggle({
  checked,
  onChange,
  title,
  hint,
  icon: Icon,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  title: string;
  hint: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center gap-3 rounded-xl border border-border p-3 text-left press hover:bg-accent"
    >
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-sm font-semibold">
          {Icon && <Icon className="size-3.5 text-muted-foreground" />}
          {title}
        </span>
        <span className="mt-0.5 block text-[0.7rem] leading-relaxed text-muted-foreground">{hint}</span>
      </span>
      <span
        className={cn(
          "relative h-6 w-11 shrink-0 rounded-full transition-colors",
          checked ? "bg-yes" : "bg-secondary",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 size-5 rounded-full bg-card shadow-card transition-all",
            checked ? "left-[1.4rem]" : "left-0.5",
          )}
        />
      </span>
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  prefix,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <span className="flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2.5">
        {Icon && <Icon className="size-4 shrink-0 text-muted-foreground" />}
        {prefix && <span className="shrink-0 text-sm text-muted-foreground">{prefix}</span>}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
        />
      </span>
    </label>
  );
}
