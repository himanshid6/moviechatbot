import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';
import { MovieCatalogService, MovieRecord } from './movieCatalogService.js';

export interface PreferenceState {
  session_id: string;
  mood_tags: string[];
  genre_tags: string[];
  platform_filters: string[];
  max_runtime_minutes: number | null;
  excluded_tags: string[];
  updated_at: string;
}

export interface RecommendationRecord {
  id: string;
  session_id: string;
  message_id: string;
  movie_id: string;
  match_score: number;
  reason_text: string;
  quote?: string;
  rank: number;
  created_at: string;
  movie?: MovieRecord;
}

export interface MessageRecord {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  quick_replies: string[];
  created_at: string;
  recommendations?: RecommendationRecord[];
}

export interface SessionRecord {
  id: string;
  user_id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
  last_message?: string;
  preference_state?: PreferenceState;
}

export class ConversationService {
  /**
   * Create a new user session and initialize default PreferenceState
   */
  public static createSession(userId: string, initialTitle: string = 'New CineMatch Thread'): SessionRecord {
    const sessionId = uuidv4();
    const now = new Date().toISOString();

    const insertSession = db.prepare(`
      INSERT INTO sessions (id, user_id, title, status, created_at, updated_at)
      VALUES (?, ?, ?, 'active', ?, ?)
    `);

    const insertPreferences = db.prepare(`
      INSERT INTO preference_states (
        session_id, mood_tags, genre_tags, platform_filters,
        max_runtime_minutes, excluded_tags, updated_at
      ) VALUES (?, '[]', '[]', '[]', NULL, '[]', ?)
    `);

    const transaction = db.transaction(() => {
      insertSession.run(sessionId, userId, initialTitle, now, now);
      insertPreferences.run(sessionId, now);
    });

    transaction();

    return {
      id: sessionId,
      user_id: userId,
      title: initialTitle,
      status: 'active',
      created_at: now,
      updated_at: now,
      preference_state: {
        session_id: sessionId,
        mood_tags: [],
        genre_tags: [],
        platform_filters: [],
        max_runtime_minutes: null,
        excluded_tags: [],
        updated_at: now
      }
    };
  }

  /**
   * Get session by ID
   */
  public static getSession(sessionId: string): SessionRecord | null {
    const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(sessionId) as any;
    if (!session) return null;

    const prefs = this.getPreferenceState(sessionId);
    return {
      ...session,
      preference_state: prefs || undefined
    };
  }

  /**
   * List sessions for a user (for History tab)
   */
  public static listUserSessions(userId: string): SessionRecord[] {
    const sessions = db.prepare(`
      SELECT s.*, 
        (SELECT COUNT(*) FROM messages m WHERE m.session_id = s.id) as message_count,
        (SELECT content FROM messages m WHERE m.session_id = s.id ORDER BY m.created_at DESC LIMIT 1) as last_message
      FROM sessions s
      WHERE s.user_id = ?
      ORDER BY s.updated_at DESC
    `).all(userId) as any[];

    return sessions.map(s => ({
      ...s,
      preference_state: this.getPreferenceState(s.id) || undefined
    }));
  }

  /**
   * Delete a session
   */
  public static deleteSession(sessionId: string): boolean {
    const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return result.changes > 0;
  }

  /**
   * Update session title
   */
  public static updateSessionTitle(sessionId: string, title: string) {
    db.prepare(`UPDATE sessions SET title = ?, updated_at = datetime('now') WHERE id = ?`).run(title, sessionId);
  }

  /**
   * Get PreferenceState for a session
   */
  public static getPreferenceState(sessionId: string): PreferenceState | null {
    const row = db.prepare('SELECT * FROM preference_states WHERE session_id = ?').get(sessionId) as any;
    if (!row) return null;

    return {
      session_id: row.session_id,
      mood_tags: typeof row.mood_tags === 'string' ? JSON.parse(row.mood_tags) : row.mood_tags,
      genre_tags: typeof row.genre_tags === 'string' ? JSON.parse(row.genre_tags) : row.genre_tags,
      platform_filters: typeof row.platform_filters === 'string' ? JSON.parse(row.platform_filters) : row.platform_filters,
      max_runtime_minutes: row.max_runtime_minutes,
      excluded_tags: typeof row.excluded_tags === 'string' ? JSON.parse(row.excluded_tags) : row.excluded_tags,
      updated_at: row.updated_at
    };
  }

