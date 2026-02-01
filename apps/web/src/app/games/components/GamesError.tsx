import { Error } from '../styles';

interface GamesErrorProps {
  error: string;
}

export function GamesError({ error }: GamesErrorProps) {
  return <Error data-testid="games-error">{error}</Error>;
}
