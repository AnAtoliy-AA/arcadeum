'use client';

import { useCallback, useRef, useState } from 'react';
import { Button } from '@arcadeum/ui';

interface EmbedCodeGeneratorProps {
  gameId: string;
  gameName: string;
}

const EMBED_SIZES = [
  { label: 'Small (300×300)', width: 300, height: 300 },
  { label: 'Medium (400×400)', width: 400, height: 400 },
  { label: 'Large (500×500)', width: 500, height: 500 },
] as const;

export function EmbedCodeGenerator({
  gameId,
  gameName,
}: EmbedCodeGeneratorProps) {
  const [selectedSize, setSelectedSize] = useState(1);
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const slug = gameId.replace(/_v\d+$/, '');
  const size = EMBED_SIZES[selectedSize];

  const embedUrl = `https://arcadeum.games/embed/${slug}?theme=dark`;
  const embedCode = `<iframe src="${embedUrl}" width="${size.width}" height="${size.height}" frameborder="0" allowfullscreen title="Play ${gameName} on Arcadeum Games"></iframe>`;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 3000);
    }
  }, [embedCode]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] p-4">
      <h3 className="text-sm font-bold">Embed this game</h3>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs text-[var(--textSecondary)]">Size</label>
        <div className="flex gap-1.5">
          {EMBED_SIZES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSelectedSize(i)}
              className={`rounded-lg px-2 py-1 text-xs font-medium transition-colors ${
                i === selectedSize
                  ? 'bg-[var(--color)] text-white'
                  : 'bg-[rgba(255,255,255,0.06)] text-[var(--textSecondary)] hover:bg-[rgba(255,255,255,0.1)]'
              }`}
            >
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      <div className="relative">
        <pre className="overflow-x-auto rounded-lg bg-[rgba(0,0,0,0.3)] p-2 text-[10px] leading-relaxed text-[rgba(255,255,255,0.7)]">
          {embedCode}
        </pre>
      </div>

      <Button
        variant="primary"
        size="sm"
        onClick={handleCopy}
        className="w-full"
      >
        {copied ? '✓ Copied!' : 'Copy Embed Code'}
      </Button>
    </div>
  );
}
