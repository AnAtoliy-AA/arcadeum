'use client';

import { useEffect, useRef } from 'react';
import { useGlimwormStore } from '../store/glimwormStore';
import {
  createGlimwormApp,
  type GlimwormPixiApp,
} from '../lib/pixi/createGlimwormApp';
import {
  createArenaRenderer,
  updateArena,
  type ArenaRenderState,
} from '../lib/pixi/renderArena';
import { WormRenderState } from '../lib/pixi/renderWorms';
import {
  FoodRenderState,
  PowerupRenderState,
} from '../lib/pixi/renderFoodAndPowerups';
import { FxRenderState } from '../lib/pixi/fx';
import {
  computeT,
  interpolateSegments,
  selectRenderTime,
} from '../lib/pixi/interpolation';
import type { Vec2, WormId } from '../types';

const RENDER_DELAY_MS = 100;

interface UseGlimwormPixiResult {
  getHeadScreenPos: () => { x: number; y: number } | null;
}

/**
 * Mounts a pixi.js Application in the given DOM div, drives the per-frame
 * render loop from the Zustand snapshot store, and returns a helper for the
 * controls hook to project the self-worm head into screen space.
 */
export function useGlimwormPixi(
  canvasEl: HTMLDivElement | null,
): UseGlimwormPixiResult {
  const appRef = useRef<GlimwormPixiApp | null>(null);
  const arenaStateRef = useRef<ArenaRenderState | null>(null);
  const wormStateRef = useRef<WormRenderState | null>(null);
  const foodStateRef = useRef<FoodRenderState | null>(null);
  const powerupStateRef = useRef<PowerupRenderState | null>(null);
  const fxStateRef = useRef<FxRenderState | null>(null);

  useEffect(() => {
    const root = canvasEl;
    if (!root) return;

    let alive = true;
    let cleanupTicker: (() => void) | null = null;

    const tick = () => {
      const now = performance.now();
      const state = useGlimwormStore.getState();
      const latest = state.latestSnapshot;
      if (!latest) return;
      if (arenaStateRef.current)
        updateArena(arenaStateRef.current, latest.arena);

      const interpById = new Map<WormId, Vec2[]>();
      const previous = state.previousSnapshot;
      if (previous) {
        const renderTime = selectRenderTime(
          latest.serverTime,
          RENDER_DELAY_MS,
          now,
        );
        const t = computeT(previous.serverTime, latest.serverTime, renderTime);
        for (const w of latest.worms) {
          const prevW = previous.worms.find((p) => p.id === w.id);
          if (prevW)
            interpById.set(
              w.id,
              interpolateSegments(prevW.segments, w.segments, t),
            );
        }
      }

      wormStateRef.current?.update(latest.worms, interpById);
      foodStateRef.current?.update(latest.food);
      powerupStateRef.current?.update(latest.powerups);

      const fx = fxStateRef.current;
      const ga = appRef.current;
      if (fx && ga) {
        const events = state.popEvents();
        for (const ev of events) {
          if (ev.type !== 'worm_died' && ev.type !== 'powerup_picked') continue;
          const worm = latest.worms.find((w) => w.id === ev.wormId);
          const head = worm?.segments[0];
          if (!head) continue;
          const screen = worldToScreen(ga, head);
          if (ev.type === 'worm_died') {
            fx.spawnDeathBurst(
              screen.x,
              screen.y,
              parseHexColor(worm?.color ?? '#ffffff'),
              now,
            );
          } else {
            fx.spawnPowerupSparkle(screen.x, screen.y, ev.kind, now);
          }
        }
        fx.update(now);
      }
    };

    const init = async () => {
      const arena = useGlimwormStore.getState().latestSnapshot?.arena ?? {
        width: 2000,
        height: 2000,
      };
      const ga = await createGlimwormApp(root, arena);
      if (!alive) {
        ga.destroy();
        return;
      }
      appRef.current = ga;
      arenaStateRef.current = createArenaRenderer(ga.layers.bg, arena);
      wormStateRef.current = new WormRenderState(ga.layers.worm);
      foodStateRef.current = new FoodRenderState(ga.layers.food);
      powerupStateRef.current = new PowerupRenderState(ga.layers.powerup);
      fxStateRef.current = new FxRenderState(ga.layers.fx);
      ga.app.ticker.add(tick);
      cleanupTicker = () => ga.app.ticker.remove(tick);
    };

    void init();

    return () => {
      alive = false;
      cleanupTicker?.();
      wormStateRef.current?.release();
      foodStateRef.current?.release();
      powerupStateRef.current?.release();
      fxStateRef.current?.release();
      appRef.current?.destroy();
      appRef.current = null;
    };
  }, [canvasEl]);

  const getHeadScreenPos = (): { x: number; y: number } | null => {
    const ga = appRef.current;
    const latest = useGlimwormStore.getState().latestSnapshot;
    if (!ga || !latest) return null;
    const self = latest.worms.find((w) => w.self);
    if (!self || self.segments.length === 0) return null;
    return worldToScreen(ga, self.segments[0]);
  };

  return { getHeadScreenPos };
}

function worldToScreen(
  ga: GlimwormPixiApp,
  worldPos: { x: number; y: number },
): { x: number; y: number } {
  return {
    x: ga.arenaContainer.x + worldPos.x * ga.arenaContainer.scale.x,
    y: ga.arenaContainer.y + worldPos.y * ga.arenaContainer.scale.y,
  };
}

function parseHexColor(hex: string): number {
  return parseInt(hex.replace('#', ''), 16) || 0xffffff;
}
