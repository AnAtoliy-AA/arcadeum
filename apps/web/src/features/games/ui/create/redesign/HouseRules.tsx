'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import type { TranslationKey } from '@/shared/i18n/useTranslation';
import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';
import type { GameId } from './data/themes';
import type { CreateRoomForm } from './data/form';
import { supportedRules, type RuleKey } from './data/createFlow';

const RULE_KEYS: Record<
  Exclude<RuleKey, 'spectators'>,
  { title: TranslationKey; desc: TranslationKey }
> = {
  combos: {
    title: 'createRoom.rules.combos.title',
    desc: 'createRoom.rules.combos.desc',
  },
  idle: {
    title: 'createRoom.rules.idle.title',
    desc: 'createRoom.rules.idle.desc',
  },
  teams: {
    title: 'createRoom.rules.teams.title',
    desc: 'createRoom.rules.teams.desc',
  },
};

const PACHISI_TEAMS_KEYS: { title: TranslationKey; desc: TranslationKey } = {
  title: 'createRoom.rules.teamsPachisi.title',
  desc: 'createRoom.rules.teamsPachisi.desc',
};

interface Props {
  gameId: GameId;
  value: CreateRoomForm['rules'];
  onChange: (rules: CreateRoomForm['rules']) => void;
  ruleComingSoon?: Map<string, boolean>;
}

/**
 * Only rules the server actually applies for this game are listed, so every
 * switch does something. Games without any show a short empty state.
 */
export function HouseRules({ gameId, value, onChange, ruleComingSoon }: Props) {
  const { t } = useTranslation();
  const ruleIds = supportedRules(gameId).filter(
    (k): k is Exclude<RuleKey, 'spectators'> => k !== 'spectators',
  );

  return (
    <div>
      <h3 className={f.subhead}>{t('createRoom.rules.title')}</h3>
      <p className={f.helper}>{t('createRoom.rules.why')}</p>
      {ruleIds.length === 0 ? (
        <p className={f.helper} data-testid="house-rules-empty">
          {t('createRoom.rules.none')}
        </p>
      ) : (
        <div className={s.rules} data-testid="house-rules">
          {ruleIds.map((key) => {
            const on = value[key];
            const soon = ruleComingSoon?.get(`${gameId}::${key}`) ?? false;
            // Pachisi teams are a fixed 2v2 setup, so they get their own copy.
            const keys =
              key === 'teams' && gameId === 'pachisi_v1'
                ? PACHISI_TEAMS_KEYS
                : RULE_KEYS[key];
            const title = t(keys.title);
            return (
              <div
                key={key}
                className={`${s.rule} ${soon ? s.ruleComingSoon : ''}`}
                data-testid={`rule-${key}`}
              >
                <div className={s.ruleHead}>
                  <div>
                    <h4 className={s.ruleTitle}>{title}</h4>
                    <p className={s.ruleDesc}>{t(keys.desc)}</p>
                  </div>
                  {soon ? (
                    <span className={s.comingSoonTag}>
                      {t('createRoom.rules.comingSoon')}
                    </span>
                  ) : (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={title}
                      data-testid={`rule-toggle-${key}`}
                      className={`${s.toggle} ${on ? s.toggleOn : ''}`}
                      onClick={() => onChange({ ...value, [key]: !on })}
                    >
                      <span className={s.toggleHandle} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
