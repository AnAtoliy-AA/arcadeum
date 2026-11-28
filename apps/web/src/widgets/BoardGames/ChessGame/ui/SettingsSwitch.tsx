'use client';

import { memo } from 'react';
import { Toggle } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface SettingsSwitchProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}

/** Labelled on/off row for the chess settings panel (shared Toggle). */
function SettingsSwitchImpl({
  id,
  label,
  checked,
  onChange,
}: SettingsSwitchProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-between gap-3 min-h-9">
      <span className="text-[11px] font-bold text-[var(--textSecondary)] uppercase tracking-wider">
        {label}
      </span>
      <Toggle
        testId={id}
        ariaLabel={label}
        checked={checked}
        onCheckedChange={onChange}
        onLabel={t('games.chess_v1.settings.on')}
        offLabel={t('games.chess_v1.settings.off')}
      />
    </div>
  );
}

export const SettingsSwitch = memo(SettingsSwitchImpl);
