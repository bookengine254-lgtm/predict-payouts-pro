/**
 * M-Pesa fee rules for the wallet. Provider costs come from the PSP price list;
 * Polka absorbs the KSh 3 STK cost on top-ups and passes B2C cost on withdrawals.
 * MID_TIER_B2C_FEE is an assumption until the PSP confirms the KSh 50–149,999 tier.
 */
export const MIN_TOPUP = 50;
export const MIN_WITHDRAW = 100;
export const STK_COST = 3;
export const MID_TIER_B2C_FEE = 15;

/** What Polka pays the PSP to receive a top-up. Users always pay nothing. */
export function stkCost(amount: number) {
  return amount >= 10 ? STK_COST : 0;
}

/** Fee charged to the user on a withdrawal, mirroring the PSP's B2C tiers. */
export function withdrawFee(amount: number) {
  if (amount <= 0) return 0;
  if (amount < 50) return 6;
  if (amount < 150_000) return MID_TIER_B2C_FEE;
  if (amount < 250_000) return 200;
  return Math.ceil(amount * 0.02);
}

export function validateTopup(amount: number): string | null {
  return amount < MIN_TOPUP ? `Minimum top-up is KSh ${MIN_TOPUP}` : null;
}

export function validateWithdraw(amount: number, balance: number): string | null {
  if (amount < MIN_WITHDRAW) return `Minimum withdrawal is KSh ${MIN_WITHDRAW}`;
  if (amount + withdrawFee(amount) > balance) return "Amount plus fee is more than your balance";
  return null;
}
