import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import type { ActionEffectType } from '../types';

export function useCardAnimations(actionBusy: string | null) {
  const cardPressScale = useRef(new Animated.Value(1)).current;
  const deckPulseScale = useRef(new Animated.Value(1)).current;
  const effectScale = useRef(new Animated.Value(0)).current;
  const effectOpacity = useRef(new Animated.Value(0)).current;
  const effectRotate = useRef(new Animated.Value(0)).current;
  const [activeEffect, setActiveEffect] = useState<ActionEffectType | null>(
    null,
  );
  const [animatingCardKey, setAnimatingCardKey] = useState<string | null>(null);

  const triggerCardAnimation = useCallback(
    (key: string, onComplete: () => void) => {
      setAnimatingCardKey(key);
      cardPressScale.setValue(1);
      Animated.sequence([
        Animated.timing(cardPressScale, {
          toValue: 0.92,
          duration: 90,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardPressScale, {
          toValue: 1.06,
          duration: 140,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(cardPressScale, {
          toValue: 1,
          duration: 140,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimatingCardKey(null);
        onComplete();
      });
    },
    [cardPressScale],
  );

  useEffect(() => {
    // deck pulse for draws
    if (actionBusy === 'draw') {
      deckPulseScale.setValue(1);
      Animated.sequence([
        Animated.timing(deckPulseScale, {
          toValue: 1.1,
          duration: 150,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.spring(deckPulseScale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Trigger simple centered effects for actions
    const mapBusyToEffect = (
      busy: typeof actionBusy,
    ): ActionEffectType | null => {
      if (!busy) return null;
      if (busy === 'cat_pair' || busy === 'cat_trio') return 'cat_combo';
      if (busy === 'draw' || busy === 'skip' || busy === 'attack') {
        return busy as ActionEffectType;
      }
      return null;
    };

    const effectType = mapBusyToEffect(actionBusy);
    if (effectType) {
      // kickoff overlay animation
      setActiveEffect(effectType);
      effectScale.setValue(0.6);
      effectOpacity.setValue(0.95);
      effectRotate.setValue(0);

      Animated.parallel([
        Animated.timing(effectScale, {
          toValue: 1.35,
          duration: 420,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(effectOpacity, {
          toValue: 0,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(effectRotate, {
          toValue: 1,
          duration: 520,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setActiveEffect(null);
      });
    }
  }, [actionBusy, deckPulseScale, effectScale, effectOpacity, effectRotate]);

  return {
    cardPressScale,
    deckPulseScale,
    effectScale,
    effectOpacity,
    effectRotate,
    activeEffect,
    animatingCardKey,
    triggerCardAnimation,
  };
}
