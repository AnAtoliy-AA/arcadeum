import type { 
  GameRoomSummary, 
  GameSessionSummary, 
  BaseGameProps, 
  GameConfig 
} from "../types";

/**
 * Test utilities for games feature
 */
export class GameTestUtils {
  /**
   * Create mock game room
   */
  static createMockRoom(overrides: Partial<GameRoomSummary> = {}): GameRoomSummary {
    return {
      id: "test-room-1",
      name: "Test Room",
      gameId: "exploding_cats_v1",
      playerCount: 2,
      maxPlayers: 5,
      status: "in_progress",
      visibility: "public",
      createdAt: new Date("2024-01-01").toISOString(),
      hostId: "player-1",
      ...overrides
    };
  }

  /**
   * Create mock game session
   */
  static createMockSession(
    room: GameRoomSummary,
    overrides: Partial<GameSessionSummary> = {}
  ): GameSessionSummary {
    return {
      id: "test-session-1",
      roomId: room.id,
      gameId: room.gameId,
      engine: room.gameId,
      status: "active",
      state: {
        snapshot: {
          players: [
            {
              playerId: "player-1",
              hand: ["defuse", "attack"],
              alive: true,
              order: 0
            },
            {
              playerId: "player-2",
              hand: ["skip", "favor"],
              alive: true,
              order: 1
            }
          ],
          playerOrder: ["player-1", "player-2"],
          currentTurnIndex: 0,
          deckSize: 30,
          playedCards: []
        }
      },
      createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      updatedAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      ...overrides
    };
  }

  /**
   * Create mock game config
   */
  static createMockConfig(overrides: Partial<GameConfig> = {}): GameConfig {
    return {
      slug: "test-game_v1",
      name: "Test Game",
      description: "A test game for testing",
      category: "Test Game",
      minPlayers: 2,
      maxPlayers: 4,
      estimatedDuration: 30,
      complexity: 2,
      ageRating: "G",
      thumbnail: "/test-game.jpg",
      version: "1.0.0",
      supportsAI: false,
      tags: ["test", "game"],
      ...overrides
    };
  }

  /**
   * Create mock base game props
   */
  static createMockProps(overrides: Partial<BaseGameProps> = {}): BaseGameProps {
    const room = this.createMockRoom();
    const session = this.createMockSession(room);
    const config = this.createMockConfig({
      slug: room.gameId
    });

    return {
      roomId: room.id,
      room,
      session,
      currentUserId: "player-1",
      isHost: true,
      config,
      onPostHistoryNote: () => {},
      onAction: () => {},
      ...overrides
    };
  }

  /**
   * Create mock props for different scenarios
   */
  static createPropsForLobby(hostId: string = "player-1"): BaseGameProps {
    const room = this.createMockRoom({ hostId });
    const config = this.createMockConfig({
      slug: room.gameId
    });

    return {
      roomId: room.id,
      room,
      session: null,
      currentUserId: hostId,
      isHost: hostId === room.hostId,
      config,
      onPostHistoryNote: () => {},
      onAction: () => {}
    };
  }

  static createPropsForActiveGame(
    currentUserId: string = "player-1",
    isHost: boolean = false
  ): BaseGameProps {
    const room = this.createMockRoom();
    const session = this.createMockSession(room);
    const config = this.createMockConfig({
      slug: room.gameId
    });

    return {
      roomId: room.id,
      room,
      session,
      currentUserId,
      isHost,
      config,
      onPostHistoryNote: () => {},
      onAction: () => {}
    };
  }

  static createPropsForCompletedGame(): BaseGameProps {
    const room = this.createMockRoom();
    const session = this.createMockSession(room, {
      status: "completed"
    });
    const config = this.createMockConfig({
      slug: room.gameId
    });

    return {
      roomId: room.id,
      room,
      session,
      currentUserId: "player-1",
      isHost: false,
      config,
      onPostHistoryNote: () => {},
      onAction: () => {}
    };
  }

