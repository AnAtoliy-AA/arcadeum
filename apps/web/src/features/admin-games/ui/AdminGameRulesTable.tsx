'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiClient } from '@/shared/lib/api-client';

interface RuleItem {
  ruleId: string;
  label: string;
  description?: string;
  enabled: boolean;
}

type RulesByGame = Record<string, RuleItem[]>;

export function AdminGameRulesTable() {
  const [rules, setRules] = useState<RulesByGame | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    apiClient
      .get<{ rules: RulesByGame }>('/admin/game-rules')
      .then((data) => {
        setRules(data.rules);
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
        // revert
      } finally {
        setSaving(null);
      }
    },
    [],
  );

  if (loading) {
    return (
      <div className="text-center py-12 text-[var(--colorTextSecondary,#71717a)]">
        Loading...
      </div>
    );
  }

  if (!rules || Object.keys(rules).length === 0) {
    return (
      <div className="text-center py-12 text-[var(--colorTextSecondary,#71717a)]">
        No games with configurable rules found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 mt-4">
      {Object.entries(rules).map(([gameId, gameRules]) => (
        <div
          key={gameId}
          className="bg-[var(--colorCard,#1c1c1e)] rounded-xl border border-[var(--borderColor)] overflow-hidden"
        >
          <div className="py-4 px-5 border-b border-[var(--borderColor)] flex flex-row justify-between items-center bg-[var(--backgroundFocus)]">
            <h3 className="text-base font-semibold text-[var(--colorText,#e4e4e7)] capitalize m-0">
              {gameId.replace('_v1', '').replace(/_/g, ' ')}
            </h3>
            <span className="text-xs text-[var(--colorTextSecondary,#71717a)] font-mono">
              {gameRules.filter((r) => r.enabled).length}/{gameRules.length}{' '}
              enabled
            </span>
          </div>
          <div className="py-2 divide-y divide-[rgba(255,255,255,0.04)]">
            {gameRules.map((rule) => {
              const isSaving = saving === `${gameId}::${rule.ruleId}`;
              return (
                <div
                  key={rule.ruleId}
                  className="py-3 px-5 flex flex-row justify-between items-center hover:bg-[rgba(255,255,255,0.02)] transition-colors"
                >
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        rule.enabled
                          ? 'text-[var(--colorText,#e4e4e7)]'
                          : 'text-[var(--colorTextSecondary,#71717a)]'
                      } ${rule.description ? 'cursor-help' : 'cursor-default'}`}
                      title={rule.description}
                    >
                      {rule.label}
                    </div>
                    <div className="text-xs font-mono text-[var(--colorTextSecondary,#71717a)] mt-0.5">
                      {rule.ruleId}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      toggleRule(gameId, rule.ruleId, !rule.enabled)
                    }
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      isSaving
                        ? 'opacity-60 cursor-not-allowed'
                        : 'cursor-pointer'
                    } ${
                      rule.enabled
                        ? 'border-rose-500/40 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                    }`}
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
