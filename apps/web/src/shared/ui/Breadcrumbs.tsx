'use client';

import NextLink from 'next/link';
import type { ReactNode } from 'react';
import {
  Breadcrumbs as UiBreadcrumbs,
  type BreadcrumbsProps,
} from '@arcadeum/ui';

const NextLinkAdapter = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => <NextLink href={href}>{children}</NextLink>;

/**
 * Web wrapper around `@arcadeum/ui`'s `Breadcrumbs` that wires `next/link`
 * so client-side navigation works without an extra import in every page.
 */
export function Breadcrumbs(props: Omit<BreadcrumbsProps, 'LinkComponent'>) {
  return <UiBreadcrumbs {...props} LinkComponent={NextLinkAdapter} />;
}
