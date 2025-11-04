import React, { useCallback, useMemo } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { useAppName } from '@/hooks/useAppName';
import {
  gamesCatalog,
  type GameCatalogueEntry,
} from '@/pages/GamesScreen/catalog';
import { platformShadow } from '@/lib/platformShadow';

const BASE_TOP_PADDING = 24;

export default function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const appName = useAppName();
  const router = useRouter();

  const playableGames = useMemo(
    () => gamesCatalog.filter((game) => game.isPlayable),
    [],
  );
  const defaultPlayableId = playableGames[0]?.id;
  const canCreateAny = Boolean(defaultPlayableId);

  const showUnavailableAlert = useCallback(() => {
    Alert.alert(
      t('games.create.alerts.gameUnavailableTitle'),
      t('games.create.alerts.gameUnavailableMessage'),
    );
  }, [t]);

  const navigateToCreate = useCallback(
    (gameId?: string) => {
      const targetId = gameId ?? defaultPlayableId;
      if (!targetId) {
        showUnavailableAlert();
        return;
      }

      router.push({
        pathname: '/games/create',
        params: { gameId: targetId },
      } as never);
    },
    [defaultPlayableId, router, showUnavailableAlert],
  );

  const handleCreate = useCallback(
    (game: GameCatalogueEntry) => {
      if (!game.isPlayable) {
        showUnavailableAlert();
        return;
      }

      navigateToCreate(game.id);
    },
    [navigateToCreate, showUnavailableAlert],
  );

  const handlePreview = useCallback(
    (game: GameCatalogueEntry) => {
      router.push({ pathname: '/games/[id]', params: { id: game.id } });
    },
    [router],
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            {t('games.lounge.title')}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {t('games.lounge.subtitle', { appName })}
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.headerButton,
              !canCreateAny && styles.headerButtonDisabled,
            ]}
            onPress={() => navigateToCreate()}
            disabled={!canCreateAny}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canCreateAny }}
          >
            <IconSymbol
              name="sparkles"
              size={18}
              color={styles.headerButtonText.color as string}
            />
            <ThemedText style={styles.headerButtonText}>
              {t('games.common.createRoom')}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle">
            {t('games.lounge.featuredTitle')}
          </ThemedText>
          <ThemedText style={styles.sectionCaption}>
            {t('games.lounge.featuredCaption')}
          </ThemedText>
        </View>

        {gamesCatalog.map((game) => {
          const statusStyle =
            game.status === 'In prototype'
              ? styles.statusPrototype
              : game.status === 'In design'
                ? styles.statusDesign
                : styles.statusRoadmap;
          const isPlayable = Boolean(game.isPlayable);

          return (
            <ThemedView key={game.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {game.name}
                </ThemedText>
                <View style={[styles.statusPill, statusStyle]}>
                  <ThemedText style={styles.statusText}>
                    {game.status}
                  </ThemedText>
                </View>
              </View>
              <ThemedText style={styles.cardSummary}>{game.summary}</ThemedText>
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <IconSymbol
                    name="person.3.fill"
                    size={16}
                    color={styles.metaChipIcon.color as string}
                  />
                  <ThemedText style={styles.metaChipText}>
                    {game.players}
                  </ThemedText>
                </View>
                <View style={styles.metaChip}>
                  <IconSymbol
                    name="clock.fill"
                    size={16}
                    color={styles.metaChipIcon.color as string}
                  />
                  <ThemedText style={styles.metaChipText}>
                    {game.duration}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.tagRow}>
                {game.tags.map((tag) => (
                  <View key={tag} style={styles.tagChip}>
                    <ThemedText style={styles.tagText}>{tag}</ThemedText>
                  </View>
                ))}
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !isPlayable && styles.primaryButtonDisabled,
                  ]}
                  onPress={() => handleCreate(game)}
                  disabled={!isPlayable}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !isPlayable }}
                >
                  <ThemedText
                    style={[
                      styles.primaryButtonText,
                      !isPlayable && styles.primaryButtonTextDisabled,
                    ]}
                  >
                    {t('games.common.createRoom')}
                  </ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={() => handlePreview(game)}
                >
                  <ThemedText style={styles.secondaryButtonText}>
                    {t('games.common.viewRules')}
                  </ThemedText>
                </TouchableOpacity>
              </View>
              {!isPlayable ? (
                <ThemedText style={styles.comingSoonHint}>
                  {t('games.create.badgeComingSoon')}
                </ThemedText>
              ) : null}
            </ThemedView>
          );
        })}

        <View style={styles.footerCard}>
          <IconSymbol
            name="sparkles"
            size={26}
            color={styles.footerIcon.color as string}
          />
          <View style={styles.footerCopy}>
            <ThemedText type="subtitle">
              {t('games.lounge.footerTitle')}
            </ThemedText>
            <ThemedText style={styles.footerText}>
              {t('games.lounge.footerText')}
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  const isLight = palette.background === '#fff';
  const cardBackground = isLight ? '#F6F8FC' : '#1F2228';
  const raisedBackground = isLight ? '#E9EEF6' : '#262A31';
  const borderColor = isLight ? '#D8DFEA' : '#33373D';
  const surfaceShadow = isLight
    ? 'rgba(15, 23, 42, 0.08)'
    : 'rgba(8, 10, 15, 0.45)';
  const statusPrototypeBg = isLight ? '#D8F1FF' : '#1D3B48';
  const statusDesignBg = isLight ? '#EDE3FF' : '#2A2542';
  const statusRoadmapBg = isLight ? '#E0F6ED' : '#1F3A32';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      paddingTop: BASE_TOP_PADDING,
      paddingBottom: 48,
      paddingHorizontal: 24,
      gap: 16,
    },
    header: {
      alignItems: 'flex-start',
      gap: 12,
    },
    title: {
      fontSize: 34,
      lineHeight: 36,
    },
    subtitle: {
      marginTop: 6,
      color: palette.icon,
    },
    headerButton: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 999,
      backgroundColor: cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor,
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 8,
        offset: { width: 0, height: 2 },
        elevation: 1,
      }),
    },
    headerButtonDisabled: {
      opacity: 0.5,
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
      ...platformShadow({
        color: surfaceShadow,
        opacity: isLight ? 1 : 0.6,
        radius: 12,
        offset: { width: 0, height: 4 },
        elevation: 2,
      }),
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
    primaryButtonDisabled: {
      opacity: 0.45,
    },
    primaryButtonText: {
      color: palette.background,
      fontWeight: '600',
      fontSize: 15,
    },
    primaryButtonTextDisabled: {
      color: palette.background,
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
    comingSoonHint: {
      marginTop: 6,
      color: palette.icon,
      fontSize: 12,
      fontStyle: 'italic',
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
  });
}
