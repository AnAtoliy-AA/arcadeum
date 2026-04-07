import type { Metadata } from 'next';
import { GamesClient } from './GamesClient';
import { appConfig } from '@/shared/config/app-config';

export const metadata: Metadata = {
  title: 'Games',
  description: `Explore the library of available board games on ${appConfig.appName}. Join or create a room to play with friends.`,
};

export default function GamesRoute() {
  return <GamesClient />;
}
