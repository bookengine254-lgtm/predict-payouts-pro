import { DEFAULT_CREATOR_FEE_BPS, PLATFORM_FEE_BPS, impliedProbability } from "./parimutuel";

export type CategoryId =
  | "politics"
  | "sports"
  | "crypto"
  | "economy"
  | "entertainment"
  | "tech"
  | "weather";

export interface Category {
  id: CategoryId;
  label: string;
  tone: Tone;
}

export type Tone = "primary" | "yes" | "no" | "grape" | "amber" | "teal" | "pinkish";

export const categories: Category[] = [
  { id: "politics", label: "Politics", tone: "grape" },
  { id: "sports", label: "Sports", tone: "yes" },
  { id: "crypto", label: "Crypto", tone: "amber" },
  { id: "economy", label: "Economy", tone: "teal" },
  { id: "entertainment", label: "Culture", tone: "pinkish" },
  { id: "tech", label: "Tech", tone: "primary" },
  { id: "weather", label: "Weather", tone: "no" },
];

export interface Outcome {
  id: string;
  label: string;
  pool: number;
  tone: Tone;
}

export type MarketStatus = "open" | "in_review" | "resolved" | "disputed";

export interface Market {
  id: string;
  question: string;
  shortTitle: string;
  category: CategoryId;
  /** binary (default) | multi-outcome | custom sports fixture */
  kind?: "binary" | "multi" | "sports";
  sports?: { home: string; away: string; league: string; kickoff: string };
  thumbnail?: string;
  thumbnailEmoji: string;
  outcomes: Outcome[];
  closesAt: string;
  createdAt: string;
  creator: string; // handle
  creatorFeeBps: number;
  platformFeeBps: number;
  seedLiquidity: number;
  status: MarketStatus;
  aiReview: { verdict: "approved" | "fixed" | "pending"; note: string };
  resolutionCriteria: string;
  sources: string[];
  forecasters: number;
  history: { t: string; values: number[] }[];
  resolved?: { outcomeId: string; resolvedAt: string; rationale: string };
  featured?: boolean;
}

export interface Person {
  handle: string;
  name: string;
  initials: string;
  tone: Tone;
  accuracy: number;
  forecasts: number;
  returns: number;
  followers: number;
  creatorEarnings: number;
  bio: string;
}

export const people: Person[] = [
  {
    handle: "wanjiku",
    name: "Wanjiku M.",
    initials: "WM",
    tone: "grape",
    accuracy: 0.71,
    forecasts: 284,
    returns: 148_300,
    followers: 5120,
    creatorEarnings: 62_400,
    bio: "County budgets, transport policy and anything with a gazette notice.",
  },
  {
    handle: "otienoedge",
    name: "Otieno Edge",
    initials: "OE",
    tone: "yes",
    accuracy: 0.68,
    forecasts: 512,
    returns: 233_900,
    followers: 8840,
    creatorEarnings: 141_050,
    bio: "Football models. 6 seasons of KPL data, one spreadsheet, zero vibes.",
  },
  {
    handle: "chepkoech",
    name: "Chepkoech K.",
    initials: "CK",
    tone: "teal",
    accuracy: 0.64,
    forecasts: 176,
    returns: 71_200,
    followers: 2310,
    creatorEarnings: 18_900,
    bio: "Macro, shilling, CBK rate decisions.",
  },
  {
    handle: "mwendwa",
    name: "Mwendwa A.",
    initials: "MA",
    tone: "amber",
    accuracy: 0.62,
    forecasts: 402,
    returns: 64_800,
    followers: 1980,
    creatorEarnings: 9_400,
    bio: "Crypto flows and listings. Mostly wrong loudly, right quietly.",
  },
  {
    handle: "njeri",
    name: "Njeri W.",
    initials: "NW",
    tone: "pinkish",
    accuracy: 0.59,
    forecasts: 121,
    returns: 22_400,
    followers: 940,
    creatorEarnings: 4_100,
    bio: "Culture, music charts, award shows.",
  },
  {
    handle: "kimani",
    name: "Kimani D.",
    initials: "KD",
    tone: "primary",
    accuracy: 0.57,
    forecasts: 88,
    returns: 12_100,
    followers: 610,
    creatorEarnings: 2_050,
    bio: "Tech launches and telco pricing.",
  },
];

