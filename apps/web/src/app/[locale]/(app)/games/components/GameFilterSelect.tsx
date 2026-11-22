'use client';

import { useMemo } from 'react';
import { Select } from '@arcadeum/ui';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/i18n/useTranslation';
import { gameMetadata } from '@/features/games/registry';

interface GameFilterSelectProps {
  value: string;
  onChange: (gameId: string) => void;
}

const ALL = 'all';

export function GameFilterSelect({ value, onChange }: GameFilterSelectProps) {
  const { t } = useTranslation();

  const options = useMemo(() => {
    const games = Object.values(gameMetadata)
      .filter(
        (meta) =>
          meta.maxPlayers > 1 &&
          meta.status !== 'coming_soon' &&
          meta.status !== 'deprecated',
      )
      .map((meta) => ({
        value: meta.slug,
        label: t(`games.${meta.slug}.name` as TranslationKey) || meta.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: ALL, label: t('roomsBrowser.gameLabel') }, ...games];
  }, [t]);

  return (
    <Select
      size="sm"
      value={value || ALL}
      options={options}
      onValueChange={(next) => onChange(next === ALL ? '' : next)}
      aria-label={t('roomsBrowser.gameLabel')}
      data-testid="rooms-filter-game"
      className="min-w-[150px]"
    />
  );
}
