import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { SelectField } from '@/components/ui/SelectField';
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
import { IconSymbol } from '@/components/ui/IconSymbol';
import { getDownloadLinks } from '@/lib/downloadLinks';
import { platform } from '@/constants/platform';

export default function SettingsScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    themePreference,
    language,
    setThemePreference,
    setLanguage,
    hapticsEnabled,
    setHapticsEnabled,
    hydrated,
  } = useSettings();
  const { colorScheme } = useColorScheme();
  const palette = Colors[colorScheme];
  const { t } = useTranslation();
  const router = useRouter();
  const { tokens, clearTokens } = useSessionTokens();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { ios: iosDownloadUrl, android: androidDownloadUrl } =
    getDownloadLinks();
  const showDownloads =
    platform.isWeb && (iosDownloadUrl || androidDownloadUrl);

  const isAuthenticated = Boolean(tokens.accessToken);
  const accountName =
    tokens.displayName ?? tokens.username ?? tokens.email ?? null;

  const handleThemeSelect = useCallback(
    (preference: (typeof themePreferences)[number]['code']) => {
      setThemePreference(preference);
    },
    [setThemePreference],
  );

  const handleLanguageSelect = useCallback(
    (code: (typeof settingsLanguages)[number]['code']) => {
      setLanguage(code);
    },
    [setLanguage],
  );

  const themeOptions = useMemo(
    () =>
      themePreferences.map((option) => ({
        value: option.code,
        label: t(option.labelKey),
        description: t(option.descriptionKey),
      })),
    [t],
  );

  const languageOptions = useMemo(
    () =>
      settingsLanguages.map((option) => ({
        value: option.code,
        label: t(option.labelKey),
      })),
    [t],
  );

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
          <ThemedText style={styles.sectionTitle}>
            {t('settings.appearanceTitle')}
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.appearanceDescription')}
          </ThemedText>
          <View style={styles.fieldGroup}>
            <SelectField
              label={t('settings.themeLabel')}
              value={themePreference}
              options={themeOptions}
              onSelect={handleThemeSelect}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.languageTitle')}
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.languageDescription')}
          </ThemedText>
          <View style={styles.fieldGroup}>
            <SelectField
              label={t('settings.languageLabel')}
              value={language}
              options={languageOptions}
              onSelect={handleLanguageSelect}
            />
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.gameplayTitle')}
          </ThemedText>
          <ThemedText style={styles.sectionDescription}>
            {t('settings.gameplayDescription')}
          </ThemedText>
          <View style={styles.fieldGroup}>
            <View style={styles.switchRow}>
              <ThemedText style={styles.switchLabel}>
                {t('settings.hapticsLabel')}
              </ThemedText>
              <Switch
                value={hapticsEnabled}
                onValueChange={setHapticsEnabled}
                trackColor={{ false: palette.icon, true: palette.tint }}
                thumbColor={palette.background}
              />
            </View>
          </View>
        </View>

        {showDownloads ? (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              {t('settings.downloadsTitle')}
            </ThemedText>
            <ThemedText style={styles.sectionDescription}>
              {t('settings.downloadsDescription')}
            </ThemedText>
            <View style={styles.downloadButtons}>
              {iosDownloadUrl ? (
                <TouchableOpacity
                  style={styles.downloadButton}
                  accessibilityRole="link"
                  accessibilityLabel={t('common.actions.downloadIos')}
                  onPress={() => {
                    void Linking.openURL(iosDownloadUrl);
                  }}
                >
                  <IconSymbol
                    name="arrow.down.circle"
                    size={16}
                    color={styles.downloadButtonText.color as string}
                  />
                  <ThemedText style={styles.downloadButtonText}>
                    {t('common.actions.downloadIos')}
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
              {androidDownloadUrl ? (
                <TouchableOpacity
                  style={styles.downloadButton}
                  accessibilityRole="link"
                  accessibilityLabel={t('common.actions.downloadAndroid')}
                  onPress={() => {
                    void Linking.openURL(androidDownloadUrl);
                  }}
                >
                  <IconSymbol
                    name="arrow.down.circle"
                    size={16}
                    color={styles.downloadButtonText.color as string}
                  />
                  <ThemedText style={styles.downloadButtonText}>
                    {t('common.actions.downloadAndroid')}
                  </ThemedText>
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            {t('settings.accountTitle')}
          </ThemedText>
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
                style={[
                  styles.accountButton,
                  styles.logoutButton,
                  isLoggingOut ? styles.logoutButtonDisabled : null,
                ]}
                activeOpacity={0.85}
                onPress={handleLogout}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color={palette.background}
                    style={styles.buttonSpinner}
                  />
                ) : null}
                <ThemedText style={styles.logoutButtonText}>
                  {t('common.actions.logout')}
                </ThemedText>
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
                <ThemedText style={styles.loginButtonText}>
                  {t('common.actions.login')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </View>
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
    fieldGroup: {
      marginTop: 4,
    },
    downloadButtons: {
      marginTop: 8,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    downloadButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.cardBackground,
    },
    downloadButtonText: {
      color: palette.text,
      fontSize: 15,
      fontWeight: '600',
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
    switchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 18,
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.icon,
      backgroundColor: palette.cardBackground,
    },
    switchLabel: {
      fontSize: 16,
      color: palette.text,
      fontWeight: '500',
    },
  });
}
