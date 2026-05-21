'use client';

import { Fragment, type ReactNode } from 'react';

import { Typography } from '../Typography/Typography';

export type BreadcrumbItem = {
  label: string;
  /**
   * Absolute path (e.g. `/games`). When omitted the item renders as the
   * non-link "current page" terminal node.
   */
  href?: string;
};

export type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  /**
   * Element type rendered around each linkable item — pass `next/link`'s
   * `Link` (or any router-aware link) so the component stays framework
   * agnostic. Defaults to a plain anchor.
   */
  LinkComponent?: (props: { href: string; children: ReactNode }) => ReactNode;
  /** Localized accessible label, defaults to "Breadcrumb". */
  ariaLabel?: string;
};

const DefaultLink = ({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) => <a href={href}>{children}</a>;

/**
 * Renders a visible breadcrumb trail with semantic markup. JSON-LD
 * `BreadcrumbList` is emitted separately via `shared/seo/jsonLd.ts` —
 * keep the two in sync so the visible UI and structured data agree.
 */
export function Breadcrumbs({
  items,
  LinkComponent = DefaultLink,
  ariaLabel = 'Breadcrumb',
}: BreadcrumbsProps) {
  if (items.length === 0) return null;

  return (
    <nav aria-label={ariaLabel}>
      <ol
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          margin: 0,
          padding: 0,
          listStyle: 'none',
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              <li style={{ display: 'inline-flex', alignItems: 'center' }}>
                {item.href && !isLast ? (
                  <LinkComponent href={item.href}>
                    <Typography uiSize="sm" alpha="medium">
                      {item.label}
                    </Typography>
                  </LinkComponent>
                ) : (
                  <Typography
                    uiSize="sm"
                    alpha={isLast ? 'high' : 'medium'}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.label}
                  </Typography>
                )}
              </li>
              {!isLast ? (
                <Typography uiSize="sm" alpha="low" aria-hidden>
                  /
                </Typography>
              ) : null}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
