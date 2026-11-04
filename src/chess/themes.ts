import { BoardTheme, BoardThemeId, PieceTheme, PieceThemeId } from '../types/chess';

export const BOARD_THEMES: Record<BoardThemeId, BoardTheme> = {
  tournament: {
    id: 'tournament',
    nameKey: 'themeTournament',
    lightSquare: '#eeeed2',
    darkSquare: '#769656',
    highlightSelected: 'rgba(247, 247, 105, 0.65)',
    highlightMove: 'rgba(186, 202, 68, 0.6)',
    highlightLegal: 'rgba(0, 0, 0, 0.22)',
    coordinateLight: '#769656',
    coordinateDark: '#eeeed2'
  },
  wood: {
    id: 'wood',
    nameKey: 'themeWood',
    lightSquare: '#e3c299',
    darkSquare: '#a16d47',
    highlightSelected: 'rgba(255, 235, 120, 0.6)',
    highlightMove: 'rgba(215, 175, 105, 0.65)',
    highlightLegal: 'rgba(80, 45, 20, 0.3)',
    coordinateLight: '#a16d47',
    coordinateDark: '#e3c299'
  },
  midnight: {
    id: 'midnight',
    nameKey: 'themeMidnight',
    lightSquare: '#c8d6e5',
    darkSquare: '#38577a',
    highlightSelected: 'rgba(84, 160, 255, 0.55)',
    highlightMove: 'rgba(46, 134, 222, 0.5)',
    highlightLegal: 'rgba(20, 40, 70, 0.3)',
    coordinateLight: '#38577a',
    coordinateDark: '#c8d6e5'
  },
  charcoal: {
    id: 'charcoal',
    nameKey: 'themeCharcoal',
    lightSquare: '#d1d5db',
    darkSquare: '#4b5563',
    highlightSelected: 'rgba(234, 179, 8, 0.6)',
    highlightMove: 'rgba(202, 138, 4, 0.5)',
    highlightLegal: 'rgba(17, 24, 39, 0.35)',
    coordinateLight: '#4b5563',
    coordinateDark: '#d1d5db'
  },
  ocean: {
    id: 'ocean',
    nameKey: 'themeOcean',
    lightSquare: '#e0f2fe',
    darkSquare: '#0284c7',
    highlightSelected: 'rgba(56, 189, 248, 0.6)',
    highlightMove: 'rgba(14, 165, 233, 0.5)',
    highlightLegal: 'rgba(3, 105, 161, 0.3)',
    coordinateLight: '#0284c7',
    coordinateDark: '#e0f2fe'
  }
};

export const PIECE_THEMES: PieceTheme[] = [
  { id: 'neo', nameKey: 'pieceNeo' },
  { id: 'classic', nameKey: 'pieceClassic' },
  { id: 'wood', nameKey: 'pieceWood' }
];

export const TIME_CONTROLS = [
  { id: 'unlimited', name: 'Unlimited', baseSeconds: 0, incrementSeconds: 0, category: 'unlimited' },
  { id: 'bullet_1_0', name: '1 min', baseSeconds: 60, incrementSeconds: 0, category: 'bullet' },
  { id: 'bullet_2_1', name: '2 | 1', baseSeconds: 120, incrementSeconds: 1, category: 'bullet' },
  { id: 'blitz_3_0', name: '3 min', baseSeconds: 180, incrementSeconds: 0, category: 'blitz' },
  { id: 'blitz_3_2', name: '3 | 2', baseSeconds: 180, incrementSeconds: 2, category: 'blitz' },
  { id: 'blitz_5_0', name: '5 min', baseSeconds: 300, incrementSeconds: 0, category: 'blitz' },
  { id: 'blitz_5_3', name: '5 | 3', baseSeconds: 300, incrementSeconds: 3, category: 'blitz' },
  { id: 'rapid_10_0', name: '10 min', baseSeconds: 600, incrementSeconds: 0, category: 'rapid' },
  { id: 'rapid_15_10', name: '15 | 10', baseSeconds: 900, incrementSeconds: 10, category: 'rapid' },
  { id: 'classical_30', name: '30 min', baseSeconds: 1800, incrementSeconds: 0, category: 'classical' }
] as const;
