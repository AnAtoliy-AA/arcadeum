'use client';

import { Typography } from '../Typography/Typography';
import { isGradient } from './colors';
import type { PlayerAvatarSize } from './constants';

interface CardChromeProps {
  name: string;
  size: PlayerAvatarSize;
  bannerColor?: string | null;
  nameColor?: string | null;
  presenceLine?: string;
  /** SKIN chip. `prefix` is the localized category word (e.g. "Skin"); the
   *  component owns only the separator + styling, never the literal text. */
  skinChip?: { id: string; label: string; prefix?: string } | null;
  topLeftOverlay?: React.ReactNode;
  /** VIP tier accent (premium/vip/supporter) applied to the nameplate. */
  roleColor?: string | null;
  /** Prestige glyph shown beside the name for VIP tiers. */
  roleGlyph?: string | null;
  testId?: string;
  onPress?: () => void;
  /** The disc + halo zone, rendered between the chrome overlays and the name. */
  children: React.ReactNode;
}

// The card/profile presentation: a bordered panel with an optional banner
// backdrop, corner overlays (skin chip, try-on tag) and the player name +
// presence line below the disc zone. Inline sizes skip this entirely.
export function CardChrome({
  name,
  size,
  bannerColor,
  nameColor,
  presenceLine,
  skinChip,
  topLeftOverlay,
  roleColor,
  roleGlyph,
  testId,
  onPress,
  children,
}: CardChromeProps) {
  const bannerStyle: React.CSSProperties | undefined = bannerColor
    ? isGradient(bannerColor)
      ? { backgroundImage: bannerColor }
      : { backgroundColor: bannerColor }
    : undefined;

  const nameStyle: React.CSSProperties = nameColor && isGradient(nameColor)
    ? {
        background: nameColor,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      }
    : roleColor
      ? { textShadow: `0 0 12px ${roleColor}66` }
      : {};

  return (
    <div
      data-testid={testId}
      onClick={onPress}
      style={{
        cursor: onPress ? 'pointer' : 'default',
        width: size === 'profile' ? '100%' : 220,
        minHeight: size === 'profile' ? 280 : undefined,
        borderRadius: 20,
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'rgba(255,255,255,0.08)',
        padding: 16,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 12,
        overflow: 'hidden',
        ...(bannerStyle ?? { backgroundColor: 'rgba(15,23,42,0.55)' }),
      }}
    >
      {bannerStyle ? (
        <span
          style={{ width: 0, height: 0 }}
          data-testid={testId ? `${testId}-banner` : undefined}
        />
      ) : null}
      {topLeftOverlay ? (
        <div
          style={{ position: 'absolute', top: 12, left: 12, zIndex: 2, pointerEvents: 'auto' }}
        >
          {topLeftOverlay}
        </div>
      ) : null}
      {skinChip ? (
        <div
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            padding: '4px 8px',
            borderRadius: 6,
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: 'rgba(255,255,255,0.16)',
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          data-testid={testId ? `${testId}-skin` : undefined}
        >
          <Typography
            fontSize={9}
            letterSpacing={1}
            className="uppercase"
            color="#9ca3af"
            fontWeight="800"
          >
            {skinChip.prefix ? `${skinChip.prefix} · ` : ''}
            {skinChip.label}
          </Typography>
        </div>
      ) : null}
      {children}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <Typography
          fontSize={24}
          fontWeight="900"
          // Equipped name color wins; otherwise a VIP tier tints the name.
          color={
            nameColor && !isGradient(nameColor)
              ? nameColor
              : (roleColor ?? '#f5f7ff')
          }
          data-testid={testId ? `${testId}-name` : undefined}
          style={nameStyle}
        >
          {roleGlyph ? `${roleGlyph} ` : ''}
          {name}
        </Typography>
        {presenceLine ? (
          <Typography
            fontSize={10}
            letterSpacing={2}
            className="uppercase"
            color="#9ca3af"
            fontWeight="700"
          >
            {presenceLine}
          </Typography>
        ) : null}
      </div>
    </div>
  );
}
