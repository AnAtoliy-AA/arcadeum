import { Suspense } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { getAchievementsStatus } from '../server/achievements.server';
import type { Locale } from '@/shared/i18n/types';

interface AchievementsListProps {
  locale: Locale;
  userId: string;
}

export async function AchievementsList({
  locale,
  userId: _userId,
}: AchievementsListProps) {
  const t = await getTranslations(locale);
  const messages = t as { pages?: { achievements?: Record<string, string> } };
  const labels = messages.pages?.achievements ?? {};

  return (
    <Suspense fallback={null}>
      <AchievementsListInner labels={labels} />
    </Suspense>
  );
}

async function AchievementsListInner({
  labels,
}: {
  labels: Record<string, string>;
}) {
  const status = await getAchievementsStatus();
  if (!status || status.achievements.length === 0) return null;

  const RARITY_COLORS: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    common: {
      bg: 'rgba(156, 163, 175, 0.2)',
      border: 'rgba(156, 163, 175, 0.4)',
      text: '#9ca3af',
    },
    rare: {
      bg: 'rgba(59, 130, 246, 0.2)',
      border: 'rgba(59, 130, 246, 0.4)',
      text: '#3b82f6',
    },
    epic: {
      bg: 'rgba(168, 85, 247, 0.2)',
      border: 'rgba(168, 85, 247, 0.4)',
      text: '#a855f7',
    },
    legendary: {
      bg: 'rgba(245, 158, 11, 0.2)',
      border: 'rgba(245, 158, 11, 0.4)',
      text: '#f59e0b',
    },
  };

  return (
    <div
      style={{
        background:
          'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(239, 68, 68, 0.1))',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(245, 158, 11, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>🏆</span>
          <h3
            style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: 600,
              color: '#fff',
            }}
          >
            {labels.title ?? 'Achievements'}
          </h3>
        </div>
        <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
          {status.totalUnlocked} / {status.totalAchievements}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '12px',
        }}
      >
        {status.achievements.map((achievement) => {
          const rarityStyle =
            RARITY_COLORS[achievement.rarity] ?? RARITY_COLORS.common;
          const progressPercent =
            achievement.targetProgress > 0
              ? Math.min(
                  (achievement.progress / achievement.targetProgress) * 100,
                  100,
                )
              : 0;

          return (
            <div
              key={achievement.achievementId}
              style={{
                padding: '16px',
                background: achievement.unlocked
                  ? rarityStyle.bg
                  : 'rgba(0, 0, 0, 0.2)',
                border: `1px solid ${achievement.unlocked ? rarityStyle.border : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '12px',
                opacity: achievement.unlocked ? 1 : 0.6,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: achievement.unlocked
                      ? rarityStyle.border
                      : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                  }}
                >
                  {achievement.unlocked ? '✓' : '🔒'}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#fff',
                    }}
                  >
                    {achievement.name}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      textTransform: 'uppercase',
                      color: rarityStyle.text,
                      fontWeight: 600,
                    }}
                  >
                    {achievement.rarity}
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginBottom: '8px',
                }}
              >
                {achievement.description}
              </div>

              {!achievement.unlocked && achievement.targetProgress > 1 && (
                <div>
                  <div
                    style={{
                      height: '4px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      marginBottom: '4px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: `linear-gradient(90deg, ${rarityStyle.text}, ${rarityStyle.border})`,
                        borderRadius: '2px',
                      }}
                    />
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.4)',
                    }}
                  >
                    {achievement.progress} / {achievement.targetProgress}
                  </div>
                </div>
              )}

              {achievement.unlocked && !achievement.claimed && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#000',
                  }}
                >
                  {labels.claim ?? 'Claim'} +{achievement.xpReward} XP
                </div>
              )}

              {achievement.claimed && (
                <div
                  style={{
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#22c55e',
                  }}
                >
                  {labels.claimed ?? '✓ Claimed'}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
