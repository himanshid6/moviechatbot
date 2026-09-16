# 🍿 CineMatch — AI Movie Recommendation Companion

> A conversational AI movie discovery companion that turns natural language mood, vibe, genre, and constraint prompts into real, accurate, non-hallucinated movie recommendations with match scores, streaming availability, runtime, and personalized "Why it matches" reasoning.

![CineMatch Preview](https://raw.githubusercontent.com/himanshid6/moviechatbot/main/public/preview.png) *(or run locally)*

---

## ✨ Features

- **🛡️ Zero-Hallucination Guarantee**: All recommendations are strictly selected from verified movie catalog candidates with accurate runtimes, posters, genres, and streaming platform badges (Netflix, Prime Video, Max, Disney+, Apple TV+, Hulu, Paramount+).
- **⚡ Real-Time Streaming (SSE)**: Conversational assistant replies stream token-by-token with Server-Sent Events (`text/event-stream`).
- **🎯 Live Preference Pills & Filter Editor**: Active constraints (`mood_tags`, `genre_tags`, `platform_filters`, `max_runtime_minutes`) are displayed live on the session bar and can be edited in a dedicated customization modal.
- **🔄 Multi-Turn Refinements**: Quick-reply chips (*"Under 90 mins"*, *"Only show Netflix"*, *"Turn up the tension"*, *"Something lighter"*) allow rapid filter updates without losing conversational context.
- **🧭 Discover Mood Presets**: 6 curated collections (*Late Night Noir*, *Mind-Bending Realities*, *Cozy Sunday Wholesome*, *High-Octane Adrenaline*, *Sharp Wit & Dark Satire*, *Atmospheric Dread*).
- **🔖 Persistent Watchlist**: Full CRUD with *To Watch* / *Watched* status filters, persisted in SQLite.
- **🕒 Conversation History**: Jump back into any previous session with auto-summarized titles.
- **✨ Mood Spark**: Instant surprise movie recommendation generator with one click.
- **🤖 Dual-Engine Support**: Seamlessly integrates with Google Gemini API / OpenAI API, with a built-in semantic ranking fallback engine that runs immediately with zero external setup.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Better-SQLite3 (WAL mode), UUID, TypeScript / TSX
- **Frontend**: Glassmorphic modern dark theme, Vanilla CSS3 with custom variables & micro-animations, native ES6 modules
- **AI & Data Layer**: Google Gemini API integration (`@google/genai`), TMDb API catalog caching, and deterministic candidate filtering

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(Optional: Add `GEMINI_API_KEY` for Google Gemini integration or `TMDB_API_KEY` for live TMDb enrichment)*

### 3. Seed Movie Catalog
```bash
npm run seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🧪 Running Automated Tests

Run the full end-to-end API test suite:
```bash
npm test
```

---

## 📡 API Endpoints

- `POST /api/auth/anonymous`: Anonymous session issuance
- `POST /api/sessions`: Create new discovery session
- `GET /api/sessions`: List user sessions (History)
- `GET /api/sessions/:id/messages`: Full message history
- `POST /api/sessions/:id/messages?stream=true`: Real-time SSE streaming chat & recommendations
- `PATCH /api/sessions/:id/preferences`: Update active filter pills directly
- `POST /api/sessions/:id/surprise`: Mood Spark instant recommendation
- `GET /api/watchlist`: List saved user watchlist
- `POST /api/watchlist`: Add movie to watchlist
- `PATCH /api/watchlist/:id`: Toggle watched/to_watch status
- `DELETE /api/watchlist/:id`: Remove from watchlist
- `GET /api/discover/moods`: Curated mood presets list
- `GET /api/movies/:id`: Single movie details & trailer links

---

## 📄 License

MIT © CineMatch
