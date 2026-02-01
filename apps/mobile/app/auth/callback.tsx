import {
  useLocalSearchParams,
  Redirect,
  useRootNavigationState,
} from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import { ThemedText } from '../../components/ThemedText';

export default function AuthCallback() {
  const params = useLocalSearchParams<{
    code?: string;
    state?: string;
    error?: string;
  }>();
  const navState = useRootNavigationState();
  const isReady = !!navState?.key;

  if (!isReady) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="default">Preparing…</ThemedText>
      </ThemedView>
    );
  }

  if (params.error) {
    return (
      <Redirect
        href={{ pathname: '/auth', params: { error: String(params.error) } }}
      />
    );
  }

  if (params.code) {
    return (
      <Redirect
        href={{
          pathname: '/auth',
          params: {
            code: String(params.code),
            state: String(params.state || ''),
          },
        }}
      />
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="default">Finishing sign-in…</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
