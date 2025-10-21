import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
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
import {
  settingsLanguages,
  themePreferences,
  useSettings,
} from '@/stores/settings';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useTranslation } from '@/lib/i18n';

export default function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    themePreference,
    language,
    setThemePreference,
    setLanguage,
    hydrated,
  } = useSettings();
  const colorScheme = useColorScheme();
  const palette = Colors[colorScheme];
  const { t } = useTranslation();
  const router = useRouter();
  const { tokens, clearTokens } = useSessionTokens();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isAuthenticated = Boolean(tokens.accessToken);
  const accountName = tokens.username ?? tokens.email ?? null;

  const handleThemeSelect = useCallback((preference: (typeof themePreferences)[number]['code']) => {
    setThemePreference(preference);
  }, [setThemePreference]);

  const handleLanguageSelect = useCallback((code: (typeof settingsLanguages)[number]['code']) => {
    setLanguage(code);
  }, [setLanguage]);

  const handleGoToAuth = useCallback(() => {
    router.push('/auth');
  }, [router]);

  const handleLogout = useCallback(async () => {
    if (!isAuthenticated || isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await clearTokens();
      router.replace('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  }, [clearTokens, isAuthenticated, isLoggingOut, router]);

  if (!hydrated) {
    return (
      <ThemedView style={styles.loadingState}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.appearanceTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.appearanceDescription')}
          </ThemedText>
          <View style={styles.optionGroup}>
            {themePreferences.map((option) => {
              const selected = option.code === themePreference;
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.optionCard, selected ? styles.optionCardSelected : null]}
                  activeOpacity={0.85}
                  onPress={() => handleThemeSelect(option.code)}
                >
                  <View style={styles.optionTextWrapper}>
                    <ThemedText style={styles.optionTitle}>{t(option.labelKey)}</ThemedText>
                    <ThemedText style={styles.optionDescription}>{t(option.descriptionKey)}</ThemedText>
                  </View>
                  <IconSymbol
                    name={selected ? 'checkmark.circle.fill' : 'circle'}
                    size={20}
                    color={selected ? palette.tint : palette.icon}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{t('settings.languageTitle')}</ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.languageDescription')}
          </ThemedText>
          <View style={styles.optionGroup}>
            {settingsLanguages.map((option) => {
              const selected = option.code === language;
              return (
                <TouchableOpacity
                  key={option.code}
                  style={[styles.optionCard, selected ? styles.optionCardSelected : null]}
                  activeOpacity={0.85}
                  onPress={() => handleLanguageSelect(option.code)}
                >
                  <View style={styles.optionTextWrapper}>
                    <ThemedText style={styles.optionTitle}>{t(option.labelKey)}</ThemedText>
                    <ThemedText style={styles.optionDescription}>
                      {selected ? t('settings.activeSelection') : t('settings.tapToSwitch')}
                    </ThemedText>
                  </View>
                  <IconSymbol
                    name={selected ? 'checkmark.circle.fill' : 'circle'}
                    size={20}
                    color={selected ? palette.tint : palette.icon}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{t('settings.accountTitle')}</ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('settings.accountDescription')}
            </ThemedText>
            {isAuthenticated ? (
              <View style={styles.accountCard}>
                <ThemedText style={styles.accountStatus}>
                  {accountName
                    ? t('settings.signedInAs', { user: accountName })
                    : t('common.statuses.authenticated')}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.accountButton, styles.logoutButton, isLoggingOut ? styles.logoutButtonDisabled : null]}
                  activeOpacity={0.85}
                  onPress={handleLogout}
                  disabled={isLoggingOut}
                >
                  {isLoggingOut ? (
                    <ActivityIndicator size="small" color={palette.background} style={styles.buttonSpinner} />
                  ) : null}
                  <ThemedText style={styles.logoutButtonText}>{t('common.actions.logout')}</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.accountCard}>
                <ThemedText style={styles.accountStatus}>
                  {t('settings.accountSignedOut')}
                </ThemedText>
                <TouchableOpacity
                  style={[styles.accountButton, styles.loginButton]}
                  activeOpacity={0.85}
                  onPress={handleGoToAuth}
                >
                  <ThemedText style={styles.loginButtonText}>{t('common.actions.login')}</ThemedText>
                </TouchableOpacity>
              </View>
            )}
          </View>
      </ScrollView>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  const selectedOverlay = palette.tint === '#fff'
    ? 'rgba(255, 255, 255, 0.12)'
    : 'rgba(10, 126, 164, 0.12)';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingState: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: 20,
      paddingBottom: 32,
      paddingTop: 16,
      gap: 32,
    },
    section: {
      gap: 12,
    },
    sectionTitle: {
      color: palette.text,
      fontSize: 20,
      fontWeight: '700',
    },
    sectionDescription: {
      color: palette.icon,
      fontSize: 14,
      lineHeight: 20,
    },
    optionGroup: {
      gap: 12,
    },
    optionCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 16,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.background,
    },
    optionCardSelected: {
      borderColor: palette.tint,
      backgroundColor: selectedOverlay,
    },
    optionTextWrapper: {
      flex: 1,
      gap: 4,
      paddingRight: 12,
    },
    optionTitle: {
      color: palette.text,
      fontSize: 16,
      fontWeight: '600',
    },
    optionDescription: {
      color: palette.icon,
      fontSize: 13,
    },
    accountCard: {
      gap: 12,
    },
    accountStatus: {
      color: palette.icon,
      fontSize: 14,
      lineHeight: 20,
    },
    accountButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
    },
    logoutButton: {
      backgroundColor: palette.tint,
    },
    logoutButtonDisabled: {
      opacity: 0.75,
    },
    logoutButtonText: {
      color: palette.background,
      fontSize: 15,
      fontWeight: '600',
    },
    loginButton: {
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
      backgroundColor: palette.background,
    },
    loginButtonText: {
      color: palette.tint,
      fontSize: 15,
      fontWeight: '600',
    },
    buttonSpinner: {
      marginRight: 8,
    },
  });
}
