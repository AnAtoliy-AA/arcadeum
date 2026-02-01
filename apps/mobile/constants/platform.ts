import { Platform, PlatformOSType } from 'react-native';

const os = Platform.OS as PlatformOSType;

type PlatformHelper = {
  readonly os: PlatformOSType;
  readonly isWeb: boolean;
  readonly isIos: boolean;
  readonly isAndroid: boolean;
  readonly isMacOs: boolean;
  readonly isWindows: boolean;
  readonly isNative: boolean;
  readonly isDesktop: boolean;
  readonly isIosWeb: boolean;
  readonly isAndroidWeb: boolean;
  matches: (...targets: PlatformOSType[]) => boolean;
};

const isWeb = os === 'web';
const userAgent =
  isWeb && typeof window !== 'undefined' ? window.navigator.userAgent : '';

const isIosWeb = isWeb && /iPhone|iPad|iPod/i.test(userAgent);
const isAndroidWeb = isWeb && /Android/i.test(userAgent);

export const platform: PlatformHelper = {
  os,
  isWeb,
  isIos: os === 'ios',
  isAndroid: os === 'android',
  isMacOs: os === 'macos',
  isWindows: os === 'windows',
  isNative: os === 'ios' || os === 'android',
  isDesktop: os === 'macos' || os === 'windows',
  matches: (...targets: PlatformOSType[]) => targets.includes(os),
  isIosWeb,
  isAndroidWeb,
};
