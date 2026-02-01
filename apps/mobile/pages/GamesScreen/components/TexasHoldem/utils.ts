import { Suit } from './types';

export function getSuitSymbol(suit: Suit): string {
  const symbols: Record<Suit, string> = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
  };
  return symbols[suit];
}

export function getSuitColor(suit: Suit): string {
  // Standard poker colors: red for hearts/diamonds, black for clubs/spades
  // These are card-specific and don't change with theme
  return suit === 'hearts' || suit === 'diamonds' ? '#dc2626' : '#1f2937';
}