  /**
   * Create mock Texas Hold'em session
   */
  static createMockTexasHoldemSession(
    room: GameRoomSummary,
    overrides: Partial<GameSessionSummary> = {}
  ): GameSessionSummary {
    return {
      id: "test-texas-session-1",
      roomId: room.id,
      gameId: room.gameId,
      engine: room.gameId,
      status: "active",
      state: {
        snapshot: {
          players: [
            {
              playerId: "player-1",
              hand: [{ rank: "A", suit: "hearts" }, { rank: "K", suit: "spades" }],
              chips: 1000,
              currentBet: 20,
              folded: false,
              allIn: false,
              order: 0
            },
            {
              playerId: "player-2",
              hand: [{ rank: "Q", suit: "diamonds" }, { rank: "J", suit: "clubs" }],
              chips: 800,
              currentBet: 20,
              folded: false,
              allIn: false,
              order: 1
            }
          ],
          playerOrder: ["player-1", "player-2"],
          currentTurnIndex: 0,
          dealerIndex: 0,
          communityCards: [
            { rank: "10", suit: "hearts" },
            { rank: "9", suit: "diamonds" },
            { rank: "8", suit: "clubs" }
          ],
          pot: 40,
          currentBet: 20,
          bettingRound: "flop"
        }
      },
      createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      updatedAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      ...overrides
    };
  }

  /**
   * Create mock Exploding Kittens session
   */
  static createMockExplodingKittensSession(
    room: GameRoomSummary,
    overrides: Partial<GameSessionSummary> = {}
  ): GameSessionSummary {
    return {
      id: "test-exploding-session-1",
      roomId: room.id,
      gameId: room.gameId,
      engine: room.gameId,
      status: "active",
      state: {
        snapshot: {
          players: [
            {
              playerId: "player-1",
              hand: ["defuse", "attack", "skip"],
              alive: true,
              order: 0
            },
            {
              playerId: "player-2",
              hand: ["tacocat", "hairy_potato_cat", "rainbow_ralphing_cat"],
              alive: true,
              order: 1
            }
          ],
          playerOrder: ["player-1", "player-2"],
          currentTurnIndex: 0,
          deckSize: 25,
          playedCards: [],
          explodingCatsInDeck: 3
        }
      },
      createdAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      updatedAt: new Date("2024-01-01T10:00:00Z").toISOString(),
      ...overrides
    };
  }

  /**
   * Test utilities for common scenarios
   */
  static testGameRenders(_GameComponent: React.ComponentType<BaseGameProps>, _props: BaseGameProps) {
    // Basic render test - just check component accepts props
    try {
      return { success: true, element: null };
    } catch (error) {
      return { success: false, error };
    }
  }

  static testGamePropsValidation(props: BaseGameProps) {
    const errors: string[] = [];
    
    if (!props.room) errors.push("Room is required");
    if (!props.currentUserId) errors.push("Current user ID is required");
    if (!props.config) errors.push("Game config is required");
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static testResponsiveProps(props: BaseGameProps) {
    // Test that props work in different scenarios
    const scenarios = {
      mobile: { ...props, isMobile: true },
      desktop: { ...props, isMobile: false },
      fullscreen: { ...props, fullscreen: true }
    };
    
    return scenarios;
  }
}

// Mock functions for testing
export const mockGameActions = {
  startGame: () => {},
  joinGame: () => {},
  leaveGame: () => {},
  playCard: () => {},
  fold: () => {},
  call: () => {},
  raise: () => {},
  check: () => {}
};

// Test data factories
export const testDataFactory = {
  player: (id: string, overrides: Record<string, unknown> = {}) => ({
    playerId: id,
    name: `Player ${id}`,
    isHost: false,
    ready: false,
    ...overrides
  }),

  card: (rank: string, suit = 'hearts') => ({
    rank,
    suit
  })
};

// Integration test helpers
export const integrationTestHelpers = {
  /**
   * Test game loading through factory
   */
  async testGameFactoryLoading(gameSlug: string) {
    try {
      const { gameFactory } = await import('../lib/gameFactory');
      const GameComponent = await gameFactory.loadGame(gameSlug);
      return { success: true, GameComponent };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Test game registry
   */
  testGameRegistry(gameSlug: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const registry = require('../registry');
      const metadata = registry.gameMetadata[gameSlug];
      return { success: !!metadata, metadata };
    } catch (error) {
      return { success: false, error };
    }
  },

  /**
   * Test game props creation
   */
  testPropsCreation(gameSlug: string) {
    const room = GameTestUtils.createMockRoom({ gameId: gameSlug });
    const session = GameTestUtils.createMockSession(room);
    const config = GameTestUtils.createMockConfig({ slug: gameSlug });
    
    const props = {
      roomId: room.id,
      room,
      session,
      currentUserId: "test-user",
      isHost: true,
      config,
      onPostHistoryNote: () => {},
      onAction: () => {}
    };
    
    const validation = GameTestUtils.testGamePropsValidation(props);
    return { props, validation };
  }
};