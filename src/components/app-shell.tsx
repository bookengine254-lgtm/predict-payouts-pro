import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Bell, BarChart3, ChevronLeft, Compass, Gift, Menu, Moon, Plus, Search, Settings, Sun, Trophy, User, Wallet } from "lucide-react";
import { Logo } from "./logo";
import { AuthSheet } from "./auth-sheet";
import { OnboardingSheet } from "./onboarding-sheet";
import { QuickActions } from "./quick-actions";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { cn } from "@/lib/utils";
import { currentUser, markets, totalPool } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";
import { useAuth } from "@/hooks/use-auth";
import { usePrefs } from "@/hooks/use-prefs";

const primaryNav = [
  { to: "/", label: "Markets", icon: Compass },
  { to: "/portfolio", label: "Portfolio", icon: BarChart3 },
  { to: "/activity", label: "Activity", icon: Bell },
  { to: "/profile/you", label: "Profile", icon: User },
] as const;

const PAGE_TITLES: Record<string, string> = { "/portfolio": "Portfolio", "/wallet": "Wallet", "/create": "New market", "/invite": "Rewards", "/payouts": "Payouts", "/disputes": "Resolutions", "/settings": "Settings", "/how-it-works": "How it works", "/market": "Market", "/profile": "Profile", "/terms": "Terms" };
function titleFor(pathname: string) { return PAGE_TITLES[pathname] ?? PAGE_TITLES[`/${pathname.split("/")[1] ?? ""}`] ?? "Polka"; }

export function AppShell({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className="sticky top-0 z-40 border-b border-border/60 bg-background/90 backdrop-blur-lg">
        <TopBar back={pathname !== "/" && pathname !== "/leaderboard" && pathname !== "/activity"} title={titleFor(pathname)} />
      </div>
      <main className={cn("mx-auto w-full flex-1 px-4 pt-4 pb-28 lg:px-6 lg:pt-6 lg:pb-12", wide ? "max-w-[1500px]" : "max-w-6xl")}>{children}</main>
      <SiteFooter />
      <BottomNav />
      <QuickActions />
      <AuthSheet />
      <OnboardingSheet />
    </div>
  );
}