export const currentUser = {
  handle: "you",
  name: "You",
  initials: "YN",
  balance: 4_820,
  locked: 2_150,
  accuracy: 0.63,
  streak: 6,
  forecasts: 47,
  tier: "Analyst II",
  nextTierAt: 60,
  referrals: 11,
  referralEarnings: 1_240,
};

/** Deterministic pseudo-random so SSR and client agree. */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648;
    return s / 2147483648;
  };
}

/**
 * Fixed clock anchor. Mock timestamps are derived from a constant so the server
 * and the client render identical relative labels (no hydration mismatch).
 */
export const NOW = Date.parse("2026-08-09T06:00:00.000Z");

function makeHistory(seed: number, start: number, points = 40, outcomeCount = 2): { t: string; values: number[] }[] {
  const rand = seeded(seed);
  const out: { t: string; values: number[] }[] = [];
  let p = start;
  for (let i = points - 1; i >= 0; i--) {
    p = Math.min(0.94, Math.max(0.06, p + (rand() - 0.5) * 0.06));
    const values = [Number(p.toFixed(4))];
    let remaining = 1 - p;
    for (let k = 1; k < outcomeCount; k++) {
      const share = k === outcomeCount - 1 ? remaining : remaining * (0.35 + rand() * 0.3);
      values.push(Number(Math.max(0.01, share).toFixed(4)));
      remaining = Math.max(0.01, remaining - share);
    }
    out.push({ t: new Date(NOW - i * 6 * 3600_000).toISOString(), values });
  }
  return out;
}

function inDays(days: number) {
  return new Date(NOW + days * 86_400_000).toISOString();
}
function daysAgo(days: number) {
  return new Date(NOW - days * 86_400_000).toISOString();
}

function binary(yes: number, no: number): Outcome[] {
  return [
    { id: "yes", label: "Yes", pool: yes, tone: "yes" },
    { id: "no", label: "No", pool: no, tone: "no" },
  ];
}

