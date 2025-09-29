import React from 'react';
import { StyleSheet, View, Text, Button, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';

export default function WelcomeScreen() {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroBlock}>
          <ThemedText type="title" style={styles.title}>AICO</ThemedText>
          <Text style={styles.tagline}>Intelligent, secure, and extensible real‑time collaboration.</Text>
          <Text style={styles.description}>
            Experience OAuth and local email/password authentication, JWT access with upcoming refresh rotation,
            and real-time messaging powered by websockets. This playground app demonstrates secure patterns,
            modular architecture, and theming for mobile & web via Expo.
          </Text>
          <View style={styles.actions}>
            <Button title="Get Started" onPress={() => router.push('/auth')} />
          </View>
        </View>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Running on {Platform.OS}</Text>
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
      paddingTop: Platform.OS === 'ios' ? 8 : 0,
      marginTop: Platform.OS === 'ios' ? 4 : 0,
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
  });
}
