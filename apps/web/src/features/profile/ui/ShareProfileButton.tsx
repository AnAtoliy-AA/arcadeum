'use client';

import { useState } from 'react';
import { Button } from '@arcadeum/ui';
import { shareLink } from '@/shared/lib/share';
import { useTranslation } from '@/shared/i18n/useTranslation';

interface ShareProfileButtonProps {
  userId: string;
  displayName: string;
}

export function ShareProfileButton({
  userId,
  displayName,
}: ShareProfileButtonProps) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof window === 'undefined') return;
    const url = `${window.location.origin}/profile/${userId}`;
    const success = await shareLink({
      title: `${displayName} on Arcadeum`,
      text: `Check out ${displayName}'s player profile and stats on Arcadeum!`,
      url,
      event: 'profile.share',
    });
    if (success) {
      setCopied(true);
    }
  };

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleShare}
      data-testid="profile-share-button"
    >
      {copied
        ? `✓ ${t('games.common.profile.profileCopied')}`
        : `🔗 ${t('games.common.profile.shareProfile')}`}
    </Button>
  );
}
