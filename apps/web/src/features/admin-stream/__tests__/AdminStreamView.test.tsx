import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';
import { interpolate } from '@arcadeum/games-core';
import { adminStreamEn } from '@/shared/i18n/messages/pages/admin-stream/en';
import { makeSettings, makeStatus, makeView } from './fixtures';

vi.mock('@/shared/i18n/useTranslation', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      let cur: unknown = { pages: { adminStream: adminStreamEn } };
      for (const p of key.split('.')) {
        if (cur && typeof cur === 'object' && p in cur)
          cur = (cur as Record<string, unknown>)[p];
        else return key;
      }
      return typeof cur === 'string' ? interpolate(cur, params ?? {}) : key;
    },
  }),
}));

vi.mock('@/features/games/registry', () => ({
  gameMetadata: { chess_v1: { name: 'Chess' } },
}));

const actions = vi.hoisted(() => ({
  saveStreamSettingsAction: vi.fn(),
  sendStreamCommandAction: vi.fn(),
  loadStreamStatusAction: vi.fn(),
  loadStreamAuditAction: vi.fn(),
  loadStreamSettingsAction: vi.fn(),
}));
vi.mock('../server/stream.actions', () => actions);

import { AdminStreamView } from '../ui/AdminStreamView';

const audit = [
  {
    id: 'a1',
    kind: 'settings' as const,
    version: 3,
    adminLabel: 'Alice',
    changedAt: '2026-11-20T10:00:00.000Z',
    changes: [{ path: 'bot.moveDelayMs', from: 2000, to: 3000 }],
  },
];

function renderView(over: Partial<Parameters<typeof AdminStreamView>[0]> = {}) {
  return render(
    <AdminStreamView
      initialSettings={makeView()}
      initialStatus={makeStatus()}
      initialAudit={audit}
      {...over}
    />,
  );
}

beforeEach(() => {
  actions.loadStreamStatusAction.mockResolvedValue({
    ok: true,
    data: makeStatus(),
  });
  actions.loadStreamAuditAction.mockResolvedValue({ ok: true, data: audit });
  actions.loadStreamSettingsAction.mockResolvedValue({
    ok: true,
    data: makeView(),
  });
});
afterEach(() => vi.clearAllMocks());

const change = (testId: string, value: string) =>
  fireEvent.change(screen.getByTestId(testId), { target: { value } });

describe('AdminStreamView: status and key notice', () => {
  it('shows live status, current game, uptime, fps and the applied version', () => {
    renderView();
    expect(screen.getByTestId('stream-phase')).toHaveAttribute(
      'data-phase',
      'live',
    );
    expect(screen.getByTestId('stream-current-game')).toHaveTextContent(
      'Chess (zen)',
    );
    expect(screen.getByTestId('stream-uptime')).toHaveTextContent('2h 1m');
    expect(screen.getByTestId('stream-fps')).toHaveTextContent('30');
    expect(screen.getByTestId('stream-applied-version')).toHaveTextContent('3');
    expect(screen.getByTestId('stream-sync-state')).toHaveAttribute(
      'data-synced',
      'true',
    );
  });

  it('shows pending pickup when the director has not applied the saved version', () => {
    renderView({
      initialStatus: makeStatus({
        appliedConfigVersion: 2,
        currentConfigVersion: 3,
      }),
    });
    expect(screen.getByTestId('stream-sync-state')).toHaveAttribute(
      'data-synced',
      'false',
    );
    expect(screen.getByTestId('stream-sync-state')).toHaveTextContent(
      'version 3',
    );
  });

  it('shows offline when the stream server has never reported', () => {
    renderView({
      initialStatus: makeStatus({
        online: false,
        lastReportAt: null,
        state: null,
        appliedConfigVersion: null,
      }),
    });
    expect(screen.getByTestId('stream-phase')).toHaveAttribute(
      'data-phase',
      'offline',
    );
    expect(screen.getByTestId('stream-never-reported')).toBeInTheDocument();
  });

  it('shows the last error from the director', () => {
    renderView({
      initialStatus: makeStatus({
        recentErrors: ['12:00:00 ffmpeg exited: signal SIGKILL'],
      }),
    });
    expect(screen.getByTestId('stream-last-error')).toHaveTextContent(
      'ffmpeg exited',
    );
  });

  it('says that the stream key is never stored or returned', () => {
    renderView();
    expect(screen.getByTestId('stream-key-notice')).toHaveTextContent(
      /never stored here or returned by the API/,
    );
  });
});

