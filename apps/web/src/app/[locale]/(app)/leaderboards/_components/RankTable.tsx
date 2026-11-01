'use client';
import {
  RankBadge,
  FormPips,
  TrendPill,
  EnergyBar,
  LiveChip,
  RoleBadge,
} from '@arcadeum/ui';
import { cx } from '@arcadeum/ui/utils/cx';
import { EquippedPlayerAvatar } from '@/shared/ui/PlayerAvatar';
import type { LeaderboardPlayer } from '@/entities/leaderboard/model/types';
import type { PageTranslations } from '@/shared/i18n/page-translations';
import { useEquippedCosmetics } from '@/features/shop/hooks/useEquippedCosmetics';
import { nameColorRenderProps } from '@/features/shop/lib/nameColor';
import { useTranslation } from '@/shared/i18n/useTranslation';

import { useRouter } from 'next/navigation';
import { useRoutes } from '@/shared/config/useRoutes';

const rowBase =
  'flex flex-row items-center gap-3 border-b border-[var(--borderColor)]';

function Row({
  className,
  children,
  'data-testid': dataTestId,
  'data-self': dataSelf,
  onClick,
  role,
  tabIndex,
  onKeyDown,
}: {
  className?: string;
  children?: React.ReactNode;
  'data-testid'?: string;
  'data-self'?: string;
  onClick?: () => void;
  role?: string;
  tabIndex?: number;
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>;
}) {
  return (
    <div
      className={cx(
        rowBase,
        'px-3 py-3 hover:bg-[rgba(255,255,255,0.03)]',
        onClick &&
          'cursor-pointer hover:bg-[rgba(255,255,255,0.06)] transition-colors',
        className,
      )}
      onClick={onClick}
      role={role}
      tabIndex={tabIndex}
      onKeyDown={onKeyDown}
      data-testid={dataTestId}
      data-self={dataSelf}
    >
      {children}
    </div>
  );
}

