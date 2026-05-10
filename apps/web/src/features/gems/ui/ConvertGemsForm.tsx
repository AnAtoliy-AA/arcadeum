'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { convertGemsAction } from '../server/gems.actions';

interface ConvertGemsFormProps {
  rate: number;
  currentGems: number;
}

export function ConvertGemsForm({ rate, currentGems }: ConvertGemsFormProps) {
  const router = useRouter();
  const [gemsInput, setGemsInput] = useState('');
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Computed coin preview
  const gemsNum = parseInt(gemsInput, 10);
  const coinsPreview =
    Number.isInteger(gemsNum) && gemsNum > 0 ? gemsNum * rate : null;

  const handleSubmit = () => {
    setInlineError(null);
    setSuccess(null);

    if (!Number.isInteger(gemsNum) || gemsNum <= 0) {
      setInlineError('Amount must be a positive integer.');
      return;
    }

    if (gemsNum > currentGems) {
      setInlineError('Not enough gems to convert.');
      return;
    }

    // Generate the idempotency UUID client-side at the moment the user submits.
    const conversionId = crypto.randomUUID();

    startTransition(async () => {
      const result = await convertGemsAction({ gems: gemsNum, conversionId });

      if (result.ok) {
        const { gemsDebited, coinsCredited } = result.data;
        setSuccess(`Converted ${gemsDebited} gems to ${coinsCredited} coins`);
        setGemsInput('');
        router.refresh();
        return;
      }

      if (result.error === 'insufficient') {
        setInlineError('Not enough gems to convert.');
      } else if (result.error === 'invalid') {
        setInlineError('Invalid amount or conversion request.');
      } else {
        setInlineError('Conversion failed. Please try again.');
      }
    });
  };

  return (
    <section
      aria-label="Convert gems to coins"
      data-testid="convert-gems-form"
      style={{
        padding: '20px 24px',
        borderRadius: '12px',
        background: 'rgba(124,58,237,0.04)',
        border: '1px solid rgba(124,58,237,0.15)',
        maxWidth: '480px',
      }}
    >
      <h2
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#e4e4e7',
          marginBottom: '4px',
        }}
      >
        Convert Gems to Coins
      </h2>
      <p style={{ fontSize: '13px', color: '#71717a', marginBottom: '16px' }}>
        Rate: 1 gem = {rate} coins
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div>
          <label
            htmlFor="gems-to-convert"
            style={{
              display: 'block',
              fontSize: '12px',
              color: '#a1a1aa',
              marginBottom: '4px',
            }}
          >
            Gems to convert (you have {currentGems.toLocaleString()})
          </label>
          <input
            id="gems-to-convert"
            data-testid="gems-input"
            type="number"
            min={1}
            max={currentGems}
            value={gemsInput}
            onChange={(e) => {
              setGemsInput(e.target.value);
              setInlineError(null);
              setSuccess(null);
            }}
            placeholder="0"
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.12)',
              background: 'transparent',
              color: '#e4e4e7',
              fontSize: '14px',
              width: '100%',
            }}
          />
        </div>

        {coinsPreview !== null && (
          <div
            data-testid="coins-preview"
            style={{ fontSize: '14px', color: '#a78bfa' }}
          >
            You will receive:{' '}
            <strong>{coinsPreview.toLocaleString()} coins</strong>
          </div>
        )}

        {inlineError && (
          <div
            data-testid="convert-error"
            style={{
              padding: '10px 14px',
              borderRadius: '8px',
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '13px',
              color: '#ef4444',
            }}
          >
            {inlineError}
            {inlineError.toLowerCase().includes('not enough gems') && (
              <span>
                {' '}
                <a
                  href="#gem-store"
                  style={{ color: '#a78bfa', textDecoration: 'underline' }}
                >
                  Buy more gems
                </a>
              </span>
            )}
          </div>
        )}

        {success && (
          <div
            data-testid="convert-success"
            style={{ fontSize: '13px', color: '#22c55e', fontWeight: 600 }}
          >
            {success}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !gemsInput}
          data-testid="convert-submit"
          style={{
            padding: '10px 16px',
            borderRadius: '8px',
            border: 'none',
            background: isPending || !gemsInput ? '#3f3f46' : '#7c3aed',
            color: isPending || !gemsInput ? '#71717a' : '#fff',
            cursor: isPending || !gemsInput ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          {isPending ? 'Converting…' : 'Convert'}
        </button>
      </div>
    </section>
  );
}
