import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bell,
  BarChart3,
  Compass,
  Gavel,
  Gift,
  LogOut,
  LayoutGrid,
  LineChart,
  Plus,
  PlusCircle,
  Search,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { Logo } from "./logo";
import { AuthSheet } from "./auth-sheet";
import { OnboardingSheet } from "./onboarding-sheet";
import { QuickActions } from "./quick-actions";
import { cn } from "@/lib/utils";
import { categories, currentUser } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";
import { useAuth } from "@/hooks/use-auth";

/** Bottom nav: four destinations plus the rewards gift in the middle. Creating a
 * market lives on the home feed as a thumb-reach floating button instead. */
const primaryNav = [
  { to: "/", label: "Markets", icon: Compass },
  { to: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { to: "/activity", label: "Activity", icon: Bell },
  { to: "/profile/you", label: "Profile", icon: User },
] as const;

const railNav = [
  { to: "/", label: "Discover", icon: LayoutGrid },
  { to: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/invite", label: "Rewards", icon: Gift },
  { to: "/payouts", label: "Payouts", icon: LineChart },
  { to: "/disputes", label: "Resolutions", icon: Gavel },
] as const;

const footerLinks: { heading: string; links: { to: string; label: string }[] }[] = [
  {
    heading: "Forecast",
    links: [
      { to: "/", label: "Discover markets" },
      { to: "/leaderboard", label: "Leaderboard" },
      { to: "/create", label: "Create a market" },
      { to: "/portfolio", label: "Your portfolio" },
    ],
  },
  {
    heading: "How it works",
    links: [
      { to: "/how-it-works", label: "Getting started" },
      { to: "/payouts", label: "Payout & pool rules" },
      { to: "/disputes", label: "Resolutions & disputes" },
      { to: "/activity", label: "Activity feed" },
    ],
  },
  {
    heading: "Earn",
    links: [
      { to: "/invite", label: "Invite & earn" },
      { to: "/create", label: "Creator commission" },
      { to: "/wallet", label: "Wallet & M-Pesa" },
      { to: "/settings", label: "Settings" },
    ],

  },
];

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <RecommendationPills />
      <div className={cn("mx-auto flex w-full flex-1 gap-8 px-4 lg:px-8", wide ? "max-w-[1500px]" : "max-w-[1280px]")}>
        <MenuRail />
        <main className="min-w-0 flex-1 pt-4 pb-28 lg:pt-6 lg:pb-12">{children}</main>
      </div>
      <SiteFooter />
      <BottomNav />
      <QuickActions />
      <AuthSheet />
      <OnboardingSheet />
    </div>
  );
}

/** Quick-jump pills right under the top bar for faster navigation. */
function RecommendationPills() {
  return (
    <div className="sticky top-[3.25rem] z-30 border-b border-border bg-background/85 backdrop-blur-lg lg:top-[3.5rem]">
      <div className="mx-auto flex max-w-[1500px] gap-2 overflow-x-auto px-4 py-2 hide-scrollbar lg:px-8">
        <Link
          to="/"
          activeOptions={{ exact: true }}
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground data-[status=active]:border-primary data-[status=active]:bg-primary data-[status=active]:text-primary-foreground"
        >
          Trending
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/"
            search={{ category: c.id }}
            className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
          >
            {c.label}
          </Link>
        ))}
        <Link
          to="/leaderboard"
          className="shrink-0 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          Leaderboard
        </Link>
        <Link
          to="/invite"
          className="shrink-0 rounded-full bg-grape-soft px-3 py-1.5 text-xs font-semibold text-grape"
        >
          Invite & earn
        </Link>
      </div>
    </div>
  );
}

