import { useTranslation } from '@/shared/lib/useTranslation';
import { Empty } from '../styles';

export function GamesEmpty() {
  const { t } = useTranslation();
  return (
    <Empty data-testid="games-empty">{t('games.lounge.emptyTitle')}</Empty>
  );
}
