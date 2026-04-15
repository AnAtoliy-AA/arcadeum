import { VariantStyleConfig } from '../types';
import { layoutStyles } from './layout';
import { tableStyles } from './table';
import { headerStyles } from './header';
import { playersStyles } from './players';
import { tableInfoStyles } from './tableInfo';
import { chatStyles } from './chat';
import { cardsStyles } from './cards';

const highAltitudeHikeFullVariantStyles: VariantStyleConfig = {
  layout: layoutStyles,
  table: tableStyles,
  header: headerStyles,
  players: playersStyles,
  tableInfo: tableInfoStyles,
  chat: chatStyles,
  cards: cardsStyles,
};

export { highAltitudeHikeFullVariantStyles };
