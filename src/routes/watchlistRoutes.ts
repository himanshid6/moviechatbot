import { Router, Request, Response } from 'express';
import { WatchlistService } from '../services/watchlistService.js';

export const watchlistRoutes = Router();

/**
 * Get user watchlist
 */
watchlistRoutes.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const items = WatchlistService.getWatchlist(userId);
    return res.json({ success: true, watchlist: items });
  } catch (err: any) {
    console.error('Error fetching watchlist:', err);
    return res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

/**
 * Add movie to watchlist
 */
watchlistRoutes.post('/', (req: Request, res: Response) => {
  try {
    const userId = req.body?.user_id || (req.headers['x-user-id'] as string);
    const movieId = req.body?.movie_id;
    const status = req.body?.status || 'to_watch';

    if (!userId || !movieId) {
      return res.status(400).json({ error: 'user_id and movie_id are required' });
    }

    const item = WatchlistService.addToWatchlist(userId, movieId, status);
    return res.status(201).json({ success: true, item });
  } catch (err: any) {
    console.error('Error adding to watchlist:', err);
    return res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

/**
 * Delete item from watchlist
 */
watchlistRoutes.delete('/:id', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || (req.headers['x-user-id'] as string);
    const itemId = req.params.id;

    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const deleted = WatchlistService.removeFromWatchlist(userId, itemId);
    if (!deleted) {
      // Also attempt deletion by movie_id in case client passed movie_id
      const byMovie = WatchlistService.removeByMovieId(userId, itemId);
      if (!byMovie) {
        return res.status(404).json({ error: 'Item not found in watchlist' });
      }
    }

    return res.json({ success: true, message: 'Item removed from watchlist' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete from watchlist' });
  }
});

/**
 * Update item status ('to_watch' | 'watched')
 */
watchlistRoutes.patch('/:id', (req: Request, res: Response) => {
  try {
    const userId = req.body?.user_id || (req.headers['x-user-id'] as string);
    const itemId = req.params.id;
    const status = req.body?.status;

    if (!userId || !status) {
      return res.status(400).json({ error: 'user_id and status are required' });
    }

    if (status !== 'to_watch' && status !== 'watched') {
      return res.status(400).json({ error: 'Status must be "to_watch" or "watched"' });
    }

    const updated = WatchlistService.updateStatus(userId, itemId, status);
    if (!updated) {
      return res.status(404).json({ error: 'Watchlist item not found' });
    }

    return res.json({ success: true, item: updated });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update watchlist item' });
  }
});