describe('AdminStreamView: load states', () => {
  it('shows an error state with retry when settings failed to load', async () => {
    renderView({ initialSettings: null });
    expect(screen.getByTestId('stream-load-error')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() =>
      expect(screen.getByTestId('admin-stream')).toBeInTheDocument(),
    );
  });

  it('shows empty and error states for the audit list', () => {
    const { unmount } = renderView({ initialAudit: [] });
    expect(screen.getByTestId('stream-audit-empty')).toBeInTheDocument();
    unmount();
    renderView({ initialAudit: null });
    expect(screen.getByTestId('stream-audit-error')).toBeInTheDocument();
  });

  it('lists recent changes with who and what', () => {
    renderView();
    const item = screen.getByTestId('stream-audit-item');
    expect(item).toHaveTextContent('Alice');
    expect(item).toHaveTextContent('bot.moveDelayMs');
    expect(item).toHaveTextContent('2000');
    expect(item).toHaveTextContent('3000');
  });
});

describe('AdminStreamView: controls', () => {
  it('Stop asks for confirmation and sends a graceful stop by default', async () => {
    actions.sendStreamCommandAction.mockResolvedValue({
      ok: true,
      data: { id: 'c1' },
    });
    renderView();
    fireEvent.click(screen.getByTestId('stream-stop'));
    expect(actions.sendStreamCommandAction).not.toHaveBeenCalled();
    const dialog = await screen.findByTestId('stream-stop-dialog');
    expect(dialog).toHaveTextContent('Stop the live stream?');
    fireEvent.click(within(dialog).getByTestId('stream-stop-confirm'));
    await waitFor(() =>
      expect(actions.sendStreamCommandAction).toHaveBeenCalledWith({
        type: 'stop',
        graceful: true,
      }),
    );
    expect(await screen.findByText(/Command sent/)).toBeInTheDocument();
  });

  it('cancelling the confirmation sends nothing', async () => {
    renderView();
    fireEvent.click(screen.getByTestId('stream-stop'));
    fireEvent.click(await screen.findByTestId('stream-stop-cancel'));
    expect(actions.sendStreamCommandAction).not.toHaveBeenCalled();
  });

  it('Skip sends the skip command without confirmation', async () => {
    actions.sendStreamCommandAction.mockResolvedValue({
      ok: true,
      data: { id: 'c2' },
    });
    renderView();
    fireEvent.click(screen.getByTestId('stream-skip'));
    await waitFor(() =>
      expect(actions.sendStreamCommandAction).toHaveBeenCalledWith({
        type: 'skip',
        graceful: undefined,
      }),
    );
  });

  it('shows Start (not Stop) when stopped, and Skip is disabled', () => {
    renderView({
      initialStatus: makeStatus({ state: 'stopped', currentGame: null }),
    });
    expect(screen.getByTestId('stream-start')).toBeInTheDocument();
    expect(screen.queryByTestId('stream-stop')).toBeNull();
    expect(screen.getByTestId('stream-skip')).toBeDisabled();
  });

  it('shows an error when a command fails', async () => {
    actions.sendStreamCommandAction.mockResolvedValue({
      ok: false,
      error: 'generic',
    });
    renderView();
    fireEvent.click(screen.getByTestId('stream-skip'));
    expect(
      await screen.findByText('Could not send the command.'),
    ).toBeInTheDocument();
  });

  it('reports a permission problem separately', async () => {
    actions.sendStreamCommandAction.mockResolvedValue({
      ok: false,
      error: 'forbidden',
    });
    renderView();
    fireEvent.click(screen.getByTestId('stream-skip'));
    expect(
      await screen.findByText(/do not have permission to control/),
    ).toBeInTheDocument();
  });
});

