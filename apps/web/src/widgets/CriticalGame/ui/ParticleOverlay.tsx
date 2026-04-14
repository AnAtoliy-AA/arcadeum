import React, { useMemo } from 'react';
import styles from './ParticleOverlay.module.css';

interface ParticleOverlayProps {
  variant?: string;
}

/**
 * A simple deterministic pseudo-random function to satisfy React purity rules.
 * Math.random() is impure and cannot be called during render/useMemo.
 */
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function ParticleOverlay({ variant }: ParticleOverlayProps) {
  // Cyberpunk data
  const cyberpunkData = useMemo(() => {
    if (variant !== 'cyberpunk') return null;
    const bits = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: `${i * 5}%`,
      size: `${3 + (i % 4) * 2}px`,
      delay: `${(i * 0.4).toFixed(1)}s`,
      duration: `${3 + (i % 3)}s`,
    }));
    return { bits };
  }, [variant]);

  // Underwater data
  const underwaterData = useMemo(() => {
    if (variant !== 'underwater') return null;
    const bubbles = Array.from({ length: 15 }).map((_, i) => {
      const seed = i + 100;
      return {
        id: i,
        left: `${seededRandom(seed) * 100}%`,
        size: seededRandom(seed + 1) * 12 + 4,
        duration: `${seededRandom(seed + 2) * 4 + 4}s`,
        delay: `${seededRandom(seed + 3) * 5}s`,
      };
    });
    return { bubbles };
  }, [variant]);

  // Crime data
  const crimeData = useMemo(() => {
    if (variant !== 'crime') return null;
    const rain = Array.from({ length: 40 }).map((_, i) => {
      const seed = i + 200;
      return {
        id: i,
        left: `${seededRandom(seed) * 100}%`,
        height: seededRandom(seed + 1) * 40 + 20,
        duration: `${seededRandom(seed + 2) * 0.4 + 0.6}s`,
        delay: `${seededRandom(seed + 3) * 2}s`,
      };
    });
    return { rain };
  }, [variant]);

  // Horror data
  const horrorData = useMemo(() => {
    if (variant !== 'horror') return null;
    const mists = Array.from({ length: 3 }).map((_, i) => ({
      id: i,
      delay: `${i * 3}s`,
    }));
    return { mists };
  }, [variant]);

  // Adventure data
  const adventureData = useMemo(() => {
    if (variant !== 'adventure') return null;
    const motes = Array.from({ length: 25 }).map((_, i) => {
      const seed = i + 300;
      return {
        id: i,
        left: `${seededRandom(seed) * 100}%`,
        top: `${seededRandom(seed + 1) * 100}%`,
        size: seededRandom(seed + 2) * 4 + 2,
        duration: `${seededRandom(seed + 3) * 3 + 4}s`,
        delay: `${seededRandom(seed + 4) * 5}s`,
      };
    });
    const sparkles = Array.from({ length: 10 }).map((_, i) => {
      const seed = i + 400;
      return {
        id: i,
        left: `${seededRandom(seed) * 100}%`,
        top: `${seededRandom(seed + 1) * 100}%`,
        delay: `${seededRandom(seed + 2) * 3}s`,
      };
    });
    return { motes, sparkles };
  }, [variant]);

  // Hiking data
  const hikingData = useMemo(() => {
    if (variant !== 'high-altitude-hike') return null;
    const flakes = Array.from({ length: 40 }).map((_, i) => {
      const seed = i + 500;
      return {
        id: i,
        left: `${seededRandom(seed) * 100}%`,
        size: seededRandom(seed + 1) * 4 + 2,
        duration: `${seededRandom(seed + 2) * 3 + 4}s`,
        delay: `${seededRandom(seed + 3) * 5}s`,
      };
    });
    return { flakes };
  }, [variant]);

  if (variant === 'cyberpunk' && cyberpunkData) {
    return (
      <div className={styles.overlay}>
        <div
          className={styles.cyberpunkGrid}
          style={{ animation: 'gridMove 6s linear infinite' }}
        />
        <div
          className={styles.scanline}
          style={{
            animation:
              'scanlineFlicker 1.5s ease-in-out infinite, glitch 8s infinite',
          }}
        />
        {cyberpunkData.bits.map((bit) => (
          <div
            key={bit.id}
            className={styles.digitalBit}
            style={{
              left: bit.left,
              width: bit.size,
              height: bit.size,
              animation: `bitFloat ${bit.duration} linear infinite`,
              animationDelay: bit.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'underwater' && underwaterData) {
    return (
      <div className={styles.overlay}>
        <div
          className={styles.sunbeam}
          style={{ animation: 'sunbeamSway 8s ease-in-out infinite' }}
        />
        <div
          className={styles.sunbeam}
          style={{
            left: '60%',
            animation: 'sunbeamSway 8s ease-in-out infinite',
            animationDelay: '2s',
          }}
        />
        {underwaterData.bubbles.map((b) => (
          <div
            key={b.id}
            className={styles.bubble}
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animation: `bubbleRise ${b.duration} ease-in infinite`,
              animationDelay: b.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'crime' && crimeData) {
    return (
      <div className={styles.overlay}>
        <div
          className={styles.searchlight}
          style={{ animation: 'searchlight 12s ease-in-out infinite' }}
        />
        {crimeData.rain.map((r) => (
          <div
            key={r.id}
            className={styles.rainStreak}
            style={{
              left: r.left,
              height: r.height,
              animation: `rainFall ${r.duration} linear infinite`,
              animationDelay: r.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'horror' && horrorData) {
    return (
      <div className={styles.overlay}>
        <div
          className={styles.vignette}
          style={{ animation: 'vignetteFlicker 6s ease-in-out infinite' }}
        />
        {horrorData.mists.map((m) => (
          <div
            key={m.id}
            className={styles.mist}
            style={{
              opacity: 0,
              animation: 'mistMove 12s ease-in-out infinite',
              animationDelay: m.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'adventure' && adventureData) {
    return (
      <div className={styles.overlay}>
        {adventureData.motes.map((m) => (
          <div
            key={m.id}
            className={styles.dustMote}
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              animation: `dustFloat ${m.duration} ease-in-out infinite`,
              animationDelay: m.delay,
            }}
          />
        ))}
        {adventureData.sparkles.map((s) => (
          <div
            key={s.id}
            className={styles.sparkle}
            style={{
              left: s.left,
              top: s.top,
              animation: 'sparkleJump 1.5s ease-in-out infinite',
              animationDelay: s.delay,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'high-altitude-hike' && hikingData) {
    return (
      <div className={styles.overlay}>
        <div
          className={styles.frostFrame}
          style={{ animation: 'icePulse 4s ease-in-out infinite' }}
        />
        {hikingData.flakes.map((f) => (
          <div
            key={f.id}
            className={styles.snowFlake}
            style={{
              left: f.left,
              width: f.size,
              height: f.size,
              animation: `snowDrift ${f.duration} linear infinite`,
              animationDelay: f.delay,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
