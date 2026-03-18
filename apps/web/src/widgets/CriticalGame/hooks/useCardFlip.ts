import { useState, useRef, useEffect } from 'react';
import type { CriticalCard } from '../types';

interface UseCardFlipResult {
  flippingCardType: CriticalCard | null;
  showBack: boolean;
}

/**
 * Detects when exactly one new card type enters the player's hand and triggers
 * a 600ms CSS flip animation. showBack flips from true→false at the 300ms midpoint
 * so the sprite swaps from card back to card front at the hidden frame.
 *
 * @param distinctCardTypes - memoized array of distinct card types in hand (from groupedHand.map(i => i.card))
 */
export function useCardFlip(distinctCardTypes: CriticalCard[]): UseCardFlipResult {
  const [flippingCardType, setFlippingCardType] = useState<CriticalCard | null>(null);
  const [showBack, setShowBack] = useState(true);
  const previousTypes = useRef<Set<CriticalCard>>(new Set());
  const flipTimers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const currentSet = new Set(distinctCardTypes);

    const newTypes: CriticalCard[] = [];
    currentSet.forEach((card) => {
      if (!previousTypes.current.has(card)) {
        newTypes.push(card);
      }
    });

    // Only flip for exactly one new type (ignore bulk draw, combo result, or no change)
    if (newTypes.length === 1) {
      const card = newTypes[0];

      flipTimers.current.forEach(clearTimeout);

      setFlippingCardType(card);
      setShowBack(true);

      // At midpoint: reveal front face
      const midTimer = setTimeout(() => {
        setShowBack(false);
      }, 300);

      // After full animation: clear flipping state
      const endTimer = setTimeout(() => {
        setFlippingCardType(null);
        setShowBack(true);
      }, 600);

      flipTimers.current = [midTimer, endTimer];
    }

    previousTypes.current = currentSet;
  }, [distinctCardTypes]);

  useEffect(() => {
    return () => {
      flipTimers.current.forEach(clearTimeout);
    };
  }, []);

  return { flippingCardType, showBack };
}
