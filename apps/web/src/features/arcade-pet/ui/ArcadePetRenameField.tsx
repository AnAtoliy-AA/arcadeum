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
      <span className="flex items-center gap-1">
        <span className="text-sm font-bold leading-tight">{name}</span>
        <button
          type="button"
          data-testid="pet-rename-btn"
          onClick={startEditing}
          aria-label={t('arcadePetCompanion.rename.edit')}
          title={t('arcadePetCompanion.rename.edit')}
          className="text-[11px] text-neutral-400 hover:text-white"
        >
          ✏️
        </button>
      </span>
    );
  }

  return (
    <form
      className="flex items-center gap-1"
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
        className={`w-28 px-1.5 py-0.5 rounded bg-neutral-950 border text-xs text-white ${
          invalid ? 'border-red-500' : 'border-neutral-700'
        }`}
      />
      <button
        type="submit"
        data-testid="pet-rename-save"
        aria-label={t('arcadePetCompanion.rename.save')}
        className="text-[11px] text-emerald-400 hover:text-emerald-300"
      >
        ✓
      </button>
      {invalid && (
        <span role="alert" className="sr-only">
          {t('arcadePetCompanion.rename.invalid')}
        </span>
      )}
    </form>
  );
};
