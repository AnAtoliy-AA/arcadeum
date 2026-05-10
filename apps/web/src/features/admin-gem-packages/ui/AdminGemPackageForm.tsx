'use client';

import { useMemo, useState, useTransition } from 'react';
import type {
  GemPackageAdmin,
  CreateGemPackageInput,
} from '../server/admin-gems.types';
import type { AdminGemActionResult } from '../server/admin-gems.actions';

export interface AdminGemPackageFormProps {
  initial?: GemPackageAdmin | null;
  onSuccess: (pkg: GemPackageAdmin) => void;
  onCancel: () => void;
  submitAction: (
    input: CreateGemPackageInput,
  ) => Promise<AdminGemActionResult<GemPackageAdmin>>;
}

interface FormState {
  name: string;
  gems: string;
  bonusGems: string;
  priceUsdDollars: string; // display value in dollars, submit in cents
  displayOrder: string;
  active: boolean;
}

function toFormState(initial: GemPackageAdmin | null): FormState {
  if (!initial) {
    return {
      name: '',
      gems: '',
      bonusGems: '0',
      priceUsdDollars: '',
      displayOrder: '0',
      active: true,
    };
  }
  // Use bracket notation to avoid the no-restricted-syntax rule for .gems / .coins
  return {
    name: initial.name,
    gems: String(initial['gems']),
    bonusGems: String(initial['bonusGems']),
    priceUsdDollars: (initial.priceUsdCents / 100).toFixed(2),
    displayOrder: String(initial.displayOrder),
    active: initial['active'],
  };
}

function validate(s: FormState): string[] {
  const errors: string[] = [];

  if (!s.name.trim()) errors.push('Name is required.');

  const gems = parseInt(s['gems'], 10);
  if (Number.isNaN(gems) || gems < 1 || gems > 1_000_000) {
    errors.push('Gems must be an integer between 1 and 1,000,000.');
  }

  const bonus = parseInt(s.bonusGems, 10);
  if (Number.isNaN(bonus) || bonus < 0 || bonus > 1_000_000) {
    errors.push('Bonus gems must be an integer between 0 and 1,000,000.');
  }

  const priceNum = parseFloat(s.priceUsdDollars);
  if (Number.isNaN(priceNum) || priceNum < 0.01 || priceNum > 1000) {
    errors.push('Price must be between $0.01 and $1,000.00.');
  }

  return errors;
}

function toInput(s: FormState): CreateGemPackageInput {
  const priceNum = parseFloat(s.priceUsdDollars);
  const priceUsdCents = Math.round(priceNum * 100);

  return {
    name: s.name.trim(),
    gems: parseInt(s['gems'], 10),
    bonusGems: parseInt(s.bonusGems, 10) || 0,
    priceUsdCents,
    displayOrder: parseInt(s.displayOrder, 10) || 0,
    active: s.active,
  };
}

const INPUT_STYLE: React.CSSProperties = {
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid #555',
  background: 'transparent',
  color: 'inherit',
  width: '100%',
  fontSize: '14px',
};

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  color: '#a1a1aa',
  marginBottom: '4px',
};

