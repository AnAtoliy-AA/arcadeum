import { Button } from '@arcadeum/ui';
import React, { useState } from 'react';
import { useTranslation } from '@/shared/i18n/useTranslation';
import { PET_NAME_MAX_LENGTH, sanitizePetName } from '@arcadeum/games-core';

interface ArcadePetRenameFieldProps {
  name: string;
  onRename: (name: string) => { success: boolean };
}

export const ArcadePetRenameField: React.FC<ArcadePetRenameFieldProps> = ({
  name,
  onRename,
}) => {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [invalid, setInvalid] = useState(false);

  const startEditing = () => {
    setDraft(name);
    setInvalid(false);
    setEditing(true);
  };

  const submit = () => {
    if (!sanitizePetName(draft)) {
      setInvalid(true);
      return;
    }
    if (onRename(draft).success) setEditing(false);
    else setInvalid(true);
  };

  if (!editing) {
    return (
      <span className="flex min-w-0 items-center gap-1">
        <span className="min-w-0 break-words text-sm font-bold leading-tight">
          {name}
        </span>
        <Button
          variant="icon"
          size="sm"
          data-testid="pet-rename-btn"
          onClick={startEditing}
          aria-label={t('arcadePetCompanion.rename.edit')}
          title={t('arcadePetCompanion.rename.edit')}
        >
          <span aria-hidden="true">✏️</span>
        </Button>
      </span>
    );
  }

  return (
    <form
      className="flex min-w-0 items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <input
        type="text"
        data-testid="pet-rename-input"
        autoFocus
        value={draft}
        maxLength={PET_NAME_MAX_LENGTH}
        onChange={(e) => {
          setDraft(e.target.value);
          setInvalid(false);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') setEditing(false);
        }}
        aria-label={t('arcadePetCompanion.rename.label')}
        aria-invalid={invalid}
        className={`w-28 min-w-0 rounded border bg-[var(--background)] px-1.5 py-0.5 text-xs text-[var(--color)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--primary)] ${
          invalid ? 'border-[var(--danger)]' : 'border-[var(--glassBorder)]'
        }`}
      />
      <Button
        type="submit"
        variant="icon"
        size="sm"
        data-testid="pet-rename-save"
        aria-label={t('arcadePetCompanion.rename.save')}
      >
        <span aria-hidden="true">✓</span>
      </Button>
      {invalid && (
        <span role="alert" className="sr-only">
          {t('arcadePetCompanion.rename.invalid')}
        </span>
      )}
    </form>
  );
};
