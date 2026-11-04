import { Chess, Move } from 'chess.js';
import { AIDifficulty, PlayerColor, PositionEvaluation } from '../types/chess';

// Standard Chess Piece Values in centipawns
const PIECE_VALUES: Record<string, number> = {
  p: 100,
  n: 320,
  b: 335,
  r: 500,
  q: 950,
  k: 20000
};

// Piece-Square Tables (from White's perspective; inverted for Black)
// Middle-game values encouraging central control, king safety, and active piece placement
const PAWN_PST = [
  0,   0,   0,   0,   0,   0,   0,   0,
  50,  50,  50,  50,  50,  50,  50,  50,
  10,  10,  20,  30,  30,  20,  10,  10,
   5,   5,  10,  25,  25,  10,   5,   5,
   0,   0,   0,  20,  20,   0,   0,   0,
   5,  -5, -10,   0,   0, -10,  -5,   5,
   5,  10,  10, -20, -20,  10,  10,   5,
   0,   0,   0,   0,   0,   0,   0,   0
];

const KNIGHT_PST = [
  -50, -40, -30, -30, -30, -30, -40, -50,
  -40, -20,   0,   0,   0,   0, -20, -40,
  -30,   0,  10,  15,  15,  10,   0, -30,
  -30,   5,  15,  20,  20,  15,   5, -30,
  -30,   0,  15,  20,  20,  15,   0, -30,
  -30,   5,  10,  15,  15,  10,   5, -30,
  -40, -20,   0,   5,   5,   0, -20, -40,
  -50, -40, -30, -30, -30, -30, -40, -50
];

const BISHOP_PST = [
  -20, -10, -10, -10, -10, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,  10,  10,   5,   0, -10,
  -10,   5,   5,  10,  10,   5,   5, -10,
  -10,   0,  10,  10,  10,  10,   0, -10,
  -10,  10,  10,  10,  10,  10,  10, -10,
  -10,   5,   0,   0,   0,   0,   5, -10,
  -20, -10, -10, -10, -10, -10, -10, -20
];

const ROOK_PST = [
    0,   0,   0,   0,   0,   0,   0,   0,
    5,  10,  10,  10,  10,  10,  10,   5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
   -5,   0,   0,   0,   0,   0,   0,  -5,
    0,   0,   0,   5,   5,   0,   0,   0
];

const QUEEN_PST = [
  -20, -10, -10,  -5,  -5, -10, -10, -20,
  -10,   0,   0,   0,   0,   0,   0, -10,
  -10,   0,   5,   5,   5,   5,   0, -10,
   -5,   0,   5,   5,   5,   5,   0,  -5,
    0,   0,   5,   5,   5,   5,   0,  -5,
  -10,   5,   5,   5,   5,   5,   0, -10,
  -10,   0,   5,   0,   0,   0,   0, -10,
  -20, -10, -10,  -5,  -5, -10, -10, -20
];

const KING_MIDDLE_PST = [
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -30, -40, -40, -50, -50, -40, -40, -30,
  -20, -30, -30, -40, -40, -30, -30, -20,
  -10, -20, -20, -20, -20, -20, -20, -10,
   20,  20,   0,   0,   0,   0,  20,  20,
   20,  30,  10,   0,   0,  10,  30,  20
];

const KING_END_PST = [
  -50, -40, -30, -20, -20, -30, -40, -50,
  -30, -20, -10,   0,   0, -10, -20, -30,
  -30, -10,  20,  30,  30,  20, -10, -30,
  -30, -10,  30,  40,  40,  30, -10, -30,
  -30, -10,  30,  40,  40,  30, -10, -30,
  -30, -10,  20,  30,  30,  20, -10, -30,
  -30, -30,   0,   0,   0,   0, -30, -30,
  -50, -30, -30, -30, -30, -30, -30, -50
];

const SQUARE_INDEX: Record<string, number> = {};
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

for (let r = 0; r < 8; r++) {
  for (let f = 0; f < 8; f++) {
    SQUARE_INDEX[`${FILES[f]}${RANKS[r]}`] = r * 8 + f;
  }
}

// Convert square (e.g. 'e4') to 0..63 index
function getSquareIndex(sq: string, isWhite: boolean): number {
  const idx = SQUARE_INDEX[sq] ?? 0;
  // If black, mirror vertically (rank 8 becomes rank 1)
  if (!isWhite) {
    const row = Math.floor(idx / 8);
    const col = idx % 8;
    return (7 - row) * 8 + col;
  }
  return idx;
}

