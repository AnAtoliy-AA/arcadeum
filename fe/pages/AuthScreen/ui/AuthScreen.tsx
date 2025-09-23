import React from 'react';
import { Button, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../model/useAuth';
import { AuthResult } from './AuthResult';
import { AuthError } from './AuthError';

export default function AuthScreen() {
  const { authState, error, login, logout } = useAuth();

  return (
    <ThemedView style={styles.container}>
      {!authState ? (
        <Button title="Login with OAuth" onPress={login} />
      ) : (
        <AuthResult
          accessToken={authState.accessToken}
          authorizationCode={(authState as any)?.tokenAdditionalParameters?.authorizationCode}
          onLogout={logout}
        />
      )}
      {error && <AuthError error={error} />}
    </ThemedView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