  /**
   * Update PreferenceState
   */
  public static updatePreferenceState(sessionId: string, updates: Partial<PreferenceState>): PreferenceState {
    const current = this.getPreferenceState(sessionId) || {
      session_id: sessionId,
      mood_tags: [],
      genre_tags: [],
      platform_filters: [],
      max_runtime_minutes: null,
      excluded_tags: [],
      updated_at: new Date().toISOString()
    };

    const nextState: PreferenceState = {
      session_id: sessionId,
      mood_tags: updates.mood_tags ?? current.mood_tags,
      genre_tags: updates.genre_tags ?? current.genre_tags,
      platform_filters: updates.platform_filters ?? current.platform_filters,
      max_runtime_minutes: updates.max_runtime_minutes !== undefined ? updates.max_runtime_minutes : current.max_runtime_minutes,
      excluded_tags: updates.excluded_tags ?? current.excluded_tags,
      updated_at: new Date().toISOString()
    };

    db.prepare(`
      INSERT INTO preference_states (
        session_id, mood_tags, genre_tags, platform_filters,
        max_runtime_minutes, excluded_tags, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        mood_tags = excluded.mood_tags,
        genre_tags = excluded.genre_tags,
        platform_filters = excluded.platform_filters,
        max_runtime_minutes = excluded.max_runtime_minutes,
        excluded_tags = excluded.excluded_tags,
        updated_at = excluded.updated_at
    `).run(
      sessionId,
      JSON.stringify(nextState.mood_tags),
      JSON.stringify(nextState.genre_tags),
      JSON.stringify(nextState.platform_filters),
      nextState.max_runtime_minutes,
      JSON.stringify(nextState.excluded_tags),
      nextState.updated_at
    );

    // Also update session updated_at
    db.prepare(`UPDATE sessions SET updated_at = datetime('now') WHERE id = ?`).run(sessionId);

    return nextState;
  }

  /**
   * Get message history with recommendations
   */
  public static getMessages(sessionId: string): MessageRecord[] {
    const msgRows = db.prepare(`
      SELECT * FROM messages WHERE session_id = ? ORDER BY created_at ASC
    `).all(sessionId) as any[];

    const recRows = db.prepare(`
      SELECT * FROM recommendations WHERE session_id = ? ORDER BY rank ASC
    `).all(sessionId) as any[];

    // Group recommendations by message_id
    const recMap = new Map<string, RecommendationRecord[]>();
    for (const r of recRows) {
      const movie = MovieCatalogService.getMovieById(r.movie_id) || undefined;
      const recItem: RecommendationRecord = {
        id: r.id,
        session_id: r.session_id,
        message_id: r.message_id,
        movie_id: r.movie_id,
        match_score: r.match_score,
        reason_text: r.reason_text,
        quote: r.quote,
        rank: r.rank,
        created_at: r.created_at,
        movie
      };

      if (!recMap.has(r.message_id)) {
        recMap.set(r.message_id, []);
      }
      recMap.get(r.message_id)!.push(recItem);
    }

    return msgRows.map(m => ({
      id: m.id,
      session_id: m.session_id,
      role: m.role,
      content: m.content,
      quick_replies: typeof m.quick_replies === 'string' ? JSON.parse(m.quick_replies) : m.quick_replies,
      created_at: m.created_at,
      recommendations: recMap.get(m.id) || []
    }));
  }

  /**
   * Add message to session
   */
  public static addMessage(
    sessionId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    quickReplies: string[] = []
  ): MessageRecord {
    const messageId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO messages (id, session_id, role, content, quick_replies, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      messageId,
      sessionId,
      role,
      content,
      JSON.stringify(quickReplies),
      now
    );

    db.prepare(`UPDATE sessions SET updated_at = datetime('now') WHERE id = ?`).run(sessionId);

    return {
      id: messageId,
      session_id: sessionId,
      role,
      content,
      quick_replies: quickReplies,
      created_at: now,
      recommendations: []
    };
  }

  /**
   * Save recommendations linked to a message
   */
  public static saveRecommendations(
    sessionId: string,
    messageId: string,
    recs: Array<{
      movieId: string;
      matchScore: number;
      reasonText: string;
      quote?: string;
      rank: number;
    }>
  ): RecommendationRecord[] {
    const insertRec = db.prepare(`
      INSERT INTO recommendations (
        id, session_id, message_id, movie_id, match_score, reason_text, quote, rank, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const results: RecommendationRecord[] = [];
    const now = new Date().toISOString();

    const transaction = db.transaction(() => {
      for (const r of recs) {
        const recId = uuidv4();
        insertRec.run(
          recId,
          sessionId,
          messageId,
          r.movieId,
          r.matchScore,
          r.reasonText,
          r.quote || null,
          r.rank,
          now
        );
        const movie = MovieCatalogService.getMovieById(r.movieId) || undefined;
        results.push({
          id: recId,
          session_id: sessionId,
          message_id: messageId,
          movie_id: r.movieId,
          match_score: r.matchScore,
          reason_text: r.reasonText,
          quote: r.quote,
          rank: r.rank,
          created_at: now,
          movie
        });
      }
    });

    transaction();
    return results;
  }
}
