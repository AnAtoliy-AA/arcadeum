import React, { HTMLAttributes } from 'react';

/**
 * Sea Battle Board Layout Components
 * Refactored to standard HTML elements with CSS classes to ensure
 * stable grid layout and remove unnecessary styling library overhead.
 */

interface BoardComponentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  gridSize?: number;
}

export const BoardGrid = ({
  className = '',
  gridSize,
  style,
  ...props
}: BoardComponentProps) => (
  <div
    className={`sb-board-grid-layout ${className}`}
    style={
      gridSize
        ? ({ ...style, '--sb-grid-size': gridSize } as React.CSSProperties)
        : style
    }
    {...props}
  />
);

export const BoardWithLabels = ({
  className = '',
  ...props
}: BoardComponentProps) => (
  <div className={`sb-board-with-labels-layout ${className}`} {...props} />
);

export const RowLabels = ({
  className = '',
  gridSize,
  style,
  ...props
}: BoardComponentProps) => (
  <div
    className={`sb-row-labels ${className}`}
    style={
      gridSize
        ? ({ ...style, '--sb-grid-size': gridSize } as React.CSSProperties)
        : style
    }
    {...props}
  />
);

export const ColLabels = ({
  className = '',
  gridSize,
  style,
  ...props
}: BoardComponentProps) => (
  <div
    className={`sb-col-labels ${className}`}
    style={
      gridSize
        ? ({ ...style, '--sb-grid-size': gridSize } as React.CSSProperties)
        : style
    }
    {...props}
  />
);

export const Label = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-label ${className}`} {...props} />
);

export const BoardCell = ({
  className = '',
  ...props
}: BoardComponentProps) => (
  <div className={`sb-cell ${className}`} {...props} />
);
