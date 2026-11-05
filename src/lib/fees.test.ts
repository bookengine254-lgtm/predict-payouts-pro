import { describe, expect, it } from "vitest";
import { stkCost, validateTopup, validateWithdraw, withdrawFee } from "./fees";

describe("M-Pesa fees", () => {
  it("STK is free below KSh 10 and KSh 3 from 10", () => {
    expect(stkCost(9)).toBe(0);
    expect(stkCost(10)).toBe(3);
  });
  it("B2C tiers", () => {
    expect(withdrawFee(49)).toBe(6);
    expect(withdrawFee(150_000)).toBe(200);
    expect(withdrawFee(249_999)).toBe(200);
    expect(withdrawFee(250_000)).toBe(5_000);
  });
  it("minimums protect margins", () => {
    expect(validateTopup(49)).not.toBeNull();
    expect(validateTopup(50)).toBeNull();
    expect(validateWithdraw(99, 10_000)).not.toBeNull();
    expect(validateWithdraw(1_000, 1_010)).not.toBeNull();
  });
});
