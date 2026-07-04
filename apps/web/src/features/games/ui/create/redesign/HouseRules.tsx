import s from './GameCreateView.module.scss';
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
  ruleComingSoon?: Map<string, boolean>;
}

export function HouseRules({
  gameId,
  value,
  labels,
  onChange,
  ruleComingSoon,
}: Props) {
  const game = GAMES[gameId];
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
        const isComingSoon = ruleComingSoon?.get(`${gameId}::${key}`) ?? false;
        return (
          <div
            key={key}
            className={`${s.rule} ${isComingSoon ? s.ruleComingSoon : ''}`}
            data-testid={`rule-${key}`}
          >
            <div className={s.ruleHead}>
              <div>
                <h3 className={s.ruleTitle}>
                  {labels[key].title}
                  {isComingSoon && (
                    <span className={s.comingSoonBadge}>Coming Soon</span>
                  )}
                </h3>
                <p className={s.ruleDesc}>{labels[key].desc}</p>
              </div>
              {isComingSoon ? (
                <span className={s.comingSoonTag}>Coming Soon</span>
              ) : (
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
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
