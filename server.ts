import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Helper to get GoogleGenAI client with standard aistudio-build User-Agent
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  };

  // Gemini AI Grandmaster Coach endpoint
  app.post('/api/coach', async (req: Request, res: Response) => {
    try {
      const { fen, pgn, turn, lang } = req.body;
      const ai = getAiClient();

      if (!ai) {
        return res.json({ commentary: null });
      }

      const prompt = `You are a world-class Chess Grandmaster and coach.
Analyze the following chess position:
- FEN: ${fen}
- PGN history: ${pgn || 'Starting moves'}
- Active player to move: ${turn}
- Language for response: ${lang === 'vi' ? 'Vietnamese' : 'English'}

Provide a concise, insightful Grandmaster analysis in 3-4 sentences:
1. Explain who has the strategic advantage and why (space control, piece activity, king safety).
2. Point out key tactical threats or opportunities for both players.
3. Recommend the best concrete plan for the player to move.
Keep the tone encouraging, professional, and tactical.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });

      return res.json({ commentary: response.text });
    } catch (err: unknown) {
      console.warn('Gemini coach analysis fallback:', err);
      return res.json({ commentary: null });
    }
  });

  // Real-time Voice & Text Dialogue Endpoint (Đàm thoại cờ vua trực tiếp)
  app.post('/api/dialogue', async (req: Request, res: Response) => {
    try {
      const { userMessage, history, fen, pgn, turn, lang } = req.body;
      const ai = getAiClient();

      if (!ai) {
        // Fallback response if API key is not present
        const fallbackReply = lang === 'vi'
          ? `Tôi đã ghi nhận câu hỏi của bạn về thế cờ: "${userMessage}". Hiện tại ở vị trí này, lượt đi thuộc về ${turn === 'White' ? 'Trắng' : 'Đen'}. Bạn nên ưu tiên bảo vệ vua, kết nối các quân nặng và tìm ô đứng tích cực cho mã và tượng!`
          : `I hear your question: "${userMessage}". It is currently ${turn}'s turn. Prioritize king safety, active piece development, and fighting for key central squares!`;
        return res.json({ reply: fallbackReply });
      }

      const conversationContext = Array.isArray(history) && history.length > 0
        ? history.slice(-6).map((h: { role: string; text: string }) => `${h.role === 'user' ? 'User' : 'Grandmaster'}: ${h.text}`).join('\n')
        : 'No previous messages.';

      const systemPrompt = `You are an elite, articulate Chess Grandmaster and personal mentor engaging in a live voice dialogue with a chess student during an active game.
Current Board Position:
- FEN: ${fen}
- PGN: ${pgn || 'Start of game'}
- Current turn to move: ${turn}
- Preferred language: ${lang === 'vi' ? 'Vietnamese' : 'English'}

Recent conversation:
${conversationContext}

User just said/asked: "${userMessage}"

Instructions for your spoken dialogue response:
1. Answer directly, naturally, and warmly as if speaking face-to-face across the chess board.
2. Address their specific question (e.g. evaluating an idea, proposing a move, checking threats, explaining opening/endgame principles).
3. Mention concrete square names (like e4, d5, c3) or tactical ideas (pins, skewers, outposts) concisely so it is very clear when read aloud.
4. Keep the answer concise (2 to 4 sentences max) so it sounds crisp and engaging in voice conversation.
5. Respond in ${lang === 'vi' ? 'natural Vietnamese' : 'natural English'}.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: systemPrompt
      });

      return res.json({ reply: response.text });
    } catch (err: unknown) {
      console.warn('Dialogue error:', err);
      const fallback = req.body.lang === 'vi'
        ? 'Tôi đang quan sát thế trận của bạn. Hãy chú ý kiểm soát các ô trung tâm và đừng để hở các đường chéo quanh vua!'
        : 'Focus on piece activity and king safety in this critical position!';
      return res.json({ reply: fallback });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Development mode with Vite
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`GrandMaster Chess Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
