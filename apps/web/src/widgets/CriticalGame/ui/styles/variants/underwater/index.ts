import { VariantStyleConfig } from '../types';
import { baseVariantStyles } from '../base';
import { layoutStyles } from './layout';
import { tableStyles } from './table';
import { headerStyles } from './header';
import { playersStyles } from './players';
import { tableInfoStyles } from './tableInfo';
import { chatStyles } from './chat';
import { cardsStyles } from './cards';

export const underwaterVariantStyles: VariantStyleConfig = {
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
      'radial-gradient(circle at 50% 20%, rgba(0, 124, 240, 0.24) 0%, rgba(0, 20, 50, 1) 45%, rgba(0, 0, 0, 1) 100%)',
    gridLineColorA: 'rgba(0, 124, 240, 0.28)',
    gridLineColorB: 'rgba(0, 223, 216, 0.18)',
    horizonGradient:
      'linear-gradient(90deg, transparent 0%, rgba(0, 124, 240, 0.9) 25%, rgba(0, 223, 216, 0.9) 75%, transparent 100%)',
    backlightColor: 'rgba(0, 124, 240, 0.32)',
    particleColors: [
      'rgba(0, 124, 240, 0.85)',
      'rgba(0, 223, 216, 0.75)',
      'rgba(56, 189, 248, 0.6)',
    ],
    turnBannerBorderGradient:
      'linear-gradient(90deg, rgba(0, 124, 240, 1), rgba(0, 223, 216, 1))',
    turnBannerDotColor: 'rgba(0, 223, 216, 1)',
  },
};
