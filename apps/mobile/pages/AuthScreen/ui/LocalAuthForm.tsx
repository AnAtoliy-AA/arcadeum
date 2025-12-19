import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useTranslation } from '@/lib/i18n';
import { useLocalAuth } from '../model/useLocalAuth';
import { ThemedButton } from '@/components/ui/ThemedButton';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

interface Props {
  onAuthenticated?: (accessToken: string) => void;
}

export const LocalAuthForm: React.FC<Props> = ({ onAuthenticated }) => {
  const auth = useLocalAuth();
  const { colorScheme, isDarkLike } = useColorScheme();
  const palette = Colors[colorScheme];
  const styles = useThemedStyles((themePalette) =>
    createStyles(themePalette, isDarkLike),
  );
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [username, setUsername] = useState('');
  const isRegister = auth.mode === 'register';

  useEffect(() => {
    auth.checkSession();
    // only run once for current auth instance
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth.checkSession]);

  useEffect(() => {
    if (!isRegister) {
      setUsername('');
      setConfirm('');
    }
  }, [isRegister]);

  useEffect(() => {
    if (auth.accessToken && onAuthenticated) {
      onAuthenticated(auth.accessToken);
    }
  }, [auth.accessToken, onAuthenticated]);

  const usernameTrimmed = username.trim();
  const emailTrimmed = email.trim();
  const disabled = auth.loading;
  const passwordMismatch =
    isRegister && password && confirm && password !== confirm;
  const usernameInvalid = isRegister && usernameTrimmed.length < 3;
  const usernameTooShort =
    isRegister && usernameTrimmed.length > 0 && usernameTrimmed.length < 3;

  const submit = () => {
    if (isRegister) {
      if (passwordMismatch || usernameInvalid) {
        return;
      }
      auth.register(emailTrimmed, password, usernameTrimmed);
    } else {
      auth.login(emailTrimmed, password);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        {isRegister
          ? t('auth.local.heading.register')
          : t('auth.local.heading.login')}
      </Text>
      {isRegister && (
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          placeholder={t('common.labels.username')}
          placeholderTextColor={palette.icon}
          style={styles.input}
          value={username}
          onChangeText={(value) =>
            setUsername(value.replace(/[^a-zA-Z0-9_-]/g, ''))
          }
        />
      )}
      <TextInput
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        placeholder={t('common.labels.email')}
        placeholderTextColor={palette.icon}
        style={styles.input}
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        secureTextEntry
        placeholder={t('common.labels.password')}
        placeholderTextColor={palette.icon}
        style={styles.input}
        value={password}
        onChangeText={setPassword}
      />
      {isRegister && (
        <TextInput
          secureTextEntry
          placeholder={t('common.labels.confirmPassword')}
          placeholderTextColor={palette.icon}
          style={styles.input}
          value={confirm}
          onChangeText={setConfirm}
        />
      )}
      {passwordMismatch && (
        <Text style={styles.error}>
          {t('auth.local.errors.passwordMismatch')}
        </Text>
      )}
      {usernameTooShort && (
        <Text style={styles.error}>
          {t('auth.local.errors.usernameTooShort')}
        </Text>
      )}
      {isRegister && (
        <Text style={styles.helperText}>
          {t('auth.local.helper.allowedCharacters')}
        </Text>
      )}
      {auth.error && <Text style={styles.error}>{auth.error}</Text>}
      <View style={styles.buttonRow}>
        <ThemedButton
          title={
            isRegister
              ? t('common.actions.register')
              : t('common.actions.login')
          }
          onPress={submit}
          disabled={!!(disabled || passwordMismatch || usernameInvalid)}
          style={styles.button}
        />
        <ThemedButton
          title={
            isRegister
              ? t('common.prompts.haveAccount')
              : t('common.prompts.needAccount')
          }
          onPress={auth.toggleMode}
          disabled={disabled}
          variant="outline"
          style={styles.button}
        />
      </View>
      {auth.loading && <ActivityIndicator style={styles.loader} />}
      {auth.accessToken && (
        <View style={styles.sessionBox}>
          <Text style={styles.sessionText}>
            {t('common.statuses.authenticated')}
          </Text>
          {auth.email && (
            <Text style={styles.sessionText}>
              {t('common.labels.email')}: {auth.email}
            </Text>
          )}
          {auth.username && (
            <Text style={styles.sessionText}>
              {t('common.labels.username')}: {auth.username}
            </Text>
          )}
          <ThemedButton
            title={t('common.actions.logout')}
            onPress={auth.logout}
            variant="outline"
            style={styles.sessionButton}
          />
        </View>
      )}
    </View>
  );
};

const createStyles = (palette: Palette, isDarkLike: boolean) => {
  const inputBackground = isDarkLike
    ? (palette.cardBackground ?? '#1F2123')
    : palette.background;

  return StyleSheet.create({
    container: {
      width: '100%',
      maxWidth: 420,
      alignSelf: 'center',
      gap: 10,
    },
    heading: {
      fontSize: 22,
      fontWeight: '600',
      textAlign: 'center',
      marginBottom: 4,
      color: palette.text,
    },
    input: {
      borderWidth: StyleSheet.hairlineWidth,
      padding: 10,
      borderRadius: 6,
      borderColor: palette.icon,
      backgroundColor: inputBackground,
      color: palette.text,
    },
    error: {
      fontSize: 13,
      color: palette.error,
    },
    helperText: {
      fontSize: 12,
      color: palette.icon,
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    button: {
      flex: 1,
    },
    sessionBox: {
      marginTop: 16,
      alignItems: 'center',
      gap: 8,
    },
    sessionButton: {
      alignSelf: 'stretch',
    },
    sessionText: {
      fontSize: 12,
      color: palette.text,
    },
    loader: {
      marginTop: 12,
    },
  });
};
