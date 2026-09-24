import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const defaultDbPath = process.env.VERCEL
  ? path.join('/tmp', 'cinematch.db')
  : path.resolve(process.cwd(), 'cinematch.db');

const dbPath = process.env.DATABASE_PATH || defaultDbPath;
const dbDir = path.dirname(dbPath);

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db: Database.Database = new Database(dbPath);

// Enable WAL mode for high concurrency & performance
try {
  db.pragma('journal_mode = WAL');
} catch {
  // Ignore in environments where WAL is not supported
}
db.pragma('foreign_keys = ON');

const FALLBACK_SCHEMA_SQL = `
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    is_anonymous INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS preference_states (
    session_id TEXT PRIMARY KEY REFERENCES sessions(id) ON DELETE CASCADE,
    mood_tags TEXT NOT NULL DEFAULT '[]',
    genre_tags TEXT NOT NULL DEFAULT '[]',
    platform_filters TEXT NOT NULL DEFAULT '[]',
    max_runtime_minutes INTEGER,
    excluded_tags TEXT NOT NULL DEFAULT '[]',
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    quick_replies TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS movies (
    id TEXT PRIMARY KEY,
    tmdb_id INTEGER UNIQUE,
    title TEXT NOT NULL,
    year INTEGER NOT NULL,
    runtime_minutes INTEGER NOT NULL,
    genres TEXT NOT NULL DEFAULT '[]',
    moods TEXT NOT NULL DEFAULT '[]',
    overview TEXT NOT NULL,
    poster_url TEXT NOT NULL,
    backdrop_url TEXT,
    streaming_platforms TEXT NOT NULL DEFAULT '[]',
    rating REAL NOT NULL DEFAULT 0.0,
    director TEXT,
    cast_members TEXT NOT NULL DEFAULT '[]',
    quote TEXT,
    trailer_url TEXT
);

CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    message_id TEXT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    match_score INTEGER NOT NULL,
    reason_text TEXT NOT NULL,
    quote TEXT,
    rank INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS watchlist (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    movie_id TEXT NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'to_watch' CHECK(status IN ('to_watch', 'watched')),
    added_at TEXT NOT NULL DEFAULT (datetime('now')),
    UNIQUE(user_id, movie_id)
);

CREATE TABLE IF NOT EXISTS mood_presets (
    id TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    emoji TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    seed_filters TEXT NOT NULL DEFAULT '{}',
    sample_movie_ids TEXT NOT NULL DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_session_id ON recommendations(session_id);
CREATE INDEX IF NOT EXISTS idx_recommendations_message_id ON recommendations(message_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_movies_year ON movies(year);
CREATE INDEX IF NOT EXISTS idx_movies_rating ON movies(rating);
`;

export function initDatabase() {
  const schemaPath = path.resolve(process.cwd(), 'src', 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    db.exec(schemaSql);
  } else {
    db.exec(FALLBACK_SCHEMA_SQL);
  }
}

// Auto-initialize tables
initDatabase();

export default db;
