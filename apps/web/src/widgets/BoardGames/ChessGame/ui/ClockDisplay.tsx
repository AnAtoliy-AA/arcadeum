import { ClockContainer, ClockFace, ClockTime, ClockLabel } from './styles';

interface ClockDisplayProps {
  clocks: Record<string, { remainingSeconds: number } | null> | null;
  currentTurnColor: 'white' | 'black';
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function ClockDisplay({ clocks, currentTurnColor }: ClockDisplayProps) {
  if (!clocks) return null;

  return (
    <ClockContainer>
      {(['white', 'black'] as const).map((color) => {
        const clock = clocks[color];
        const isActive = currentTurnColor === color;
        const isLow = clock != null && clock.remainingSeconds <= 30;
        const isCritical = clock != null && clock.remainingSeconds <= 10;

        return (
          <ClockFace key={color} isActive={isActive}>
            <ClockTime isLow={isLow} isCritical={isCritical}>
              {clock ? formatTime(clock.remainingSeconds) : '--:--'}
            </ClockTime>
            <ClockLabel>{color === 'white' ? 'MAIN' : 'INCR'}</ClockLabel>
          </ClockFace>
        );
      })}
    </ClockContainer>
  );
}
