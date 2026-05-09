// Server Component — no 'use client'. Renders BalanceChip (async Server
// Component) as a sibling slot to HeaderInteractive (client island).
// Next.js App Router supports passing Server Components as children/props
// into Client Components, which is how BalanceChip surfaces inside the header.
import { HeaderLayout } from './HeaderLayout';
import { HeaderInteractive } from './HeaderInteractive';
import { BalanceChip } from '@/features/wallet/ui/BalanceChip';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';

export async function Header() {
  const token = await getServerAccessToken();

  return (
    <HeaderLayout balanceChip={token ? <BalanceChip /> : null}>
      <HeaderInteractive />
    </HeaderLayout>
  );
}