function TopBar() {
  const { account, openAuth, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="mx-auto grid max-w-[1500px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-2.5 lg:gap-6 lg:px-8">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {railNav.slice(0, 5).map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="lg:hidden" />

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="hidden size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:grid"
            aria-label="Search markets"
          >
            <Search className="size-4.5" />
          </button>

          {account ? (
            <>
              <Link
                to="/wallet"
                search={{}}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground bevel press transition-opacity hover:opacity-90"
              >
                <Wallet className="size-3.5" />
                <span className="tabular">{formatKsh(currentUser.balance, { compact: true })}</span>
              </Link>

              {/* Mobile: one-tap green top-up sitting right beside the wallet */}
              <Link
                to="/wallet"
                search={{ topup: true }}
                className="flex items-center gap-1 rounded-lg bg-yes px-2 py-1.5 text-xs font-bold text-primary-foreground transition-opacity hover:opacity-90 lg:hidden"
                aria-label="Top up with M-Pesa"
              >
                <Plus className="size-3.5" /> Top up
              </Link>
              <Link
                to="/profile/$handle"
                params={{ handle: account.username || "you" }}
                className="hidden size-9 place-items-center rounded-full bg-grape-soft font-display text-xs text-grape lg:grid"
                aria-label="Your profile"
              >
                {account.initials}
              </Link>
              <button
                type="button"
                onClick={signOut}
                className="hidden size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground lg:grid"
                aria-label="Sign out"
              >
                <LogOut className="size-4.5" />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => openAuth("signin")}
                className="rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-foreground press hover:bg-accent"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => openAuth("signup")}
                className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground bevel press"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}


function MenuRail() {
  return (
    <aside className="hidden w-56 shrink-0 pt-6 lg:block">
      <nav className="sticky top-20 flex flex-col gap-0.5">
        {railNav.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.to === "/" }}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground data-[status=active]:bg-primary-soft data-[status=active]:font-medium data-[status=active]:text-primary"
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        ))}
        <Link
          to="/create"
          className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <PlusCircle className="size-4" /> New market
        </Link>
        <p className="mt-3 rounded-xl bg-amber-soft p-3 text-[0.7rem] leading-relaxed text-amber">
          Creators earn commission on every pool they seed. Seed well, share widely.
        </p>
      </nav>
    </aside>
  );
}

function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(`/${to.split("/")[1]}`));

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="grid grid-cols-5">
        {primaryNav.slice(0, 2).map((item) => (
          <NavItem key={item.label} {...item} active={isActive(item.to)} />
        ))}
        <li className="flex justify-center">
          <Link
            to="/invite"
            aria-label="Rewards and referral bonuses"
            className="flex w-full flex-col items-center gap-0.5 py-2 text-[0.62rem] font-medium text-muted-foreground"
          >
            <span className="grid size-8 place-items-center rounded-full bg-grape-soft text-grape">
              <Gift className="size-4.5 tremble" />
            </span>
            Rewards
          </Link>
        </li>
        {primaryNav.slice(2).map((item) => (
          <NavItem key={item.label} {...item} active={isActive(item.to)} />
        ))}
      </ul>
    </nav>
  );
}

function NavItem({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  active: boolean;
}) {
  return (
    <li className="flex justify-center">
      <Link
        to={to}
        className={cn(
          "flex w-full flex-col items-center gap-0.5 py-2 text-[0.62rem] font-medium transition-colors",
          active ? "text-primary" : "text-muted-foreground",
        )}
      >
        <Icon className="size-5" />
        {label}
      </Link>
    </li>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-secondary/40 pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Polka is a skill-based forecasting exchange. Forecasters stake into shared pools, and the pool pays the
            people who read the world correctly. No bookmaker, no house odds, no betting.
          </p>
        </div>
        {footerLinks.map((col) => (
          <div key={col.heading}>
            <h3 className="font-display text-xs tracking-widest uppercase text-muted-foreground">{col.heading}</h3>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link to={l.to} className="text-sm text-foreground/80 transition-colors hover:text-primary">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-4 text-center text-[0.7rem] text-muted-foreground lg:px-8">
        Polka · Skill-based forecasting, parimutuel payouts, M-Pesa settlement. 18+. Forecast within your means.
      </div>
    </footer>
  );
}
