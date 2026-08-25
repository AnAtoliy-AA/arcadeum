'use client';

import { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { useScenePalette } from './ScenePaletteContext';

export interface MobileActionSheetProps {
  isOpen: boolean;
  title: string;
  description: string;
  opponents: Array<{ playerId: string; alive: boolean }>;
  resolveDisplayName: (id: string, fallback?: string) => string;
  onConfirm: (targetId: string) => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

function Sheet({
  role,
  style,
  'data-testid': testId,
  'aria-modal': ariaModal,
  children,
}: {
  className?: string;
  role?: React.AriaRole;
  style?: React.CSSProperties;
  'data-testid'?: string;
  'aria-modal'?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-stretch fixed left-0 right-0 bottom-0 gap-3 rounded-t-[24px] border-t border-[rgba(255,255,255,0.14)] bg-[rgba(15,23,42,0.95)] p-4 backdrop-blur-[16px] z-[200]"
      role={role}
      style={style}
      data-testid={testId}
      aria-modal={ariaModal}
    >
      {children}
    </div>
  );
}

export function MobileActionSheet({
  isOpen,
  title,
  description,
  opponents,
  resolveDisplayName,
  onConfirm,
  onCancel,
  confirmLabel = 'Play',
  cancelLabel = 'Cancel',
}: MobileActionSheetProps) {
  const palette = useScenePalette();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);

  if (!isOpen) return null;

  const liveOpponents = opponents.filter((o) => o.alive);

  return (
    <Sheet
      data-testid="mobile-action-sheet"
      role="dialog"
      aria-modal={true}
      style={{ boxShadow: `0 -8px 32px ${palette.opponentTurnHaloColor}` }}
    >
      <span className="text-[18px] font-bold text-[var(--color)]">{title}</span>
      <span className="text-[13px] opacity-[0.75] text-[var(--color)]">
        {description}
      </span>

      <div className="flex flex-col items-stretch gap-2">
        {liveOpponents.map((opp) => {
          const isSelected = selectedTarget === opp.playerId;
          return (
            <Button
              key={opp.playerId}
              variant={isSelected ? 'primary' : 'secondary'}
              size="md"
              onClick={() => setSelectedTarget(opp.playerId)}
              active={isSelected}
            >
              {resolveDisplayName(opp.playerId)}
            </Button>
          );
        })}
      </div>

      <div className="flex flex-row items-stretch gap-2 justify-end">
        <Button variant="secondary" size="md" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button
          variant="primary"
          size="md"
          disabled={!selectedTarget}
          onClick={() => selectedTarget && onConfirm(selectedTarget)}
        >
          {confirmLabel}
        </Button>
      </div>
    </Sheet>
  );
}
