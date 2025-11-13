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
  matches: (...targets: PlatformOSType[]) => boolean;
};

export const platform: PlatformHelper = {
  os,
  isWeb: os === 'web',
  isIos: os === 'ios',
  isAndroid: os === 'android',
  isMacOs: os === 'macos',
  isWindows: os === 'windows',
  isNative: os === 'ios' || os === 'android',
  isDesktop: os === 'macos' || os === 'windows',
  matches: (...targets: PlatformOSType[]) => targets.includes(os),
};
