import React from 'react';
import { Button, StyleSheet, View, Text, Platform } from 'react-native';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { ThemedView } from '@/components/ThemedView';
import { useAuth } from '../model/useAuth';
import { LocalAuthForm } from './LocalAuthForm';
import { AuthResult } from './AuthResult';
import { AuthError } from './AuthError';

export default function AuthScreen() {
  const { authState, error, login, logout } = useAuth();
  const styles = useThemedStyles(createStyles);

  return (
  <ThemedView style={styles.container}> 
      <View style={styles.column}> 
        <Text style={styles.sectionHeading}>OAuth</Text>
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
      </View>
  <View style={styles.divider} />
      <View style={styles.column}>
        <Text style={styles.sectionHeading}>Local Account</Text>
        <LocalAuthForm />
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
      paddingTop: 60,
      gap: 48,
      paddingHorizontal: 24,
      backgroundColor: palette.background,
      flexDirection: Platform.OS === 'web' ? 'row' : 'column',
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
  });
}
