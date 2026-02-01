import Constants from 'expo-constants';

export type DownloadLinks = {
  ios?: string;
  android?: string;
};

type AppExtra = {
  downloadLinks?: {
    ios?: string | null;
    android?: string | null;
  };
};

export const getDownloadLinks = (): DownloadLinks => {
  const extra = (Constants.expoConfig?.extra ?? Constants.manifestExtra) as
    | AppExtra
    | undefined;

  return {
    ios: extra?.downloadLinks?.ios ?? undefined,
    android: extra?.downloadLinks?.android ?? undefined,
  };
};

export const hasDownloadLinks = (): boolean => {
  const links = getDownloadLinks();
  return Boolean(links.ios || links.android);
};
