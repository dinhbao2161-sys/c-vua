import React, { useState } from 'react';
import { Chess, Move, Square } from 'chess.js';
import { BoardThemeId, PieceThemeId, PlayerColor } from '../types/chess';
import { BOARD_THEMES } from '../chess/themes';
import { PieceIcon } from '../chess/pieces';

interface ChessboardProps {
  game: Chess;
  boardOrientation: PlayerColor; // 'w' or 'b'
  boardTheme: BoardThemeId;
  pieceTheme: PieceThemeId;
  showCoordinates: boolean;
  showLegalMoves: boolean;
  highlightLastMove: boolean;
  lastMove: { from: string; to: string } | null;
  hintMove: { from: string; to: string } | null;
  isInteractive: boolean;
  onMove: (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => void;
}

export const Chessboard: React.FC<ChessboardProps> = ({
  game,
  boardOrientation,
  boardTheme,
  pieceTheme,
  showCoordinates,
  showLegalMoves,
  highlightLastMove,
  lastMove,
  hintMove,
  isInteractive,
  onMove
}) => {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [legalMoves, setLegalMoves] = useState<Move[]>([]);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);

  const theme = BOARD_THEMES[boardTheme] || BOARD_THEMES.tournament;

  // King in check square detection
  let checkSquare: Square | null = null;
  if (game.inCheck()) {
    const turn = game.turn();
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece && piece.type === 'k' && piece.color === turn) {
          const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
          const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
          checkSquare = `${files[c]}${ranks[r]}` as Square;
          break;
        }
      }
      if (checkSquare) break;
    }
  }

  // Handle square selection / click
  const handleSquareClick = (square: Square) => {
    if (!isInteractive || pendingPromotion) return;

    // If already selected, clicking another square tries to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        // Deselect
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }

      // Check if clicked square is in legal moves
      const matchingMove = legalMoves.find(m => m.to === square);
      if (matchingMove) {
        // Check for promotion
        const piece = game.get(selectedSquare);
        const isPromotion =
          piece?.type === 'p' &&
          ((piece.color === 'w' && square[1] === '8') ||
            (piece.color === 'b' && square[1] === '1'));

        if (isPromotion) {
          setPendingPromotion({ from: selectedSquare, to: square });
          return;
        }

        onMove(selectedSquare, square);
        setSelectedSquare(null);
        setLegalMoves([]);
        return;
      }
    }

    // Otherwise select this square if it has current player's piece
    const pieceOnSquare = game.get(square);
    if (pieceOnSquare && pieceOnSquare.color === game.turn()) {
      setSelectedSquare(square);
      const moves = game.moves({ square, verbose: true });
      setLegalMoves(moves);
    } else {
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, square: Square) => {
    if (!isInteractive || pendingPromotion) {
      e.preventDefault();
      return;
    }
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      e.preventDefault();
      return;
    }

    setDraggedSquare(square);
    setSelectedSquare(square);
    const moves = game.moves({ square, verbose: true });
    setLegalMoves(moves);

    e.dataTransfer.setData('text/plain', square);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetSquare: Square) => {
    e.preventDefault();
    const sourceSquare = draggedSquare || (e.dataTransfer.getData('text/plain') as Square);
    setDraggedSquare(null);

    if (!sourceSquare || sourceSquare === targetSquare) return;

    const moves = game.moves({ square: sourceSquare, verbose: true });
    const matchingMove = moves.find(m => m.to === targetSquare);

    if (matchingMove) {
      const piece = game.get(sourceSquare);
      const isPromotion =
        piece?.type === 'p' &&
        ((piece.color === 'w' && targetSquare[1] === '8') ||
          (piece.color === 'b' && targetSquare[1] === '1'));

      if (isPromotion) {
        setPendingPromotion({ from: sourceSquare, to: targetSquare });
        return;
      }

      onMove(sourceSquare, targetSquare);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Promotion choice
  const handleSelectPromotion = (pieceType: 'q' | 'r' | 'b' | 'n') => {
    if (pendingPromotion) {
      onMove(pendingPromotion.from, pendingPromotion.to, pieceType);
      setPendingPromotion(null);
      setSelectedSquare(null);
      setLegalMoves([]);
    }
  };

  // Generate board ranks and files according to orientation
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];

  const displayFiles = boardOrientation === 'w' ? files : [...files].reverse();
  const displayRanks = boardOrientation === 'w' ? ranks : [...ranks].reverse();

  return (
    <div className="relative select-none aspect-square w-full max-w-[560px] mx-auto rounded-lg shadow-2xl border-4 border-slate-800/80 bg-slate-900 overflow-hidden">
      {/* 8x8 Chessboard Grid */}
      <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
        {displayRanks.map((rank, rowIdx) =>
          displayFiles.map((file, colIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = game.get(square);
            const isLight = (file.charCodeAt(0) - 97 + parseInt(rank)) % 2 !== 0;

            const isSelected = selectedSquare === square;
            const isLastMoveFrom = highlightLastMove && lastMove?.from === square;
            const isLastMoveTo = highlightLastMove && lastMove?.to === square;
            const isCheck = checkSquare === square;
            const isHintFrom = hintMove?.from === square;
            const isHintTo = hintMove?.to === square;

            // Check if this square is a legal destination
            const legalMove = showLegalMoves && legalMoves.find(m => m.to === square);
            const isCapture = legalMove && (piece || legalMove.flags.includes('e'));

            // Square background color
            const squareColor = isLight ? theme.lightSquare : theme.darkSquare;

            return (
              <div
                key={square}
                onClick={() => handleSquareClick(square)}
                onDragOver={handleDragOver}
                onDrop={e => handleDrop(e, square)}
                style={{ backgroundColor: squareColor }}
                className={`relative flex items-center justify-center cursor-pointer transition-colors duration-100 ${
                  isInteractive ? 'hover:brightness-95' : ''
                }`}
                data-square={square}
              >
                {/* Last Move Highlight */}
                {(isLastMoveFrom || isLastMoveTo) && (
                  <div
                    className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                    style={{ backgroundColor: theme.highlightMove }}
                  />
                )}

                {/* Selected Square Highlight */}
                {isSelected && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundColor: theme.highlightSelected }}
                  />
                )}

                {/* Check Warning Glow */}
                {isCheck && (
                  <div className="absolute inset-0 bg-red-600/70 animate-pulse pointer-events-none shadow-[inset_0_0_12px_rgba(220,38,38,0.9)]" />
                )}

                {/* Hint Highlights */}
                {(isHintFrom || isHintTo) && (
                  <div className="absolute inset-0 border-2 border-amber-400 bg-amber-400/25 pointer-events-none animate-pulse" />
                )}

                {/* Legal Move Indicators */}
                {legalMove && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    {isCapture ? (
                      <div className="w-[84%] h-[84%] rounded-full border-[5px] border-black/25 dark:border-black/35 animate-in fade-in zoom-in-75 duration-150" />
                    ) : (
                      <div className="w-[30%] h-[30%] rounded-full bg-black/25 dark:bg-black/35 shadow-sm animate-in fade-in zoom-in-75 duration-150" />
                    )}
                  </div>
                )}

                {/* Chess Piece */}
                {piece && (
                  <div
                    draggable={isInteractive && piece.color === game.turn()}
                    onDragStart={e => handleDragStart(e, square)}
                    className={`w-[86%] h-[86%] z-20 flex items-center justify-center transition-transform active:scale-95 duration-150 ${
                      piece.color === game.turn() && isInteractive ? 'cursor-grab active:cursor-grabbing hover:scale-105' : ''
                    }`}
                  >
                    <PieceIcon type={piece.type} color={piece.color} theme={pieceTheme} />
                  </div>
                )}

                {/* Rank & File Coordinates (Edge of Board) */}
                {showCoordinates && (
                  <>
                    {/* Rank Number on leftmost column */}
                    {colIdx === 0 && (
                      <span
                        className="absolute top-0.5 left-1 text-[10px] md:text-xs font-bold pointer-events-none select-none opacity-85"
                        style={{ color: isLight ? theme.coordinateLight : theme.coordinateDark }}
                      >
                        {rank}
                      </span>
                    )}
                    {/* File Letter on bottommost row */}
                    {rowIdx === 7 && (
                      <span
                        className="absolute bottom-0.5 right-1 text-[10px] md:text-xs font-bold pointer-events-none select-none opacity-85"
                        style={{ color: isLight ? theme.coordinateLight : theme.coordinateDark }}
                      >
                        {file}
                      </span>
                    )}
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Pawn Promotion Modal Overlay */}
      {pendingPromotion && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl text-center max-w-xs w-full animate-in zoom-in-95 duration-150">
            <h4 className="text-white font-semibold text-sm mb-3">Chọn quân phong cấp</h4>
            <div className="grid grid-cols-4 gap-2">
              {(['q', 'n', 'r', 'b'] as const).map(pType => (
                <button
                  key={pType}
                  onClick={() => handleSelectPromotion(pType)}
                  className="bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-600 rounded-lg p-2.5 flex flex-col items-center justify-center gap-1.5 transition-all shadow-md group"
                >
                  <div className="w-10 h-10 group-hover:scale-110 transition-transform">
                    <PieceIcon type={pType} color={game.turn()} theme={pieceTheme} />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300">
                    {pType === 'q' ? 'Hậu' : pType === 'n' ? 'Mã' : pType === 'r' ? 'Xe' : 'Tượng'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
