/**
 * Prize data. Only the pool is confirmed (poster and live site: ₹75,000 total).
 * The split between places and any special prizes is not decided (open question Q27),
 * so `prizeCategories` is empty. Add entries here and the Prizes section lists them.
 * The test checks that the amounts never add up to more than the pool.
 */
import { siteConfig } from "./config";

export interface PrizeCategory {
  id: string;
  /** e.g. "Winner", "First runner-up", "Best social-impact idea" */
  name: string;
  amountInr: number;
  /** Optional extra line, such as a trophy or certificate. */
  note?: string;
}

export const prizePoolInr = siteConfig.prizePoolInr;

export const prizeCategories: PrizeCategory[] = [];

export function prizeTotal(categories: PrizeCategory[]): number {
  return categories.reduce((sum, c) => sum + c.amountInr, 0);
}
