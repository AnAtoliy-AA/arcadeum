import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { Link, useRouter } from 'expo-router';

import { ThemedText } from '@/components/ThemedText';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { platform } from '@/constants/platform';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import {
  subscribePendingRequests,
  type PendingRequestState,
} from '@/lib/pendingRequestTracker';

const HIDE_DELAY_MS = 250;

export function PendingRequestNotice() {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const router = useRouter();

  const [trackerState, setTrackerState] = useState<PendingRequestState>({
    visible: false,
    since: null,
    pendingCount: 0,
  });
  const [mounted, setMounted] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const opacity = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    const unsubscribe = subscribePendingRequests((state) => {
      setTrackerState(state);
    });
    return unsubscribe;
  }, []);

  const shouldShow = trackerState.visible;

  useEffect(() => {
    if (shouldShow) {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setMounted(true);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else if (mounted) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
      hideTimerRef.current = setTimeout(() => {
        setMounted(false);
      }, HIDE_DELAY_MS);
    }
    return () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, [mounted, opacity, shouldShow]);

  useEffect(() => {
    if (!shouldShow) {
      if (animationRef.current) {
        animationRef.current.stop();
        animationRef.current = null;
      }
      wiggle.setValue(0);
      return;
    }

    const sequence = Animated.sequence([
      Animated.timing(wiggle, {
        toValue: 1,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(wiggle, {
        toValue: -1,
        duration: 420,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(sequence);
    animationRef.current = loop;
    loop.start();

    return () => {
      loop.stop();
      animationRef.current = null;
      wiggle.setValue(0);
    };
  }, [shouldShow, wiggle]);

  useEffect(() => {
    if (!shouldShow || !trackerState.since) {
      setElapsedSeconds(0);
      return;
    }

    const updateElapsed = () => {
      const now = Date.now();
      const elapsed = Math.max(
        0,
        Math.floor((now - trackerState.since!) / 1000),
      );
      setElapsedSeconds(elapsed);
    };

    updateElapsed();
    const timer = setInterval(updateElapsed, 1000);
    return () => clearInterval(timer);
  }, [shouldShow, trackerState.since]);

  const rotate = useMemo(
    () =>
      wiggle.interpolate({
        inputRange: [-1, 1],
        outputRange: ['-12deg', '12deg'],
      }),
    [wiggle],
  );

  const scale = useMemo(
    () =>
      wiggle.interpolate({
        inputRange: [-1, 1],
        outputRange: [0.92, 1.08],
      }),
    [wiggle],
  );

  const title = t('common.pendingNotice.title');
  const message = t('common.pendingNotice.message');
  const timerLabel = trackerState.since
    ? t('common.pendingNotice.timer', { seconds: Math.max(1, elapsedSeconds) })
    : t('common.pendingNotice.timer', { seconds: 0 });
  const supportLabel = t('welcome.supportCta');

  const handleSupportPress = () => {
    router.push('/support');
  };

  if (!mounted) {
    return null;
  }

  return (
    <View
      pointerEvents="box-none"
      style={styles.wrapper as StyleProp<ViewStyle>}
    >
      <Animated.View style={[styles.card, { opacity }] as StyleProp<ViewStyle>}>
        <View style={styles.header}>
          <Animated.View
            style={{
              transform: [{ rotate }, { scale }],
            }}
          >
            <IconSymbol
              name="hourglass"
              size={28}
              color={styles.iconTint.color as string}
            />
          </Animated.View>
          <View style={styles.headerText}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.message}>{message}</ThemedText>
          </View>
        </View>
        <ThemedText style={styles.timer}>{timerLabel}</ThemedText>
        <View style={styles.actions}>
          {platform.isWeb ? (
            <Link
              href="/support"
              accessibilityRole="link"
              accessibilityLabel={supportLabel}
              style={styles.webSupportLink}
            >
              <ThemedText style={styles.supportButtonText}>
                {supportLabel}
              </ThemedText>
            </Link>
          ) : (
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel={supportLabel}
              onPress={handleSupportPress}
              activeOpacity={0.85}
              style={styles.supportButton}
            >
              <ThemedText style={styles.supportButtonText}>
                {supportLabel}
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    wrapper: {
      position: 'absolute',
      left: 16,
      right: 16,
      bottom: Platform.select({ ios: 36, android: 48, default: 40 }),
      alignItems: 'center',
      zIndex: 1500,
    },
    card: {
      width: '100%',
      maxWidth: 460,
      borderRadius: 20,
      paddingVertical: 18,
      paddingHorizontal: 20,
      backgroundColor: palette.cardBackground,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: palette.cardBorder,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.2,
          shadowRadius: 14,
        },
        default: {
          elevation: 6,
        },
      }),
      gap: 14,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 14,
    },
    headerText: {
      flex: 1,
      gap: 4,
    },
    title: {
      fontSize: 17,
      fontWeight: '600',
      color: palette.text,
    },
    message: {
      fontSize: 14,
      lineHeight: 20,
      color: palette.icon,
    },
    timer: {
      fontSize: 14,
      fontWeight: '600',
      color: palette.tint,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    supportButton: {
      backgroundColor: palette.tint,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 999,
    },
    webSupportLink: {
      backgroundColor: palette.tint,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 999,
      textDecorationLine: 'none',
      display: 'flex',
    },
    supportButtonText: {
      color: palette.background,
      fontWeight: '600',
      textAlign: 'center',
    },
    iconTint: {
      color: palette.tint,
    },
  });
}
