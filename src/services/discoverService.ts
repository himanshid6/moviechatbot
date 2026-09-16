import { db } from '../db/database.js';
import { MovieCatalogService, MovieRecord } from './movieCatalogService.js';

export interface MoodPreset {
  id: string;
  label: string;
  emoji: string;
  tagline: string;
  description: string;
  seed_filters: {
    mood_tags?: string[];
    genre_tags?: string[];
    platform_filters?: string[];
    max_runtime_minutes?: number;
  };
  sample_movie_ids: string[];
  sample_movies?: MovieRecord[];
}

export class DiscoverService {
  /**
   * Get all curated mood presets
   */
  public static getMoodPresets(): MoodPreset[] {
    const rows = db.prepare('SELECT * FROM mood_presets').all() as any[];

    return rows.map(r => {
      const sampleIds = typeof r.sample_movie_ids === 'string' ? JSON.parse(r.sample_movie_ids) : r.sample_movie_ids;
      const sampleMovies = sampleIds
        .map((id: string) => MovieCatalogService.getMovieById(id))
        .filter(Boolean) as MovieRecord[];

      return {
        id: r.id,
        label: r.label,
        emoji: r.emoji,
        tagline: r.tagline,
        description: r.description,
        seed_filters: typeof r.seed_filters === 'string' ? JSON.parse(r.seed_filters) : r.seed_filters,
        sample_movie_ids: sampleIds,
        sample_movies: sampleMovies
      };
    });
  }

  /**
   * Get specific mood preset by ID
   */
  public static getMoodPresetById(id: string): MoodPreset | null {
    const row = db.prepare('SELECT * FROM mood_presets WHERE id = ?').get(id) as any;
    if (!row) return null;

    const sampleIds = typeof row.sample_movie_ids === 'string' ? JSON.parse(row.sample_movie_ids) : row.sample_movie_ids;
    const sampleMovies = sampleIds
      .map((mId: string) => MovieCatalogService.getMovieById(mId))
      .filter(Boolean) as MovieRecord[];

    return {
      id: row.id,
      label: row.label,
      emoji: row.emoji,
      tagline: row.tagline,
      description: row.description,
      seed_filters: typeof row.seed_filters === 'string' ? JSON.parse(row.seed_filters) : row.seed_filters,
      sample_movie_ids: sampleIds,
      sample_movies: sampleMovies
    };
  }
}
