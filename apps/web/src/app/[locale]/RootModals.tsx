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

/**
 * Client-mounted modals that render nothing in the initial HTML:
 * the matchmaking queue is only shown while queuing and the wallet
 * bridge only connects for authenticated sessions (it reads the token
 * from the client session store). `ssr: false` keeps their chunks
 * (and the socket client they import) out of the critical path on the
 * marketing home page.
 */
export function RootModals() {
  return (
    <>
      <WalletLiveBridge />
      <MatchmakingQueueModal />
      <AchievementPopupHost />
    </>
  );
}
