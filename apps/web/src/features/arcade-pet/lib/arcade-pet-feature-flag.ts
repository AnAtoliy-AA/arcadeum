import type { CatalogGame } from '@/features/games/api';

export function isPetFeatureDisabled(games?: CatalogGame[] | null): boolean {
  if (!games || games.length === 0) return false;
  const petGame = games.find((g) => g.gameId === 'arcade_pet_v1');
  if (!petGame) return false;
  if (petGame.comingSoon) return true;
  const petsRule = petGame.rules?.find((r) => r.ruleId === 'pets');
  return petsRule?.comingSoon ?? false;
}
