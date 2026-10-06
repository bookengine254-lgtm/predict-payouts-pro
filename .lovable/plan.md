# Polka live-data and experience overhaul

## What will change
- Restore the original light/dark Polka wordmark and retain a fixed, single-row header with green account actions.
- Put mobile search before All; keep highlights visible only for All, without private guest statistics.
- Balance four-column desktop cards with compact binary and sports controls, stacked multi-outcome rows, readable text, and matching loading placeholders.
- Add restrained rolling numbers and floating changes driven by actual updates, respecting reduced motion.
- Let visitors select outcomes and preview payouts; require a real account only when confirming or posting.
- Enforce one outcome per person per market in both the trading panel and the database; additional forecasts add to that position.
- Replace mock comments with persistent threaded discussions, replies, likes, sharing, GIF upload/picker and previews. Position badges expose only deliberately public discussion information, never wallets or private transaction history.
- Organize Settings into four sections and Profile into active positions, past forecasts, created markets, and reputation.
- Replace mock reads and simulated writes across markets, portfolio, wallet, profiles, comments and other account pages with consistent live data. Show honest empty/error states instead of invented balances, success messages or records.

## Security and accuracy
- Keep account-only presentation behind the shared AuthGate until a real session is ready; local browser data cannot authenticate a user.
- Preserve current public URLs and existing backend integration files. Add migrations with explicit grants and row-level security.
- Reference public profiles for new user relationships, not the managed authentication schema. Public profile reads must exclude phone numbers and account preferences.
- Use “East Africa’s prediction market · M-Pesa” until the “largest” claim can be substantiated. Do not imply live payment settlement until it is verified.
- Wallet reads and transaction history will be live; actual M-Pesa deposits/withdrawals require the payment-provider integration and verification, not simulated confirmations.

## Technical details
- Keep TanStack Start, TanStack Query and existing semantic colors. Use authenticated server functions for private operations and public server functions for public market reads.
- Audit existing schema and stored procedures before extending them. Make staking atomic, reject opposing outcomes and closed markets, and preserve the transaction ledger.
- Subscribe to authorized realtime updates with cleanup; update query caches without reloading pages. Use the same market/pool adapter everywhere, including evenly split probabilities for empty pools.
- Use private-owner reads for pending or hidden created markets. Store GIF media through the app’s storage with file validation and upload authorization.
- Add a lean implementation checklist and document structural decisions for the developer.

## Verification
- Check preview diagnostics and targeted tests; verify public versus account-only reads and opposing-outcome rejection.
- Exercise signup/sign-in, guest payout previews, comments/replies/media, Settings saves and Profile tabs where hosted access permits.
- Inspect 375px, 450px and 1280px layouts for header wrapping, overflowing cards, loading stability and discussion placement.
- Inspect route metadata and report any remaining payment, provider or verification blockers explicitly.