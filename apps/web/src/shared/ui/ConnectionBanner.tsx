'use client';

import { useSocketStatus } from '@/shared/lib/socket-status';
import { useTranslation } from '@/shared/lib/useTranslation';

export function ConnectionBanner() {
  const { isConnected, reconnectAttempts } = useSocketStatus();
  const { t } = useTranslation();

  if (isConnected) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        padding: '8px 16px',
        backgroundColor: '#ef4444',
        color: 'white',
        textAlign: 'center',
        fontSize: 14,
        fontWeight: 500,
      }}
    >
      {t('common.statuses.connectionLost')}
      {reconnectAttempts > 0 && (
        <span style={{ marginLeft: 8, opacity: 0.9 }}>
          ({reconnectAttempts})
        </span>
      )}
    </div>
  );
}
