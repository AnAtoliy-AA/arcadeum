import React from 'react';
import { Button } from '@arcadeum/ui';
import type { PetSpecies, PetStage, PetState } from '@arcadeum/games-core';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { useDraggableHome } from './useDraggableHome';
import styles from './arcade-pet-companion.module.scss';
import boothStyles from './arcade-pet-booth.module.scss';

interface ArcadePetHomeBoothProps {
  isAtHome: boolean;
  onToggleHome: () => void;
  localPetName: string;
  localPetSpecies: PetSpecies;
  localPetTheme: string;
  localPetStage?: PetStage;
  isKnocked: boolean;
  knockerName?: string;
  onOpenDoor: () => void;
  pets?: PetState[];
  homeCapacity?: number;
  onUpgradeHome?: (currency: 'coins' | 'gems') => void;
  moveHomeLabel?: string;
}

export const ArcadePetHomeBooth: React.FC<ArcadePetHomeBoothProps> = ({
  isAtHome,
  onToggleHome,
  localPetName,
  localPetSpecies,
  localPetTheme,
  localPetStage,
  isKnocked,
  knockerName,
  onOpenDoor,
  pets,
  homeCapacity = 1,
  moveHomeLabel,
}) => {
  const { t } = useTranslation();
  const moveLabel = moveHomeLabel ?? t('arcadePetCompanion.moveHome');
  const placesCount = Math.max(1, homeCapacity);
  const {
    boothRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    handleHouseClick,
    onMoveKeyDown,
  } = useDraggableHome();

  return (
    <div
      ref={boothRef}
      data-testid="arcade-pet-home-booth"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`${boothStyles.homeBooth} ${styles.col8} ${styles.row1} ${
        isDragging ? boothStyles.homeBoothDragging : ''
      }`}
    >
      {isKnocked && (
        <div
          data-testid="arcade-pet-knock-bubble"
          className={`mb-2 px-3 py-1.5 rounded-2xl bg-black/90 border border-amber-400 shadow-xl flex flex-col items-center gap-1 ${boothStyles.knockBubble}`}
        >
          <div className="flex items-center gap-1 text-xs font-black text-amber-300">
            <span>✊</span>
            <span>{t('arcadePetCompanion.knockTitle')}</span>
            <span>🚪</span>
          </div>
          <span className="text-xs text-neutral-200 font-medium">
            {t('arcadePetCompanion.knockLine', {
              name: knockerName || t('arcadePetCompanion.friendPet'),
            })}
          </span>
          <Button
            variant="primary"
            size="sm"
            shape="round"
            data-testid="open-door-and-play-btn"
            onClick={onOpenDoor}
            className="mt-0.5 text-xs uppercase"
          >
            {t('arcadePetCompanion.openDoor')}
          </Button>
        </div>
      )}

      {isAtHome && !isKnocked && (
        <div
          data-testid="arcade-pet-sleeping-bubble"
          className={`mb-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-amber-500/40 text-xs text-amber-200 flex items-center gap-1 shadow ${boothStyles.sleepingZzz}`}
        >
          <span>💤</span>
          <span>{t('arcadePetCompanion.resting')}</span>
        </div>
      )}

      {/*
        Decorative pointer target: the booth is draggable and click-to-toggle
        for mouse and touch. Keyboard users get the same two actions through
        real controls (the arrow-key drag handle below and the "send home"
        button in the companion panel), so this wrapper is intentionally not
        focusable and has no role (a role would nest the handle button inside
        another interactive element).
      */}
      <div
        data-testid="arcade-pet-house-structure"
        onClick={() => handleHouseClick(onToggleHome)}
        className={`relative flex flex-col items-center cursor-pointer transition-all transform hover:scale-105 ${
          isKnocked ? boothStyles.houseKnockWobble : ''
        }`}
      >
        <button
          type="button"
          data-testid="arcade-pet-home-drag-handle"
          data-drag-handle
          onKeyDown={onMoveKeyDown}
          onClick={(e) => e.stopPropagation()}
          aria-label={moveLabel}
          className="flex items-center gap-1 text-xs text-amber-400/80 font-bold tracking-wider select-none mb-0.5 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
          title={moveLabel}
        >
          <span aria-hidden="true">⠿</span>
          <span aria-hidden="true">{t('arcadePetCompanion.drag')}</span>
          <span aria-hidden="true">⠿</span>
        </button>
        <div className="absolute -top-3 right-2 flex flex-col items-center pointer-events-none">
          <span className={`text-xs text-neutral-400 ${boothStyles.smokePuff}`}>
            💨
          </span>
          <div className="w-2 h-3 bg-neutral-800 border border-neutral-600 rounded-t-sm" />
        </div>

        <div className="w-28 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-t-md shadow border-t border-x border-amber-500/60 relative">
          <div className="absolute inset-x-2 bottom-0 h-0.5 bg-amber-400/30" />
        </div>

        <div className="w-28 bg-neutral-900/95 border-x border-b border-amber-600/50 rounded-b-xl p-2 shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-md">
          <div className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-xs font-bold text-amber-300 text-center truncate max-w-full">
            🐾 {localPetName}
          </div>

          <div
            data-testid="arcade-pet-house-doorway"
            className={`w-14 h-14 rounded-t-full border border-amber-700/60 flex flex-col items-center justify-end pb-1 overflow-hidden transition-colors ${
              isAtHome
                ? 'bg-amber-950/80 border-amber-500/70 shadow-inner'
                : 'bg-neutral-950/90'
            }`}
          >
            {isAtHome ? (
              <div
                data-testid="arcade-pet-inside-house"
                className="flex flex-col items-center"
              >
                <div className="scale-75 origin-bottom">
                  <ArcadePetWalkingSprite
                    species={localPetSpecies}
                    state="sleeping"
                    theme={localPetTheme}
                    stage={localPetStage}
                  />
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-500/60 font-mono select-none">
                🚪
              </div>
            )}
          </div>

          {isAtHome && (
            <div
              data-testid="home-places-container"
              className="w-full flex flex-col gap-1 border-t border-amber-800/40 pt-1"
            >
              <div className="flex items-center justify-between text-xs text-amber-300 font-bold px-0.5">
                <span>{t('arcadePetCompanion.places')}</span>
                <span data-testid="booth-capacity-tag">
                  {pets?.length ?? 1}/{placesCount}
                </span>
              </div>
              <div className="flex flex-col gap-0.5 w-full max-h-20 overflow-y-auto">
                {Array.from({ length: placesCount }).map((_, idx) => {
                  const occupant = pets?.[idx];
                  return (
                    <div
                      key={idx}
                      data-testid={
                        occupant
                          ? `home-place-slot-${idx}`
                          : `home-empty-slot-${idx}`
                      }
                      className={`px-1 py-0.5 rounded text-xs flex items-center gap-0.5 truncate ${
                        occupant
                          ? 'bg-amber-950/70 border border-amber-500/40 text-amber-200'
                          : 'border border-dashed border-neutral-700 text-neutral-500'
                      }`}
                    >
                      <span>🛏️</span>
                      <span className="truncate">
                        {occupant
                          ? occupant.stage === 'egg'
                            ? t('arcadePetCompanion.mysteryEgg')
                            : occupant.name
                          : t('arcadePetCompanion.emptyPlace')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <span className="text-xs text-neutral-400 font-medium">
            {isAtHome
              ? t('arcadePetCompanion.wakeHint')
              : t('arcadePetCompanion.cozyCrib')}
          </span>
        </div>
      </div>
    </div>
  );
};
