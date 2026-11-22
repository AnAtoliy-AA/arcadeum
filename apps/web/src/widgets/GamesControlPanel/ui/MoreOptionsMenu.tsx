'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { MusicOnIcon, MusicOffIcon, Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';

interface MoreOptionsMenuProps {
  musicEnabled: boolean;
  onToggleMusic: () => void;
  onShowRules?: () => void;
  onShowTutorial?: () => void;
  /** Add-friend action, only passed when relevant. */
  onAddFriend?: () => void;
  addFriendDisabled?: boolean;
  addFriendSent?: boolean;
  onExitRoom: () => void;
  /** Leave action, only passed for signed-in participants. */
  onLeave?: () => void;
}

interface MenuItemProps {
  icon: ReactNode;
  label: string;
  description?: string;
  testId: string;
  onSelect: () => void;
  disabled?: boolean;
  danger?: boolean;
  pressed?: boolean;
}

function MenuItem({
  icon,
  label,
  description,
  testId,
  onSelect,
  disabled,
  danger,
  pressed,
}: MenuItemProps) {
  return (
    <button
      type="button"
      role={pressed === undefined ? 'menuitem' : 'menuitemcheckbox'}
      aria-checked={pressed}
      disabled={disabled}
      data-testid={testId}
      onClick={onSelect}
      className={cx(
        'flex w-full items-center gap-3 rounded-lg px-3 py-2 min-h-11 text-left transition-colors',
        'hover:bg-[var(--surfaceHover)] focus-visible:bg-[var(--surfaceHover)] focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        danger ? 'text-[var(--error)]' : 'text-[var(--textPrimary)]',
      )}
    >
      <span aria-hidden className="flex w-5 shrink-0 justify-center text-base">
        {icon}
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-sm font-semibold">{label}</span>
        {description && (
          <span className="text-xs font-normal text-[var(--textMuted)]">
            {description}
          </span>
        )}
      </span>
    </button>
  );
}

export function MoreOptionsMenu({
  musicEnabled,
  onToggleMusic,
  onShowRules,
  onShowTutorial,
  onAddFriend,
  addFriendDisabled,
  addFriendSent,
  onExitRoom,
  onLeave,
}: MoreOptionsMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    ref.current?.querySelector<HTMLElement>('[role^="menuitem"]')?.focus();
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
      const items = Array.from(
        ref.current?.querySelectorAll<HTMLElement>(
          '[role^="menuitem"]:not(:disabled)',
        ) ?? [],
      );
      if (items.length === 0) return;
      e.preventDefault();
      const idx = items.indexOf(document.activeElement as HTMLElement);
      const step = e.key === 'ArrowDown' ? 1 : -1;
      items[(idx + step + items.length) % items.length].focus();
    };
    document.addEventListener('mousedown', onDocClick, { capture: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick, { capture: true });
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const run = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={ref}>
      <Button
        ref={triggerRef}
        className="!px-2 min-w-11 min-h-11 text-lg"
        variant="glass"
        size="sm"
        onClick={() => setOpen((v) => !v)}
        aria-label={t('games.lobby.moreOptions')}
        title={t('games.lobby.moreOptions')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="control-panel-more-menu"
        data-testid="more-options-button"
      >
        ⋯
      </Button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-[260px] max-w-[calc(100vw-2rem)] bg-[var(--background)] border border-[var(--glassBorderStrong)] rounded-2xl p-1.5 z-[1000] shadow-2xl backdrop-blur-xl flex flex-col gap-0.5"
          id="control-panel-more-menu"
          role="menu"
          aria-label={t('games.lobby.moreOptions')}
          data-testid="more-options-menu"
        >
          <MenuItem
            icon={
              musicEnabled ? (
                <MusicOnIcon size={16} />
              ) : (
                <MusicOffIcon size={16} />
              )
            }
            label={t('settings.musicLabel')}
            testId="music-toggle-button"
            pressed={musicEnabled}
            onSelect={run(onToggleMusic)}
          />
          {onShowRules && (
            <MenuItem
              icon="📖"
              label={t('games.table.controlPanel.rules')}
              testId="show-rules-button"
              onSelect={run(onShowRules)}
            />
          )}
          {onShowTutorial && (
            <MenuItem
              icon="🎓"
              label={t('games.tutorial.ui.button')}
              testId="show-tutorial-button"
              onSelect={run(onShowTutorial)}
            />
          )}
          {onAddFriend && (
            <MenuItem
              icon={addFriendSent ? '✓' : '👤'}
              label={
                addFriendSent
                  ? t('games.common.postGame.friendAdded')
                  : t('games.common.postGame.addFriend')
              }
              testId="add-friend-button"
              disabled={addFriendDisabled}
              onSelect={run(onAddFriend)}
            />
          )}
          <div role="separator" className="my-1 h-px bg-[var(--glassBorder)]" />
          <MenuItem
            icon="🏃"
            label={t('games.table.controlPanel.exitRoom')}
            description={t('games.table.controlPanel.exitRoomTooltip')}
            testId="exit-room-button"
            onSelect={run(onExitRoom)}
          />
          {onLeave && (
            <MenuItem
              icon="🚪"
              label={t('games.common.leaveRoom.button')}
              description={t('games.table.controlPanel.leaveGameTooltip')}
              testId="leave-game-button"
              danger
              onSelect={run(onLeave)}
            />
          )}
        </div>
      )}
    </div>
  );
}
