import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { MovieCatalogService, MovieRecord } from './movieCatalogService.js';

export interface WatchlistItemRecord {
  id: string;
  user_id: string;
  movie_id: string;
  status: 'to_watch' | 'watched';
  added_at: string;
  movie?: MovieRecord;
}

export class WatchlistService {
  /**
   * Get user watchlist with joined movie details
   */
  public static getWatchlist(userId: string): WatchlistItemRecord[] {
    const rows = db.prepare(`
      SELECT * FROM watchlist WHERE user_id = ? ORDER BY added_at DESC
    `).all(userId) as any[];

    return rows.map(r => {
      const movie = MovieCatalogService.getMovieById(r.movie_id) || undefined;
      return {
        id: r.id,
        user_id: r.user_id,
        movie_id: r.movie_id,
        status: r.status,
        added_at: r.added_at,
        movie
      };
    });
  }

  /**
   * Add movie to watchlist
   */
  public static addToWatchlist(
    userId: string,
    movieId: string,
    status: 'to_watch' | 'watched' = 'to_watch'
  ): WatchlistItemRecord {
    // Check if already in watchlist
    const existing = db.prepare(`
      SELECT * FROM watchlist WHERE user_id = ? AND movie_id = ?
    `).get(userId, movieId) as any;

    if (existing) {
      const movie = MovieCatalogService.getMovieById(movieId) || undefined;
      return {
        id: existing.id,
        user_id: existing.user_id,
        movie_id: existing.movie_id,
        status: existing.status,
        added_at: existing.added_at,
        movie
      };
    }

    const id = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO watchlist (id, user_id, movie_id, status, added_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, userId, movieId, status, now);

    const movie = MovieCatalogService.getMovieById(movieId) || undefined;

    return {
      id,
      user_id: userId,
      movie_id: movieId,
      status,
      added_at: now,
      movie
    };
  }

  /**
   * Remove item from watchlist
   */
  public static removeFromWatchlist(userId: string, id: string): boolean {
    const result = db.prepare(`
      DELETE FROM watchlist WHERE id = ? AND user_id = ?
    `).run(id, userId);

    return result.changes > 0;
  }

  /**
   * Remove item by movie_id
   */
  public static removeByMovieId(userId: string, movieId: string): boolean {
    const result = db.prepare(`
      DELETE FROM watchlist WHERE movie_id = ? AND user_id = ?
    `).run(movieId, userId);

    return result.changes > 0;
  }

  /**
   * Update watchlist item status ('to_watch' | 'watched')
   */
  public static updateStatus(
    userId: string,
    id: string,
    status: 'to_watch' | 'watched'
  ): WatchlistItemRecord | null {
    db.prepare(`
      UPDATE watchlist SET status = ? WHERE id = ? AND user_id = ?
    `).run(status, id, userId);

    const updated = db.prepare(`
      SELECT * FROM watchlist WHERE id = ? AND user_id = ?
    `).get(id, userId) as any;

    if (!updated) return null;

    const movie = MovieCatalogService.getMovieById(updated.movie_id) || undefined;

    return {
      id: updated.id,
      user_id: updated.user_id,
      movie_id: updated.movie_id,
      status: updated.status,
      added_at: updated.added_at,
      movie
    };
  }
}
