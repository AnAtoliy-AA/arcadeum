import React from 'react';
import Link from 'next/link';
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
      className="mb-3 w-72 rounded-2xl bg-neutral-900/95 border border-amber-500/50 p-4 shadow-2xl backdrop-blur-md text-white font-sans flex flex-col gap-2.5 text-center"
    >
      <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <span>🔒</span>
          <span>{t('arcadePetCompanion.registerTitle')}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-neutral-400 hover:text-white p-1 text-xs"
          aria-label={t('arcadePetCompanion.closePrompt')}
        >
          ✕
        </button>
      </div>
      <p className="text-xs text-neutral-300 leading-relaxed">
        {t('arcadePetCompanion.registerBody')}
      </p>
      <Link
        href={`/${locale}/auth`}
        className="w-full py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-bold text-xs uppercase text-center shadow-md transition-transform transform hover:scale-105"
      >
        {t('arcadePetCompanion.registerCta')}
      </Link>
    </div>
  );
};