// Evaluate board statically from White's perspective in centipawns
export function evaluateBoard(game: Chess): number {
  if (game.isCheckmate()) {
    return game.turn() === 'w' ? -30000 : 30000;
  }
  if (game.isDraw() || game.isStalemate() || game.isThreefoldRepetition() || game.isInsufficientMaterial()) {
    return 0;
  }

  const board = game.board();
  let score = 0;
  let totalNonPawnMaterial = 0;

  // First pass: calculate total non-pawn material to detect endgame
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece && piece.type !== 'p' && piece.type !== 'k') {
        totalNonPawnMaterial += PIECE_VALUES[piece.type];
      }
    }
  }

  const isEndgame = totalNonPawnMaterial <= 2600; // e.g. queens off or only a couple minor pieces left

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      const isWhite = piece.color === 'w';
      const file = FILES[c];
      const rank = RANKS[r];
      const sq = `${file}${rank}`;
      const sqIdx = getSquareIndex(sq, isWhite);

      let pieceVal = PIECE_VALUES[piece.type] || 0;
      let positionalVal = 0;

      switch (piece.type) {
        case 'p':
          positionalVal = PAWN_PST[sqIdx];
          break;
        case 'n':
          positionalVal = KNIGHT_PST[sqIdx];
          break;
        case 'b':
          positionalVal = BISHOP_PST[sqIdx];
          break;
        case 'r':
          positionalVal = ROOK_PST[sqIdx];
          break;
        case 'q':
          positionalVal = QUEEN_PST[sqIdx];
          break;
        case 'k':
          positionalVal = isEndgame ? KING_END_PST[sqIdx] : KING_MIDDLE_PST[sqIdx];
          break;
      }

      const totalVal = pieceVal + positionalVal;
      score += isWhite ? totalVal : -totalVal;
    }
  }

  // Small bonus for player with the turn (tempo bonus)
  score += game.turn() === 'w' ? 10 : -10;

  return score;
}

// MVV-LVA move ordering helper (Most Valuable Victim - Least Valuable Attacker)
function getMoveScore(move: Move): number {
  let score = 0;
  if (move.captured) {
    const victimVal = PIECE_VALUES[move.captured] || 100;
    const attackerVal = PIECE_VALUES[move.piece] || 100;
    score += victimVal * 10 - attackerVal; // Prioritize pawn takes queen over queen takes pawn
  }
  if (move.promotion) {
    score += 800;
  }
  // Checks are aggressive
  if (move.san.includes('+')) {
    score += 150;
  }
  // Castling is good for king safety
  if (move.san === 'O-O' || move.san === 'O-O-O') {
    score += 80;
  }
  return score;
}

// Order moves to optimize Alpha-Beta pruning
function orderMoves(moves: Move[]): Move[] {
  return [...moves].sort((a, b) => getMoveScore(b) - getMoveScore(a));
}

// Quiescence Search: searches captures until a quiet position is reached (prevents horizon effect)
function quiescence(game: Chess, alpha: number, beta: number, isMaximizing: boolean, depth: number = 0, maxQDepth: number = 2): number {
  const standPat = evaluateBoard(game);

  if (depth >= maxQDepth) return standPat;

  if (isMaximizing) {
    if (standPat >= beta) return beta;
    if (alpha < standPat) alpha = standPat;

    const moves = game.moves({ verbose: true }).filter(m => m.captured || m.promotion);
    const sorted = orderMoves(moves);

    for (const move of sorted) {
      game.move(move);
      const score = quiescence(game, alpha, beta, false, depth + 1, maxQDepth);
      game.undo();

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }
    return alpha;
  } else {
    if (standPat <= alpha) return alpha;
    if (beta > standPat) beta = standPat;

    const moves = game.moves({ verbose: true }).filter(m => m.captured || m.promotion);
    const sorted = orderMoves(moves);

    for (const move of sorted) {
      game.move(move);
      const score = quiescence(game, alpha, beta, true, depth + 1, maxQDepth);
      game.undo();

      if (score <= alpha) return alpha;
      if (score < beta) beta = score;
    }
    return beta;
  }
}

// Minimax with Alpha-Beta Pruning
function minimax(
  game: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || game.isGameOver()) {
    // If not game over, run short quiescence search
    if (!game.isGameOver()) {
      return quiescence(game, alpha, beta, isMaximizing);
    }
    return evaluateBoard(game);
  }

  const legalMoves = game.moves({ verbose: true });
  const sortedMoves = orderMoves(legalMoves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, false);
      game.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cut-off
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      game.move(move);
      const evaluation = minimax(game, depth - 1, alpha, beta, true);
      game.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cut-off
    }
    return minEval;
  }
}

