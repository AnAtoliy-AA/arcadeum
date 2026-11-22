export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;

export type Suit = (typeof SUITS)[number];

export type CardColor = 'red' | 'black';

/** Playing card. `rank` is 1..13 (Ace=1, Jack=11, Queen=12, King=13). */
export interface Card {
  /** Stable identity used as React key and for move tracking. */
  id: string;
  suit: Suit;
  rank: number;
  faceUp: boolean;
}

/** Index into a foundations array ordered by `SUITS`. */
export type FoundationIndex = number;

/** Index into the seven tableau piles. */
export type TableauIndex = number;

/** Destination for a move attempt. */
export type MoveTarget =
  | { kind: 'foundation'; foundationIndex: FoundationIndex }
  | { kind: 'tableau'; pileIndex: TableauIndex };

/** Source of a move attempt. */
export type MoveSource =
  | { kind: 'waste' }
  | { kind: 'foundation'; foundationIndex: FoundationIndex }
  | { kind: 'tableau'; pileIndex: TableauIndex; cardIndex: number };

export type DrawMode = 'draw1' | 'draw3';

export interface SolitaireHint {
  source: MoveSource;
  target: MoveTarget;
  descriptionKey:
    | 'games.solitaire_v1.hint.wasteToFoundation'
    | 'games.solitaire_v1.hint.tableauToFoundation'
    | 'games.solitaire_v1.hint.wasteToTableau'
    | 'games.solitaire_v1.hint.tableauToTableau';
}

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
  score: number;
  drawMode: DrawMode;
}

export interface GameOutcome {
  won: boolean;
  /** True when no legal move exists and the game is not won. */
  stuck: boolean;
}
