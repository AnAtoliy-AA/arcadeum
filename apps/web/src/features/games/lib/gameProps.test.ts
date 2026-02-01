import { describe, it, expect, vi } from 'vitest';
import { GamePropsFactory, GamePropsGuards } from './gameProps';
import type { GameConfig, BaseGameProps } from '../types';
import type { GameRoomSummary } from '@/shared/types/games';

describe('GamePropsFactory', () => {
  const mockRoom = {
    id: 'r1',
    hostId: 'u1',
    playerCount: 2,
  } as GameRoomSummary;
  const mockConfig = {
    slug: 'g1',
    minPlayers: 2,
    maxPlayers: 4,
    supportsAI: true,
  } as GameConfig;

  it('creates standard props', () => {
    const onAction = vi.fn();
    const props = GamePropsFactory.createProps(
      mockRoom,
      null,
      'u1',
      true,
      mockConfig,
      { onPostHistoryNote: vi.fn(), onAction },
    );
    expect(props.roomId).toBe('r1');
    expect(props.isHost).toBe(true);
    expect(props.onAction).toBeDefined();
  });

  it('validates props correctly', () => {
    const validProps = GamePropsFactory.createMinimalProps(
      mockRoom,
      'u1',
      mockConfig,
    );
    expect(GamePropsFactory.validateProps(validProps).isValid).toBe(true);

    const invalidProps = {
      ...validProps,
      room: null,
    } as unknown as BaseGameProps;
    const result = GamePropsFactory.validateProps(invalidProps);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Room is required');
  });

  it('validates player counts', () => {
    const propsUnder = GamePropsFactory.createMinimalProps(
      { ...mockRoom, playerCount: 1 },
      'u1',
      mockConfig,
    );
    expect(GamePropsFactory.validateProps(propsUnder).isValid).toBe(false);

    const propsOver = GamePropsFactory.createMinimalProps(
      { ...mockRoom, playerCount: 5 },
      'u1',
      mockConfig,
    );
    expect(GamePropsFactory.validateProps(propsOver).isValid).toBe(false);
  });

  it('creates AI props if supported', () => {
    const props = GamePropsFactory.createAIProps(
      mockRoom,
      null,
      mockConfig,
      'hard',
      { onPostHistoryNote: vi.fn() },
    );
    expect(props.currentUserId).toBe('ai-player');
    expect(
      (props.config as GameConfig & { aiDifficulty?: string })?.aiDifficulty,
    ).toBe('hard');
  });

  it('throws when creating AI props for unsupported games', () => {
    const noAIConfig = { ...mockConfig, supportsAI: false };
    expect(() =>
      GamePropsFactory.createAIProps(mockRoom, null, noAIConfig, 'medium', {
        onPostHistoryNote: vi.fn(),
      }),
    ).toThrow(/does not support AI players/);
  });

  it('creates spectator props', () => {
    const props = GamePropsFactory.createSpectatorProps(
      mockRoom,
      null,
      mockConfig,
      { onPostHistoryNote: vi.fn() },
    );
    expect(props.currentUserId).toBeNull();
    expect(GamePropsGuards.isSpectatorProps(props)).toBe(true);
  });

  it('creates practice props', () => {
    const props = GamePropsFactory.createPracticeProps(mockConfig, {
      onPostHistoryNote: vi.fn(),
    });
    expect(props.roomId).toBe('practice-room');
    expect(GamePropsGuards.isPracticeProps(props)).toBe(true);
  });
});

describe('GamePropsGuards', () => {
  it('identifies AI props', () => {
    const props = {
      config: { supportsAI: true, aiDifficulty: 'medium' },
    } as unknown as BaseGameProps;
    expect(GamePropsGuards.isAIProps(props)).toBe(true);
  });

  it('identifies tournament props', () => {
    const props = { tournamentData: {} } as unknown as BaseGameProps;
    expect(GamePropsGuards.isTournamentProps(props)).toBe(true);
  });
});
