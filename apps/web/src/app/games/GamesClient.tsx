'use client';

import { GamesPage } from './GamesPage';
import { GetRoomsResponse } from '@/features/games/api';

interface GamesClientProps {
  initialData: GetRoomsResponse | null;
}

export function GamesClient({ initialData }: GamesClientProps) {
  return <GamesPage initialData={initialData} />;
}
