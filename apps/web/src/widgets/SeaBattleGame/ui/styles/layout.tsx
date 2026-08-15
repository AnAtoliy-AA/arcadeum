import React from 'react';

import { cx } from '@arcadeum/ui/utils/cx';

type CommonProps = React.HTMLAttributes<HTMLDivElement> & {
  className?: string;
};

export const MainGameArea = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch gap-4 w-full flex-1 min-h-0 min-w-0 p-2',
      'max-[1150px]:gap-3 max-[1150px]:p-1',
      'max-[800px]:gap-2 max-[800px]:p-0',
      className,
    )}
    {...props}
  />
);

export const GameBoardWrapper = ({ className, ...props }: CommonProps) => (
  <div
    className={cx(
      'flex flex-row items-stretch gap-4 flex-wrap w-full justify-center',
      'max-[1150px]:flex-col max-[1150px]:gap-3',
      'max-[800px]:flex-col max-[800px]:gap-2',
      className,
    )}
    {...props}
  />
);

type BoardContainerProps = CommonProps & {
  alignSelf?: React.CSSProperties['alignSelf'];
};

export const BoardContainer = ({
  className,
  alignSelf,
  style,
  ...props
}: BoardContainerProps) => (
  <div
    className={cx(
      'flex flex-col items-stretch flex-1 max-w-[520px] w-full',
      'max-[1150px]:flex-[0] max-[1150px]:max-w-[500px] max-[1150px]:self-center',
      'max-[800px]:flex-[0] max-[800px]:max-w-none',
      '[@media(max-height:480px)]:max-w-[420px]',
      className,
    )}
    style={{
      ...(alignSelf ? { alignSelf } : {}),
      ...(style ?? {}),
    }}
    {...props}
  />
);
