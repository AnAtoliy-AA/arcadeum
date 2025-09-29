import React, { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Text, ActivityIndicator, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useLocalAuth } from '../model/useLocalAuth';

interface Props {
  onAuthenticated?: (accessToken: string) => void;
}

export const LocalAuthForm: React.FC<Props> = ({ onAuthenticated }) => {
  const auth = useLocalAuth();
  const scheme = useColorScheme() || 'light';
  const palette = Colors[scheme];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const isRegister = auth.mode === 'register';

  useEffect(() => {
    auth.checkSession();
    // only run once for current auth instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.checkSession]);

  useEffect(() => {
    if (auth.accessToken && onAuthenticated) {
      onAuthenticated(auth.accessToken);
    }
  }, [auth.accessToken, onAuthenticated]);

  const disabled = auth.loading;
  const passwordMismatch = isRegister && password && confirm && password !== confirm;

  const submit = () => {
    if (isRegister) {
      if (passwordMismatch) return;
      auth.register(email.trim(), password);
    } else {
      auth.login(email.trim(), password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>{isRegister ? 'Create Account' : 'Login'}</Text>
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder="Email"
  style={[styles.input, { borderColor: palette.icon, backgroundColor: palette.background }]}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        secureTextEntry
        placeholder="Password"
  style={[styles.input, { borderColor: palette.icon, backgroundColor: palette.background }]}
        value={password}
        onChangeText={setPassword}
      />
      {isRegister && (
        <TextInput
          secureTextEntry
            placeholder="Confirm Password"
            style={[styles.input, { borderColor: palette.icon, backgroundColor: palette.background }]}
            value={confirm}
            onChangeText={setConfirm}
        />
      )}
  {passwordMismatch && <Text style={[styles.error, { color: palette.error }]}>Passwords do not match</Text>}
  {auth.error && <Text style={[styles.error, { color: palette.error }]}>{auth.error}</Text>}
      <View style={styles.buttonRow}>
        <Button
          title={isRegister ? 'Register' : 'Login'}
          onPress={submit}
          disabled={!!(disabled || passwordMismatch)}
        />
        <Button
          title={isRegister ? 'Have an account?' : 'Need an account?'}
          onPress={auth.toggleMode}
          disabled={disabled}
        />
      </View>
      {auth.loading && <ActivityIndicator style={{ marginTop: 12 }} />}
      {auth.accessToken && (
        <View style={styles.sessionBox}>
          <Text style={[styles.small, { color: palette.text }]}>Authenticated</Text>
          <Button title="Logout" onPress={auth.logout} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    maxWidth: 420,
    gap: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#999',
    padding: 10,
    borderRadius: 6,
    backgroundColor: 'white',
  },
  error: {
    fontSize: 13,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  sessionBox: {
    marginTop: 16,
    alignItems: 'center',
    gap: 8,
  },
  small: {
    fontSize: 12,
    color: '#555',
  },
});
