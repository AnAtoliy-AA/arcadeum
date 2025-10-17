import React, { useCallback } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { gamesCatalog, type GameCatalogueEntry } from './catalog';

export default function GamesScreen() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const navigateToCreate = useCallback((gameId?: string) => {
    if (gameId) {
      router.push({ pathname: '/games/create', params: { gameId } } as never);
    } else {
      router.push('/games/create' as never);
    }
  }, [router]);
  const { shouldBlock } = useSessionScreenGate({
    enableOn: ['web'],
    whenUnauthenticated: '/auth',
    blockWhenUnauthenticated: true,
  });

  const handleCreate = useCallback((game: GameCatalogueEntry) => {
    navigateToCreate(game.id);
  }, [navigateToCreate]);

  const handlePreview = useCallback((game: GameCatalogueEntry) => {
    router.push({ pathname: '/games/[id]', params: { id: game.id } });
  }, [router]);

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <ThemedText type="title">Tabletop Lounge</ThemedText>
            <ThemedText style={styles.subtitle}>
              Spin up real-time rooms, invite your friends, and let AICO handle rules, scoring, and moderation.
            </ThemedText>
          </View>
          <TouchableOpacity style={styles.headerButton} onPress={() => navigateToCreate()}>
            <IconSymbol name="sparkles" size={18} color={styles.headerButtonText.color as string} />
            <ThemedText style={styles.headerButtonText}>New room</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">Featured games</ThemedText>
          <ThemedText style={styles.sectionCaption}>
            Early access titles we&apos;re polishing for launch. Tap to explore rules and reserve a playtest slot.
          </ThemedText>
        </View>

  {gamesCatalog.map(game => {
          const statusStyle =
            game.status === 'In prototype'
              ? styles.statusPrototype
              : game.status === 'In design'
                ? styles.statusDesign
                : styles.statusRoadmap;
          return (
          <ThemedView key={game.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <ThemedText type="subtitle" style={styles.cardTitle}>{game.name}</ThemedText>
              <View style={[styles.statusPill, statusStyle]}>
                <ThemedText style={styles.statusText}>{game.status}</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.cardSummary}>{game.summary}</ThemedText>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <IconSymbol name="person.3.fill" size={16} color={styles.metaChipIcon.color as string} />
                <ThemedText style={styles.metaChipText}>{game.players}</ThemedText>
              </View>
              <View style={styles.metaChip}>
                <IconSymbol name="clock.fill" size={16} color={styles.metaChipIcon.color as string} />
                <ThemedText style={styles.metaChipText}>{game.duration}</ThemedText>
              </View>
            </View>
            <View style={styles.tagRow}>
              {game.tags.map(tag => (
                <View key={tag} style={styles.tagChip}>
                  <ThemedText style={styles.tagText}>{tag}</ThemedText>
                </View>
              ))}
            </View>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.primaryButton} onPress={() => handleCreate(game)}>
                <ThemedText style={styles.primaryButtonText}>Create room</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryButton} onPress={() => handlePreview(game)}>
                <ThemedText style={styles.secondaryButtonText}>View rules</ThemedText>
              </TouchableOpacity>
            </View>
          </ThemedView>
          );
        })}

        <View style={styles.footerCard}>
          <IconSymbol name="sparkles" size={26} color={styles.footerIcon.color as string} />
          <View style={styles.footerCopy}>
            <ThemedText type="subtitle">Want a specific game?</ThemedText>
            <ThemedText style={styles.footerText}>
              Drop requests in #feature-votes or submit your own custom deck idea. Community picks go live every sprint.
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity style={styles.fab} onPress={() => navigateToCreate()}>
          <IconSymbol name="gamecontroller.fill" size={24} color={styles.fabIcon.color as string} />
          <ThemedText style={styles.fabText}>Create room</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const statusPrototypeBg = isLight ? '#D8F1FF' : '#1D3B48';
  const statusDesignBg = isLight ? '#EDE3FF' : '#2A2542';
  const statusRoadmapBg = isLight ? '#E0F6ED' : '#1F3A32';
  const surfaceShadow = isLight ? 'rgba(15, 23, 42, 0.08)' : 'rgba(8, 10, 15, 0.45)';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      padding: 24,
      gap: 16,
      paddingBottom: 48,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 16,
    },
    subtitle: {
      marginTop: 6,
      color: palette.icon,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 1,
    },
    headerButtonText: {
      color: palette.tint,
      fontWeight: '600',
    },
    section: {
      marginTop: 8,
      gap: 4,
    },
    sectionCaption: {
      color: palette.icon,
    },
    card: {
      backgroundColor: cardBackground,
      borderRadius: 16,
      padding: 20,
      gap: 12,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
    },
    cardTitle: {
      flexShrink: 1,
    },
    cardSummary: {
      color: palette.text,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 12,
    },
    metaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: raisedBackground,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    metaChipText: {
      color: palette.text,
      fontSize: 12,
      fontWeight: '600',
    },
    metaChipIcon: {
      color: palette.tint,
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    tagChip: {
      backgroundColor: raisedBackground,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 999,
    },
    tagText: {
      fontSize: 12,
      fontWeight: '500',
      color: palette.icon,
    },
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },
    primaryButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: palette.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '600',
      fontSize: 15,
    },
    secondaryButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: palette.tint,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryButtonText: {
      color: palette.tint,
      fontWeight: '600',
      fontSize: 15,
    },
    footerCard: {
      flexDirection: 'row',
      gap: 16,
      padding: 20,
      borderRadius: 16,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      alignItems: 'center',
    },
    footerIcon: {
      color: palette.tint,
    },
    footerCopy: {
      flex: 1,
      gap: 6,
    },
    footerText: {
      color: palette.icon,
      lineHeight: 20,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    statusPill: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
    },
    statusPrototype: {
      backgroundColor: statusPrototypeBg,
    },
    statusDesign: {
      backgroundColor: statusDesignBg,
    },
    statusRoadmap: {
      backgroundColor: statusRoadmapBg,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: palette.text,
    },
    fab: {
      marginTop: 12,
      borderRadius: 16,
      backgroundColor: palette.tint,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 14,
      shadowColor: surfaceShadow,
      shadowOpacity: isLight ? 1 : 0.6,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
    fabIcon: {
      color: palette.background,
    },
    fabText: {
      color: palette.background,
      fontWeight: '700',
      fontSize: 16,
    },
  });
}
