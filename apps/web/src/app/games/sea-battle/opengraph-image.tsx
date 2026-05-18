import {
  alt as ogAlt,
  contentType as ogContentType,
  renderSeaBattleOgImage,
  size as ogSize,
} from './_og/seaBattleOgImage';

export const alt = ogAlt;
export const size = ogSize;
export const contentType = ogContentType;

export default function OpengraphImage() {
  return renderSeaBattleOgImage();
}
