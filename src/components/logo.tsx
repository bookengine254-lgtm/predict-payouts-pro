import { Link } from "@tanstack/react-router";
import navy from "@/assets/polka-navy.png.asset.json";
import white from "@/assets/polka-white.png.asset.json";
import { cn } from "@/lib/utils";

/**
 * Polka script wordmark. The navy cutout carries light mode, the white cutout
 * carries dark mode — swapped with CSS so both themes stay crisp and there is
 * no flash on hydration. Heights are fixed per breakpoint so the brand row
 * never shifts.
 */
export function Logo({ compact = false, className }: { compact?: boolean; className?: string }) {
  const height = compact ? "h-6 sm:h-7" : "h-7 sm:h-8 lg:h-9";

  return (
    <Link to="/" className={cn("flex shrink-0 items-center", className)} aria-label="Polka home">
      <img src={navy.url} alt="Polka" className={cn("w-auto dark:hidden", height)} />
      <img src={white.url} alt="" aria-hidden="true" className={cn("hidden w-auto dark:block", height)} />
    </Link>
  );
}
