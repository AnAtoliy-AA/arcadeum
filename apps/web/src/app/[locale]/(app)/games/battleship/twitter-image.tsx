import {
  contentType as ogContentType,
  renderSeaBattleOgImage,
  size as ogSize,
} from '../sea-battle/_og/seaBattleOgImage';

export const alt = 'Battleship — free online naval combat on Arcadeum';
export const size = ogSize;
export const contentType = ogContentType;

export default function TwitterImage() {
  return renderSeaBattleOgImage();
}
