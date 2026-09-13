'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { cx } from '@arcadeum/ui/utils/cx';

interface Props {
  mintAddress?: string;
  metadata?: {
    name: string;
    symbol: string;
    description: string;
    image: string | null;
    pumpfunUrl: string | null;
  } | null;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function TokenInfo({ mintAddress, metadata }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!mintAddress) return;
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = metadata?.name ?? t('wallet.tokenInfo.name');
  const displayTicker = metadata?.symbol ?? t('wallet.tokenInfo.ticker');
  const displayDescription =
    metadata?.description ||
    t('wallet.tokenInfo.description', {
      name: displayName,
      ticker: displayTicker,
    });

  return (
    <div
      style={{ maxWidth: '900px', margin: '0 auto', padding: '0 16px 32px' }}
    >
      <div className="rounded-xl border border-[rgba(52,211,153,0.2)] bg-[rgba(52,211,153,0.05)] p-6">
        <div className="flex items-center gap-4 mb-4">
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover shrink-0"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#34d399] to-[#059669] flex items-center justify-center text-[28px] font-bold text-white shrink-0">
              A
            </div>
          )}
          <div>
            <h3 className="text-[22px] font-bold text-[#f4f4f5] m-0 mb-[2px]">
              {displayName}
            </h3>
            <span className="inline-block text-sm text-[#34d399] font-semibold bg-[rgba(52,211,153,0.12)] px-2 py-[2px] rounded">
              {displayTicker}
            </span>
          </div>
        </div>

        <p className="text-sm text-[#a1a1aa] leading-[1.6] m-0 mb-4">
          {displayDescription
            .split(
              new RegExp(
                `(${escapeRegex(displayName)}|${escapeRegex(displayTicker)})`,
                'gi',
              ),
            )
            .map((part, i) =>
              part.toLowerCase() === displayName.toLowerCase() ||
              part.toLowerCase() === displayTicker.toLowerCase() ? (
                <strong key={i} className="text-[#34d399] font-semibold">
                  {part}
                </strong>
              ) : (
                part
              ),
            )}
        </p>

        {mintAddress && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)]">
            <span className="text-xs text-[#71717a] whitespace-nowrap">
              {t('wallet.tokenInfo.mint')}:
            </span>
            <code className="text-xs text-[#a1a1aa] font-mono overflow-hidden text-ellipsis flex-1">
              {mintAddress}
            </code>
            <button
              onClick={handleCopy}
              className={cx(
                'px-3 py-1 rounded-md border border-[rgba(255,255,255,0.12)] bg-[rgba(255,255,255,0.06)] text-xs cursor-pointer whitespace-nowrap transition-colors',
                copied ? 'text-[#34d399]' : 'text-[#a1a1aa]',
              )}
            >
              {copied
                ? t('wallet.tokenInfo.copied')
                : t('wallet.tokenInfo.copy')}
            </button>
          </div>
        )}

        {metadata?.pumpfunUrl && (
          <a
            href={metadata.pumpfunUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 text-[13px] font-semibold text-[#34d399] no-underline transition-colors hover:text-[#6ee7b7]"
          >
            View on pump.fun ↗
          </a>
        )}

        <p
          style={{
            fontSize: '11px',
            color: '#52525b',
            marginTop: '12px',
            lineHeight: 1.5,
            textAlign: 'center',
          }}
        >
          ARCADEUM tokens are utility assets for in-platform use only. They have
          no inherent monetary value and are not investments.
        </p>
      </div>
    </div>
  );
}
