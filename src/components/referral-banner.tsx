import { useEffect, useState } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

const REFERRAL_KEY = "polka-referrer";

export function ReferralBanner() {
  const { account, openAuth } = useAuth();
  const [referrer, setReferrer] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const incoming = params.get("ref")?.trim().replace(/[^a-zA-Z0-9_]/g, "");
    if (incoming) window.localStorage.setItem(REFERRAL_KEY, incoming);
    setReferrer(incoming || window.localStorage.getItem(REFERRAL_KEY));
  }, []);

  if (!referrer || account || hidden) return null;

  return (
    <aside className="mb-4 flex items-center gap-3 rounded-xl border border-grape/25 bg-grape-soft px-3 py-2.5 text-grape">
      <Gift className="size-5 shrink-0" />
      <p className="min-w-0 flex-1 text-xs sm:text-sm">
        <strong className="capitalize">{referrer}</strong> invited you. Sign up to claim your reward.
      </p>
      <Button size="sm" onClick={() => openAuth("signup")}>Claim now</Button>
      <Button variant="ghost" size="icon" aria-label="Dismiss invitation" onClick={() => setHidden(true)}>
        <X />
      </Button>
    </aside>
  );
}