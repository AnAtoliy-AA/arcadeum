'use client';

import { useCallback, useState } from 'react';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { PIECE_STYLE_OPTIONS, type ChessPieceStyle } from '../lib/piece-style';
import {
  BOARD_THEME_OPTIONS,
  useBoardThemePreference,
  type ChessBoardTheme,
} from '../lib/board-theme';
import {
  SOUND_PACK_OPTIONS,
  useSoundPreferences,
  type ChessSoundPack,
} from '../lib/sound-preferences';
import { useStreamerMode } from '../lib/streamer-mode';
import { useShowCoordinates } from '../lib/board-preferences';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { SettingsSwitch } from './SettingsSwitch';

interface ChessSettingsPanelProps {
  pieceStyle: ChessPieceStyle;
  onSelectPieceStyle?: (style: ChessPieceStyle) => void;
  isAdmin?: boolean;
  showBestMove?: boolean;
  showThreats?: boolean;
  onToggleBestMove?: () => void;
  onToggleThreats?: () => void;
  onFlipBoard?: () => void;
  onExportPgn?: () => void;
  onToggleConfirmMoves?: () => void;
  confirmMoves?: boolean;
}

export function ChessSettingsPanel({
  pieceStyle,
  onSelectPieceStyle,
  isAdmin = false,
  showBestMove = false,
  showThreats = false,
  onToggleBestMove,
  onToggleThreats,
  onFlipBoard,
  onExportPgn,
  onToggleConfirmMoves,
  confirmMoves,
}: ChessSettingsPanelProps) {
  const { t } = useTranslation();
  const { showCoordinates, setShowCoordinates } = useShowCoordinates();
  const { boardThemeId, setBoardTheme } = useBoardThemePreference();
  const { volume, soundPack, setVolume, setSoundPack } = useSoundPreferences();
  const {
    enabled: streamerEnabled,
    setEnabled: setStreamerEnabled,
    copyObsUrl,
  } = useStreamerMode();
  const [shareConfirmed, setShareConfirmed] = useState(false);

  const handleShareGame = useCallback(() => {
    if (typeof window === 'undefined') return;
    navigator.clipboard
      .writeText(window.location.href)
      .then(() => {
        setShareConfirmed(true);
        const timer = window.setTimeout(() => setShareConfirmed(false), 2000);
        return () => window.clearTimeout(timer);
      })
      .catch(() => undefined);
  }, []);

  const handleBoardTheme = useCallback(
    (id: ChessBoardTheme | null) => {
      setBoardTheme(boardThemeId === id ? null : id);
    },
    [boardThemeId, setBoardTheme],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-bold text-[var(--textSecondary)] uppercase tracking-wider">
          {t('games.chess_v1.settings.pieceSet')}
        </span>
        <div className="grid grid-cols-2 gap-1.5">
          {PIECE_STYLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              aria-pressed={pieceStyle === opt.id}
              onClick={() => onSelectPieceStyle?.(opt.id)}
              className={cx(
                'flex flex-col items-start p-2 rounded-xl border text-left transition-all cursor-pointer',
                pieceStyle === opt.id
                  ? 'bg-amber-500/15 border-amber-400 text-white shadow-sm'
                  : 'bg-white/5 border-white/10 text-[var(--textSecondary)] hover:bg-white/10 hover:text-white',
              )}
            >
              <span className="text-xs font-bold leading-none mb-1">
                {opt.name}
              </span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-black/40 text-[var(--textSecondary)]">
                {opt.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
        <span className="text-[11px] font-bold text-[var(--textSecondary)] uppercase tracking-wider">
          {t('games.chess_v1.settings.boardColor')}
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          <button
            type="button"
            aria-pressed={!boardThemeId}
            onClick={() => handleBoardTheme(null)}
            className={cx(
              'flex flex-col items-center gap-1 p-1.5 rounded-lg border text-center transition-all cursor-pointer',
              !boardThemeId
                ? 'border-amber-400 bg-amber-500/10'
                : 'border-white/10 bg-white/5 hover:bg-white/10',
            )}
          >
            <div className="w-7 h-4 rounded-sm overflow-hidden flex">
              <div className="flex-1 bg-[#766d5a]" />
              <div className="flex-1 bg-[#2e241a]" />
            </div>
            <span className="text-[8px] text-[var(--textSecondary)] leading-none">
              {t('games.chess_v1.settings.themeDefault')}
            </span>
          </button>
          {BOARD_THEME_OPTIONS.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => handleBoardTheme(theme.id)}
              title={theme.name}
              aria-label={theme.name}
              aria-pressed={boardThemeId === theme.id}
              className={cx(
                'flex flex-col items-center gap-1 p-1.5 rounded-lg border text-center transition-all cursor-pointer',
                boardThemeId === theme.id
                  ? 'border-amber-400 bg-amber-500/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10',
              )}
            >
              <div className="w-7 h-4 rounded-sm overflow-hidden flex">
                <div
                  className="flex-1"
                  style={{ backgroundColor: theme.lightSquare }}
                />
                <div
                  className="flex-1"
                  style={{ backgroundColor: theme.darkSquare }}
                />
              </div>
              <span className="text-[8px] text-[var(--textSecondary)] leading-none truncate w-full">
                {theme.name.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 pt-1 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[var(--textSecondary)] uppercase tracking-wider">
            {t('games.chess_v1.settings.sound')}
          </span>
          <span className="text-[10px] font-mono text-[var(--textSecondary)]">
            {Math.round(volume * 100)}%
          </span>
        </div>
        <input
          id="chess-volume-slider"
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          aria-label={t('games.chess_v1.settings.volume')}
          aria-valuetext={`${Math.round(volume * 100)}%`}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full accent-amber-400 h-1.5 rounded cursor-pointer"
        />
        <div className="grid grid-cols-4 gap-1">
          {SOUND_PACK_OPTIONS.map((pack) => (
            <button
              key={pack.id}
              type="button"
              aria-pressed={soundPack === pack.id}
              onClick={() => setSoundPack(pack.id as ChessSoundPack)}
              className={cx(
                'py-1 px-1.5 rounded-lg border text-[9px] font-bold text-center transition-all cursor-pointer',
                soundPack === pack.id
                  ? 'bg-amber-500/15 border-amber-400 text-white'
                  : 'bg-white/5 border-white/10 text-[var(--textSecondary)] hover:bg-white/10',
              )}
            >
              {pack.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
        <SettingsSwitch
          id="chess-streamer-mode-toggle"
          label={t('games.chess_v1.settings.streamerMode')}
          checked={streamerEnabled}
          onChange={setStreamerEnabled}
        />
        {streamerEnabled && (
          <button
            id="chess-copy-obs-url"
            type="button"
            onClick={copyObsUrl}
            className="text-[10px] text-amber-400 underline cursor-pointer bg-transparent border-0 text-left hover:text-amber-300 transition-colors"
          >
            {t('games.chess_v1.settings.copyObs')}
          </button>
        )}
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
        <span className="text-[11px] font-bold text-[var(--textSecondary)] uppercase tracking-wider">
          {t('games.chess_v1.settings.share')}
        </span>
        <button
          id="chess-share-game-link"
          type="button"
          onClick={handleShareGame}
          className={cx(
            'px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer',
            shareConfirmed
              ? 'bg-emerald-500/15 border-emerald-400 text-emerald-300'
              : 'bg-white/5 border-white/10 text-[var(--textSecondary)] hover:bg-white/10 hover:text-white',
          )}
        >
          {shareConfirmed
            ? t('games.chess_v1.settings.linkCopied')
            : t('games.chess_v1.settings.copyLink')}
        </button>
      </div>

      <div className="flex flex-col gap-2 pt-1 border-t border-white/10">
        {onFlipBoard && (
          <Button variant="outline" size="sm" fullWidth onClick={onFlipBoard}>
            {t('games.chess_v1.settings.flip')}
          </Button>
        )}
        {onExportPgn && (
          <Button variant="outline" size="sm" fullWidth onClick={onExportPgn}>
            {t('games.chess_v1.settings.exportPgn')}
          </Button>
        )}
        <SettingsSwitch
          id="chess-coordinates-toggle"
          label={t('games.chess_v1.settings.coordinates')}
          checked={showCoordinates}
          onChange={setShowCoordinates}
        />
        {onToggleConfirmMoves && (
          <SettingsSwitch
            id="chess-confirm-moves-toggle"
            label={t('games.chess_v1.settings.confirmMoves')}
            checked={!!confirmMoves}
            onChange={() => onToggleConfirmMoves()}
          />
        )}
        {isAdmin && (onToggleBestMove || onToggleThreats) && (
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">
              Admin Streamer Assists
            </span>
            {onToggleBestMove && (
              <Button
                variant={showBestMove ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={onToggleBestMove}
              >
                🎯 Best Move Arrow: {showBestMove ? 'ON' : 'OFF'}
              </Button>
            )}
            {onToggleThreats && (
              <Button
                variant={showThreats ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={onToggleThreats}
              >
                ⚔️ Threats &amp; Attacks: {showThreats ? 'ON' : 'OFF'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
