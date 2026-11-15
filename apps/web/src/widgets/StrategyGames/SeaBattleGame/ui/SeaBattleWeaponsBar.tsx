'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';

export type WeaponMode = null | {
  weapon: 'sonar' | 'radar' | 'ability';
  abilityId?: string;
  targetPlayerId: string;
  radarAxis?: 'row' | 'col';
};

interface SeaBattleWeaponsBarProps {
  hasSonar: boolean;
  hasRadar: boolean;
  sonarUsed: boolean;
  radarUsed: boolean;
  isSonarDisabled: boolean;
  isRadarDisabled: boolean;
  weaponMode: WeaponMode;
  onSelectSonar: () => void;
  onSelectRadar: () => void;
  onToggleRadarAxis: () => void;
  onCancel: () => void;
}

function getWeaponModeHint(weaponMode: NonNullable<WeaponMode>): string {
  if (weaponMode.weapon === 'sonar') {
    return 'Tap a cell on the target board';
  }
  if (weaponMode.weapon === 'radar') {
    return `Tap a cell to scan its ${weaponMode.radarAxis === 'col' ? 'column' : 'row'}`;
  }
  if (weaponMode.abilityId === 'scout') {
    return 'Tap a cell to scout 3×3 area';
  }
  if (weaponMode.abilityId === 'sonar_ping') {
    return 'Tap a cell to ping 3×3 area';
  }
  if (weaponMode.abilityId === 'torpedo') {
    return 'Tap a target cell to launch torpedo';
  }
  return 'Tap a cell on the target board';
}

export function SeaBattleWeaponsBar({
  hasSonar,
  hasRadar,
  sonarUsed,
  radarUsed,
  isSonarDisabled,
  isRadarDisabled,
  weaponMode,
  onSelectSonar,
  onSelectRadar,
  onToggleRadarAxis,
  onCancel,
}: SeaBattleWeaponsBarProps) {
  const { t } = useTranslation();
  const isWeaponMode = weaponMode !== null;
  const sonarActive = weaponMode?.weapon === 'sonar';
  const radarActive = weaponMode?.weapon === 'radar';

  return (
    <div className="flex gap-2 px-2 -mb-1 justify-center flex-wrap items-center">
      {hasSonar && (
        <button
          type="button"
          onClick={onSelectSonar}
          disabled={isSonarDisabled}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 ${
            isSonarDisabled ? 'opacity-35 cursor-not-allowed' : 'cursor-pointer'
          } ${
            sonarActive
              ? 'text-cyan-400 border border-cyan-400 bg-cyan-400/15'
              : 'text-neutral-200 border border-cyan-400/30 bg-cyan-400/5'
          }`}
        >
          🔊 {t('games.create.seaBattleSonar') || 'Sonar'}
          {sonarUsed && ' ✓'}
        </button>
      )}
      {hasRadar && (
        <div className="flex gap-1">
          <button
            type="button"
            onClick={onSelectRadar}
            disabled={isRadarDisabled}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-l-lg text-[13px] font-semibold transition-all duration-150 ${
              isRadarDisabled
                ? 'opacity-35 cursor-not-allowed'
                : 'cursor-pointer'
            } ${
              radarActive
                ? 'text-purple-400 border border-purple-400 bg-purple-400/15 border-r-0'
                : 'text-neutral-200 border border-purple-400/30 bg-purple-400/5 border-r-0'
            }`}
          >
            📡 {t('games.create.seaBattleRadar') || 'Radar'}
            {radarUsed && ' ✓'}
          </button>
          <button
            type="button"
            onClick={onToggleRadarAxis}
            disabled={isRadarDisabled}
            title="Toggle row / column"
            className={`flex items-center px-2.5 py-2 rounded-r-lg text-[11px] font-semibold transition-all duration-150 ${
              isRadarDisabled
                ? 'opacity-35 cursor-not-allowed'
                : 'cursor-pointer'
            } ${
              radarActive
                ? 'text-purple-300 border border-purple-400 bg-purple-400/15'
                : 'text-neutral-400 border border-purple-400/30 bg-purple-400/5'
            }`}
          >
            {weaponMode?.radarAxis === 'col' ? '↕' : '↔'}
          </button>
        </div>
      )}
      {isWeaponMode && (
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer text-red-400 border border-red-400/40 bg-red-400/10"
        >
          ✕ Cancel
        </button>
      )}
      {isWeaponMode && (
        <span
          className={`text-xs font-semibold ${
            weaponMode.weapon === 'sonar'
              ? 'text-cyan-400'
              : weaponMode.weapon === 'radar'
                ? 'text-purple-400'
                : 'text-amber-400'
          }`}
        >
          {getWeaponModeHint(weaponMode)}
        </span>
      )}
    </div>
  );
}
