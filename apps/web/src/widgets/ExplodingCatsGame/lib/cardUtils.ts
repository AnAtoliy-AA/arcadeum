import type { ExplodingCatsCard } from "../types";
import type { TranslationKey } from "@/shared/lib/useTranslation";

/**
 * Get translation key for a card
 */
export function getCardTranslationKey(card: ExplodingCatsCard): TranslationKey {
  const keys: Record<ExplodingCatsCard, TranslationKey> = {
    exploding_cat: "games.table.cards.explodingCat",
    defuse: "games.table.cards.defuse",
    attack: "games.table.cards.attack",
    skip: "games.table.cards.skip",
    favor: "games.table.cards.favor",
    shuffle: "games.table.cards.shuffle",
    see_the_future: "games.table.cards.seeTheFuture",
    tacocat: "games.table.cards.tacocat",
    hairy_potato_cat: "games.table.cards.hairyPotatoCat",
    rainbow_ralphing_cat: "games.table.cards.rainbowRalphingCat",
    cattermelon: "games.table.cards.cattermelon",
    bearded_cat: "games.table.cards.beardedCat",
  };
  return keys[card] || "games.table.cards.generic";
}

/**
 * Get emoji for a card type
 */
export function getCardEmoji(card: ExplodingCatsCard): string {
  const emojis: Record<ExplodingCatsCard, string> = {
    exploding_cat: "💣",
    defuse: "🛡️",
    attack: "⚔️",
    skip: "⏭️",
    favor: "🤝",
    shuffle: "🔀",
    see_the_future: "🔮",
    tacocat: "🌮",
    hairy_potato_cat: "🥔",
    rainbow_ralphing_cat: "🌈",
    cattermelon: "🍉",
    bearded_cat: "🧔",
  };
  return emojis[card] || "🐱";
}
