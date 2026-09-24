import { Router, Request, Response } from 'express';
import { MovieCatalogService } from '../services/movieCatalogService.js';
import { db } from '../db/database.js';

export const movieRoutes = Router();

/**
 * Search movies by text query or filters
 */
movieRoutes.get('/search', (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string) || '';
    const limit = parseInt(req.query.limit as string) || 15;

    const results = MovieCatalogService.searchByQuery(q, limit);
    return res.json({ success: true, count: results.length, movies: results });
  } catch (err: any) {
    return res.status(500).json({ error: 'Search failed' });
  }
});

/**
 * Get movie by ID
 */
movieRoutes.get('/:id', (req: Request, res: Response) => {
  try {
    const movie = MovieCatalogService.getMovieById(req.params.id as string);
    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }
    return res.json({ success: true, movie });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get movie' });
  }
});

/**
 * Get recommendation detail by ID
 */
movieRoutes.get('/recommendation/:id', (req: Request, res: Response) => {
  try {
    const recId = req.params.id;
    const rec = db.prepare('SELECT * FROM recommendations WHERE id = ?').get(recId) as any;
    if (!rec) {
      return res.status(404).json({ error: 'Recommendation not found' });
    }

    const movie = MovieCatalogService.getMovieById(rec.movie_id);
    return res.json({
      success: true,
      recommendation: {
        ...rec,
        movie
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get recommendation' });
  }
});
