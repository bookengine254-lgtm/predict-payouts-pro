import { useState } from "react";
import { Heart, ImagePlus, MessageCircle, Send } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { formatKsh } from "@/lib/parimutuel";
import { useAuth } from "@/hooks/use-auth";
import type { Market } from "@/lib/mock-data";
import { Button } from "./ui/button";

type Side = { label: string; stake: number; tone: "yes" | "no" | "primary" } | null;
type Comment = { id: string; who: string; initials: string; when: string; text: string; gif?: string; likes: number; liked?: boolean; side: Side; replies: Comment[] };

const GIFS = [
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif",
  "https://media.giphy.com/media/26ufdipQqU2lhNA4g/giphy.gif",
  "https://media.giphy.com/media/111ebonMs90YLu/giphy.gif",
];

function seed(m: Market): Comment[] {
  const a = m.outcomes[0]!.label, b = m.outcomes[m.outcomes.length - 1]!.label;
  return [
    { id: "c1", who: "amina_k", initials: "AK", when: "2h", likes: 24, side: { label: a, stake: 1500, tone: "yes" },
      text: "Pool is leaning heavy here, but the criteria only counts the published statement — careful.",
      replies: [{ id: "c1r1", who: "brian_o", initials: "BO", when: "1h", likes: 6, side: { label: b, stake: 800, tone: "no" }, text: "That's exactly why I'm on the other side. Implied looks 6 points off.", replies: [] }] },
    { id: "c2", who: "wanjiru", initials: "WM", when: "5h", likes: 11, side: null, text: "Sources listed are solid. Cleanest resolution wording I've seen on Polka.", replies: [] },
  ];
}

function SideBadge({ side }: { side: Side }) {
  if (!side) return <span className="rounded-full bg-secondary px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">Spectator</span>;
  return (
    <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-semibold tabular",
      side.tone === "no" ? "bg-no-soft text-no" : side.tone === "yes" ? "bg-yes-soft text-yes" : "bg-secondary text-primary")}>
      {side.label} · {formatKsh(side.stake, { compact: true })}
    </span>
  );
}

function Composer({ onPost, placeholder, autoFocus }: { onPost: (text: string, gif?: string) => void; placeholder: string; autoFocus?: boolean }) {
  const [text, setText] = useState("");
  const [gif, setGif] = useState<string | undefined>();
  const [picker, setPicker] = useState(false);
  return (
    <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); if (!text.trim() && !gif) return; onPost(text.trim(), gif); setText(""); setGif(undefined); setPicker(false); }}>
      <textarea autoFocus={autoFocus} value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={placeholder}
        className="w-full resize-none rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
      {gif && <div className="relative w-32"><img src={gif} alt="Selected GIF" className="rounded-lg" /><button type="button" onClick={() => setGif(undefined)} className="absolute right-1 top-1 rounded-full bg-background/80 px-1.5 text-xs">✕</button></div>}
      {picker && <div className="grid grid-cols-4 gap-1.5">{GIFS.map((g) => <button key={g} type="button" onClick={() => { setGif(g); setPicker(false); }}><img src={g} alt="GIF option" className="aspect-square w-full rounded-md object-cover" loading="lazy" /></button>)}</div>}
      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" size="sm" onClick={() => setPicker((v) => !v)}><ImagePlus /> GIF</Button>
        <Button type="submit" size="sm" className="bg-yes text-primary-foreground hover:bg-yes/90"><Send /> Post</Button>
      </div>
    </form>
  );
}

function Node({ c, depth, onLike, onReply }: { c: Comment; depth: number; onLike: (id: string) => void; onReply: (id: string, text: string, gif?: string) => void }) {
  const [replying, setReplying] = useState(false);
  const { account, openAuth } = useAuth();
  return (
    <li className="relative">
      <div className="flex gap-2.5">
        <div className="flex flex-col items-center">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary font-display text-xs">{c.initials}</span>
          {(c.replies.length > 0 || replying) && <span className="mt-1 w-0.5 flex-1 rounded-full bg-border" />}
        </div>
        <div className="min-w-0 flex-1 pb-3">
          <p className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-foreground">@{c.who}</span>
            <SideBadge side={c.side} />
            <span className="text-muted-foreground">· {c.when}</span>
          </p>
          {c.text && <p className="mt-1 text-sm leading-relaxed">{c.text}</p>}
          {c.gif && <img src={c.gif} alt="GIF" className="mt-2 max-h-48 rounded-xl" loading="lazy" />}
          <div className="mt-1.5 flex items-center gap-4 text-xs text-muted-foreground">
            <button type="button" onClick={() => (account ? setReplying((v) => !v) : openAuth("signup"))} className="flex items-center gap-1 hover:text-primary"><MessageCircle className="size-3.5" /> {c.replies.length || "Reply"}</button>
            <button type="button" onClick={() => (account ? onLike(c.id) : openAuth("signup"))} className={cn("flex items-center gap-1 hover:text-no", c.liked && "text-no")}><Heart className={cn("size-3.5", c.liked && "fill-current")} /> {c.likes}</button>
          </div>
          {replying && <div className="mt-2"><Composer autoFocus placeholder={`Reply to @${c.who}…`} onPost={(t, g) => { onReply(c.id, t, g); setReplying(false); }} /></div>}
        </div>
      </div>
      {c.replies.length > 0 && (
        <ul className={cn(depth < 3 && "ml-[1.1rem] border-l-2 border-border pl-3")}>
          {c.replies.map((r) => <Node key={r.id} c={r} depth={depth + 1} onLike={onLike} onReply={onReply} />)}
        </ul>
      )}
    </li>
  );
}

const map = (list: Comment[], id: string, fn: (c: Comment) => Comment): Comment[] =>
  list.map((c) => (c.id === id ? fn(c) : { ...c, replies: map(c.replies, id, fn) }));

export function CommentThread({ market }: { market: Market }) {
  const { account, openAuth } = useAuth();
  const [items, setItems] = useState(() => seed(market));
  const mine = (text: string, gif?: string): Comment => ({ id: crypto.randomUUID(), who: account?.username ?? "you", initials: account?.initials ?? "YO", when: "now", text, ...(gif ? { gif } : {}), likes: 0, side: null, replies: [] });
  return (
    <section className="rounded-2xl bg-card p-4">
      <h2 className="mb-3 text-sm font-semibold">Discussion</h2>
      {account ? (
        <div className="mb-4"><Composer placeholder="Share your read on this market…" onPost={(t, g) => { setItems((p) => [mine(t, g), ...p]); toast.success("Posted"); }} /></div>
      ) : (
        <button type="button" onClick={() => openAuth("signup")} className="mb-4 w-full rounded-xl border border-dashed border-border p-3 text-sm font-semibold text-primary">Log in to join the discussion</button>
      )}
      <ul>
        {items.map((c) => <Node key={c.id} c={c} depth={0}
          onLike={(id) => setItems((p) => map(p, id, (x) => ({ ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) })))}
          onReply={(id, t, g) => setItems((p) => map(p, id, (x) => ({ ...x, replies: [...x.replies, mine(t, g)] })))} />)}
      </ul>
    </section>
  );
}
