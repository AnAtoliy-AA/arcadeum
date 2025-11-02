import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';
import { useTranslation } from '@/lib/i18n';
import { emitGlobalError, registerGlobalErrorHandler, unregisterGlobalErrorHandler } from '@/lib/globalErrorHandler';
import type { TranslationKey } from '@/lib/i18n/messages';

interface ErrorToastOptions {
  duration?: number;
}

interface ErrorToastContextValue {
  showError(message: string, options?: ErrorToastOptions): void;
  clearErrors(): void;
}

interface ToastItem {
  id: string;
  message: string;
  duration: number;
}

const ErrorToastContext = createContext<ErrorToastContextValue | undefined>(undefined);

const DEFAULT_DURATION = 3000;

export function ErrorToastProvider({ children }: { children: React.ReactNode }) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map(),
  );

  const removeToast = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const scheduleRemoval = useCallback((id: string, duration: number) => {
    const timer = setTimeout(() => {
      removeToast(id);
    }, duration);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  const showError = useCallback((rawMessage: string, options?: ErrorToastOptions) => {
    const trimmed = rawMessage?.trim();
    const fallback = t('common.errors.genericApiError');
    const translated = trimmed
      ? t(trimmed as TranslationKey, { defaultValue: trimmed })
      : fallback;
    const message = translated || fallback;
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const duration = Math.max(options?.duration ?? DEFAULT_DURATION, 1000);

    setToasts((current) => [...current, { id, message, duration }]);
    scheduleRemoval(id, duration);
  }, [scheduleRemoval, t]);

  const clearErrors = useCallback(() => {
    timersRef.current.forEach((timer) => clearTimeout(timer));
    timersRef.current.clear();
    setToasts([]);
  }, []);

  useEffect(() => {
    registerGlobalErrorHandler(showError);
    return () => {
      unregisterGlobalErrorHandler(showError);
      clearErrors();
    };
  }, [clearErrors, showError]);

  const contextValue = useMemo<ErrorToastContextValue>(() => ({
    showError,
    clearErrors,
  }), [clearErrors, showError]);

  return (
    <ErrorToastContext.Provider value={contextValue}>
      {children}
      <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 12 }] as StyleProp<ViewStyle>}>
        {toasts.map((toast) => (
          <ToastBubble
            key={toast.id}
            message={toast.message}
            onDismiss={() => removeToast(toast.id)}
            style={styles.toast}
          />
        ))}
      </View>
    </ErrorToastContext.Provider>
  );
}

export function useErrorToasts(): ErrorToastContextValue {
  const ctx = useContext(ErrorToastContext);
  if (!ctx) {
    throw new Error('useErrorToasts must be used within an ErrorToastProvider');
  }
  return ctx;
}

function ToastBubble({
  message,
  onDismiss,
  style,
}: {
  message: string;
  onDismiss(): void;
  style: StyleProp<ViewStyle>;
}) {
  const styles = useThemedStyles(createStyles);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();

    return () => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        easing: Easing.in(Easing.ease),
        useNativeDriver: true,
      }).start();
    };
  }, [opacity]);

  return (
    <Animated.View style={[style, { opacity }] as StyleProp<ViewStyle>}>
      <Pressable onPress={onDismiss} style={styles.toastPressable} accessibilityRole="alert">
        <ThemedText style={styles.toastText}>{message}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

function createStyles(palette: Palette) {
  return StyleSheet.create({
    host: {
      position: 'absolute',
      left: 16,
      right: 16,
      zIndex: 2000,
      gap: 8,
    },
    toast: {
      borderRadius: 16,
      backgroundColor: palette.destructive,
      shadowColor: '#000',
      shadowOpacity: 0.25,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 8,
    },
    toastPressable: {
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    toastText: {
      color: palette.background,
      fontSize: 14,
      fontWeight: '600',
    },
  });
}

// Allow modules outside React tree to trigger errors when the context is already set up.
export function showGlobalError(message: string, options?: ErrorToastOptions) {
  emitGlobalError(message, options);
}
