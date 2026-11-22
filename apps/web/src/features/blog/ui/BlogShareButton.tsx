'use client';

import { useState } from 'react';

interface BlogShareButtonProps {
  title: string;
}

export function BlogShareButton({ title }: BlogShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';

    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => undefined);
      return;
    }

    await navigator.clipboard.writeText(url).catch(() => undefined);
    setCopied(true);
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="flex items-center gap-2 text-sm text-[var(--colorMuted)] hover:text-white transition-colors px-3 py-1.5 rounded-xl border border-[var(--borderColor)] hover:border-[var(--primary)] bg-[var(--glassBg)] backdrop-blur-sm"
      aria-label="Share this article"
    >
      {copied ? (
        <>
          <span aria-hidden>✓</span>
          <span>Copied!</span>
        </>
      ) : (
        <>
          <span aria-hidden>↗</span>
          <span>Share</span>
        </>
      )}
    </button>
  );
}
