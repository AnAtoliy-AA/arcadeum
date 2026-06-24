'use client';

import dynamic from 'next/dynamic';

const SessionRoleSync = dynamic(
  () =>
    import('@/entities/session/model/SessionRoleSync').then(
      (m) => m.SessionRoleSync,
    ),
  { ssr: false },
);

export function LazySessionRoleSync() {
  return <SessionRoleSync />;
}
