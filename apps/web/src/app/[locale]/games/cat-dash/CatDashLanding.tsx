'use client';

import { YStack, XStack, Text } from 'tamagui';

interface CatDashLandingProps {
  landing?: Record<string, unknown>;
  variants?: Record<string, unknown>;
  rules?: Record<string, unknown>;
  gameId: string;
  createRoomHref: string;
  roomsHref: string;
  gamesHref: string;
  homeHref: string;
}

export default function CatDashLanding({
  landing,
  variants: _variants,
  rules: _rules,
  gameId: _gameId,
  createRoomHref,
  roomsHref,
  gamesHref: _gamesHref,
  homeHref: _homeHref,
}: CatDashLandingProps) {
  const hero = landing?.hero as
    | {
        title?: string;
        subtitle?: string;
        ctaQuickplay?: string;
        createRoom?: string;
      }
    | undefined;
  const highlights = landing?.highlights as
    | Record<string, { title?: string; body?: string }>
    | undefined;
  const steps = landing?.steps as
    | Record<string, { title?: string; body?: string }>
    | undefined;
  const faq = landing?.faq as
    | Record<string, { question?: string; answer?: string }>
    | undefined;

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px' }}>
      <YStack gap="$6" paddingVertical="$8">
        <YStack gap="$3" alignItems="center">
          <Text fontSize={48}>🐱</Text>
          <Text fontSize={32} fontWeight="bold">
            {hero?.title ?? 'Cat Dash'}
          </Text>
          <Text fontSize={16} color="#94a3b8" maxWidth={600}>
            {hero?.subtitle ?? 'Race your cat to victory!'}
          </Text>
          <XStack gap="$3" marginTop="$4">
            <a
              href={createRoomHref}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                backgroundColor: '#7c3aed',
                color: '#fff',
                textDecoration: 'none',
                fontWeight: 'bold',
              }}
            >
              {hero?.ctaQuickplay ?? 'Play vs AI'}
            </a>
            <a
              href={roomsHref}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: '1px solid #374151',
                color: '#e2e8f0',
                textDecoration: 'none',
              }}
            >
              {hero?.createRoom ?? 'Create Room'}
            </a>
          </XStack>
        </YStack>

        {highlights && (
          <XStack gap="$4" flexWrap="wrap" justifyContent="center">
            {Object.values(highlights).map((h, i) => (
              <YStack
                key={i}
                flex={1}
                minWidth={200}
                gap="$2"
                padding="$3"
                backgroundColor="#1e293b"
                borderRadius="$4"
              >
                <Text fontWeight="bold" fontSize={16}>
                  {h.title}
                </Text>
                <Text fontSize={14} color="#94a3b8">
                  {h.body}
                </Text>
              </YStack>
            ))}
          </XStack>
        )}

        {steps && (
          <YStack gap="$4">
            <Text fontSize={24} fontWeight="bold" textAlign="center">
              How to Play
            </Text>
            <XStack gap="$4" flexWrap="wrap" justifyContent="center">
              {Object.values(steps).map((s, i) => (
                <YStack
                  key={i}
                  flex={1}
                  minWidth={200}
                  gap="$2"
                  padding="$3"
                  backgroundColor="#0f172a"
                  borderRadius="$4"
                >
                  <Text fontWeight="bold" fontSize={16}>
                    {s.title}
                  </Text>
                  <Text fontSize={14} color="#94a3b8">
                    {s.body}
                  </Text>
                </YStack>
              ))}
            </XStack>
          </YStack>
        )}

        {faq && (
          <YStack gap="$4" id="faq">
            <Text fontSize={24} fontWeight="bold" textAlign="center">
              FAQ
            </Text>
            {Object.values(faq).map((item, i) => (
              <YStack
                key={i}
                gap="$2"
                padding="$3"
                backgroundColor="#1e293b"
                borderRadius="$4"
              >
                <Text fontWeight="bold">{item.question}</Text>
                <Text fontSize={14} color="#94a3b8">
                  {item.answer}
                </Text>
              </YStack>
            ))}
          </YStack>
        )}
      </YStack>
    </div>
  );
}
