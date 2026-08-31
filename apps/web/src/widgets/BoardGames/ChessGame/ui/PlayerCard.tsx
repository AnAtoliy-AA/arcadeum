import {
  PlayerCard as PlayerCardStyled,
  PlayerAvatar,
  PlayerName,
  PlayerRating,
} from './styles';

interface PlayerCardProps {
  name: string;
  rating?: number;
  color: 'white' | 'black';
  isActive: boolean;
  capturedPieces?: { type: string; color: string }[];
  mainTime?: string;
  incrTime?: string;
}

const KING_SYMBOLS = { white: '♔', black: '♚' } as const;

const PIECE_SYMBOLS: Record<string, string> = {
  pawn: '♟',
  knight: '♞',
  bishop: '♝',
  rook: '♜',
  queen: '♛',
  king: '♚',
};

export function PlayerCard({
  name,
  rating,
  color,
  isActive,
  capturedPieces = [],
  mainTime = '--:--',
  incrTime = '+0',
}: PlayerCardProps) {
  return (
    <PlayerCardStyled isActive={isActive}>
      <div className="flex flex-row gap-12 items-center">
        <PlayerAvatar
          style={{
            background:
              color === 'white'
                ? 'linear-gradient(135deg, #e2e8f0, #94a3b8)'
                : 'linear-gradient(135deg, #475569, #1e293b)',
            borderWidth: 2,
            borderColor: isActive
              ? 'rgba(212, 175, 55, 0.8)'
              : 'rgba(255, 255, 255, 0.1)',
          }}
        >
          <span
            className="text-[18px]"
            style={{ color: color === 'white' ? '#1e293b' : '#f8fafc' }}
          >
            {KING_SYMBOLS[color]}
          </span>
        </PlayerAvatar>
        <div className="flex flex-col items-stretch flex-1 min-w-0">
          <PlayerName>{name}</PlayerName>
          {rating != null && <PlayerRating>Rating: {rating}</PlayerRating>}
        </div>
      </div>

      {capturedPieces.length > 0 && (
        <div className="flex flex-row items-stretch gap-2 -mt-8 opacity-[0.5]">
          {capturedPieces.map((p, i) => (
            <span className="text-[11px]" key={i}>
              {PIECE_SYMBOLS[p.type] ?? '♟'}
            </span>
          ))}
        </div>
      )}

      <div className="flex flex-row items-stretch gap-8 -mt-10">
        <div
          className="flex flex-col flex-1 rounded-[8px] bg-[rgba(255,_255,_255,_0.03)] border border-[rgba(255,_255,_255,_0.08)] items-center"
          style={{ padding: '8px 12px' }}
        >
          <span className="text-[20px] font-bold text-[#f8fafc]">
            {mainTime}
          </span>
          <span className="text-[40px] font-semibold text-[rgba(148,_163,_184,_0.6)] uppercase -mt-2">
            MAIN
          </span>
        </div>
        <div
          className="flex flex-col flex-1 rounded-[8px] bg-[rgba(255,_255,_255,_0.03)] border border-[rgba(255,_255,_255,_0.08)] items-center"
          style={{ padding: '8px 12px' }}
        >
          <span className="text-[20px] font-bold text-[#f8fafc]">
            {incrTime}
          </span>
          <span className="text-[40px] font-semibold text-[rgba(148,_163,_184,_0.6)] uppercase -mt-2">
            INCR
          </span>
        </div>
      </div>
    </PlayerCardStyled>
  );
}
