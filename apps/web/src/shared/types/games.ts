export interface GameRoomMemberSummary {
  id: string;
  displayName: string;
}

export interface GameRoomSummary {
  id: string;
  gameId: string;
  name: string;
  hostId: string;
  visibility: "public" | "private";
  playerCount: number;
  maxPlayers: number | null;
  createdAt: string;
  status: "lobby" | "in_progress" | "completed";
  inviteCode?: string;
  host?: GameRoomMemberSummary;
  members?: GameRoomMemberSummary[];
}

export interface GameSessionSummary {
  id: string;
  roomId: string;
  gameId: string;
  engine: string;
  status: "waiting" | "active" | "completed";
  state: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export type ExplodingCatsCard =
  | "exploding_cat"
  | "defuse"
  | "attack"
  | "skip"
  | "tacocat"
  | "hairy_potato_cat"
  | "rainbow_ralphing_cat"
  | "cattermelon"
  | "bearded_cat";

export type ExplodingCatsCatCard =
  | "tacocat"
  | "hairy_potato_cat"
  | "rainbow_ralphing_cat"
  | "cattermelon"
  | "bearded_cat";

export interface ExplodingCatsPlayerState {
  playerId: string;
  hand: ExplodingCatsCard[];
  alive: boolean;
}

export interface ExplodingCatsLogEntry {
  id: string;
  type: "system" | "action" | "message";
  message: string;
  createdAt: string;
  senderId?: string | null;
  senderName?: string | null;
  scope?: "all" | "players";
}

export interface ExplodingCatsSnapshot {
  deck: ExplodingCatsCard[];
  discardPile: ExplodingCatsCard[];
  playerOrder: string[];
  currentTurnIndex: number;
  pendingDraws: number;
  players: ExplodingCatsPlayerState[];
  logs: ExplodingCatsLogEntry[];
}
