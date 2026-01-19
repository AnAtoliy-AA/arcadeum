import { useTranslation } from '@/shared/lib/useTranslation';
import {
  CreateButton,
  Header,
  HeaderControls,
  Title,
  ViewToggle,
  ViewToggleButton,
} from '../styles';
import type { GamesViewMode } from '../types';

interface GamesHeaderProps {
  viewMode: GamesViewMode;
  onViewModeChange: (mode: GamesViewMode) => void;
}

export function GamesHeader({ viewMode, onViewModeChange }: GamesHeaderProps) {
  const { t } = useTranslation();

  return (
    <Header>
      <Title>{t('games.lounge.activeTitle')}</Title>
      <HeaderControls>
        <ViewToggle>
          <ViewToggleButton
            $active={viewMode === 'grid'}
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
          >
            ▦
          </ViewToggleButton>
          <ViewToggleButton
            $active={viewMode === 'list'}
            onClick={() => onViewModeChange('list')}
            title="List view"
          >
            ☰
          </ViewToggleButton>
        </ViewToggle>
        <CreateButton href="/games/create">
          {t('games.common.createRoom')}
        </CreateButton>
      </HeaderControls>
    </Header>
  );
}
