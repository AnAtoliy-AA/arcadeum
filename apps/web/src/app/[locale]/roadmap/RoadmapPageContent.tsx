'use client';

import { useState, useCallback } from 'react';
import {
  PageLayout,
  Container,
  Typography,
  Section,
  XStack,
  YStack,
} from '@arcadeum/ui';
import { View } from 'tamagui';
import { TIERS, PHASES, STATS, type Tier } from './roadmap-data';

function TierCard({
  tier,
  isExpanded,
  onToggle,
}: {
  tier: Tier;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <YStack
      borderRadius="$4"
      overflow="hidden"
      style={{
        background: isExpanded ? tier.gradient : 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: isExpanded ? `${tier.color}30` : 'rgba(255,255,255,0.06)',
      }}
    >
      <YStack
        pressStyle={{ opacity: 0.8 }}
        cursor="pointer"
        onPress={onToggle}
        p="$4"
      >
        <XStack justifyContent="space-between" alignItems="center">
          <XStack gap="$3" alignItems="center" flex={1}>
            <View
              width={40}
              height={40}
              borderRadius="$3"
              backgroundColor={`${tier.color}20`}
              alignItems="center"
              justifyContent="center"
            >
              <Typography uiSize="lg">{tier.icon}</Typography>
            </View>
            <YStack flex={1} gap="$1">
              <XStack alignItems="center" gap="$2">
                <Typography variant="heading" uiSize="md" fontWeight="700">
                  {tier.label}
                </Typography>
                <View
                  px="$2"
                  py="$0.5"
                  borderRadius={9999}
                  backgroundColor={`${tier.color}15`}
                  borderWidth={1}
                  borderColor={`${tier.color}30`}
                >
                  <Typography variant="caption" uiSize="xs" color={tier.color}>
                    {tier.features.length} features
                  </Typography>
                </View>
              </XStack>
              <Typography variant="caption" alpha="medium">
                {tier.effort}
              </Typography>
            </YStack>
          </XStack>
          <View
            width={28}
            height={28}
            borderRadius={9999}
            backgroundColor="rgba(255,255,255,0.05)"
            alignItems="center"
            justifyContent="center"
          >
            <Typography
              variant="body"
              uiSize="sm"
              alpha="medium"
              fontWeight="700"
            >
              {isExpanded ? '−' : '+'}
            </Typography>
          </View>
        </XStack>
      </YStack>

      {isExpanded && (
        <YStack gap="$0">
          <View
            mx="$4"
            borderBottomWidth={1}
            borderBottomColor="rgba(255,255,255,0.06)"
          />
          <YStack p="$4" gap="$2">
            {tier.features.map((f, idx) => (
              <XStack
                key={f.title}
                p="$3"
                borderRadius="$3"
                gap="$3"
                alignItems="flex-start"
                style={{
                  background:
                    idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
              >
                <View
                  mt="$1"
                  width={6}
                  height={6}
                  borderRadius={9999}
                  backgroundColor={tier.color}
                  opacity={0.6}
                  flexShrink={0}
                />
                <YStack flex={1} gap="$1">
                  <XStack justifyContent="space-between" alignItems="center">
                    <Typography variant="label" uiSize="sm" fontWeight="700">
                      {f.title}
                    </Typography>
                    <View
                      px="$2"
                      py="$0.5"
                      borderRadius={9999}
                      backgroundColor="rgba(255,255,255,0.05)"
                    >
                      <Typography variant="caption" uiSize="xs" alpha="medium">
                        {f.effort}
                      </Typography>
                    </View>
                  </XStack>
                  <Typography variant="body" uiSize="sm" alpha="medium">
                    {f.desc}
                  </Typography>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}

function PhaseTimeline({
  hoveredPhase,
  onHover,
}: {
  hoveredPhase: number | null;
  onHover: (phase: number | null) => void;
}) {
  const maxDays = 61;
  return (
    <YStack gap="$0" position="relative">
      <View
        position="absolute"
        left={15}
        top={20}
        bottom={20}
        width={2}
        backgroundColor="rgba(255,255,255,0.06)"
        borderRadius={1}
      />
      {PHASES.map((p) => {
        const totalDays = parseInt(p.days.split('–')[1] || p.days);
        const progress = Math.min((totalDays / maxDays) * 100, 100);
        const isHovered = hoveredPhase === p.phase;

        return (
          <YStack
            key={p.phase}
            pl="$10"
            py="$3"
            position="relative"
            onMouseEnter={() => onHover(p.phase)}
            onMouseLeave={() => onHover(null)}
          >
            <View
              position="absolute"
              left={8}
              top="50%"
              width={16}
              height={16}
              borderRadius={9999}
              backgroundColor={p.color}
              borderWidth={3}
              borderColor={isHovered ? p.color : 'rgba(255,255,255,0.1)'}
              style={{
                transform: [{ translateY: -8 }],
                boxShadow: isHovered ? `0 0 12px ${p.color}40` : 'none',
              }}
            />
            <XStack
              justifyContent="space-between"
              alignItems="center"
              p="$3"
              borderRadius="$3"
              gap="$3"
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
              <YStack flex={1} gap="$2">
                <XStack alignItems="center" gap="$2">
                  <View
                    px="$2"
                    py="$1"
                    borderRadius={9999}
                    backgroundColor={`${p.color}20`}
                    borderWidth={1}
                    borderColor={`${p.color}40`}
                  >
                    <Typography
                      variant="label"
                      uiSize="xs"
                      fontWeight="700"
                      color={p.color}
                    >
                      Phase {p.phase}
                    </Typography>
                  </View>
                  <Typography variant="caption" alpha="medium" uiSize="xs">
                    {p.days} days
                  </Typography>
                </XStack>
                <Typography variant="body" uiSize="sm" alpha="high">
                  {p.features}
                </Typography>
                <View
                  height={4}
                  borderRadius={2}
                  backgroundColor="rgba(255,255,255,0.05)"
                  overflow="hidden"
                >
                  <View
                    height={4}
                    borderRadius={2}
                    backgroundColor={p.color}
                    width={`${progress}%`}
                    opacity={0.7}
                  />
                </View>
              </YStack>
            </XStack>
          </YStack>
        );
      })}
    </YStack>
  );
}

export default function RoadmapPageContent() {
  const [expandedTier, setExpandedTier] = useState<string | null>('tier1');
  const [hoveredPhase, setHoveredPhase] = useState<number | null>(null);
  const toggleTier = useCallback(
    (id: string) => setExpandedTier((prev) => (prev === id ? null : id)),
    [],
  );

  return (
    <PageLayout>
      <Container size="lg">
        <YStack gap="$6">
          <YStack
            p="$8"
            borderRadius="$4"
            style={{
              background:
                'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(168,85,247,0.15) 50%, rgba(236,72,153,0.1) 100%)',
            }}
            borderWidth={1}
            borderColor="rgba(99,102,241,0.2)"
            gap="$4"
          >
            <YStack gap="$2">
              <Typography
                variant="heading"
                uiSize="3xl"
                fontWeight="800"
                gradient="primary"
              >
                Arcadeum Roadmap
              </Typography>
              <Typography
                variant="body"
                uiSize="md"
                alpha="medium"
                maxWidth={600}
              >
                From niche casual tool to a universally recommended platform for
                everyone — hardcore board gamers to party-game lovers.
              </Typography>
              <View
                px="$3"
                py="$1"
                borderRadius={9999}
                backgroundColor="rgba(255,255,255,0.06)"
                borderWidth={1}
                borderColor="rgba(255,255,255,0.1)"
                alignSelf="flex-start"
              >
                <Typography variant="caption" uiSize="xs" alpha="medium">
                  English is the canonical version
                </Typography>
              </View>
            </YStack>
            <XStack flexWrap="wrap" gap="$3">
              {STATS.map((stat) => (
                <XStack
                  key={stat.label}
                  px="$4"
                  py="$3"
                  borderRadius="$3"
                  gap="$3"
                  alignItems="center"
                  backgroundColor="rgba(255,255,255,0.05)"
                  borderWidth={1}
                  borderColor="rgba(255,255,255,0.08)"
                  minWidth={140}
                  flex={1}
                >
                  <Typography uiSize="xl">{stat.icon}</Typography>
                  <YStack gap="$0">
                    <Typography variant="heading" uiSize="lg" fontWeight="800">
                      {stat.value}
                    </Typography>
                    <Typography variant="caption" alpha="medium" uiSize="xs">
                      {stat.label}
                    </Typography>
                  </YStack>
                </XStack>
              ))}
            </XStack>
          </YStack>

          <Section variant="legal">
            <YStack gap="$3">
              <XStack alignItems="center" gap="$2">
                <Typography variant="heading" uiSize="xl" fontWeight="800">
                  Current State
                </Typography>
                <View
                  px="$2"
                  py="$1"
                  borderRadius={9999}
                  backgroundColor="rgba(34,197,94,0.15)"
                  borderWidth={1}
                  borderColor="rgba(34,197,94,0.3)"
                >
                  <Typography variant="label" uiSize="xs" color="#22c55e">
                    LIVE
                  </Typography>
                </View>
              </XStack>
              <XStack flexWrap="wrap" gap="$2">
                {[
                  { icon: '🎮', text: '6 games live' },
                  { icon: '⚙️', text: 'Engine for 200+ games' },
                  { icon: '🤖', text: 'Bots + matchmaking' },
                  { icon: '💬', text: 'Full chat system' },
                  { icon: '🎨', text: '62 UI components' },
                  { icon: '👥', text: 'Friends + auth' },
                ].map((item) => (
                  <XStack
                    key={item.text}
                    px="$3"
                    py="$2"
                    borderRadius="$3"
                    gap="$2"
                    alignItems="center"
                    backgroundColor="rgba(255,255,255,0.03)"
                    borderWidth={1}
                    borderColor="rgba(255,255,255,0.06)"
                  >
                    <Typography uiSize="sm">{item.icon}</Typography>
                    <Typography variant="body" uiSize="sm" alpha="high">
                      {item.text}
                    </Typography>
                  </XStack>
                ))}
              </XStack>
            </YStack>
          </Section>

          <Section variant="legal">
            <YStack gap="$4">
              <Typography variant="heading" uiSize="xl" fontWeight="800">
                Implementation Timeline
              </Typography>
              <PhaseTimeline
                hoveredPhase={hoveredPhase}
                onHover={setHoveredPhase}
              />
            </YStack>
          </Section>

          <Section variant="legal">
            <YStack gap="$4">
              <Typography variant="heading" uiSize="xl" fontWeight="800">
                Feature Tiers
              </Typography>
              {TIERS.map((tier) => (
                <TierCard
                  key={tier.id}
                  tier={tier}
                  isExpanded={expandedTier === tier.id}
                  onToggle={() => toggleTier(tier.id)}
                />
              ))}
            </YStack>
          </Section>

          <Section variant="legal">
            <XStack
              p="$4"
              borderRadius="$4"
              gap="$3"
              alignItems="flex-start"
              style={{
                background:
                  'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
              }}
              borderWidth={1}
              borderColor="rgba(34,197,94,0.15)"
            >
              <Typography uiSize="lg">⚖️</Typography>
              <YStack flex={1} gap="$1">
                <Typography variant="heading" uiSize="md" fontWeight="700">
                  100% Legal — All Public Domain
                </Typography>
                <Typography variant="body" uiSize="sm" alpha="medium">
                  Chess, Checkers, Go, Backgammon, Hearts, Spades, Pachisi — all
                  public domain games with no licensing required. Game rules and
                  mechanics cannot be copyrighted (Baker v. Selden, 1879). We
                  create all our own artwork and UI.
                </Typography>
              </YStack>
            </XStack>
          </Section>
        </YStack>
      </Container>
    </PageLayout>
  );
}
