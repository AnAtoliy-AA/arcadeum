import React, { useState } from 'react';
import type { QuestDefinition } from '@/shared/lib/quests-progression';

interface QuestTrackerCardProps {
  quests: QuestDefinition[];
  onClaim: (questId: string) => void;
}

export const QuestTrackerCard: React.FC<QuestTrackerCardProps> = ({
  quests,
  onClaim,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly'>('daily');

  const filteredQuests = quests.filter((q) => q.category === activeTab);

  return (
    <div className="w-full rounded-2xl bg-[var(--card)] border border-[var(--cardBorder)] p-5 shadow-lg flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">📜</span>
          <h3 className="text-base font-bold text-[var(--foreground)]">
            Quest Objectives
          </h3>
        </div>

        <div className="flex rounded-lg bg-[var(--surface)] p-1 border border-[var(--glassBorder)]">
          <button
            onClick={() => setActiveTab('daily')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'daily'
                ? 'bg-[var(--primary)] text-[var(--primaryForeground)]'
                : 'text-[var(--mutedForeground)] hover:text-[var(--foreground)]'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeTab === 'weekly'
                ? 'bg-[var(--primary)] text-[var(--primaryForeground)]'
                : 'text-[var(--mutedForeground)] hover:text-[var(--foreground)]'
            }`}
          >
            Weekly
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredQuests.length === 0 ? (
          <p className="text-xs text-center py-6 text-[var(--mutedForeground)]">
            No active quests in this category.
          </p>
        ) : (
          filteredQuests.map((quest) => {
            const pct = Math.min(
              100,
              Math.round((quest.currentCount / quest.targetCount) * 100),
            );

            return (
              <div
                key={quest.id}
                className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--glassBorder)] flex flex-col gap-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-semibold text-[var(--foreground)]">
                      {quest.title}
                    </h4>
                    <p className="text-xs text-[var(--mutedForeground)]">
                      {quest.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-medium text-[var(--accent)]">
                      +{quest.rewardXp} XP
                    </span>
                    <span className="text-xs font-medium text-[var(--warning)]">
                      +{quest.rewardCoins} 🪙
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-[var(--card)] overflow-hidden">
                    <div
                      className={`h-full bg-[var(--primary)] rounded-full transition-all duration-300 ${
                        pct >= 100
                          ? 'w-full'
                          : pct >= 75
                            ? 'w-3/4'
                            : pct >= 50
                              ? 'w-1/2'
                              : pct >= 25
                                ? 'w-1/4'
                                : pct > 0
                                  ? 'w-1/12'
                                  : 'w-0'
                      }`}
                    />
                  </div>
                  <span className="text-xs font-mono text-[var(--mutedForeground)] shrink-0">
                    {quest.currentCount}/{quest.targetCount}
                  </span>

                  {quest.completed && !quest.claimed && (
                    <button
                      onClick={() => onClaim(quest.id)}
                      className="px-3 py-1 rounded-lg text-xs font-bold bg-[var(--primary)] text-[var(--primaryForeground)] animate-pulse hover:opacity-90 transition-opacity"
                    >
                      Claim
                    </button>
                  )}

                  {quest.claimed && (
                    <span className="text-xs font-bold text-[var(--success)] px-2 py-1 bg-[var(--success)]/10 rounded-lg">
                      Claimed ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
