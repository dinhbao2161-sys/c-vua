import React, { useState } from 'react';
import { AIDifficulty, GameMode, Language, PlayerColor } from '../types/chess';
import { t } from '../translations';
import { TIME_CONTROLS } from '../chess/themes';
import { Bot, Users, Sparkles, Clock, Swords, X } from 'lucide-react';

interface NewGameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartGame: (config: {
    mode: GameMode;
    playerColor: PlayerColor;
    aiDifficulty: AIDifficulty;
    timeControlId: string;
  }) => void;
  lang: Language;
}

export const NewGameModal: React.FC<NewGameModalProps> = ({
  isOpen,
  onClose,
  onStartGame,
  lang
}) => {
  const [mode, setMode] = useState<GameMode>('ai');
  const [selectedColor, setSelectedColor] = useState<'w' | 'b' | 'random'>('w');
  const [difficulty, setDifficulty] = useState<AIDifficulty>(3);
  const [timeControlId, setTimeControlId] = useState<string>('rapid_10_0');

  if (!isOpen) return null;

  const handleStart = () => {
    let resolvedColor: PlayerColor = 'w';
    if (selectedColor === 'random') {
      resolvedColor = Math.random() < 0.5 ? 'w' : 'b';
    } else {
      resolvedColor = selectedColor;
    }

    onStartGame({
      mode,
      playerColor: resolvedColor,
      aiDifficulty: difficulty,
      timeControlId
    });
    onClose();
  };

  const difficulties: { level: AIDifficulty; labelKey: 'aiNovice' | 'aiBeginner' | 'aiIntermediate' | 'aiAdvanced' | 'aiMaster'; descKey: 'aiNoviceDesc' | 'aiBeginnerDesc' | 'aiIntermediateDesc' | 'aiAdvancedDesc' | 'aiMasterDesc' }[] = [
    { level: 1, labelKey: 'aiNovice', descKey: 'aiNoviceDesc' },
    { level: 2, labelKey: 'aiBeginner', descKey: 'aiBeginnerDesc' },
    { level: 3, labelKey: 'aiIntermediate', descKey: 'aiIntermediateDesc' },
    { level: 4, labelKey: 'aiAdvanced', descKey: 'aiAdvancedDesc' },
    { level: 5, labelKey: 'aiMaster', descKey: 'aiMasterDesc' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">{t(lang, 'setupTitle')}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 flex-1">
          {/* Game Mode */}
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              {t(lang, 'selectGameMode')}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMode('ai')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  mode === 'ai'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'ai' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{t(lang, 'playVsAI')}</div>
                  <div className="text-[11px] text-slate-400">1 Player vs Engine</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setMode('pass_and_play')}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                  mode === 'pass_and_play'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-md'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className={`p-2 rounded-lg ${mode === 'pass_and_play' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-slate-300'}`}>
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-bold">{t(lang, 'playPassAndPlay')}</div>
                  <div className="text-[11px] text-slate-400">2 Players local</div>
                </div>
              </button>
            </div>
          </div>

          {/* Color Selection (when vs AI) */}
          {mode === 'ai' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {t(lang, 'selectColor')}
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedColor('w')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    selectedColor === 'w'
                      ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-white border border-slate-300 shadow-md mb-1.5" />
                  <span className="text-xs font-semibold text-white">{t(lang, 'white')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedColor('random')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    selectedColor === 'random'
                      ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-r from-white to-slate-900 border border-slate-400 shadow-md mb-1.5 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="text-xs font-semibold text-white">{t(lang, 'randomColor')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedColor('b')}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                    selectedColor === 'b'
                      ? 'bg-slate-800 border-amber-500 ring-1 ring-amber-500/50'
                      : 'bg-slate-800/40 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-slate-950 border border-slate-600 shadow-md mb-1.5" />
                  <span className="text-xs font-semibold text-white">{t(lang, 'black')}</span>
                </button>
              </div>
            </div>
          )}

          {/* AI Difficulty (when vs AI) */}
          {mode === 'ai' && (
            <div>
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                {t(lang, 'selectDifficulty')}
              </label>
              <div className="space-y-1.5">
                {difficulties.map(item => (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setDifficulty(item.level)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      difficulty === item.level
                        ? 'bg-amber-500/15 border-amber-500 shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-bold ${difficulty === item.level ? 'text-amber-300' : 'text-slate-200'}`}>
                        {t(lang, item.labelKey)}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {t(lang, item.descKey)}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <div
                          key={star}
                          className={`w-2 h-2 rounded-full ${
                            star <= item.level ? 'bg-amber-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Time Control */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {t(lang, 'selectTimeControl')}
              </label>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {TIME_CONTROLS.map(tc => {
                const isSelected = timeControlId === tc.id;
                return (
                  <button
                    key={tc.id}
                    type="button"
                    onClick={() => setTimeControlId(tc.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold shadow-sm'
                        : 'bg-slate-800/50 border-slate-700/80 text-slate-300 hover:bg-slate-800 font-medium'
                    } text-xs`}
                  >
                    {tc.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {t(lang, 'close')}
          </button>
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            {t(lang, 'startGame')}
          </button>
        </div>
      </div>
    </div>
  );
};
