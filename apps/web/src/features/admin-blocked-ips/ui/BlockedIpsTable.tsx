'use client';

import { Button, GlassCard } from '@arcadeum/ui';
import { Spinner } from '@/shared/ui/CSSSpinner';
import type { BlockedIp } from '../api';

export interface BlockedIpsTableLabels {
  empty: string;
  table: {
    ip: string;
    reason: string;
    expiresAt: string;
    actions: string;
  };
  unblock: string;
  clearAll: string;
  totalLabel: string;
  confirmClearAll: string;
}

export interface BlockedIpsTableProps {
  items: BlockedIp[];
  isLoading: boolean;
  labels: BlockedIpsTableLabels;
  onUnblock: (ip: string) => void;
  onClearAll: () => void;
  pendingIp?: string;
}

function formatExpiry(expiresAt: number): string {
  const remaining = expiresAt - Date.now();
  if (remaining <= 0) return 'Expired';
  const minutes = Math.ceil(remaining / 60_000);
  if (minutes < 60) return `${minutes}m remaining`;
  const hours = Math.ceil(minutes / 60);
  return `${hours}h remaining`;
}

export function BlockedIpsTable({
  items,
  isLoading,
  labels,
  onUnblock,
  onClearAll,
  pendingIp,
}: BlockedIpsTableProps) {
  if (isLoading && items.length === 0) {
    return (
      <div className="box-border flex flex-col items-center p-5">
        <Spinner />
      </div>
    );
  }

  if (!isLoading && items.length === 0) {
    return (
      <GlassCard className={'p-5 items-center'} data-testid="blocked-ips-empty">
        <span className="box-border opacity-[0.7]">{labels.empty}</span>
      </GlassCard>
    );
  }

  return (
    <div
      className="box-border flex flex-col items-stretch gap-3"
      data-testid="blocked-ips-table"
    >
      <div className="box-border flex flex-row items-center justify-between px-1">
        <span className="box-border opacity-[0.7] text-[12px]">
          {labels.totalLabel.replace('{total}', String(items.length))}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearAll}
          data-testid="blocked-ips-clear-all"
        >
          {labels.clearAll}
        </Button>
      </div>

      <GlassCard className={'p-0 overflow-hidden'}>
        <div
          className="box-border flex flex-row gap-3 items-center py-2 px-3 bg-[var(--backgroundFocus)] border-b border-[var(--borderColor)]"
          data-testid="blocked-ips-header"
        >
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.ip}
          </span>
          <span className="box-border flex-1 font-bold text-[12px] opacity-[0.85]">
            {labels.table.reason}
          </span>
          <span className="box-border w-[120px] font-bold text-[12px] opacity-[0.85]">
            {labels.table.expiresAt}
          </span>
          <span className="box-border w-[100px] font-bold text-[12px] opacity-[0.85]">
            {labels.table.actions}
          </span>
        </div>

        {items.map((item, i) => (
          <div
            className="box-border flex flex-row gap-3 items-center py-2 px-3 border-b border-[var(--borderColor)]"
            style={{
              backgroundColor: i % 2 === 1 ? '$backgroundFocus' : undefined,
              opacity: pendingIp === item.ip ? 0.5 : 1,
            }}
            key={item.ip}
            data-testid={`blocked-ip-row-${item.ip}`}
          >
            <span className="box-border flex-1 text-[14px]">{item.ip}</span>
            <span className="box-border flex-1 text-[14px] opacity-[0.8]">
              {item.reason}
            </span>
            <span className="box-border w-[120px] text-[14px] opacity-[0.7]">
              {formatExpiry(item.expiresAt)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUnblock(item.ip)}
              disabled={pendingIp === item.ip}
              data-testid={`blocked-ip-unblock-${item.ip}`}
            >
              {labels.unblock}
            </Button>
          </div>
        ))}
      </GlassCard>
    </div>
  );
}
