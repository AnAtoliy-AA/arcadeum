import { IsIn } from 'class-validator';
import { VISIBILITY_TIERS, type VisibilityTier } from '../../../auth/lib/roles';

export class SetTierDto {
  @IsIn(VISIBILITY_TIERS as unknown as string[])
  tier!: VisibilityTier;
}
