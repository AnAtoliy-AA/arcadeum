import React from 'react';
import styles from './ParticleOverlay.module.css';

interface ParticleOverlayProps {
  variant?: string;
}

export function ParticleOverlay({ variant }: ParticleOverlayProps) {
  if (variant === 'cyberpunk') {
    return (
      <div className={styles.overlay}>
        <div className={styles.scanline} />
      </div>
    );
  }

  if (variant === 'underwater') {
    const bubbles = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      left: `${8 + i * 9}%`,
      width: `${4 + (i % 4) * 3}px`,
      delay: `${(i * 0.7).toFixed(1)}s`,
      duration: `${5 + (i % 3)}s`,
    }));
    return (
      <div className={styles.overlay}>
        {bubbles.map((b) => (
          <span
            key={b.id}
            className={styles.bubble}
            style={{
              left: b.left,
              bottom: '-10px',
              width: b.width,
              height: b.width,
              animationDelay: b.delay,
              animationDuration: b.duration,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'crime') {
    const streaks = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: `${2 + i * 6.5}%`,
      height: `${40 + (i % 5) * 20}px`,
      delay: `${(i * 0.15).toFixed(2)}s`,
      duration: `${1.0 + (i % 4) * 0.2}s`,
    }));
    return (
      <div className={styles.overlay}>
        {streaks.map((s) => (
          <span
            key={s.id}
            className={styles.rainStreak}
            style={{
              left: s.left,
              height: s.height,
              top: '-20px',
              animationDelay: s.delay,
              animationDuration: s.duration,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'horror') {
    return (
      <div className={styles.overlay}>
        <div className={styles.vignette} />
      </div>
    );
  }

  if (variant === 'adventure') {
    const motes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: `${5 + i * 12}%`,
      top: `${20 + (i % 4) * 20}%`,
      size: `${3 + (i % 3)}px`,
      delay: `${(i * 0.6).toFixed(1)}s`,
      duration: `${3.5 + (i % 3) * 0.5}s`,
    }));
    return (
      <div className={styles.overlay}>
        {motes.map((m) => (
          <span
            key={m.id}
            className={styles.dustMote}
            style={{
              left: m.left,
              top: m.top,
              width: m.size,
              height: m.size,
              animationDelay: m.delay,
              animationDuration: m.duration,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === 'high-altitude-hike') {
    const flakes = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      left: `${3 + i * 8}%`,
      size: `${2 + (i % 3)}px`,
      delay: `${(i * 0.45).toFixed(2)}s`,
      duration: `${4 + (i % 4)}s`,
    }));
    return (
      <div className={styles.overlay}>
        {flakes.map((f) => (
          <span
            key={f.id}
            className={styles.snowFlake}
            style={{
              left: f.left,
              top: '-5px',
              width: f.size,
              height: f.size,
              animationDelay: f.delay,
              animationDuration: f.duration,
            }}
          />
        ))}
      </div>
    );
  }

  return null;
}
