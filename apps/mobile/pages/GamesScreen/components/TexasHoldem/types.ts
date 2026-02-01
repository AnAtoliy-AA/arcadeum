export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';

export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type BettingRound = 'pre-flop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerAction =
  | 'fold'
  | 'check'
  | 'call'
  | 'raise'
  | 'all-in'
  | 'waiting';

export interface TexasHoldemPlayerState {
  playerId: string;
  chips: number;
  hand: Card[];
  currentBet: number;
  totalBet: number;
  folded: boolean;
  allIn: boolean;
  lastAction?: PlayerAction;
}

export interface TexasHoldemLogEntry {
  id: string;
  type: 'system' | 'action' | 'message';
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: 'all' | 'players';
}

export interface TexasHoldemSnapshot {
  deck: Card[];
  communityCards: Card[];
  pot: number;
  sidePots: Array<{ amount: number; eligiblePlayers: string[] }>;
  playerOrder: string[];
  dealerIndex: number;
  currentTurnIndex: number;
  bettingRound: BettingRound;
  currentBet: number;
  players: TexasHoldemPlayerState[];
  logs: TexasHoldemLogEntry[];
  lastToRaise: number | null;
  roundComplete: boolean;
}
