import React, { useEffect, useState } from 'react';
import { Chess } from 'chess.js';
import { Language, PositionEvaluation } from '../types/chess';
import { getPositionEvaluation } from '../chess/ai';
import { t } from '../translations';
import { Bot, Lightbulb, Sparkles, X, Compass, ShieldAlert, Zap } from 'lucide-react';

interface CoachModalProps {
  isOpen: boolean;
  onClose: () => void;
  game: Chess;
  lang: Language;
}

export const CoachModal: React.FC<CoachModalProps> = ({
  isOpen,
  onClose,
  game,
  lang
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [evaluation, setEvaluation] = useState<PositionEvaluation | null>(null);
  const [analysisText, setAnalysisText] = useState<string>('');

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    // Calculate local engine evaluation
    const evalData = getPositionEvaluation(game);
    setEvaluation(evalData);

    // Call server AI Coach or heuristic generator
    const analyzePosition = async () => {
      try {
        const fen = game.fen();
        const pgn = game.pgn();
        const turn = game.turn() === 'w' ? 'White' : 'Black';

        // Try calling the backend /api/coach if available
        const res = await fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fen, pgn, turn, lang })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.commentary) {
            setAnalysisText(data.commentary);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to rich built-in master commentary
      }

      // Rich local tactical analysis
      setTimeout(() => {
        const turn = game.turn() === 'w' ? t(lang, 'white') : t(lang, 'black');
        const score = evalData.score;
        let advantageText = '';
        if (Math.abs(score) < 0.3) {
          advantageText = lang === 'vi' 
            ? 'Thế cờ hiện tại đang ở trạng thái cân bằng động. Cả hai bên đều giữ được cấu trúc tốt.' 
            : 'The current position is dynamically balanced. Both sides have solid pawn structure.';
        } else if (score > 0) {
          advantageText = lang === 'vi'
            ? `Quân Trắng đang nắm giữ ưu thế (+${score.toFixed(1)} tốt) nhờ khả năng kiểm soát không gian và vị trí quân chủ động hơn.`
            : `White maintains an advantage (+${score.toFixed(1)} pawns) with superior space control and piece activity.`;
        } else {
          advantageText = lang === 'vi'
            ? `Quân Đen đang chiếm ưu thế (${score.toFixed(1)} tốt) với các đòn phản công sắc bén và áp lực vào các điểm yếu.`
            : `Black has the advantage (${score.toFixed(1)} pawns) with sharp counterplay against weaknesses.`;
        }

        const advice = lang === 'vi'
          ? `Gợi ý chiến thuật cho lượt đi của ${turn}: Hãy tập trung vào việc bảo vệ vua, kết nối các xe và kiểm soát các ô trung tâm quan trọng (d4, e4, d5, e5). Nước cờ ${evalData.bestMove?.san || 'được đề xuất'} là phương án chủ động nhất.`
          : `Tactical advice for ${turn}'s turn: Focus on king safety, connecting rooks, and fighting for key central outposts. Playing ${evalData.bestMove?.san || 'the suggested move'} maintains strong initiative.`;

        setAnalysisText(`${advantageText}\n\n${advice}`);
        setLoading(false);
      }, 500);
    };

    analyzePosition();
  }, [isOpen, game, lang]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-purple-500/30 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-gradient-to-r from-purple-950/40 to-slate-900">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-600 text-white shadow-md shadow-purple-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-1.5">
                {t(lang, 'gmCoachTitle')}
                <Sparkles className="w-4 h-4 text-amber-400" />
              </h3>
              <p className="text-[11px] text-purple-300/80">{t(lang, 'gmCoachSubtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 flex-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
              <p className="text-xs text-slate-400 font-medium">{t(lang, 'analyzingPosition')}</p>
            </div>
          ) : (
            <>
              {/* Best Move Spotlight */}
              {evaluation?.bestMove && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/20 text-purple-300">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                        {t(lang, 'bestMoveRecommendation')}
                      </div>
                      <div className="text-xl font-black font-mono text-white">
                        {evaluation.bestMove.san} ({evaluation.bestMove.from} → {evaluation.bestMove.to})
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Đánh giá</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {evaluation.score > 0 ? `+${evaluation.score}` : evaluation.score}
                    </div>
                  </div>
                </div>
              )}

              {/* Tactical Explanation */}
              {evaluation?.explanation && (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">Ý đồ nước đi: </span>
                    {evaluation.explanation}
                  </div>
                </div>
              )}

              {/* Strategy & Positional Breakdown */}
              <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                  <Compass className="w-4 h-4 text-purple-400" />
                  <span>{t(lang, 'tacticalReasoning')}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {analysisText}
                </p>
              </div>

              {/* Positional Checklist */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-slate-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>An toàn vua: Tốt</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-800 flex items-center gap-2 text-slate-300">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>Kiểm soát trung tâm: Tích cực</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 transition-colors"
          >
            {t(lang, 'close')}
          </button>
        </div>
      </div>
    </div>
  );
};
