'use client';

import { useScenePalette } from './ScenePaletteContext';
import {
  SceneShell,
  SceneGridFloor,
  SceneHorizon,
  SceneBacklight,
  SceneScanlines,
  SceneVignette,
  SceneParticles,
  makeGridFloorStyle,
  makeHorizonStyle,
  makeBacklightStyle,
  makeScanlinesStyle,
  makeVignetteStyle,
  makeAmbientGlowStyle,
  makeBackgroundImageStyle,
  SCENE_LAYER_TESTIDS,
  SceneAmbientGlow,
  SceneBackgroundImage,
} from './styles/scene';

const PARTICLE_LAYOUT = [
  { top: '12%', left: '8%', size: 4 },
  { top: '22%', left: '76%', size: 3 },
  { top: '35%', left: '24%', size: 5 },
  { top: '52%', left: '88%', size: 2 },
  { top: '70%', left: '14%', size: 4 },
  { top: '82%', left: '62%', size: 3 },
];

export function SceneBackdrop() {
  const p = useScenePalette();
  return (
    <SceneShell
      data-testid={SCENE_LAYER_TESTIDS.backdrop}
      style={{ background: p.sceneBgGradient }}
    >
      <SceneAmbientGlow
        data-testid={SCENE_LAYER_TESTIDS.ambientGlow}
        style={makeAmbientGlowStyle(p.ambientGlowColorA, p.ambientGlowColorB)}
      />
      {p.sceneBackgroundImage && (
        <SceneBackgroundImage
          data-testid={SCENE_LAYER_TESTIDS.backgroundImage}
          style={makeBackgroundImageStyle(p.sceneBackgroundImage)}
        />
      )}
      <SceneGridFloor
        data-testid={SCENE_LAYER_TESTIDS.gridFloor}
        style={makeGridFloorStyle(p.gridLineColorA, p.gridLineColorB)}
      />
      <SceneHorizon
        data-testid={SCENE_LAYER_TESTIDS.horizon}
        style={makeHorizonStyle(p.horizonGradient)}
      />
      <SceneBacklight
        data-testid={SCENE_LAYER_TESTIDS.backlight}
        style={makeBacklightStyle(p.backlightColor)}
      />
      <SceneScanlines
        data-testid={SCENE_LAYER_TESTIDS.scanlines}
        style={makeScanlinesStyle()}
      />
      <SceneVignette
        data-testid={SCENE_LAYER_TESTIDS.vignette}
        style={makeVignetteStyle(p.vignetteColor)}
      />
      <SceneParticles data-testid={SCENE_LAYER_TESTIDS.particles}>
        {PARTICLE_LAYOUT.map((dot, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              top: dot.top,
              left: dot.left,
              width: dot.size,
              height: dot.size,
              borderRadius: '50%',
              background: p.particleColors[i % p.particleColors.length],
              boxShadow: `0 0 ${dot.size * 4}px ${
                p.particleColors[i % p.particleColors.length]
              }`,
            }}
          />
        ))}
      </SceneParticles>
    </SceneShell>
  );
}
