import { Error } from '../styles';

interface GamesErrorProps {
  error: string;
}

export function GamesError({ error }: GamesErrorProps) {
  return <Error>{error}</Error>;
}
