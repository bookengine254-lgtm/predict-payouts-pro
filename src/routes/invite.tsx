import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Copy, Flame, Gift, Megaphone, Receipt, Share2, Sparkles, Trophy, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { formatKsh } from "@/lib/parimutuel";
import { currentUser } from "@/lib/mock-data";
import { AuthGate } from "@/components/auth-gate";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/invite")({
  head: () => ({
    meta: [
      { title: "Rewards — Invites, Creator Commission & Streaks | Polka" },
      { name: "description", content: "Every way to earn on Polka in one place: KSh 500 for 10 funded invites, creator commission, streaks and share bonuses." },
      { property: "og:title", content: "Polka Rewards — earn for growing the pool" },
      { property: "og:description", content: "Referral bonuses, creator commission, streaks and share rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Invite,
});

type Filter = "all" | "invites" | "creator" | "activity";

const streams: { id: Exclude<Filter, "all">; icon: typeof Gift; title: string; detail: string; value: string; earned: number; cta: { to: string; label: string } }[] = [
  { id: "invites", icon: Users, title: "10 funded invites", detail: "KSh 500 lands when your tenth invited forecaster tops up and stakes.", value: "KSh 500", earned: currentUser.referralEarnings, cta: { to: "/invite", label: "Copy link" } },
  { id: "creator", icon: Megaphone, title: "Creator commission", detail: "0.5% – 2.0% of every pool on markets you create, paid at resolution.", value: "Up to 2%", earned: 1_840, cta: { to: "/create", label: "Create market" } },
  { id: "activity", icon: Flame, title: "7-day streak", detail: "Forecast every day for a week for a free priority AI review.", value: "KSh 250", earned: 250, cta: { to: "/", label: "Forecast now" } },
  { id: "invites", icon: Receipt, title: "Share a payout receipt", detail: "Post your receipt; earn KSh 50 credit per new signup who funds.", value: "KSh 50", earned: 150, cta: { to: "/wallet", label: "Open wallet" } },
  { id: "activity", icon: Trophy, title: "Leaderboard top 10", detail: "Top weekly forecasters by accuracy share a bonus pool.", value: "Weekly", earned: 0, cta: { to: "/leaderboard", label: "See ranks" } },
  { id: "creator", icon: Sparkles, title: "Market of the week", detail: "The most-forecast new market earns its creator a featured bonus.", value: "KSh 1K", earned: 0, cta: { to: "/create", label: "Create market" } },
];

function Invite() {
  const { account } = useAuth();
  const [filter, setFilter] = useState<Filter>("all");
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const code = account?.username || "polka";
  const link = `${origin}/?ref=${encodeURIComponent(code)}`;
  const total = streams.reduce((s, r) => s + r.earned, 0);
  const progress = currentUser.referrals % 10;
  const shown = filter === "all" ? streams : streams.filter((s) => s.id === filter);

  const copy = async () => {
    try { await navigator.clipboard.writeText(link); toast.success("Invite link copied"); } catch { toast.error("Could not copy link"); }
  };
  const share = () => window.open(`https://wa.me/?text=${encodeURIComponent(`Forecast East Africa on Polka and cash out to M-Pesa. Join with my link: ${link}`)}`, "_blank", "noopener");

  return (
    <AppShell>
      <AuthGate feature="your rewards">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl">Rewards</h1>
            <p className="mt-1 text-sm text-muted-foreground">Every way you earn on Polka, in one place.</p>
          </div>
          <div className="rounded-xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-[0.7rem] text-muted-foreground">Total earned</p>
            <p className="font-display text-xl tabular text-yes">{formatKsh(total)}</p>
          </div>
        </header>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-2xl bg-grape-soft p-5 text-grape">
            <div className="flex items-center gap-2"><Gift className="size-5" /><span className="text-sm font-semibold">Invite progress</span></div>
            <p className="mt-3 font-display text-3xl leading-tight tabular">{progress}/10 <span className="text-base">funded invites</span></p>
            <div className="mt-3 grid grid-cols-10 gap-1">
              {Array.from({ length: 10 }, (_, i) => <span key={i} className={cn("h-2 rounded-full", i < progress ? "bg-grape" : "bg-card/60")} />)}
            </div>
            <p className="mt-2 text-xs">{10 - progress} more to unlock your next KSh 500 · {currentUser.referrals} joined so far</p>
          </section>

          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm font-semibold">Your invite link</p>
            <p className="mt-2 truncate rounded-lg bg-secondary/60 px-3 py-2 text-xs tabular">{link || "…"}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" onClick={copy} className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold hover:bg-accent"><Copy className="size-3.5" /> Copy</button>
              <button type="button" onClick={share} className="flex items-center justify-center gap-1.5 rounded-lg bg-yes py-2 text-xs font-semibold text-primary-foreground"><Share2 className="size-3.5" /> WhatsApp</button>
            </div>
          </section>
        </div>

        <div className="mt-6 flex gap-1 overflow-x-auto rounded-xl bg-secondary/60 p-1 hide-scrollbar">
          {([["all", "All rewards"], ["invites", "Invites & sharing"], ["creator", "Creator"], ["activity", "Activity"]] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setFilter(id)} className={cn("flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold", filter === id ? "bg-card text-foreground shadow-card" : "text-muted-foreground")}>{label}</button>
          ))}
        </div>

        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((r) => (
            <li key={r.title} className="flex flex-col rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-9 place-items-center rounded-lg bg-primary-soft text-primary"><r.icon className="size-4" /></span>
                <span className="rounded-full bg-yes-soft px-2 py-0.5 text-[0.7rem] font-semibold text-yes tabular">{r.value}</span>
              </div>
              <h2 className="mt-3 text-sm font-semibold">{r.title}</h2>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{r.detail}</p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="text-muted-foreground">Earned <strong className="text-foreground tabular">{formatKsh(r.earned)}</strong></span>
                <Link to={r.cta.to} className="font-semibold text-primary hover:underline">{r.cta.label}</Link>
              </div>
            </li>
          ))}
        </ul>
      </AuthGate>
    </AppShell>
  );
}
