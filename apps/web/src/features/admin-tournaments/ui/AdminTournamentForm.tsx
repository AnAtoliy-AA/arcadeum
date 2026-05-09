'use client';
import { useMemo, useState } from 'react';
import { Button, YStack, XStack } from '@arcadeum/ui';
import { Text } from 'tamagui';
import {
  TOURNAMENT_GAME_TYPES,
  TOURNAMENT_LOCALES,
  type AdminTournamentItem,
  type CreateTournamentBody,
  type TournamentGameType,
  type TournamentLocale,
  type TournamentLocaleContent,
} from '../api';

export interface AdminTournamentFormLabels {
  sections: { settings: string; content: string };
  gameType: string;
  gameTypeLabels: Record<TournamentGameType, string>;
  scheduledAt: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  optional: string;
  maxPlayers: string;
  prizeDescription: string;
  tabs: Record<TournamentLocale, string>;
  name: string;
  description: string;
  errors: { nameRequired: string; capacityRange: string; windowOrder: string };
  cancel: string;
  save: string;
}

export interface AdminTournamentFormProps {
  initial?: AdminTournamentItem | null;
  isSubmitting?: boolean;
  onSubmit: (body: CreateTournamentBody) => void;
  onCancel: () => void;
  labels: AdminTournamentFormLabels;
}

interface FormState {
  gameType: TournamentGameType;
  scheduledAt: string;
  registrationOpensAt: string;
  registrationClosesAt: string;
  maxPlayers: string;
  prizeDescription: string;
  content: Record<TournamentLocale, TournamentLocaleContent>;
  activeLocale: TournamentLocale;
}

const emptyLocale = (): TournamentLocaleContent => ({
  name: '',
  description: '',
});

function toFormState(initial: AdminTournamentItem | null): FormState {
  const content: Record<TournamentLocale, TournamentLocaleContent> = {
    en: emptyLocale(),
    ru: emptyLocale(),
    es: emptyLocale(),
    fr: emptyLocale(),
    by: emptyLocale(),
  };
  if (initial) {
    for (const loc of TOURNAMENT_LOCALES) {
      const c = initial.content[loc];
      if (c) {
        content[loc] = { name: c.name, description: c.description ?? '' };
      }
    }
  }
  return {
    gameType: initial?.gameType ?? 'critical_v1',
    scheduledAt: initial?.scheduledAt ? initial.scheduledAt.slice(0, 16) : '',
    registrationOpensAt: initial?.registrationOpensAt
      ? initial.registrationOpensAt.slice(0, 16)
      : '',
    registrationClosesAt: initial?.registrationClosesAt
      ? initial.registrationClosesAt.slice(0, 16)
      : '',
    maxPlayers: String(initial?.maxPlayers ?? 16),
    prizeDescription: initial?.prizeDescription ?? '',
    content,
    activeLocale: 'en',
  };
}

function toBody(s: FormState): CreateTournamentBody {
  const content = TOURNAMENT_LOCALES.reduce(
    (acc, loc) => {
      const c = s.content[loc];
      if (c.name.trim()) {
        const out: TournamentLocaleContent = { name: c.name.trim() };
        if (c.description?.trim()) out.description = c.description.trim();
        acc[loc] = out;
      }
      return acc;
    },
    {} as Record<string, TournamentLocaleContent>,
  );
  return {
    gameType: s.gameType,
    scheduledAt: s.scheduledAt
      ? new Date(s.scheduledAt).toISOString()
      : new Date().toISOString(),
    registrationOpensAt: s.registrationOpensAt
      ? new Date(s.registrationOpensAt).toISOString()
      : null,
    registrationClosesAt: s.registrationClosesAt
      ? new Date(s.registrationClosesAt).toISOString()
      : null,
    maxPlayers: parseInt(s.maxPlayers, 10) || 16,
    prizeDescription: s.prizeDescription.trim()
      ? s.prizeDescription.trim()
      : null,
    content: content as CreateTournamentBody['content'],
  };
}

function validate(s: FormState, labels: AdminTournamentFormLabels): string[] {
  const errors: string[] = [];
  if (!s.content.en.name.trim()) errors.push(labels.errors.nameRequired);
  const cap = parseInt(s.maxPlayers, 10);
  if (Number.isNaN(cap) || cap < 2 || cap > 256)
    errors.push(labels.errors.capacityRange);
  if (s.registrationOpensAt && s.registrationClosesAt) {
    const opens = new Date(s.registrationOpensAt).getTime();
    const closes = new Date(s.registrationClosesAt).getTime();
    if (Number.isFinite(opens) && Number.isFinite(closes) && closes <= opens)
      errors.push(labels.errors.windowOrder);
  }
  return errors;
}

const INPUT_STYLE = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #555',
  background: 'transparent',
  color: 'inherit' as const,
  width: '100%',
};

