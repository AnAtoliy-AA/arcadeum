import { extraVariants as enExtra } from './en-extra';

export const extraVariants: {
  galaxy: Record<string, string>;
  fantasy: Record<string, string>;
  western: Record<string, string>;
  egypt: Record<string, string>;
  steampunk: Record<string, string>;
  zen: Record<string, string>;
} = {
  ...enExtra,
};
