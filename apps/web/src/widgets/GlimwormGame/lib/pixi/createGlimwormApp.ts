import { Application, Container } from 'pixi.js';
import type { Arena } from '../../types';

export interface GlimwormPixiLayers {
  bg: Container;
  food: Container;
  powerup: Container;
  worm: Container;
  fx: Container;
}

export interface GlimwormPixiApp {
  app: Application;
  layers: GlimwormPixiLayers;
  /** Scaled, centred container holding the arena world (everything except FX). */
  arenaContainer: Container;
  /** Release pixi resources, the ResizeObserver, and the canvas. */
  destroy: () => void;
}

/**
 * Boot a PIXI Application in the given DOM parent and prepare the scenegraph
 * layers used by the Glimworm renderer. The arena world is scaled-to-fit so
 * the whole 2000×2000 stays visible on any screen size.
 */
export async function createGlimwormApp(
  canvasParent: HTMLDivElement,
  arena: Arena,
): Promise<GlimwormPixiApp> {
  const app = new Application();
  await app.init({
    resolution: window.devicePixelRatio || 1,
    antialias: true,
    backgroundAlpha: 1,
    backgroundColor: 0x0a0a1a,
    resizeTo: canvasParent,
    autoDensity: true,
  });

  canvasParent.appendChild(app.canvas);

  const arenaContainer = new Container();
  app.stage.addChild(arenaContainer);

  const bg = new Container();
  const food = new Container();
  const powerup = new Container();
  const worm = new Container();
  const fx = new Container();
  arenaContainer.addChild(bg, food, powerup, worm);
  // FX is screen-space — it lives directly on the stage so particle effects
  // are not affected by the arena scale.
  app.stage.addChild(fx);

  const layers: GlimwormPixiLayers = { bg, food, powerup, worm, fx };

  const fitToParent = () => {
    const w = canvasParent.clientWidth;
    const h = canvasParent.clientHeight;
    if (w <= 0 || h <= 0) return;
    const scale = Math.min(w / arena.width, h / arena.height);
    arenaContainer.scale.set(scale);
    arenaContainer.x = (w - arena.width * scale) / 2;
    arenaContainer.y = (h - arena.height * scale) / 2;
  };
  fitToParent();

  const ro = new ResizeObserver(fitToParent);
  ro.observe(canvasParent);

  const destroy = (): void => {
    ro.disconnect();
    app.destroy(true, { children: true });
  };

  return { app, layers, arenaContainer, destroy };
}
