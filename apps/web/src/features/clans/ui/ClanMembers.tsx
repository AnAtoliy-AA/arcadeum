'use client';

import type { ClanMember } from '../model/types';
import { Avatar } from '@arcadeum/ui';

interface ClanMembersProps {
  members: ClanMember[];
  currentUserId?: string;
  onRemove?: (userId: string) => void;
  onRoleChange?: (userId: string, role: string) => void;
}

const ROLE_LABELS: Record<string, string> = {
  leader: '👑',
  officer: '⚔️',
  member: '',
};

export function ClanMembers({
  members,
  currentUserId,
  onRemove,
}: ClanMembersProps) {
  return (
    <div className="flex flex-col gap-2">
      {members.map((member) => (
        <div
          key={member.id}
          className="flex items-center gap-3 rounded-lg border border-[var(--borderColor)] bg-[var(--glassBg)] p-3"
        >
          <Avatar
            src={member.equippedAvatarId ?? undefined}
            alt={member.username}
            size="sm"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate font-medium">{member.username}</span>
              <span className="text-xs">{ROLE_LABELS[member.role] ?? ''}</span>
              {member.online && (
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
              )}
            </div>
            <p className="text-xs text-[var(--foreground)]/50">
              {member.wins} wins · {member.gamesPlayed} games played
            </p>
          </div>

          {currentUserId && member.userId !== currentUserId && onRemove && (
            <button
              onClick={() => onRemove(member.userId)}
              className="text-xs text-[var(--danger)] hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
