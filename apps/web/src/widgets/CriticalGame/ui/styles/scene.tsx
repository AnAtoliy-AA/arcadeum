'use client';

import type { CSSProperties, HTMLAttributes } from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

const SCENE_LAYER_BASE = 'flex flex-col items-stretch';

export function SceneShell({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        SCENE_LAYER_BASE,
        'absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none z-[0]',
        className,
      )}
      {...props}
    />
  );
}

export function SceneGridFloor({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        SCENE_LAYER_BASE,
        'absolute left-[-50%] right-[-50%] bottom-[-40%] h-[120%]',
        className,
      )}
      {...props}
    />
  );
}

export function SceneHorizon({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(SCENE_LAYER_BASE, className)} {...props} />;
}

export function SceneBacklight({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(SCENE_LAYER_BASE, className)} {...props} />;
}

export function SceneScanlines({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(SCENE_LAYER_BASE, className)} {...props} />;
}

export function SceneVignette({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(SCENE_LAYER_BASE, className)} {...props} />;
}

export function SceneAmbientGlow({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return <div className={cx(SCENE_LAYER_BASE, className)} {...props} />;
}

export function SceneBackgroundImage({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        SCENE_LAYER_BASE,
        'absolute inset-0 z-[-1] opacity-[0.6]',
        className,
      )}
      {...props}
    />
  );
}

export function SceneParticles({
  className,
  ...props
}: { className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cx(
        SCENE_LAYER_BASE,
        'absolute top-0 left-0 right-0 bottom-0 pointer-events-none',
        className,
      )}
      {...props}
    />
  );
}

export function makeGridFloorStyle(a: string, b: string): CSSProperties {
  return {
    backgroundImage: `
      linear-gradient(${a} 1px, transparent 1px),
      linear-gradient(90deg, ${b} 1px, transparent 1px)
    `,
    backgroundSize: '48px 48px, 48px 48px',
    transform: 'perspective(600px) rotateX(62deg) translateY(180px) scale(2)',
    transformOrigin: 'center bottom',
    WebkitMaskImage:
      'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 90%)',
    maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 90%)',
  };
}

export function makeHorizonStyle(gradient: string): CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '55%',
    height: 2,
    background: gradient,
    filter: 'blur(1px)',
    boxShadow: `0 0 24px ${gradient}`,
  };
}

export function makeBacklightStyle(color: string): CSSProperties {
  return {
    position: 'absolute',
    top: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 600,
    height: 300,
    background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
    filter: 'blur(20px)',
    pointerEvents: 'none',
  };
}

export function makeScanlinesStyle(): CSSProperties {
  return {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 3px)',
    pointerEvents: 'none',
  };
}

export function makeVignetteStyle(color: string): CSSProperties {
  return {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 140,
    background: `linear-gradient(to bottom, transparent 0%, ${color} 100%)`,
    pointerEvents: 'none',
  };
}

export function makeAmbientGlowStyle(
  glow1: string,
  glow2: string,
): CSSProperties {
  return {
    position: 'absolute',
    top: '-60%',
    left: '-60%',
    width: '220%',
    height: '220%',
    background: `radial-gradient(circle at 30% 30%, ${glow1} 0%, transparent 35%),
                 radial-gradient(circle at 70% 70%, ${glow2} 0%, transparent 35%)`,
    animation: 'ambientGlow 12s ease-in-out infinite',
    pointerEvents: 'none',
    zIndex: 0,
  };
}

export function makeBackgroundImageStyle(url: string): CSSProperties {
  return {
    backgroundImage: `url(${url})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    pointerEvents: 'none',
  };
}

export const SCENE_LAYER_TESTIDS = {
  backdrop: 'scene-backdrop',
  ambientGlow: 'scene-ambient-glow',
  gridFloor: 'scene-grid-floor',
  horizon: 'scene-horizon',
  backlight: 'scene-backlight',
  scanlines: 'scene-scanlines',
  vignette: 'scene-vignette',
  particles: 'scene-particles',
  backgroundImage: 'scene-background-image',
} as const;
