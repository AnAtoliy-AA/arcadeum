// GemPackageAdmin mirrors the BE GemPackageAdmin view interface.
export interface GemPackageAdmin {
  id: string;
  name: string;
  gems: number;
  bonusGems: number;
  priceUsdCents: number;
  displayOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGemPackageInput {
  name: string;
  gems: number;
  bonusGems?: number;
  priceUsdCents: number;
  displayOrder?: number;
  active?: boolean;
}

export interface UpdateGemPackageInput {
  id: string;
  name?: string;
  gems?: number;
  bonusGems?: number;
  priceUsdCents?: number;
  displayOrder?: number;
  active?: boolean;
}
