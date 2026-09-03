import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  Bell,
  BarChart3,
  ChevronLeft,
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
  X,
  User,
  Wallet,
} from "lucide-react";
import { Logo } from "./logo";
import { AuthSheet } from "./auth-sheet";
import { OnboardingSheet } from "./onboarding-sheet";
import { QuickActions } from "./quick-actions";
import { cn } from "@/lib/utils";
import { categories, currentUser, markets, totalPool } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";
import { useAuth } from "@/hooks/use-auth";
import { useNavCollapse } from "@/hooks/use-nav-collapse";

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

/** Routes that behave like a browsing feed keep the pills + search rows. */
const FEED_ROUTES = ["/", "/leaderboard", "/activity"];

/** Mobile titles for the back-nav bar on non-feed pages. */
const PAGE_TITLES: Record<string, string> = {
  "/portfolio": "Portfolio",
  "/wallet": "Wallet",
  "/create": "New market",
  "/invite": "Rewards",
  "/payouts": "Payouts",
  "/disputes": "Resolutions",
  "/settings": "Settings",
  "/how-it-works": "How it works",
  "/market": "Market",
  "/profile": "Profile",
};

function titleFor(pathname: string) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]!;
  const root = `/${pathname.split("/")[1] ?? ""}`;
  return PAGE_TITLES[root] ?? "Polka";
}

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const collapsed = useNavCollapse(pathname);
  const isFeed = FEED_ROUTES.includes(pathname);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* One continuous sticky header. On mobile it slides away on scroll-down
          and returns on any upward intent; on desktop it always stays. */}
      <div
        className={cn(
          "sticky top-0 z-40 bg-background/90 backdrop-blur-lg transition-transform duration-300 ease-out lg:translate-y-0",
          isFeed ? "border-b border-border" : "border-b border-border/60",
          collapsed ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <TopBar compact={collapsed} back={!isFeed} title={titleFor(pathname)} />
        {isFeed && (
          <>
            <RecommendationPills />
            <MarketSearch />
          </>
        )}
      </div>
      <div className={cn("mx-auto flex w-full flex-1 gap-8 px-4 lg:px-8", wide ? "max-w-[1500px]" : "max-w-[1280px]")}>
        <MenuRail />
        <main className="min-w-0 flex-1 pt-4 pb-28 lg:pt-6 lg:pb-12">{children}</main>
      </div>
      <SiteFooter />
      <BottomNav collapsed={collapsed} />
      <QuickActions />
      <AuthSheet />
      <OnboardingSheet />
    </div>
  );
}


/** Quick-jump category pills, visually fused to the brand row above them. */
function RecommendationPills() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const search = useRouterState({ select: (s) => s.location.search as { category?: string } });
  const active = pathname === "/" ? (search.category ?? "trending") : null;

  const pill = (isActive: boolean) =>
    cn(
      "shrink-0 rounded-full px-3.5 py-1.5 text-[0.8rem] font-semibold transition-colors",
      isActive ? "bg-primary text-primary-foreground" : "bg-secondary/70 text-muted-foreground hover:text-foreground",
    );

  return (
    <div className="mx-auto flex max-w-[1500px] gap-1.5 overflow-x-auto px-4 pb-1.5 hide-scrollbar lg:px-8">
      <Link to="/" activeOptions={{ exact: true }} search={{}} className={pill(active === "trending")}>
        Trending
      </Link>
      {categories.map((c) => (
        <Link key={c.id} to="/" search={{ category: c.id }} className={pill(active === c.id)}>
          {c.label}
        </Link>
      ))}
      <Link to="/leaderboard" className={pill(false)}>
        Leaderboard
      </Link>
      <Link to="/invite" className="shrink-0 rounded-full bg-grape-soft px-3.5 py-1.5 text-[0.8rem] font-semibold text-grape">
        Invite & earn
      </Link>
    </div>
  );
}

/** Inline market search, sitting directly beneath the category pills. */
function MarketSearch() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const results = term
    ? markets
        .filter((m) => m.status === "open")
        .filter((m) => `${m.question} ${m.shortTitle} ${m.category}`.toLowerCase().includes(term))
        .slice(0, 6)
    : [];

  return (
    <div className="relative mx-auto max-w-[1500px] px-4 pb-2 lg:px-8">
      <label className="flex items-center gap-2 rounded-full bg-secondary/70 px-3.5 py-2">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search markets — politics, Harambee Stars, BTC…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button type="button" onClick={() => setQ("")} aria-label="Clear search" className="text-muted-foreground">
            <X className="size-4" />
          </button>
        )}
      </label>
      {results.length > 0 && (
        <ul className="absolute inset-x-4 top-full z-50 max-h-[60vh] overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-card lg:inset-x-8">
          {results.map((m) => (
            <li key={m.id}>
              <Link
                to="/market/$marketId"
                params={{ marketId: m.id }}
                onClick={() => setQ("")}
                className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-accent/50"
              >
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{m.shortTitle}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular">
                  {formatKsh(totalPool(m), { compact: true })}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


function TopBar({
  compact = false,
  back = false,
  title = "Polka",
}: {
  compact?: boolean;
  back?: boolean;
  title?: string;
}) {
  const { account, openAuth, signOut } = useAuth();
  const router = useRouter();

  return (
    <header>
      <div
        className={cn(
          "mx-auto grid max-w-[1500px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 transition-[padding] duration-300 lg:gap-6 lg:px-8 lg:py-2.5",
          compact ? "py-1.5" : "py-2.5",
        )}
      >
        {back ? (
          <div className="flex items-center">
            {/* Mobile: back arrow + page title. Desktop keeps the wordmark. */}
            <button
              type="button"
              onClick={() => router.history.back()}
              aria-label="Go back"
              className="grid size-9 place-items-center rounded-full bg-secondary/70 text-foreground press lg:hidden"
            >
              <ChevronLeft className="size-5" />
            </button>
            <span className="hidden lg:block">
              <Logo />
            </span>
          </div>
        ) : (
          <Logo />
        )}

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
        <span className="min-w-0 truncate text-sm font-semibold lg:hidden">{back ? title : ""}</span>

        <div className="flex items-center gap-1.5">
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

function BottomNav({ collapsed = false }: { collapsed?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(`/${to.split("/")[1]}`));

  return (
    <nav
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg transition-transform duration-300 ease-out lg:hidden",
        collapsed ? "translate-y-[110%]" : "translate-y-0",
      )}
    >
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
