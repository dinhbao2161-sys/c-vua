import React from 'react';
import { PieceThemeId, PlayerColor } from '../types/chess';
import { PieceIcon } from '../chess/pieces';

interface CapturedPiecesProps {
  color: PlayerColor; // Color of the player who captured these pieces
  capturedList: string[]; // array of captured piece letters, e.g. ['p', 'p', 'n']
  materialAdvantage: number; // positive if this player has advantage
  pieceTheme: PieceThemeId;
}

export const CapturedPieces: React.FC<CapturedPiecesProps> = ({
  color,
  capturedList,
  materialAdvantage,
  pieceTheme
}) => {
  // Group pieces in order of value: p, n, b, r, q
  const pieceOrder: Record<string, number> = { p: 1, n: 2, b: 3, r: 4, q: 5 };
  const sorted = [...capturedList].sort((a, b) => (pieceOrder[a] || 0) - (pieceOrder[b] || 0));

  // The pieces displayed are the opponent's pieces (the ones that were captured)
  const opponentColor: PlayerColor = color === 'w' ? 'b' : 'w';

  return (
    <div className="flex items-center gap-1.5 h-6 overflow-x-auto no-scrollbar">
      <div className="flex items-center -space-x-1.5">
        {sorted.map((type, index) => (
          <div key={index} className="w-5 h-5 shrink-0 transition-transform hover:scale-125 hover:z-10">
            <PieceIcon type={type as 'p' | 'n' | 'b' | 'r' | 'q'} color={opponentColor} theme={pieceTheme} />
          </div>
        ))}
      </div>

      {materialAdvantage > 0 && (
        <span className="text-xs font-bold text-amber-400/90 ml-1 bg-amber-500/10 px-1 rounded border border-amber-500/20">
          +{materialAdvantage}
        </span>
      )}
    </div>
  );
};
