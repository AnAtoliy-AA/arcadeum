import { Link, Stack } from 'expo-router';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';

export default function NotFoundScreen() {
  const styles = useThemedStyles(createStyles);
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>
          Not Found
        </ThemedText>
        <ThemedText style={styles.message}>
          This screen does not exist.
        </ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 20,
      backgroundColor: palette.background,
    },
    title: {
      color: palette.text,
    },
    message: {
      color: palette.icon,
      textAlign: 'center',
    },
    link: {
      marginTop: 4,
      paddingVertical: 12,
    },
  });
}
