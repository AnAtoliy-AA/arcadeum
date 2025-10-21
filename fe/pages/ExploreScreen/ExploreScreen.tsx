import React, { useCallback } from 'react';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ActivityIndicator, Platform, StyleSheet, Button } from 'react-native';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Collapsible } from '@/components/Collapsible';
import { ExternalLink } from '@/components/ExternalLink';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useThemedStyles, Palette } from '@/hooks/useThemedStyles';
import { useSessionScreenGate } from '@/hooks/useSessionScreenGate';
import { useSessionTokens } from '@/stores/sessionTokens';
import { useTranslation } from '@/lib/i18n';

export default function ExploreScreen() {
  const styles = useThemedStyles(createStyles);
  const { clearTokens } = useSessionTokens();
  const { shouldBlock, isAuthenticated } = useSessionScreenGate({
    whenUnauthenticated: '/auth',
    enableOn: ['web'],
    blockWhenUnauthenticated: true,
  });

  const handleGoToAuth = useCallback(() => {
    router.push('/auth');
  }, []);

  const handleLogout = useCallback(async () => {
    await clearTokens();
    router.replace('/auth');
  }, [clearTokens]);

  const { t } = useTranslation();
  const webShortcutKey = 'w';

  if (shouldBlock) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
            color={styles.headerImage.color as string}
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t('explore.title')}</ThemedText>
        <Button
          title={isAuthenticated ? t('explore.logOut') : t('explore.goToAuth')}
          onPress={isAuthenticated ? handleLogout : handleGoToAuth}
        />
      </ThemedView>
      <ThemedText>{t('explore.description')}</ThemedText>
      <Collapsible title={t('explore.fileRoutingTitle')}>
        <ThemedText>{t('explore.fileRoutingBody1')}</ThemedText>
        <ThemedText>{t('explore.fileRoutingBody2')}</ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.platformSupportTitle')}>
        <ThemedText>
          {t('explore.platformSupportBody', { shortcut: webShortcutKey })}
        </ThemedText>
      </Collapsible>
      <Collapsible title={t('explore.imagesTitle')}>
        <ThemedText>{t('explore.imagesBody')}</ThemedText>
        <Image source={require('@/assets/images/react-logo.png')} style={{ alignSelf: 'center' }} />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.customFontsTitle')}>
        <ThemedText>{t('explore.customFontsBody')}</ThemedText>
        <ThemedText style={{ fontFamily: 'SpaceMono' }}>{t('explore.customFontsExample')}</ThemedText>
        <ExternalLink href="https://docs.expo.dev/versions/latest/sdk/font">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.colorThemesTitle')}>
        <ThemedText>{t('explore.colorThemesBody')}</ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">{t('common.learnMore')}</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title={t('explore.animationsTitle')}>
        <ThemedText>{t('explore.animationsBody')}</ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>{t('explore.animationsIosNote')}</ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    headerImage: {
      color: palette.icon,
      bottom: -90,
      left: -35,
      position: 'absolute',
    },
    titleContainer: {
      flexDirection: 'column',
      gap: 8,
    },
    link: {
      marginLeft: 10,
      paddingVertical: 8,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: palette.background,
    },
  });
}
