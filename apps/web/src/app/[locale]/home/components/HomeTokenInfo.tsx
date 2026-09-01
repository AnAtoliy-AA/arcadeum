'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/shared/i18n/context';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useScrollReveal } from '@/shared/lib/useScrollReveal';
import {
  fetchTokenMetadata,
  type TokenMetadata,
} from '@/shared/api/tokenMetadata';

export default function HomeTokenInfo() {
  const { messages } = useLanguage();
  const { t } = useTranslation();
  const homeCopy = messages.home ?? {};
  const sectionRef = useScrollReveal<HTMLElement>();
  const [metadata, setMetadata] = useState<TokenMetadata | null>(null);

  useEffect(() => {
    void fetchTokenMetadata().then((data) => {
      if (data) setMetadata(data);
    });
  }, []);

  const title = (homeCopy as Record<string, string>).tokenTitle ?? 'Our Token';
  const subtitle =
    (homeCopy as Record<string, string>).tokenSubtitle ??
    'Powering the Arcadeum ecosystem on Solana';

  const displayName = metadata?.name ?? 'ARCADEUM GAMES';
  const displayTicker = metadata?.symbol ?? 'ARC';
  const displayDescription =
    metadata?.description ||
    t('wallet.tokenInfo.description', {
      name: displayName,
      ticker: displayTicker,
    });

  return (
    <section
      id="token"
      data-testid="token-section"
      ref={sectionRef}
      className="mx-auto max-w-[900px] px-4 py-16"
    >
      <div className="mb-10 flex w-full max-w-[1400px] flex-col items-center gap-3 px-4 text-center">
        <h2 className="m-0 text-[32px] font-bold text-[var(--color)]">
          {title}
        </h2>
        <p className="m-0 mt-2 max-w-[600px] text-[16px] text-[var(--textSecondary)]">
          {subtitle}
        </p>
      </div>

      <div
        data-reveal
        data-reveal-delay="2"
        className="flex flex-col items-center gap-5 rounded-2xl border border-[var(--glassBorder)] bg-[var(--backgroundHover)] p-8 text-center"
      >
        <div className="flex items-center gap-4">
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={72}
              height={72}
              className="rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,#34d399,#059669)] text-[32px] font-bold text-white">
              A
            </div>
          )}
          <div className="text-left">
            <h3 className="m-0 text-[24px] font-bold text-[var(--color)]">
              {displayName}
            </h3>
            <span className="rounded-[4px] bg-[rgba(52,211,153,0.12)] px-2 py-0.5 text-[14px] font-semibold text-emerald-600 dark:text-[#34d399]">
              {displayTicker}
            </span>
          </div>
        </div>

        <p className="m-0 max-w-[600px] text-[15px] leading-[1.7] text-[var(--textSecondary)]">
          {displayDescription}
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/wallet"
            className="inline-flex items-center gap-[6px] rounded-lg bg-[linear-gradient(135deg,#34d399,#059669)] px-6 py-2.5 text-[14px] font-semibold text-white no-underline transition-opacity duration-150 hover:opacity-80"
          >
            View Wallet
          </Link>
          <Link
            href="/token"
            className="inline-flex items-center gap-[6px] rounded-lg border border-[var(--glassBorder)] bg-[var(--background)] px-6 py-2.5 text-[14px] font-semibold text-[var(--color)] no-underline transition-[background] duration-150 hover:bg-[var(--glassBgHover)]"
          >
            Learn More
          </Link>
          {metadata?.pumpfunUrl && (
            <a
              href={metadata.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-[6px] rounded-lg border border-[var(--glassBorder)] bg-[var(--background)] px-6 py-2.5 text-[14px] font-semibold text-[var(--color)] no-underline transition-[background] duration-150 hover:bg-[var(--glassBgHover)]"
            >
              pump.fun ↗
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
