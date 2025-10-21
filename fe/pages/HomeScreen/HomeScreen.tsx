import React from 'react';
import { Image } from 'expo-image';
import { ActivityIndicator, Platform, StyleSheet } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { HelloWave } from '@/components/HelloWave';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useTranslation } from '@/lib/i18n';

export default function HomeScreen() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const { shouldBlock } = useSessionScreenGate({
    whenUnauthenticated: '/auth',
    enableOn: ['web'],
    blockWhenUnauthenticated: true,
  });

  const devToolsShortcut = Platform.select({ ios: 'cmd + d', android: 'cmd + m', web: 'F12', default: 'cmd + d' });
  const primaryFile = 'app/(tabs)/index.tsx';
  const resetCommand = 'npm run reset-project';
  const appDirectory = 'app';
  const exampleDirectory = 'app-example';

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('home.welcomeTitle')}</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.step1Title')}</ThemedText>
        <ThemedText>
          {t('home.step1Body', { file: primaryFile, shortcut: devToolsShortcut })}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.step2Title')}</ThemedText>
        <ThemedText>
          {t('home.step2Body')}
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t('home.step3Title')}</ThemedText>
        <ThemedText>
          {t('home.step3Body', {
            command: resetCommand,
            appName: appDirectory,
            exampleName: exampleDirectory,
          })}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
      // not themed intentionally; image asset coloration stands alone
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
  });
}
