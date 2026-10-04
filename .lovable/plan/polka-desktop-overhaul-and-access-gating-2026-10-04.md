# Polka desktop overhaul and access gating

## Scope
- Rebuild the shared shell around one centered `max-w-7xl` desktop container, with a 64px market-style header, desktop navigation/search/account actions, and a signed-out action dock.
- Update the home feed so category selection hides the highlights carousel, category and sort controls share one desktop ribbon, and markets use a stable four-column desktop grid.
- Make market cards equal-height and refine their outcome and market-status rows using existing semantic colors.
- Optimize the requested pages for desktop: 65/35 market desk, wider portfolio/wallet views, data-focused leaderboard/activity views, and a wider creation form with sticky preview.
- Add reusable signed-out locked states to Portfolio, Wallet, Activity, Create, Settings, and Rewards; require signup before selecting or confirming a forecast.
- Preserve existing mobile navigation and responsive behavior.

## Technical details
- Keep TanStack Router and existing route files; do not modify generated routes.
- Keep the existing local session provider for this presentation pass; gates read its hydrated account state and open the existing auth sheet.
- Use the existing button component and semantic design tokens; avoid new backend or payment work.
- Verify the latest preview build diagnostics, then test desktop and mobile layouts and signed-out interactions in the browser.
