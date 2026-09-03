import { cn } from "@/lib/utils";
import { toneSoft } from "./tone";
import type { Market } from "@/lib/mock-data";
import { categoryOf } from "@/lib/mock-data";

/**
 * Compact square thumbnail for the top-left of a market card.
 * Uses the uploaded image when present, otherwise a tinted emoji placeholder
 * derived from the market's category.
 */
export function MarketThumb({
  market,
  size = "md",
  className,
}: {
  market: Pick<Market, "thumbnail" | "thumbnailEmoji" | "category" | "shortTitle">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = categoryOf(market.category).tone;
  const dims = size === "sm" ? "size-9 text-lg" : size === "lg" ? "size-16 text-3xl" : "size-13 text-xl";

  if (market.thumbnail) {
    return (
      <img
        src={market.thumbnail}
        alt=""
        loading="lazy"
        className={cn("shrink-0 rounded-xl object-cover", dims, className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-xl border border-border/60",
        toneSoft[tone],
        dims,
        className,
      )}
    >
      {market.thumbnailEmoji}
    </span>
  );
}

/**
 * Side-by-side crest pair for fixture (versus) markets. Occupies the same
 * footprint as a single MarketThumb so a VS card never grows taller than the
 * binary card beside it.
 */
export function VersusThumb({
  market,
  size = "md",
  className,
}: {
  market: Pick<Market, "versus" | "sports" | "category" | "thumbnailEmoji">;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const tone = categoryOf(market.category).tone;
  const dims = size === "sm" ? "size-8 text-sm" : size === "lg" ? "size-12 text-2xl" : "size-9.5 text-base";
  const v = market.versus;

  const side = (thumb: string | undefined, emoji: string, label: string) =>
    thumb ? (
      <img src={thumb} alt={label} loading="lazy" className={cn("rounded-lg object-cover", dims)} />
    ) : (
      <span aria-hidden="true" className={cn("grid place-items-center rounded-lg border border-border/60", toneSoft[tone], dims)}>
        {emoji}
      </span>
    );

  return (
    <span className={cn("flex shrink-0 items-center gap-1", className)}>
      {side(v?.homeThumb, v?.homeEmoji ?? market.thumbnailEmoji, market.sports?.home ?? "Home")}
      <span className="font-display text-[0.6rem] tracking-wide text-muted-foreground">VS</span>
      {side(v?.awayThumb, v?.awayEmoji ?? market.thumbnailEmoji, market.sports?.away ?? "Away")}
    </span>
  );
}
