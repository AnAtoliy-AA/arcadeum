export interface GemPackagePublic {
  id: string;
  name: string;
  gems: number;
  bonusGems: number;
  /** Price in US cents. */
  priceUsdCents: number;
  displayOrder: number;
}

export interface GemPackageAdmin extends GemPackagePublic {
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
