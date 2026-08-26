'use client';
import React from 'react';
import { AppleIcon, AndroidIcon, SmartphoneIcon } from '../Icons';
import { cx } from '../../utils/cx';

const downloadLinkClasses = [
  'flex',
  'min-h-[60px]',
  'min-w-[170px]',
  'cursor-pointer',
  'flex-row',
  'items-center',
  'gap-3',
  'rounded-[100px]',
  'border-[1.5px]',
  'border-[var(--borderColor)]',
  'bg-[var(--background)]',
  'px-8',
  'py-3',
  'no-underline',
  '[transition:transform_0.2s_ease,background-color_0.2s_ease,border-color_0.2s_ease]',
  'hover:scale-[1.02]',
  'hover:border-[var(--borderColorHover)]',
  'hover:bg-[var(--backgroundHover)]',
  'active:scale-[0.98]',
  'active:border-[var(--borderColorPress)]',
  'active:bg-[var(--backgroundPress)]',
].join(' ');

const containerClasses =
  'flex flex-row flex-wrap justify-center gap-4 max-[660px]:flex-col max-[660px]:items-stretch';

const iconWrapperClasses = 'flex flex-row items-center justify-center';

const textWrapperClasses = 'flex flex-col items-start';

const smallTextClasses =
  'text-[10px] font-semibold uppercase tracking-[1px] text-[var(--color)] opacity-[0.9] leading-[12px]';

const largeTextClasses =
  'text-[20px] font-bold whitespace-nowrap text-[var(--color)] leading-[22px]';

export type DownloadLinkAnchorProps = {
  tag?: 'a' | 'button' | 'div';
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
  children?: React.ReactNode;
  href?: string;
  target?: string;
  rel?: string;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (event: React.MouseEvent) => void;
};

export const DownloadLinkAnchor = React.forwardRef<
  HTMLAnchorElement | HTMLButtonElement | HTMLDivElement,
  DownloadLinkAnchorProps
>(function DownloadLinkAnchor(
  { tag = 'a', className, style, 'data-testid': dataTestId, children, href, target, rel, type, onClick },
  ref,
) {
  const classes = cx(downloadLinkClasses, className);

  if (tag === 'button') {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? 'button'}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
        className={classes}
        style={style}
        data-testid={dataTestId}
      >
        {children}
      </button>
    );
  }
  if (tag === 'div') {
    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        onClick={onClick as React.MouseEventHandler<HTMLDivElement> | undefined}
        className={classes}
        style={style}
        data-testid={dataTestId}
      >
        {children}
      </div>
    );
  }
  return (
    <a
      ref={ref as React.Ref<HTMLAnchorElement>}
      href={href}
      target={target}
      rel={rel}
      onClick={onClick as React.MouseEventHandler<HTMLAnchorElement> | undefined}
      className={classes}
      style={style}
      data-testid={dataTestId}
    >
      {children}
    </a>
  );
});

export interface DownloadButtonsProps {
  iosHref?: string;
  androidHref?: string;
  onInstall?: () => void;
  onShowInstructions?: () => void;
  labels: {
    iosStore: { small: string; large: string };
    googlePlay: { small: string; large: string };
    pwaInstall: { small: string; large: string };
    pwaGuide: { small: string; large: string };
    installAs: string;
    getThe: string;
    webApp: string;
    appGuide: string;
  };
}

export const DownloadButtons: React.FC<DownloadButtonsProps> = ({
  iosHref,
  androidHref,
  onInstall,
  onShowInstructions,
  labels,
}) => {
  if (!iosHref && !androidHref && !onInstall && !onShowInstructions) {
    return null;
  }

  return (
    <div className={containerClasses}>
      {iosHref && (
        <DownloadLinkAnchor
          tag="a"
          href={iosHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="download-ios-button"
          style={{ textDecoration: 'none' }}
        >
          <div className={iconWrapperClasses}>
            <AppleIcon size={32} />
          </div>
          <div className={textWrapperClasses}>
            <span className={smallTextClasses}>{labels.iosStore.small}</span>
            <span className={largeTextClasses}>{labels.iosStore.large}</span>
          </div>
        </DownloadLinkAnchor>
      )}

      {androidHref && (
        <DownloadLinkAnchor
          tag="a"
          href={androidHref}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="download-android-button"
          style={{ textDecoration: 'none' }}
        >
          <div className={iconWrapperClasses}>
            <AndroidIcon size={32} />
          </div>
          <div className={textWrapperClasses}>
            <span className={smallTextClasses}>{labels.googlePlay.small}</span>
            <span className={largeTextClasses}>{labels.googlePlay.large}</span>
          </div>
        </DownloadLinkAnchor>
      )}

      {(onInstall || onShowInstructions) && (
        <DownloadLinkAnchor
          tag="button"
          onClick={onInstall || onShowInstructions}
          data-testid="install-pwa-button"
        >
          <div className={iconWrapperClasses}>
            <SmartphoneIcon size={32} />
          </div>
          <div className={textWrapperClasses}>
            <span className={smallTextClasses}>
              {onInstall ? labels.installAs : labels.getThe}
            </span>
            <span className={largeTextClasses}>
              {onInstall ? labels.webApp : labels.appGuide}
            </span>
          </div>
        </DownloadLinkAnchor>
      )}
    </div>
  );
};
