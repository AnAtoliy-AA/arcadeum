import React, { useState, useEffect } from 'react';
import { cx } from '@arcadeum/ui/utils/cx';
import type { UseAutoplayReturn } from '../hooks/useAutoplay';

interface AutoplayControlsProps {
  t: (key: string, params?: Record<string, string | number>) => string;
  autoplayState: UseAutoplayReturn;
}

function Container({
  onClick,
  children,
}: {
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-stretch relative z-[50]"
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function Header({
  expanded,
  onClick,
  children,
}: {
  expanded?: boolean;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-2 cursor-pointer select-none rounded-2xl border border-[rgba(99,102,241,0.3)] px-3 py-2 hover:bg-[rgba(99,102,241,0.2)]',
        expanded ? 'bg-[rgba(99,102,241,0.2)]' : 'bg-[rgba(99,102,241,0.1)]',
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function HeaderText({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[16px] leading-[20px] font-semibold text-[rgba(255,255,255,0.95)]">
      {children}
    </span>
  );
}

function Toggle({ children }: { children?: React.ReactNode }) {
  return (
    <span className="text-[14px] leading-[18px] text-[rgba(255,255,255,0.7)]">
      {children}
    </span>
  );
}

function DropdownMenu({ children }: { children?: React.ReactNode }) {
  return (
    <div
      className="flex flex-col items-stretch absolute top-full right-0 mt-2 w-[280px] gap-1 overflow-hidden rounded-2xl border border-[rgba(99,102,241,0.3)] bg-[#1e1e2e] p-2"
      style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.2)' }}
    >
      {children}
    </div>
  );
}

function Label({
  secondary,
  style,
  onClick,
  children,
}: {
  secondary?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-center gap-3 cursor-pointer rounded-lg px-3 py-2 hover:bg-[rgba(255,255,255,0.05)]',
        secondary && 'pl-6 opacity-[0.9]',
      )}
      style={style}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

function ControlText({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <span
      className={`text-[16px] leading-[20px] font-medium text-[rgba(255,255,255,0.9)] ${className ?? ''}`}
    >
      {children}
    </span>
  );
}

interface CheckboxItemProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: string;
  secondary?: boolean;
  disabled?: boolean;
}

const CheckboxItem: React.FC<CheckboxItemProps> = ({
  checked,
  onCheckedChange,
  label,
  secondary,
  disabled,
}) => (
  <Label
    secondary={secondary}
    onClick={() => !disabled && onCheckedChange(!checked)}
    style={disabled ? { opacity: 0.5 } : undefined}
  >
    <input
      type="checkbox"
      id={label}
      checked={checked}
      onChange={(e) => onCheckedChange(e.target.checked)}
      disabled={disabled}
      aria-label={label}
      className="w-4 h-4 cursor-pointer accent-[#6366f1]"
    />
    <ControlText className="ml-2">{label}</ControlText>
  </Label>
);

export const AutoplayControls: React.FC<AutoplayControlsProps> = ({
  t,
  autoplayState,
}) => {
  const [expanded, setExpanded] = useState(false);

  const {
    allEnabled,
    autoDrawEnabled,
    autoSkipEnabled,
    autoShuffleAfterDefuseEnabled,
    autoDrawSkipAfterShuffleEnabled,
    autoNopeAttackEnabled,
    autoGiveFavorEnabled,
    autoDefuseEnabled,
    setAllEnabled,
    setAutoDrawEnabled,
    setAutoSkipEnabled,
    setAutoShuffleAfterDefuseEnabled,
    setAutoDrawSkipAfterShuffleEnabled,
    setAutoNopeAttackEnabled,
    setAutoGiveFavorEnabled,
    setAutoDefuseEnabled,
  } = autoplayState;

  useEffect(() => {
    const handleClickOutside = () => {
      if (expanded) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [expanded]);

  const handleContainerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Container onClick={handleContainerClick}>
      <Header onClick={() => setExpanded(!expanded)} expanded={expanded}>
        <HeaderText>{t('games.table.autoplay.title')}</HeaderText>
        <Toggle>{expanded ? '▲' : '▼'}</Toggle>
      </Header>
      {expanded && (
        <DropdownMenu>
          <CheckboxItem
            checked={allEnabled}
            onCheckedChange={setAllEnabled}
            label={t('games.table.autoplay.autoPlay')}
          />
          <CheckboxItem
            checked={autoDrawEnabled}
            onCheckedChange={setAutoDrawEnabled}
            label={t('games.table.autoplay.autoDraw')}
            secondary
          />
          <CheckboxItem
            checked={autoSkipEnabled}
            onCheckedChange={setAutoSkipEnabled}
            label={t('games.table.autoplay.autoSkip')}
            secondary
          />
          <CheckboxItem
            checked={autoShuffleAfterDefuseEnabled}
            onCheckedChange={setAutoShuffleAfterDefuseEnabled}
            label={t('games.table.autoplay.autoShuffle')}
            secondary
          />
          <CheckboxItem
            checked={autoDrawSkipAfterShuffleEnabled}
            onCheckedChange={setAutoDrawSkipAfterShuffleEnabled}
            label={t('games.table.autoplay.autoDrawSkipAfterShuffle')}
            secondary
            disabled={!autoShuffleAfterDefuseEnabled}
          />
          <CheckboxItem
            checked={autoNopeAttackEnabled}
            onCheckedChange={setAutoNopeAttackEnabled}
            label={t('games.table.autoplay.autoNopeAttack')}
            secondary
          />
          <CheckboxItem
            checked={autoGiveFavorEnabled}
            onCheckedChange={setAutoGiveFavorEnabled}
            label={t('games.table.autoplay.autoGiveFavor')}
            secondary
          />
          <CheckboxItem
            checked={autoDefuseEnabled}
            onCheckedChange={setAutoDefuseEnabled}
            label={t('games.table.autoplay.autoDefuse')}
            secondary
          />
        </DropdownMenu>
      )}
    </Container>
  );
};
