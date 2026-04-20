import { VariantStyleConfig } from '../types';
import { baseVariantStyles } from '../base';
import { layoutStyles } from './layout';
import { tableStyles } from './table';
import { headerStyles } from './header';
import { playersStyles } from './players';
import { tableInfoStyles } from './tableInfo';
import { chatStyles } from './chat';
import { cardsStyles } from './cards';

export const horrorFullVariantStyles: VariantStyleConfig = {
  layout: layoutStyles,
  table: tableStyles,
  header: headerStyles,
  players: playersStyles,
  tableInfo: tableInfoStyles,
  chat: chatStyles,
  cards: cardsStyles,
  scene: {
    ...baseVariantStyles.scene,
    sceneBgGradient:
      'radial-gradient(circle at 50% 20%, rgba(121, 40, 202, 0.24) 0%, rgba(8, 0, 15, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(121, 40, 202, 0.28)',
    gridLineColorB: 'rgba(255, 0, 128, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(121, 40, 202, 0.9) 25%, rgba(255, 0, 128, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(121, 40, 202, 0.32)',
    particleColors: [
      'rgba(121, 40, 202, 0.85)',
      'rgba(255, 0, 128, 0.75)',
      'rgba(139, 0, 139, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(121, 40, 202, 1), rgba(255, 0, 128, 1))',
    turnBannerDotColor: 'rgba(121, 40, 202, 1)',
  },
};
