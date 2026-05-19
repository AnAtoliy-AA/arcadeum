import type { Metadata } from 'next';
import { finalizeGemPurchase } from '@/features/gems/server/gems.actions';
import { getServerLocale } from '@/shared/i18n/server';
import { formatNumber } from '@/shared/i18n/formatters';
import {
  Actions,
  BalanceCard,
  Icon,
  Lede,
  PrimaryLink,
  PurpleAmount,
  SecondaryLink,
  Shell,
  Title,
  TokenChip,
} from './_components';

export const metadata: Metadata = {
  title: 'Gem Purchase · Arcadeum',
  description: 'Confirming your gem purchase…',
};

interface SearchParams {
  // PayPal redirects with `?token=ORDER_ID&PayerID=...`
  token?: string;
}

export default async function GemPurchaseSuccessPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const [sp, locale] = await Promise.all([searchParams, getServerLocale()]);
  const orderId = sp.token;

  if (!orderId || typeof orderId !== 'string') {
    return (
      <Shell variant="neutral">
        <Icon variant="neutral">?</Icon>
        <Title>Gem purchase</Title>
        <Lede>
          We couldn&apos;t find a PayPal order in this URL. Open your wallet to
          verify any pending purchases.
        </Lede>
        <Actions>
          <PrimaryLink href="/wallet">Open wallet</PrimaryLink>
        </Actions>
      </Shell>
    );
  }

  // Use the bare helper — Server Components can't trigger revalidatePath
  // during render, and we don't need it (the page IS the render).
  const result = await finalizeGemPurchase({ orderId });

  if (result.ok) {
    const credited = result.gemsCredited;
    const { coins: newCoins, gems: newGems } = result.newBalance;
    return (
      <Shell variant="success">
        <Icon variant="success">💎</Icon>
        <Title>{credited > 0 ? 'Gems added!' : 'Already credited'}</Title>
        <Lede>
          {credited > 0 ? (
            <>
              <PurpleAmount>+{formatNumber(credited, locale)}</PurpleAmount>{' '}
              gems landed in your wallet.
            </>
          ) : (
            'This purchase was already credited to your wallet.'
          )}
        </Lede>

        <BalanceCard coins={newCoins} gems={newGems} locale={locale} />

        <Actions>
          <PrimaryLink href="/wallet">Open wallet</PrimaryLink>
          <SecondaryLink href="/wallet#buy-gems">Buy more</SecondaryLink>
        </Actions>
      </Shell>
    );
  }

  // Soft failure path.
  let title = 'Gem purchase';
  let body: React.ReactNode;
  if (result.error === 'not_captured') {
    title = 'Almost there';
    body =
      'PayPal has not confirmed the payment yet. Try Verify in your wallet in a moment.';
  } else if (result.error === 'not_eligible') {
    title = 'Already handled';
    body =
      'This purchase has already been processed. Open your wallet to see your balance.';
  } else if (result.error === 'not_found') {
    title = 'Order not found';
    body =
      'We could not find this order. If you were charged, contact support with the PayPal token below.';
  } else {
    body =
      'Something went wrong while crediting your gems. Try Verify in your wallet.';
  }

  return (
    <Shell variant="warning">
      <Icon variant="warning">!</Icon>
      <Title>{title}</Title>
      <Lede>{body}</Lede>
      <TokenChip token={orderId} />
      <Actions>
        <PrimaryLink href="/wallet">Open wallet</PrimaryLink>
      </Actions>
    </Shell>
  );
}
