import { getServerLocale } from '@/shared/i18n/server';
import { getServerAccessToken } from '@/entities/session/api/serverTokens';
import { getActivePackages } from '../server/gems.server';
import { GemPackageCard } from './GemPackageCard';

export async function GemStore() {
  const [packages, locale, accessToken] = await Promise.all([
    getActivePackages(),
    getServerLocale(),
    getServerAccessToken(),
  ]);
  const isAuthenticated = Boolean(accessToken);

  if (packages.length === 0) {
    return (
      <section aria-label="Gem store" data-testid="gem-store">
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#e4e4e7',
            marginBottom: '16px',
          }}
        >
          Buy Gems
        </h2>
        <p
          data-testid="gem-store-empty"
          style={{ color: '#71717a', fontSize: '14px' }}
        >
          No packages available right now.
        </p>
        <p
          style={{
            fontSize: '12px',
            color: '#52525b',
            marginTop: '8px',
            lineHeight: 1.5,
          }}
        >
          All purchases are final. Virtual goods have no real-world monetary
          value and cannot be refunded, exchanged, or cashed out.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Gem store" data-testid="gem-store">
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#e4e4e7',
          marginBottom: '16px',
        }}
      >
        Buy Gems
      </h2>
      <div
        style={{
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {packages.map((pkg) => (
          <GemPackageCard
            key={pkg.id}
            pkg={pkg}
            locale={locale}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
      <p
        style={{
          fontSize: '12px',
          color: '#52525b',
          marginTop: '16px',
          lineHeight: 1.5,
        }}
      >
        All purchases are final. Virtual goods have no real-world monetary
        value and cannot be refunded, exchanged, or cashed out.
      </p>
    </section>
  );
}
