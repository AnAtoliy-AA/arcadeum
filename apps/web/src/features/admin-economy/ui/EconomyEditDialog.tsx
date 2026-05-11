'use client';

import { useState, useTransition } from 'react';
import type { EconomyKey } from '../server/economy.types';
import {
  setEconomyValueAction,
  resetEconomyValueAction,
} from '../server/economy.actions';

interface EconomyEditDialogProps {
  open: boolean;
  onClose: () => void;
  economyKey: EconomyKey;
  currentValue: number;
  defaultValue: number;
  labels: {
    title: string;
    currentLabel: string;
    newValueLabel: string;
    save: string;
    cancel: string;
    reset: string;
    errorInvalidValue: string;
    errorGeneric: string;
    errorForbidden: string;
    errorNotFound: string;
    toastSaved: string;
    toastReset: string;
  };
  onSuccess?: () => void;
}

export function EconomyEditDialog({
  open,
  onClose,
  economyKey,
  currentValue,
  defaultValue,
  labels,
  onSuccess,
}: EconomyEditDialogProps) {
  const [inputValue, setInputValue] = useState(String(currentValue));
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);
    setSuccessMessage(null);

    const parsed = parseInt(inputValue, 10);
    if (
      !Number.isInteger(parsed) ||
      parsed < 1 ||
      String(parsed) !== inputValue.trim()
    ) {
      setValidationError(labels.errorInvalidValue);
      return;
    }

    startTransition(async () => {
      const result = await setEconomyValueAction({
        key: economyKey,
        value: parsed,
      });

      if (result.ok) {
        const msg = labels.toastSaved
          .replace('{{key}}', economyKey)
          .replace('{{value}}', String(parsed));
        setSuccessMessage(msg);
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        if (result.error === 'validation') {
          setValidationError(labels.errorInvalidValue);
        } else if (result.error === 'forbidden') {
          setServerError(labels.errorForbidden);
        } else if (result.error === 'not_found') {
          setServerError(labels.errorNotFound);
        } else {
          setServerError(labels.errorGeneric);
        }
      }
    });
  };

  const handleReset = () => {
    setValidationError(null);
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      const result = await resetEconomyValueAction({ key: economyKey });

      if (result.ok) {
        const msg = labels.toastReset.replace('{{key}}', economyKey);
        setSuccessMessage(msg);
        onSuccess?.();
        setTimeout(() => {
          onClose();
        }, 1200);
      } else {
        if (result.error === 'forbidden') {
          setServerError(labels.errorForbidden);
        } else if (result.error === 'not_found') {
          setServerError(labels.errorNotFound);
        } else {
          setServerError(labels.errorGeneric);
        }
      }
    });
  };

  const dialogTitle = labels.title.replace('{{key}}', economyKey);

  return (
    <div
      data-testid="economy-edit-dialog"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.6)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#18181b',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          maxWidth: '90vw',
        }}
      >
        <h2
          style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#e4e4e7',
            marginBottom: '16px',
          }}
        >
          {dialogTitle}
        </h2>

        <div
          style={{ marginBottom: '16px', fontSize: '13px', color: '#71717a' }}
        >
          <span>{labels.currentLabel}: </span>
          <strong style={{ color: '#a1a1aa' }}>{currentValue}</strong>
          <span style={{ marginLeft: '12px' }}>Default: </span>
          <strong style={{ color: '#a1a1aa' }}>{defaultValue}</strong>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label
              htmlFor="economy-value-input"
              style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 600,
                color: '#a1a1aa',
                marginBottom: '6px',
              }}
            >
              {labels.newValueLabel}
            </label>
            <input
              id="economy-value-input"
              data-testid="economy-value-input"
              type="number"
              min="1"
              step="1"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setValidationError(null);
              }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '6px',
                border: validationError
                  ? '1px solid #ef4444'
                  : '1px solid rgba(255,255,255,0.12)',
                background: '#09090b',
                color: '#e4e4e7',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
            {validationError && (
              <div
                data-testid="economy-validation-error"
                style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}
              >
                {validationError}
              </div>
            )}
          </div>

          {serverError && (
            <div
              data-testid="economy-server-error"
              style={{
                fontSize: '13px',
                color: '#ef4444',
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(239,68,68,0.08)',
                borderRadius: '6px',
              }}
            >
              {serverError}
            </div>
          )}

          {successMessage && (
            <div
              data-testid="economy-success-message"
              style={{
                fontSize: '13px',
                color: '#22c55e',
                marginBottom: '12px',
                padding: '8px 12px',
                background: 'rgba(34,197,94,0.08)',
                borderRadius: '6px',
              }}
            >
              {successMessage}
            </div>
          )}

          <div
            style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
          >
            <button
              type="button"
              data-testid="economy-reset-btn"
              onClick={handleReset}
              disabled={isPending}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(239,68,68,0.3)',
                background: 'transparent',
                color: '#ef4444',
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                marginRight: 'auto',
              }}
            >
              {labels.reset}
            </button>

            <button
              type="button"
              data-testid="economy-cancel-btn"
              onClick={onClose}
              disabled={isPending}
              style={{
                padding: '8px 14px',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.12)',
                background: 'transparent',
                color: '#a1a1aa',
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontSize: '13px',
              }}
            >
              {labels.cancel}
            </button>

            <button
              type="submit"
              data-testid="economy-save-btn"
              disabled={isPending}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                background: '#7c3aed',
                color: '#fff',
                cursor: isPending ? 'not-allowed' : 'pointer',
                fontSize: '13px',
                fontWeight: 600,
              }}
            >
              {isPending ? '…' : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
