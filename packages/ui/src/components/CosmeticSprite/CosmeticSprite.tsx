import { memo } from 'react';
import type { ReactElement, CSSProperties } from 'react';
import { cx } from '../../utils/cx';
import {
  AVATAR_SPRITE_MAP,
  BADGE_SPRITE_MAP,
  type SpriteInfo,
} from '../PlayerAvatar/sprite-maps';

export interface CosmeticSpriteProps {
  src: string;
  size?: number;
  width?: number;
  height?: number;
  alt?: string;
  className?: string;
  'data-testid'?: string;
  priority?: boolean;
}

export const CosmeticSprite = memo(function CosmeticSprite({
  src,
  size = 32,
  width,
  height,
  alt = '',
  className,
  'data-testid': testId,
  priority = false,
}: CosmeticSpriteProps): ReactElement {
  const targetWidth = width ?? size;
  const targetHeight = height ?? size;

  const sprite: SpriteInfo | undefined =
    AVATAR_SPRITE_MAP[src] ?? BADGE_SPRITE_MAP[src];

  if (sprite) {
    const col = sprite.index % sprite.cols;
    const row = Math.floor(sprite.index / sprite.cols);
    const posX = -(col * targetWidth);
    const posY = -(row * targetHeight);
    const bgWidth = sprite.cols * targetWidth;

    const spriteStyle: CSSProperties = {
      width: targetWidth,
      height: targetHeight,
      backgroundImage: `url(${sprite.spritesheet})`,
      backgroundSize: `${bgWidth}px auto`,
      backgroundPosition: `${posX}px ${posY}px`,
    };

    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        data-testid={testId}
        className={cx('bg-no-repeat shrink-0', className)}
        style={spriteStyle}
      />
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      width={targetWidth}
      height={targetHeight}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
      data-testid={testId}
      className={cx('shrink-0 object-contain', className)}
    />
  );
});