const baseMarkets: Market[] = [
  {
    id: "nairobi-expressway-toll",
    question: "Will the Nairobi Expressway toll be raised before 1 October?",
    shortTitle: "Expressway toll raise",
    category: "politics",
    thumbnailEmoji: "🛣️",
    outcomes: binary(184_000, 96_000),
    closesAt: inDays(21),
    createdAt: daysAgo(18),
    creator: "wanjiku",
    creatorFeeBps: 120,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 25_000,
    status: "open",
    aiReview: {
      verdict: "approved",
      note: "Clear, dated, publicly verifiable via gazette notice. Approved without edits.",
    },
    resolutionCriteria:
      "Resolves Yes if a gazette notice or official operator announcement raising any toll class is published before 1 October, 23:59 EAT.",
    sources: ["Kenya Gazette", "Moja Expressway official releases"],
    forecasters: 1_284,
    history: makeHistory(11, 0.62),
    featured: true,
  },
  {
    id: "harambee-stars-qualify",
    question: "Will Harambee Stars win their next competitive fixture?",
    shortTitle: "Harambee Stars win next",
    category: "sports",
    thumbnailEmoji: "⚽",
    outcomes: binary(311_500, 402_000),
    closesAt: inDays(6),
    createdAt: daysAgo(9),
    creator: "otienoedge",
    creatorFeeBps: 150,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 40_000,
    status: "open",
    aiReview: {
      verdict: "fixed",
      note: "Original wording said 'next match'. Rewritten to 'next competitive fixture' to exclude friendlies.",
    },
    resolutionCriteria:
      "Resolves Yes if Kenya wins the next FIFA-recognised competitive fixture in regulation or extra time. Penalties count as a win.",
    sources: ["FKF match centre", "FIFA fixture list"],
    forecasters: 3_902,
    history: makeHistory(22, 0.44),
    featured: true,
  },
  {
    id: "btc-above-150k",
    question: "Will Bitcoin close above $150,000 this quarter?",
    shortTitle: "BTC above $150K",
    category: "crypto",
    thumbnailEmoji: "₿",
    outcomes: binary(742_000, 1_190_000),
    closesAt: inDays(48),
    createdAt: daysAgo(40),
    creator: "mwendwa",
    creatorFeeBps: 100,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 60_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Objective price threshold with a named reference source." },
    resolutionCriteria:
      "Resolves Yes if the daily close on the reference index exceeds $150,000 on any day before quarter end.",
    sources: ["CoinDesk BTC index"],
    forecasters: 7_431,
    history: makeHistory(33, 0.38),
    featured: true,
  },
  {
    id: "cbk-holds-rate",
    question: "Will the CBK hold the base rate at its next MPC meeting?",
    shortTitle: "CBK holds rate",
    category: "economy",
    thumbnailEmoji: "🏦",
    outcomes: binary(268_000, 121_000),
    closesAt: inDays(12),
    createdAt: daysAgo(14),
    creator: "chepkoech",
    creatorFeeBps: 90,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 30_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Single decision, single official source, unambiguous date." },
    resolutionCriteria: "Resolves Yes if the published MPC statement leaves the Central Bank Rate unchanged.",
    sources: ["CBK MPC statement"],
    forecasters: 902,
    history: makeHistory(44, 0.7),
  },
  {
    id: "shilling-under-125",
    question: "Will the shilling trade under 125 to the dollar before year end?",
    shortTitle: "KES under 125",
    category: "economy",
    thumbnailEmoji: "💵",
    outcomes: binary(96_500, 214_000),
    closesAt: inDays(90),
    createdAt: daysAgo(30),
    creator: "chepkoech",
    creatorFeeBps: 100,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 20_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Uses CBK mean indicative rate. Threshold and window are explicit." },
    resolutionCriteria: "Resolves Yes if the CBK mean indicative rate prints below 125.00 on any business day.",
    sources: ["CBK daily indicative rates"],
    forecasters: 1_140,
    history: makeHistory(55, 0.31),
  },
  {
    id: "album-number-one",
    question: "Will a Kenyan artist top the East Africa chart this month?",
    shortTitle: "Kenyan artist #1",
    category: "entertainment",
    thumbnailEmoji: "🎤",
    outcomes: binary(58_000, 41_000),
    closesAt: inDays(9),
    createdAt: daysAgo(5),
    creator: "njeri",
    creatorFeeBps: 150,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 12_000,
    status: "open",
    aiReview: {
      verdict: "fixed",
      note: "Chart was unspecified. Bound to the named regional chart's month-end snapshot.",
    },
    resolutionCriteria: "Resolves Yes if the month-end regional chart's #1 record is credited to a Kenyan lead artist.",
    sources: ["Regional streaming chart, month-end snapshot"],
    forecasters: 611,
    history: makeHistory(66, 0.55),
  },
  {
    id: "fibre-price-cut",
    question: "Will any major ISP cut home fibre prices this quarter?",
    shortTitle: "Fibre price cut",
    category: "tech",
    thumbnailEmoji: "📡",
    outcomes: binary(74_000, 148_000),
    closesAt: inDays(35),
    createdAt: daysAgo(11),
    creator: "kimani",
    creatorFeeBps: 120,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 15_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Scoped to named operators with published price lists." },
    resolutionCriteria:
      "Resolves Yes if a top-three ISP by subscribers publishes a lower price for an existing residential tier.",
    sources: ["Operator price pages", "CA quarterly report"],
    forecasters: 388,
    history: makeHistory(77, 0.34),
  },
  {
    id: "nairobi-rain-week",
    question: "Will Nairobi record over 40mm of rain this week?",
    shortTitle: "Nairobi 40mm rain",
    category: "weather",
    thumbnailEmoji: "🌧️",
    outcomes: binary(132_000, 88_000),
    closesAt: inDays(3),
    createdAt: daysAgo(4),
    creator: "wanjiku",
    creatorFeeBps: 100,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 10_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Station-specific and time-boxed. Good." },
    resolutionCriteria: "Resolves Yes if the Dagoretti station cumulative total exceeds 40.0mm for the calendar week.",
    sources: ["Kenya Meteorological Department"],
    forecasters: 754,
    history: makeHistory(88, 0.6),
  },
  {
    id: "matatu-cashless",
    question: "Will a cashless fare mandate take effect on any Nairobi route?",
    shortTitle: "Cashless matatu fares",
    category: "politics",
    thumbnailEmoji: "🚐",
    outcomes: binary(41_000, 189_000),
    closesAt: inDays(60),
    createdAt: daysAgo(22),
    creator: "wanjiku",
    creatorFeeBps: 130,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 18_000,
    status: "in_review",
    aiReview: {
      verdict: "pending",
      note: "Reviewing whether 'takes effect' should require enforcement or only publication.",
    },
    resolutionCriteria: "Resolves Yes if a binding directive is in force on at least one licensed Nairobi route.",
    sources: ["NTSA notices", "County transport directives"],
    forecasters: 210,
    history: makeHistory(99, 0.2),
  },
  {
    id: "kpl-top-scorer",
    question: "Will the league's top scorer reach 20 goals this season?",
    shortTitle: "20-goal top scorer",
    category: "sports",
    thumbnailEmoji: "🥇",
    outcomes: binary(212_000, 178_000),
    closesAt: daysAgo(2),
    createdAt: daysAgo(120),
    creator: "otienoedge",
    creatorFeeBps: 150,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 35_000,
    status: "resolved",
    aiReview: { verdict: "approved", note: "Objective, from the official scorer table." },
    resolutionCriteria: "Resolves Yes if the official season top scorer finishes on 20 or more league goals.",
    sources: ["League official scorer table"],
    forecasters: 2_110,
    history: makeHistory(101, 0.54),
    resolved: {
      outcomeId: "yes",
      resolvedAt: daysAgo(1),
      rationale:
        "Official end-of-season scorer table shows 21 league goals for the leading scorer. Two independent sources agree. Resolved Yes.",
    },
  },
  {
    id: "budget-reading-date",
    question: "Will the budget statement be read on the scheduled date?",
    shortTitle: "Budget read on time",
    category: "politics",
    thumbnailEmoji: "📜",
    outcomes: binary(148_000, 52_000),
    closesAt: daysAgo(5),
    createdAt: daysAgo(70),
    creator: "wanjiku",
    creatorFeeBps: 110,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 22_000,
    status: "disputed",
    aiReview: { verdict: "approved", note: "Dated public event with a single source of truth." },
    resolutionCriteria: "Resolves Yes if the statement is delivered in the House on the gazetted date.",
    sources: ["Hansard", "Parliamentary order paper"],
    forecasters: 1_002,
    history: makeHistory(111, 0.74),
    resolved: {
      outcomeId: "yes",
      resolvedAt: daysAgo(4),
      rationale: "Hansard records delivery on the gazetted date. Resolved Yes.",
    },
  },
];


