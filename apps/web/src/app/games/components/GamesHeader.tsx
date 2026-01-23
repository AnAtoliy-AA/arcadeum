import { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import {
  CreateButton,
  Header,
  HeaderControls,
  Title,
  ViewToggle,
  ViewToggleButton,
  JoinByCodeButton,
} from '../styles';
import { InviteCodeModal } from './InviteCodeModal';
import type { GamesViewMode } from '../types';

interface GamesHeaderProps {
  viewMode: GamesViewMode;
  onViewModeChange: (mode: GamesViewMode) => void;
}

export function GamesHeader({ viewMode, onViewModeChange }: GamesHeaderProps) {
  const { t } = useTranslation();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

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
        <JoinByCodeButton onClick={() => setIsInviteModalOpen(true)}>
          {t('games.common.joinByCode') || 'Join by Code'}
        </JoinByCodeButton>
        <CreateButton href="/games/create">
          {t('games.common.createRoom')}
        </CreateButton>
      </HeaderControls>

      <InviteCodeModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </Header>
  );
}
