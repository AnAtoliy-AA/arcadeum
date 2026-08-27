import React from 'react';

/**
 * Sea Battle Board Layout Components
 * Refactored to standard HTML elements with CSS classes to ensure
 * stable grid layout and remove unnecessary styling library overhead.
 */

interface BoardGridProps {
  className?: string;
  gridSize?: number;
  style?: React.CSSProperties;
  ref?: React.Ref<HTMLDivElement>;
  tabIndex?: number;
  role?: React.AriaRole;
  'aria-label'?: string;
  'data-testid'?: string;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onMouseMove?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  children?: React.ReactNode;
}

export const BoardGrid = ({
  className = '',
  gridSize,
  style,
  ref,
  tabIndex,
  role,
  'aria-label': ariaLabel,
  'data-testid': testId,
  onKeyDown,
  onClick,
  onMouseMove,
  onMouseLeave,
  children,
}: BoardGridProps) => (
  <div
    ref={ref}
    role={role}
    aria-label={ariaLabel}
    data-testid={testId}
    tabIndex={tabIndex}
    onKeyDown={onKeyDown}
    onClick={onClick}
    onMouseMove={onMouseMove}
    onMouseLeave={onMouseLeave}
    className={`sb-board-grid-layout ${className}`}
    style={
      gridSize
        ? ({ ...style, '--sb-grid-size': gridSize } as React.CSSProperties)
        : style
    }
  >
    {children}
  </div>
);

interface BoardWithLabelsProps {
  className?: string;
  children?: React.ReactNode;
}

export const BoardWithLabels = ({
  className = '',
  children,
}: BoardWithLabelsProps) => (
  <div className={`sb-board-with-labels-layout ${className}`}>{children}</div>
);

interface AxisLabelsProps {
  className?: string;
  gridSize?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const RowLabels = ({
  className = '',
  gridSize,
  style,
  children,
}: AxisLabelsProps) => (
  <div
    className={`sb-row-labels ${className}`}
    style={
      gridSize
        ? ({ ...style, '--sb-grid-size': gridSize } as React.CSSProperties)
        : style
    }
  >
    {children}
  </div>
);

export const ColLabels = ({
  className = '',
  gridSize,
  style,
  children,
}: AxisLabelsProps) => (
  <div
    className={`sb-col-labels ${className}`}
    style={
      gridSize
        ? ({ ...style, '--sb-grid-size': gridSize } as React.CSSProperties)
        : style
    }
  >
    {children}
  </div>
);

interface LabelProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export const Label = ({ className = '', style, children }: LabelProps) => (
  <div className={`sb-label ${className}`} style={style}>
    {children}
  </div>
);

interface BoardCellProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  role?: React.AriaRole;
  'aria-label'?: string;
  'data-row'?: number;
  'data-col'?: number;
  'data-highlighted'?: string;
  'data-board-cell'?: string;
  draggable?: boolean;
  tabIndex?: number;
  onDragStart?: React.DragEventHandler<HTMLDivElement>;
  onDragOver?: React.DragEventHandler<HTMLDivElement>;
  onDrop?: React.DragEventHandler<HTMLDivElement>;
  onDragLeave?: React.DragEventHandler<HTMLDivElement>;
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  onPointerEnter?: React.PointerEventHandler<HTMLDivElement>;
  onPointerMove?: React.PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: React.PointerEventHandler<HTMLDivElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLDivElement>;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  onDoubleClick?: React.MouseEventHandler<HTMLDivElement>;
  onContextMenu?: React.MouseEventHandler<HTMLDivElement>;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
}

export const BoardCell = ({
  className = '',
  style,
  children,
  role,
  'aria-label': ariaLabel,
  'data-row': dataRow,
  'data-col': dataCol,
  'data-highlighted': dataHighlighted,
  'data-board-cell': dataBoardCell,
  draggable,
  tabIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragLeave,
  onPointerDown,
  onPointerEnter,
  onPointerMove,
  onPointerLeave,
  onMouseEnter,
  onMouseLeave,
  onClick,
  onDoubleClick,
  onContextMenu,
  onFocus,
}: BoardCellProps) => (
  <div
    role={role}
    aria-label={ariaLabel}
    data-row={dataRow}
    data-col={dataCol}
    data-highlighted={dataHighlighted}
    data-board-cell={dataBoardCell}
    draggable={draggable}
    tabIndex={tabIndex}
    onDragStart={onDragStart}
    onDragOver={onDragOver}
    onDrop={onDrop}
    onDragLeave={onDragLeave}
    onPointerDown={onPointerDown}
    onPointerEnter={onPointerEnter}
    onPointerMove={onPointerMove}
    onPointerLeave={onPointerLeave}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    onClick={onClick}
    onDoubleClick={onDoubleClick}
    onContextMenu={onContextMenu}
    onFocus={onFocus}
    className={`sb-cell ${className}`}
    style={style}
  >
    {children}
  </div>
);
