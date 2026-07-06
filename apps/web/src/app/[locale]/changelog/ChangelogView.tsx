'use client';

import { useState, useMemo } from 'react';
import {
  PageLayout,
  Container,
  Typography,
  Section,
  XStack,
  YStack,
} from '@arcadeum/ui';
import { View } from 'tamagui';
import type { ChangelogEntry } from './page';

const SECTION_COLORS: Record<string, string> = {
  Added: '#22c55e',
  Fixed: '#3b82f6',
  Changed: '#f59e0b',
  Deprecated: '#a855f7',
  Removed: '#ef4444',
  Security: '#ec4899',
  Refactored: '#6366f1',
  Improved: '#14b8a6',
  Documentation: '#8b5cf6',
};

function VersionCard({
  entry,
  isExpanded,
  isReleased,
  onToggle,
}: {
  entry: ChangelogEntry;
  isExpanded: boolean;
  isReleased: boolean;
  onToggle: () => void;
}) {
  const totalChanges = entry.sections.reduce(
    (sum, s) => sum + s.items.length,
    0,
  );

  return (
    <YStack
      borderRadius="$4"
      overflow="hidden"
      style={{
        background: isExpanded
          ? 'rgba(255,255,255,0.03)'
          : 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: isExpanded
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(255,255,255,0.04)',
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
              px="$3"
              py="$1.5"
              borderRadius={9999}
              backgroundColor="rgba(99,102,241,0.15)"
              borderWidth={1}
              borderColor="rgba(99,102,241,0.3)"
            >
              <Typography
                variant="label"
                uiSize="sm"
                fontWeight="700"
                color="#6366f1"
              >
                v{entry.version}
              </Typography>
            </View>
            {entry.date && (
              <Typography variant="caption" alpha="medium" uiSize="sm">
                {entry.date}
              </Typography>
            )}
            {isReleased && (
              <View
                px="$2"
                py="$1"
                borderRadius={9999}
                backgroundColor="rgba(34,197,94,0.15)"
                borderWidth={1}
                borderColor="rgba(34,197,94,0.3)"
              >
                <Typography
                  variant="label"
                  uiSize="xs"
                  fontWeight="700"
                  color="#22c55e"
                >
                  Released
                </Typography>
              </View>
            )}
          </XStack>
          <XStack gap="$2" alignItems="center">
            <View
              px="$2"
              py="$0.5"
              borderRadius={9999}
              backgroundColor="rgba(255,255,255,0.05)"
            >
              <Typography variant="caption" uiSize="xs" alpha="medium">
                {totalChanges} changes
              </Typography>
            </View>
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
        </XStack>
      </YStack>

      {isExpanded && (
        <YStack gap="$0">
          <View
            mx="$4"
            borderBottomWidth={1}
            borderBottomColor="rgba(255,255,255,0.06)"
          />
          <YStack p="$4" gap="$4">
            {entry.sections.map((section) => (
              <YStack key={section.type} gap="$2">
                <XStack alignItems="center" gap="$2">
                  <View
                    width={8}
                    height={8}
                    borderRadius={9999}
                    backgroundColor={SECTION_COLORS[section.type] || '#6b7280'}
                  />
                  <Typography
                    variant="label"
                    uiSize="sm"
                    fontWeight="700"
                    color={SECTION_COLORS[section.type] || '#6b7280'}
                  >
                    {section.type}
                  </Typography>
                  <View
                    px="$1.5"
                    py="$0.5"
                    borderRadius={9999}
                    backgroundColor="rgba(255,255,255,0.05)"
                  >
                    <Typography variant="caption" uiSize="xs" alpha="medium">
                      {section.items.length}
                    </Typography>
                  </View>
                </XStack>
                <YStack pl="$5" gap="$1.5">
                  {section.items.map((item, idx) => (
                    <XStack key={idx} gap="$2" alignItems="flex-start">
                      <View
                        mt="$1.5"
                        width={4}
                        height={4}
                        borderRadius={9999}
                        backgroundColor={
                          SECTION_COLORS[section.type] || '#6b7280'
                        }
                        opacity={0.4}
                        flexShrink={0}
                      />
                      <Typography
                        variant="body"
                        uiSize="sm"
                        alpha="high"
                        flex={1}
                      >
                        {item}
                      </Typography>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            ))}
          </YStack>
        </YStack>
      )}
    </YStack>
  );
}

export default function ChangelogView({
  entries,
}: {
  entries: ChangelogEntry[];
}) {
  const [expandedVersion, setExpandedVersion] = useState<string | null>(
    entries[0]?.version ?? null,
  );
  const [showAll, setShowAll] = useState(false);

  const visibleEntries = useMemo(
    () => (showAll ? entries : entries.slice(0, 10)),
    [entries, showAll],
  );

  const releasedVersions = useMemo(() => {
    const released = new Set<string>();
    if (entries.length > 0) released.add(entries[0].version);
    for (let i = 1; i < entries.length; i++) {
      const [major, minor] = entries[i].version.split('.').map(Number);
      const prev = entries[i - 1];
      const [prevMajor, prevMinor] = prev.version.split('.').map(Number);
      if (major < prevMajor || minor < prevMinor) {
        released.add(entries[i].version);
      }
    }
    return released;
  }, [entries]);

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
            gap="$3"
          >
            <Typography
              variant="heading"
              uiSize="3xl"
              fontWeight="800"
              gradient="primary"
            >
              Changelog
            </Typography>
            <Typography
              variant="body"
              uiSize="md"
              alpha="medium"
              maxWidth={500}
            >
              All notable changes to Arcadeum are documented here. Follow
              Semantic Versioning.
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
                {entries.length} releases
              </Typography>
            </View>
          </YStack>

          <Section variant="legal">
            <YStack gap="$3">
              {visibleEntries.map((entry) => (
                <VersionCard
                  key={entry.version}
                  entry={entry}
                  isExpanded={expandedVersion === entry.version}
                  isReleased={releasedVersions.has(entry.version)}
                  onToggle={() =>
                    setExpandedVersion(
                      expandedVersion === entry.version ? null : entry.version,
                    )
                  }
                />
              ))}
            </YStack>
          </Section>

          {!showAll && entries.length > 10 && (
            <XStack justifyContent="center">
              <View
                px="$6"
                py="$3"
                borderRadius="$3"
                cursor="pointer"
                pressStyle={{ opacity: 0.8 }}
                onPress={() => setShowAll(true)}
                backgroundColor="rgba(99,102,241,0.15)"
                borderWidth={1}
                borderColor="rgba(99,102,241,0.3)"
              >
                <Typography
                  variant="label"
                  uiSize="sm"
                  color="#6366f1"
                  fontWeight="600"
                >
                  Show all {entries.length} releases
                </Typography>
              </View>
            </XStack>
          )}
        </YStack>
      </Container>
    </PageLayout>
  );
}