function HeaderRow({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return <div className={cx(rowBase, 'px-3 py-2', className)}>{children}</div>;
}

function TagPill({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cx(
        'flex flex-row items-stretch rounded-full border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] px-2 py-0.5',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function RankTable({
  rows,
  loading,
  topRating,
  selfId,
  t,
}: {
  rows: LeaderboardPlayer[];
  loading?: boolean;
  topRating?: number;
  selfId?: string;
  t?: PageTranslations;
}) {
  const labels = ((t?.table as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  const regionLabels = ((t?.regions as Record<string, string>) ?? {}) as Record<
    string,
    string
  >;
  const liveLabel = (t?.live as string) ?? 'Live';
  const max = topRating ?? rows[0]?.rating ?? 1;

  return (
    <div
      className="flex flex-col items-stretch rounded-2xl border border-[var(--borderColor)] bg-[rgba(255,255,255,0.02)] overflow-hidden"
      data-testid="leaderboard-table"
    >
      <HeaderRow>
        <span className="w-[56px] text-[12px] opacity-[0.9] uppercase">
          {labels.rank ?? '#'}
        </span>
        <span className="flex-1 text-[12px] opacity-[0.9] uppercase">
          {labels.player ?? 'Player'}
        </span>
        <span className="w-[80px] text-[12px] opacity-[0.9] uppercase">
          {labels.region ?? 'Region'}
        </span>
        <span className="w-[240px] text-[12px] opacity-[0.9] uppercase max-[800px]:hidden">
          {labels.rating ?? 'Rating'}
        </span>
        <span className="w-[140px] text-[12px] opacity-[0.9] uppercase max-[800px]:hidden">
          {labels.form ?? 'Form'}
        </span>
        <span className="w-[120px] text-[12px] opacity-[0.9] uppercase max-[1150px]:hidden">
          Tags
        </span>
        <span className="w-[72px] text-[12px] opacity-[0.9] uppercase">
          {labels.trend ?? 'Trend'}
        </span>
      </HeaderRow>

      {loading
        ? Array.from({ length: 8 }).map((_, i) => (
            <Row key={`sk_${i}`} className="min-h-[56px]">
              <div className="w-[56px] items-start">
                <div className="w-[36px] h-[22px] bg-[rgba(255,255,255,0.06)] rounded-2xl" />
              </div>
              <div className="flex flex-col items-stretch flex-1 gap-4">
                <div className="w-[60%] h-[16px] bg-[rgba(255,255,255,0.06)] rounded-2xl" />
              </div>
              <div className="w-[80px] h-[14px] bg-[rgba(255,255,255,0.04)] rounded-2xl" />
              <div className="w-[240px] h-[22px] bg-[rgba(255,255,255,0.06)] rounded-[11px] max-[800px]:hidden" />
              <div className="w-[140px] h-[16px] bg-[rgba(255,255,255,0.04)] rounded-2xl max-[800px]:hidden" />
              <div className="w-[120px] h-[20px] bg-[rgba(255,255,255,0.04)] rounded-[10px] max-[1150px]:hidden" />
              <div className="w-[72px] h-[20px] bg-[rgba(255,255,255,0.04)] rounded-[10px]" />
            </Row>
          ))
        : rows.map((p, i) => (
            <RankRow
              key={p.id}
              player={p}
              liveLabel={liveLabel}
              regionLabels={regionLabels}
              max={max}
              isSelf={!!selfId && p.id === selfId}
              priority={i === 0}
            />
          ))}
    </div>
  );
}

function RankRow({
  player: p,
  liveLabel,
  regionLabels,
  max,
  isSelf,
  priority = false,
}: {
  player: LeaderboardPlayer;
  liveLabel: string;
  regionLabels: Record<string, string>;
  max: number;
  isSelf: boolean;
  priority?: boolean;
}) {
  const router = useRouter();
  const routes = useRoutes();
  const { t } = useTranslation();
  const live = p.isInMatch ?? false;
  const flag = p.countryCode ? regionFlag(p.countryCode) : null;
  const roleLabel =
    p.role && p.role !== 'free' && p.role !== 'user'
      ? t(`common.roles.${p.role}` as never) || p.role.toUpperCase()
      : null;
  const { nameColor } = useEquippedCosmetics({
    equippedAvatarId: p.equippedAvatarId,
    equippedBadgeId: p.equippedBadgeId,
    equippedNameColorId: p.equippedNameColorId,
    equippedFrameId: p.equippedFrameId,
    equippedAuraId: p.equippedAuraId,
    equippedBannerId: p.equippedBannerId,
  });
  const nameProps = nameColorRenderProps(nameColor);
  const handleNavigate = () => {
    router.push(routes.playerProfile(p.id));
  };

  return (
    <Row
      data-testid={`leaderboard-row-${p.rank}`}
      {...(isSelf ? { 'data-self': 'true' } : {})}
      onClick={handleNavigate}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleNavigate();
        }
      }}
    >
      <div className="w-[56px]">
        <RankBadge tier={p.tier as never}>{`#${p.rank}`}</RankBadge>
      </div>
      <div className="flex flex-col items-stretch flex-1 gap-2">
        <div className="flex flex-row gap-2 items-center flex-wrap">
          <EquippedPlayerAvatar
            size="sm"
            name={p.name}
            equippedAvatarId={p.equippedAvatarId}
            equippedBadgeId={p.equippedBadgeId}
            equippedNameColorId={p.equippedNameColorId}
            equippedFrameId={p.equippedFrameId}
            equippedAuraId={p.equippedAuraId}
            equippedBannerId={p.equippedBannerId}
            role={p.role}
            fallbackAvatarUrl={p.avatarUrl}
            priority={priority}
            data-testid={`leaderboard-row-${p.rank}-avatar`}
          />
          {flag ? (
            <span className="text-[16px]" aria-label={p.countryCode}>
              {flag}
            </span>
          ) : null}
          <span
            className="font-bold break-words"
            title={p.name}
            style={
              nameProps.color ? { color: nameProps.color } : nameProps.style
            }
          >
            {p.name}
          </span>
          {roleLabel && p.role ? (
            <RoleBadge role={p.role as never}>{roleLabel}</RoleBadge>
          ) : null}
          {p.isOnline ? (
            <div className="w-[8px] h-[8px] rounded-2xl bg-[var(--success)]" />
          ) : null}
          {p.streak && p.streak >= 3 ? (
            <span className="text-[14px]">🔥 {p.streak}</span>
          ) : null}
          {live ? (
            <div className="" data-testid="row-live-chip">
              <LiveChip label={liveLabel} />
            </div>
          ) : null}
          {p.elo ? (
            <span className="text-[12px] opacity-[0.9] tracking-[1px]">
              {p.elo} ELO
            </span>
          ) : null}
          <span className="text-[11px] opacity-[0.7] font-mono min-[801px]:hidden">
            {p.rating} pts
          </span>
        </div>
      </div>
      <span className="w-[80px] text-[14px] opacity-[0.8] line-clamp-1">
        {p.region ? (regionLabels[p.region] ?? p.region.toUpperCase()) : '-'}
      </span>
      <div className="w-[240px] max-[800px]:hidden">
        <EnergyBar value={p.rating} max={max} />
      </div>
      <div className="w-[140px] max-[800px]:hidden">
        <FormPips results={p.recentForm} max={8} variant="letter" />
      </div>
      <div className="flex flex-col items-stretch w-[120px] gap-4 max-[1150px]:hidden">
        {(p.gameTags ?? []).slice(0, 2).map((tag) => (
          <TagPill key={tag}>
            <span className="text-[12px] opacity-[0.85]">{tag}</span>
          </TagPill>
        ))}
      </div>
      <div className="w-[72px]">
        <TrendPill rank={p.rank} prevRank={p.prevRank} />
      </div>
    </Row>
  );
}

function regionFlag(code: string): string | null {
  if (code.length !== 2) return null;
  const A = 0x1f1e6;
  return String.fromCodePoint(
    A + code.toUpperCase().charCodeAt(0) - 65,
    A + code.toUpperCase().charCodeAt(1) - 65,
  );
}
