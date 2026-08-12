import { Link } from "@tanstack/react-router";

/**
 * Polka wordmark — text only, no glyph badge.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center" aria-label="Polka home">
      <span className="font-display text-xl leading-none tracking-wide text-foreground sm:text-2xl">
        {compact ? "P" : "POLKA"}
        <span className="text-yes">.</span>
      </span>
    </Link>
  );
}
