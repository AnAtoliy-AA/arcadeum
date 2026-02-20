'use client';

import { useState } from 'react';
import { GlassCard } from '@/shared/ui';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  CardTitle,
  CodeContainer,
  CodeText,
  CopyButton,
  CopiedNotice,
  ShareLinkRow,
  ShareLink,
} from './styles';

interface ReferralShareCardProps {
  referralCode: string;
}

export function ReferralShareCard({ referralCode }: ReferralShareCardProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/auth?ref=${referralCode}`
      : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
    } catch {
      const input = document.createElement('input');
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
    }
  };

  return (
    <GlassCard>
      <CardTitle>🔗 {t('referrals.shareCard.title')}</CardTitle>
      <CodeContainer>
        <CodeText data-testid="referral-code">{referralCode}</CodeText>
        <CopyButton onClick={handleCopy} data-testid="copy-referral-btn">
          {copied ? (
            <CopiedNotice>{t('referrals.shareCard.copied')}</CopiedNotice>
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                width="14"
                height="14"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
              {t('referrals.shareCard.copy')}
            </>
          )}
        </CopyButton>
      </CodeContainer>
      <ShareLinkRow>
        <span>{t('referrals.shareCard.linkLabel')}</span>
        <ShareLink>{shareUrl}</ShareLink>
      </ShareLinkRow>
    </GlassCard>
  );
}
