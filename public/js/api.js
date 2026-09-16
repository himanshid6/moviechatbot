/**
 * CineMatch API Client (Native ES Module)
 */

export class CineMatchAPI {
  static userIdKey = 'cinematch_user_id';

  static getUserId() {
    let uid = localStorage.getItem(this.userIdKey);
    if (!uid) {
      uid = 'user_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem(this.userIdKey, uid);
    }
    return uid;
  }

  static async initUser() {
    const localUid = this.getUserId();
    try {
      const res = await fetch('/api/auth/anonymous', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: localUid })
      });
      const data = await res.json();
      if (data.user) {
        localStorage.setItem(this.userIdKey, data.user.id);
        return data.user;
      }
    } catch (e) {
      console.warn('Using local anonymous user ID');
    }
    return { id: localUid, display_name: 'MovieFan' };
  }

  static async createSession(title) {
    const userId = this.getUserId();
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ user_id: userId, title })
    });
    return res.json();
  }

  static async listSessions() {
    const userId = this.getUserId();
    const res = await fetch(`/api/sessions?user_id=${userId}`, {
      headers: { 'x-user-id': userId }
    });
    return res.json();
  }

  static async getSessionMessages(sessionId) {
    const res = await fetch(`/api/sessions/${sessionId}/messages`);
    return res.json();
  }

  static async updatePreferences(sessionId, updates) {
    const res = await fetch(`/api/sessions/${sessionId}/preferences`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    return res.json();
  }

  static async surpriseMe(sessionId) {
    const res = await fetch(`/api/sessions/${sessionId}/surprise`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    return res.json();
  }

  static async deleteSession(sessionId) {
    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: 'DELETE'
    });
    return res.json();
  }

  /**
   * Stream message using Server-Sent Events (SSE)
   */
  static async sendMessageStream(sessionId, content, callbacks) {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/messages?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok || !response.body) {
        throw new Error(`Streaming failed with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const block of lines) {
          if (!block.trim()) continue;
          const eventMatch = block.match(/^event:\s*(\w+)/m);
          const dataMatch = block.match(/^data:\s*(.+)$/m);

          const eventType = eventMatch ? eventMatch[1] : 'message';
          let eventData = {};
          if (dataMatch) {
            try {
              eventData = JSON.parse(dataMatch[1]);
            } catch (e) {
              eventData = { raw: dataMatch[1] };
            }
          }

          if (eventType === 'status' && callbacks.onStatus) {
            callbacks.onStatus(eventData.message);
          } else if (eventType === 'token' && callbacks.onToken) {
            callbacks.onToken(eventData.chunk);
          } else if (eventType === 'done' && callbacks.onDone) {
            callbacks.onDone(eventData);
          } else if (eventType === 'error' && callbacks.onError) {
            callbacks.onError(eventData.error);
          }
        }
      }
    } catch (err) {
      if (callbacks.onError) callbacks.onError(err);
    }
  }

  // Watchlist API
  static async getWatchlist() {
    const userId = this.getUserId();
    const res = await fetch(`/api/watchlist?user_id=${userId}`, {
      headers: { 'x-user-id': userId }
    });
    return res.json();
  }

  static async addToWatchlist(movieId, status = 'to_watch') {
    const userId = this.getUserId();
    const res = await fetch('/api/watchlist', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ user_id: userId, movie_id: movieId, status })
    });
    return res.json();
  }

  static async removeFromWatchlist(itemIdOrMovieId) {
    const userId = this.getUserId();
    const res = await fetch(`/api/watchlist/${itemIdOrMovieId}?user_id=${userId}`, {
      method: 'DELETE',
      headers: { 'x-user-id': userId }
    });
    return res.json();
  }

  static async updateWatchlistStatus(itemId, status) {
    const userId = this.getUserId();
    const res = await fetch(`/api/watchlist/${itemId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId
      },
      body: JSON.stringify({ user_id: userId, status })
    });
    return res.json();
  }

  // Discover & Movies API
  static async getDiscoverMoods() {
    const res = await fetch('/api/discover/moods');
    return res.json();
  }

  static async getMovie(movieId) {
    const res = await fetch(`/api/movies/${movieId}`);
    return res.json();
  }
}
