import type { BaseGameProps, GameConfig } from "../types";
import type { GameRoomSummary, GameSessionSummary } from "@/shared/types/games";

/**
 * Standardized game props factory for creating consistent game component props
 */
export class GamePropsFactory {
  /**
   * Create standardized game props
   */
  public static createProps(
    room: GameRoomSummary,
    session: GameSessionSummary | null,
    currentUserId: string | null,
    isHost: boolean,
    config: GameConfig,
    callbacks: {
      onPostHistoryNote: (message: string, scope: "all" | "players") => void;
      onAction?: (action: string, payload?: Record<string, unknown>) => void;
    }
  ): BaseGameProps {
    return {
      roomId: room.id,
      room,
      session,
      currentUserId,
      isHost,
      config,
      onPostHistoryNote: callbacks.onPostHistoryNote,
      onAction: callbacks.onAction,
    };
  }

  /**
   * Validate game props
   */
  public static validateProps(props: BaseGameProps): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate required fields
    if (!props.room) {
      errors.push("Room is required");
    }

    if (!props.currentUserId) {
      errors.push("Current user ID is required");
    }

    if (!props.config) {
      errors.push("Game config is required");
    }

    // Validate room
    if (props.room) {
      if (!props.room.id) {
        errors.push("Room ID is required");
      }

      if (props.room.playerCount < (props.config?.minPlayers || 2)) {
        errors.push(`Minimum players required: ${props.config?.minPlayers || 2}`);
      }

      if (props.room.playerCount > (props.config?.maxPlayers || 10)) {
        errors.push(`Maximum players allowed: ${props.config?.maxPlayers || 10}`);
      }
    }

    // Validate session if present
    if (props.session) {
      if (props.session.status === "active" && !props.session.state) {
        errors.push("Active session must have state");
      }
    }

    // Validate callbacks
    if (typeof props.onPostHistoryNote !== "function") {
      errors.push("onPostHistoryNote callback is required");
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Create minimal props for game initialization
   */
  public static createMinimalProps(
    room: GameRoomSummary,
    currentUserId: string | null,
    config: GameConfig
  ): BaseGameProps {
    return {
      roomId: room.id,
      room,
      session: null,
      currentUserId,
      isHost: room.hostId === currentUserId,
      config,
      onPostHistoryNote: () => {},
      onAction: () => {},
    };
  }

  /**
   * Update props with new session data
   */
  public static updatePropsWithSession(
    props: BaseGameProps,
    session: GameSessionSummary | null
  ): BaseGameProps {
    return {
      ...props,
      roomId: props.room.id,
      session,
      isHost: props.room.hostId === props.currentUserId
    };
  }

  /**
   * Create props for AI game mode
   */
  public static createAIProps(
    room: GameRoomSummary,
    session: GameSessionSummary | null,
    config: GameConfig,
    difficulty: "easy" | "medium" | "hard" = "medium",
    callbacks: {
      onPostHistoryNote: (message: string, scope: "all" | "players") => void;
      onAction?: (action: string, payload?: Record<string, unknown>) => void;
    }
  ): BaseGameProps {
    if (!config.supportsAI) {
      throw new Error(`Game ${config.slug} does not support AI players`);
    }

    return {
      ...this.createProps(room, session, "ai-player", false, config, callbacks),
      config: {
        ...config,
        ...(difficulty && { aiDifficulty: difficulty })
      }
    };
  }

  /**
   * Create spectator props for watching games
   */
  public static createSpectatorProps(
    room: GameRoomSummary,
    session: GameSessionSummary | null,
    config: GameConfig,
    callbacks: {
      onPostHistoryNote: (message: string, scope: "all" | "players") => void;
    }
  ): BaseGameProps {
    return {
      roomId: room.id,
      room,
      session,
      currentUserId: null,
      isHost: false,
      config,
      onPostHistoryNote: callbacks.onPostHistoryNote,
      // Spectators cannot perform actions
    };
  }

  /**
   * Extract game-specific props from base props
   */
  public static extractGameSpecificProps<T extends Record<string, unknown>>(
    baseProps: BaseGameProps,
    additionalProps: T
  ): BaseGameProps & T {
    return {
      ...baseProps,
      ...additionalProps
    };
  }

  /**
   * Create props for tournament mode
   */
  public static createTournamentProps(
    room: GameRoomSummary,
    session: GameSessionSummary | null,
    currentUserId: string | null,
    config: GameConfig,
    tournamentData: {
      tournamentId: string;
      round: number;
      match: number;
      bracket: string;
    },
    callbacks: {
      onPostHistoryNote: (message: string, scope: "all" | "players") => void;
      onAction?: (action: string, payload?: Record<string, unknown>) => void;
    }
  ): BaseGameProps & { tournamentData: typeof tournamentData } {
    return {
      ...this.createProps(room, session, currentUserId, false, config, callbacks),
      tournamentData
    };
  }

  /**
   * Create practice mode props
   */
  public static createPracticeProps(
    config: GameConfig,
    callbacks: {
      onPostHistoryNote: (message: string, scope: "all" | "players") => void;
      onAction?: (action: string, payload?: Record<string, unknown>) => void;
    }
  ): BaseGameProps {
    // Create minimal practice room data
    const practiceRoomData = {
      id: "practice-room",
      name: "Practice Room",
      gameId: config.slug,
      playerCount: 1,
      maxPlayers: 1,
      status: "in_progress" as const,
      visibility: "private" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hostId: "practice-user"
    };

    return {
      roomId: practiceRoomData.id,
      room: practiceRoomData,
      session: null,
      currentUserId: "practice-user",
      isHost: true,
      config,
      onPostHistoryNote: callbacks.onPostHistoryNote,
      onAction: callbacks.onAction,
    };
  }
}

/**
 * Type guards for different game prop configurations
 */
export const GamePropsGuards = {
  /**
   * Check if props are for an AI game
   */
  isAIProps: (props: BaseGameProps): props is BaseGameProps & { config: GameConfig & { aiDifficulty?: string } } => {
    return !!(props.config?.supportsAI && (props.config as GameConfig & { aiDifficulty?: string }).aiDifficulty);
  },

  /**
   * Check if props are for a spectator
   */
  isSpectatorProps: (props: BaseGameProps): props is BaseGameProps & { currentUserId: null } => {
    return props.currentUserId === null;
  },

  /**
   * Check if props are for a tournament
   */
  isTournamentProps: (props: BaseGameProps): props is BaseGameProps & { tournamentData: Record<string, unknown> } => {
    return !!(props as BaseGameProps & { tournamentData: Record<string, unknown> }).tournamentData;
  },

  /**
   * Check if props are for practice mode
   */
  isPracticeProps: (props: BaseGameProps): props is BaseGameProps & { room: { id: "practice-room" } } => {
    return props.room.id === "practice-room";
  }
};