export function AdminTournamentForm({
  initial,
  isSubmitting,
  onSubmit,
  onCancel,
  labels,
}: AdminTournamentFormProps) {
  const [state, setState] = useState<FormState>(() =>
    toFormState(initial ?? null),
  );
  const errors = useMemo(() => validate(state, labels), [state, labels]);
  const canSubmit = errors.length === 0 && !isSubmitting;

  const updateLocale = (
    loc: TournamentLocale,
    field: keyof TournamentLocaleContent,
    value: string,
  ) => {
    setState((prev) => ({
      ...prev,
      content: {
        ...prev.content,
        [loc]: { ...prev.content[loc], [field]: value },
      },
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(toBody(state));
  };

  const active = state.content[state.activeLocale];

  return (
    <YStack
      gap="$3"
      padding="$3"
      borderRadius="$4"
      borderWidth={1}
      borderColor="$borderColor"
      backgroundColor="$background"
      maxWidth={720}
      data-testid="tournament-form"
    >
      <Text fontWeight="700" fontSize="$5">
        {labels.sections.settings}
      </Text>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Text>{labels.gameType}</Text>
        <select
          data-testid="form-gameType"
          value={state.gameType}
          onChange={(e) =>
            setState((s) => ({
              ...s,
              gameType: e.target.value as TournamentGameType,
            }))
          }
          style={{ ...INPUT_STYLE, width: 'auto' }}
        >
          {TOURNAMENT_GAME_TYPES.map((g) => (
            <option key={g} value={g}>
              {labels.gameTypeLabels[g]}
            </option>
          ))}
        </select>

        <Text>{labels.maxPlayers}</Text>
        <input
          type="number"
          data-testid="form-maxPlayers"
          min={2}
          max={256}
          value={state.maxPlayers}
          onChange={(e) =>
            setState((s) => ({ ...s, maxPlayers: e.target.value }))
          }
          style={{ ...INPUT_STYLE, width: 100 }}
        />
      </XStack>

      <XStack gap="$3" flexWrap="wrap">
        <YStack>
          <Text fontSize="$1" opacity={0.7}>
            {labels.scheduledAt}
          </Text>
          <input
            type="datetime-local"
            data-testid="form-scheduledAt"
            value={state.scheduledAt}
            onChange={(e) =>
              setState((s) => ({ ...s, scheduledAt: e.target.value }))
            }
            style={INPUT_STYLE}
          />
        </YStack>
        <YStack>
          <Text fontSize="$1" opacity={0.7}>
            {labels.registrationOpensAt} ({labels.optional})
          </Text>
          <input
            type="datetime-local"
            data-testid="form-registrationOpensAt"
            value={state.registrationOpensAt}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                registrationOpensAt: e.target.value,
              }))
            }
            style={INPUT_STYLE}
          />
        </YStack>
        <YStack>
          <Text fontSize="$1" opacity={0.7}>
            {labels.registrationClosesAt} ({labels.optional})
          </Text>
          <input
            type="datetime-local"
            data-testid="form-registrationClosesAt"
            value={state.registrationClosesAt}
            onChange={(e) =>
              setState((s) => ({
                ...s,
                registrationClosesAt: e.target.value,
              }))
            }
            style={INPUT_STYLE}
          />
        </YStack>
      </XStack>

      <YStack gap="$2">
        <Text fontSize="$1" opacity={0.7}>
          {labels.prizeDescription} ({labels.optional})
        </Text>
        <textarea
          data-testid="form-prizeDescription"
          value={state.prizeDescription}
          onChange={(e) =>
            setState((s) => ({ ...s, prizeDescription: e.target.value }))
          }
          rows={2}
          maxLength={500}
          style={{ ...INPUT_STYLE, fontFamily: 'inherit' }}
        />
      </YStack>

      <Text fontWeight="700" fontSize="$5" marginTop="$2">
        {labels.sections.content}
      </Text>

      <XStack gap="$2" flexWrap="wrap">
        {TOURNAMENT_LOCALES.map((loc) => (
          <button
            key={loc}
            type="button"
            data-testid={`form-tab-${loc}`}
            onClick={() => setState((s) => ({ ...s, activeLocale: loc }))}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: '1px solid #555',
              cursor: 'pointer',
              background:
                state.activeLocale === loc
                  ? 'rgba(255,255,255,0.1)'
                  : 'transparent',
              color: 'inherit',
              fontWeight: state.activeLocale === loc ? 600 : 400,
            }}
          >
            {labels.tabs[loc]}
          </button>
        ))}
      </XStack>

      <YStack gap="$2">
        <Text fontSize="$1" opacity={0.7}>
          {labels.name}
          {state.activeLocale === 'en' ? ' *' : ''}
        </Text>
        <input
          data-testid={`form-name-${state.activeLocale}`}
          value={active.name}
          onChange={(e) =>
            updateLocale(state.activeLocale, 'name', e.target.value)
          }
          style={INPUT_STYLE}
          maxLength={120}
        />
        <Text fontSize="$1" opacity={0.7}>
          {labels.description}
        </Text>
        <textarea
          data-testid={`form-description-${state.activeLocale}`}
          value={active.description ?? ''}
          onChange={(e) =>
            updateLocale(state.activeLocale, 'description', e.target.value)
          }
          rows={3}
          maxLength={1000}
          style={{ ...INPUT_STYLE, fontFamily: 'inherit' }}
        />
      </YStack>

      {errors.length > 0 && (
        <YStack
          padding="$2"
          borderRadius="$2"
          backgroundColor="$errorBgSoft"
          data-testid="form-errors"
        >
          {errors.map((err) => (
            <Text key={err} fontSize="$1" color="$errorText">
              • {err}
            </Text>
          ))}
        </YStack>
      )}

      <XStack gap="$3" justifyContent="flex-end" paddingTop="$2">
        <Button variant="outline" onPress={onCancel} data-testid="form-cancel">
          {labels.cancel}
        </Button>
        <Button
          onPress={handleSubmit}
          disabled={!canSubmit}
          data-testid="form-submit"
        >
          {labels.save}
        </Button>
      </XStack>
    </YStack>
  );
}
