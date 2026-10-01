# Polka Frontend UI & Layout Overhaul

## Goal
Deliver the complete visual and interaction overhaul in one coordinated frontend pass while preserving the current mock market, wallet, forecasting, and authentication behavior.

## What will change

### 1. Global typography and brand metadata
- Replace Oswald and DM Sans with Geist Sans throughout headings, body text, and numeric displays.
- Load Geist through the document head and update the global font tokens.
- Update the homepage and shared metadata to “Polka — The Largest Prediction Market in East Africa” and the supplied East Africa/M-Pesa tagline.

### 2. Balanced application shell
- Remove the desktop left navigation rail and center all pages in a consistent `max-w-6xl` content area.
- Rebuild the desktop header into separate signed-in and signed-out states.
  - Signed in: logo, persistent market search, portfolio value, cash balance, deposit, rewards, notifications, and profile avatar.
  - Signed out: logo, search, How it works, Log in, Sign up, and menu trigger.
- Add a right slide-out navigation drawer using the existing Sheet, Accordion, Button, auth, and preference systems.
  - Signed-in drawer: profile, settings, leaderboard, theme control, grouped Forecasts/How it Works/Earn links, terms, WhatsApp support, and logout pinned last.
  - Signed-out drawer: key public links, theme control, WhatsApp support, and sign-in/register action.
- Keep the mobile bottom navigation; reduce the mobile home floating actions to only the create button.
- Move bottom-page spacing into the footer and add Terms plus the official WhatsApp support link.

### 3. Compact market feed
- Remove card sparklines and trend-point labels.
- Keep cards uniform and compact with controlled title/outcome regions so content cannot spill or stretch one card independently.
- Color probabilities by threshold: below 50% coral, exactly 50% amber, above 50% green.
- Show compact volume, trader counts, and resolution countdowns.
- Use an auto-fill grid with a 270px minimum card width, producing four columns on standard desktop widths when space permits.

### 4. Category browsing
- Add an in-page category selector aligned with the market content.
- In All mode, show the personal highlight carousel followed by grouped category shelves.
- In a focused category, remove the carousel entirely and show only that category with Trending, New, and Closing Soon sorting.
- Preserve URL-based category selection so sections open immediately and remain shareable.

### 5. Market creation polish
- Add a required resolution date/time control in the first creation step with 24 Hours, End of Week, End of Month, and custom date/time options.
- Add independent Home and Away crest controls for sports markets, each supporting an uploaded image or emoji plus its team name.
- Update the sticky preview to render the uploaded non-sports thumbnail, or a dual-crest VS treatment for sports.
- Preserve the current creation wizard, seeding, commission, and AI-review simulation.

### 6. Share card and referral entry experience
- Add a reusable Share Market dialog opened from market detail and the creation success screen.
- Generate a large 1200×630 PNG entirely in the browser with Canvas: Polka branding, “JOIN PREDICTION TO WIN KSH,” KSh 50 reward, current question, volume, and outcome probabilities.
- Build referral URLs from the current site origin and signed-in handle; never hardcode a deployment domain.
- On supported mobile devices, share the PNG file and referral link with the native share sheet.
- On desktop, copy the complete referral message/link and provide WhatsApp and X actions; clearly handle platforms that cannot attach a generated local image through URL intents.
- Detect `?ref=handle`, retain it locally, and show a compact invitation banner on home and market detail. Its claim action opens the existing signup sheet.

### 7. Market detail restructuring
- Replace Description / My position / My forecasts tabs with accessible collapsible sections:
  - Market Context with the exact experimental AI-summary disclaimer.
  - Description & Resolution Rules with criteria, AI audit state, resolution/dispute state, and independently clickable source links.
  - Top Forecasters with rank, avatar, accuracy, and compact volume.
- Convert “More in {Category}” from full cards to a compact thumbnail/question/odds list.
- Place this list below the forecast panel on desktop and below comments on mobile, without duplicating it visually.
- Retain the existing odds chart, poll, creator information, comments, and fixed mobile forecast controls.

### 8. Terms page
- Add a dedicated Terms of Service route with unique metadata.
- Cover 18+ eligibility, skill-based parimutuel forecasting, market creation and resolution, M-Pesa deposits/withdrawals, disputes, and responsible participation.
- Link it from both the footer and right drawer.

## Technical details
- Reuse existing semantic color tokens, route Links, Button, Sheet, Accordion, auth sheet, preferences, market thumbnails, and mock-data helpers.
- Add small focused components for the drawer, referral banner, compact related-market row, crest uploader, and share dialog where this keeps route files manageable.
- Keep all current URLs valid and create the `/terms` route in the same change as its links.
- Keep this pass frontend-only: no schema, payment, live referral-credit, or backend changes.

## Verification
- Check the build diagnostics after edits and fix any existing or introduced failures.
- Exercise signed-in and signed-out headers, drawer actions, search, category switching, create preview, share dialog, referral banner, accordions, and Terms navigation.
- Visually verify desktop at 1280×1800 and mobile at 390×844, including overflow, card uniformity, footer spacing, and responsive placement.
