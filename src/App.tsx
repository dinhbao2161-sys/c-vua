/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess, Square } from 'chess.js';
import { 
  AIDifficulty, 
  BoardThemeId, 
  GameMode, 
  GameResult, 
  Language, 
  MoveRecord, 
  PieceThemeId, 
  PlayerColor 
} from './types/chess';
import { TIME_CONTROLS } from './chess/themes';
import { t } from './translations';
import { soundEngine } from './utils/audio';
import { getAIMove, getPositionEvaluation } from './chess/ai';

// Components
import { Chessboard } from './components/Chessboard';
import { ChessClock } from './components/ChessClock';
import { CapturedPieces } from './components/CapturedPieces';
import { EvalBar } from './components/EvalBar';
import { MoveHistory } from './components/MoveHistory';
import { GameControls } from './components/GameControls';
import { NewGameModal } from './components/NewGameModal';
import { SettingsModal } from './components/SettingsModal';
import { GameOverModal } from './components/GameOverModal';
import { CoachModal } from './components/CoachModal';

// Icons
import { Crown, Sparkles, Volume2, VolumeX, Shield, Award } from 'lucide-react';

export default function App() {
  // --- Game Engine Instance ---
  const [game, setGame] = useState<Chess>(() => new Chess());

  // --- Game Configurations ---
  const [mode, setMode] = useState<GameMode>('ai');
  const [playerColor, setPlayerColor] = useState<PlayerColor>('w');
  const [boardOrientation, setBoardOrientation] = useState<PlayerColor>('w');
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>(3);
  const [timeControlId, setTimeControlId] = useState<string>('rapid_10_0');

  // --- Clock & Timer State ---
  const [whiteTime, setWhiteTime] = useState<number>(600);
  const [blackTime, setBlackTime] = useState<number>(600);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // --- Move Records & History Navigation ---
  const [moveHistory, setMoveHistory] = useState<MoveRecord[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // --- UI Indicators ---
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);
  const [hintMove, setHintMove] = useState<{ from: string; to: string } | null>(null);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // --- Captured Pieces & Material Calculation ---
  const [capturedWhite, setCapturedWhite] = useState<string[]>([]);
  const [capturedBlack, setCapturedBlack] = useState<string[]>([]);
  const [whiteMaterialDelta, setWhiteMaterialDelta] = useState<number>(0);
  const [blackMaterialDelta, setBlackMaterialDelta] = useState<number>(0);

  // --- Evaluation State ---
  const [evalScore, setEvalScore] = useState<number>(0);
  const [whiteWinChance, setWhiteWinChance] = useState<number>(50);

  // --- Game Result & Modals ---
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isCoachModalOpen, setIsCoachModalOpen] = useState<boolean>(false);

  // --- Copy Notifications ---
  const [fenCopied, setFenCopied] = useState<boolean>(false);
  const [pgnCopied, setPgnCopied] = useState<boolean>(false);

  // --- Customization Settings ---
  const [boardTheme, setBoardTheme] = useState<BoardThemeId>(() => {
    return (localStorage.getItem('chess_board_theme') as BoardThemeId) || 'tournament';
  });
  const [pieceTheme, setPieceTheme] = useState<PieceThemeId>(() => {
    return (localStorage.getItem('chess_piece_theme') as PieceThemeId) || 'neo';
  });
  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    return localStorage.getItem('chess_sound') !== 'false';
  });
  const [showCoordinates, setShowCoordinates] = useState<boolean>(() => {
    return localStorage.getItem('chess_coords') !== 'false';
  });
  const [showLegalMoves, setShowLegalMoves] = useState<boolean>(() => {
    return localStorage.getItem('chess_legal_moves') !== 'false';
  });
  const [highlightLastMove, setHighlightLastMove] = useState<boolean>(() => {
    return localStorage.getItem('chess_highlight_last') !== 'false';
  });
  const [autoFlipBoard, setAutoFlipBoard] = useState<boolean>(false);
  const [lang, setLang] = useState<Language>(() => {
    return (localStorage.getItem('chess_lang') as Language) || 'vi';
  });

  // Keep audio manager in sync with user preference
  useEffect(() => {
    soundEngine.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Recalculate captured pieces & material difference
  const updateMaterial = useCallback((chessInstance: Chess) => {
    const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    const startingCounts: Record<string, number> = { p: 8, n: 2, b: 2, r: 2, q: 1, k: 1 };

    const currentWhiteCounts: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };
    const currentBlackCounts: Record<string, number> = { p: 0, n: 0, b: 0, r: 0, q: 0, k: 0 };

    const board = chessInstance.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const piece = board[r][c];
        if (piece) {
          if (piece.color === 'w') {
            currentWhiteCounts[piece.type] = (currentWhiteCounts[piece.type] || 0) + 1;
          } else {
            currentBlackCounts[piece.type] = (currentBlackCounts[piece.type] || 0) + 1;
          }
        }
      }
    }

    // Pieces captured by White (missing Black pieces)
    const capturedByWhite: string[] = [];
    let whiteTotalMaterial = 0;
    // Pieces captured by Black (missing White pieces)
    const capturedByBlack: string[] = [];
    let blackTotalMaterial = 0;

    Object.keys(startingCounts).forEach(type => {
      const lostWhite = startingCounts[type] - (currentWhiteCounts[type] || 0);
      for (let i = 0; i < lostWhite; i++) {
        capturedByBlack.push(type);
      }
      const lostBlack = startingCounts[type] - (currentBlackCounts[type] || 0);
      for (let i = 0; i < lostBlack; i++) {
        capturedByWhite.push(type);
      }

      whiteTotalMaterial += (currentWhiteCounts[type] || 0) * pieceValues[type];
      blackTotalMaterial += (currentBlackCounts[type] || 0) * pieceValues[type];
    });

    setCapturedWhite(capturedByWhite);
    setCapturedBlack(capturedByBlack);

    const delta = whiteTotalMaterial - blackTotalMaterial;
    setWhiteMaterialDelta(delta > 0 ? delta : 0);
    setBlackMaterialDelta(delta < 0 ? Math.abs(delta) : 0);
  }, []);

  // Update position evaluation
  const updateEvaluation = useCallback((chessInstance: Chess) => {
    const evalData = getPositionEvaluation(chessInstance);
    setEvalScore(evalData.score);
    setWhiteWinChance(evalData.whiteWinChance);
  }, []);

  // Check Game Termination
  const checkGameOver = useCallback((chessInstance: Chess) => {
    if (chessInstance.isCheckmate()) {
      const winner = chessInstance.turn() === 'w' ? 'b' : 'w';
      const result: GameResult = {
        winner,
        reason: 'checkmate',
        messageKey: 'checkmate'
      };
      setGameResult(result);
      setIsGameOverModalOpen(true);
      setIsTimerRunning(false);
      soundEngine.playWin();
      return true;
    }

    if (chessInstance.isDraw()) {
      let reason: GameResult['reason'] = 'stalemate';
      if (chessInstance.isStalemate()) reason = 'stalemate';
      else if (chessInstance.isThreefoldRepetition()) reason = 'threefold_repetition';
      else if (chessInstance.isInsufficientMaterial()) reason = 'insufficient_material';
      else reason = 'fifty_moves';

      const result: GameResult = {
        winner: 'draw',
        reason,
        messageKey: reason
      };
      setGameResult(result);
      setIsGameOverModalOpen(true);
      setIsTimerRunning(false);
      soundEngine.playGameOver();
      return true;
    }

    return false;
  }, []);

  // Stop Timer
  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Clock Countdown Timer Interval
  useEffect(() => {
    const tc = TIME_CONTROLS.find(t => t.id === timeControlId);
    if (!tc || tc.baseSeconds === 0) return; // Unlimited time

    if (isTimerRunning && !gameResult) {
      timerRef.current = setInterval(() => {
        const turn = game.turn();
        if (turn === 'w') {
          setWhiteTime(prev => {
            if (prev <= 1) {
              // White ran out of time -> Black wins
              stopTimer();
              const result: GameResult = {
                winner: 'b',
                reason: 'timeout',
                messageKey: 'timeOut'
              };
              setGameResult(result);
              setIsGameOverModalOpen(true);
              soundEngine.playGameOver();
              return 0;
            }
            if (prev <= 10) soundEngine.playTimeWarning();
            return prev - 1;
          });
        } else {
          setBlackTime(prev => {
            if (prev <= 1) {
              // Black ran out of time -> White wins
              stopTimer();
              const result: GameResult = {
                winner: 'w',
                reason: 'timeout',
                messageKey: 'timeOut'
              };
              setGameResult(result);
              setIsGameOverModalOpen(true);
              soundEngine.playGameOver();
              return 0;
            }
            if (prev <= 10) soundEngine.playTimeWarning();
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isTimerRunning, gameResult, game, timeControlId]);

  // Execute Move
  const handleMakeMove = useCallback(
    (from: Square, to: Square, promotion?: 'q' | 'r' | 'b' | 'n') => {
      if (gameResult) return;

      try {
        const move = game.move({
          from,
          to,
          promotion: promotion || 'q'
        });

        if (!move) return;

        // Sound effect based on move characteristics
        if (game.isCheckmate() || game.inCheck()) {
          soundEngine.playCheck();
        } else if (move.captured) {
          soundEngine.playCapture();
        } else if (move.san === 'O-O' || move.san === 'O-O-O') {
          soundEngine.playCastle();
        } else {
          soundEngine.playMove();
        }

        // Add increment to the player who just moved
        const tc = TIME_CONTROLS.find(t => t.id === timeControlId);
        if (tc && tc.incrementSeconds > 0) {
          if (move.color === 'w') {
            setWhiteTime(prev => prev + tc.incrementSeconds);
          } else {
            setBlackTime(prev => prev + tc.incrementSeconds);
          }
        }

        // Start clock on first move
        if (!isTimerRunning && tc && tc.baseSeconds > 0) {
          setIsTimerRunning(true);
        }

        // Record move
        const newRecord: MoveRecord = {
          moveNumber: Math.floor(moveHistory.length / 2) + 1,
          san: move.san,
          from: move.from,
          to: move.to,
          piece: move.piece,
          color: move.color,
          captured: move.captured,
          promotion: move.promotion,
          fen: game.fen()
        };

        const updatedHistory = [...moveHistory, newRecord];
        setMoveHistory(updatedHistory);
        setHistoryIndex(updatedHistory.length - 1);
        setLastMove({ from: move.from, to: move.to });
        setHintMove(null);

        // Update board state copy to trigger re-renders
        const newGame = new Chess(game.fen());
        setGame(newGame);

        // Update analytics
        updateMaterial(newGame);
        updateEvaluation(newGame);

        // Auto flip board in 2-player mode if turned on
        if (mode === 'pass_and_play' && autoFlipBoard) {
          setBoardOrientation(newGame.turn());
        }

        // Check if game over
        checkGameOver(newGame);
      } catch (err) {
        console.error('Move error:', err);
      }
    },
    [
      game,
      gameResult,
      timeControlId,
      isTimerRunning,
      moveHistory,
      updateMaterial,
      updateEvaluation,
      mode,
      autoFlipBoard,
      checkGameOver
    ]
  );

  // Trigger AI move when it's AI's turn
  useEffect(() => {
    if (mode !== 'ai' || gameResult || isAiThinking) return;

    const isAiTurn = game.turn() !== playerColor;
    if (isAiTurn) {
      setIsAiThinking(true);

      // Add a slight natural delay so the computer doesn't feel robotic
      const thinkDelay = aiDifficulty <= 2 ? 350 : 600;

      const timer = setTimeout(async () => {
        try {
          const aiMove = await getAIMove(game, aiDifficulty);
          if (aiMove) {
            handleMakeMove(
              aiMove.from as Square,
              aiMove.to as Square,
              (aiMove.promotion as 'q' | 'r' | 'b' | 'n') || undefined
            );
          }
        } catch (err) {
          console.error('AI move error:', err);
        } finally {
          setIsAiThinking(false);
        }
      }, thinkDelay);

      return () => clearTimeout(timer);
    }
  }, [game, mode, playerColor, gameResult, aiDifficulty, isAiThinking, handleMakeMove]);

  // Handle Board History Reviewing
  const handleSelectHistoryMove = (index: number) => {
    setHistoryIndex(index);
    if (index === -1) {
      // Starting board
      setGame(new Chess());
      setLastMove(null);
    } else {
      const record = moveHistory[index];
      if (record) {
        setGame(new Chess(record.fen));
        setLastMove({ from: record.from, to: record.to });
      }
    }
  };

  // Undo (Takeback)
  const handleUndo = () => {
    if (moveHistory.length === 0 || gameResult) return;

    const newGame = new Chess();
    // If playing vs AI, undo 2 moves (AI move and player move)
    const undoCount = mode === 'ai' && game.turn() === playerColor ? 2 : 1;
    const targetLength = Math.max(0, moveHistory.length - undoCount);

    const remainingMoves = moveHistory.slice(0, targetLength);
    for (const record of remainingMoves) {
      newGame.move({
        from: record.from,
        to: record.to,
        promotion: record.promotion
      });
    }

    setGame(newGame);
    setMoveHistory(remainingMoves);
    setHistoryIndex(remainingMoves.length - 1);
    setHintMove(null);

    if (remainingMoves.length > 0) {
      const last = remainingMoves[remainingMoves.length - 1];
      setLastMove({ from: last.from, to: last.to });
    } else {
      setLastMove(null);
    }

    updateMaterial(newGame);
    updateEvaluation(newGame);
    soundEngine.playMove();
  };

  // Hint Generator
  const handleHint = () => {
    const evalData = getPositionEvaluation(game);
    if (evalData.bestMove) {
      setHintMove({ from: evalData.bestMove.from, to: evalData.bestMove.to });
      soundEngine.playMove();
    }
  };

  // Resign
  const handleResign = () => {
    if (gameResult) return;
    const winner: PlayerColor = game.turn() === 'w' ? 'b' : 'w';
    const result: GameResult = {
      winner,
      reason: 'resignation',
      messageKey: 'resignedMessage'
    };
    setGameResult(result);
    setIsGameOverModalOpen(true);
    stopTimer();
    soundEngine.playGameOver();
  };

  // Offer Draw
  const handleOfferDraw = () => {
    if (gameResult) return;
    const result: GameResult = {
      winner: 'draw',
      reason: 'draw_agreement',
      messageKey: 'drawAgreed'
    };
    setGameResult(result);
    setIsGameOverModalOpen(true);
    stopTimer();
    soundEngine.playGameOver();
  };

  // Start New Game Setup
  const handleStartNewGame = (config: {
    mode: GameMode;
    playerColor: PlayerColor;
    aiDifficulty: AIDifficulty;
    timeControlId: string;
  }) => {
    const newGame = new Chess();
    setGame(newGame);
    setMode(config.mode);
    setPlayerColor(config.playerColor);
    setBoardOrientation(config.playerColor);
    setAiDifficulty(config.aiDifficulty);
    setTimeControlId(config.timeControlId);

    const tc = TIME_CONTROLS.find(t => t.id === config.timeControlId);
    const initialTime = tc?.baseSeconds || 0;
    setWhiteTime(initialTime);
    setBlackTime(initialTime);
    setIsTimerRunning(false);

    setMoveHistory([]);
    setHistoryIndex(-1);
    setLastMove(null);
    setHintMove(null);
    setGameResult(null);
    setIsGameOverModalOpen(false);

    updateMaterial(newGame);
    updateEvaluation(newGame);
    soundEngine.playMove();
  };

  // Rematch with identical settings
  const handleRematch = () => {
    handleStartNewGame({
      mode,
      playerColor: mode === 'ai' ? (playerColor === 'w' ? 'b' : 'w') : 'w', // Swap colors on rematch
      aiDifficulty,
      timeControlId
    });
  };

  // Copy FEN & PGN
  const handleCopyFEN = () => {
    navigator.clipboard.writeText(game.fen());
    setFenCopied(true);
    setTimeout(() => setFenCopied(false), 2000);
  };

  const handleCopyPGN = () => {
    navigator.clipboard.writeText(game.pgn());
    setPgnCopied(true);
    setTimeout(() => setPgnCopied(false), 2000);
  };

  // Settings persistence
  const handleSelectBoardTheme = (id: BoardThemeId) => {
    setBoardTheme(id);
    localStorage.setItem('chess_board_theme', id);
  };

  const handleSelectPieceTheme = (id: PieceThemeId) => {
    setPieceTheme(id);
    localStorage.setItem('chess_piece_theme', id);
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('chess_sound', String(next));
  };

  const handleToggleCoords = () => {
    const next = !showCoordinates;
    setShowCoordinates(next);
    localStorage.setItem('chess_coords', String(next));
  };

  const handleToggleLegalMoves = () => {
    const next = !showLegalMoves;
    setShowLegalMoves(next);
    localStorage.setItem('chess_legal_moves', String(next));
  };

  const handleToggleHighlightLast = () => {
    const next = !highlightLastMove;
    setHighlightLastMove(next);
    localStorage.setItem('chess_highlight_last', String(next));
  };

  const handleToggleAutoFlip = () => {
    setAutoFlipBoard(!autoFlipBoard);
  };

  const handleSelectLang = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('chess_lang', newLang);
  };

  const isLive = historyIndex === moveHistory.length - 1;
  const isInteractive = isLive && !gameResult && (!isAiThinking || mode !== 'ai');

  // Determine top & bottom player perspectives
  const topColor: PlayerColor = boardOrientation === 'w' ? 'b' : 'w';
  const bottomColor: PlayerColor = boardOrientation === 'w' ? 'w' : 'b';

  const getPlayerLabel = (color: PlayerColor) => {
    if (mode === 'pass_and_play') {
      return color === 'w' ? t(lang, 'white') : t(lang, 'black');
    }
    if (color === playerColor) {
      return `${t(lang, 'you')} (${color === 'w' ? t(lang, 'white') : t(lang, 'black')})`;
    }
    return `AI Cấp ${aiDifficulty} (${color === 'w' ? t(lang, 'white') : t(lang, 'black')})`;
  };

  const getPlayerTitle = (color: PlayerColor) => {
    if (mode === 'ai' && color !== playerColor) {
      if (aiDifficulty === 5) return 'GM';
      if (aiDifficulty === 4) return 'IM';
      if (aiDifficulty === 3) return 'FM';
      return 'BOT';
    }
    return undefined;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Application Navbar */}
      <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-black">
            <Crown className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
              {t(lang, 'appTitle')}
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest hidden sm:inline">
                FIDE Standard
              </span>
            </h1>
            <p className="text-[10px] sm:text-xs text-slate-400 truncate hidden md:block">
              {t(lang, 'tagline')}
            </p>
          </div>
        </div>

        {/* Quick Top Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            title={soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switch */}
          <button
            onClick={() => handleSelectLang(lang === 'vi' ? 'en' : 'vi')}
            title="Đổi ngôn ngữ / Change Language"
            className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors"
          >
            {lang.toUpperCase()}
          </button>

          {/* New Game Button */}
          <button
            onClick={() => setIsNewGameModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>{t(lang, 'newGame')}</span>
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-2 sm:p-4 md:p-6 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-4 lg:gap-6">
        
        {/* Left Side / Center: Chessboard with Clocks and Eval Bar */}
        <div className="flex flex-col items-center w-full max-w-[560px]">
          
          {/* Top Player Status Bar (Clock & Captured pieces) */}
          <div className="w-full mb-2 flex flex-col gap-1.5">
            <ChessClock
              color={topColor}
              playerName={getPlayerLabel(topColor)}
              playerTitle={getPlayerTitle(topColor)}
              timeRemainingSeconds={topColor === 'w' ? whiteTime : blackTime}
              isActive={game.turn() === topColor && isInteractive}
              isUnlimited={TIME_CONTROLS.find(t => t.id === timeControlId)?.baseSeconds === 0}
            />
            <div className="px-1 flex items-center justify-between">
              <CapturedPieces
                color={topColor}
                capturedList={topColor === 'w' ? capturedWhite : capturedBlack}
                materialAdvantage={topColor === 'w' ? whiteMaterialDelta : blackMaterialDelta}
                pieceTheme={pieceTheme}
              />
              {isAiThinking && topColor !== playerColor && (
                <span className="text-[11px] text-amber-400 font-medium flex items-center gap-1 animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                  AI đang tính toán...
                </span>
              )}
            </div>
          </div>

          {/* Board Area with Vertical Eval Bar on Desktop */}
          <div className="relative flex items-center justify-center gap-3 w-full">
            {/* Desktop Vertical Eval Bar */}
            <div className="hidden sm:block h-[560px] max-h-[560px] py-1">
              <EvalBar
                score={evalScore}
                whiteWinChance={whiteWinChance}
                boardOrientation={boardOrientation}
              />
            </div>

            {/* The Chessboard */}
            <div className="flex-1 w-full flex justify-center">
              <Chessboard
                game={game}
                boardOrientation={boardOrientation}
                boardTheme={boardTheme}
                pieceTheme={pieceTheme}
                showCoordinates={showCoordinates}
                showLegalMoves={showLegalMoves}
                highlightLastMove={highlightLastMove}
                lastMove={lastMove}
                hintMove={hintMove}
                isInteractive={isInteractive}
                onMove={handleMakeMove}
              />
            </div>
          </div>

          {/* Mobile Horizontal Eval Bar */}
          <div className="w-full sm:hidden mt-2 px-1">
            <EvalBar
              score={evalScore}
              whiteWinChance={whiteWinChance}
              boardOrientation={boardOrientation}
              isHorizontal={true}
            />
          </div>

          {/* Bottom Player Status Bar (Clock & Captured pieces) */}
          <div className="w-full mt-2 flex flex-col gap-1.5">
            <div className="px-1 flex items-center justify-between">
              <CapturedPieces
                color={bottomColor}
                capturedList={bottomColor === 'w' ? capturedWhite : capturedBlack}
                materialAdvantage={bottomColor === 'w' ? whiteMaterialDelta : blackMaterialDelta}
                pieceTheme={pieceTheme}
              />
              {game.inCheck() && (
                <span className="text-xs font-black text-red-500 uppercase tracking-wider animate-pulse flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 fill-current" />
                  {t(lang, 'check')}
                </span>
              )}
            </div>
            <ChessClock
              color={bottomColor}
              playerName={getPlayerLabel(bottomColor)}
              playerTitle={getPlayerTitle(bottomColor)}
              timeRemainingSeconds={bottomColor === 'w' ? whiteTime : blackTime}
              isActive={game.turn() === bottomColor && isInteractive}
              isUnlimited={TIME_CONTROLS.find(t => t.id === timeControlId)?.baseSeconds === 0}
            />
          </div>
        </div>

        {/* Right Side: Move History, Tactical Tools & Control Panel */}
        <div className="w-full lg:w-[380px] flex flex-col gap-3.5 h-full min-h-[480px]">
          {/* Quick Stats Header */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-300">
                {mode === 'ai' ? `Chế độ: Đấu AI (${aiDifficulty}/5)` : 'Chế độ: 2 Người'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                {TIME_CONTROLS.find(t => t.id === timeControlId)?.name || 'Standard'}
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <GameControls
            onNewGame={() => setIsNewGameModalOpen(true)}
            onUndo={handleUndo}
            canUndo={moveHistory.length > 0}
            onHint={handleHint}
            onAskCoach={() => setIsCoachModalOpen(true)}
            onFlipBoard={() => setBoardOrientation(prev => (prev === 'w' ? 'b' : 'w'))}
            onResign={handleResign}
            onOfferDraw={handleOfferDraw}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
            gameMode={mode}
            isGameOver={!!gameResult}
            lang={lang}
          />

          {/* Move History Component */}
          <div className="flex-1 min-h-[300px]">
            <MoveHistory
              moves={moveHistory}
              currentMoveIndex={historyIndex}
              onSelectMove={handleSelectHistoryMove}
              lang={lang}
              onCopyFEN={handleCopyFEN}
              onCopyPGN={handleCopyPGN}
              fenCopied={fenCopied}
              pgnCopied={pgnCopied}
            />
          </div>
        </div>
      </main>

      {/* Modals */}
      <NewGameModal
        isOpen={isNewGameModalOpen}
        onClose={() => setIsNewGameModalOpen(false)}
        onStartGame={handleStartNewGame}
        lang={lang}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        boardTheme={boardTheme}
        onSelectBoardTheme={handleSelectBoardTheme}
        pieceTheme={pieceTheme}
        onSelectPieceTheme={handleSelectPieceTheme}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        showCoordinates={showCoordinates}
        onToggleCoordinates={handleToggleCoords}
        showLegalMoves={showLegalMoves}
        onToggleLegalMoves={handleToggleLegalMoves}
        highlightLastMove={highlightLastMove}
        onToggleHighlightLastMove={handleToggleHighlightLast}
        autoFlipBoard={autoFlipBoard}
        onToggleAutoFlipBoard={handleToggleAutoFlip}
        lang={lang}
        onSelectLang={handleSelectLang}
      />

      <GameOverModal
        isOpen={isGameOverModalOpen}
        result={gameResult}
        userColor={playerColor}
        onRematch={handleRematch}
        onNewGame={() => {
          setIsGameOverModalOpen(false);
          setIsNewGameModalOpen(true);
        }}
        onClose={() => setIsGameOverModalOpen(false)}
        lang={lang}
      />

      <CoachModal
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
        game={game}
        lang={lang}
      />
    </div>
  );
}
