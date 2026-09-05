/**
 * Parimutuel maths for Soko.
 *
 * Every stake on an outcome joins that outcome's pool. At resolution the
 * losing pools are redistributed pro-rata to the winning stakes, after fees.
 *
 *   payout_i = stake_i + (stake_i / winningPool) * (losingPool - fees)
 *
 * The platform never takes a position: there is no book, no fixed odds.
 */

export const PLATFORM_FEE_BPS = 200; // 2% of the losing pool
export const DEFAULT_CREATOR_FEE_BPS = 100; // creator's cut of the losing pool

export function bps(value: number, points: number) {
  return (value * points) / 10_000;
}

/** Implied probability of an outcome = its share of the total pool. */
export function impliedProbability(pool: number, totalPool: number) {
  if (totalPool <= 0) return 0;
  return pool / totalPool;
}

export interface PayoutQuote {
  /** Total returned if this outcome is correct, including the stake back. */
  payout: number;
  /** payout / stake */
  multiple: number;
  /** Net profit if correct. */
  profit: number;
  /** Probability implied by the pools after this stake lands. */
  probabilityAfter: number;
}

export function quotePayout(params: {
  stake: number;
  outcomePool: number;
  totalPool: number;
  platformFeeBps?: number;
  creatorFeeBps?: number;
}): PayoutQuote {
  const {
    stake,
    outcomePool,
    totalPool,
    platformFeeBps = PLATFORM_FEE_BPS,
    creatorFeeBps = DEFAULT_CREATOR_FEE_BPS,
  } = params;

  const winningPool = outcomePool + stake;
  const newTotal = totalPool + stake;
  const losingPool = Math.max(newTotal - winningPool, 0);
  const fees = bps(losingPool, platformFeeBps + creatorFeeBps);
  const distributable = Math.max(losingPool - fees, 0);
  const share = winningPool > 0 ? stake / winningPool : 0;
  const payout = stake + share * distributable;

  return {
    payout,
    multiple: stake > 0 ? payout / stake : 0,
    profit: payout - stake,
    probabilityAfter: newTotal > 0 ? winningPool / newTotal : 0,
  };
}

export function formatKsh(value: number, opts?: { compact?: boolean }) {
  if (opts?.compact) {
    if (Math.abs(value) >= 1_000_000) return `KSh ${(value / 1_000_000).toFixed(1)}M`;
    if (Math.abs(value) >= 1_000) return `KSh ${(value / 1_000).toFixed(1)}K`;
  }
  return `KSh ${Math.round(value).toLocaleString("en-KE")}`;
}

export function formatPct(value: number, digits = 0) {
  return `${(value * 100).toFixed(digits)}%`;
}

export function timeLeft(iso: string, now = Date.now()) {
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "Closed";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${mins}m left`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h left`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d left`;
  return `${Math.floor(days / 30)}mo left`;
}

/**
 * Short human count: 3000 -> 3k, 1_250_000 -> 1.3m. Used for trader counts
 * so a card stat never grows wider than its column.
 */
export function formatCount(value: number) {
  const abs = Math.abs(value);
  const units: [number, string][] = [
    [1e12, "t"],
    [1e9, "b"],
    [1e6, "m"],
    [1e3, "k"],
  ];
  for (const [n, suffix] of units) {
    if (abs >= n) {
      const v = value / n;
      return `${(Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(1)).replace(/\.0$/, "")}${suffix}`;
    }
  }
  return String(Math.round(value));
}
