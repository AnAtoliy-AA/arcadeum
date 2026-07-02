'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';

interface RuleItem {
  ruleId: string;
  label: string;
  enabled: boolean;
}

type RulesByGame = Record<string, RuleItem[]>;

export function AdminGameRulesTable() {
  const [rules, setRules] = useState<RulesByGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<RulesByGame>('/admin/game-rules')
      .then((data) => {
        setRules(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleRule = useCallback(
    async (gameId: string, ruleId: string, enabled: boolean) => {
      setSaving(`${gameId}::${ruleId}`);
      try {
        await apiClient.put(`/admin/game-rules/${gameId}/${ruleId}`, {
          enabled,
        });
        setRules((prev) => {
          if (!prev) return prev;
          const updated = { ...prev };
          updated[gameId] = updated[gameId].map((r) =>
            r.ruleId === ruleId ? { ...r, enabled } : r,
          );
          return updated;
        });
      } catch {
        // revert on error
      } finally {
        setSaving(null);
      }
    },
    [],
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#71717a' }}>
        Loading...
      </div>
    );
  }

  if (!rules || Object.keys(rules).length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '48px', color: '#71717a' }}>
        No games with configurable rules found.
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
        marginTop: '16px',
      }}
    >
      {Object.entries(rules).map(([gameId, gameRules]) => (
        <div
          key={gameId}
          style={{
            background: 'var(--color-card, #1c1c1e)',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text, #e4e4e7)',
                margin: 0,
              }}
            >
              {gameId.replace('_v1', '').replace(/_/g, ' ')}
            </h3>
            <span
              style={{
                fontSize: '12px',
                color: '#71717a',
              }}
            >
              {gameRules.filter((r) => r.enabled).length}/{gameRules.length}{' '}
              enabled
            </span>
          </div>
          <div style={{ padding: '8px 0' }}>
            {gameRules.map((rule) => {
              const isSaving = saving === `${gameId}::${rule.ruleId}`;
              return (
                <div
                  key={rule.ruleId}
                  style={{
                    padding: '12px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: rule.enabled
                          ? 'var(--color-text, #e4e4e7)'
                          : '#71717a',
                      }}
                    >
                      {rule.label}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#52525b',
                        marginTop: '2px',
                      }}
                    >
                      {rule.ruleId}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      toggleRule(gameId, rule.ruleId, !rule.enabled)
                    }
                    style={{
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: isSaving ? 'not-allowed' : 'pointer',
                      opacity: isSaving ? 0.6 : 1,
                      border: '1px solid',
                      borderColor: rule.enabled
                        ? 'rgba(239,68,68,0.4)'
                        : 'rgba(34,197,94,0.4)',
                      background: rule.enabled
                        ? 'rgba(239,68,68,0.1)'
                        : 'rgba(34,197,94,0.1)',
                      color: rule.enabled ? '#f87171' : '#4ade80',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {rule.enabled ? 'Exclude' : 'Include'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
