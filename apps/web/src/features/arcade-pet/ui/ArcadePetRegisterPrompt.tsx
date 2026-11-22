import React from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ArcadePetRegisterPromptProps {
  locale: string;
  onClose: () => void;
}

export const ArcadePetRegisterPrompt: React.FC<
  ArcadePetRegisterPromptProps
> = ({ locale, onClose }) => {
  const { t } = useTranslation();
  return (
    <div
      data-testid="arcade-pet-register-prompt"
      className="mb-3 w-72 rounded-2xl bg-[var(--glassBg)] border border-[var(--warning)] p-4 shadow-2xl backdrop-blur-md text-[var(--color)] font-sans flex flex-col gap-2.5 text-center"
    >
      <div className="flex items-center justify-between border-b border-[var(--glassBorder)] pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--color)]">
          <span>🔒</span>
          <span>{t('arcadePetCompanion.registerTitle')}</span>
        </div>
        <Button
          variant="icon"
          size="sm"
          onClick={onClose}
          aria-label={t('arcadePetCompanion.closePrompt')}
        >
          <span aria-hidden="true">✕</span>
        </Button>
      </div>
      <p className="text-xs text-[var(--textSecondary)] leading-relaxed">
        {t('arcadePetCompanion.registerBody')}
      </p>
      <Link
        href={`/${locale}/auth`}
        className="w-full rounded-lg bg-[var(--primary)] py-1.5 text-center text-xs font-bold uppercase text-[var(--primaryText)] shadow-md transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
      >
        {t('arcadePetCompanion.registerCta')}
      </Link>
    </div>
  );
};
