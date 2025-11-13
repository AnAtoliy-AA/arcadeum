import { Platform } from 'react-native';
import type { ViewStyle } from 'react-native';

interface ShadowOffset {
  width?: number;
  height?: number;
}

export interface PlatformShadowOptions {
  color?: string;
  opacity?: number;
  radius?: number;
  offset?: ShadowOffset;
  elevation?: number;
  webShadow?: string;
}

type WebShadow = { boxShadow: string };

type ShadowStyle = Partial<ViewStyle> & Partial<WebShadow>;

export function platformShadow(options: PlatformShadowOptions): ShadowStyle {
  const {
    color = '#000',
    opacity = 0.25,
    radius = 4,
    offset = {},
    elevation,
    webShadow,
  } = options;

  if (Platform.OS === 'web') {
    if (webShadow) {
      return { boxShadow: webShadow };
    }

    const offsetX = offset.width ?? 0;
    const offsetY = offset.height ?? 0;
    const blur = Math.max(radius * 2, 0);
    const shadowColor = resolveRgba(color, opacity);

    return {
      boxShadow: `${offsetX}px ${offsetY}px ${blur}px ${shadowColor}`,
    };
  }

  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: {
      width: offset.width ?? 0,
      height: offset.height ?? 0,
    },
    ...(typeof elevation === 'number' ? { elevation } : {}),
  };
}

function resolveRgba(color: string, opacity: number): string {
  if (!Number.isFinite(opacity)) {
    return color;
  }

  const normalizedOpacity = clamp(opacity, 0, 1);

  const rgbaMatch = color.match(/^rgba\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const parts = rgbaMatch[1].split(',').map((part) => part.trim());
    const baseAlpha = parts.length === 4 ? Number.parseFloat(parts[3]) : 1;
    const alpha = clamp(
      (Number.isFinite(baseAlpha) ? baseAlpha : 1) * normalizedOpacity,
      0,
      1,
    );
    return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
  }

  const rgbMatch = color.match(/^rgb\(([^)]+)\)$/i);
  if (rgbMatch) {
    return `rgba(${rgbMatch[1]}, ${normalizedOpacity})`;
  }

  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const expanded =
      hex.length === 3
        ? hex
            .split('')
            .map((char) => char + char)
            .join('')
        : hex.padEnd(6, '0');

    const intValue = Number.parseInt(expanded, 16);
    if (!Number.isFinite(intValue)) {
      return color;
    }
    const r = (intValue >> 16) & 255;
    const g = (intValue >> 8) & 255;
    const b = intValue & 255;
    return `rgba(${r}, ${g}, ${b}, ${normalizedOpacity})`;
  }

  return color;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
