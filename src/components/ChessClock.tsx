import React from 'react';
import { PlayerColor } from '../types/chess';
import { Clock } from 'lucide-react';

interface ChessClockProps {
  color: PlayerColor;
  timeRemainingSeconds: number;
  isActive: boolean;
  playerName: string;
  playerTitle?: string;
  isUnlimited?: boolean;
}

export const ChessClock: React.FC<ChessClockProps> = ({
  color,
  timeRemainingSeconds,
  isActive,
  playerName,
  playerTitle,
  isUnlimited = false
}) => {
  const isWhite = color === 'w';

  // Format time (mm:ss or ss.s when under 10s)
  const formatTime = (totalSeconds: number): string => {
    if (isUnlimited) return '∞';
    if (totalSeconds <= 0) return '00:00';

    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);

    // If under 10 seconds, show decimal tenths
    if (totalSeconds < 10) {
      const tenths = Math.floor((totalSeconds % 1) * 10);
      return `${secs}.${tenths}s`;
    }

    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = !isUnlimited && timeRemainingSeconds > 0 && timeRemainingSeconds <= 20;
  const isCriticalTime = !isUnlimited && timeRemainingSeconds > 0 && timeRemainingSeconds <= 10;

  return (
    <div
      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border transition-all duration-200 ${
        isActive
          ? 'bg-slate-800/90 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/50'
          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
      }`}
    >
      {/* Player Identity */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className={`w-4 h-4 rounded-full border shadow-sm shrink-0 ${
            isWhite ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
          }`}
        />
        <div className="truncate">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
              {playerName}
            </span>
            {playerTitle && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {playerTitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clock Digital Display */}
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-base font-bold tracking-tight transition-colors ${
          isCriticalTime
            ? 'bg-red-950/80 text-red-400 border border-red-500/60 animate-pulse'
            : isLowTime
            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/40'
            : isActive
            ? 'bg-slate-950/80 text-white border border-slate-700'
            : 'bg-slate-950/40 text-slate-400 border border-slate-800'
        }`}
      >
        <Clock className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
        <span className="tabular-nums">{formatTime(timeRemainingSeconds)}</span>
      </div>
    </div>
  );
};
