'use client';
import { Avatar, Button } from '@arcadeum/ui';
import type { AdminUserItem } from '../api';
import type { UserRole } from '@/entities/session/model/types';
import { RoleBadge } from './RoleBadge';
import { RoleSelect } from './RoleSelect';
import { resolveThemeColor } from '@/shared/lib/theme-tokens';

export interface UsersTableRowProps {
  item: AdminUserItem;
  currentUserId: string;
  onRoleChange: (userId: string, role: UserRole) => void;
  onWalletOpen: (userId: string) => void;
  onBlock: (userId: string) => void;
  onUnblock: (userId: string) => void;
  onDelete: (userId: string) => void;
  onRestore: (userId: string) => void;
  roleLabels: Record<UserRole, string>;
  selfTooltip: string;
  walletButtonLabel: string;
  blockLabel: string;
  unblockLabel: string;
  removeLabel: string;
  restoreLabel: string;
  isPending?: boolean;
  zebra?: boolean;
  isSelected?: boolean;
  onSelectToggle?: (userId: string) => void;
}

export function UsersTableRow({
  item,
  currentUserId,
  onRoleChange,
  onWalletOpen,
  onBlock,
  onUnblock,
  onDelete,
  onRestore,
  roleLabels,
  selfTooltip,
  walletButtonLabel,
  blockLabel,
  unblockLabel,
  removeLabel,
  restoreLabel,
  isPending,
  zebra,
  isSelected,
  onSelectToggle,
}: UsersTableRowProps) {
  const isSelf = item.id === currentUserId;
  const isBlocked = item.isBlocked;
  const isDeleted = !!item.deletedAt;
  const isSelectable = !isDeleted && !isSelf;

  return (
    <div
      className="flex flex-row gap-3 items-center py-2 px-3 hover:bg-[var(--backgroundHover)] border-b border-[var(--borderColor)]"
      style={{
        backgroundColor: resolveThemeColor(
          isSelected
            ? '$backgroundFocus'
            : zebra
              ? '$backgroundFocus'
              : undefined,
        ),
        opacity: isDeleted ? 0.5 : 1,
      }}
      data-testid={`user-row-${item.id}`}
    >
      <div className="flex flex-col w-[32px] items-center">
        {isSelectable && (
          <input
            type="checkbox"
            checked={isSelected ?? false}
            onChange={() => onSelectToggle?.(item.id)}
            data-testid={`select-checkbox-${item.id}`}
          />
        )}
      </div>
      <Avatar
        name={item.displayName ?? item.username}
        size="sm"
        data-testid={`user-avatar-${item.id}`}
      />
      <div className="flex flex-col items-stretch flex-1 min-w-0">
        <span className="font-bold line-clamp-1">
          {item.username}
          {isSelf && (
            <span className="opacity-[0.6] text-[12px]">{' (you)'}</span>
          )}
          {isBlocked && (
            <span className="text-[#dc2626] text-[12px]">{' (blocked)'}</span>
          )}
          {isDeleted && (
            <span className="text-[#f76b15] text-[12px]">{' (removed)'}</span>
          )}
        </span>
        <span className="opacity-[0.6] text-[12px] line-clamp-1">
          {item.email}
        </span>
        {item.displayName && (
          <span className="opacity-[0.5] text-[12px] line-clamp-1">
            {item.displayName}
          </span>
        )}
      </div>
      <RoleBadge role={item.role} label={roleLabels[item.role]} />
      <div className="flex flex-row gap-2 items-center">
        <span title={isSelf ? selfTooltip : undefined}>
          <RoleSelect
            value={item.role}
            onChange={(r) => onRoleChange(item.id, r)}
            labels={roleLabels}
            disabled={isSelf || isPending || isDeleted}
            testId={`role-select-${item.id}`}
          />
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onWalletOpen(item.id)}
          disabled={isDeleted}
          data-testid={`wallet-open-${item.id}`}
        >
          {walletButtonLabel}
        </Button>
        {!isDeleted && !isSelf && (
          <>
            {isBlocked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUnblock(item.id)}
                disabled={isPending}
                data-testid={`unblock-${item.id}`}
              >
                {unblockLabel}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onBlock(item.id)}
                disabled={isPending}
                data-testid={`block-${item.id}`}
              >
                {blockLabel}
              </Button>
            )}
            <Button
              variant="danger"
              outline
              size="sm"
              onClick={() => onDelete(item.id)}
              disabled={isPending}
              data-testid={`delete-${item.id}`}
            >
              {removeLabel}
            </Button>
          </>
        )}
        {isDeleted && !isSelf && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onRestore(item.id)}
            disabled={isPending}
            data-testid={`restore-${item.id}`}
          >
            {restoreLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
