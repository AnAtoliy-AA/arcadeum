'use client';

import { styled, YStack } from 'tamagui';
import type { CSSProperties } from 'react';

export const SceneShell = styled(YStack, {
  name: 'CriticalSceneShell',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  pointerEvents: 'none',
  zIndex: 0,
});

export const SceneGridFloor = styled(YStack, {
  name: 'CriticalSceneGridFloor',
  position: 'absolute',
  left: '-50%',
  right: '-50%',
  bottom: '-40%',
  height: '120%',
});

export const SceneHorizon = styled(YStack, { name: 'CriticalSceneHorizon' });

export const SceneBacklight = styled(YStack, { name: 'CriticalSceneBacklight' });

export const SceneScanlines = styled(YStack, { name: 'CriticalSceneScanlines' });

export const SceneVignette = styled(YStack, { name: 'CriticalSceneVignette' });

export const SceneParticles = styled(YStack, {
  name: 'CriticalSceneParticles',
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  pointerEvents: 'none',
});

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
    maskImage:
      'linear-gradient(to top, rgba(0,0,0,1) 30%, transparent 90%)',
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

export const SCENE_LAYER_TESTIDS = {
  backdrop: 'scene-backdrop',
  gridFloor: 'scene-grid-floor',
  horizon: 'scene-horizon',
  backlight: 'scene-backlight',
  scanlines: 'scene-scanlines',
  vignette: 'scene-vignette',
  particles: 'scene-particles',
} as const;
