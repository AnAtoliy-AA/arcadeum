import React from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

type CommonProps = {
  className?: string;
  style?: React.CSSProperties;
  id?: string;
  title?: string;
  'data-testid'?: string;
  children?: React.ReactNode;
};

export const MainGameArea = ({
  className,
  style,
  id,
  title,
  'data-testid': testId,
  children,
}: CommonProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch gap-2 w-full flex-1 min-h-0 min-w-0 p-1',
      'max-[1150px]:gap-2 max-[1150px]:p-0.5',
      'max-[800px]:gap-1 max-[800px]:p-0',
      className,
    )}
    style={style}
    id={id}
    title={title}
    data-testid={testId}
  >
    {children}
  </div>
);

type GameBoardWrapperProps = CommonProps & {
  onDragEnd?: React.DragEventHandler<HTMLDivElement>;
};

export const GameBoardWrapper = ({
  className,
  style,
  id,
  title,
  'data-testid': testId,
  onDragEnd,
  children,
}: GameBoardWrapperProps) => (
  <div
    className={cx(
      'flex flex-row items-stretch gap-4 flex-wrap w-full justify-center',
      'max-[1150px]:flex-col max-[1150px]:gap-3',
      'max-[800px]:flex-col max-[800px]:gap-2',
      className,
    )}
    style={style}
    id={id}
    title={title}
    data-testid={testId}
    onDragEnd={onDragEnd}
  >
    {children}
  </div>
);

type BoardContainerProps = CommonProps & {
  alignSelf?: React.CSSProperties['alignSelf'];
};

export const BoardContainer = ({
  className,
  style,
  id,
  title,
  'data-testid': testId,
  alignSelf,
  children,
}: BoardContainerProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch flex-1 max-w-[520px] w-full',
      'max-[1150px]:flex-[0] max-[1150px]:max-w-[500px] max-[1150px]:self-center',
      'max-[800px]:flex-[0] max-[800px]:max-w-none',
      '[@media(max-height:480px)]:max-w-[420px]',
      className,
    )}
    id={id}
    title={title}
    data-testid={testId}
    style={{
      ...(alignSelf ? { alignSelf } : {}),
      ...(style ?? {}),
    }}
  >
    {children}
  </div>
);
