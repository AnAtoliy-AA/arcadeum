import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import { appConfig } from '@/shared/config/app-config';

export function GuestTermsNotice() {
  const { t } = useTranslation();
  const appName = appConfig.appName;

  return (
    <div
      data-testid="guest-terms-notice"
      className="flex flex-row items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs text-[var(--textSecondary)] text-center select-none"
    >
      <span className="font-medium text-slate-300">
        {t('games.guestDisclaimer.playingAsGuest')}
      </span>
      <span>·</span>
      <span>
        {t('games.guestDisclaimer.agreementPrefix', { appName })}
        <Link
          href="/terms"
          className="underline text-[var(--textSecondary)] font-semibold hover:text-white"
          target="_blank"
          rel="noreferrer"
        >
          {t('games.guestDisclaimer.termsLink')}
        </Link>
        {t('games.guestDisclaimer.agreementSuffix', { appName })}
      </span>
    </div>
  );
}
