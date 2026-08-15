'use client';

import React from 'react';
import { Button } from '@arcadeum/ui';

interface LobbyOptionSectionProps {
  title: string;
  children: React.ReactNode;
  hint?: string;
}

export function LobbyOptionSection({
  title,
  children,
  hint,
}: LobbyOptionSectionProps) {
  return (
    <div className="box-border flex flex-col items-stretch gap-2">
      <span className="box-border text-[14px] font-semibold uppercase tracking-[0.5px] text-[var(--textSecondary)]">
        {title}
      </span>
      {children}
      {hint && (
        <span className="box-border text-[12px] text-[rgba(180,180,200,0.7)] opacity-[0.7]">
          {hint}
        </span>
      )}
    </div>
  );
}

interface ChipOption {
  id: string;
  label: string;
  emoji?: string;
  description?: string;
  comingSoon?: boolean;
}

interface LobbyChipGroupProps {
  options: ChipOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  accentColor?: string;
  testIdPrefix?: string;
}

export function LobbyChipGroup({
  options,
  value,
  onChange,
  disabled = false,
  accentColor = '#6366f1',
  testIdPrefix = 'chip',
}: LobbyChipGroupProps) {
  return (
    <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
      {options.map((option) => {
        const isActive = value === option.id;
        const isDisabled = disabled || option.comingSoon;
        return (
          <Button
            className={`rounded-[10px] font-medium text-[13px] ${
              isActive
                ? `bg-[${accentColor}20] border-[${accentColor}80] text-[${accentColor}] hover:bg-[${accentColor}30]`
                : 'bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.10)] text-[#cbd5e1] hover:bg-[rgba(255,255,255,0.08)]'
            } ${
              option.comingSoon
                ? 'opacity-[0.4]'
                : disabled && !isActive
                  ? 'opacity-[0.5]'
                  : ''
            }`}
            key={option.id}
            variant="chip"
            size="sm"
            data-testid={`${testIdPrefix}-${option.id}`}
            data-active={isActive ? 'on' : undefined}
            disabled={isDisabled}
            onClick={() => !isDisabled && onChange(option.id)}
          >
            {option.emoji && (
              <span className="box-border -mr-2">{option.emoji}</span>
            )}
            {option.label}
            {option.comingSoon && (
              <span className="box-border -ml-2 text-[48px] opacity-[0.85]">
                Coming Soon
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}

interface LobbyToggleProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function LobbyToggle({
  label,
  checked,
  onCheckedChange,
  disabled = false,
  hint,
}: LobbyToggleProps) {
  return (
    <div className="box-border flex flex-col items-stretch gap-1">
      <div className="box-border flex flex-row items-center gap-3">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onCheckedChange(e.target.checked)}
          style={{
            width: 16,
            height: 16,
            accentColor: '#6366f1',
            cursor: disabled ? 'not-allowed' : 'pointer',
          }}
        />
        <span
          className="box-border text-[16px] font-medium"
          style={{ color: disabled ? 'rgba(180,180,200,0.7)' : '$color' }}
        >
          {label}
        </span>
      </div>
      {hint && (
        <span className="box-border text-[12px] text-[rgba(180,180,200,0.7)] opacity-[0.7]">
          {hint}
        </span>
      )}
    </div>
  );
}
