import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import { useTranslation } from '@/lib/i18n';

interface AuthResultProps {
  accessToken: string;
  authorizationCode?: string;
  onLogout: () => void;
}

export function AuthResult({ accessToken, authorizationCode, onLogout }: AuthResultProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      {authorizationCode ? (
        <Text>{`${t('auth.oauth.authorizationCodeLabel')}: ${authorizationCode}`}</Text>
      ) : (
        <Text>{`${t('auth.oauth.accessTokenLabel')}: ${accessToken}`}</Text>
      )}
      <Button title={t('common.actions.logout')} onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
});
