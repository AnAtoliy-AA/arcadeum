import { VariantStyleConfig } from '../types';
import { baseVariantStyles } from '../base';
import { layoutStyles } from './layout';
import { tableStyles } from './table';
import { headerStyles } from './header';
import { playersStyles } from './players';
import { tableInfoStyles } from './tableInfo';
import { chatStyles } from './chat';
import { cardsStyles } from './cards';

export const crimeFullVariantStyles: VariantStyleConfig = {
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
      'radial-gradient(circle at 50% 20%, rgba(245, 166, 35, 0.24) 0%, rgba(25, 15, 5, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(245, 166, 35, 0.28)',
    gridLineColorB: 'rgba(248, 231, 28, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(245, 166, 35, 0.9) 25%, rgba(248, 231, 28, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(245, 166, 35, 0.32)',
    particleColors: [
      'rgba(245, 166, 35, 0.85)',
      'rgba(248, 231, 28, 0.75)',
      'rgba(251, 191, 36, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(245, 166, 35, 1), rgba(248, 231, 28, 1))',
    turnBannerDotColor: 'rgba(245, 166, 35, 1)',
  },
};
