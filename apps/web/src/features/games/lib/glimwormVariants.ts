export const GLIMWORM_VARIANTS: {
  id: string;
  name: string;
  description: string;
  emoji: string;
  gradient: string;
  disabled?: boolean;
}[] = [
  {
    id: 'battle_royale',
    name: 'games.glimworm_v1.variant.battleRoyale.name',
    description: 'games.glimworm_v1.variant.battleRoyale.description',
    emoji: '👑',
    gradient: 'linear-gradient(135deg, #7928CA 0%, #FF0080 100%)',
  },
  {
    id: 'time_attack',
    name: 'games.glimworm_v1.variant.timeAttack.name',
    description: 'games.glimworm_v1.variant.timeAttack.description',
    emoji: '⏱️',
    gradient: 'linear-gradient(135deg, #00DFD8 0%, #007CF0 100%)',
  },
  {
    id: 'lives_heats',
    name: 'games.glimworm_v1.variant.livesHeats.name',
    description: 'games.glimworm_v1.variant.livesHeats.description',
    emoji: '❤️',
    gradient: 'linear-gradient(135deg, #FF5E5E 0%, #FFB05E 100%)',
  },
];
