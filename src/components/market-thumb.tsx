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
  const dims = size === "sm" ? "size-8 text-base" : size === "lg" ? "size-14 text-2xl" : "size-11 text-lg";

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
