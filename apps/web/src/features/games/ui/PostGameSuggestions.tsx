'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { Button } from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import {
  useTranslation,
  type TranslationKey,
} from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { shareLink, buildChallengeShareText } from '@/shared/lib/share';
import { trackInviteShared } from '@/shared/analytics/funnel';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { sendFriendRequestByUserId } from '@/shared/api/friends';

interface PostGameSuggestionsProps {
  /** Game display name (e.g. "Chess", "Sea Battle"). */
  gameName: string;
  /** Game slug for routing (e.g. "chess", "sea-battle"). */
  gameSlug: string;
  /** Room ID for generating invite/challenge links. */
  roomId?: string;
  /** Invite code for the room. */
  inviteCode?: string;
  /** Callback to navigate to a new game. */
  onPlayAnother?: () => void;
  /** Callback when challenge link is shared. */
  onChallengeShared?: () => void;
  /** Opponent's user ID for sending friend request. */
  opponentUserId?: string;
}

export function PostGameSuggestions({
  gameName,
  gameSlug,
  roomId,
  inviteCode,
  onPlayAnother,
  onChallengeShared,
  opponentUserId,
}: PostGameSuggestionsProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const { sm } = useMediaQuery();
  const { snapshot } = useSessionTokens();
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [friendRequestSent, setFriendRequestSent] = useState(false);
  const [friendRequestLoading, setFriendRequestLoading] = useState(false);

  const handleChallengeFriend = useCallback(async () => {
    if (!roomId) return;

    const { origin } = window.location;
    const params = new URLSearchParams({
      utm_source: 'challenge',
      utm_medium: 'invite',
      utm_campaign: 'post_game',
      ...(inviteCode ? { inviteCode } : {}),
    });
    const inviteUrl = `${origin}/en/rooms/${roomId}?${params.toString()}`;

    const shareText = buildChallengeShareText(gameName, inviteUrl);
    const success = await shareLink({
      ...shareText,
      event: 'challenge.shared',
    });

    if (success) {
      trackInviteShared('challenge', roomId);
      setChallengeCopied(true);
      setTimeout(() => setChallengeCopied(false), 3000);
      onChallengeShared?.();
    }
  }, [gameName, roomId, inviteCode, onChallengeShared]);

  const handleShareResult = useCallback(async () => {
    if (!roomId) return;

    const { origin } = window.location;
    const params = new URLSearchParams({
      utm_source: 'result_share',
      utm_medium: 'social',
      utm_campaign: 'post_game',
    });
    const shareUrl = `${origin}/en/games/${gameSlug}?${params.toString()}`;

    await shareLink({
      title: `Play ${gameName} on Arcadeum`,
      text: `I just played ${gameName} on Arcadeum — free online board games with friends!`,
      url: shareUrl,
      event: 'result.shared',
    });
  }, [gameName, gameSlug, roomId]);

  const handleAddFriend = useCallback(async () => {
    if (!snapshot.accessToken || !opponentUserId) return;
    setFriendRequestLoading(true);
    try {
      await sendFriendRequestByUserId(snapshot.accessToken, opponentUserId);
      setFriendRequestSent(true);
    } catch {
      setFriendRequestSent(true);
    } finally {
      setFriendRequestLoading(false);
    }
  }, [snapshot.accessToken, opponentUserId]);

  return (
    <div
      className={cx('flex w-full flex-col gap-2', sm ? 'px-1' : 'px-2')}
      data-testid="post-game-suggestions"
    >
      <p className="mb-1 text-center text-xs font-semibold uppercase tracking-widest text-[var(--textSecondary)]">
        {t('games.common.postGame.whatNext')}
      </p>

      <div className="flex flex-col gap-2">
        {roomId && (
          <Button
            variant="primary"
            size={sm ? 'md' : 'lg'}
            onClick={handleChallengeFriend}
            className="w-full"
            data-testid="challenge-friend-button"
          >
            {challengeCopied
              ? t('games.common.postGame.linkCopied')
              : t('games.common.postGame.challengeFriend')}
          </Button>
        )}

        {opponentUserId &&
          snapshot.userId &&
          opponentUserId !== snapshot.userId && (
            <Button
              variant={friendRequestSent ? 'glass' : 'secondary'}
              size={sm ? 'md' : 'lg'}
              onClick={handleAddFriend}
              disabled={friendRequestLoading || friendRequestSent}
              className="w-full"
              data-testid="add-friend-post-game-button"
            >
              {friendRequestSent
                ? t('games.common.postGame.friendAdded' as TranslationKey) ||
                  'Friend Request Sent'
                : t('games.common.postGame.addFriend' as TranslationKey) ||
                  'Add Friend'}
            </Button>
          )}

        <Button
          variant="glass"
          size={sm ? 'md' : 'lg'}
          onClick={handleShareResult}
          className="w-full"
          data-testid="share-result-button"
        >
          {t('games.common.postGame.shareResult')}
        </Button>

        {onPlayAnother && (
          <Button
            variant="secondary"
            size={sm ? 'md' : 'lg'}
            onClick={onPlayAnother}
            className="w-full"
            data-testid="play-another-button"
          >
            {t('games.common.postGame.playAnother')}
          </Button>
        )}

        <Link
          href={routes.rewards}
          className="flex items-center justify-between rounded-xl border border-amber-500/30 bg-amber-500/10 px-3.5 py-2.5 text-xs text-amber-600 dark:text-amber-300 no-underline transition-all duration-200 hover:bg-amber-500/20"
          data-testid="post-game-rewards-prompt"
        >
          <span className="font-semibold">
            💎 {t('games.common.postGame.rewardsPrompt')}
          </span>
          <span className="font-bold">
            {t('games.common.postGame.rewardsClaim')} →
          </span>
        </Link>
      </div>
    </div>
  );
}