/** Multi-outcome (3+) and custom sports markets. Rendered compactly so they never
 * stretch taller than the binary cards in the same grid. */
const multiMarkets: Market[] = [
  {
    id: "next-nairobi-governor",
    question: "Who will be sworn in as Nairobi Governor next?",
    shortTitle: "Next Nairobi Governor",
    category: "politics",
    thumbnailEmoji: "🏛️",
    kind: "multi",
    outcomes: [
      { id: "a", label: "Kiarie", pool: 214_000, tone: "grape" },
      { id: "b", label: "Wambui", pool: 168_000, tone: "teal" },
      { id: "c", label: "Onyango", pool: 92_000, tone: "amber" },
      { id: "d", label: "Someone else", pool: 41_000, tone: "pinkish" },
    ],
    closesAt: inDays(44),
    createdAt: daysAgo(20),
    creator: "wanjiku",
    creatorFeeBps: 140,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 45_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Mutually exclusive field with a catch-all. Approved." },
    resolutionCriteria:
      "Resolves to the candidate officially sworn in. If nobody on the list is sworn in, resolves to Someone else.",
    sources: ["IEBC declarations", "Kenya Gazette"],
    forecasters: 2_640,
    history: makeHistory(201, 0.4, 40, 4),
    featured: true,
  },
  {
    id: "cbk-rate-decision-band",
    question: "What will the CBK do with the base rate at the next MPC?",
    shortTitle: "CBK rate decision",
    category: "economy",
    thumbnailEmoji: "📉",
    kind: "multi",
    outcomes: [
      { id: "hold", label: "Hold", pool: 188_000, tone: "teal" },
      { id: "cut25", label: "Cut 25bps", pool: 121_000, tone: "yes" },
      { id: "cut50", label: "Cut 50bps+", pool: 44_000, tone: "grape" },
      { id: "hike", label: "Hike", pool: 19_000, tone: "no" },
    ],
    closesAt: inDays(12),
    createdAt: daysAgo(8),
    creator: "chepkoech",
    creatorFeeBps: 90,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 28_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Bands are exhaustive and non-overlapping." },
    resolutionCriteria: "Resolves to the band matching the published MPC statement's Central Bank Rate change.",
    sources: ["CBK MPC statement"],
    forecasters: 1_402,
    history: makeHistory(202, 0.45, 40, 4),
  },
  {
    id: "gor-vs-afc-correct-result",
    question: "Gor Mahia vs AFC Leopards — what is the full-time result?",
    shortTitle: "Gor vs AFC result",
    category: "sports",
    thumbnailEmoji: "🏟️",
    kind: "sports",
    sports: { home: "Gor Mahia", away: "AFC Leopards", league: "KPL", kickoff: inDays(2) },
    outcomes: [
      { id: "home", label: "Gor Mahia", pool: 268_000, tone: "yes" },
      { id: "draw", label: "Draw", pool: 141_000, tone: "amber" },
      { id: "away", label: "AFC Leopards", pool: 196_000, tone: "no" },
    ],
    closesAt: inDays(2),
    createdAt: daysAgo(6),
    creator: "otienoedge",
    creatorFeeBps: 150,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 50_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Three-way result market on a scheduled fixture. Approved." },
    resolutionCriteria: "Resolves on the official full-time result after 90 minutes plus stoppage time.",
    sources: ["FKF match centre"],
    forecasters: 5_120,
    history: makeHistory(203, 0.46, 40, 3),
    featured: true,
  },
  {
    id: "epl-top-scorer-race",
    question: "Who finishes as the league's top scorer this season?",
    shortTitle: "Top scorer race",
    category: "sports",
    thumbnailEmoji: "👟",
    kind: "multi",
    outcomes: [
      { id: "a", label: "Omollo", pool: 96_000, tone: "yes" },
      { id: "b", label: "Kiptoo", pool: 82_000, tone: "teal" },
      { id: "c", label: "Barasa", pool: 61_000, tone: "grape" },
      { id: "d", label: "Field", pool: 118_000, tone: "amber" },
    ],
    closesAt: inDays(70),
    createdAt: daysAgo(30),
    creator: "otienoedge",
    creatorFeeBps: 150,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 32_000,
    status: "open",
    aiReview: { verdict: "fixed", note: "Added a Field outcome so the market is exhaustive." },
    resolutionCriteria: "Resolves to the player credited with the most league goals in the official end-of-season table.",
    sources: ["League official scorer table"],
    forecasters: 1_930,
    history: makeHistory(204, 0.3, 40, 4),
  },
  {
    id: "safari-sevens-winner",
    question: "Which side lifts the Safari Sevens?",
    shortTitle: "Safari Sevens winner",
    category: "sports",
    thumbnailEmoji: "🏉",
    kind: "multi",
    outcomes: [
      { id: "a", label: "Shujaa", pool: 74_000, tone: "yes" },
      { id: "b", label: "Simbas", pool: 52_000, tone: "teal" },
      { id: "c", label: "Visitors", pool: 68_000, tone: "grape" },
    ],
    closesAt: inDays(16),
    createdAt: daysAgo(10),
    creator: "mwendwa",
    creatorFeeBps: 130,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 18_000,
    status: "open",
    aiReview: { verdict: "approved", note: "Tournament winner market with a clear trophy lift condition." },
    resolutionCriteria: "Resolves to the side that wins the final. Abandoned tournament voids and refunds all stakes.",
    sources: ["Tournament official results"],
    forecasters: 640,
    history: makeHistory(205, 0.35, 40, 3),
  },
  {
    id: "nairobi-derby-resolved",
    question: "Did the Nairobi derby end in a draw?",
    shortTitle: "Derby ended a draw",
    category: "sports",
    thumbnailEmoji: "🤝",
    outcomes: binary(88_000, 164_000),
    closesAt: daysAgo(3),
    createdAt: daysAgo(24),
    creator: "otienoedge",
    creatorFeeBps: 150,
    platformFeeBps: PLATFORM_FEE_BPS,
    seedLiquidity: 20_000,
    status: "resolved",
    aiReview: { verdict: "approved", note: "Single fixture, single official result." },
    resolutionCriteria: "Resolves Yes if the official full-time score is level after 90 minutes plus stoppage.",
    sources: ["FKF match centre"],
    forecasters: 1_460,
    history: makeHistory(206, 0.4),
    resolved: {
      outcomeId: "no",
      resolvedAt: daysAgo(3),
      rationale:
        "Official full-time score 2-1. Two independent match reports agree. Resolved No, losing pool distributed to No stakes after fees.",
    },
  },
];

