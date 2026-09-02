'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { MusicOnIcon, MusicOffIcon } from '@arcadeum/ui';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

interface DesktopSecondaryControlsProps {
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onShowRules?: () => void;
  onShowTutorial?: () => void;
}

export function DesktopSecondaryControls({
  musicEnabled,
  onToggleMusic,
  onShowRules,
  onShowTutorial,
}: DesktopSecondaryControlsProps) {
  const { t } = useTranslation();

  return (
    <div className="hidden sm:flex sm:flex-row sm:items-center sm:gap-2">
      <Button
        className={cx(
          'w-9 h-9 !p-0 shrink-0',
          musicEnabled &&
            '!border-[var(--primary)] !bg-[color:color-mix(in_srgb,var(--primary)_15%,transparent)]',
        )}
        variant="glass"
        size="sm"
        aria-pressed={musicEnabled}
        onClick={onToggleMusic}
        aria-label={t('settings.musicLabel')}
        title={t('settings.musicLabel')}
        data-testid="music-toggle-button"
      >
        {musicEnabled ? <MusicOnIcon size={16} /> : <MusicOffIcon size={16} />}
      </Button>

      {(onShowRules || onShowTutorial) && (
        <div className="h-5 w-px bg-white/10" />
      )}

      {onShowRules && (
        <Button
          className="w-9 h-9 !p-0 shrink-0"
          variant="glass"
          size="sm"
          onClick={onShowRules}
          aria-label={t('games.table.controlPanel.rules') || 'Game Rules'}
          title={t('games.table.controlPanel.rules') || 'Game Rules'}
          data-testid="show-rules-button"
        >
          📖
        </Button>
      )}

      {onShowTutorial && (
        <Button
          className="w-9 h-9 !p-0 shrink-0"
          variant="glass"
          size="sm"
          onClick={onShowTutorial}
          aria-label={t('games.tutorial.ui.button')}
          title={t('games.tutorial.ui.button')}
          data-testid="show-tutorial-button-desktop"
        >
          🎓
        </Button>
      )}
    </div>
  );
}
