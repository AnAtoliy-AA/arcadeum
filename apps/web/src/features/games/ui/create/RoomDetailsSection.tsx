'use client';

import React from 'react';
import { Button } from '@arcadeum/ui/components/Button/Button';
import { Section } from '@arcadeum/ui/components/Section/Section';
import { Input } from '@arcadeum/ui/components/Input/Input';
import { TextArea } from '@arcadeum/ui/components/TextArea/TextArea';
import { FormGroup } from '@arcadeum/ui/components/FormGroup/FormGroup';
import { Row } from '@/features/games/ui/create/styles';
import { gamesCatalog } from '@/features/games/ui/create/constants';
import type { TranslationKey } from '@/shared/lib/useTranslation';

type RoomDetailsSectionProps = {
  name: string;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNameFocus: () => void;
  maxPlayers: string;
  onMaxPlayersChange: (value: string) => void;
  visibility: 'public' | 'private';
  onVisibilityToggle: () => void;
  password: string;
  onPasswordChange: (value: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  gameId: string;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

export function RoomDetailsSection({
  name,
  onNameChange,
  onNameFocus,
  maxPlayers,
  onMaxPlayersChange,
  visibility,
  onVisibilityToggle,
  password,
  onPasswordChange,
  notes,
  onNotesChange,
  gameId,
  t,
}: RoomDetailsSectionProps) {
  return (
    <Section title={t('games.create.sectionDetails') || 'Room Details'}>
      <FormGroup
        label={t('games.create.fieldName') || 'Room Name'}
        htmlFor="room-name"
        required
      >
        <Input
          id="room-name"
          type="text"
          placeholder={t('games.create.namePlaceholder') || 'Enter room name'}
          value={name}
          onChange={onNameChange}
          onFocus={onNameFocus}
          required
          aria-required="true"
          fullWidth
          size="lg"
        />
      </FormGroup>

      <Row>
        <FormGroup
          className="grow basis-0 max-[660px]:grow-0 max-[660px]:basis-auto"
          label={t('games.create.fieldMaxPlayers') || 'Max Players (optional)'}
          htmlFor="max-players"
        >
          <div className="flex flex-row gap-2 items-start">
            <Input
              key="max-players-input"
              id="max-players"
              type="number"
              min="2"
              max={
                gamesCatalog.find((g) => g.id === gameId)?.maxPlayers ||
                undefined
              }
              placeholder={t('games.create.autoPlaceholder') || 'Auto'}
              value={maxPlayers}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onMaxPlayersChange(e.target.value)
              }
              aria-label={
                t('games.create.maxPlayersAria') || 'Maximum number of players'
              }
              className="flex-1"
              fullWidth
              size="lg"
            />
            {maxPlayers ? (
              <div className="flex flex-col items-stretch shrink-0 w-[150px] justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onMaxPlayersChange('')}
                  size="lg"
                  aria-label="Set to Auto"
                  data-testid="auto-max-players-button"
                  className="w-full"
                >
                  {t('games.create.autoButton') || 'Auto'}
                </Button>
              </div>
            ) : null}
          </div>
        </FormGroup>

        <FormGroup
          className="grow basis-0 max-[660px]:grow-0 max-[660px]:basis-auto"
          label={t('games.create.fieldVisibility') || 'Visibility'}
          htmlFor="visibility"
        >
          <Button
            id="visibility"
            type="button"
            variant="secondary"
            active={visibility === 'public'}
            onClick={onVisibilityToggle}
            aria-pressed={visibility === 'public'}
            aria-label={
              visibility === 'public' ? 'Public room' : 'Private room'
            }
            data-testid="visibility-toggle-button"
            fullWidth
            size="lg"
          >
            {visibility === 'public' ? '🌐 Public' : '🔒 Private'}
          </Button>
        </FormGroup>
      </Row>

      <FormGroup
        label={t('games.password.label') || 'Room Password (optional)'}
        htmlFor="room-password"
      >
        <Input
          id="room-password"
          type="password"
          placeholder={t('games.password.placeholder') || 'Set a password'}
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onPasswordChange(e.target.value)
          }
          aria-label={t('games.password.label') || 'Room Password (optional)'}
          maxLength={64}
          fullWidth
          size="lg"
        />
      </FormGroup>

      <FormGroup
        label={t('games.create.fieldNotes') || 'Notes (optional)'}
        htmlFor="notes"
      >
        <TextArea
          id="notes"
          placeholder={t('games.create.notesPlaceholder') || 'Add notes...'}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          aria-label={
            t('games.create.notesAria') || 'Additional notes for the room'
          }
          fullWidth
        />
      </FormGroup>
    </Section>
  );
}
