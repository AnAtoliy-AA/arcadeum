import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { platform } from '@/constants/platform';
import { useTranslation } from '@/lib/i18n';
import { useAppName } from '@/hooks/useAppName';

export default function WelcomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { isAuthenticated, redirectEnabled, shouldBlock } =
    useSessionScreenGate({
      whenAuthenticated: '/(tabs)',
      enableOn: ['web'],
      blockWhenAuthenticated: true,
    });
  const router = useRouter();
  const { t } = useTranslation();
  const appName = useAppName();

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const primaryHref = isAuthenticated && !redirectEnabled ? '/(tabs)' : '/auth';
  const primaryReplace = isAuthenticated && !redirectEnabled;

  const primaryActionStyle = StyleSheet.flatten([
    styles.actionButton,
    styles.primaryAction,
    styles.webLinkAction,
  ]);
  const secondaryActionStyle = StyleSheet.flatten([
    styles.actionButton,
    styles.secondaryAction,
    styles.webLinkAction,
  ]);

  const handlePrimaryPress = () => {
    if (primaryReplace) {
      router.replace(primaryHref);
      return;
    }

    router.push(primaryHref);
  };

  const handleSupportPress = () => {
    router.push('/support');
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroBlock}>
          <ThemedText type="title" style={styles.title}>
            {appName}
          </ThemedText>
          <Text style={styles.tagline}>
            {t('welcome.tagline', { appName })}
          </Text>
          <Text style={styles.description}>
            {t('welcome.description', { appName })}
          </Text>
          <View style={styles.actions}>
            {platform.isWeb ? (
              <Link
                href={primaryHref}
                replace={primaryReplace}
                accessibilityRole="link"
                accessibilityLabel={t('common.actions.getStarted')}
                style={primaryActionStyle}
              >
                <ThemedText style={styles.primaryActionText}>
                  {isAuthenticated && !redirectEnabled
                    ? t('common.actions.openApp')
                    : t('common.actions.getStarted')}
                </ThemedText>
              </Link>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('common.actions.getStarted')}
                onPress={handlePrimaryPress}
                style={[styles.actionButton, styles.primaryAction]}
              >
                <ThemedText style={styles.primaryActionText}>
                  {isAuthenticated && !redirectEnabled
                    ? t('common.actions.openApp')
                    : t('common.actions.getStarted')}
                </ThemedText>
              </TouchableOpacity>
            )}
            {platform.isWeb ? (
              <Link
                href="/support"
                accessibilityRole="link"
                accessibilityLabel={t('welcome.supportCta')}
                style={secondaryActionStyle}
              >
                <ThemedText style={styles.secondaryActionText}>
                  {t('welcome.supportCta')}
                </ThemedText>
              </Link>
            ) : (
              <TouchableOpacity
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel={t('welcome.supportCta')}
                onPress={handleSupportPress}
                style={[styles.actionButton, styles.secondaryAction]}
              >
                <ThemedText style={styles.secondaryActionText}>
                  {t('welcome.supportCta')}
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {t('welcome.runningOn', { platform: platform.os })}
          </Text>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 48,
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 48,
      backgroundColor: palette.background,
    },
    safeArea: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
    },
    heroBlock: {
      maxWidth: 720,
      width: '100%',
      gap: 24,
    },
    title: {
      fontSize: 45,
      fontWeight: '700',
      letterSpacing: 0.5,
      textAlign: 'center',
      lineHeight: 52,
      paddingTop: platform.isIos ? 8 : 0,
      marginTop: platform.isIos ? 4 : 0,
      color: palette.text,
    },
    tagline: {
      fontSize: 18,
      fontWeight: '500',
      color: palette.text,
    },
    description: {
      fontSize: 16,
      lineHeight: 22,
      color: palette.icon,
    },
    actions: {
      marginTop: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: 12,
    },
    actionButton: {
      paddingVertical: 14,
      paddingHorizontal: 22,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 160,
    },
    webLinkAction: {
      display: 'flex',
      textDecorationLine: 'none',
    },
    primaryAction: {
      backgroundColor: palette.tint,
    },
    secondaryAction: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
    },
    primaryActionText: {
      color: palette.background,
      fontWeight: '600',
    },
    secondaryActionText: {
      color: palette.tint,
      fontWeight: '600',
    },
    footer: {
      marginTop: 'auto',
      paddingBottom: 32,
    },
    footerText: {
      fontSize: 12,
      color: palette.icon,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
  });
}
