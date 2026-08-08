import { Link, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  Bell,
  BarChart3,
  Compass,
  Gavel,
  LayoutGrid,
  LineChart,
  PlusCircle,
  Search,
  Settings,
  Trophy,
  User,
  Wallet,
} from "lucide-react";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";
import { currentUser } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";

const primaryNav = [
  { to: "/", label: "Markets", icon: Compass },
  { to: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { to: "/create", label: "Create", icon: PlusCircle },
  { to: "/activity", label: "Activity", icon: Bell },
  { to: "/profile/you", label: "Profile", icon: User },
] as const;

const railNav = [
  { to: "/", label: "Discover", icon: LayoutGrid },
  { to: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { to: "/wallet", label: "Wallet", icon: Wallet },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/creator", label: "Creator studio", icon: LineChart },
  { to: "/disputes", label: "Resolutions", icon: Gavel },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

const footerLinks: { heading: string; links: { to: string; label: string }[] }[] = [
  {
    heading: "Forecast",
    links: [
      { to: "/", label: "Discover markets" },
      { to: "/leaderboard", label: "Leaderboard" },
      { to: "/create", label: "Create a market" },
      { to: "/creator", label: "Creator studio" },
    ],
  },
  {
    heading: "How it works",
    links: [
      { to: "/how-it-works", label: "Getting started" },
      { to: "/payouts", label: "Payout & pool rules" },
      { to: "/fees", label: "Fees" },
      { to: "/disputes", label: "Resolutions & disputes" },
    ],
  },
  {
    heading: "Company",
    links: [
      { to: "/about", label: "About Soko" },
      { to: "/skill-policy", label: "Skill-based policy" },
      { to: "/responsible", label: "Play responsibly" },
      { to: "/faq", label: "Support & FAQ" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { to: "/terms", label: "Terms of use" },
      { to: "/privacy", label: "Privacy" },
      { to: "/settings", label: "Settings" },
      { to: "/wallet", label: "Wallet & M-Pesa" },
    ],
  },
];

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopBar />
      <div className={cn("mx-auto flex w-full flex-1 gap-8 px-4 lg:px-8", wide ? "max-w-[1500px]" : "max-w-[1280px]")}>
        <MenuRail />
        <main className="min-w-0 flex-1 pt-4 pb-28 lg:pt-6 lg:pb-12">{children}</main>
      </div>
      <SiteFooter />
      <BottomNav />
    </div>
  );
}

function TopBar() {
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

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid size-9 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            aria-label="Search markets"
          >
            <Search className="size-4.5" />
          </button>
          <Link
            to="/wallet"
            className="flex items-center gap-1.5 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Wallet className="size-3.5" />
            <span className="tabular">{formatKsh(currentUser.balance, { compact: true })}</span>
          </Link>
          <Link
            to="/profile/$handle"
            params={{ handle: "you" }}
            className="hidden size-9 place-items-center rounded-full bg-grape-soft font-display text-xs text-grape sm:grid"
            aria-label="Your profile"
          >
            {currentUser.initials}
          </Link>
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden">
      <ul className="grid grid-cols-5">
        {primaryNav.map((item) => {
          const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to.split("/")[1] ? `/${item.to.split("/")[1]}` : item.to);
          const center = item.label === "Create";
          return (
            <li key={item.label} className="flex justify-center">
              <Link
                to={item.to}
                className={cn(
                  "flex w-full flex-col items-center gap-0.5 py-2 text-[0.62rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {center ? (
                  <span className="grid size-8 place-items-center rounded-full bg-primary text-primary-foreground">
                    <item.icon className="size-4.5" />
                  </span>
                ) : (
                  <item.icon className="size-5" />
                )}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border bg-secondary/40 pb-24 lg:pb-0">
      <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-5 lg:px-8">
        <div className="lg:col-span-1">
          <Logo />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Soko is a skill-based forecasting exchange. Forecasters stake into shared pools, and the pool pays the
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
        Soko · Skill-based forecasting, parimutuel payouts, M-Pesa settlement. 18+. Forecast within your means.
      </div>
    </footer>
  );
}
