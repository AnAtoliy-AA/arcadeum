---
name: react-native-expert
description: Build cross-platform mobile apps with React Native and Expo. Use when creating screens, implementing navigation, handling platform-specific code, or optimizing mobile performance. Trigger on keywords like React Native, Expo, mobile, iOS, Android, navigation, platform-specific.
---

# React Native Expert

## When to Use

- Creating new screens/components
- Implementing navigation with Expo Router
- Handling platform-specific code
- Optimizing mobile performance
- Implementing animations with Reanimated

## Project Conventions

- Use Expo Router for navigation
- Use React Native primitives (`View`, `Text`, `Pressable`, `FlatList`) with `StyleSheet`
- Use `useThemedStyles` from `@/hooks/useThemedStyles` for theme-aware styles
- Follow Expo SDK patterns

## Code Examples

### Screen with Expo Router

```tsx
import { Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

export default function GameScreen() {
  return (
    <Stack>
      <Stack.Screen options={{ title: 'Game' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Game</Text>
      </View>
    </Stack>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  title: { fontSize: 24, fontWeight: 'bold' },
});
```

### Platform-Specific Code

```tsx
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 4 },
    }),
  },
});
```

### Custom Hook

```tsx
import { useState, useEffect } from 'react';
import { useLocalSearchParams } from 'expo-router';

export function useGame() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGame(id).then(setGame).finally(() => setLoading(false));
  }, [id]);

  return { game, loading };
}
```

### Animation with Reanimated

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

function AnimatedCard() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={() => { scale.value = withSpring(0.95); }}
        style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
      >
        <Text>Tap me</Text>
      </Pressable>
    </Animated.View>
  );
}
```

### FlatList with Optimization

```tsx
import { FlatList } from 'react-native';

function GameList({ games }: { games: Game[] }) {
  const renderItem = useCallback(({ item }: { item: Game }) => (
    <GameCard game={item} />
  ), []);

  const keyExtractor = useCallback((item: Game) => item.id, []);

  return (
    <FlatList
      data={games}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      getItemLayout={(data, index) => ({
        length: CARD_HEIGHT,
        offset: CARD_HEIGHT * index,
        index,
      })}
    />
  );
}
```

## Performance Tips

### DO
- Use `React.memo` for pure components
- Use `useCallback` for functions passed to children
- Use `useMemo` for expensive calculations
- Use `FlatList` for long lists (not `ScrollView`)
- Use `getItemLayout` for fixed-height items
- Use `removeClippedSubviews` for large lists

### DON'T
- Use inline functions in render
- Create objects in render
- Use `setState` in render
- Use `setTimeout` without cleanup
- Use `ScrollView` for long lists

## Safe Areas

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function Screen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
      {/* Content */}
    </View>
  );
}
```

## Haptics

```tsx
import * as Haptics from 'expo-haptics';

function Button() {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Do something
  };

  return <Pressable onPress={handlePress} accessibilityLabel="Trigger haptic feedback" />;
}
```

## Constraints

### MUST DO
- Use Expo Router for navigation
- Use React Native primitives + `StyleSheet` for UI components
- Handle safe areas properly
- Use `useCallback`/`useMemo` for performance
- Test on both iOS and Android
- Handle keyboard avoidance

### MUST NOT DO
- Use `any` type
- Import `@arcadeum/ui` or Tailwind classes in `apps/mobile` — mobile uses RN primitives only
- Use `console.log` in production
- Hardcode dimensions (use responsive units)
- Ignore platform differences
