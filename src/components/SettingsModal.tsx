import React from 'react';
import { BoardThemeId, Language, PieceThemeId } from '../types/chess';
import { t, translations } from '../translations';
import { BOARD_THEMES, PIECE_THEMES } from '../chess/themes';
import { X, Volume2, VolumeX, Eye, Grid, Sparkles, Languages } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardTheme: BoardThemeId;
  onSelectBoardTheme: (id: BoardThemeId) => void;
  pieceTheme: PieceThemeId;
  onSelectPieceTheme: (id: PieceThemeId) => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  showCoordinates: boolean;
  onToggleCoordinates: () => void;
  showLegalMoves: boolean;
  onToggleLegalMoves: () => void;
  highlightLastMove: boolean;
  onToggleHighlightLastMove: () => void;
  autoFlipBoard: boolean;
  onToggleAutoFlipBoard: () => void;
  lang: Language;
  onSelectLang: (lang: Language) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  boardTheme,
  onSelectBoardTheme,
  pieceTheme,
  onSelectPieceTheme,
  soundEnabled,
  onToggleSound,
  showCoordinates,
  onToggleCoordinates,
  showLegalMoves,
  onToggleLegalMoves,
  highlightLastMove,
  onToggleHighlightLastMove,
  autoFlipBoard,
  onToggleAutoFlipBoard,
  lang,
  onSelectLang
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            {t(lang, 'settings')}
          </h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Language Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
              <Languages className="w-3.5 h-3.5" />
              {t(lang, 'language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onSelectLang('vi')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  lang === 'vi'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                Tiếng Việt (VN)
              </button>
              <button
                type="button"
                onClick={() => onSelectLang('en')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  lang === 'en'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                English (US)
              </button>
            </div>
          </div>

          {/* Board Theme Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              {t(lang, 'boardTheme')}
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.values(BOARD_THEMES).map(bt => {
                const isSelected = boardTheme === bt.id;
                return (
                  <button
                    key={bt.id}
                    type="button"
                    onClick={() => onSelectBoardTheme(bt.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all text-left ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/40'
                        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    {/* Swatch mini board preview */}
                    <div className="grid grid-cols-2 grid-rows-2 w-7 h-7 rounded border border-black/30 overflow-hidden shrink-0 shadow-sm">
                      <div style={{ backgroundColor: bt.lightSquare }} />
                      <div style={{ backgroundColor: bt.darkSquare }} />
                      <div style={{ backgroundColor: bt.darkSquare }} />
                      <div style={{ backgroundColor: bt.lightSquare }} />
                    </div>
                    <span className="text-xs font-medium text-slate-200 truncate">
                      {t(lang, bt.nameKey as unknown as keyof typeof translations['en'])}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Piece Style Selection */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2.5">
              {t(lang, 'pieceTheme')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PIECE_THEMES.map(pt => {
                const isSelected = pieceTheme === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => onSelectPieceTheme(pt.id)}
                    className={`p-2 rounded-xl border text-center transition-all text-xs font-semibold ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                        : 'bg-slate-800/50 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {t(lang, pt.nameKey as unknown as keyof typeof translations['en'])}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            {/* Sound Effects */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <div>
                  <div className="text-xs font-semibold text-slate-200">{t(lang, 'soundEffects')}</div>
                  <div className="text-[11px] text-slate-400">{t(lang, 'soundDescription')}</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEnabled}
                onChange={onToggleSound}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Show Coordinates */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">{t(lang, 'showCoordinates')}</span>
              </div>
              <input
                type="checkbox"
                checked={showCoordinates}
                onChange={onToggleCoordinates}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Show Legal Moves */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">{t(lang, 'showLegalMoves')}</span>
              </div>
              <input
                type="checkbox"
                checked={showLegalMoves}
                onChange={onToggleLegalMoves}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Highlight Last Move */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">{t(lang, 'highlightLastMove')}</span>
              </div>
              <input
                type="checkbox"
                checked={highlightLastMove}
                onChange={onToggleHighlightLastMove}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Auto Flip Board */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Grid className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-semibold text-slate-200">{t(lang, 'autoFlipBoard')}</span>
              </div>
              <input
                type="checkbox"
                checked={autoFlipBoard}
                onChange={onToggleAutoFlipBoard}
                className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            {t(lang, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
