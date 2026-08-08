# Soko — Skill-Based Forecasting Market (v1 frontend skeleton)

A mobile-first parimutuel forecasting app with M-Pesa-style top-ups, creator-launched markets, and AI review/resolution. Framed strictly as **skill-based forecasting** — never betting, never bookmaking. All copy uses "forecast", "stake", "pool", "payout", "accuracy", "edge".

## Design language

- **Type:** Oswald for titles/numbers (condensed, tickerish), a clean sans for body.
- **Palette:** navy as the primary action colour; green / red / purple / orange / teal reserved for outcome pills, category chips, odds trend lines, and pool bars. Light, airy surfaces with hairline borders and soft depth — minimal but high-information.
- **Market cards:** compact, Polymarket-like. Small rounded thumbnail top-left, question in 2 lines max, Yes/No (or multi-outcome) percentage pills, pool volume + closing time footer, tiny sparkline of odds trend. Uploadable thumbnail with a subtle generated placeholder when empty.
- **Human, colourful banners:** invite-a-friend, streaks, "how payouts work", creator earnings — illustrated people-forward cards in the feed and profile, in the style of app-invite/referral cards.
- **Navigation:** bottom tab bar on mobile (Markets, Portfolio, Create, Activity, Profile); on desktop a top bar with logo, search, categories, wallet chip, plus a left menu rail on interior pages. Same components, responsive rules.
- **Motion:** restrained. Route transitions show a skeleton loading state (cards, chart, table skeletons), numbers tick, pills fill.

## Pages

1. **Home / Discover** — category chips, trending / new / closing-soon rails, live volume ticker, compact card grid (1 col mobile, 2–3 desktop), invite + tips banners.
2. **Market detail** — question header with thumbnail, parimutuel pool visualisation, odds trend graph (timeframe toggle), stake panel with live payout estimate ("if correct, you receive ~X"), rules, resolution source, AI review badge, comments, holders/forecasters list, share sheet.
3. **Create market** — question, category, thumbnail upload, outcomes, close time, resolution criteria, **required seed liquidity** to balance the market, creator commission slider, AI pre-review step (approve / decline / "AI fixes it for a fee"), preview card, share-on-publish screen.
4. **Portfolio** — open positions, accuracy score, P/L, resolved history, claimable payouts.
5. **Wallet** — balance, simulated Palpluss/M-Pesa top-up & withdraw flow (phone number → STK-style prompt → pending → success/fail states), transaction ledger. Secrets/live integration wired later.
6. **Activity / Notifications** — resolutions, payouts, price moves, market approvals, disputes.
7. **Leaderboard** — top forecasters by accuracy and returns, top creators by fees earned, follow / copy-forecast entry point.
8. **Public profile** — accuracy stats, history, follow + copy-forecast (bots noted as later), creator markets and earnings.
9. **Creator earnings dashboard** — commission per market, volume, payouts.
10. **Resolution & Disputes centre** — AI resolution outcome, evidence, dispute submission, dispute status timeline.
11. **Settings** — account, payout defaults, notifications, appearance, limits/self-control, security.
12. **Static/footer pages** — How it works, Payout & parimutuel rules, Fees, Skill-based forecasting policy, Responsible play, Support/FAQ, Terms, Privacy, About.

## Parimutuel mechanics (v1, client-side)

All stakes on an outcome form pools. On resolution, losing pools are distributed pro-rata to winning stakes after fees:

```text
payout_i = stake_i + (stake_i / winning_pool) * (losing_pool - total_fees)
```

Displayed live as implied probability (pool share) and estimated payout multiple. No fixed odds, no house exposure — the platform never takes a position.

## Monetization design (documented in-app + in a strategy note)

- Platform fee on the losing pool at resolution (headline take rate).
- Creator commission on their own market's pool — the viral engine.
- AI services: paid market fix-up, priority review, premium resolution sources.
- Dispute filing fee, refunded if the dispute succeeds.
- Withdrawal / rails fee, instant-payout premium.
- Pro subscription: advanced analytics, copy-forecast, unlimited market creation, lower fees.
- Boosted/featured market placement, sponsored categories.
- Retention loops that drive volume: daily free forecast, streaks, accuracy tiers, referral revenue share, leaderboard seasons.

## Technical notes

- TanStack Start routes per page (no hash sections), each with its own `head()` — unique H1, title, description, og/twitter tags, JSON-LD where relevant, plus a dynamic `/sitemap.xml` route and `robots.txt`.
- Design tokens (navy primary, accent scale, radii, fonts) in `src/styles.css` under `@theme`; Oswald + body sans loaded via `<link>` in `__root.tsx`. No hardcoded colour utilities.
- Shared shell component handles bottom tabs (mobile) / top bar + menu rail (desktop), plus route pending skeletons.
- Realistic seeded mock data module (markets, pools, price history, users, transactions) so every screen is fully clickable; charts via lightweight SVG/Recharts-style sparklines and full trend chart.
- Logo: dropped in as soon as pasted, applied to header, splash, and favicon at all sizes.
- No backend in v1 — Cloud (auth, DB, wallet ledger, real AI review/resolution, Palpluss integration) is the next phase and the mock layer is shaped to swap into it cleanly.

## Not in v1

Real money movement, real AI calls, accounts, copy-trade execution, bots — all stubbed with realistic UI.