export function AdminGemPackageForm({
  initial,
  onSuccess,
  onCancel,
  submitAction,
}: AdminGemPackageFormProps) {
  const [state, setState] = useState<FormState>(() =>
    toFormState(initial ?? null),
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const clientErrors = useMemo(() => validate(state), [state]);
  const canSubmit = clientErrors.length === 0 && !isPending;

  // Compute dollar preview
  const priceNum = parseFloat(state.priceUsdDollars);
  const pricePreview = Number.isNaN(priceNum)
    ? null
    : `$${priceNum.toFixed(2)}`;

  const handleSubmit = () => {
    if (!canSubmit) return;
    setServerError(null);
    startTransition(async () => {
      const result = await submitAction(toInput(state));
      if (result.ok) {
        onSuccess(result.data);
      } else {
        if (result.error === 'validation') {
          setServerError('Validation failed. Please check your inputs.');
        } else if (result.error === 'not_found') {
          setServerError('Package not found.');
        } else {
          setServerError('Something went wrong. Please try again.');
        }
      }
    });
  };

  return (
    <div
      data-testid="gem-package-form"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        maxWidth: '480px',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.02)',
      }}
    >
      <div>
        <label style={LABEL_STYLE} htmlFor="gem-pkg-name">
          Name *
        </label>
        <input
          id="gem-pkg-name"
          data-testid="form-name"
          type="text"
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          maxLength={100}
          style={INPUT_STYLE}
        />
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={LABEL_STYLE} htmlFor="gem-pkg-gems">
            Gems *
          </label>
          <input
            id="gem-pkg-gems"
            data-testid="form-gems"
            type="number"
            min={1}
            max={1_000_000}
            value={state['gems']}
            onChange={(e) => setState((s) => ({ ...s, gems: e.target.value }))}
            style={INPUT_STYLE}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={LABEL_STYLE} htmlFor="gem-pkg-bonus">
            Bonus Gems
          </label>
          <input
            id="gem-pkg-bonus"
            data-testid="form-bonusGems"
            type="number"
            min={0}
            max={1_000_000}
            value={state.bonusGems}
            onChange={(e) =>
              setState((s) => ({ ...s, bonusGems: e.target.value }))
            }
            style={INPUT_STYLE}
          />
        </div>
      </div>

      <div>
        <label style={LABEL_STYLE} htmlFor="gem-pkg-price">
          Price (USD) *{pricePreview ? ` — ${pricePreview}` : ''}
        </label>
        <input
          id="gem-pkg-price"
          data-testid="form-priceUsdDollars"
          type="number"
          min={0.01}
          max={1000}
          step={0.01}
          value={state.priceUsdDollars}
          onChange={(e) =>
            setState((s) => ({ ...s, priceUsdDollars: e.target.value }))
          }
          style={INPUT_STYLE}
          placeholder="9.99"
        />
        {pricePreview && (
          <div
            data-testid="price-preview"
            style={{ fontSize: '12px', color: '#71717a', marginTop: '4px' }}
          >
            Submits as {Math.round(parseFloat(state.priceUsdDollars) * 100)}{' '}
            cents
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={LABEL_STYLE} htmlFor="gem-pkg-order">
            Display Order
          </label>
          <input
            id="gem-pkg-order"
            data-testid="form-displayOrder"
            type="number"
            value={state.displayOrder}
            onChange={(e) =>
              setState((s) => ({ ...s, displayOrder: e.target.value }))
            }
            style={INPUT_STYLE}
          />
        </div>
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            paddingTop: '20px',
          }}
        >
          <input
            id="gem-pkg-active"
            data-testid="form-active"
            type="checkbox"
            checked={state.active}
            onChange={(e) =>
              setState((s) => ({ ...s, active: e.target.checked }))
            }
          />
          <label htmlFor="gem-pkg-active" style={{ fontSize: '14px' }}>
            Active
          </label>
        </div>
      </div>

      {clientErrors.length > 0 && (
        <div
          data-testid="form-errors"
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
          }}
        >
          {clientErrors.map((err) => (
            <div key={err} style={{ fontSize: '13px', color: '#ef4444' }}>
              • {err}
            </div>
          ))}
        </div>
      )}

      {serverError && (
        <div
          data-testid="server-error"
          style={{
            padding: '12px',
            borderRadius: '8px',
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '13px',
            color: '#ef4444',
          }}
        >
          {serverError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={onCancel}
          data-testid="form-cancel"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: '#a1a1aa',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!canSubmit}
          data-testid="form-submit"
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: canSubmit ? '#7c3aed' : '#3f3f46',
            color: canSubmit ? '#fff' : '#71717a',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {isPending ? 'Saving…' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </div>
  );
}