export const markets: Market[] = [...baseMarkets, ...multiMarkets];

export function marketById(id: string) {
  return markets.find((m) => m.id === id);
}

export function totalPool(market: Market) {
  return market.outcomes.reduce((sum, o) => sum + o.pool, 0);
}

export function probabilities(market: Market) {
  const total = totalPool(market);
  return market.outcomes.map((o) => impliedProbability(o.pool, total));
}

export function leadOutcome(market: Market): Outcome {
  return market.outcomes.reduce<Outcome>(
    (best, o) => (o.pool > best.pool ? o : best),
    market.outcomes[0]!,
  );
}

export function trendDelta(market: Market) {
  const h = market.history;
  if (h.length < 2) return 0;
  const last = h[h.length - 1]!.values[0]!;
  const prev = h[Math.max(0, h.length - 9)]!.values[0]!;
  return last - prev;
}


export function categoryOf(id: CategoryId) {
  return categories.find((c) => c.id === id)!;
}

export interface Position {
  marketId: string;
  outcomeId: string;
  stake: number;
  avgProbability: number;
  status: "open" | "won" | "lost" | "claimable";
}

export const positions: Position[] = [
  { marketId: "nairobi-expressway-toll", outcomeId: "yes", stake: 600, avgProbability: 0.58, status: "open" },
  { marketId: "harambee-stars-qualify", outcomeId: "no", stake: 750, avgProbability: 0.51, status: "open" },
  { marketId: "btc-above-150k", outcomeId: "no", stake: 400, avgProbability: 0.6, status: "open" },
  { marketId: "cbk-holds-rate", outcomeId: "yes", stake: 250, avgProbability: 0.66, status: "open" },
  { marketId: "nairobi-rain-week", outcomeId: "yes", stake: 150, avgProbability: 0.57, status: "open" },
  { marketId: "kpl-top-scorer", outcomeId: "yes", stake: 500, avgProbability: 0.48, status: "claimable" },
  { marketId: "budget-reading-date", outcomeId: "no", stake: 300, avgProbability: 0.3, status: "lost" },
];

