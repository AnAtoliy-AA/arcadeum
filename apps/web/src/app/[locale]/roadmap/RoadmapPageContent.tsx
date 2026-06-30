'use client';

import { useState } from 'react';
import {
  PageLayout,
  Container,
  GlassCard,
  PageTitle,
  Typography,
  Section,
  XStack,
  YStack,
} from '@arcadeum/ui';
import { View } from 'tamagui';

type Tier = {
  id: string;
  label: string;
  effort: string;
  features: { title: string; desc: string; effort: string }[];
};

const TIERS: Tier[] = [
  {
    id: 'tier1',
    label: 'Tier 1 — Quick Wins',
    effort: '1–3 days each',
    features: [
      {
        title: 'Account-less Stat Tracking',
        desc: 'Local browser-based win/loss records, streaks, and favorite game — no signup needed.',
        effort: '1–2 days',
      },
      {
        title: 'In-game Emotes',
        desc: 'Quick reactions (👍 😂 🤔 🎉 😤 💀) displayed as animated bubbles.',
        effort: '1–2 days',
      },
      {
        title: 'House Rules / Game Config',
        desc: 'Toggleable settings per game — grid size, ship count, special weapons, board variants.',
        effort: '2–3 days',
      },
      {
        title: 'Dark Mode',
        desc: "System-wide theme toggle using Tamagui's built-in theme system.",
        effort: '1 day',
      },
      {
        title: 'Undo / Take-Back',
        desc: 'Request an undo in casual games — opponent must approve.',
        effort: '1–2 days',
      },
      {
        title: 'Password-Protected Rooms',
        desc: 'Set a password on private rooms for invite-only play.',
        effort: '1 day',
      },
    ],
  },
  {
    id: 'tier2',
    label: 'Tier 2 — Core Additions',
    effort: '2–7 days each',
    features: [
      {
        title: 'Chess',
        desc: 'Full rules including castling, en passant, promotion. Bot with minimax + alpha-beta pruning. Chess960 variant.',
        effort: '5–7 days',
      },
      {
        title: 'Checkers',
        desc: 'Standard 8x8 with forced captures, multi-jump, king promotion. International draughts variant.',
        effort: '4–5 days',
      },
      {
        title: 'AI Difficulty Tiers',
        desc: 'Easy / Medium / Hard / Expert for each bot. Random → heuristics → deep search.',
        effort: '2–3 days/game',
      },
      {
        title: 'Matchmaking Queue',
        desc: 'Real-time queue system — find opponents instantly or fall back to bots.',
        effort: '3–5 days',
      },
      {
        title: 'Ranked Play (ELO)',
        desc: 'Per-game skill ratings with tiers: Bronze → Grandmaster. Seasonal resets.',
        effort: '5–7 days',
      },
      {
        title: 'Achievements & Badges',
        desc: 'Collectible milestones — first win, streaks, difficulty clears. Displayed on profile.',
        effort: '3–4 days',
      },
      {
        title: 'Audio Cues',
        desc: 'Short sounds for emotes, turns, game events. Web Audio API with mute toggle.',
        effort: '1 day',
      },
    ],
  },
  {
    id: 'tier3',
    label: 'Tier 3 — Card & Board Games',
    effort: '4–7 days each',
    features: [
      {
        title: 'Hearts',
        desc: '4-player trick-taking — queen of spades, shooting the moon, passing phase.',
        effort: '5–7 days',
      },
      {
        title: 'Spades',
        desc: '4-player trick-taking with bidding, nil bid, partnerships.',
        effort: '5–7 days',
      },
      {
        title: 'Backgammon',
        desc: '24-point board, bearing off, doubling cube. Probability-based bot.',
        effort: '5–7 days',
      },
      {
        title: 'Pachisi',
        desc: 'Original Ludo — 4-player race game with dice and home stretch.',
        effort: '4–5 days',
      },
      {
        title: 'Post-Game Analysis',
        desc: 'Review where mistakes were made — position evaluation, turning points, material graphs.',
        effort: '3–5 days',
      },
      {
        title: 'Move Hints / Coach Mode',
        desc: 'Optional AI hints during gameplay — suggest the best move with brief explanation.',
        effort: '2–3 days',
      },
    ],
  },
  {
    id: 'tier4',
    label: 'Tier 4 — Community & Social',
    effort: '3–10 days each',
    features: [
      {
        title: 'Go (Baduk)',
        desc: '9×9 / 13×13 / 19×19. Liberty counting, capture, ko rule. MCTS bot.',
        effort: '10–14 days',
      },
      {
        title: 'Clans / Groups',
        desc: 'Persistent groups with chat, internal leaderboards, and group challenges.',
        effort: '5–7 days',
      },
      {
        title: 'Game Replays',
        desc: 'Record and share game replays with step-by-step playback and speed controls.',
        effort: '4–5 days',
      },
      {
        title: 'Spectator Mode',
        desc: 'Watch ongoing matches with live reactions. Spectator count displayed.',
        effort: '3–4 days',
      },
      {
        title: 'Community Game Nights',
        desc: 'Scheduled events — featured game, time window, live status, post-event stats.',
        effort: '3–4 days',
      },
    ],
  },
  {
    id: 'tier5',
    label: 'Tier 5 — Platform Polish',
    effort: '1–10 days each',
    features: [
      {
        title: 'Chess Clock (Universal Timer)',
        desc: 'Configurable time controls for any turn-based game. Flag system.',
        effort: '3–4 days',
      },
      {
        title: 'Cross-Game Stats Dashboard',
        desc: 'Single view of all stats — total games, win rate, streaks, time played.',
        effort: '2–3 days',
      },
      {
        title: 'Interactive Tutorials',
        desc: 'Step-by-step guided walkthroughs for each game before first play.',
        effort: '3–5 days',
      },
      {
        title: 'Daily Challenges',
        desc: 'Rotating daily objectives with streak bonuses and cosmetic rewards.',
        effort: '2–3 days',
      },
      {
        title: 'Season System',
        desc: 'Quarterly seasons with soft resets, seasonal cosmetics, and leaderboards.',
        effort: '5–7 days',
      },
      {
        title: 'Colorblind Modes',
        desc: 'Deuteranopia / Protanopia / Tritanopia presets with pattern overlays.',
        effort: '1–2 days',
      },
      {
        title: 'Screen Reader & Keyboard Navigation',
        desc: 'Full ARIA labels, keyboard-only board control, focus indicators.',
        effort: '4–6 days',
      },
      {
        title: 'PWA Support',
        desc: 'Installable as an app — service worker, offline caching, manifest.',
        effort: '2–3 days',
      },
      {
        title: 'Offline Bot Mode',
        desc: 'Play vs AI without internet — cached engines, WASM bots, sync on reconnect.',
        effort: '3–5 days',
      },
      {
        title: 'Push Notifications',
        desc: '"It\'s your turn!" browser push notifications with deep links.',
        effort: '3–4 days',
      },
      {
        title: 'Web Share API',
        desc: 'One-tap sharing of game results to social media or clipboard.',
        effort: '1 day',
      },
      {
        title: 'Tournament System',
        desc: 'Single-elimination and round-robin brackets with timed rounds.',
        effort: '7–10 days',
      },
      {
        title: 'Leaderboards',
        desc: 'Global, per-game, and friends-only leaderboards with real-time updates.',
        effort: '3–4 days',
      },
    ],
  },
];

