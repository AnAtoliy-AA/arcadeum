import type { GemPurchaseStatus } from '../schemas/gem-purchase.schema';

export interface GemPurchaseView {
  id: string;
  packageId: string;
  paypalOrderId: string;
  /** Amount in US cents. */
  amountUsdCents: number;
  gems: number;
  status: GemPurchaseStatus;
  createdAt: string;
  finalizedAt: string | null;
}
