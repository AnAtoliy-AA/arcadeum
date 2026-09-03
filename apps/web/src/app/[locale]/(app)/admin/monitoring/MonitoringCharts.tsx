'use client';

import { useEffect, useRef } from 'react';

const MAX_HISTORY = 60;

export function Sparkline({
  data,
  color,
  max,
}: {
  data: number[];
  color: string;
  max?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    const step = w / (MAX_HISTORY - 1);
    const dataMax = max ?? Math.max(...data, 1);

    ctx.clearRect(0, 0, w, h);

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    for (let i = 0; i < data.length; i++) {
      const x = i * step;
      const y = h - (data[i] / dataMax) * h;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    const gradient = ctx.createLinearGradient(0, 0, 0, h);
    gradient.addColorStop(0, color + '40');
    gradient.addColorStop(1, color + '05');

    ctx.lineTo((data.length - 1) * step, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [data, color, max]);

  return (
    <canvas ref={canvasRef} width={200} height={40} className="h-10 w-full" />
  );
}

export function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span
      className={`inline-block h-2.5 w-2.5 rounded-full ${ok ? 'bg-[var(--success)]' : 'bg-red-500'}`}
    />
  );
}
