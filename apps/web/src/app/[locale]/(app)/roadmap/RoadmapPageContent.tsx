'use client';

import { useState, useCallback } from 'react';
import { PageLayout, Container, Typography, Section } from '@arcadeum/ui';
import type { RoadmapData, Phase } from './roadmap-parser';
import {
  TIERS,
  PHASES,
  STATS,
  type Tier,
  type TierFeature,
} from './roadmap-data';

function StatusBadge({ status }: { status: TierFeature['status'] }) {
  if (status === 'implemented') {
    return (
      <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] shrink-0">
        <Typography
          className={'font-bold text-[#22c55e]'}
          variant="caption"
          uiSize="xs"
        >
          Implemented
        </Typography>
      </div>
    );
  }
  if (status === 'partial') {
    return (
      <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] shrink-0">
        <Typography
          className={'font-bold text-[#f59e0b]'}
          variant="caption"
          uiSize="xs"
        >
          In Progress
        </Typography>
      </div>
    );
  }
  return (
    <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] shrink-0">
      <Typography variant="caption" uiSize="xs" alpha="medium">
        Planned
      </Typography>
    </div>
  );
}

function TierCard({
  tier,
  isExpanded,
  onToggle,
}: {
  tier: Tier;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const implementedCount = tier.features.filter(
    (f) => f.status === 'implemented',
  ).length;

  return (
    <div
      className="flex flex-col items-stretch rounded-2xl overflow-hidden"
      style={{
        background: isExpanded ? tier.gradient : 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: isExpanded ? `${tier.color}30` : 'rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="flex flex-col items-stretch active:opacity-[0.8] cursor-pointer p-4"
        onClick={onToggle}
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center flex-1">
            <div
              className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${tier.color}20` }}
            >
              <Typography uiSize="lg">{tier.icon}</Typography>
            </div>
            <div className="flex flex-col items-stretch flex-1 gap-1">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <Typography
                  className={'font-bold'}
                  variant="heading"
                  uiSize="md"
                >
                  {tier.label}
                </Typography>
                <div
                  className="px-2 rounded-[9999px] border"
                  style={{
                    backgroundColor: `${tier.color}15`,
                    borderColor: `${tier.color}30`,
                  }}
                >
                  <Typography variant="caption" uiSize="xs" color={tier.color}>
                    {tier.features.length} features
                  </Typography>
                </div>
                <div className="px-2 rounded-[9999px] bg-[rgba(255,255,255,0.05)]">
                  <Typography variant="caption" uiSize="xs" alpha="medium">
                    {implementedCount}/{tier.features.length} done
                  </Typography>
                </div>
              </div>
              <Typography variant="caption" alpha="medium">
                {tier.effort}
              </Typography>
            </div>
          </div>
          <div className="w-[28px] h-[28px] rounded-[9999px] bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
            <Typography
              className={'font-bold'}
              variant="body"
              uiSize="sm"
              alpha="medium"
            >
              {isExpanded ? '−' : '+'}
            </Typography>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col items-stretch gap-0">
          <div className="-mx-4 border-b border-b-[rgba(255,255,255,0.06)]" />
          <div className="flex flex-col items-stretch p-4 gap-2">
            {tier.features.map((f, idx) => (
              <div
                className="flex flex-row p-3 rounded-xl gap-3 items-start"
                style={{
                  background:
                    idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
                key={f.title}
              >
                <div
                  className="mt-1.5 w-[6px] h-[6px] rounded-[9999px] opacity-[0.6] shrink-0"
                  style={{
                    backgroundColor:
                      f.status === 'implemented'
                        ? '#22c55e'
                        : f.status === 'partial'
                          ? '#f59e0b'
                          : tier.color,
                  }}
                />
                <div className="flex flex-col items-stretch flex-1 gap-1">
                  <div className="flex flex-row justify-between items-center gap-2 flex-wrap">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                      <Typography
                        className={'font-bold'}
                        variant="label"
                        uiSize="sm"
                      >
                        {f.title}
                      </Typography>
                      {f.arc && (
                        <div className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]">
                          <Typography
                            variant="caption"
                            uiSize="xs"
                            alpha="medium"
                          >
                            {f.arc}
                          </Typography>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <StatusBadge status={f.status} />
                      <div className="px-2 rounded-[9999px] bg-[rgba(255,255,255,0.05)]">
                        <Typography
                          variant="caption"
                          uiSize="xs"
                          alpha="medium"
                        >
                          {f.effort}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  <Typography variant="body" uiSize="sm" alpha="medium">
                    {f.desc}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseTimeline({
  phases,
  hoveredPhase,
  onHover,
}: {
  phases: Phase[];
  hoveredPhase: number | null;
  onHover: (phase: number | null) => void;
}) {
  const maxDays = 61;
  return (
    <div className="flex flex-col items-stretch gap-0 relative">
      <div className="absolute left-[15px] top-[20px] bottom-[20px] w-[2px] bg-[rgba(255,255,255,0.06)] rounded" />
      {phases.map((p) => {
        const totalDays = parseInt(p.days.split('–')[1] || p.days);
        const progress = Math.min((totalDays / maxDays) * 100, 100);
        const isHovered = hoveredPhase === p.phase;

        return (
          <div
            className="flex flex-col items-stretch pl-10 py-3 relative"
            key={p.phase}
            onMouseEnter={() => onHover(p.phase)}
            onMouseLeave={() => onHover(null)}
          >
            <div
              className="absolute left-[8px] top-[50%] w-[16px] h-[16px] rounded-[9999px] border-[3px]"
              style={{
                backgroundColor: p.color,
                borderColor: isHovered ? p.color : 'rgba(255,255,255,0.1)',
                transform: isHovered ? 'translateY(-8px)' : 'none',
                boxShadow: isHovered ? `0 0 12px ${p.color}40` : 'none',
              }}
            />
            <div
              className="flex flex-row justify-between items-center p-3 rounded-xl gap-3"
              style={{
                background: isHovered
                  ? `linear-gradient(135deg, ${p.color}12, ${p.color}06)`
                  : 'rgba(255,255,255,0.02)',
                borderWidth: 1,
                borderColor: isHovered
                  ? `${p.color}30`
                  : 'rgba(255,255,255,0.04)',
              }}
            >
              <div className="flex flex-col items-stretch flex-1 gap-2">
                <div className="flex flex-row items-center gap-2">
                  <div
                    className="px-2 py-1 rounded-[9999px] border"
                    style={{
                      backgroundColor: `${p.color}20`,
                      borderColor: `${p.color}40`,
                    }}
                  >
                    <Typography
                      className={'font-bold'}
                      variant="caption"
                      uiSize="xs"
                      style={{ color: p.color }}
                    >
                      Phase {p.phase}
                    </Typography>
                  </div>
                  {p.status && (
                    <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]">
                      <Typography variant="caption" uiSize="xs" alpha="medium">
                        {p.status}
                      </Typography>
                    </div>
                  )}
                  <Typography variant="body" uiSize="sm" alpha="high">
                    {p.features}
                  </Typography>
                </div>
                <div className="w-full h-1 rounded bg-[rgba(255,255,255,0.06)] overflow-hidden">
                  <div
                    className="h-full rounded"
                    style={{
                      width: `${progress}%`,
                      backgroundColor: p.color,
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-col items-end shrink-0 pl-2">
                <Typography
                  className={'font-bold'}
                  variant="body"
                  uiSize="sm"
                  style={{ color: p.color }}
                >
                  {p.days}
                </Typography>
                <Typography variant="caption" uiSize="xs" alpha="medium">
                  days est.
                </Typography>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function RoadmapPageContent({
  initialData,
}: {
  initialData?: RoadmapData;
}) {
  const tiers =
    initialData?.tiers && initialData.tiers.length > 0
      ? initialData.tiers
      : TIERS;
  const phases =
    initialData?.phases && initialData.phases.length > 0
      ? initialData.phases
      : PHASES;
  const stats =
    initialData?.stats && initialData.stats.length > 0
      ? initialData.stats
      : STATS;

  const [expandedTier, setExpandedTier] = useState<string | null>(
    tiers[0]?.id ?? 'tier1',
  );
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const toggleTier = useCallback(
    (id: string) => setExpandedTier((prev) => (prev === id ? null : id)),
    [],
  );

  return (
    <PageLayout>
      <Container size="lg">
        <div className="flex flex-col items-stretch gap-6">
          <div
            className="flex flex-col items-stretch p-8 rounded-2xl border border-[rgba(99,102,241,0.2)] gap-4"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 50%, rgba(236,72,153,0.1) 100%)',
            }}
          >
            <div className="flex flex-col items-stretch gap-2">
              <Typography
                className={'font-extrabold'}
                variant="heading"
                uiSize="3xl"
                gradient="primary"
              >
                Arcadeum Games Roadmap
              </Typography>
              <Typography
                className={'max-w-[600px]'}
                variant="body"
                uiSize="md"
                alpha="medium"
              >
                From niche casual tool to a universally recommended platform for
                everyone — hardcore board gamers to party-game lovers.
              </Typography>
              <div className="px-3 py-1 rounded-[9999px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] self-start">
                <Typography variant="caption" uiSize="xs" alpha="medium">
                  English is the canonical version
                </Typography>
              </div>
            </div>
            <div className="flex flex-row items-stretch flex-wrap gap-3">
              {stats.map((stat) => (
                <div
                  className="flex flex-row px-4 py-3 rounded-xl gap-3 items-center bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] min-w-[140px] flex-1"
                  key={stat.label}
                >
                  <Typography uiSize="xl">{stat.icon}</Typography>
                  <div className="flex flex-col items-stretch gap-0">
                    <Typography
                      className={'font-extrabold'}
                      variant="heading"
                      uiSize="lg"
                    >
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" alpha="medium" uiSize="xs">
                      {stat.label}
                    </Typography>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Section variant="legal">
            <div className="flex flex-col items-stretch gap-3">
              <div className="flex flex-row items-center gap-2">
                <Typography
                  className={'font-extrabold'}
                  variant="heading"
                  uiSize="xl"
                >
                  Current State
                </Typography>
                <div className="px-2 py-1 rounded-[9999px] bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)]">
                  <Typography
                    className={'text-[#22c55e]'}
                    variant="label"
                    uiSize="xs"
                  >
                    LIVE
                  </Typography>
                </div>
              </div>
              <div className="flex flex-row items-stretch flex-wrap gap-2">
                {[
                  { icon: '🎮', text: '6 games live' },
                  { icon: '⚙️', text: 'Engine for 200+ games' },
                  { icon: '🤖', text: 'Bots + matchmaking' },
                  { icon: '💬', text: 'Full chat system' },
                  { icon: '🎨', text: '62 UI components' },
                  { icon: '👥', text: 'Friends + auth' },
                ].map((item) => (
                  <div
                    className="flex flex-row px-3 py-2 rounded-xl gap-2 items-center bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]"
                    key={item.text}
                  >
                    <Typography uiSize="sm">{item.icon}</Typography>
                    <Typography variant="body" uiSize="sm" alpha="high">
                      {item.text}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </Section>

          <Section variant="legal">
            <div className="flex flex-col items-stretch gap-4">
              <Typography
                className={'font-extrabold'}
                variant="heading"
                uiSize="xl"
              >
                Implementation Timeline
              </Typography>
              <PhaseTimeline
                phases={phases}
                hoveredPhase={hoveredPhase}
                onHover={setHoveredPhase}
              />
            </div>
          </Section>

          <Section variant="legal">
            <div className="flex flex-col items-stretch gap-4">
              <Typography
                className={'font-extrabold'}
                variant="heading"
                uiSize="xl"
              >
                Feature Tiers
              </Typography>
              {tiers.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isExpanded={expandedTier === tier.id}
                  onToggle={() => toggleTier(tier.id)}
                />
              ))}
            </div>
          </Section>

          <Section variant="legal">
            <div
              className="flex flex-row p-4 rounded-2xl gap-3 items-start border border-[rgba(34,197,94,0.15)]"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
              }}
            >
              <Typography uiSize="lg">⚖️</Typography>
              <div className="flex flex-col items-stretch flex-1 gap-1">
                <Typography
                  className={'font-bold'}
                  variant="heading"
                  uiSize="md"
                >
                  100% Legal — All Public Domain
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  Chess, Checkers, Go, Backgammon, Hearts, Spades, Pachisi — all
                  public domain games with no licensing required. Game rules and
                  mechanics cannot be copyrighted (Baker v. Selden, 1879). We
                  create all our own artwork and UI.
                </Typography>
              </div>
            </div>
          </Section>
        </div>
      </Container>
    </PageLayout>
  );
}
