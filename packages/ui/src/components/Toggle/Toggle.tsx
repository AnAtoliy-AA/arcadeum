'use client';

import { memo } from 'react';

export interface ToggleProps {
  checked: boolean;
  onCheckedChange: (next: boolean) => void;
  ariaLabel: string;
  testId?: string;
  disabled?: boolean;
  /** Text inside the track when the toggle is on. Defaults to "ON". */
  onLabel?: string;
  /** Text inside the track when the toggle is off. Defaults to "OFF". */
  offLabel?: string;
}

export const Toggle = memo(function Toggle({
  checked,
  onCheckedChange,
  ariaLabel,
  testId,
  disabled = false,
  onLabel = 'ON',
  offLabel = 'OFF',
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      data-testid={testId}
      onClick={() => onCheckedChange(!checked)}
      style={{
        position: 'relative',
        width: 60,
        height: 30,
        borderRadius: 999,
        border: '1px solid',
        borderColor: checked ? '#3b82f6' : 'rgba(148,163,184,0.4)',
        backgroundColor: checked ? '#2563eb' : 'rgba(15,23,42,0.6)',
        padding: 0,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 120ms ease, border-color 120ms ease',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: checked ? 'flex-end' : 'flex-start',
        boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.2)',
      }}
    >
      <span
        aria-hidden
        style={{
          position: 'absolute',
          left: 8,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1,
          color: checked ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0)',
          pointerEvents: 'none',
        }}
      >
        {onLabel}
      </span>
      <span
        aria-hidden
        style={{
          position: 'absolute',
          right: 8,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: 1,
          color: checked ? 'rgba(0,0,0,0)' : 'rgba(203,213,225,0.85)',
          pointerEvents: 'none',
        }}
      >
        {offLabel}
      </span>
      <span
        style={{
          width: 24,
          height: 24,
          margin: 2,
          borderRadius: '50%',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.5)',
          transition: 'transform 120ms ease',
        }}
      />
    </button>
  );
});
