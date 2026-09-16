import { db } from '../db/database.js';

export interface MovieRecord {
  id: string;
  tmdb_id?: number;
  title: string;
  year: number;
  runtime_minutes: number;
  genres: string[];
  moods: string[];
  overview: string;
  poster_url: string;
  backdrop_url?: string;
  streaming_platforms: string[];
  rating: number;
  director?: string;
  cast_members: string[];
  quote?: string;
  trailer_url?: string;
}

export interface CatalogFilterOptions {
  mood_tags?: string[];
  genre_tags?: string[];
  platform_filters?: string[];
  max_runtime_minutes?: number;
  excluded_tags?: string[];
  query?: string;
  limit?: number;
}

function parseMovieRow(row: any): MovieRecord {
  return {
    id: row.id,
    tmdb_id: row.tmdb_id,
    title: row.title,
    year: row.year,
    runtime_minutes: row.runtime_minutes,
    genres: typeof row.genres === 'string' ? JSON.parse(row.genres) : (row.genres || []),
    moods: typeof row.moods === 'string' ? JSON.parse(row.moods) : (row.moods || []),
    overview: row.overview,
    poster_url: row.poster_url,
    backdrop_url: row.backdrop_url,
    streaming_platforms: typeof row.streaming_platforms === 'string' ? JSON.parse(row.streaming_platforms) : (row.streaming_platforms || []),
    rating: row.rating,
    director: row.director,
    cast_members: typeof row.cast_members === 'string' ? JSON.parse(row.cast_members) : (row.cast_members || []),
    quote: row.quote,
    trailer_url: row.trailer_url
  };
}

export class MovieCatalogService {
  /**
   * Get movie by ID
   */
  public static getMovieById(id: string): MovieRecord | null {
    const row = db.prepare('SELECT * FROM movies WHERE id = ?').get(id);
    if (!row) return null;
    return parseMovieRow(row);
  }

  /**
   * Search and filter verified movie catalog
   */
  public static searchCatalog(options: CatalogFilterOptions): MovieRecord[] {
    const allRows = db.prepare('SELECT * FROM movies ORDER BY rating DESC').all();
    let movies = allRows.map(parseMovieRow);

    // Filter by max runtime
    if (options.max_runtime_minutes && options.max_runtime_minutes > 0) {
      movies = movies.filter(m => m.runtime_minutes <= options.max_runtime_minutes!);
    }

    // Filter by platform filters
    if (options.platform_filters && options.platform_filters.length > 0) {
      const targetPlatforms = options.platform_filters.map(p => p.toLowerCase());
      movies = movies.filter(m => 
        m.streaming_platforms.some(sp => 
          targetPlatforms.some(tp => sp.toLowerCase().includes(tp) || tp.includes(sp.toLowerCase()))
        )
      );
    }

    // Filter by genre tags
    if (options.genre_tags && options.genre_tags.length > 0) {
      const targetGenres = options.genre_tags.map(g => g.toLowerCase());
      movies = movies.filter(m => 
        m.genres.some(g => targetGenres.includes(g.toLowerCase()))
      );
    }

    // Excluded tags
    if (options.excluded_tags && options.excluded_tags.length > 0) {
      const excluded = options.excluded_tags.map(e => e.toLowerCase());
      movies = movies.filter(m => 
        !m.genres.some(g => excluded.includes(g.toLowerCase())) &&
        !m.moods.some(mood => excluded.includes(mood.toLowerCase()))
      );
    }

    // Keyword / Text search
    if (options.query && options.query.trim()) {
      const q = options.query.toLowerCase().trim();
      movies = movies.filter(m => 
        m.title.toLowerCase().includes(q) ||
        m.overview.toLowerCase().includes(q) ||
        (m.director && m.director.toLowerCase().includes(q)) ||
        m.moods.some(mood => mood.toLowerCase().includes(q)) ||
        m.genres.some(g => g.toLowerCase().includes(q))
      );
    }

    // Score based on mood alignment if mood_tags provided
    if (options.mood_tags && options.mood_tags.length > 0) {
      const moods = options.mood_tags.map(m => m.toLowerCase());
      movies.sort((a, b) => {
        const scoreA = a.moods.filter(m => moods.includes(m.toLowerCase())).length;
        const scoreB = b.moods.filter(m => moods.includes(m.toLowerCase())).length;
        if (scoreB !== scoreA) return scoreB - scoreA;
        return b.rating - a.rating;
      });
    }

    const limit = options.limit || 20;
    return movies.slice(0, limit);
  }

  /**
   * Get candidate list for LLM recommendation grounding
   */
  public static getCandidatesForRecommendation(filters: CatalogFilterOptions): MovieRecord[] {
    // First try strict match
    let candidates = this.searchCatalog({ ...filters, limit: 15 });
    
    // If fewer than 4 candidates found, loosen genre/mood filter while keeping runtime and platform constraints
    if (candidates.length < 4) {
      const fallbackCandidates = this.searchCatalog({
        platform_filters: filters.platform_filters,
        max_runtime_minutes: filters.max_runtime_minutes,
        limit: 15
      });

      const existingIds = new Set(candidates.map(c => c.id));
      for (const fallback of fallbackCandidates) {
        if (!existingIds.has(fallback.id)) {
          candidates.push(fallback);
          existingIds.add(fallback.id);
        }
      }
    }

    // If still empty (e.g. strict platform was too tight), return top rated
    if (candidates.length === 0) {
      candidates = this.searchCatalog({ limit: 10 });
    }

    return candidates;
  }

  /**
   * Search by query for general search UI
   */
  public static searchByQuery(query: string, limit: number = 10): MovieRecord[] {
    return this.searchCatalog({ query, limit });
  }
}
