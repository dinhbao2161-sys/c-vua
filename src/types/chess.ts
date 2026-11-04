export type PlayerColor = 'w' | 'b';

export type GameMode = 'ai' | 'pass_and_play' | 'analysis';

export type AIDifficulty = 1 | 2 | 3 | 4 | 5;

export interface AIDifficultyConfig {
  level: AIDifficulty;
  nameKey: string;
  elo: number;
  depth: number;
  descriptionKey: string;
}

export interface TimeControlConfig {
  id: string;
  name: string;
  baseSeconds: number; // 0 means unlimited
  incrementSeconds: number;
  category: 'bullet' | 'blitz' | 'rapid' | 'classical' | 'unlimited';
}

export interface MoveRecord {
  moveNumber: number;
  san: string;
  from: string;
  to: string;
  piece: string;
  color: PlayerColor;
  captured?: string;
  promotion?: string;
  fen: string;
  eval?: number; // evaluation after this move
  timeRemaining?: number;
}

export type BoardThemeId = 'tournament' | 'wood' | 'midnight' | 'charcoal' | 'ocean';

export interface BoardTheme {
  id: BoardThemeId;
  nameKey: string;
  lightSquare: string;
  darkSquare: string;
  highlightSelected: string;
  highlightMove: string;
  highlightLegal: string;
  coordinateLight: string;
  coordinateDark: string;
}

export type PieceThemeId = 'neo' | 'classic' | 'wood';

export interface PieceTheme {
  id: PieceThemeId;
  nameKey: string;
}

export type GameTerminationReason = 
  | 'checkmate'
  | 'stalemate'
  | 'timeout'
  | 'resignation'
  | 'threefold_repetition'
  | 'insufficient_material'
  | 'fifty_moves'
  | 'draw_agreement';

export interface GameResult {
  winner: PlayerColor | 'draw';
  reason: GameTerminationReason;
  messageKey: string;
}

export interface PositionEvaluation {
  score: number; // in pawns (e.g. +1.5 means White is ahead by 1.5 pawns)
  mateIn?: number; // e.g. 2 means White mates in 2, -3 means Black mates in 3
  bestMove?: {
    from: string;
    to: string;
    san: string;
    promotion?: string;
  };
  explanation?: string;
  whiteWinChance: number; // 0 to 100
}

export type Language = 'vi' | 'en';
