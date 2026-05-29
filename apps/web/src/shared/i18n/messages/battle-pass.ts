import type { DeepPartial } from '../base-types';

export const en = {
  title: 'Battle Pass',
  subtitle: 'Level up by playing — claim a reward at every tier.',
  seasonEnds: 'Season ends {{date}}',
  tier: 'Tier {{tier}}',
  free: 'Free',
  premium: 'Premium',
  claim: 'Claim',
  claimed: 'Claimed',
  locked: 'Locked',
  premiumActive: 'Premium active',
  unlockHint: 'Premium rewards unlock with a VIP membership.',
  progress: '{{xp}} / {{next}} XP to next tier',
  maxedOut: 'Every tier unlocked — legend.',
  signInRequired: 'Sign in to view your Battle Pass progress.',
  navLabel: 'Battle Pass',
};

export type BattlePassMessages = DeepPartial<typeof en>;

export const es: BattlePassMessages = {
  title: 'Pase de Batalla',
  subtitle: 'Sube de nivel jugando: reclama una recompensa en cada nivel.',
  seasonEnds: 'La temporada termina el {{date}}',
  tier: 'Nivel {{tier}}',
  free: 'Gratis',
  premium: 'Premium',
  claim: 'Reclamar',
  claimed: 'Reclamado',
  locked: 'Bloqueado',
  premiumActive: 'Premium activo',
  unlockHint: 'Las recompensas premium se desbloquean con una membresía VIP.',
  progress: '{{xp}} / {{next}} XP para el siguiente nivel',
  maxedOut: 'Todos los niveles desbloqueados: leyenda.',
  signInRequired: 'Inicia sesión para ver tu progreso del Pase de Batalla.',
  navLabel: 'Pase de Batalla',
};

export const fr: BattlePassMessages = {
  title: 'Passe de Combat',
  subtitle:
    'Montez en niveau en jouant — réclamez une récompense à chaque palier.',
  seasonEnds: 'La saison se termine le {{date}}',
  tier: 'Palier {{tier}}',
  free: 'Gratuit',
  premium: 'Premium',
  claim: 'Réclamer',
  claimed: 'Réclamé',
  locked: 'Verrouillé',
  premiumActive: 'Premium actif',
  unlockHint: 'Les récompenses premium se débloquent avec un abonnement VIP.',
  progress: '{{xp}} / {{next}} XP avant le palier suivant',
  maxedOut: 'Tous les paliers débloqués — légende.',
  signInRequired:
    'Connectez-vous pour voir votre progression du Passe de Combat.',
  navLabel: 'Passe de Combat',
};

export const ru: BattlePassMessages = {
  title: 'Боевой пропуск',
  subtitle: 'Повышайте уровень в игре — получайте награду на каждом уровне.',
  seasonEnds: 'Сезон заканчивается {{date}}',
  tier: 'Уровень {{tier}}',
  free: 'Бесплатно',
  premium: 'Премиум',
  claim: 'Забрать',
  claimed: 'Получено',
  locked: 'Заблокировано',
  premiumActive: 'Премиум активен',
  unlockHint: 'Премиум-награды открываются с VIP-подпиской.',
  progress: '{{xp}} / {{next}} XP до следующего уровня',
  maxedOut: 'Все уровни открыты — легенда.',
  signInRequired: 'Войдите, чтобы увидеть прогресс Боевого пропуска.',
  navLabel: 'Боевой пропуск',
};

export const by: BattlePassMessages = {
  title: 'Баявы пропуск',
  subtitle:
    'Павышайце ўзровень у гульні — атрымлівайце ўзнагароду на кожным узроўні.',
  seasonEnds: 'Сезон заканчваецца {{date}}',
  tier: 'Узровень {{tier}}',
  free: 'Бясплатна',
  premium: 'Прэміум',
  claim: 'Забраць',
  claimed: 'Атрымана',
  locked: 'Заблакіравана',
  premiumActive: 'Прэміум актыўны',
  unlockHint: 'Прэміум-узнагароды адкрываюцца з VIP-падпіскай.',
  progress: '{{xp}} / {{next}} XP да наступнага ўзроўню',
  maxedOut: 'Усе ўзроўні адкрыты — легенда.',
  signInRequired: 'Увайдзіце, каб убачыць прагрэс Баявога пропуску.',
  navLabel: 'Баявы пропуск',
};
