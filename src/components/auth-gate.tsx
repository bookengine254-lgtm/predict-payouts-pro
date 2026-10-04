import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";

import { useAuth } from "@/hooks/use-auth";
import { Button } from "./ui/button";

export function AuthGate({ children, feature }: { children: ReactNode; feature: string }) {
  const { account, ready, openAuth } = useAuth();

  if (!ready) {
    return <div className="mx-auto mt-16 h-72 max-w-xl animate-pulse rounded-lg bg-muted" aria-label="Loading account" />;
  }

  if (!account) {
    return (
      <section className="mx-auto my-16 flex max-w-xl flex-col items-center rounded-lg border border-border bg-card px-6 py-14 text-center shadow-card lg:my-24">
        <span className="grid size-12 place-items-center rounded-full bg-primary-soft text-primary">
          <LockKeyhole className="size-5" />
        </span>
        <h1 className="mt-5 text-2xl font-semibold">Sign in to access {feature}</h1>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Your balance, forecasts and personal activity stay private and are only available from your account.
        </p>
        <Button className="mt-6" size="lg" onClick={() => openAuth("signin")}>
          Log in or sign up
        </Button>
      </section>
    );
  }

  return children;
}