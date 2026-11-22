'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';
import { FLOW_STEPS, type StepId } from './data/createFlow';
import type { TranslationKey } from '@/shared/i18n/useTranslation';

const STEP_TITLE_KEY: Record<StepId, TranslationKey> = {
  game: 'createRoom.steps.game.title',
  look: 'createRoom.steps.look.title',
  room: 'createRoom.steps.room.title',
};

interface Props {
  /** The room step is only "done" once the name is valid. */
  roomReady: boolean;
}

/**
 * Jump links for the three steps. Shows the whole flow at a glance so people
 * know how much is left and can skip straight to the part they care about.
 */
export function CreateProgress({ roomReady }: Props) {
  const { t } = useTranslation();
  return (
    <nav aria-label={t('createRoom.progress.label')}>
      <ol className={f.progress} data-testid="create-progress">
        {FLOW_STEPS.map((step, i) => {
          const done = step.id === 'room' ? roomReady : true;
          return (
            <li key={step.id}>
              <a
                className={f.progressLink}
                href={`#${step.anchor}`}
                data-testid={`progress-${step.id}`}
              >
                <span
                  className={`${f.progressNum} ${done ? f.progressNumDone : ''}`}
                  aria-hidden="true"
                >
                  {done ? '✓' : i + 1}
                </span>
                <span>{t(STEP_TITLE_KEY[step.id])}</span>
                {done ? (
                  <span className={s.srOnly}>
                    {t('createRoom.progress.done')}
                  </span>
                ) : null}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
