import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { RoomCardComponent } from '../RoomCardComponent';
import {
  PaginationButton,
  PaginationContainer,
  PaginationInfo,
} from '../styles';
import type { GamesViewMode } from '../types';

interface GamesListProps {
  rooms: GameRoomSummary[];
  viewMode: GamesViewMode;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const INITIAL_PAGE = 1;

export function GamesList({
  rooms,
  viewMode,
  page,
  totalPages,
  onPageChange,
}: GamesListProps) {
  const { t } = useTranslation();

  return (
    <>
      {rooms.map((room) => (
        <RoomCardComponent key={room.id} room={room} viewMode={viewMode} />
      ))}

      {totalPages > 1 && (
        <PaginationContainer>
          <PaginationButton
            onClick={() => onPageChange(Math.max(INITIAL_PAGE, page - 1))}
            disabled={page === INITIAL_PAGE}
          >
            ←
          </PaginationButton>
          <PaginationInfo>
            {t('games.lounge.paginationInfo', {
              page,
              totalPages,
            })}
          </PaginationInfo>
          <PaginationButton
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            →
          </PaginationButton>
        </PaginationContainer>
      )}
    </>
  );
}
