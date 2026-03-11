'use client';

import React from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import config from '@/shared/config/tamagui.config';

export function TamaguiRegistry({ children }: { children: React.ReactNode }) {
  useServerInsertedHTML(() => {
    const code = config.getCSS();
    return (
      <style
        dangerouslySetInnerHTML={{
          __html: code,
        }}
      />
    );
  });

  return <>{children}</>;
}
