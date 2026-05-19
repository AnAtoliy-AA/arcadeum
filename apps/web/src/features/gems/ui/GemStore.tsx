import { getServerLocale } from '@/shared/i18n/server';
import { getActivePackages } from '../server/gems.server';
import { GemPackageCard } from './GemPackageCard';

export async function GemStore() {
  const [packages, locale] = await Promise.all([
    getActivePackages(),
    getServerLocale(),
  ]);

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
          <GemPackageCard key={pkg.id} pkg={pkg} locale={locale} />
        ))}
      </div>
    </section>
  );
}
