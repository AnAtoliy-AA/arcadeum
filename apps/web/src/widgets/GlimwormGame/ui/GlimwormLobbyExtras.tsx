'use client';

import { useTranslation } from '@/shared/lib/useTranslation';
import { gameSocket, emitEncrypted } from '@/shared/lib/socket';
import { GLIMWORM_VARIANTS } from '@/features/games/lib/glimwormVariants';
import { useGlimwormStore } from '../store/glimwormStore';
import type { GlimwormVariant } from '../types';

const PALETTE = [
  '#ff5e5e',
  '#ffb05e',
  '#ffe65e',
  '#7cff5e',
  '#5effb6',
  '#5ee0ff',
  '#5e8cff',
  '#b15eff',
  '#ff5ed4',
  '#a0ffea',
];

interface GlimwormLobbyExtrasProps {
  roomId: string;
  userId: string;
  variant: GlimwormVariant;
  powerupsEnabled: boolean;
  /** Colors already taken by other players in the lobby. */
  takenColors?: string[];
}

export function GlimwormLobbyExtras({
  roomId,
  userId,
  variant,
  powerupsEnabled,
  takenColors = [],
}: GlimwormLobbyExtrasProps): React.JSX.Element {
  const { t } = useTranslation();
  const selectedColor = useGlimwormStore((s) => s.selectedColor);
  const setColor = useGlimwormStore((s) => s.setColor);
  const variantMeta = GLIMWORM_VARIANTS.find((v) => v.id === variant);
  const taken = new Set(takenColors);

  const handleColor = (color: string) => {
    if (taken.has(color) && color !== selectedColor) return;
    setColor(color);
    void emitEncrypted(gameSocket, 'glimworm.color.pick', {
      roomId,
      userId,
      color,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 16,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 8,
        color: '#fff',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
          {t('games.glimworm_v1.lobby.variant')}
        </div>
        <div style={{ fontSize: 16, fontWeight: 'bold' }}>
          {variantMeta?.emoji}{' '}
          {variantMeta?.name ? t(variantMeta.name as never) : variant}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
          {t('games.glimworm_v1.lobby.powerups')}
        </div>
        <div style={{ fontSize: 14 }}>
          {powerupsEnabled
            ? t('games.glimworm_v1.lobby.powerupsOn')
            : t('games.glimworm_v1.lobby.powerupsOff')}
        </div>
      </div>

      <div>
        <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 6 }}>
          {t('games.glimworm_v1.lobby.pickColor')}
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {PALETTE.map((color) => {
            const isTaken = taken.has(color) && color !== selectedColor;
            const isSelected = color === selectedColor;
            return (
              <button
                key={color}
                type="button"
                aria-label={color}
                aria-pressed={isSelected}
                disabled={isTaken}
                onClick={() => handleColor(color)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: color,
                  border: isSelected ? '3px solid #fff' : '2px solid #444',
                  opacity: isTaken ? 0.3 : 1,
                  cursor: isTaken ? 'not-allowed' : 'pointer',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
