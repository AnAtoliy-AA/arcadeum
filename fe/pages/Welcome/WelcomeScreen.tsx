import React from 'react';
import { StyleSheet, View, Text, Button, SafeAreaView, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { platform } from '@/constants/platform';
import { useTranslation } from '@/lib/i18n';

export default function WelcomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { isAuthenticated, redirectEnabled, shouldBlock } = useSessionScreenGate({
    whenAuthenticated: '/(tabs)',
    enableOn: ['web'],
    blockWhenAuthenticated: true,
  });
  const { t } = useTranslation();

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  const handlePrimaryPress = () => {
    if (isAuthenticated && !redirectEnabled) {
      router.replace('/(tabs)');
    } else {
      router.push('/auth');
    }
  };
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroBlock}>
          <ThemedText type="title" style={styles.title}>AICO</ThemedText>
          <Text style={styles.tagline}>{t('welcome.tagline')}</Text>
          <Text style={styles.description}>{t('welcome.description')}</Text>
          <View style={styles.actions}>
            <Button
              title={isAuthenticated && !redirectEnabled ? t('common.actions.openApp') : t('common.actions.getStarted')}
              onPress={handlePrimaryPress}
            />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('welcome.runningOn', { platform: platform.os })}</Text>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 32,
      paddingTop: 48,
      alignItems: 'center',
      justifyContent: 'flex-start',
      gap: 48,
      backgroundColor: palette.background,
    },
    safeArea: {
      flex: 1,
      width: '100%',
      alignItems: 'center',
    },
    heroBlock: {
      maxWidth: 720,
      width: '100%',
      gap: 24,
    },
    title: {
      fontSize: 45,
      fontWeight: '700',
      letterSpacing: 0.5,
      textAlign: 'center',
      lineHeight: 52,
  paddingTop: platform.isIos ? 8 : 0,
  marginTop: platform.isIos ? 4 : 0,
      color: palette.text,
    },
    tagline: {
      fontSize: 18,
      fontWeight: '500',
      color: palette.text,
    },
    description: {
      fontSize: 16,
      lineHeight: 22,
      color: palette.icon,
    },
    actions: {
      marginTop: 8,
      flexDirection: 'row',
      gap: 12,
    },
    footer: {
      marginTop: 'auto',
      paddingBottom: 32,
    },
    footerText: {
      fontSize: 12,
      color: palette.icon,
      textAlign: 'center',
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
  });
}
