import { cx } from '../../utils/cx';

export type MythicPortraitProps = {
  monogram: string;
  size?: number;
  testID?: string;
  'data-testid'?: string;
  className?: string;
};

const FrameClasses = 'box-border relative';

const ArcClasses = 'absolute border-2 border-[var(--mythicAccent)]';

const DiskClasses = 'absolute flex items-center justify-center overflow-hidden';

export function MythicPortrait({
  monogram,
  size = 96,
  testID,
  'data-testid': dataTestId,
  className,
}: MythicPortraitProps) {
  const frameSize = size + 16;
  return (
    <div
      data-testid={dataTestId ?? testID}
      className={cx(FrameClasses, className)}
      style={{ width: frameSize, height: frameSize }}
    >
      <div
        className={ArcClasses}
        style={{
          top: 0,
          left: 0,
          width: frameSize,
          height: frameSize,
          borderRadius: frameSize / 2,
          clipPath: 'inset(0 50% 50% 0)',
        }}
      />
      <div
        className={ArcClasses}
        style={{
          top: 0,
          left: 0,
          width: frameSize,
          height: frameSize,
          borderRadius: frameSize / 2,
          clipPath: 'inset(50% 0 0 50%)',
        }}
      />
      <div
        className={DiskClasses}
        style={{
          top: 8,
          left: 8,
          width: size,
          height: size,
          borderRadius: size / 2,
          background: 'linear-gradient(180deg, #22d3ee, #6366f1)',
        }}
      >
        <span
          className="font-bold text-white"
          style={{ fontSize: Math.round(size * 0.55) }}
        >
          {monogram.slice(0, 2).toUpperCase()}
        </span>
      </div>
      <span
        className="absolute text-[28px] text-[#fbbf24]"
        style={{ top: -4, right: -4 }}
        aria-label="Crown"
      >
        ♛
      </span>
    </div>
  );
}
