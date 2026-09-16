/**
 * CineMatch UI Component Renderers (Native ES Module)
 */

export function renderPlatformBadges(platforms = []) {
  if (!platforms || platforms.length === 0) return '';
  return platforms.map(p => {
    const lower = p.toLowerCase();
    let badgeClass = 'platform-other';
    if (lower.includes('netflix')) badgeClass = 'platform-netflix';
    else if (lower.includes('prime')) badgeClass = 'platform-prime';
    else if (lower.includes('max') || lower.includes('hbo')) badgeClass = 'platform-max';
    else if (lower.includes('disney')) badgeClass = 'platform-disney';
    else if (lower.includes('apple')) badgeClass = 'platform-apple';
    else if (lower.includes('hulu')) badgeClass = 'platform-hulu';
    else if (lower.includes('paramount')) badgeClass = 'platform-paramount';

    return `<span class="platform-badge ${badgeClass}">${p}</span>`;
  }).join('');
}

export function renderPillChips(prefState) {
  if (!prefState) return '<span class="text-muted" style="font-size: 0.75rem;">No active filters</span>';

  let html = '';
  const moods = prefState.mood_tags || [];
  const genres = prefState.genre_tags || [];
  const platforms = prefState.platform_filters || [];
  const runtime = prefState.max_runtime_minutes;

  moods.forEach(m => {
    html += `<span class="pill-chip pill-mood">✨ ${m}</span>`;
  });

  genres.forEach(g => {
    html += `<span class="pill-chip pill-genre">🎬 ${g}</span>`;
  });

  platforms.forEach(p => {
    html += `<span class="pill-chip pill-platform">📺 ${p}</span>`;
  });

  if (runtime) {
    html += `<span class="pill-chip pill-runtime">⏱️ &lt; ${runtime}m</span>`;
  }

  if (!html) {
    html = '<span style="font-size: 0.75rem; color: #64748b;">Any vibe / All platforms</span>';
  }

  return html;
}

