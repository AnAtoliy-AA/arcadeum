interface ScoreEntry {
  id: string;
  name: string;
  color?: string;
  score: number;
}

interface ScoreBoardProps {
  entries: ScoreEntry[];
  drawCount: number;
}

export function ScoreBoard({ entries, drawCount }: ScoreBoardProps) {
  return (
    <div
      className="flex flex-row items-stretch gap-3 py-2 px-3 rounded-2xl bg-[var(--backgroundHover)] self-center"
      data-testid="ttt-scoreboard"
    >
      {entries.map((entry) => (
        <div className="flex flex-col items-center min-w-[56px]" key={entry.id}>
          <span
            className="text-[14px]"
            style={{ color: entry.color ?? 'var(--color)' }}
          >
            {entry.name}
          </span>
          <span className="font-extrabold text-[20px]">{entry.score}</span>
        </div>
      ))}
      <div className="flex flex-col items-center min-w-[56px]">
        <span className="text-[14px] opacity-[0.7]">Draws</span>
        <span className="font-extrabold text-[20px]">{drawCount}</span>
      </div>
    </div>
  );
}