const PHASES = [
  {
    phase: 1,
    features:
      'Stats + Emotes + House Rules + Dark Mode + Undo + Password Rooms',
    days: '8–12',
  },
  {
    phase: 2,
    features: 'Chess + Checkers + AI Difficulty + Audio + Coach Mode',
    days: '14–20',
  },
  {
    phase: 3,
    features: 'Matchmaking Queue + Ranked/ELO + Achievements + Leaderboards',
    days: '15–20',
  },
  {
    phase: 4,
    features: 'Hearts + Spades + Backgammon + Pachisi + Post-game Analysis',
    days: '22–28',
  },
  {
    phase: 5,
    features: 'Go + Clans + Game Nights + Replays + Spectator Mode',
    days: '28–38',
  },
  {
    phase: 6,
    features: 'Tournaments + Seasons + Daily Challenges + Colorblind + A11y',
    days: '20–28',
  },
  {
    phase: 7,
    features: 'PWA + Offline + Push Notifications + Share + Timer System',
    days: '10–16',
  },
  {
    phase: 8,
    features: 'Voice Chat + Board Game Creator + Mobile Port + Monetization',
    days: '42–61',
  },
];

export default function RoadmapPageContent() {
  const [expandedTier, setExpandedTier] = useState<string | null>('tier1');

  return (
    <PageLayout>
      <Container size="lg">
        <GlassCard>
          <PageTitle size="xl" gradient>
            Arcadeum Roadmap
          </PageTitle>
          <Typography variant="caption" alpha="medium">
            31 features across 8 phases — all public domain games, no licenses
            needed.
          </Typography>
        </GlassCard>

        <Section variant="legal">
          <YStack gap="$3">
            <Typography variant="label" uiSize="lg" fontWeight="700">
              Current State
            </Typography>
            <XStack flexWrap="wrap" gap="$3">
              {[
                '6 games implemented',
                'Game engine for 200+ games',
                'Basic matchmaking + bots',
                'Full chat system',
                '62 UI components',
                'Friends + auth system',
              ].map((item) => (
                <GlassCard
                  key={item}
                  px="$3"
                  py="$2"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <Typography variant="body" uiSize="sm" alpha="high">
                    {item}
                  </Typography>
                </GlassCard>
              ))}
            </XStack>
          </YStack>
        </Section>

        <Section variant="legal">
          <YStack gap="$3">
            <Typography variant="label" uiSize="lg" fontWeight="700">
              Implementation Phases
            </Typography>
            <YStack gap="$2">
              {PHASES.map((p) => (
                <GlassCard
                  key={p.phase}
                  p="$3"
                  borderWidth={1}
                  borderColor="$borderColor"
                >
                  <XStack justifyContent="space-between" alignItems="center">
                    <XStack gap="$3" alignItems="center" flex={1}>
                      <GlassCard
                        px="$2"
                        py="$1"
                        borderRadius={9999}
                        backgroundColor="$primary"
                      >
                        <Typography
                          variant="label"
                          uiSize="xs"
                          fontWeight="700"
                        >
                          P{p.phase}
                        </Typography>
                      </GlassCard>
                      <Typography
                        variant="body"
                        uiSize="sm"
                        alpha="high"
                        flex={1}
                      >
                        {p.features}
                      </Typography>
                    </XStack>
                    <Typography variant="caption" alpha="medium" ml="$3">
                      {p.days}d
                    </Typography>
                  </XStack>
                </GlassCard>
              ))}
            </YStack>
            <GlassCard p="$3" borderWidth={1} borderColor="$primary">
              <XStack justifyContent="space-between" alignItems="center">
                <Typography variant="label" uiSize="md" fontWeight="700">
                  Total Estimated
                </Typography>
                <Typography
                  variant="label"
                  uiSize="md"
                  fontWeight="700"
                  color="$primary"
                >
                  159–223 working days
                </Typography>
              </XStack>
            </GlassCard>
          </YStack>
        </Section>

        <Section variant="legal">
          <YStack gap="$3">
            <Typography variant="label" uiSize="lg" fontWeight="700">
              Feature Tiers
            </Typography>
            {TIERS.map((tier) => (
              <GlassCard
                key={tier.id}
                p="$4"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <YStack
                  pressStyle={{ opacity: 0.7 }}
                  cursor="pointer"
                  p="$0"
                  onPress={() =>
                    setExpandedTier(expandedTier === tier.id ? null : tier.id)
                  }
                >
                  <XStack
                    justifyContent="space-between"
                    alignItems="center"
                    flex={1}
                  >
                    <YStack alignItems="flex-start" flex={1}>
                      <Typography variant="label" uiSize="md" fontWeight="700">
                        {tier.label}
                      </Typography>
                      <Typography variant="caption" alpha="medium">
                        {tier.effort}
                      </Typography>
                    </YStack>
                    <Typography variant="body" uiSize="sm" alpha="medium">
                      {expandedTier === tier.id ? '−' : '+'}
                    </Typography>
                  </XStack>
                </YStack>

                {expandedTier === tier.id && (
                  <>
                    <View
                      my="$3"
                      borderBottomWidth={1}
                      borderBottomColor="$borderColor"
                    />
                    <YStack gap="$3">
                      {tier.features.map((f) => (
                        <YStack key={f.title} gap="$1">
                          <XStack
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography
                              variant="label"
                              uiSize="sm"
                              fontWeight="700"
                            >
                              {f.title}
                            </Typography>
                            <Typography variant="caption" alpha="medium">
                              {f.effort}
                            </Typography>
                          </XStack>
                          <Typography variant="body" uiSize="sm" alpha="medium">
                            {f.desc}
                          </Typography>
                        </YStack>
                      ))}
                    </YStack>
                  </>
                )}
              </GlassCard>
            ))}
          </YStack>
        </Section>

        <Section variant="legal">
          <YStack gap="$2">
            <Typography variant="label" uiSize="lg" fontWeight="700">
              Legal Note
            </Typography>
            <Typography variant="body" uiSize="sm" alpha="medium">
              All games in this roadmap are public domain — Chess, Checkers, Go,
              Backgammon, Hearts, Spades, Pachisi. Game rules and mechanics
              cannot be copyrighted (Baker v. Selden, 1879). Only specific
              artistic expressions can be. As long as we create our own artwork
              and UI, we are fully legal.
            </Typography>
          </YStack>
        </Section>
      </Container>
    </PageLayout>
  );
}