export function renderRecommendationCard(rec, isInWatchlist = false) {
  const movie = rec.movie || {};
  const poster = movie.poster_url || 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg';
  const platformsHtml = renderPlatformBadges(movie.streaming_platforms);
  const matchScore = rec.match_score || 90;
  const quote = rec.quote || movie.quote;

  return `
    <div class="movie-card" data-movie-id="${rec.movie_id}">
      <div class="card-poster-container">
        <img src="${poster}" alt="${movie.title || 'Movie'}" class="card-poster" loading="lazy" />
        <div class="card-poster-overlay"></div>
        <div class="match-badge">${matchScore}% Match</div>
        <button class="card-watchlist-btn ${isInWatchlist ? 'in-watchlist' : ''}" 
                data-action="toggle-watchlist" 
                data-movie-id="${rec.movie_id}" 
                title="${isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}">
          ${isInWatchlist ? '✓' : '+'}
        </button>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h4 class="card-title">${movie.title || 'Unknown Title'}</h4>
          <span class="card-meta">${movie.year || ''} • ${movie.runtime_minutes ? movie.runtime_minutes + 'm' : ''}</span>
        </div>
        <div class="platform-badges">
          ${platformsHtml}
        </div>
        <div class="card-reason">
          ${rec.reason_text || movie.overview || ''}
        </div>
        ${quote ? `<div class="card-quote">“${quote}”</div>` : ''}
        <div class="card-footer">
          <span style="font-size: 0.72rem; color: #94a3b8;">★ ${movie.rating ? Number(movie.rating).toFixed(1) : '8.0'} Rating</span>
          <button class="card-detail-btn" data-action="view-detail" data-movie-id="${rec.movie_id}">
            Details & Trailer ↗
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderQuickReplies(chips = []) {
  if (!chips || chips.length === 0) return '';
  const chipsHtml = chips.map(c => `
    <button class="quick-chip" data-prompt="${c}">${c}</button>
  `).join('');

  return `<div class="quick-replies-container">${chipsHtml}</div>`;
}

export function renderMessage(msg, watchlistMovieIds = new Set()) {
  const isUser = msg.role === 'user';
  const roleClass = isUser ? 'user' : 'assistant';
  const avatar = isUser ? '👤' : '🍿';

  let recsHtml = '';
  if (msg.recommendations && msg.recommendations.length > 0) {
    const cards = msg.recommendations.map(r => 
      renderRecommendationCard(r, watchlistMovieIds.has(r.movie_id))
    ).join('');
    recsHtml = `<div class="recommendations-grid">${cards}</div>`;
  }

  const quickRepliesHtml = !isUser && msg.quick_replies ? renderQuickReplies(msg.quick_replies) : '';

  return `
    <div class="message-row ${roleClass}" data-msg-id="${msg.id || ''}">
      <div class="message-avatar ${roleClass}">${avatar}</div>
      <div style="display: flex; flex-direction: column; max-width: 100%; flex: 1;">
        <div class="message-bubble">
          ${msg.content}
        </div>
        ${recsHtml}
        ${quickRepliesHtml}
      </div>
    </div>
  `;
}

export function renderWatchlistCard(item) {
  const movie = item.movie || {};
  const isWatched = item.status === 'watched';
  const poster = movie.poster_url || 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg';
  const platformsHtml = renderPlatformBadges(movie.streaming_platforms);

  return `
    <div class="movie-card" data-watchlist-id="${item.id}" style="opacity: ${isWatched ? 0.75 : 1};">
      <div class="card-poster-container" style="height: 180px;">
        <img src="${poster}" alt="${movie.title}" class="card-poster" loading="lazy" />
        <div class="card-poster-overlay"></div>
        <button class="card-watchlist-btn in-watchlist" data-action="remove-watchlist" data-item-id="${item.id}" title="Remove from Watchlist">
          ✕
        </button>
      </div>
      <div class="card-body">
        <div class="card-title-row">
          <h4 class="card-title">${movie.title}</h4>
          <span class="card-meta">${movie.year} • ${movie.runtime_minutes}m</span>
        </div>
        <div class="platform-badges">
          ${platformsHtml}
        </div>
        <div style="margin-top: auto; display: flex; align-items: center; justify-content: space-between; padding-top: 0.5rem;">
          <button class="filter-chip ${isWatched ? 'active' : ''}" data-action="toggle-status" data-item-id="${item.id}" data-current-status="${item.status}" style="font-size: 0.72rem;">
            ${isWatched ? '✓ Watched' : 'To Watch'}
          </button>
          <button class="card-detail-btn" data-action="view-detail" data-movie-id="${movie.id}">
            Info ↗
          </button>
        </div>
      </div>
    </div>
  `;
}

export function renderDiscoverCard(preset) {
  const samplePosters = (preset.sample_movies || []).slice(0, 3).map(m => `
    <img src="${m.poster_url}" alt="${m.title}" class="discover-poster-thumb" />
  `).join('');

  return `
    <div class="discover-card" data-preset-id="${preset.id}">
      <div class="discover-header">
        <div class="discover-emoji">${preset.emoji}</div>
        <div>
          <h3 class="discover-title">${preset.label}</h3>
          <span class="discover-tagline">${preset.tagline}</span>
        </div>
      </div>
      <p class="discover-desc">${preset.description}</p>
      <div class="discover-posters">
        ${samplePosters}
      </div>
      <button class="spark-btn" style="margin-top: 0.5rem; justify-content: center; font-size: 0.8rem;" data-action="explore-preset" data-preset-id="${preset.id}">
        Explore This Vibe ✨
      </button>
    </div>
  `;
}

export function renderHistoryCard(session) {
  const dateStr = new Date(session.updated_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div class="history-card" data-session-id="${session.id}">
      <div class="history-info">
        <h4 class="history-title">${session.title || 'Movie Discovery Thread'}</h4>
        <div class="history-meta">
          <span>💬 ${session.message_count || 0} messages</span>
          <span>•</span>
          <span>${dateStr}</span>
        </div>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <button class="edit-pills-btn" data-action="resume-session" data-session-id="${session.id}">
          Resume ↗
        </button>
        <button class="edit-pills-btn" data-action="delete-session" data-session-id="${session.id}" style="color: #f87171;">
          ✕
        </button>
      </div>
    </div>
  `;
}
