import React from 'react';
import { PlayerColor } from '../types/chess';

interface EvalBarProps {
  score: number; // in pawns (+2.5 means White is +2.5)
  mateIn?: number;
  whiteWinChance: number; // 0 to 100
  boardOrientation: PlayerColor;
  isHorizontal?: boolean;
}

export const EvalBar: React.FC<EvalBarProps> = ({
  score,
  mateIn,
  whiteWinChance,
  boardOrientation,
  isHorizontal = false
}) => {
  // Cap whiteWinChance
  const clampedWinChance = Math.max(5, Math.min(95, whiteWinChance));

  // If board is flipped (Black perspective), flip the visual bar direction
  const isFlipped = boardOrientation === 'b';
  const displayChance = isFlipped ? 100 - clampedWinChance : clampedWinChance;

  // Format score text
  let label = '0.0';
  if (mateIn !== undefined && mateIn !== null) {
    label = mateIn > 0 ? `M${mateIn}` : `-M${Math.abs(mateIn)}`;
  } else {
    label = score > 0 ? `+${score.toFixed(1)}` : score < 0 ? score.toFixed(1) : '0.0';
  }

  if (isHorizontal) {
    return (
      <div className="w-full flex flex-col gap-1">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>{isFlipped ? 'Black' : 'White'}</span>
          <span className="font-bold text-amber-400">{label}</span>
          <span>{isFlipped ? 'White' : 'Black'}</span>
        </div>
        <div className="relative w-full h-3 rounded-full bg-slate-950 overflow-hidden border border-slate-700/80 shadow-inner flex">
          <div
            className="h-full bg-slate-100 transition-all duration-300 ease-out"
            style={{ width: `${displayChance}%` }}
          />
          <div
            className="h-full bg-slate-900 transition-all duration-300 ease-out"
            style={{ width: `${100 - displayChance}%` }}
          />
        </div>
      </div>
    );
  }

  // Vertical bar (Desktop side of board)
  return (
    <div className="relative w-8 h-full min-h-[300px] rounded-lg overflow-hidden bg-slate-950 border border-slate-800 shadow-xl flex flex-col justify-end select-none">
      {/* Top Black portion */}
      <div
        className="w-full bg-slate-900 transition-all duration-500 ease-out relative flex items-start justify-center pt-2"
        style={{ height: `${100 - displayChance}%` }}
      >
        {!isFlipped && score < -0.5 && (
          <span className="text-[10px] font-mono font-bold text-slate-300 rotate-0">
            {label}
          </span>
        )}
      </div>

      {/* Bottom White portion */}
      <div
        className="w-full bg-slate-100 transition-all duration-500 ease-out relative flex items-end justify-center pb-2"
        style={{ height: `${displayChance}%` }}
      >
        {(!isFlipped && score >= -0.5) || (isFlipped && score <= 0.5) ? (
          <span className="text-[10px] font-mono font-bold text-slate-900">
            {label}
          </span>
        ) : null}
      </div>

      {/* 50% line indicator */}
      <div className="absolute top-1/2 left-0 right-0 h-[1.5px] bg-amber-500/50 pointer-events-none -translate-y-1/2" />
    </div>
  );
};
