import { Link, useRouterState } from "@tanstack/react-router";
import { Plus } from "lucide-react";

/**
 * Two thumb-reach actions only, and only on the markets feed on small screens:
 * a quick M-Pesa top-up and the create-market plus button.
 */
export function QuickActions() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname !== "/") return null;

  return (
    <>
      <div className="fixed right-4 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 lg:hidden">
        <Link
          to="/create"
          aria-label="Create a market"
          className="grid size-14 place-items-center rounded-full bg-primary text-primary-foreground bevel-raised press"
        >
          <Plus className="size-7" />
        </Link>
      </div>

    </>
  );
}
