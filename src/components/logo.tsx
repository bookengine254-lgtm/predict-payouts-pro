import { Link } from "@tanstack/react-router";

/**
 * Polka wordmark. Swap the glyph for the uploaded logo asset when it lands.
 */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2" aria-label="Polka home">
      <span
        aria-hidden="true"
        className="grid size-8 place-items-center rounded-[0.6rem] bg-primary font-display text-lg leading-none text-primary-foreground"
      >
        P
      </span>
      {!compact && (
        <span className="font-display text-xl leading-none tracking-wide text-foreground">
          POLKA<span className="text-yes">.</span>
        </span>
      )}
    </Link>
  );
}