describe('AdminStreamView: settings form', () => {
  it('starts clean: save and discard are disabled', () => {
    renderView();
    expect(screen.getByTestId('stream-save')).toBeDisabled();
    expect(screen.getByTestId('stream-discard')).toBeDisabled();
    expect(screen.getByTestId('stream-last-saved')).toHaveTextContent('Alice');
  });

  it('editing marks the form unsaved and enables save', () => {
    renderView();
    change('stream-move-delay', '3000');
    expect(screen.getByTestId('stream-unsaved')).toBeInTheDocument();
    expect(screen.getByTestId('stream-save')).toBeEnabled();
  });

  it('shows units and the allowed range next to numeric fields', () => {
    renderView();
    const section = screen.getByTestId('stream-section-bot');
    expect(section).toHaveTextContent('ms');
    expect(section).toHaveTextContent('Allowed range: 500 to 8000');
  });

  it('blocks saving out-of-range values and explains why', () => {
    renderView();
    change('stream-move-delay', '99999');
    expect(screen.getByTestId('stream-save')).toBeDisabled();
    expect(screen.getByTestId('stream-has-errors')).toBeInTheDocument();
    expect(
      screen.getByText('Enter a value from 500 to 8000.'),
    ).toBeInTheDocument();
  });

  it('warns about too long banner text and links', () => {
    renderView();
    change('stream-banner', 'visit http://x.test');
    expect(
      screen.getByText('Remove links, markup and long dashes.'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('stream-save')).toBeDisabled();
  });

  it('keeps at least two games enabled', () => {
    renderView();
    const ids = Object.keys(makeSettings().games);
    for (const id of ids.slice(1))
      fireEvent.click(screen.getByTestId(`stream-game-${id}-enabled`));
    expect(screen.getByTestId('stream-games-error')).toHaveTextContent(
      'at least 2 games',
    );
    expect(screen.getByTestId('stream-save')).toBeDisabled();
  });

  it('saves the full settings with the version it loaded and shows success', async () => {
    const next = makeSettings({ secondsBetweenGames: 30 });
    actions.saveStreamSettingsAction.mockResolvedValue({
      ok: true,
      data: makeView({ version: 4, settings: next }),
    });
    renderView();
    change('stream-seconds-between', '30');
    fireEvent.click(screen.getByTestId('stream-save'));
    await waitFor(() =>
      expect(actions.saveStreamSettingsAction).toHaveBeenCalledTimes(1),
    );
    const arg = actions.saveStreamSettingsAction.mock.calls[0][0] as {
      settings: { secondsBetweenGames: number };
      expectedVersion: number;
    };
    expect(arg.expectedVersion).toBe(3);
    expect(arg.settings.secondsBetweenGames).toBe(30);
    expect(await screen.findByTestId('stream-save-success')).toHaveTextContent(
      'Version 4',
    );
    expect(screen.queryByTestId('stream-unsaved')).toBeNull();
  });

  it('shows the backend validation message (profanity)', async () => {
    actions.saveStreamSettingsAction.mockResolvedValue({
      ok: false,
      error: 'validation',
      code: 'stream.bannerProfanity',
    });
    renderView();
    change('stream-banner', 'nice stream');
    fireEvent.click(screen.getByTestId('stream-save'));
    expect(await screen.findByTestId('stream-save-error')).toHaveTextContent(
      'banner text is not allowed',
    );
    expect(screen.getByTestId('stream-unsaved')).toBeInTheDocument();
  });

  it('handles a version conflict with a reload button', async () => {
    actions.saveStreamSettingsAction.mockResolvedValue({
      ok: false,
      error: 'conflict',
    });
    actions.loadStreamSettingsAction.mockResolvedValue({
      ok: true,
      data: makeView({ version: 5 }),
    });
    renderView();
    change('stream-seconds-between', '30');
    fireEvent.click(screen.getByTestId('stream-save'));
    expect(await screen.findByTestId('stream-save-error')).toHaveTextContent(
      'Someone else saved',
    );
    fireEvent.click(screen.getByTestId('stream-reload'));
    await waitFor(() =>
      expect(screen.queryByTestId('stream-unsaved')).toBeNull(),
    );
  });

  it('shows a generic error when the save fails', async () => {
    actions.saveStreamSettingsAction.mockResolvedValue({
      ok: false,
      error: 'generic',
    });
    renderView();
    change('stream-seconds-between', '30');
    fireEvent.click(screen.getByTestId('stream-save'));
    expect(await screen.findByTestId('stream-save-error')).toHaveTextContent(
      'Could not save the settings.',
    );
  });

  it('discard restores the saved values', () => {
    renderView();
    change('stream-seconds-between', '30');
    fireEvent.click(screen.getByTestId('stream-discard'));
    expect(screen.getByTestId('stream-seconds-between')).toHaveValue(15);
    expect(screen.queryByTestId('stream-unsaved')).toBeNull();
  });

  it('warns before leaving with unsaved changes (beforeunload and link clicks)', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    render(
      <>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- plain anchor on purpose: tests the document-level click guard */}
        <a href="/en/admin/economy" data-testid="outside-link">
          Economy
        </a>
        <AdminStreamView
          initialSettings={makeView()}
          initialStatus={makeStatus()}
          initialAudit={audit}
        />
      </>,
    );
    change('stream-seconds-between', '30');
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
    const click = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      button: 0,
    });
    screen.getByTestId('outside-link').dispatchEvent(click);
    expect(confirmSpy).toHaveBeenCalledWith(adminStreamEn.form.leaveWarning);
    expect(click.defaultPrevented).toBe(true);
    confirmSpy.mockRestore();
  });

  it('does not warn when there is nothing unsaved', () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    renderView();
    const unload = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(false);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });
});

