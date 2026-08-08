import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import bannerInvite from "@/assets/banner-invite.jpg";
import bannerLearn from "@/assets/banner-learn.jpg";
import bannerPayout from "@/assets/banner-payout.jpg";
import { cn } from "@/lib/utils";

type BannerProps = {
  eyebrow: string;
  title: string;
  body: string;
  cta: string;
  image: string;
  tone: "invite" | "learn" | "payout";
  className?: string;
};

const toneClasses: Record<BannerProps["tone"], string> = {
  invite: "bg-grape-soft",
  learn: "bg-teal-soft",
  payout: "bg-amber-soft",
};

const toneText: Record<BannerProps["tone"], string> = {
  invite: "text-grape",
  learn: "text-teal",
  payout: "text-amber",
};

function Banner({ eyebrow, title, body, cta, image, tone, to, className }: BannerProps & { to: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 overflow-hidden rounded-2xl border border-border p-4 transition-all hover:shadow-lift",
        toneClasses[tone],
        className,
      )}
    >
      <div className="min-w-0">
        <p className={cn("font-display text-[0.65rem] tracking-widest uppercase", toneText[tone])}>{eyebrow}</p>
        <h3 className="mt-1 text-base leading-tight font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-xs leading-relaxed text-foreground/70">{body}</p>
        <span className={cn("mt-2 inline-flex items-center gap-1 text-xs font-semibold", toneText[tone])}>
          {cta} <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <img
        src={image}
        alt=""
        loading="lazy"
        width={1024}
        height={640}
        className="hidden size-24 rounded-xl object-cover sm:block"
      />
    </Link>
  );
}

export function InviteBanner({ className }: { className?: string }) {
  return (
    <Banner
      to="/profile/$handle"
      tone="invite"
      eyebrow="Invite & earn"
      title="Bring three friends, keep 10% of their platform fees"
      body="Forecasting is better with people who argue back. Your invite link pays you for a full year."
      cta="Get your invite link"
      image={bannerInvite}
      className={className}
    />
  );
}

export function LearnBanner({ className }: { className?: string }) {
  return (
    <Banner
      to="/how-it-works"
      tone="learn"
      eyebrow="Sharpen your edge"
      title="Read the pool before you stake"
      body="A five-minute walkthrough of implied probability, pool drift and when the crowd is usually wrong."
      cta="Open the guide"
      image={bannerLearn}
      className={className}
    />
  );
}

export function PayoutBanner({ className }: { className?: string }) {
  return (
    <Banner
      to="/payouts"
      tone="payout"
      eyebrow="Parimutuel payouts"
      title="The pool pays you, not a bookmaker"
      body="Everyone's stake goes into one pool. Correct forecasts split it. Soko never takes a side."
      cta="See the maths"
      image={bannerPayout}
      className={className}
    />
  );
}
