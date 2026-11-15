'use client';

import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import type { SolitaireHint } from '../types';

interface SolitaireHintCalloutProps {
  hint: SolitaireHint | null;
  onApply: () => void;
  onDismiss: () => void;
}

export function SolitaireHintCallout({
  hint,
  onApply,
  onDismiss,
}: SolitaireHintCalloutProps) {
  const { t } = useTranslation();

  if (!hint) return null;

  const translationKey = hint.descriptionKey as TranslationKey;

  return (
    <div
      data-testid="solitaire-hint-callout"
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-3 shadow-lg backdrop-blur-xl ring-1 ring-amber-400/30 text-amber-200 animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-amber-400/20 text-base">
          💡
        </span>
        <span className="text-xs sm:text-sm font-semibold text-amber-100 truncate">
          {t(translationKey)}
        </span>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <Button
          size="sm"
          variant="primary"
          onClick={onApply}
          data-testid="solitaire-apply-hint-button"
          className="h-7 px-2.5 text-xs font-bold"
        >
          {t('games.solitaire_v1.hud.applyHint')}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDismiss}
          data-testid="solitaire-dismiss-hint-button"
          className="h-7 px-2 text-xs text-amber-300 hover:text-white hover:bg-amber-400/20"
        >
          {t('games.solitaire_v1.hud.dismissHint')}
        </Button>
      </div>
    </div>
  );
}