describe('AdminStreamView: games table', () => {
  it('lists the 12 games with toggle, weight, themes and duration', () => {
    renderView();
    const row = screen.getByTestId('stream-game-chess_v1');
    expect(row).toHaveTextContent('Chess');
    expect(within(row).getByTestId('stream-game-chess_v1-weight')).toHaveValue(
      1,
    );
    expect(
      within(row).getByTestId('stream-game-chess_v1-duration'),
    ).toHaveValue(10);
    expect(screen.getAllByTestId(/^stream-game-[a-z_0-9]+$/)).toHaveLength(12);
  });

  it('edits weight, duration (minutes) and themes per game', async () => {
    actions.saveStreamSettingsAction.mockResolvedValue({
      ok: true,
      data: makeView({ version: 4 }),
    });
    renderView();
    change('stream-game-chess_v1-weight', '4');
    change('stream-game-chess_v1-duration', '5');
    fireEvent.click(screen.getByTestId('stream-game-chess_v1-theme-zen'));
    fireEvent.click(screen.getByTestId('stream-save'));
    await waitFor(() =>
      expect(actions.saveStreamSettingsAction).toHaveBeenCalled(),
    );
    const sent = (
      actions.saveStreamSettingsAction.mock.calls[0][0] as {
        settings: ReturnType<typeof makeSettings>;
      }
    ).settings;
    expect(sent.games.chess_v1.weight).toBe(4);
    expect(sent.games.chess_v1.maxDurationSec).toBe(300);
    expect(sent.games.chess_v1.themes).not.toContain('zen');
  });

  it('requires a theme for an enabled game', () => {
    renderView();
    for (const theme of makeSettings().games.chess_v1.themes) {
      fireEvent.click(
        screen.getByTestId(`stream-game-chess_v1-theme-${theme}`),
      );
    }
    expect(screen.getByText('Pick at least one theme.')).toBeInTheDocument();
    expect(screen.getByTestId('stream-save')).toBeDisabled();
  });
});
