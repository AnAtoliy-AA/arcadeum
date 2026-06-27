'use client';

import { useCallback, useEffect, useRef } from 'react';
import { XStack } from 'tamagui';

export const PlaylistIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 6h18v2H3V6Zm0 4h12v2H3v-2Zm0 4h18v2H3v-2Zm0 4h12v2H3v-2Z" />
  </svg>
);

export const MinimizeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2Z" />
  </svg>
);

export const MaximizeIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V5h14v14ZM11 7h2v4h4v2h-4v4h-2v-4H7v-2h4V7Z" />
  </svg>
);

export const PlayingBars = () => (
  <XStack alignItems="flex-end" gap={1.5} height={12} marginLeft={4}>
    <span className="playing-bar playing-bar-1" />
    <span className="playing-bar playing-bar-2" />
    <span className="playing-bar playing-bar-3" />
  </XStack>
);

export const EqualizerVisualization = ({
  isPlaying,
  audioRef,
}: {
  isPlaying: boolean;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const audio = audioRef.current;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const barWidth = 2.5;
    const gap = 2;
    const barsCount = 5;
    const totalWidth = barsCount * barWidth + (barsCount - 1) * gap;
    const startX = (w - totalWidth) / 2;

    for (let i = 0; i < barsCount; i++) {
      let barH = 3;
      if (isPlaying && audio && !audio.paused) {
        const base = Math.sin(Date.now() / (180 + i * 45)) * 0.5 + 0.5;
        const freq = audio.currentTime * (2.5 + i * 0.6);
        const wave = Math.sin(freq) * 0.35 + 0.5;
        barH = Math.max(
          3,
          Math.min(h - 2, (base * 0.35 + wave * 0.65) * audio.volume * h),
        );
      }
      const x = startX + i * (barWidth + gap);
      const y = h - barH;
      const gradient = ctx.createLinearGradient(x, h, x, y);
      gradient.addColorStop(0, 'rgba(129,140,248,0.9)');
      gradient.addColorStop(1, 'rgba(165,180,252,0.9)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.roundRect(x, y, barWidth, barH, 1.5);
      ctx.fill();
    }
  }, [isPlaying, audioRef]);

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      draw();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={28}
      height={20}
      style={{ display: 'block' }}
      aria-hidden="true"
    />
  );
};
