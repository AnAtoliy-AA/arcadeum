import { useMemo, useState, useEffect } from 'react';
import { Platform, StyleSheet, useWindowDimensions } from 'react-native';
import {
  CARD_ASPECT_RATIO,
  CARD_GRADIENT_COORDS,
  DEFAULT_GRID_COLUMNS,
  GRID_CARD_MIN_WIDTH,
  MAX_GRID_COLUMNS,
  MIN_GRID_COLUMNS,
} from '../constants';

export function useTableLayout(styles: ReturnType<typeof StyleSheet.create>) {
  const { height: windowHeight } = useWindowDimensions();
  const [gridContainerWidth, setGridContainerWidth] = useState<number>(0);

  const cardScrollMaxHeight = Math.max(windowHeight - 240, 320);
  const cardScrollStyle = useMemo(() => {
    return Platform.OS === 'web'
      ? [styles.cardScroll, { height: cardScrollMaxHeight }]
      : [styles.cardScroll, { maxHeight: cardScrollMaxHeight }];
  }, [cardScrollMaxHeight, styles.cardScroll]);

  const cardGradientColors = useMemo(
    () => [
      StyleSheet.flatten(styles.cardGradientSwatchA).backgroundColor as string,
      StyleSheet.flatten(styles.cardGradientSwatchB).backgroundColor as string,
      StyleSheet.flatten(styles.cardGradientSwatchC).backgroundColor as string,
    ],
    [styles],
  );

  const handGridSpacing = useMemo(() => {
    const flattened = StyleSheet.flatten(styles.handGridContainer) as Record<
      string,
      unknown
    > | null;
    const horizontalPadding =
      flattened && typeof flattened['paddingHorizontal'] === 'number'
        ? (flattened['paddingHorizontal'] as number)
        : 0;
    const gap =
      flattened && typeof flattened['gap'] === 'number'
        ? (flattened['gap'] as number)
        : 12;
    return { horizontalPadding, gap };
  }, [styles.handGridContainer]);

  const maxColumnsByWidth = useMemo(() => {
    if (gridContainerWidth <= 0) {
      return MAX_GRID_COLUMNS;
    }

    const { horizontalPadding, gap } = handGridSpacing;
    const usableWidth = gridContainerWidth - horizontalPadding * 2;
    if (usableWidth <= 0) {
      return MIN_GRID_COLUMNS;
    }

    const capacity = Math.floor(
      (usableWidth + gap) / (GRID_CARD_MIN_WIDTH + gap),
    );
    const normalizedCapacity = Number.isFinite(capacity)
      ? capacity
      : MIN_GRID_COLUMNS;

    return Math.min(
      MAX_GRID_COLUMNS,
      Math.max(MIN_GRID_COLUMNS, normalizedCapacity),
    );
  }, [gridContainerWidth, handGridSpacing]);

  return {
    cardScrollMaxHeight,
    cardScrollStyle,
    cardGradientColors,
    cardGradientCoords: CARD_GRADIENT_COORDS,
    handGridSpacing,
    maxColumnsByWidth,
    gridContainerWidth,
    setGridContainerWidth,
  };
}

export function useGridColumns(
  maxColumnsByWidth: number,
  gridContainerWidth: number,
  handGridSpacing: { horizontalPadding: number; gap: number },
) {
  const [gridColumns, setGridColumns] = useState<number>(DEFAULT_GRID_COLUMNS);

  useEffect(() => {
    if (gridColumns > maxColumnsByWidth) {
      setGridColumns(maxColumnsByWidth);
    }
  }, [gridColumns, maxColumnsByWidth]);

  const gridCardDimensions = useMemo(() => {
    const columnCount = Math.max(
      MIN_GRID_COLUMNS,
      Math.min(gridColumns, MAX_GRID_COLUMNS, maxColumnsByWidth),
    );

    if (gridContainerWidth <= 0) {
      const fallbackWidth = 128;
      return {
        width: fallbackWidth,
        height: Math.round(fallbackWidth * CARD_ASPECT_RATIO),
      };
    }

    const { horizontalPadding, gap } = handGridSpacing;
    const spacingTotal = gap * Math.max(columnCount - 1, 0);
    const usableWidth =
      gridContainerWidth - horizontalPadding * 2 - spacingTotal;
    const rawWidth = usableWidth / columnCount;
    const safeWidth = Number.isFinite(rawWidth)
      ? rawWidth
      : GRID_CARD_MIN_WIDTH;
    const width = Math.max(GRID_CARD_MIN_WIDTH, Math.floor(safeWidth));
    const height = Math.round(width * CARD_ASPECT_RATIO);

    return { width, height };
  }, [gridColumns, gridContainerWidth, handGridSpacing, maxColumnsByWidth]);

  const handleGridColumnsChange = (delta: number) => {
    setGridColumns((value) =>
      delta > 0
        ? Math.min(maxColumnsByWidth, Math.min(MAX_GRID_COLUMNS, value + 1))
        : Math.max(MIN_GRID_COLUMNS, value - 1),
    );
  };

  return {
    gridColumns,
    setGridColumns,
    gridCardDimensions,
    handleGridColumnsChange,
  };
}
