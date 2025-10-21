import React, { useCallback } from 'react';
import { Button, StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../model/useAuth';
import { LocalAuthForm } from './LocalAuthForm';
import { AuthResult } from './AuthResult';
import { AuthError } from './AuthError';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { platform } from '@/constants/platform';
import { useTranslation } from '@/lib/i18n';

export default function AuthScreen() {
  const { authState, error, login, logout } = useAuth();
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { isAuthenticated, redirectEnabled, shouldBlock } = useSessionScreenGate({
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
  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.column}>
        <Text style={styles.sectionHeading}>{t('auth.sections.oauth')}</Text>
        {!authState ? (
          <Button title={t('auth.oauth.loginButton')} onPress={login} />
        ) : (
          <AuthResult
            accessToken={authState.accessToken}
            authorizationCode={(authState as any)?.tokenAdditionalParameters?.authorizationCode}
            onLogout={logout}
          />
        )}
        {error && <AuthError error={error} />}
        {!redirectEnabled && isAuthenticated && (
          <Button title={t('common.actions.openApp')} onPress={() => router.replace('/(tabs)')} />
        )}
      </View>
      <View style={styles.divider} />
      <View style={styles.column}>
        <Text style={styles.sectionHeading}>{t('auth.sections.local')}</Text>
        <LocalAuthForm onAuthenticated={!redirectEnabled ? handleLocalAuthSuccess : undefined} />
      </View>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'flex-start',
      paddingTop: 20,
      gap: 20,
      paddingHorizontal: 24,
      backgroundColor: palette.background,
      flexDirection: platform.isWeb ? 'row' : 'column',
    },
    column: {
      flex: 1,
      maxWidth: 480,
      alignItems: 'center',
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: palette.background,
    },
  });
}
