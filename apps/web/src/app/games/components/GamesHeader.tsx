import { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { Header, HeaderControls, Title, ViewToggle } from '../styles';
import { Button, CreateRoomLinkButton } from '@arcadeum/ui';
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
      <Title size="xl" gradient>
        {t('games.lounge.activeTitle')}
      </Title>
      <HeaderControls>
        <ViewToggle>
          <Button
            variant="chip"
            size="sm"
            isActive={viewMode === 'grid'}
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            style={{ borderRadius: 0 }}
          >
            ▦
          </Button>
          <Button
            variant="chip"
            size="sm"
            isActive={viewMode === 'list'}
            onClick={() => onViewModeChange('list')}
            title="List view"
            style={{ borderRadius: 0 }}
          >
            ☰
          </Button>
        </ViewToggle>
        <Button
          variant="secondary"
          size="md"
          onClick={() => setIsInviteModalOpen(true)}
        >
          {t('games.common.joinByCode') || 'Join by Code'}
        </Button>
        <CreateRoomLinkButton href="/games/create">
          {t('games.common.createRoom')}
        </CreateRoomLinkButton>
      </HeaderControls>

      <InviteCodeModal
        open={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </Header>
  );
}
