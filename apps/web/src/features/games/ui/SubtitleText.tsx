'use client';

import { useCallback, useState } from 'react';

/**
 * Room-name subtitle that truncates with ellipsis by default. On tap/click
 * it expands to show the full name in a floating badge; a second tap collapses it.
 */
export function SubtitleText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => setExpanded((v) => !v), []);

  if (expanded) {
    return (
      <div
        onClick={toggle}
        style={{
          position: 'absolute',
          zIndex: 50,
          background: 'rgba(7,10,17,0.95)',
          borderRadius: 6,
          padding: '2px 6px',
          fontSize: 11,
          opacity: 0.9,
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          top: '100%',
          left: 0,
          marginTop: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        }}
      >
        {text}
      </div>
    );
  }

  return (
    <div
      onClick={toggle}
      title={text}
      style={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        minWidth: 0,
        cursor: 'pointer',
        fontSize: 11,
        opacity: 0.45,
        lineHeight: '16px',
        position: 'relative',
      }}
    >
      {text}
    </div>
  );
}
