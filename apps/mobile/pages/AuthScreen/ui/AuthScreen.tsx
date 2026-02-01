import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { ThemedView } from '@/components/ThemedView';
import { useAuth, type ExtendedAuthorizeResult } from '../model/useAuth';
import { LocalAuthForm } from './LocalAuthForm';
import { AuthResult } from './AuthResult';
import { AuthError } from './AuthError';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { platform } from '@/constants/platform';
import { useTranslation } from '@/lib/i18n';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';

export default function AuthScreen() {
  const { authState, error, login, logout } = useAuth();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { isAuthenticated, redirectEnabled, shouldBlock } =
    useSessionScreenGate({
      whenAuthenticated: '/(tabs)',
      enableOn: ['web'],
      blockWhenAuthenticated: true,
    });
  const router = useRouter();
  const handleLocalAuthSuccess = useCallback(() => {
    if (!redirectEnabled) {
      router.replace('/(tabs)');
    }
  }, [redirectEnabled, router]);
  const handleGoToGames = useCallback(() => {
    router.replace('/(tabs)/games');
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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.gamesShortcut}
          onPress={handleGoToGames}
        >
          <IconSymbol
            name="gamecontroller.fill"
            size={18}
            color={styles.gamesShortcutIcon.color as string}
          />
          <ThemedText style={styles.gamesShortcutText}>
            {t('auth.shortcuts.browseGames')}
          </ThemedText>
        </TouchableOpacity>
      </View>
      <View style={styles.content}>
        <View style={styles.column}>
          <LocalAuthForm
            onAuthenticated={
              !redirectEnabled ? handleLocalAuthSuccess : undefined
            }
          />
        </View>
        <View style={styles.divider} />
        <View style={styles.column}>
          <Text style={styles.sectionHeading}>{t('auth.sections.oauth')}</Text>
          {!authState ? (
            <ThemedButton title={t('auth.oauth.loginButton')} onPress={login} />
          ) : (
            <AuthResult
              accessToken={authState.accessToken}
              authorizationCode={
                (authState as ExtendedAuthorizeResult)
                  ?.tokenAdditionalParameters?.authorizationCode
              }
              onLogout={logout}
            />
          )}
          {error && <AuthError error={error} />}
          {!redirectEnabled && isAuthenticated && (
            <ThemedButton
              title={t('common.actions.openApp')}
              onPress={() => router.replace('/(tabs)')}
              variant="outline"
              style={styles.openAppButton}
            />
          )}
        </View>
      </View>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      paddingTop: 24,
      paddingHorizontal: 24,
      paddingBottom: 32,
      backgroundColor: palette.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: platform.isWeb ? 'flex-end' : 'center',
      alignItems: 'center',
      width: '100%',
      marginBottom: 24,
    },
    content: {
      flex: 1,
      width: '100%',
      flexDirection: platform.isWeb ? 'row' : 'column',
      justifyContent: 'center',
      alignItems: 'stretch',
      gap: 24,
    },
    gamesShortcut: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 999,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.tint,
      backgroundColor: platform.isWeb ? 'transparent' : palette.tint,
    },
    gamesShortcutIcon: {
      color: platform.isWeb ? palette.tint : palette.background,
    },
    gamesShortcutText: {
      color: platform.isWeb ? palette.tint : palette.background,
      fontWeight: '600',
      fontSize: 14,
    },
    column: {
      flex: 1,
      alignItems: platform.isWeb ? 'center' : 'stretch',
      gap: 16,
    },
    divider: {
      width: 1,
      alignSelf: 'stretch',
      backgroundColor: palette.icon,
    },
    sectionHeading: {
      fontSize: 20,
      fontWeight: '600',
      marginBottom: 8,
      color: palette.text,
    },
    openAppButton: {
      marginTop: 16,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
  });
}
