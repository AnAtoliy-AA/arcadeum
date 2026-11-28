'use client';

import { GlassCard, Spinner, Typography } from '@arcadeum/ui';
import type { StreamAuditView } from '../server/stream.types';
import type { StreamT } from './useStreamT';

const MAX_SHOWN = 4;

const show = (v: unknown): string => {
  if (typeof v === 'string') return v === '' ? '""' : v;
  if (v === null || v === undefined) return '-';
  return Array.isArray(v) ? `[${v.length}]` : String(v);
};

interface Props {
  items: StreamAuditView[] | null;
  loading: boolean;
  failed: boolean;
  t: StreamT;
}

/** Who changed what and when. Loading, error and empty states are explicit. */
export function StreamAuditList({ items, loading, failed, t }: Props) {
  return (
    <GlassCard className="flex flex-col gap-3 p-4" data-testid="stream-audit">
      <Typography variant="heading" level={3} uiSize="md">
        {t('audit.title')}
      </Typography>
      {loading && !items ? (
        <div
          className="flex items-center gap-2 text-sm"
          role="status"
          data-testid="stream-audit-loading"
        >
          <Spinner size="sm" /> {t('audit.loading')}
        </div>
      ) : failed && !items ? (
        <p
          role="alert"
          className="m-0 text-sm text-[var(--danger)]"
          data-testid="stream-audit-error"
        >
          {t('audit.loadError')}
        </p>
      ) : !items || items.length === 0 ? (
        <p
          className="m-0 text-sm text-[var(--neutral)]"
          data-testid="stream-audit-empty"
        >
          {t('audit.empty')}
        </p>
      ) : (
        <ol className="m-0 flex list-none flex-col gap-3 p-0">
          {items.map((a) => (
            <li
              key={a.id}
              data-testid="stream-audit-item"
              className="flex flex-col gap-1 border-t border-[var(--borderColor)] pt-3 first:border-0 first:pt-0"
            >
              <div className="flex flex-wrap items-baseline gap-x-3 text-xs text-[var(--neutral)]">
                <span className="font-semibold text-[var(--colorText)]">
                  {t('audit.by', {
                    who: a.adminLabel,
                    time: new Date(a.changedAt).toLocaleString(),
                  })}
                </span>
                <span>{t('audit.version', { version: a.version })}</span>
              </div>
              <ul className="m-0 flex list-none flex-col gap-0.5 p-0 text-sm">
                {a.changes.slice(0, MAX_SHOWN).map((c) => (
                  <li key={c.path} className="break-words">
                    {a.kind === 'command' ? (
                      t('audit.command', { name: show(c.to) })
                    ) : (
                      <>
                        <code className="text-xs">{c.path}</code>:{' '}
                        {show(c.from)} {'->'} {show(c.to)}
                      </>
                    )}
                  </li>
                ))}
                {a.changes.length > MAX_SHOWN ? (
                  <li className="text-xs text-[var(--neutral)]">
                    {t('audit.more', { count: a.changes.length - MAX_SHOWN })}
                  </li>
                ) : null}
              </ul>
            </li>
          ))}
        </ol>
      )}
    </GlassCard>
  );
}
