import { useState } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import { useRoutes } from '@/shared/config/useRoutes';
import { Header, HeaderControls, Title, ViewToggle } from '../styles';
import { Button, CreateRoomLinkButton } from '@arcadeum/ui';
import { InviteCodeModal } from './InviteCodeModal';
import type { GamesViewMode } from '../types';

interface GamesHeaderProps {
  viewMode: GamesViewMode;
  onViewModeChange: (mode: GamesViewMode) => void;
  title?: string;
  createRoomGameId?: string;
}

export function GamesHeader({
  viewMode,
  onViewModeChange,
  title,
  createRoomGameId,
}: GamesHeaderProps) {
  const { t } = useTranslation();
  const routes = useRoutes();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const createRoomHref = createRoomGameId
    ? `${routes.gameCreate}?gameId=${encodeURIComponent(createRoomGameId)}`
    : routes.games;

  return (
    <Header>
      <Title size="xl" gradient>
        {title || t('games.lounge.activeTitle')}
      </Title>
      <HeaderControls>
        <ViewToggle>
          <Button
            variant="chip"
            size="sm"
            active={viewMode === 'grid'}
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            className="rounded-none"
          >
            ▦
          </Button>
          <Button
            variant="chip"
            size="sm"
            active={viewMode === 'list'}
            onClick={() => onViewModeChange('list')}
            title="List view"
            className="rounded-none"
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
        <CreateRoomLinkButton href={createRoomHref}>
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
