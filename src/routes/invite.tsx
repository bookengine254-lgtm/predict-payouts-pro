import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Gift, Share2, Users } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/app-shell";
import { InviteBanner } from "@/components/banners";
import { formatKsh } from "@/lib/parimutuel";
import { currentUser } from "@/lib/mock-data";

export const Route = createFileRoute("/invite")({
  head: () => ({
    meta: [
      { title: "Invite & Earn KSh 500 — Polka" },
      {
        name: "description",
        content: "Share a market to 10 new depositing forecasters and KSh 500 lands in your wallet. Rewards stack with creator commission.",
      },
      { property: "og:title", content: "Invite 10 forecasters, earn KSh 500 — Polka" },
      { property: "og:description", content: "Referral bonuses, creator commission and streak rewards in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Invite,
});

const rewards = [
  { title: "10 funded invites", detail: "KSh 500 bonus, paid the moment the tenth invite stakes.", value: "KSh 500" },
  { title: "Creator commission", detail: "0.5% – 2.0% of every losing pool on markets you create.", value: "Up to 2%" },
  { title: "7-day streak", detail: "Forecast every day for a week for a free priority AI review.", value: "KSh 250" },
  { title: "Share a resolved market", detail: "Post your receipt and earn a KSh 50 credit per new signup.", value: "KSh 50" },
];

function Invite() {
  const code = "POLKA-YN47";
  return (
    <AppShell>
      <header>
        <h1 className="text-xl font-semibold sm:text-2xl">Rewards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          The pool grows when the crowd grows. Bring forecasters, get paid for it.
        </p>
      </header>

      <section className="mt-4 rounded-2xl bg-grape-soft p-5 text-grape">
        <Gift className="size-7 tremble" />
        <p className="mt-3 font-display text-3xl leading-tight">KSh 500</p>
        <p className="text-sm">for every 10 invites who deposit and stake</p>
        <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-xl bg-card/70 p-2">
          <span className="truncate px-2 font-display text-lg tabular text-foreground">{code}</span>
          <button
            type="button"
            onClick={() => toast.success("Invite link copied", { description: "Paste it in your group chat." })}
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Copy className="size-3.5" /> Copy
          </button>
        </div>
        <div className="mt-3 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5">
            <Users className="size-3.5" /> {currentUser.referrals} joined
          </span>
          <span className="tabular">{formatKsh(currentUser.referralEarnings)} earned</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-card/60">
          <span className="block h-full bg-grape" style={{ width: `${(currentUser.referrals % 10) * 10}%` }} />
        </div>
        <p className="mt-1.5 text-[0.7rem]">{10 - (currentUser.referrals % 10)} more funded invites to your next KSh 500.</p>
      </section>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {rewards.map((r) => (
          <li key={r.title} className="rounded-2xl bg-card p-4 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-sm font-semibold">{r.title}</h2>
              <span className="shrink-0 rounded-full bg-yes-soft px-2 py-0.5 text-[0.7rem] font-semibold text-yes tabular">
                {r.value}
              </span>
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{r.detail}</p>
          </li>
        ))}
      </ul>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <InviteBanner />
        <Link
          to="/create"
          className="flex items-center gap-3 rounded-2xl bg-card p-4 shadow-card transition-shadow hover:shadow-lift"
        >
          <Share2 className="size-5 shrink-0 text-primary" />
          <span className="min-w-0 text-xs leading-relaxed">
            <strong className="block text-sm">Create a market, then share it</strong>
            Commission plus referral bonus is the fastest way to earn on Polka.
          </span>
        </Link>
      </div>
    </AppShell>
  );
}
