import React from 'react';
import { View, StyleSheet } from 'react-native';

import { useTranslation } from '@/lib/i18n';
import { ThemedText } from '@/components/ThemedText';
import { ThemedButton } from '@/components/ui/ThemedButton';

interface AuthResultProps {
  accessToken: string;
  authorizationCode?: string;
  onLogout: () => void;
}

export function AuthResult({
  accessToken,
  authorizationCode,
  onLogout,
}: AuthResultProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {authorizationCode ? (
        <ThemedText>{`${t('auth.oauth.authorizationCodeLabel')}: ${authorizationCode}`}</ThemedText>
      ) : (
        <ThemedText>{`${t('auth.oauth.accessTokenLabel')}: ${accessToken}`}</ThemedText>
      )}
      <ThemedButton
        title={t('common.actions.logout')}
        onPress={onLogout}
        variant="outline"
        style={styles.logoutButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 12,
  },
});
