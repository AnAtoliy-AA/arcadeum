import { Suspense } from 'react';
import { getTranslations } from '@/shared/i18n/server';
import { getDailyChallengesStatus } from '../server/daily-challenges.server';
import type { Locale } from '@/shared/i18n/types';

interface DailyChallengesCardProps {
  locale: Locale;
}

export async function DailyChallengesCard({
  locale,
}: DailyChallengesCardProps) {
  const t = await getTranslations(locale);
  const messages = t as {
    pages?: { dailyChallenges?: Record<string, string> };
  };
  const labels = messages.pages?.dailyChallenges ?? {};

  return (
    <Suspense fallback={null}>
      <DailyChallengesCardInner labels={labels} />
    </Suspense>
  );
}

async function DailyChallengesCardInner({
  labels,
}: {
  labels: Record<string, string>;
}) {
  const status = await getDailyChallengesStatus();
  if (!status || status.challenges.length === 0) return null;

  return (
    <div
      style={{
        background:
          'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))',
        borderRadius: '16px',
        padding: '20px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <span style={{ fontSize: '20px' }}>🎯</span>
        <h3
          style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: 600,
            color: '#fff',
          }}
        >
          {labels.title ?? 'Daily Challenges'}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {status.challenges.map((challenge) => (
          <div
            key={challenge.challengeId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: 'rgba(0, 0, 0, 0.2)',
              borderRadius: '8px',
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: '14px',
                  color: '#fff',
                  marginBottom: '6px',
                }}
              >
                {challenge.description}
              </div>
              <div
                style={{
                  height: '6px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min((challenge.progress / challenge.targetCount) * 100, 100)}%`,
                    background: challenge.completed
                      ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                      : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                    borderRadius: '3px',
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '4px',
                }}
              >
                {challenge.progress} / {challenge.targetCount}
              </div>
            </div>

            <div
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                background:
                  challenge.completed && !challenge.claimed
                    ? 'linear-gradient(135deg, #f59e0b, #d97706)'
                    : challenge.claimed
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(255, 255, 255, 0.1)',
                color:
                  challenge.completed && !challenge.claimed
                    ? '#000'
                    : challenge.claimed
                      ? '#22c55e'
                      : 'rgba(255, 255, 255, 0.5)',
              }}
            >
              {challenge.claimed
                ? (labels.claimed ?? '✓')
                : challenge.completed
                  ? (labels.claim ?? 'Claim')
                  : `${challenge.rewardAmount} ${challenge.rewardType}`}
            </div>
          </div>
        ))}
      </div>

      {status.allCompleted && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '8px',
            textAlign: 'center',
            color: '#22c55e',
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {labels.allCompleted ??
            'All challenges completed! Come back tomorrow.'}
        </div>
      )}
    </div>
  );
}
