import { useEffect, useMemo, useRef, useState } from "react";
import { Copy, Download, Loader2, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { formatKsh, formatPct } from "@/lib/parimutuel";

type ShareOutcome = { label: string; probability: number };

export function ShareMarketDialog({
  question,
  marketId,
  volume,
  outcomes,
  trigger,
  open: openProp,
  onOpenChange,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  question: string;
  marketId: string;
  volume: number;
  outcomes: ShareOutcome[];
  trigger?: React.ReactNode;
}) {
  const { account } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [openState, setOpenState] = useState(false);
  const open = openProp ?? openState;
  const setOpen = (v: boolean) => { setOpenState(v); onOpenChange?.(v); };
  const [generating, setGenerating] = useState(false);
  const [ready, setReady] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const url = useMemo(() => {
    if (typeof window === "undefined") return `/market/${marketId}`;
    const link = new URL(`/market/${marketId}`, window.location.origin);
    link.searchParams.set("ref", account?.username || "polka");
    return link.toString();
  }, [account?.username, marketId, open]);
  const message = `${question} 🎯 Join prediction to win KSh. Claim KSh 50 free on Polka: ${url}`;

  const generate = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerating(true);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const css = getComputedStyle(document.documentElement);
    const navy = css.getPropertyValue("--share-navy").trim() || "#14213d";
    const green = css.getPropertyValue("--share-green").trim() || "#22c55e";
    const coral = css.getPropertyValue("--share-coral").trim() || "#fb7185";
    ctx.fillStyle = navy;
    ctx.fillRect(0, 0, 1200, 630);
    ctx.fillStyle = green;
    ctx.fillRect(0, 0, 24, 630);
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 44px Geist, Arial, sans-serif";
    ctx.fillText("POLKA", 72, 82);
    ctx.font = "600 24px Geist, Arial, sans-serif";
    ctx.fillStyle = "#b8c3d9";
    ctx.fillText("JOIN PREDICTION TO WIN KSH", 72, 126);
    ctx.fillStyle = coral;
    ctx.beginPath();
    ctx.roundRect(900, 48, 228, 70, 18);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = "700 25px Geist, Arial, sans-serif";
    ctx.fillText("CLAIM KSh 50", 928, 92);
    ctx.font = "700 54px Geist, Arial, sans-serif";
    const words = question.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const test = `${line}${word} `;
      if (ctx.measureText(test).width > 1025 && line) { lines.push(line.trim()); line = `${word} `; }
      else line = test;
    }
    lines.push(line.trim());
    lines.slice(0, 3).forEach((value, index) => ctx.fillText(value, 72, 220 + index * 67));
    ctx.font = "600 30px Geist, Arial, sans-serif";
    outcomes.slice(0, 3).forEach((outcome, index) => {
      const x = 72 + index * 340;
      ctx.fillStyle = "#263654";
      ctx.beginPath();
      ctx.roundRect(x, 440, 310, 82, 16);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${outcome.label}  ${formatPct(outcome.probability)}`, x + 24, 492);
    });
    ctx.fillStyle = "#b8c3d9";
    ctx.font = "500 24px Geist, Arial, sans-serif";
    ctx.fillText(`${formatKsh(volume, { compact: true })} volume  •  polka`, 72, 584);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (blob) setFile(new File([blob], "polka-market.png", { type: "image/png" }));
    setReady(true);
    setGenerating(false);
  };

  const shareNative = async () => {
    if (!file) return;
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ title: question, text: message, url, files: [file] });
      return;
    }
    await navigator.clipboard.writeText(message);
    download();
    toast.success("Image downloaded and link copied");
  };

  const download = () => {
    if (!file) return;
    const href = URL.createObjectURL(file);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = file.name;
    anchor.click();
    URL.revokeObjectURL(href);
  };

  useEffect(() => {
    if (openProp && !ready) { const t = window.setTimeout(() => void generate(), 50); return () => window.clearTimeout(t); }
    return undefined;
  }, [openProp]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Dialog open={open} onOpenChange={(next) => { setOpen(next); if (next && !ready) window.setTimeout(() => void generate(), 50); }}>
      <DialogTrigger asChild>{trigger ?? <Button><Share2 /> Share this market</Button>}</DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Share this market</DialogTitle>
          <DialogDescription>Your market image and referral link are prepared together.</DialogDescription>
        </DialogHeader>
        <canvas ref={canvasRef} width={1200} height={630} className="aspect-[1200/630] w-full rounded-lg border border-border bg-primary" />
        <div className="grid gap-2 sm:grid-cols-4">
          <Button onClick={() => void shareNative()} disabled={!ready}>{generating ? <Loader2 className="animate-spin" /> : <Share2 />} Share</Button>
          <Button variant="outline" onClick={download} disabled={!ready}><Download /> Image</Button>
          <Button variant="outline" onClick={() => { void navigator.clipboard.writeText(message); toast.success("Link and caption copied"); }}><Copy /> Copy link</Button>
          <Button asChild variant="outline"><a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer">WhatsApp</a></Button>
        </div>
        <p className="text-xs text-muted-foreground">X and WhatsApp may not attach local images automatically. If needed, use Image, then paste the copied caption.</p>
      </DialogContent>
    </Dialog>
  );
}