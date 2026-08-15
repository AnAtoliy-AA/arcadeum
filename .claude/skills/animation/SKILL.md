---
name: animation
description: Implement smooth, performant animations using CSS transitions, Tailwind keyframes, and spring-like easing. Use when adding motion to UI, creating page transitions, or implementing scroll animations. Trigger on keywords like animation, motion, transition, spring, scroll reveal, GSAP.
---

# Animation Skill

Implement smooth, performant animations using CSS transitions, Tailwind keyframes, and scroll-based effects.

## When to Use

- Adding micro-interactions to buttons, cards, forms
- Creating page/screen transitions
- Implementing scroll-based reveal animations
- Building loading states with motion
- Adding hover/press feedback effects

## Core Principles

1. **Performance first** — Animate only `transform` and `opacity`
2. **Meaningful motion** — Every animation must convey purpose
3. **Accessible** — Respect `prefers-reduced-motion`
4. **Consistent** — Use the same timing and easing throughout

## Transitions

### Web — Tailwind Transition Classes

```tsx
// Hover/press feedback: duration + easing utilities with hover:/active: variants
<div className="box-border transition-all duration-150 ease-out hover:scale-[1.02] hover:opacity-[0.9] active:scale-[0.98]">
  <Card />
</div>

// Press feedback on buttons/links
<button className="box-border transition-transform duration-150 ease-out active:scale-95">
  Press me
</button>
```

### React Native — Animated

```tsx
import { Animated } from 'react-native';

// Fade in
<Animated.View style={{ opacity: fadeAnim }} />

// Scale on press (avoid onPressIn/onPressOut; derive from the pressed state)
<Pressable
  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
>
  <Button>Press me</Button>
</Pressable>
```

### Duration Tokens

```tsx
// Legacy Tamagui animation presets map to Tailwind duration utilities
duration-150   // "quick"  — micro-interactions (button press, toggle)
duration-300   // "medium" — standard UI transitions
duration-500   // "slow"   — complex reveals (never exceed)
```

## Spring Physics

### Configuration

```tsx
const springConfig = {
  damping: 15,        // Resistance (higher = less bounce)
  stiffness: 150,     // Speed (higher = faster)
  mass: 1,            // Weight (higher = slower)
  velocity: 0,        // Initial velocity
};
```

### Common Presets

| Preset | Config | Use Case |
|--------|--------|----------|
| Gentle | `{ damping: 20, stiffness: 200 }` | Subtle UI feedback |
| Bouncy | `{ damping: 10, stiffness: 100 }` | Playful interactions |
| Stiff | `{ damping: 30, stiffness: 300 }` | Quick, snappy responses |
| Slow | `{ damping: 15, stiffness: 50 }` | Dramatic reveals |

## Easing Curves

```css
/* Standard easing */
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);

/* Decelerate (entering) */
transition-timing-function: cubic-bezier(0, 0, 0.2, 1);

/* Accelerate (exiting) */
transition-timing-function: cubic-bezier(0.4, 0, 1, 1);
```

## Timing Guidelines

| Type | Duration | Use Case |
|------|----------|----------|
| Micro | 100-150ms | Button press, toggle |
| Standard | 200-300ms | Most UI transitions |
| Complex | 300-400ms | Page transitions, modals |
| Maximum | 500ms | Never exceed this |

## Common Patterns

### Button Press Feedback

```tsx
// Web: Tailwind active:/hover: variants — no JS or state needed
<button className="box-border transition-transform duration-150 ease-out hover:scale-[1.02] active:scale-95">
  Click me
</button>

// React Native: Pressable style function
<Pressable
  style={({ pressed }) => ({ transform: [{ scale: pressed ? 0.95 : 1 }] })}
>
  <Button>Click me</Button>
</Pressable>
```

### Fade In on Mount

```tsx
import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const FadeInView = ({ children }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View style={{ opacity }}>
      {children}
    </Animated.View>
  );
};
```

### Slide In from Bottom

```tsx
const SlideIn = ({ children }) => {
  const translateY = useRef(new Animated.Value(50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ transform: [{ translateY }], opacity }}>
      {children}
    </Animated.View>
  );
};
```

### Staggered List Animation

```tsx
const StaggeredItem = ({ index, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        tension: 50,
        friction: 8,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }] }}>
      {children}
    </Animated.View>
  );
};
```

### Modal Enter/Exit

```tsx
const Modal = ({ visible, onClose, children }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 0.9,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={{ opacity }}>
      <Animated.View style={{ transform: [{ scale }] }}>
        {children}
      </Animated.View>
    </Animated.View>
  );
};
```

## Accessibility

### Reduced Motion

```tsx
import { AccessibilityInfo } from 'react-native';

const [reducedMotion, setReducedMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReducedMotion);
  const listener = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    setReducedMotion
  );
  return () => listener.remove();
}, []);

// Use in animation
const duration = reducedMotion ? 0 : 300;
```

### Focus Management

```tsx
// After animation completes, move focus
useEffect(() => {
  animatedValue.addListener(({ value }) => {
    if (value === 1) {
      // Animation complete, focus element
      elementRef.current?.focus();
    }
  });
}, []);
```

## Performance Tips

1. Always use `useNativeDriver: true`
2. Avoid animating `width`, `height`, `top`, `left`
3. Use `transform` for position changes
4. Use `opacity` for visibility changes
5. Batch animations with `Animated.parallel`
6. Clean up listeners in `useEffect` return

## Checklist

- [ ] Animations use `transform` and `opacity` only
- [ ] Duration is 300ms or less for standard transitions
- [ ] Easing follows platform conventions
- [ ] `prefers-reduced-motion` is respected
- [ ] Animations are interruptible
- [ ] Focus management works after animations
- [ ] No layout thrashing occurs
- [ ] Native driver is enabled
