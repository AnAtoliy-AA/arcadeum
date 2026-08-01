'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionTokens } from '@/entities/session/model/useSessionTokens';
import { gamesApi } from '@/features/games/api';
import { useRoutes } from '@/shared/config/useRoutes';

import { useMatchmaking } from '@/features/games/ui';

type Mode = 'ai' | 'human';

interface Props {
  gameId: string;
  label: string;
  mode: Mode;
  variant?: string;
  errorLabel?: string;
  buttonVariant?: 'primary' | 'secondary';
}

const ERROR_RESET_MS = 3500;

export function QuickplayButton({
  gameId,
  label,
  mode,
  variant,
  errorLabel,
  buttonVariant = 'primary',
}: Props) {
  const router = useRouter();
  const routes = useRoutes();
  const { snapshot } = useSessionTokens();
  const [loading, setLoading] = useState(false);
  const [errored, setErrored] = useState(false);
  const { joinQueue } = useMatchmaking();

  useEffect(() => {
    if (!errored) return undefined;
    const t = setTimeout(() => setErrored(false), ERROR_RESET_MS);
    return () => clearTimeout(t);
  }, [errored]);

  const handleClick = async () => {
    setErrored(false);
    if (mode === 'human') {
      joinQueue(gameId, variant);
      return;
    }
    setLoading(true);
    try {
      const options = {
        token: snapshot.accessToken || undefined,
        variant,
      };
      const { room } = await gamesApi.quickplay(gameId, options);
      router.push(routes.gameRoom(room.id));
    } catch (err) {
      console.warn(`Quickplay (${mode}) failed:`, err);
      setErrored(true);
      setLoading(false);
    }
  };

  const displayLabel = errored && errorLabel ? errorLabel : label;
  const isDanger = errored;
  const isSecondary = !isDanger && buttonVariant === 'secondary';

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      aria-live="polite"
      data-testid={`quickplay-${mode}-button`}
      suppressHydrationWarning
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        padding: '18px 36px',
        borderRadius: 16,
        border: 'none',
        background: isDanger
          ? 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)'
          : isSecondary
            ? 'rgba(255,255,255,0.08)'
            : 'linear-gradient(135deg, #f59e0b 0%, #f97316 50%, #ef4444 100%)',
        color: 'white',
        fontWeight: 800,
        fontSize: 18,
        letterSpacing: 0.3,
        cursor: loading ? 'wait' : 'pointer',
        opacity: loading ? 0.7 : 1,
        minWidth: 220,
        justifyContent: 'center',
        boxShadow: isDanger
          ? '0 4px 20px rgba(220, 38, 38, 0.4)'
          : isSecondary
            ? 'none'
            : '0 4px 24px rgba(249, 115, 22, 0.45), 0 0 60px rgba(249, 115, 22, 0.15)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
        e.currentTarget.style.boxShadow = isDanger
          ? '0 6px 28px rgba(220, 38, 38, 0.5)'
          : isSecondary
            ? 'rgba(255,255,255,0.15)'
            : '0 6px 32px rgba(249, 115, 22, 0.55), 0 0 80px rgba(249, 115, 22, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0) scale(1)';
        e.currentTarget.style.boxShadow = isDanger
          ? '0 4px 20px rgba(220, 38, 38, 0.4)'
          : isSecondary
            ? 'none'
            : '0 4px 24px rgba(249, 115, 22, 0.45), 0 0 60px rgba(249, 115, 22, 0.15)';
      }}
    >
      {!loading && (
        <span style={{ fontSize: 20 }} aria-hidden>
          ▶
        </span>
      )}
      {loading ? 'Starting...' : displayLabel}
    </button>
  );
}
