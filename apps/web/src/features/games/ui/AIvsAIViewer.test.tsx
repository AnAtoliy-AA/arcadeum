import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIvsAIViewer } from './AIvsAIViewer';

const push = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('@/shared/config/useRoutes', () => ({
  useRoutes: () => ({
    gameRoom: (id: string) => `/games/rooms/${id}`,
  }),
}));

vi.mock('@/shared/lib/useTranslation', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@/entities/session/model/useSessionTokens', () => ({
  useSessionTokens: () => ({ snapshot: { accessToken: 'token-1' } }),
}));

vi.mock('@/features/games/api', () => ({
  gamesApi: {
    createAiVsAi: vi.fn(),
  },
}));

import { gamesApi } from '@/features/games/api';

const createAiVsAi = gamesApi.createAiVsAi as ReturnType<typeof vi.fn>;

describe('AIvsAIViewer', () => {
  beforeEach(() => {
    push.mockClear();
    createAiVsAi.mockClear();
    createAiVsAi.mockResolvedValue({ room: { id: 'room-42' } });
  });

  it('creates a room with the default 2s delay and routes to watch mode', async () => {
    render(<AIvsAIViewer gameId="chess_v1" />);
    fireEvent.click(screen.getByTestId('ai-vs-ai-button'));

    await waitFor(() => {
      expect(createAiVsAi).toHaveBeenCalledWith(
        'chess_v1',
        { aiMoveDelayMs: 2000 },
        { token: 'token-1' },
      );
    });
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/games/rooms/room-42?mode=watch');
    });
  });

  it('uses the selected delay when creating the room', async () => {
    render(<AIvsAIViewer gameId="checkers_v1" />);
    fireEvent.click(screen.getByTestId('ai-vs-ai-delay-5000'));
    fireEvent.click(screen.getByTestId('ai-vs-ai-button'));

    await waitFor(() => {
      expect(createAiVsAi).toHaveBeenCalledWith(
        'checkers_v1',
        { aiMoveDelayMs: 5000 },
        { token: 'token-1' },
      );
    });
  });

  it('surfaces an error state when creation fails', async () => {
    createAiVsAi.mockRejectedValue(new Error('boom'));
    render(<AIvsAIViewer gameId="chess_v1" />);
    fireEvent.click(screen.getByTestId('ai-vs-ai-button'));

    await waitFor(() => {
      expect(
        screen.getByText('games.aiVsAi.error') ||
          screen.getByText("Couldn't start — try again"),
      ).toBeInTheDocument();
    });
    expect(push).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', () => {
    render(<AIvsAIViewer gameId="chess_v1" disabled />);
    fireEvent.click(screen.getByTestId('ai-vs-ai-button'));
    expect(createAiVsAi).not.toHaveBeenCalled();
  });
});
