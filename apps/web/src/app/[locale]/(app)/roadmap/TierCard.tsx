import { Typography } from '@arcadeum/ui';
import type { Tier, TierFeature } from './roadmap-data';

export function StatusBadge({ status }: { status: TierFeature['status'] }) {
  if (status === 'implemented') {
    return (
      <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(34,197,94,0.15)] border border-[rgba(34,197,94,0.3)] shrink-0">
        <Typography
          className={'font-bold text-[#22c55e]'}
          variant="caption"
          uiSize="xs"
        >
          Implemented
        </Typography>
      </div>
    );
  }
  if (status === 'partial') {
    return (
      <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(245,158,11,0.15)] border border-[rgba(245,158,11,0.3)] shrink-0">
        <Typography
          className={'font-bold text-[#f59e0b]'}
          variant="caption"
          uiSize="xs"
        >
          In Progress
        </Typography>
      </div>
    );
  }
  return (
    <div className="px-2 py-0.5 rounded-[9999px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] shrink-0">
      <Typography variant="caption" uiSize="xs" alpha="medium">
        Planned
      </Typography>
    </div>
  );
}

export function TierCard({
  tier,
  isExpanded,
  onToggle,
}: {
  tier: Tier;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const implementedCount = tier.features.filter(
    (f) => f.status === 'implemented',
  ).length;

  return (
    <div
      className="flex flex-col items-stretch rounded-2xl overflow-hidden"
      style={{
        background: isExpanded ? tier.gradient : 'rgba(255,255,255,0.02)',
        borderWidth: 1,
        borderColor: isExpanded ? `${tier.color}30` : 'rgba(255,255,255,0.06)',
      }}
    >
      <div
        className="flex flex-col items-stretch active:opacity-[0.8] cursor-pointer p-4"
        onClick={onToggle}
      >
        <div className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-3 items-center flex-1">
            <div
              className="w-[40px] h-[40px] rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${tier.color}20` }}
            >
              <Typography uiSize="lg">{tier.icon}</Typography>
            </div>
            <div className="flex flex-col items-stretch flex-1 gap-1">
              <div className="flex flex-row items-center gap-2 flex-wrap">
                <Typography
                  className={'font-bold'}
                  variant="heading"
                  uiSize="md"
                >
                  {tier.label}
                </Typography>
                <div
                  className="px-2 rounded-[9999px] border"
                  style={{
                    backgroundColor: `${tier.color}15`,
                    borderColor: `${tier.color}30`,
                  }}
                >
                  <Typography variant="caption" uiSize="xs" color={tier.color}>
                    {tier.features.length} features
                  </Typography>
                </div>
                <div className="px-2 rounded-[9999px] bg-[rgba(255,255,255,0.05)]">
                  <Typography variant="caption" uiSize="xs" alpha="medium">
                    {implementedCount}/{tier.features.length} done
                  </Typography>
                </div>
              </div>
              <Typography variant="caption" alpha="medium">
                {tier.effort}
              </Typography>
            </div>
          </div>
          <div className="w-[28px] h-[28px] rounded-[9999px] bg-[rgba(255,255,255,0.05)] flex items-center justify-center shrink-0">
            <Typography
              className={'font-bold'}
              variant="body"
              uiSize="sm"
              alpha="medium"
            >
              {isExpanded ? '−' : '+'}
            </Typography>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="flex flex-col items-stretch gap-0">
          <div className="-mx-4 border-b border-b-[rgba(255,255,255,0.06)]" />
          <div className="flex flex-col items-stretch p-4 gap-2">
            {tier.features.map((f, idx) => (
              <div
                className="flex flex-row p-3 rounded-xl gap-3 items-start"
                style={{
                  background:
                    idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                }}
                key={f.title}
              >
                <div
                  className="mt-1.5 w-[6px] h-[6px] rounded-[9999px] opacity-[0.6] shrink-0"
                  style={{
                    backgroundColor:
                      f.status === 'implemented'
                        ? '#22c55e'
                        : f.status === 'partial'
                          ? '#f59e0b'
                          : tier.color,
                  }}
                />
                <div className="flex flex-col items-stretch flex-1 gap-1">
                  <div className="flex flex-row justify-between items-center gap-2 flex-wrap">
                    <div className="flex flex-row items-center gap-2 flex-wrap">
                      <Typography
                        className={'font-bold'}
                        variant="label"
                        uiSize="sm"
                      >
                        {f.title}
                      </Typography>
                      {f.arc && (
                        <div className="px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)]">
                          <Typography
                            variant="caption"
                            uiSize="xs"
                            alpha="medium"
                          >
                            {f.arc}
                          </Typography>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-row items-center gap-2">
                      <StatusBadge status={f.status} />
                      <div className="px-2 rounded-[9999px] bg-[rgba(255,255,255,0.05)]">
                        <Typography
                          variant="caption"
                          uiSize="xs"
                          alpha="medium"
                        >
                          {f.effort}
                        </Typography>
                      </div>
                    </div>
                  </div>
                  <Typography variant="body" uiSize="sm" alpha="medium">
                    {f.desc}
                  </Typography>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
