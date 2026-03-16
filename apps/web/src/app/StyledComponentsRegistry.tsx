'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useServerInsertedHTML } from 'next/navigation';
import { ServerStyleSheet, StyleSheetManager } from 'styled-components';

export function StyledComponentsRegistry({
  children,
}: {
  children: ReactNode;
}) {
  const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet());
  const isClient = typeof window !== 'undefined';

  useServerInsertedHTML(() => {
    const styles = styledComponentsStyleSheet.getStyleElement();
    styledComponentsStyleSheet.instance.clearTag();
    return <>{styles}</>;
  });

  useEffect(() => {
    return () => {
      styledComponentsStyleSheet.seal();
    };
  }, [styledComponentsStyleSheet]);

  if (isClient) {
    return <>{children}</>;
  }

  return (
    <StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
      {children}
    </StyleSheetManager>
  );
}
