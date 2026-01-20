import { useEffect, useRef } from 'react';
import { useTranslation } from '@/shared/lib/useTranslation';
import type { GameRoomSummary } from '@/shared/types/games';
import { RoomCardComponent } from '../RoomCardComponent';
import { Spinner, EndOfListText, ScrollSentinel } from '../styles';
import type { GamesViewMode } from '../types';

interface GamesListProps {
  rooms: GameRoomSummary[];
  viewMode: GamesViewMode;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void | Promise<unknown>;
}

export function GamesList({
  rooms,
  viewMode,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: GamesListProps) {
  const { t } = useTranslation();
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      {rooms.map((room) => (
        <RoomCardComponent key={room.id} room={room} viewMode={viewMode} />
      ))}

      {hasNextPage || isFetchingNextPage ? (
        <ScrollSentinel ref={observerTarget}>
          {isFetchingNextPage && <Spinner />}
        </ScrollSentinel>
      ) : (
        <EndOfListText>{t('games.lounge.noMoreRooms')}</EndOfListText>
      )}
    </>
  );
}
