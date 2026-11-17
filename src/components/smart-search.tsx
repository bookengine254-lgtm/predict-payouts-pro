import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, TrendingUp, X } from "lucide-react";
import { markets, totalPool } from "@/lib/mock-data";
import { formatKsh } from "@/lib/parimutuel";

const topics = ["Ruto", "Gor Mahia", "Bitcoin", "Shilling", "Rain", "EPL"];

export function SmartSearch() {
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const open = markets.filter((m) => m.status === "open");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    const list = s
      ? open.filter((m) => `${m.question} ${m.shortTitle} ${m.category}`.toLowerCase().includes(s))
      : [...open].sort((a, b) => totalPool(b) - totalPool(a));
    return list.slice(0, 6);
  }, [q, open]);

  return (
    <div className="relative z-30 mt-1">
      <div className="flex h-12 items-center gap-2 rounded-xl border border-border bg-card px-3 focus-within:border-primary">
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
          placeholder="Search markets, teams, topics…"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        {q && (
          <button type="button" aria-label="Clear" onClick={() => setQ("")}>
            <X className="size-4 text-muted-foreground" />
          </button>
        )}
      </div>
      {focus && (
        <div className="absolute inset-x-0 top-14 rounded-xl border border-border bg-popover p-2 shadow-card">
          {!q && (
            <div className="flex flex-wrap gap-1.5 p-1.5">
              {topics.map((t) => (
                <button key={t} type="button" onMouseDown={(e) => { e.preventDefault(); setQ(t); }} className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium">
                  {t}
                </button>
              ))}
            </div>
          )}
          <p className="flex items-center gap-1.5 px-2 pt-1 pb-1 text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
            <TrendingUp className="size-3" /> {q ? `${results.length} results` : "Recommended for you"}
          </p>
          {results.map((m) => (
            <Link key={m.id} to="/market/$marketId" params={{ marketId: m.id }} className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 hover:bg-accent">
              <span className="min-w-0 truncate text-sm">{m.question}</span>
              <span className="shrink-0 text-xs text-muted-foreground tabular">{formatKsh(totalPool(m), { compact: true })}</span>
            </Link>
          ))}
          {results.length === 0 && <p className="px-2 py-3 text-sm text-muted-foreground">No markets match “{q}”.</p>}
        </div>
      )}
    </div>
  );
}
