'use client';

import { useTranslation } from '@/shared/i18n/useTranslation';
import s from './GameCreateView.module.scss';
import f from './CreateFlow.module.scss';
import { GAMES, type GameId } from './data/themes';
import {
  ROOM_NAME_MAX,
  type CreateRoomForm,
  type Visibility,
} from './data/form';
import type { RoomNameError } from './data/createFlow';

export type RoomDetailsPatch = Partial<
  Pick<
    CreateRoomForm,
    | 'roomName'
    | 'maxPlayers'
    | 'visibility'
    | 'notes'
    | 'password'
    | 'preset'
    | 'ranked'
  >
>;

interface Props {
  gameId: GameId;
  form: CreateRoomForm;
  /** Validation error to show under the name field (null when fine). */
  nameError: RoomNameError;
  onNameBlur: () => void;
  onChange: (patch: RoomDetailsPatch) => void;
}

/**
 * The essentials of a room: its name, who can join and how many can play.
 * Every field carries a short helper line so nobody has to guess what it does.
 */
export function RoomDetails({
  gameId,
  form,
  nameError,
  onNameBlur,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const { players } = GAMES[gameId];
  const fixed = players.min === players.max;

  function setMaxPlayers(next: CreateRoomForm['maxPlayers']) {
    onChange({ maxPlayers: next, preset: 'custom' });
  }

  function decrement() {
    if (form.maxPlayers === 'auto') {
      setMaxPlayers(Math.max(players.min, players.max - 1));
    } else if (form.maxPlayers <= players.min) {
      setMaxPlayers('auto');
    } else {
      setMaxPlayers(form.maxPlayers - 1);
    }
  }

  function increment() {
    if (form.maxPlayers === 'auto') setMaxPlayers(players.min);
    else if (form.maxPlayers < players.max) setMaxPlayers(form.maxPlayers + 1);
  }

  const incrementDisabled =
    form.maxPlayers !== 'auto' && form.maxPlayers >= players.max;

  const visibilityOptions: Array<[Visibility, string]> = [
    ['public', t('createRoom.details.visibilityPublic')],
    ['unlisted', t('createRoom.details.visibilityUnlisted')],
    ['private', t('createRoom.details.visibilityPrivate')],
  ];
  const visibilityHelp: Record<Visibility, string> = {
    public: t('createRoom.details.visibilityHelp.public'),
    unlisted: t('createRoom.details.visibilityHelp.unlisted'),
    private: t('createRoom.details.visibilityHelp.private'),
  };

  const errorText =
    nameError === 'required'
      ? t('createRoom.details.errorRequired')
      : nameError === 'tooLong'
        ? t('createRoom.details.errorTooLong', { max: ROOM_NAME_MAX })
        : null;

  return (
    <div className={s.details}>
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="gc-room-name">
          <span>
            {t('createRoom.details.roomName')}{' '}
            <span className={s.requiredStar}>
              ({t('createRoom.details.required')})
            </span>
          </span>
          <span className={s.counter}>
            {form.roomName.length} / {ROOM_NAME_MAX}
          </span>
        </label>
        <input
          id="gc-room-name"
          type="text"
          className={`${s.input} ${errorText ? f.inputInvalid : ''}`}
          value={form.roomName}
          maxLength={ROOM_NAME_MAX}
          placeholder={t('createRoom.details.roomNamePlaceholder')}
          aria-invalid={errorText ? true : undefined}
          aria-describedby="gc-room-name-help"
          data-testid="room-name-input"
          onBlur={onNameBlur}
          onChange={(e) =>
            onChange({ roomName: e.target.value, preset: 'custom' })
          }
        />
        {errorText ? (
          <p
            id="gc-room-name-help"
            className={f.fieldError}
            role="alert"
            data-testid="room-name-error"
          >
            {errorText}
          </p>
        ) : (
          <p id="gc-room-name-help" className={f.helper}>
            {t('createRoom.details.roomNameHelp')}
          </p>
        )}
      </div>

      <div className={s.detailsRow}>
        <div className={s.field}>
          <div className={s.fieldLabel} id="gc-players-label">
            <span>{t('createRoom.details.players')}</span>
          </div>
          {fixed ? (
            <p className={f.helper} data-testid="players-fixed">
              {t('createRoom.details.fixedPlayers', { n: players.max })}
            </p>
          ) : (
            <>
              <div
                className={s.stepperRow}
                role="group"
                aria-labelledby="gc-players-label"
                data-testid="max-players-stepper"
              >
                <button
                  type="button"
                  className={s.stepperBtn}
                  aria-label={t('createRoom.details.decrease')}
                  data-testid="stepper-dec"
                  onClick={decrement}
                >
                  −
                </button>
                <div>
                  <div className={s.stepperValue}>
                    {form.maxPlayers === 'auto'
                      ? t('createRoom.details.auto')
                      : form.maxPlayers}
                  </div>
                  <div className={s.stepperHint}>
                    {t('createRoom.details.upTo', { n: players.max })}
                  </div>
                </div>
                <button
                  type="button"
                  className={s.stepperBtn}
                  aria-label={t('createRoom.details.increase')}
                  data-testid="stepper-inc"
                  onClick={increment}
                  disabled={incrementDisabled}
                >
                  +
                </button>
                {form.maxPlayers !== 'auto' && (
                  <button
                    className={`${s.stepperBtn} ${s.stepperAutoBtn}`}
                    type="button"
                    aria-label={t('createRoom.details.resetAuto')}
                    data-testid="stepper-auto"
                    onClick={() => setMaxPlayers('auto')}
                  >
                    {t('createRoom.details.auto')}
                  </button>
                )}
              </div>
              <p className={f.helper}>
                {t('createRoom.details.playersHelp', {
                  min: players.min,
                  max: players.max,
                })}
              </p>
            </>
          )}
        </div>

        <div className={s.field}>
          <div className={s.fieldLabel} id="gc-visibility-label">
            <span>{t('createRoom.details.visibility')}</span>
          </div>
          <div
            className={s.segmented}
            role="radiogroup"
            aria-labelledby="gc-visibility-label"
            data-testid="visibility-segmented"
          >
            {visibilityOptions.map(([key, label]) => {
              const active = form.visibility === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  data-testid={`visibility-${key}`}
                  className={`${s.segmentedBtn} ${active ? s.segmentedBtnActive : ''}`}
                  onClick={() =>
                    onChange({ visibility: key, preset: 'custom' })
                  }
                >
                  {label}
                </button>
              );
            })}
          </div>
          <p className={f.helper} data-testid="visibility-help">
            {visibilityHelp[form.visibility]}
          </p>
        </div>
      </div>
    </div>
  );
}
