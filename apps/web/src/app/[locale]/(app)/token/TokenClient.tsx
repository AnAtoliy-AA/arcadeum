'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/shared/i18n/useTranslation';
import dynamic from 'next/dynamic';
import { cx } from '@arcadeum/ui/utils/cx';
import type { TokenMetadata } from '@/shared/api/tokenMetadata';

const MarketCapSparkline = dynamic(() => import('./MarketCapSparkline'), {
  ssr: false,
  loading: () => <div style={{ height: 240 }} />,
});

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

function formatSupply(s: string): string {
  const n = Number(s);
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return s;
}

function formatDate(ts: number): string {
  const date = new Date(ts > 1e12 ? ts : ts * 1000);
  if (isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface Props {
  mintAddress?: string;
  initialMetadata?: TokenMetadata | null;
}

export default function TokenClient({
  mintAddress = '',
  initialMetadata = null,
}: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<TokenMetadata | null>(
    initialMetadata,
  );
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    const { fetchTokenMetadata } = await import('@/shared/api/tokenMetadata');
    const data = await fetchTokenMetadata();
    if (data) setMetadata(data);
    setRefreshing(false);
  };

  const handleCopy = async () => {
    if (!mintAddress) return;
    await navigator.clipboard.writeText(mintAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = metadata?.name ?? 'ARCADEUM GAMES';
  const displayTicker = metadata?.symbol ?? 'ARC';
  const displayDescription =
    metadata?.description ||
    t('wallet.tokenInfo.description')
      .replace('{{name}}', displayName)
      .replace('{{ticker}}', displayTicker);

  return (
    <div className="max-w-[800px] mx-auto py-[48px] px-4 max-[480px]:py-8 max-[480px]:px-3">
      <style>{`
        @keyframes pulseDot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes ringPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes tc-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .dark .tc-green { color: #34d399; }
        .dark .tc-green-bg { background-color: #34d399; }
        .dark .tc-green-border { border-color: rgba(52, 211, 153, 0.5); }
        .dark .tc-green-hover:hover { color: #34d399; }
      `}</style>

      <div className="text-center mb-[48px] relative">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[rgba(52,211,153,0.1)] border border-[rgba(52,211,153,0.25)] text-[#10b981] tc-green text-xs font-semibold uppercase tracking-[0.08em] mb-6">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#10b981] tc-green-bg"
            style={{ animation: 'pulseDot 2s ease-in-out infinite' }}
          />
          {t('wallet.tokenPage.heroBadge')}
        </div>

        <div className="w-[120px] h-[120px] rounded-full mx-auto mb-6 relative">
          <div
            className="absolute inset-[-8px] rounded-full border-2 border-[rgba(52,211,153,0.25)]"
            style={{ animation: 'ringPulse 3s ease-in-out infinite' }}
          />
          {metadata?.image ? (
            <Image
              src={metadata.image}
              alt={displayName}
              width={120}
              height={120}
              className="w-[120px] h-[120px] rounded-full object-cover relative z-[1] shadow-[0_0_48px_rgba(52,211,153,0.3)] max-[480px]:w-24 max-[480px]:h-24"
              unoptimized
            />
          ) : (
            <div className="w-[120px] h-[120px] rounded-full bg-[linear-gradient(135deg,#34d399,#059669)] flex items-center justify-center text-[48px] font-bold text-white relative z-[1] shadow-[0_0_48px_rgba(52,211,153,0.3)] max-[480px]:w-24 max-[480px]:h-24 max-[480px]:text-[38px]">
              A
            </div>
          )}
        </div>

        <h1 className="text-[36px] font-extrabold text-[var(--color)] m-0 mb-2 tracking-[-0.02em] max-[480px]:text-[28px]">
          {displayName}
        </h1>
        <span className="inline-block text-lg text-[#10b981] tc-green font-bold bg-[rgba(52,211,153,0.12)] py-1 px-3.5 rounded-lg mb-5">
          {displayTicker}
        </span>

        <p className="text-lg text-[var(--textSecondary)] leading-[1.7] max-w-[560px] mx-auto mb-7 max-[480px]:text-[15px]">
          {displayDescription}
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/wallet"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[linear-gradient(135deg,#34d399,#059669)] text-white text-[15px] font-semibold no-underline transition-all duration-200 ease-out shadow-[0_4px_20px_rgba(52,211,153,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(52,211,153,0.4)]"
          >
            🎮 {t('wallet.tokenPage.viewWallet')}
          </Link>
          {metadata?.pumpfunUrl && (
            <a
              href={metadata.pumpfunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--color)] text-[15px] font-semibold no-underline transition-all duration-200 ease-out hover:bg-[var(--glassBgHover)] hover:border-[var(--glassBorderStrong)] hover:-translate-y-px"
            >
              pump.fun ↗
            </a>
          )}
          {mintAddress && (
            <a
              href={`https://solscan.io/token/${mintAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[var(--color)] text-[15px] font-semibold no-underline transition-all duration-200 ease-out hover:bg-[var(--glassBgHover)] hover:border-[var(--glassBorderStrong)] hover:-translate-y-px"
            >
              Solscan ↗
            </a>
          )}
        </div>
      </div>

      {mintAddress && (
        <div className="flex items-center gap-2.5 px-5 py-4 rounded-xl bg-[var(--backgroundHover)] border border-[var(--glassBorder)] mb-8 max-[480px]:flex-wrap max-[480px]:gap-2">
          <span className="text-[13px] text-[var(--textSecondary)] whitespace-nowrap">
            {t('wallet.tokenInfo.mint')}:
          </span>
          <code className="text-[13px] text-[var(--color)] font-mono overflow-hidden text-ellipsis flex-1 min-w-0">
            {mintAddress}
          </code>
          <button
            onClick={handleCopy}
            className={cx(
              'px-[18px] py-2 rounded-lg text-[13px] font-semibold cursor-pointer whitespace-nowrap transition-all duration-[0.15s]',
              copied
                ? 'text-[#10b981] tc-green border border-[rgba(52,211,153,0.4)] bg-[rgba(52,211,153,0.15)]'
                : 'border border-[rgba(52,211,153,0.3)] bg-[rgba(52,211,153,0.1)] text-[#10b981] tc-green hover:bg-[rgba(52,211,153,0.18)] hover:border-[rgba(52,211,153,0.5)]',
            )}
          >
            {copied ? t('wallet.tokenInfo.copied') : t('wallet.tokenInfo.copy')}
          </button>
        </div>
      )}

      <MarketCapSparkline />

      <div className="grid grid-cols-3 gap-4 mb-[48px] max-[480px]:grid-cols-1 max-[480px]:gap-3">
        {metadata?.marketCapUsd != null && (
          <div className="flex flex-col items-center px-6 py-6 rounded-[16px] bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out relative hover:border-[rgba(52,211,153,0.4)] hover:bg-[var(--backgroundHover)] hover:-translate-y-0.5">
            <span className="text-2xl mb-3">📊</span>
            <span className="text-[11px] text-[var(--textSecondary)] uppercase tracking-[0.08em] mb-1.5 flex items-center gap-1">
              {t('wallet.tokenPage.marketCap')}{' '}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="inline-flex items-center justify-center p-0.5 border-none bg-transparent text-[var(--textSecondary)] cursor-pointer transition-[color] duration-[0.15s] rounded text-xs font-bold hover:text-[#10b981] tc-green-hover disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh data"
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={
                    refreshing
                      ? 'animate-[tc-spin_0.8s_linear_infinite]'
                      : undefined
                  }
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  <polyline points="21 3 21 9 15 9" />
                </svg>
              </button>
            </span>
            <span className="text-[22px] font-bold text-[var(--color)]">
              {formatNumber(metadata.marketCapUsd)}
            </span>
          </div>
        )}
        {metadata?.totalSupply && (
          <div className="flex flex-col items-center px-6 py-6 rounded-[16px] bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out relative hover:border-[rgba(52,211,153,0.4)] hover:bg-[var(--backgroundHover)] hover:-translate-y-0.5">
            <span className="text-2xl mb-3">🪙</span>
            <span className="text-[11px] text-[var(--textSecondary)] uppercase tracking-[0.08em] mb-1.5">
              {t('wallet.tokenPage.totalSupply')}
            </span>
            <span className="text-[22px] font-bold text-[var(--color)]">
              {formatSupply(metadata.totalSupply)}
            </span>
          </div>
        )}
        {metadata?.createdAt && (
          <div className="flex flex-col items-center px-6 py-6 rounded-[16px] bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out relative hover:border-[rgba(52,211,153,0.4)] hover:bg-[var(--backgroundHover)] hover:-translate-y-0.5">
            <span className="text-2xl mb-3">📅</span>
            <span className="text-[11px] text-[var(--textSecondary)] uppercase tracking-[0.08em] mb-1.5">
              {t('wallet.tokenPage.created')}
            </span>
            <span className="text-[22px] font-bold text-[var(--color)]">
              {formatDate(metadata.createdAt)}
            </span>
          </div>
        )}
        <div className="flex flex-col items-center px-6 py-6 rounded-[16px] bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.25)] shadow-[0_0_20px_rgba(52,211,153,0.08)] transition-all duration-[0.25s] ease-out relative hover:border-[rgba(52,211,153,0.5)] hover:bg-[rgba(52,211,153,0.14)] hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]">
          <span
            className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[rgba(52,211,153,0.2)] text-[#10b981] tc-green text-xs font-bold flex items-center justify-center cursor-help transition-all duration-[0.15s] hover:bg-[rgba(52,211,153,0.35)] hover:scale-110"
            title={t('wallet.tokenPage.treasuryTooltip')}
          >
            ?
          </span>
          <span className="text-2xl mb-3">🏦</span>
          <span className="text-[11px] text-[var(--textSecondary)] uppercase tracking-[0.08em] mb-1.5">
            {t('wallet.tokenPage.treasuryArc')}
          </span>
          <span className="text-[22px] font-bold text-[var(--color)]">
            {metadata?.treasuryBalance?.arcadeum != null
              ? metadata.treasuryBalance.arcadeum >= 1_000_000
                ? `${(metadata.treasuryBalance.arcadeum / 1_000_000).toFixed(2)}M`
                : metadata.treasuryBalance.arcadeum >= 1_000
                  ? `${(metadata.treasuryBalance.arcadeum / 1_000).toFixed(1)}K`
                  : metadata.treasuryBalance.arcadeum.toLocaleString(
                      undefined,
                      { maximumFractionDigits: 2 },
                    )
              : '—'}
          </span>
          {metadata?.treasuryBalance?.arcadeum != null && (
            <span className="text-xs text-[var(--textSecondary)] mt-0.5">
              {metadata.treasuryBalance.arcadeum.toLocaleString(undefined, {
                maximumFractionDigits: 0,
              })}{' '}
              ARC
            </span>
          )}
        </div>
        {(metadata?.treasuryBalance?.sol ?? 0) > 1 && (
          <div className="flex flex-col items-center px-6 py-6 rounded-[16px] bg-[rgba(52,211,153,0.08)] border border-[rgba(52,211,153,0.25)] shadow-[0_0_20px_rgba(52,211,153,0.08)] transition-all duration-[0.25s] ease-out relative hover:border-[rgba(52,211,153,0.5)] hover:bg-[rgba(52,211,153,0.14)] hover:shadow-[0_0_30px_rgba(52,211,153,0.15)]">
            <span
              className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[rgba(52,211,153,0.2)] text-[#10b981] tc-green text-xs font-bold flex items-center justify-center cursor-help transition-all duration-[0.15s] hover:bg-[rgba(52,211,153,0.35)] hover:scale-110"
              title={t('wallet.tokenPage.treasuryTooltip')}
            >
              ?
            </span>
            <span className="text-2xl mb-3">◎</span>
            <span className="text-[11px] text-[var(--textSecondary)] uppercase tracking-[0.08em] mb-1.5">
              {t('wallet.tokenPage.treasurySol')}
            </span>
            <span className="text-[22px] font-bold text-[var(--color)]">
              {metadata?.treasuryBalance?.sol != null
                ? metadata.treasuryBalance.sol >= 1_000
                  ? `${(metadata.treasuryBalance.sol / 1_000).toFixed(1)}K`
                  : metadata.treasuryBalance.sol < 0.01
                    ? `${metadata.treasuryBalance.sol.toFixed(4)}`
                    : `${metadata.treasuryBalance.sol.toFixed(2)}`
                : '—'}
            </span>
            {metadata?.treasuryBalance?.sol != null && (
              <span className="text-xs text-[var(--textSecondary)] mt-0.5">
                {metadata.treasuryBalance.sol.toLocaleString(undefined, {
                  maximumFractionDigits: 4,
                })}{' '}
                SOL
              </span>
            )}
          </div>
        )}
      </div>

      <div className="mb-[48px]">
        <h2 className="text-[22px] font-bold text-[var(--color)] m-0 mb-2">
          {t('wallet.tokenPage.howToEarn.title')}
        </h2>
        <p className="text-sm text-[var(--textSecondary)] m-0 mb-6">
          {t('wallet.tokenPage.howToEarn.subtitle')}
        </p>
        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
          <div className="p-5 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out hover:border-[rgba(52,211,153,0.3)] hover:bg-[var(--backgroundHover)]">
            <div className="text-[28px] mb-3">🏆</div>
            <h3 className="text-[15px] font-semibold text-[var(--color)] m-0 mb-1.5">
              {t('wallet.tokenPage.howToEarn.tournamentPrizes.title')}
            </h3>
            <p className="text-[13px] text-[var(--textSecondary)] leading-[1.6] m-0">
              {t('wallet.tokenPage.howToEarn.tournamentPrizes.description')}
            </p>
          </div>
        </div>
      </div>

      <div className="mb-[48px]">
        <h2 className="text-[22px] font-bold text-[var(--color)] m-0 mb-2">
          {t('wallet.tokenPage.howToSpend.title')}
        </h2>
        <p className="text-sm text-[var(--textSecondary)] m-0 mb-6">
          {t('wallet.tokenPage.howToSpend.subtitle')}
        </p>
        <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
          <div className="p-5 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out hover:border-[rgba(52,211,153,0.3)] hover:bg-[var(--backgroundHover)]">
            <div className="text-[28px] mb-3">🎨</div>
            <h3 className="text-[15px] font-semibold text-[var(--color)] m-0 mb-1.5">
              {t('wallet.tokenPage.howToSpend.shopItems.title')}
            </h3>
            <p className="text-[13px] text-[var(--textSecondary)] leading-[1.6] m-0">
              {t('wallet.tokenPage.howToSpend.shopItems.description')}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out hover:border-[rgba(52,211,153,0.3)] hover:bg-[var(--backgroundHover)]">
            <div className="text-[28px] mb-3">✨</div>
            <h3 className="text-[15px] font-semibold text-[var(--color)] m-0 mb-1.5">
              {t('wallet.tokenPage.howToSpend.profileCustomization.title')}
            </h3>
            <p className="text-[13px] text-[var(--textSecondary)] leading-[1.6] m-0">
              {t(
                'wallet.tokenPage.howToSpend.profileCustomization.description',
              )}
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[var(--background)] border border-[var(--glassBorder)] transition-all duration-[0.25s] ease-out hover:border-[rgba(52,211,153,0.3)] hover:bg-[var(--backgroundHover)]">
            <div className="text-[28px] mb-3">🛍️</div>
            <h3 className="text-[15px] font-semibold text-[var(--color)] m-0 mb-1.5">
              {t('wallet.tokenPage.howToSpend.connectWallet.title')}
            </h3>
            <p className="text-[13px] text-[var(--textSecondary)] leading-[1.6] m-0">
              {t('wallet.tokenPage.howToSpend.connectWallet.description')}
            </p>
          </div>
        </div>
      </div>

      {(metadata?.twitter || metadata?.website) && (
        <div className="pt-8 border-t border-[var(--glassBorder)]">
          <h2 className="text-[22px] font-bold text-[var(--color)] m-0 mb-2">
            {t('wallet.tokenPage.community.title')}
          </h2>
          <p className="text-sm text-[var(--textSecondary)] m-0 mb-6">
            {t('wallet.tokenPage.community.subtitle')}
          </p>
          <div className="flex gap-4 flex-wrap max-[480px]:justify-center">
            {metadata?.twitter && (
              <a
                href={metadata.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-[10px] bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[13px] font-semibold text-[var(--color)] no-underline transition-all duration-200 ease-out hover:text-[#10b981] tc-green-hover hover:border-[rgba(52,211,153,0.4)] hover:bg-[var(--glassBgHover)]"
              >
                𝕏 Twitter ↗
              </a>
            )}
            {metadata?.website && (
              <a
                href={metadata.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-[18px] py-2.5 rounded-[10px] bg-[var(--backgroundHover)] border border-[var(--glassBorder)] text-[13px] font-semibold text-[var(--color)] no-underline transition-all duration-200 ease-out hover:text-[#10b981] tc-green-hover hover:border-[rgba(52,211,153,0.4)] hover:bg-[var(--glassBgHover)]"
              >
                🌐 Website ↗
              </a>
            )}
          </div>
        </div>
      )}

      <p className="text-center text-xs text-[var(--textSecondary)] mt-8 leading-[1.6] opacity-80">
        {t('wallet.tokenPage.disclaimer')}
      </p>
    </div>
  );
}
