import { useMemo } from 'react';

import { getAppName } from '@/lib/appInfo';

export function useAppName(defaultName?: string): string {
  return useMemo(() => getAppName(defaultName), [defaultName]);
}
