'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { Button } from '@arcadeum/ui';

interface MoveControlsProps {
  onMove: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onCenterView: () => void;
}

export function MoveControls({ onMove, onCenterView }: MoveControlsProps) {
  const { t } = useTranslation();

  return (
    <div
      className="flex flex-row items-stretch gap-1 border border-[var(--borderColor)] p-1 scale-[0.85] sm:scale-[0.9]"
      data-testid="move-controls"
    >
      <Button
        className="p-[4px] min-w-[32px]"
        variant="glass"
        size="sm"
        onClick={() => onMove('up')}
        title={t('games.table.controlPanel.moveControls.shortcuts.up')}
        data-testid="move-up-button"
      >
        ↑
      </Button>
      <div className="flex flex-col items-stretch gap-1">
        <div className="flex flex-row items-stretch gap-1">
          <Button
            className="p-[4px] min-w-[32px]"
            variant="glass"
            size="sm"
            onClick={() => onMove('left')}
            title={t('games.table.controlPanel.moveControls.shortcuts.left')}
            data-testid="move-left-button"
          >
            ←
          </Button>
          <Button
            className="p-[4px] min-w-[32px]"
            variant="glass"
            size="sm"
            onClick={onCenterView}
            title={t('games.table.controlPanel.moveControls.shortcuts.center')}
            data-testid="center-view-button"
          >
            ⚡
          </Button>
          <Button
            className="p-[4px] min-w-[32px]"
            variant="glass"
            size="sm"
            onClick={() => onMove('right')}
            title={t('games.table.controlPanel.moveControls.shortcuts.right')}
            data-testid="move-right-button"
          >
            →
          </Button>
        </div>
      </div>
      <Button
        className="p-[4px] min-w-[32px]"
        variant="glass"
        size="sm"
        onClick={() => onMove('down')}
        title={t('games.table.controlPanel.moveControls.shortcuts.down')}
        data-testid="move-down-button"
      >
        ↓
      </Button>
    </div>
  );
}
