import type { EconomyKey } from '../economy-keys';

export interface EconomySettingView {
  key: EconomyKey;
  currentValue: number;
  defaultValue: number;
  source: 'override' | 'env' | 'default';
  updatedAt: string | null;
  updatedByLabel: string | null;
}
