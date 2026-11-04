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

  // Gemini AI Grandmaster Coach endpoint
  app.post('/api/coach', async (req: Request, res: Response) => {
    try {
      const { fen, pgn, turn, lang } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.json({ commentary: null });
      }

      const ai = new GoogleGenAI({ apiKey });
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
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      return res.json({ commentary: response.text });
    } catch (err: unknown) {
      console.warn('Gemini coach analysis fallback:', err);
      return res.json({ commentary: null });
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
