import React, { HTMLAttributes } from 'react';

/**
 * Sea Battle Board Layout Components
 * Refactored to standard HTML elements with CSS classes to ensure
 * stable grid layout and remove unnecessary styling library overhead.
 */

interface BoardComponentProps extends HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

// Wraps the 10×10 grid in a `.sb-board-cell` so the multi-board layout
// can drive it as a query container: in fit-grid mode the cell is sized
// by its grid track, and the BoardGrid inside picks the larger of cqi/cqh
// (clamped to the smaller) so it stays square and fits both dimensions.
// In single-board contexts (placement) the cell stays width:100% and the
// BoardGrid fills it naturally.
export const BoardGrid = ({
  className = '',
  children,
  ...props
}: BoardComponentProps) => (
  <div className="sb-board-cell">
    <div className={`sb-board-grid-layout ${className}`} {...props}>
      {children}
    </div>
  </div>
);

export const BoardWithLabels = ({
  className = '',
  ...props
}: BoardComponentProps) => (
  <div className={`sb-board-with-labels-layout ${className}`} {...props} />
);

export const RowLabels = ({
  className = '',
  ...props
}: BoardComponentProps) => (
  <div className={`sb-row-labels ${className}`} {...props} />
);

export const ColLabels = ({
  className = '',
  ...props
}: BoardComponentProps) => (
  <div className={`sb-col-labels ${className}`} {...props} />
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
