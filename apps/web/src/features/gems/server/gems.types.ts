// Public-facing gem package (from GET /payments/gems/packages).
export interface GemPackagePublic {
  id: string;
  name: string;
  gems: number;
  bonusGems: number;
  priceUsdCents: number;
  displayOrder: number;
}

// Pending / past gem purchase (from GET /payments/gems/orders/pending).
export interface GemPurchaseView {
  id: string;
  packageId: string;
  paypalOrderId: string;
  amountUsdCents: number;
  gems: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  finalizedAt: string | null;
}

// Wallet balance shape shared with wallet.types.ts (duplicate kept for
// server-module isolation; both should match the BE WalletBalance type).
export interface WalletBalance {
  coins: number;
  gems: number;
}

// Result of a successful gem→coin conversion.
export interface ConversionResult {
  gemsDebited: number;
  coinsCredited: number;
  newBalance: WalletBalance;
  rate: number;
}
