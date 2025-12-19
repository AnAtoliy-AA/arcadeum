import type { PropsWithChildren, ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';
import { useThemedStyles, type Palette } from '@/hooks/useThemedStyles';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
  headerImage: ReactElement;
}>;

export default function ParallaxScrollView({ children, headerImage }: Props) {
  const styles = useThemedStyles(createStyles);
  const scrollOffset = useSharedValue(0);
  const handleScroll = useAnimatedScrollHandler((event) => {
    scrollOffset.value = event.contentOffset.y;
  });
  const bottom = useBottomTabOverflow();
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75],
          ),
        },
        {
          scale: interpolate(
            scrollOffset.value,
            [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
            [2, 1, 1],
          ),
        },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={handleScroll}
        scrollIndicatorInsets={{ bottom }}
        contentContainerStyle={{ paddingBottom: bottom }}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          {headerImage}
        </Animated.View>
        <ThemedView style={styles.content}>{children}</ThemedView>
      </Animated.ScrollView>
    </ThemedView>
  );
}

const createStyles = (palette: Palette) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      height: HEADER_HEIGHT,
      overflow: 'hidden',
      backgroundColor: palette.cardBackground,
    },
    content: {
      flex: 1,
      padding: 32,
      gap: 16,
      overflow: 'hidden',
    },
  });