function MarketSearch() {
  const [q, setQ] = useState("");
  const results = q.trim() ? markets.filter((m) => `${m.question} ${m.category}`.toLowerCase().includes(q.toLowerCase())).slice(0, 6) : [];
  return (
    <div className="relative min-w-0 flex-1">
      <label className="flex h-9 items-center gap-2 rounded-md border border-border bg-secondary/60 px-3">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search markets" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
      </label>
      {results.length > 0 && <ul className="absolute inset-x-0 top-11 z-50 rounded-lg border border-border bg-card p-1 shadow-card">{results.map((m) => <li key={m.id}><Link to="/market/$marketId" params={{ marketId: m.id }} onClick={() => setQ("")} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-accent"><span className="min-w-0 flex-1 truncate text-sm">{m.question}</span><span className="text-xs text-muted-foreground">{formatKsh(totalPool(m), { compact: true })}</span></Link></li>)}</ul>}
    </div>
  );
}

function TopBar({ back, title }: { back: boolean; title: string }) {
  const { account, openAuth } = useAuth();
  const router = useRouter();
  return (
    <header className="mx-auto flex h-14 max-w-[1500px] items-center gap-2 px-4 lg:gap-4 lg:px-6">
      {back && <Button variant="ghost" size="icon" onClick={() => router.history.back()} aria-label="Go back" className="lg:hidden"><ChevronLeft /></Button>}
      <Logo compact />
      <span className="min-w-0 flex-1 truncate text-xs font-semibold text-muted-foreground lg:hidden">{back ? title : ""}</span>
      <div className="hidden max-w-xl flex-1 lg:block"><MarketSearch /></div>
      {account ? <>
        <Link to="/portfolio" className="hidden text-xs text-muted-foreground lg:block">Portfolio <strong className="ml-1 text-foreground tabular">{formatKsh(currentUser.locked, { compact: true })}</strong></Link>
        <Link to="/wallet" search={{}} className="hidden text-xs text-muted-foreground lg:block">Cash <strong className="ml-1 text-foreground tabular">{formatKsh(currentUser.balance, { compact: true })}</strong></Link>
        <Button asChild size="sm" className="hidden lg:inline-flex"><Link to="/wallet" search={{ topup: true }}><Plus /> Deposit</Link></Button>
        <Button asChild variant="ghost" size="icon" className="hidden lg:inline-flex"><Link to="/invite" aria-label="Rewards"><Gift /></Link></Button>
        <Button asChild variant="ghost" size="icon" className="hidden lg:inline-flex"><Link to="/activity" aria-label="Notifications"><Bell /></Link></Button>
        <Link to="/wallet" search={{}} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-semibold tabular lg:hidden">{formatKsh(currentUser.balance, { compact: true })}</Link>
        <Button asChild size="sm" className="h-7 px-2 text-xs lg:hidden"><Link to="/wallet" search={{ topup: true }}><Plus /> Top up</Link></Button>
        <NavDrawer avatar={account.avatar} initials={account.initials} />
      </> : <>
        <Link to="/how-it-works" className="hidden text-sm font-medium lg:block">How it works</Link>
        <Button variant="ghost" size="sm" onClick={() => openAuth("signin")}>Log in</Button>
        <Button size="sm" onClick={() => openAuth("signup")}>Sign up</Button>
        <NavDrawer />
      </>}
    </header>
  );
}

const drawerGroups = [
  { title: "Forecast", links: [["/", "Markets"], ["/leaderboard", "Leaderboard"], ["/create", "Create a market"]] },
  { title: "How it works", links: [["/how-it-works", "Getting started"], ["/payouts", "Payouts"], ["/disputes", "Resolutions"]] },
  { title: "Earn", links: [["/invite", "Rewards"], ["/create", "Creator commission"], ["/wallet", "Wallet & M-Pesa"]] },
] as const;

function NavDrawer({ avatar, initials }: { avatar?: string | null; initials?: string }) {
  const { account, openAuth, signOut } = useAuth();
  const { prefs, set } = usePrefs();
  return <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" aria-label="Open navigation">{avatar ? <img src={avatar} alt="" className="size-8 rounded-full object-cover" /> : initials ? <span className="grid size-8 place-items-center rounded-full bg-grape-soft text-xs font-semibold text-grape">{initials}</span> : <Menu />}</Button></SheetTrigger>
    <SheetContent className="flex w-[88vw] flex-col overflow-y-auto sm:max-w-sm"><SheetHeader><SheetTitle>{account ? account.name : "Explore Polka"}</SheetTitle><SheetDescription>{account ? `@${account.username}` : "Forecast events across East Africa."}</SheetDescription></SheetHeader>
      {account && <div className="grid grid-cols-3 gap-2"><Button asChild variant="outline" size="sm"><Link to="/profile/$handle" params={{ handle: account.username }}><User /> Profile</Link></Button><Button asChild variant="outline" size="sm"><Link to="/settings"><Settings /> Settings</Link></Button><Button asChild variant="outline" size="sm"><Link to="/leaderboard"><Trophy /> Ranks</Link></Button></div>}
      <Button variant="outline" className="justify-between" onClick={() => set("theme", prefs.theme === "dark" ? "light" : "dark")}>{prefs.theme === "dark" ? <><Moon /> Dark mode</> : <><Sun /> Light mode</>}<span>Toggle</span></Button>
      <Accordion type="multiple" defaultValue={["Forecast"]}>{drawerGroups.map((group) => <AccordionItem key={group.title} value={group.title}><AccordionTrigger>{group.title}</AccordionTrigger><AccordionContent className="flex flex-col gap-1">{group.links.map(([to, label]) => <Link key={to + label} to={to} className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground">{label}</Link>)}</AccordionContent></AccordionItem>)}</Accordion>
      <div className="mt-auto space-y-1 border-t border-border pt-4"><Link to="/terms" className="block rounded-md px-2 py-2 text-sm">Terms of Service</Link><a href="https://wa.me/254116067033" target="_blank" rel="noreferrer" className="block rounded-md px-2 py-2 text-sm">WhatsApp support · 0116067033</a><button type="button" className="block w-full rounded-md px-2 py-2 text-left text-sm">Language · English</button>{account ? <Button variant="ghost" className="w-full justify-start text-no" onClick={signOut}>Log out</Button> : <div className="grid grid-cols-2 gap-2 pt-2"><Button variant="outline" onClick={() => openAuth("signin")}>Log in</Button><Button onClick={() => openAuth("signup")}>Sign up</Button></div>}</div>
    </SheetContent></Sheet>;
}

function BottomNav() { const pathname = useRouterState({ select: (s) => s.location.pathname }); return <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg lg:hidden"><ul className="grid grid-cols-5">{primaryNav.slice(0,2).map((item) => <NavItem key={item.to} {...item} active={pathname === item.to} />)}<li><Link to="/invite" className="flex flex-col items-center gap-0.5 py-2 text-[0.62rem] text-muted-foreground"><span className="grid size-8 place-items-center rounded-full bg-grape-soft text-grape"><Gift className="size-4" /></span>Rewards</Link></li>{primaryNav.slice(2).map((item) => <NavItem key={item.to} {...item} active={pathname.startsWith(item.to)} />)}</ul></nav>; }
function NavItem({ to, label, icon: Icon, active }: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; active: boolean }) { return <li><Link to={to} className={cn("flex flex-col items-center gap-1 py-3 text-[0.62rem]", active ? "text-primary" : "text-muted-foreground")}><Icon className="size-5" />{label}</Link></li>; }

function SiteFooter() { return <footer className="mt-10 border-t border-border bg-secondary/40 pb-24 lg:pb-0"><div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4"><div><Logo /><p className="mt-3 text-xs leading-relaxed text-muted-foreground">The largest prediction market in East Africa. Forecast events, join shared pools and settle through M-Pesa.</p></div>{drawerGroups.map((group) => <div key={group.title}><h3 className="text-xs font-semibold uppercase text-muted-foreground">{group.title}</h3><ul className="mt-3 space-y-2">{group.links.map(([to,label]) => <li key={to+label}><Link to={to} className="text-sm hover:text-primary">{label}</Link></li>)}</ul></div>)}</div><div className="border-t border-border px-4 py-4 text-center text-xs text-muted-foreground"><Link to="/terms" className="hover:text-primary">Terms</Link> · <a href="https://wa.me/254116067033" target="_blank" rel="noreferrer" className="hover:text-primary">WhatsApp support: 0116067033</a> · 18+</div></footer>; }