export interface Transaction {
  id: string;
  kind: "topup" | "withdraw" | "stake" | "payout" | "fee" | "creator_fee" | "referral";
  label: string;
  amount: number;
  at: string;
  status: "complete" | "pending" | "failed";
  channel?: string;
}

export const transactions: Transaction[] = [
  { id: "t1", kind: "topup", label: "M-Pesa top-up", amount: 2_000, at: daysAgo(0.2), status: "complete", channel: "+254 7•• ••• 214" },
  { id: "t2", kind: "stake", label: "Stake · Expressway toll raise", amount: -600, at: daysAgo(0.4), status: "complete" },
  { id: "t3", kind: "payout", label: "Payout · 20-goal top scorer", amount: 1_180, at: daysAgo(1), status: "pending" },
  { id: "t4", kind: "creator_fee", label: "Creator commission · Nairobi 40mm rain", amount: 340, at: daysAgo(2), status: "complete" },
  { id: "t5", kind: "referral", label: "Referral share · @mwendwa", amount: 120, at: daysAgo(3), status: "complete" },
  { id: "t6", kind: "withdraw", label: "M-Pesa withdrawal", amount: -1_500, at: daysAgo(4), status: "complete", channel: "+254 7•• ••• 214" },
  { id: "t7", kind: "fee", label: "Withdrawal fee", amount: -25, at: daysAgo(4), status: "complete" },
  { id: "t8", kind: "stake", label: "Stake · BTC above $150K", amount: -400, at: daysAgo(5), status: "complete" },
  { id: "t9", kind: "topup", label: "M-Pesa top-up", amount: 1_000, at: daysAgo(6), status: "failed", channel: "+254 7•• ••• 214" },
];

export interface ActivityItem {
  id: string;
  kind: "resolution" | "payout" | "move" | "approval" | "dispute" | "social";
  title: string;
  detail: string;
  at: string;
  marketId?: string;
  tone: Tone;
}

