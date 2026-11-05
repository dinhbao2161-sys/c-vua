import React from 'react';
import { Language, GameMode } from '../types/chess';
import { t } from '../translations';
import { 
  RotateCcw, 
  Lightbulb, 
  Bot, 
  RefreshCw, 
  Flag, 
  Handshake, 
  Settings, 
  PlusCircle, 
  FlipHorizontal,
  Mic
} from 'lucide-react';

interface GameControlsProps {
  onNewGame: () => void;
  onUndo: () => void;
  canUndo: boolean;
  onHint: () => void;
  onAskCoach: () => void;
  onOpenVoiceDialogue: () => void;
  onFlipBoard: () => void;
  onResign: () => void;
  onOfferDraw: () => void;
  onOpenSettings: () => void;
  gameMode: GameMode;
  isGameOver: boolean;
  lang: Language;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onNewGame,
  onUndo,
  canUndo,
  onHint,
  onAskCoach,
  onOpenVoiceDialogue,
  onFlipBoard,
  onResign,
  onOfferDraw,
  onOpenSettings,
  gameMode,
  isGameOver,
  lang
}) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Voice Dialogue Highlight Button */}
      <button
        onClick={onOpenVoiceDialogue}
        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500/15 via-purple-500/20 to-amber-500/15 hover:from-amber-500/25 hover:via-purple-500/30 hover:to-amber-500/25 border border-amber-500/40 text-amber-200 font-bold text-xs sm:text-sm shadow-md active:scale-98 transition-all group"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950 shadow-sm group-hover:scale-105 transition-transform">
            <Mic className="w-4 h-4" />
          </div>
          <span>{t(lang, 'voiceDialogue')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Giọng nói AI
          </span>
        </div>
      </button>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <button
          onClick={onNewGame}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs md:text-sm shadow-md active:scale-95 transition-all"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>{t(lang, 'newGame')}</span>
        </button>

        <button
          onClick={onUndo}
          disabled={!canUndo || isGameOver}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-medium text-xs md:text-sm border border-slate-700 active:scale-95 transition-all shadow-sm"
        >
          <RotateCcw className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{t(lang, 'undo')}</span>
        </button>

        <button
          onClick={onHint}
          disabled={isGameOver}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none text-slate-200 font-medium text-xs md:text-sm border border-slate-700 active:scale-95 transition-all shadow-sm group"
        >
          <Lightbulb className="w-4 h-4 shrink-0 text-amber-400 group-hover:scale-110 transition-transform" />
          <span>{t(lang, 'hint')}</span>
        </button>

        <button
          onClick={onAskCoach}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-xs md:text-sm shadow-md active:scale-95 transition-all"
        >
          <Bot className="w-4 h-4 shrink-0 text-purple-200" />
          <span>{t(lang, 'coach')}</span>
        </button>
      </div>

      {/* Secondary Actions Row */}
      <div className="flex items-center justify-between gap-1.5 p-1 bg-slate-900/60 rounded-xl border border-slate-800">
        <button
          onClick={onFlipBoard}
          title={t(lang, 'flipBoard')}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
        >
          <FlipHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t(lang, 'flipBoard')}</span>
        </button>

        {!isGameOver && (
          <>
            <button
              onClick={onOfferDraw}
              title={t(lang, 'offerDraw')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              <Handshake className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">{t(lang, 'offerDraw')}</span>
            </button>

            <button
              onClick={onResign}
              title={t(lang, 'resign')}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 text-xs font-medium transition-colors"
            >
              <Flag className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden sm:inline">{t(lang, 'resign')}</span>
            </button>
          </>
        )}

        <button
          onClick={onOpenSettings}
          title={t(lang, 'settings')}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium transition-colors"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t(lang, 'settings')}</span>
        </button>
      </div>
    </div>
  );
};
