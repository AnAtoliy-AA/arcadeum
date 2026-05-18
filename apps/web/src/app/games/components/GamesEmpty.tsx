import Link from 'next/link';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Empty } from '../styles';

export function GamesEmpty() {
  const { t } = useTranslation();
  return (
    <Empty data-testid="games-empty">
      {t('games.lounge.emptyTitle')}
      <br />
      <Link
        href="/games/sea-battle"
        style={{
          display: 'inline-block',
          marginTop: '0.75rem',
          color: '#ff9500',
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        {t('games.lounge.emptyFeaturedLink')}
      </Link>
    </Empty>
  );
}
