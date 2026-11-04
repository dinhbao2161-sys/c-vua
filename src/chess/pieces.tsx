import React from 'react';
import { PieceThemeId, PlayerColor } from '../types/chess';

interface PieceProps {
  type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
  color: PlayerColor;
  theme?: PieceThemeId;
  className?: string;
}

export const PieceIcon: React.FC<PieceProps> = ({ type, color, theme = 'neo', className = 'w-full h-full' }) => {
  const isWhite = color === 'w';

  // Styles based on color and theme
  const getFills = () => {
    if (theme === 'wood') {
      return {
        body: isWhite ? '#f3ddb3' : '#573319',
        border: isWhite ? '#8c603b' : '#2b1408',
        accent: isWhite ? '#dfc191' : '#3d2010',
        glow: isWhite ? 'rgba(255, 245, 225, 0.4)' : 'rgba(0, 0, 0, 0.4)'
      };
    }
    if (theme === 'classic') {
      return {
        body: isWhite ? '#FFFFFF' : '#1E293B',
        border: isWhite ? '#475569' : '#0F172A',
        accent: isWhite ? '#E2E8F0' : '#334155',
        glow: isWhite ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'
      };
    }
    // neo (default sleek modern)
    return {
      body: isWhite ? '#FFFFFF' : '#181A20',
      border: isWhite ? '#64748B' : '#090A0F',
      accent: isWhite ? '#E2E8F0' : '#2D3748',
      glow: isWhite ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.6)'
    };
  };

  const fills = getFills();

  // SVG Renderings for each piece
  switch (type) {
    case 'p': // PAWN
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0 2px 3px rgba(0,0,0,0.35))">
          <g style={{ fill: fills.body, stroke: fills.border, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M22.5 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38C17.33 16.5 16 18.59 16 21c0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z" />
            <path d="M12 40h21v2.5H12z" />
          </g>
          {isWhite && (
            <path d="M22.5 10c-1.3 0-2.5 1-2.5 2.5 0 .5.2.9.5 1.3" stroke="#CBD5E1" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          )}
        </svg>
      );

    case 'r': // ROOK
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          <g style={{ fill: fills.body, stroke: fills.border, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M9 39h27v3H9z" />
            <path d="M12 36v-4h21v4H12z" />
            <path d="M14 29.5v-13h17v13H14z" />
            <path d="M14 16.5L11 14V9h4v3h4V9h4v3h4V9h4v5l-3 2.5H14z" />
            <path d="M11 14h23" />
            <path d="M14 29.5L12 32h21l-2-2.5H14z" />
          </g>
          <path d="M14 17h17" stroke={fills.border} strokeWidth="1.2" />
          <path d="M14 36h17" stroke={fills.border} strokeWidth="1.2" />
        </svg>
      );

    case 'n': // KNIGHT
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          <g style={{ fill: fills.body, stroke: fills.border, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M22 10c-3.5 0-6.5 2.5-7.5 6-1 .5-2 1.5-2.5 3 0 0-1 1-1 3s2.5 2.5 2.5 2.5c-.5 2 0 4.5 1.5 6 .5.5 1 1.5 1 2.5l-.5 3h19.5c0-4-1-8.5-4-11.5-3-3-4-3-4-6s1-4 1-5c0-1.5-2-3.5-5.5-3.5z" />
            <path d="M9.5 25.5a.5.5 0 1 1-1 0 .5.5 0 0 1 1 0z" />
            <path d="M9 39h27v3H9z" />
            <path d="M11 36h23l-1.5-3H12.5L11 36z" />
          </g>
          <circle cx="15" cy="17" r="1.5" fill={isWhite ? '#334155' : '#E2E8F0'} />
          <path d="M15 22c1.5 1 4 0 5-1.5" stroke={fills.border} strokeWidth="1.2" fill="none" />
          <path d="M24 16c2 2 3 5 3 8" stroke={fills.border} strokeWidth="1.2" fill="none" />
        </svg>
      );

    case 'b': // BISHOP
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          <g style={{ fill: fills.body, stroke: fills.border, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M9 39h27v3H9z" />
            <path d="M12 36l3-3h15l3 3H12z" />
            <path d="M15 33c0-3.5 2-6.5 4-8.5-3-3-4-7-2-11.5 2-4.5 5.5-5 5.5-5s3.5.5 5.5 5c2 4.5 1 8.5-2 11.5 2 2 4 5 4 8.5H15z" />
            <circle cx="22.5" cy="6" r="2" />
          </g>
          {/* Slit */}
          <path d="M19 14l7 7" stroke={fills.border} strokeWidth="1.6" strokeLinecap="round" />
          <path d="M22.5 18v8" stroke={fills.border} strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="22.5" cy="22" r="1.5" fill={fills.border} />
        </svg>
      );

    case 'q': // QUEEN
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          <g style={{ fill: fills.body, stroke: fills.border, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M9 39h27v3H9z" />
            <path d="M12 36l2.5-3.5h16L33 36H12z" />
            <path d="M14.5 32.5c-1-6 2-14 2-14l-8 7 3-13.5 11 11 11-11 3 13.5-8-7s3 8 2 14h-19z" />
            <circle cx="8.5" cy="12" r="2" />
            <circle cx="15.5" cy="8.5" r="2" />
            <circle cx="22.5" cy="7.5" r="2" />
            <circle cx="29.5" cy="8.5" r="2" />
            <circle cx="36.5" cy="12" r="2" />
          </g>
          <path d="M17 26.5c2 1.5 9 1.5 11 0" stroke={fills.border} strokeWidth="1.3" fill="none" />
          <path d="M16 30c2.5 1.5 10.5 1.5 13 0" stroke={fills.border} strokeWidth="1.3" fill="none" />
        </svg>
      );

    case 'k': // KING
      return (
        <svg viewBox="0 0 45 45" className={className} filter="drop-shadow(0 2px 4px rgba(0,0,0,0.35))">
          {/* Cross */}
          <path d="M22.5 5v7M19 8.5h7" stroke={fills.border} strokeWidth="2" strokeLinecap="round" />
          <g style={{ fill: fills.body, stroke: fills.border, strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }}>
            <path d="M9 39h27v3H9z" />
            <path d="M12 36l3-3.5h15l3 3.5H12z" />
            <path d="M15 32.5c-1-5 1-12 1.5-13.5 2-5 6-7 6-7s4 2 6 7c.5 1.5 2.5 8.5 1.5 13.5h-15z" />
            <circle cx="22.5" cy="14" r="3.5" />
          </g>
          <path d="M17 26.5c2.5 1.5 8.5 1.5 11 0" stroke={fills.border} strokeWidth="1.3" fill="none" />
          <path d="M16 30c3 1.5 10 1.5 13 0" stroke={fills.border} strokeWidth="1.3" fill="none" />
        </svg>
      );

    default:
      return null;
  }
};
