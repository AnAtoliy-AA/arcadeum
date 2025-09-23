import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

interface AuthResultProps {
  accessToken: string;
  authorizationCode?: string;
  onLogout: () => void;
}

export function AuthResult({ accessToken, authorizationCode, onLogout }: AuthResultProps) {
  return (
    <View style={styles.container}>
      {authorizationCode ? (
        <Text>Authorization Code: {authorizationCode}</Text>
      ) : (
        <Text>Access Token: {accessToken}</Text>
      )}
      <Button title="Logout" onPress={onLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
});