// AI Engine: Chooses best move based on difficulty setting
export async function getAIMove(game: Chess, difficulty: AIDifficulty): Promise<Move | null> {
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  const isWhite = game.turn() === 'w';

  // Level 1: Novice (~700 ELO)
  // 65% random move, 35% basic captures or center checks
  if (difficulty === 1) {
    const captures = legalMoves.filter(m => m.captured);
    if (captures.length > 0 && Math.random() < 0.45) {
      return captures[Math.floor(Math.random() * captures.length)];
    }
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  // Level 2: Beginner (~1100 ELO)
  // Depth 1-2 evaluation with some random noise
  if (difficulty === 2) {
    const scoredMoves: { move: Move; score: number }[] = [];
    for (const move of legalMoves) {
      game.move(move);
      const evalScore = evaluateBoard(game);
      game.undo();
      // Add slight noise
      const noise = (Math.random() - 0.5) * 80;
      scoredMoves.push({ move, score: (isWhite ? evalScore : -evalScore) + noise });
    }
    scoredMoves.sort((a, b) => b.score - a.score);
    // Pick from top 3 with preference for #1
    const topMoves = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }

  // Determine search depth based on level
  let searchDepth = 3;
  if (difficulty === 3) searchDepth = 2; // Intermediate
  if (difficulty === 4) searchDepth = 3; // Advanced
  if (difficulty === 5) searchDepth = 4; // Master

  // If few pieces remaining (endgame), we can search deeper in the same time!
  if (legalMoves.length <= 10 && difficulty >= 4) {
    searchDepth = 5;
  }

  let bestMove: Move = legalMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;

  const sortedMoves = orderMoves(legalMoves);

  for (const move of sortedMoves) {
    game.move(move);
    const score = minimax(
      game,
      searchDepth - 1,
      -Infinity,
      Infinity,
      !isWhite
    );
    game.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

// Convert centipawns to win percentage for visual evaluation bar
export function centipawnsToWinProbability(cp: number): number {
  // Sigmoid formula: Win% = 50 + 50 * (2 / (1 + exp(-0.00368208 * cp)) - 1)
  const clamped = Math.max(-2000, Math.min(2000, cp));
  const prob = 1 / (1 + Math.exp(-0.0036 * clamped));
  return Math.round(prob * 100);
}

// Get rich position evaluation for Eval Bar, hints, and tactical explanations
export function getPositionEvaluation(game: Chess): PositionEvaluation {
  const isWhite = game.turn() === 'w';
  const scoreCp = evaluateBoard(game);
  const scorePawns = Number((scoreCp / 100).toFixed(1));
  const whiteWinChance = centipawnsToWinProbability(scoreCp);

  // Checkmate or mate detection
  if (game.isCheckmate()) {
    const mateWinner = game.turn() === 'w' ? -1 : 1;
    return {
      score: mateWinner * 999,
      mateIn: 0,
      whiteWinChance: mateWinner > 0 ? 100 : 0
    };
  }

  // Find best move for hint
  const legalMoves = game.moves({ verbose: true });
  if (legalMoves.length === 0) {
    return {
      score: 0,
      whiteWinChance: 50
    };
  }

  let bestMove: Move = legalMoves[0];
  let bestScore = isWhite ? -Infinity : Infinity;
  const sorted = orderMoves(legalMoves);

  for (const move of sorted) {
    game.move(move);
    const score = minimax(game, 2, -Infinity, Infinity, !isWhite);
    game.undo();

    if (isWhite) {
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    } else {
      if (score < bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  }

  // Build descriptive tactical explanation
  let explanation = '';
  if (bestMove.captured) {
    explanation = `Bắt quân ${bestMove.captured.toUpperCase()} trên ô ${bestMove.to}, chiếm ưu thế lực lượng`;
  } else if (bestMove.san.includes('+')) {
    explanation = `Chiếu tướng, tạo sức ép lên thế trận của đối phương`;
  } else if (bestMove.san === 'O-O' || bestMove.san === 'O-O-O') {
    explanation = `Nhập thành để đưa vua về vị trí an toàn và kích hoạt xe`;
  } else if (bestMove.piece === 'p' && (bestMove.to[1] === '4' || bestMove.to[1] === '5')) {
    explanation = `Tiến tốt kiểm soát khu vực trung tâm bàn cờ`;
  } else if (bestMove.piece === 'n' || bestMove.piece === 'b') {
    explanation = `Phát triển quân cờ nhẹ đến vị trí tích cực`;
  } else {
    explanation = `Cải thiện vị trí và gia tăng tính cơ động cho quân cờ`;
  }

  return {
    score: scorePawns,
    bestMove: {
      from: bestMove.from,
      to: bestMove.to,
      san: bestMove.san,
      promotion: bestMove.promotion
    },
    explanation,
    whiteWinChance
  };
}