export const activity: ActivityItem[] = [
  {
    id: "a1",
    kind: "resolution",
    title: "Resolved Yes · 20-goal top scorer",
    detail: "AI resolution cited the official scorer table. Your payout is ready to claim.",
    at: daysAgo(1),
    marketId: "kpl-top-scorer",
    tone: "yes",
  },
  {
    id: "a2",
    kind: "move",
    title: "Expressway toll raise moved +6 pts",
    detail: "Yes went from 60% to 66% in the last 12 hours on KSh 41K of new stake.",
    at: daysAgo(0.3),
    marketId: "nairobi-expressway-toll",
    tone: "grape",
  },
  {
    id: "a3",
    kind: "approval",
    title: "AI review approved your market",
    detail: "Nairobi 40mm rain went live. Your commission is set at 1.0%.",
    at: daysAgo(2),
    marketId: "nairobi-rain-week",
    tone: "teal",
  },
  {
    id: "a4",
    kind: "dispute",
    title: "Dispute opened · Budget read on time",
    detail: "Two forecasters challenged the resolution. Review closes in 36 hours.",
    at: daysAgo(4),
    marketId: "budget-reading-date",
    tone: "amber",
  },
  {
    id: "a5",
    kind: "payout",
    title: "Creator commission paid",
    detail: "KSh 340 from the Nairobi rain pool landed in your wallet.",
    at: daysAgo(2),
    tone: "yes",
  },
  {
    id: "a6",
    kind: "social",
    title: "@otienoedge published a new market",
    detail: "Harambee Stars win next — seeded with KSh 40K.",
    at: daysAgo(9),
    marketId: "harambee-stars-qualify",
    tone: "pinkish",
  },
];

export interface Dispute {
  id: string;
  marketId: string;
  claim: string;
  openedBy: string;
  openedAt: string;
  stakeAtRisk: number;
  status: "under_review" | "upheld" | "rejected";
  timeline: { at: string; label: string; detail: string }[];
}

export const disputes: Dispute[] = [
  {
    id: "d1",
    marketId: "budget-reading-date",
    claim: "The statement was delivered a day late after the order paper was amended.",
    openedBy: "chepkoech",
    openedAt: daysAgo(4),
    stakeAtRisk: 200_000,
    status: "under_review",
    timeline: [
      { at: daysAgo(4), label: "Dispute filed", detail: "Filing fee of KSh 200 held in escrow. Refunded if upheld." },
      { at: daysAgo(3.6), label: "Evidence gathered", detail: "AI pulled Hansard, the order paper and two wire reports." },
      { at: daysAgo(3.2), label: "Conflict flagged", detail: "One source disagrees on the delivery date. Escalated to panel review." },
    ],
  },
  {
    id: "d2",
    marketId: "kpl-top-scorer",
    claim: "One goal was reclassified as an own goal after the final whistle.",
    openedBy: "mwendwa",
    openedAt: daysAgo(1),
    stakeAtRisk: 390_000,
    status: "rejected",
    timeline: [
      { at: daysAgo(1), label: "Dispute filed", detail: "Filing fee of KSh 200 held in escrow." },
      { at: daysAgo(0.8), label: "Resolution upheld", detail: "Official table unchanged at 21 goals. Fee retained." },
    ],
  },
];

export const feeSchedule = [
  { label: "Platform fee", value: "2.0% of the losing pool", note: "Charged once, at resolution. Never on your stake." },
  { label: "Creator commission", value: "0.5% – 2.0%", note: "Set by the market creator, shown on every card before you stake." },
  { label: "AI market fix-up", value: "KSh 150", note: "Optional. AI rewrites ambiguous wording and resolution criteria." },
  { label: "Priority AI review", value: "KSh 250", note: "Front of the review queue, typically under 5 minutes." },
  { label: "Dispute filing", value: "KSh 200", note: "Fully refunded when a dispute is upheld." },
  { label: "M-Pesa withdrawal", value: "KSh 25", note: "Rails cost. Top-ups are free." },
  { label: "Instant payout", value: "1.0%", note: "Optional. Skip the standard settlement window." },
  { label: "Polka Pro", value: "KSh 499 / month", note: "Advanced analytics, copy-forecast, unlimited markets, halved platform fee." },
];

export { PLATFORM_FEE_BPS, DEFAULT_CREATOR_FEE_BPS };
