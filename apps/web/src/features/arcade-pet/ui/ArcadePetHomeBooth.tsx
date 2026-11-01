import React from 'react';
import type { PetSpecies, PetStage, PetState } from '@arcadeum/games-core';
import { ArcadePetWalkingSprite } from './ArcadePetWalkingSprite';
import { useDraggableHome } from './useDraggableHome';
import styles from './arcade-pet-companion.module.scss';

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
}) => {
  const placesCount = Math.max(1, homeCapacity);
  const {
    boothRef,
    isDragging,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    handleHouseClick,
  } = useDraggableHome();

  return (
    <div
      ref={boothRef}
      data-testid="arcade-pet-home-booth"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      className={`${styles.homeBooth} ${styles.col8} ${styles.row1} ${
        isDragging ? styles.homeBoothDragging : ''
      }`}
    >
      {isKnocked && (
        <div
          data-testid="arcade-pet-knock-bubble"
          className={`mb-2 px-3 py-1.5 rounded-2xl bg-black/90 border border-amber-400 shadow-xl flex flex-col items-center gap-1 ${styles.knockBubble}`}
        >
          <div className="flex items-center gap-1 text-xs font-black text-amber-300">
            <span>✊</span>
            <span>KNOCK KNOCK!</span>
            <span>🚪</span>
          </div>
          <span className="text-[10px] text-neutral-200 font-medium">
            {knockerName || "Friend's Pet"}: &ldquo;Come out and play! 🎾&rdquo;
          </span>
          <button
            type="button"
            data-testid="open-door-and-play-btn"
            onClick={onOpenDoor}
            className="mt-0.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-[10px] uppercase shadow-md transition-transform transform hover:scale-105 active:scale-95"
          >
            Open Door &amp; Play 🎾
          </button>
        </div>
      )}

      {isAtHome && !isKnocked && (
        <div
          data-testid="arcade-pet-sleeping-bubble"
          className={`mb-1 px-2 py-0.5 rounded-full bg-neutral-900/90 border border-amber-500/40 text-[10px] text-amber-200 flex items-center gap-1 shadow ${styles.sleepingZzz}`}
        >
          <span>💤</span>
          <span>Resting</span>
        </div>
      )}

      <div
        data-testid="arcade-pet-house-structure"
        onClick={() => handleHouseClick(onToggleHome)}
        className={`relative flex flex-col items-center cursor-pointer transition-all transform hover:scale-105 ${
          isKnocked ? styles.houseKnockWobble : ''
        }`}
      >
        <div
          data-testid="arcade-pet-home-drag-handle"
          className="flex items-center gap-1 text-[8px] text-amber-400/80 font-bold tracking-wider select-none mb-0.5"
          title="Drag to move pet home"
        >
          <span>⠿</span>
          <span>DRAG</span>
          <span>⠿</span>
        </div>
        <div className="absolute -top-3 right-2 flex flex-col items-center pointer-events-none">
          <span className={`text-[10px] text-neutral-400 ${styles.smokePuff}`}>
            💨
          </span>
          <div className="w-2 h-3 bg-neutral-800 border border-neutral-600 rounded-t-sm" />
        </div>

        <div className="w-28 h-4 bg-gradient-to-r from-amber-700 via-amber-600 to-amber-800 rounded-t-md shadow border-t border-x border-amber-500/60 relative">
          <div className="absolute inset-x-2 bottom-0 h-0.5 bg-amber-400/30" />
        </div>

        <div className="w-28 bg-neutral-900/95 border-x border-b border-amber-600/50 rounded-b-xl p-2 shadow-2xl flex flex-col items-center gap-1.5 backdrop-blur-md">
          <div className="px-1.5 py-0.2 rounded bg-amber-950/80 border border-amber-500/40 text-[9px] font-bold text-amber-300 text-center truncate max-w-full">
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
              <div className="text-[10px] text-amber-500/60 font-mono select-none">
                🚪
              </div>
            )}
          </div>

          {isAtHome && (
            <div
              data-testid="home-places-container"
              className="w-full flex flex-col gap-1 border-t border-amber-800/40 pt-1"
            >
              <div className="flex items-center justify-between text-[8px] text-amber-300 font-bold px-0.5">
                <span>Places</span>
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
                      className={`px-1 py-0.5 rounded text-[8px] flex items-center gap-0.5 truncate ${
                        occupant
                          ? 'bg-amber-950/70 border border-amber-500/40 text-amber-200'
                          : 'border border-dashed border-neutral-700 text-neutral-500'
                      }`}
                    >
                      <span>🛏️</span>
                      <span className="truncate">
                        {occupant
                          ? occupant.stage === 'egg'
                            ? 'Mystery Egg'
                            : occupant.name
                          : 'Empty Place'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <span className="text-[8px] text-neutral-400 font-medium">
            {isAtHome ? 'Click to wake ☀️' : 'Cozy Crib 🏠'}
          </span>
        </div>
      </div>
    </div>
  );
};
