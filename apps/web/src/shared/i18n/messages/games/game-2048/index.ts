import { enMessages as en } from './en';
import { esMessages as es } from './es';
import { frMessages as fr } from './fr';
import { ruMessages as ru } from './ru';
import { byMessages as by } from './by';

export { en, es, fr, ru, by };
export type Game2048Messages = typeof en;
export const game2048Messages = { en, es, fr, ru, by };
