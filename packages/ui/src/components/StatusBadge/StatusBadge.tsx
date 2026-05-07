'use client';

import { memo } from 'react';

export interface StatusBadgeProps {
  active: boolean;
  /** Text shown when active. Defaults to "ON". */
  onLabel?: string;
  /** Text shown when inactive. Defaults to "OFF". */
  offLabel?: string;
  testId?: string;
}

export const StatusBadge = memo(function StatusBadge({
  active,
  onLabel = 'ON',
  offLabel = 'OFF',
  testId,
}: StatusBadgeProps) {
  return (
    <span
      data-testid={testId}
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: 1,
        textTransform: 'uppercase',
        padding: '4px 10px',
        borderRadius: 999,
        border: '1px solid',
        borderColor: active ? '#3b82f6' : 'rgba(148,163,184,0.4)',
        backgroundColor: active ? 'rgba(37,99,235,0.18)' : 'rgba(15,23,42,0.6)',
        color: active ? '#93c5fd' : 'rgba(203,213,225,0.85)',
      }}
    >
      {active ? onLabel : offLabel}
    </span>
  );
});
