import { Link } from "@tanstack/react-router";

/**
 * Temporary wordmark. Swap the glyph for the uploaded logo asset when it lands.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Soko home">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[0.6rem] bg-primary font-display text-lg leading-none text-primary-foreground"
      >
        S
      </span>
      {!compact && (
        <span className="font-display text-xl leading-none tracking-wide text-foreground">
          SOKO<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  );
}
