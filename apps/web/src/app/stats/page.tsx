import { StatsClient } from './StatsClient';

export const metadata = {
  title: 'Player Statistics - AicoApp',
  description: 'View your game performance and statistics',
};

export default function Statistics() {
  return <StatsClient />;
}
