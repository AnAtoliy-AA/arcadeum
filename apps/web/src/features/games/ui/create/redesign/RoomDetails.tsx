import s from './GameCreateView.module.scss';
import { GAMES, type GameId } from './data/themes';
import { NOTES_MAX, ROOM_NAME_MAX, type CreateRoomForm } from './data/form';

interface Labels {
  roomName: string;
  required: string;
  roomNamePlaceholder: string;
  maxPlayers: string;
  auto: string;
  upTo: (n: number) => string;
  visibility: string;
  visibilityPublic: string;
  visibilityUnlisted: string;
  visibilityPrivate: string;
  notes: string;
  notesShownTo: string;
  notesPlaceholder: string;
}

interface Props {
  gameId: GameId;
  form: CreateRoomForm;
  labels: Labels;
  onChange: (
    patch: Partial<
      Pick<
        CreateRoomForm,
        'roomName' | 'maxPlayers' | 'visibility' | 'notes' | 'preset'
      >
    >,
  ) => void;
}

export function RoomDetails({ gameId, form, labels, onChange }: Props) {
  const game = GAMES[gameId];

  function setMaxPlayers(next: CreateRoomForm['maxPlayers']) {
    onChange({ maxPlayers: next, preset: 'custom' });
  }

  function decrement() {
    if (form.maxPlayers === 'auto') {
      setMaxPlayers(Math.max(game.players.min, game.players.max - 1));
      return;
    }
    if (form.maxPlayers <= game.players.min) {
      setMaxPlayers('auto');
      return;
    }
    setMaxPlayers(form.maxPlayers - 1);
  }

  function increment() {
    if (form.maxPlayers === 'auto') {
      setMaxPlayers(game.players.min);
      return;
    }
    if (form.maxPlayers >= game.players.max) return;
    setMaxPlayers(form.maxPlayers + 1);
  }

  const incrementDisabled =
    form.maxPlayers !== 'auto' && form.maxPlayers >= game.players.max;

  return (
    <div className={s.details}>
      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="gc-room-name">
          <span>
            {labels.roomName}{' '}
            <span style={{ color: 'var(--gc-accent)', fontWeight: 600 }}>
              {labels.required}
            </span>
          </span>
          <span className={s.counter}>
            {form.roomName.length} / {ROOM_NAME_MAX}
          </span>
        </label>
        <input
          id="gc-room-name"
          type="text"
          className={s.input}
          value={form.roomName}
          maxLength={ROOM_NAME_MAX}
          placeholder={labels.roomNamePlaceholder}
          data-testid="room-name-input"
          onChange={(e) =>
            onChange({ roomName: e.target.value, preset: 'custom' })
          }
        />
      </div>

      <div className={s.detailsRow}>
        <div className={s.field}>
          <label className={s.fieldLabel}>
            <span>{labels.maxPlayers}</span>
          </label>
          <div className={s.stepperRow} data-testid="max-players-stepper">
            <button
              type="button"
              className={s.stepperBtn}
              aria-label="Decrease max players"
              data-testid="stepper-dec"
              onClick={decrement}
            >
              −
            </button>
            <div>
              <div className={s.stepperValue}>
                {form.maxPlayers === 'auto' ? labels.auto : form.maxPlayers}
              </div>
              <div className={s.stepperHint}>
                {labels.upTo(game.players.max)}
              </div>
            </div>
            <button
              type="button"
              className={s.stepperBtn}
              aria-label="Increase max players"
              data-testid="stepper-inc"
              onClick={increment}
              disabled={incrementDisabled}
            >
              +
            </button>
            {form.maxPlayers !== 'auto' && (
              <button
                type="button"
                className={s.stepperBtn}
                aria-label="Reset to Auto"
                data-testid="stepper-auto"
                onClick={() => setMaxPlayers('auto')}
                style={{ marginLeft: 4, fontSize: 11, padding: '4px 8px' }}
              >
                Auto
              </button>
            )}
          </div>
        </div>

        <div className={s.field}>
          <label className={s.fieldLabel}>
            <span>{labels.visibility}</span>
          </label>
          <div
            className={s.segmented}
            role="radiogroup"
            aria-label={labels.visibility}
            data-testid="visibility-segmented"
          >
            {(
              [
                ['public', labels.visibilityPublic],
                ['unlisted', labels.visibilityUnlisted],
                ['private', labels.visibilityPrivate],
              ] as const
            ).map(([key, label]) => {
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
        </div>
      </div>

      <div className={s.field}>
        <label className={s.fieldLabel} htmlFor="gc-notes">
          <span>{labels.notes}</span>
          <span className={s.counter}>{labels.notesShownTo}</span>
        </label>
        <textarea
          id="gc-notes"
          className={s.textarea}
          value={form.notes}
          maxLength={NOTES_MAX}
          placeholder={labels.notesPlaceholder}
          rows={3}
          data-testid="notes-input"
          onChange={(e) =>
            onChange({ notes: e.target.value, preset: 'custom' })
          }
        />
      </div>
    </div>
  );
}
