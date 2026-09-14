'use client';

import dynamic from 'next/dynamic';

const WalletLiveBridge = dynamic(
  () =>
    import('@/features/wallet/ui/WalletLiveBridge').then(
      (m) => m.WalletLiveBridge,
    ),
  { ssr: false },
);

const MatchmakingQueueModal = dynamic(
  () =>
    import('@/features/games/ui/MatchmakingQueue').then(
      (m) => m.MatchmakingQueueModal,
    ),
  { ssr: false },
);

const AchievementPopupHost = dynamic(
  () =>
    import('@/features/achievements/ui/AchievementPopupHost').then(
      (m) => m.AchievementPopupHost,
    ),
  { ssr: false },
);

const LevelUpModalHost = dynamic(
  () =>
    import('@/features/level-rewards/ui/LevelUpModalHost').then(
      (m) => m.LevelUpModalHost,
    ),
  { ssr: false },
);

export function RootModals() {
  return (
    <>
      <WalletLiveBridge />
      <MatchmakingQueueModal />
      <AchievementPopupHost />
      <LevelUpModalHost />
    </>
  );
}
