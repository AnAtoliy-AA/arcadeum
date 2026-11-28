import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { GameRoomMemberSummary } from '@/shared/types/games';
import { isAnonId, isBotId } from './roomCardUtils';
import styles from './RoomCardComponent.module.scss';

const MAX_VISIBLE = 5;

const MAX_EMPTY_SLOTS = 6;

interface RoomCardAvatarsProps {
  members: GameRoomMemberSummary[];
  labelFor: (member: GameRoomMemberSummary) => string;
  /** When set (and small), unfilled seats render as dashed placeholders. */
  maxPlayers?: number | null;
  emptySlotLabel?: string;
}

export function RoomCardAvatars({
  members,
  labelFor,
  maxPlayers,
  emptySlotLabel,
}: RoomCardAvatarsProps) {
  const visible = members.slice(0, MAX_VISIBLE);
  const extra = members.length - visible.length;
  const emptySlots =
    maxPlayers != null && maxPlayers <= MAX_EMPTY_SLOTS
      ? Math.max(0, maxPlayers - members.length)
      : 0;

  return (
    <div className={styles.avatarStack} data-testid="room-card-avatars">
      {visible.map((member) => (
        <div
          key={member.id}
          className={styles.avatarOverlap}
          title={labelFor(member)}
        >
          <EquippedPlayerAvatar
            name={labelFor(member)}
            size="icon"
            equippedAvatarId={member.equippedAvatarId ?? null}
            equippedBadgeId={member.equippedBadgeId ?? null}
            equippedNameColorId={member.equippedNameColorId}
            equippedFrameId={member.equippedFrameId}
            equippedAuraId={member.equippedAuraId}
            equippedBannerId={member.equippedBannerId}
            fallbackAvatarUrl={
              isAnonId(member.id) || isBotId(member.id)
                ? '/shop/avatars/default-01.png'
                : undefined
            }
          />
        </div>
      ))}
      {extra > 0 && (
        <div className={styles.avatarOverlap}>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--backgroundFocus)] text-[10px] font-bold text-[var(--color)]">
            +{extra}
          </div>
        </div>
      )}
      {Array.from({ length: emptySlots }, (_, i) => (
        <div
          key={`empty-${i}`}
          className={styles.avatarOverlap}
          title={emptySlotLabel}
          data-testid="room-card-empty-slot"
        >
          <div className={styles.emptySlot} aria-hidden="true">
            +
          </div>
        </div>
      ))}
    </div>
  );
}
