import { useTranslation } from '@/shared/lib/useTranslation';
import { GameCreationConfigProps } from '@/features/games/types';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Button } from '@arcadeum/ui/components/Button/Button';

interface TicTacToeOptions {
  variant?: string;
  boardSize?: number | string;
  teamMode?: boolean;
  expansionMargin?: number;
  infinityWinLength?: number;
}

const BOARD_SIZES = [
  { value: 3, label: '3×3', winLength: 3 },
  { value: 5, label: '5×5', winLength: 4 },
  { value: 7, label: '7×7', winLength: 5 },
  { value: 9, label: '9×9', winLength: 5 },
  { value: 'infinity', label: '∞ Infinity', winLength: 5 },
] as const;

const MARGIN_OPTIONS = [1, 2, 3] as const;
const WIN_LENGTH_OPTIONS = [4, 5] as const;

export default function TicTacToeCreationConfig({
  options,
  onChange,
}: GameCreationConfigProps<TicTacToeOptions>) {
  const { t } = useTranslation();

  const handleUpdate = (updates: Partial<TicTacToeOptions>) => {
    onChange({ ...options, ...updates });
  };

  const isInfinity = options.boardSize === 'infinity';

  return (
    <Section title={t('games.create.sectionHouseRules')}>
      <div className="box-border flex flex-col items-stretch gap-3">
        <div className="box-border flex flex-col items-stretch gap-1">
          <span className="box-border text-[18px] font-semibold">
            {t('games.create.tttBoardSize')}
          </span>
          <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
            {BOARD_SIZES.map((bs) => (
              <Button
                key={bs.value}
                variant="secondary"
                size="sm"
                active={(options.boardSize ?? 3) === bs.value}
                onClick={() => handleUpdate({ boardSize: bs.value })}
                data-testid={`board-size-${bs.value}`}
              >
                {bs.label}
              </Button>
            ))}
          </div>
        </div>

        {isInfinity && (
          <div className="box-border flex flex-col items-stretch gap-3 p-3 bg-[rgba(99,102,241,0.08)] rounded-[10px]">
            <div className="box-border flex flex-col items-stretch gap-1">
              <span className="box-border text-[16px] font-semibold">
                {t('games.tic_tac_toe_v1.lobby.expansionMargin')}
              </span>
              <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
                {MARGIN_OPTIONS.map((margin) => (
                  <Button
                    key={margin}
                    variant="secondary"
                    size="sm"
                    active={(options.expansionMargin ?? 3) === margin}
                    onClick={() => handleUpdate({ expansionMargin: margin })}
                    data-testid={`expansion-margin-${margin}`}
                  >
                    {margin}
                  </Button>
                ))}
              </div>
            </div>

            <div className="box-border flex flex-col items-stretch gap-1">
              <span className="box-border text-[16px] font-semibold">
                {t('games.tic_tac_toe_v1.lobby.winCondition')}
              </span>
              <div className="box-border flex flex-row items-stretch gap-2 flex-wrap">
                {WIN_LENGTH_OPTIONS.map((winLen) => (
                  <Button
                    key={winLen}
                    variant="secondary"
                    size="sm"
                    active={(options.infinityWinLength ?? 5) === winLen}
                    onClick={() => handleUpdate({ infinityWinLength: winLen })}
                    data-testid={`infinity-win-length-${winLen}`}
                  >
                    {t('games.tic_tac_toe_v1.lobby.inARow', {
                      n: String(winLen),
                    })}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
