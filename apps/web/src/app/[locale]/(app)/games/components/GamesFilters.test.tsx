import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GamesFilters } from './GamesFilters';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'games.lounge.searchPlaceholder': 'Search games...',
        'games.lounge.filters.status.all': 'All',
        'games.lounge.filters.status.lobby': 'Lobby',
        'games.lounge.filters.status.in_progress': 'In Progress',
        'games.lounge.filters.status.completed': 'Completed',
        'games.lounge.filters.statusLabel': 'Status',
        'games.lounge.filters.participationLabel': 'Participation',
        'games.lounge.filters.participation.all': 'All',
        'games.lounge.filters.participation.hosting': 'Hosting',
        'games.lounge.filters.participation.joined': 'Joined',
        'games.lounge.filters.participation.not_joined': 'Not Joined',
        'games.lounge.filters.aiVsAi': 'AI vs AI',
        'games.lounge.filters.clearAll': 'Clear all',
        'games.create.loginRequired': 'Login required',
      };
      return translations[key] || key;
    },
    locale: 'en',
  }),
}));

describe('GamesFilters', () => {
  const defaultProps = {
    searchQuery: '',
    onSearch: vi.fn(),
    statusFilter: [] as ('lobby' | 'in_progress' | 'completed')[],
    onStatusChange: vi.fn(),
    participationFilter: 'all' as const,
    onParticipationChange: vi.fn(),
    categoryFilter: '',
    onCategoryChange: vi.fn(),
    aiVsAiFilter: 'all' as const,
    onAiVsAiChange: vi.fn(),
    canFilterParticipation: true,
    onClearAll: vi.fn(),
  };

  it('renders search input and filters container', () => {
    render(<GamesFilters {...defaultProps} />);
    expect(screen.getByTestId('games-filters-container')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search games...')).toBeInTheDocument();
  });

  it('triggers onSearch when search input changes', () => {
    const onSearch = vi.fn();
    render(<GamesFilters {...defaultProps} onSearch={onSearch} />);
    const input = screen.getByPlaceholderText('Search games...');
    fireEvent.change(input, { target: { value: 'Sea' } });
    expect(onSearch).toHaveBeenCalledWith('Sea');
  });

  it('triggers onStatusChange when clicking a status option', () => {
    const onStatusChange = vi.fn();
    render(<GamesFilters {...defaultProps} onStatusChange={onStatusChange} />);
    const statusDropdown = screen.getByTestId('rooms-filter-status-dropdown');
    fireEvent.click(statusDropdown);
    const lobbyBtn = screen.getByRole('checkbox', { name: 'Lobby' });
    fireEvent.click(lobbyBtn);
    expect(onStatusChange).toHaveBeenCalledWith(['lobby']);
  });

  it('triggers onAiVsAiChange when clicking AI vs AI button', () => {
    const onAiVsAiChange = vi.fn();
    render(<GamesFilters {...defaultProps} onAiVsAiChange={onAiVsAiChange} />);
    const aiBtn = screen.getByRole('button', { name: /Toggle AI vs AI mode/i });
    fireEvent.click(aiBtn);
    expect(onAiVsAiChange).toHaveBeenCalledWith('ai_vs_ai');
  });

  it('displays clear all button when active filters exist and triggers onClearAll', () => {
    const onClearAll = vi.fn();
    render(
      <GamesFilters
        {...defaultProps}
        searchQuery="Battle"
        onClearAll={onClearAll}
      />,
    );
    const clearBtn = screen.getByTestId('rooms-filter-clear-all');
    expect(clearBtn).toBeInTheDocument();
    fireEvent.click(clearBtn);
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });
});
