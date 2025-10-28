import React, { useCallback, useMemo } from 'react';
import { Alert, Linking, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Constants from 'expo-constants';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { useAppName } from '@/hooks/useAppName';
import type { TranslationKey } from '@/lib/i18n/messages';

const DEFAULT_SPONSOR_URL = 'https://arcadeum.dev/support';
const DEFAULT_COFFEE_URL = 'https://buymeacoffee.com/arcadeum';

type SupportActionKey = 'sponsor' | 'coffee';
type TeamMemberKey = 'producer' | 'designer' | 'engineer';

type IconName = Parameters<typeof IconSymbol>[0]['name'];

type SupportAction = {
  key: SupportActionKey;
  icon: IconName;
  titleKey: TranslationKey;
  descriptionKey: TranslationKey;
  ctaKey: TranslationKey;
  url: string;
};

type TeamMember = {
  key: TeamMemberKey;
  icon: IconName;
  name: string;
  role: string;
  bio: string;
};

function resolveExtraUrl(key: string, fallback: string): string {
  const extra = (Constants as any)?.expoConfig?.extra as Record<string, unknown> | undefined;
  if (extra) {
    const raw = extra[key];
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  if (typeof process !== 'undefined' && process.env) {
    const envRaw = process.env[key] ?? process.env[`EXPO_PUBLIC_${key}`];
    if (typeof envRaw === 'string') {
      const trimmed = envRaw.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }
  }
  return fallback;
}

export default function SupportScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const appName = useAppName();

  const sponsorUrl = useMemo(() => resolveExtraUrl('SUPPORT_URL', DEFAULT_SPONSOR_URL), []);
  const coffeeUrl = useMemo(() => resolveExtraUrl('SUPPORT_COFFEE_URL', DEFAULT_COFFEE_URL), []);

  const actions = useMemo<SupportAction[]>(
    () => [
      {
        key: 'sponsor',
        icon: 'star.circle.fill',
        titleKey: 'support.contribute.sponsorTitle',
        descriptionKey: 'support.contribute.sponsorDescription',
        ctaKey: 'support.contribute.sponsorCta',
        url: sponsorUrl,
      },
      {
        key: 'coffee',
        icon: 'cup.and.saucer.fill',
        titleKey: 'support.contribute.coffeeTitle',
        descriptionKey: 'support.contribute.coffeeDescription',
        ctaKey: 'support.contribute.coffeeCta',
        url: coffeeUrl,
      },
    ],
    [coffeeUrl, sponsorUrl],
  );

  const teamMembers = useMemo<TeamMember[]>(
    () => [
      {
        key: 'producer',
        icon: 'person.2.fill',
        name: t('support.team.members.producer.name'),
        role: t('support.team.members.producer.role'),
        bio: t('support.team.members.producer.bio'),
      },
      {
        key: 'designer',
        icon: 'paintpalette.fill',
        name: t('support.team.members.designer.name'),
        role: t('support.team.members.designer.role'),
        bio: t('support.team.members.designer.bio'),
      },
      {
        key: 'engineer',
        icon: 'cpu.fill',
        name: t('support.team.members.engineer.name'),
        role: t('support.team.members.engineer.role'),
        bio: t('support.team.members.engineer.bio'),
      },
    ],
    [t],
  );

  const handleOpen = useCallback(
    async (action: SupportAction) => {
      try {
        const supported = await Linking.canOpenURL(action.url);
        if (!supported) {
          throw new Error('unsupported');
        }
        await Linking.openURL(action.url);
      } catch (error) {
        console.error('support-link-error', error);
        Alert.alert(t('support.title'), t('support.errors.unableToOpen'));
      }
    },
    [t],
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title" style={styles.title}>{t('support.title')}</ThemedText>
        <ThemedText style={styles.tagline}>{t('support.tagline', { appName })}</ThemedText>
        <ThemedText style={styles.description}>{t('support.description', { appName })}</ThemedText>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('support.team.title')}</ThemedText>
          <View style={styles.teamList}>
            {teamMembers.map((member) => (
              <View key={member.key} style={styles.teamCard}>
                <View style={styles.teamHeader}>
                  <IconSymbol name={member.icon} size={22} color={styles.teamIcon.color as string} />
                  <View style={styles.teamMeta}>
                    <ThemedText style={styles.teamName}>{member.name}</ThemedText>
                    <ThemedText style={styles.teamRole}>{member.role}</ThemedText>
                  </View>
                </View>
                <ThemedText style={styles.teamBio}>{member.bio}</ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>{t('support.contribute.title')}</ThemedText>
          <View style={styles.actionList}>
            {actions.map((action) => (
              <TouchableOpacity key={action.key} style={styles.actionCard} onPress={() => handleOpen(action)}>
                <View style={styles.actionHeader}>
                  <IconSymbol name={action.icon} size={22} color={styles.actionIcon.color as string} />
                  <ThemedText style={styles.actionTitle}>{t(action.titleKey)}</ThemedText>
                </View>
                <ThemedText style={styles.actionDescription}>{t(action.descriptionKey)}</ThemedText>
                <View style={styles.actionCtaRow}>
                  <ThemedText style={styles.actionCta}>{t(action.ctaKey)}</ThemedText>
                  <IconSymbol name="arrow.up.right" size={16} color={styles.actionCta.color as string} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <ThemedText style={styles.thanks}>{t('support.thanks', { appName })}</ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: 24,
      paddingVertical: 32,
      gap: 28,
    },
    title: {
      textAlign: 'left',
    },
    tagline: {
      fontSize: 16,
      lineHeight: 22,
      color: palette.text,
    },
    description: {
      fontSize: 15,
      lineHeight: 22,
      color: palette.icon,
    },
    section: {
      gap: 16,
    },
    sectionTitle: {
      color: palette.text,
    },
    teamList: {
      gap: 16,
    },
    teamCard: {
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      padding: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      gap: 12,
    },
    teamHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    teamIcon: {
      color: palette.tint,
    },
    teamMeta: {
      flex: 1,
      gap: 2,
    },
    teamName: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    teamRole: {
      fontSize: 13,
      color: palette.icon,
    },
    teamBio: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.text,
    },
    actionList: {
      gap: 16,
    },
    actionCard: {
      backgroundColor: palette.cardBackground,
      borderRadius: 16,
      padding: 20,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      gap: 12,
    },
    actionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    actionIcon: {
      color: palette.tint,
    },
    actionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: palette.text,
    },
    actionDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.text,
    },
    actionCtaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    actionCta: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
    thanks: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.icon,
      marginBottom: 24,
    },
  });
}
