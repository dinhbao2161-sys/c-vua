import React, { useEffect } from 'react';
import { GameResult, Language, PlayerColor } from '../types/chess';
import { t } from '../translations';
import confetti from 'canvas-confetti';
import { Trophy, Swords, RotateCcw, PlusCircle, X } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  result: GameResult | null;
  userColor: PlayerColor;
  onRematch: () => void;
  onNewGame: () => void;
  onClose: () => void;
  lang: Language;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  result,
  userColor,
  onRematch,
  onNewGame,
  onClose,
  lang
}) => {
  useEffect(() => {
    if (isOpen && result && result.winner !== 'draw') {
      // Fire confetti if winner
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback if canvas not available
      }
    }
  }, [isOpen, result]);

  if (!isOpen || !result) return null;

  const isDraw = result.winner === 'draw';
  const isWhiteWin = result.winner === 'w';
  const isUserWinner = result.winner === userColor;

  // Title description
  let title = t(lang, 'gameOver');
  if (isDraw) {
    title = t(lang, 'draw');
  } else if (isUserWinner) {
    title = lang === 'vi' ? 'Chiến Thắng!' : 'Victory!';
  } else {
    title = isWhiteWin ? `${t(lang, 'white')} ${lang === 'vi' ? 'Thắng' : 'Wins'}` : `${t(lang, 'black')} ${lang === 'vi' ? 'Thắng' : 'Wins'}`;
  }

  // Reason description
  let reasonText = '';
  switch (result.reason) {
    case 'checkmate':
      reasonText = t(lang, 'checkmate');
      break;
    case 'timeout':
      reasonText = t(lang, 'timeOut');
      break;
    case 'resignation':
      reasonText = t(lang, 'resignedMessage', {
        player: result.winner === 'w' ? t(lang, 'black') : t(lang, 'white')
      });
      break;
    case 'stalemate':
      reasonText = t(lang, 'stalemate');
      break;
    case 'threefold_repetition':
      reasonText = t(lang, 'threefoldRepetition');
      break;
    case 'insufficient_material':
      reasonText = t(lang, 'insufficientMaterial');
      break;
    case 'fifty_moves':
      reasonText = t(lang, 'fiftyMoves');
      break;
    case 'draw_agreement':
      reasonText = t(lang, 'drawAgreed');
      break;
    default:
      reasonText = '';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl text-center relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Trophy or Swords Icon */}
        <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg bg-gradient-to-tr from-amber-500/20 to-yellow-500/30 border border-amber-500/40 text-amber-400">
          {isDraw ? <Swords className="w-8 h-8" /> : <Trophy className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h3 className="text-2xl font-black text-white tracking-tight mb-1">{title}</h3>

        {/* Reason */}
        <p className="text-sm font-medium text-amber-300/90 mb-6 bg-slate-800/80 py-1.5 px-3 rounded-lg border border-slate-700/60 inline-block">
          {reasonText}
        </p>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onRematch}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t(lang, 'rematch')}</span>
          </button>

          <button
            onClick={onNewGame}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm border border-slate-700 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t(lang, 'newGame')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
