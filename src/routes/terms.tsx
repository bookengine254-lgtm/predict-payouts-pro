import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/app-shell";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms of Service — Polka" },
      { name: "description", content: "Terms for using Polka's skill-based prediction markets, M-Pesa payments, resolutions and disputes." },
      { property: "og:title", content: "Terms of Service — Polka" },
      { property: "og:description", content: "Rules for participation, shared prediction pools, payments, resolutions and disputes on Polka." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TermsPage,
});

const sections = [
  ["Eligibility", "You must be at least 18 years old and legally able to use skill-based forecasting services in your location."],
  ["Skill-based forecasting", "Polka operates shared parimutuel pools. Participants forecast outcomes against one another; Polka does not set fixed odds or take a position in a market."],
  ["Markets and resolution", "Every market states its closing time, outcome choices, resolution criteria and sources. Markets may be reviewed for clarity before publication. The published criteria determine the result."],
  ["Deposits and withdrawals", "M-Pesa deposits must come from an account you are authorised to use. Withdrawals may be delayed for verification, risk checks, payment-network availability or an unresolved market."],
  ["Fees", "Applicable platform and creator fees are shown before a forecast is confirmed. Payouts are calculated from the final shared pool after disclosed fees."],
  ["Disputes", "A resolution may be challenged during the stated dispute window. Polka may review the cited sources, request more evidence, correct an error or uphold the original result."],
  ["Responsible participation", "Forecast only with money you can afford to lose. Polka may suspend activity that appears fraudulent, abusive or harmful."],
] as const;

function TermsPage() {
  return (
    <AppShell>
      <article className="mx-auto max-w-3xl">
        <header className="border-b border-border pb-6">
          <p className="text-xs font-semibold uppercase text-primary">Polka</p>
          <h1 className="mt-2 text-3xl font-semibold">Terms of Service</h1>
          <p className="mt-2 text-sm text-muted-foreground">Effective 2 October 2026</p>
        </header>
        <div className="divide-y divide-border">
          {sections.map(([title, body]) => (
            <section key={title} className="py-6">
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm leading-7 text-muted-foreground">{body}</p>
            </section>
          ))}
        </div>
        <p className="border-t border-border py-6 text-sm text-muted-foreground">
          Questions? Contact support on <a className="font-semibold text-primary" href="https://wa.me/254116067033" target="_blank" rel="noreferrer">WhatsApp at 0116067033</a>.
        </p>
      </article>
    </AppShell>
  );
}