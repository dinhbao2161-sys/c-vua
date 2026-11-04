import React, { useEffect, useRef } from 'react';
import { MoveRecord, Language } from '../types/chess';
import { t } from '../translations';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Copy, Check, Share2 } from 'lucide-react';

interface MoveHistoryProps {
  moves: MoveRecord[];
  currentMoveIndex: number; // -1 means starting board, moves.length - 1 means live
  onSelectMove: (index: number) => void;
  lang: Language;
  onCopyFEN: () => void;
  onCopyPGN: () => void;
  fenCopied: boolean;
  pgnCopied: boolean;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({
  moves,
  currentMoveIndex,
  onSelectMove,
  lang,
  onCopyFEN,
  onCopyPGN,
  fenCopied,
  pgnCopied
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isLive = currentMoveIndex === moves.length - 1;

  // Group moves into pairs (White & Black)
  const movePairs: { turn: number; white?: MoveRecord; black?: MoveRecord; whiteIdx?: number; blackIdx?: number }[] = [];
  for (let i = 0; i < moves.length; i += 2) {
    const turn = Math.floor(i / 2) + 1;
    movePairs.push({
      turn,
      white: moves[i],
      whiteIdx: i,
      black: moves[i + 1],
      blackIdx: i + 1 < moves.length ? i + 1 : undefined
    });
  }

  // Auto scroll when new move arrives and user is live
  useEffect(() => {
    if (isLive && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [moves.length, isLive]);

  return (
    <div className="flex flex-col h-full bg-slate-900/90 rounded-xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/60 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            {t(lang, 'history')}
          </span>
          <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-400 font-mono">
            {moves.length} {lang === 'vi' ? 'nước' : 'moves'}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onCopyFEN}
            title={t(lang, 'copyFEN')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
          >
            {fenCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>FEN</span>
          </button>
          <button
            onClick={onCopyPGN}
            title={t(lang, 'exportPGN')}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition-colors"
          >
            {pgnCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
            <span>PGN</span>
          </button>
        </div>
      </div>

      {/* Warning banner when reviewing historical state */}
      {!isLive && moves.length > 0 && (
        <div className="flex items-center justify-between px-3 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs font-medium animate-in fade-in">
          <span>{t(lang, 'reviewingHistory')}</span>
          <button
            onClick={() => onSelectMove(moves.length - 1)}
            className="px-2 py-0.5 rounded bg-amber-500/30 hover:bg-amber-500/40 text-[11px] text-amber-200 transition-colors"
          >
            {t(lang, 'returnToLive')}
          </button>
        </div>
      )}

      {/* Moves Scrollable List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 font-mono text-sm">
        {movePairs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-500 text-xs italic">
            {t(lang, 'noMovesYet')}
          </div>
        ) : (
          movePairs.map(pair => (
            <div
              key={pair.turn}
              className="grid grid-cols-[38px_1fr_1fr] items-center py-1 px-2 rounded hover:bg-slate-800/40 transition-colors text-xs"
            >
              <span className="text-slate-500 font-semibold select-none">{pair.turn}.</span>

              {/* White Move */}
              {pair.white && pair.whiteIdx !== undefined && (
                <button
                  onClick={() => onSelectMove(pair.whiteIdx!)}
                  className={`text-left px-2 py-0.5 rounded transition-all font-semibold ${
                    currentMoveIndex === pair.whiteIdx
                      ? 'bg-amber-500/30 text-amber-300 font-bold shadow-sm'
                      : 'text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {pair.white.san}
                </button>
              )}

              {/* Black Move */}
              {pair.black && pair.blackIdx !== undefined && (
                <button
                  onClick={() => onSelectMove(pair.blackIdx!)}
                  className={`text-left px-2 py-0.5 rounded transition-all font-semibold ${
                    currentMoveIndex === pair.blackIdx
                      ? 'bg-amber-500/30 text-amber-300 font-bold shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {pair.black.san}
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Step Navigation Controls */}
      <div className="flex items-center justify-center gap-1.5 p-2 bg-slate-950/70 border-t border-slate-800">
        <button
          onClick={() => onSelectMove(-1)}
          disabled={currentMoveIndex === -1}
          title={t(lang, 'startMove')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.max(-1, currentMoveIndex - 1))}
          disabled={currentMoveIndex === -1}
          title={t(lang, 'prevMove')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(Math.min(moves.length - 1, currentMoveIndex + 1))}
          disabled={currentMoveIndex >= moves.length - 1}
          title={t(lang, 'nextMove')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onSelectMove(moves.length - 1)}
          disabled={currentMoveIndex >= moves.length - 1}
          title={t(lang, 'currentMove')}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
