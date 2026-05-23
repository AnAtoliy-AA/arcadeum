import s from './GameCreateView.module.css';
import { GAMES, type GameId } from './data/themes';
import type { CreateRoomForm } from './data/form';

type RuleKey = keyof CreateRoomForm['rules'];

interface RuleLabels {
  title: string;
  desc: string;
}

interface Props {
  gameId: GameId;
  value: CreateRoomForm['rules'];
  labels: Record<RuleKey, RuleLabels>;
  onChange: (rules: CreateRoomForm['rules']) => void;
}

export function HouseRules({ gameId, value, labels, onChange }: Props) {
  const game = GAMES[gameId];
  // Compose ordered list of visible rule keys for this game.
  const ruleIds: RuleKey[] = [];
  if (game.rules.includes('combos')) ruleIds.push('combos');
  ruleIds.push('idle');
  if (game.rules.includes('teams')) ruleIds.push('teams');
  ruleIds.push('spectators');

  function toggle(key: RuleKey) {
    onChange({ ...value, [key]: !value[key] });
  }

  return (
    <div className={s.rules} data-testid="house-rules">
      {ruleIds.map((key) => {
        const on = value[key];
        return (
          <div key={key} className={s.rule}>
            <div className={s.ruleHead}>
              <div>
                <h3 className={s.ruleTitle}>{labels[key].title}</h3>
                <p className={s.ruleDesc}>{labels[key].desc}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={labels[key].title}
                data-testid={`rule-toggle-${key}`}
                className={`${s.toggle} ${on ? s.toggleOn : ''}`}
                onClick={() => toggle(key)}
              >
                <span className={s.toggleHandle} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
