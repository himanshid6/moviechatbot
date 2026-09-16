import express, { Request, Response } from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { initDatabase } from './db/database.js';
import { authRoutes } from './routes/authRoutes.js';
import { sessionRoutes } from './routes/sessionRoutes.js';
import { watchlistRoutes } from './routes/watchlistRoutes.js';
import { discoverRoutes } from './routes/discoverRoutes.js';
import { movieRoutes } from './routes/movieRoutes.js';
import { LLMService } from './services/llmService.js';
import { seedDatabase } from './db/seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize DB schema & ensure initial seed
initDatabase();
seedDatabase();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from public
const publicDir = path.resolve(process.cwd(), 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/discover', discoverRoutes);
app.use('/api/movies', movieRoutes);

// Config & Capabilities endpoint
app.get('/api/config', (_req: Request, res: Response) => {
  res.json({
    name: 'CineMatch API',
    version: '1.0.0',
    llm_connected: LLMService.isLLMAvailable(),
    supported_platforms: [
      'Netflix',
      'Prime Video',
      'Max',
      'Disney+',
      'Apple TV+',
      'Hulu',
      'Paramount+'
    ],
    supported_genres: [
      'Sci-Fi',
      'Thriller',
      'Comedy',
      'Drama',
      'Action',
      'Horror',
      'Romance',
      'Animation',
      'Mystery',
      'Crime',
      'Adventure'
    ],
    popular_moods: [
      'mind-bending',
      'dark comedy',
      'wholesome',
      'atmospheric',
      'tense',
      'adrenaline',
      'witty',
      'philosophical',
      'nostalgic'
    ]
  });
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Fallback for SPA routing
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🎬 CineMatch Server running at http://localhost:${PORT}`);
    console.log(`✨ LLM Active: ${LLMService.isLLMAvailable() ? 'External LLM Enabled' : 'Semantic Ranker (Built-in)'}`);
  });
}

export default app;
