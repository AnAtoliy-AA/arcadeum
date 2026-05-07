import React, { HTMLAttributes } from 'react';

/**
 * Sea Battle Board Layout Components
 * Refactored to standard HTML elements with CSS classes to ensure
 * stable grid layout and remove unnecessary styling library overhead.
 */

interface BoardComponentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const BoardGrid = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-board-grid-layout ${className}`} {...props} />
);

export const BoardWithLabels = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-board-with-labels-layout ${className}`} {...props} />
);

export const RowLabels = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-row-labels ${className}`} {...props} />
);

export const ColLabels = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-col-labels ${className}`} {...props} />
);

export const Label = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-label ${className}`} {...props} />
);

export const BoardCell = ({ className = '', ...props }: BoardComponentProps) => (
  <div className={`sb-cell ${className}`} {...props} />
);
