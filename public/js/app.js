/**
 * CineMatch App Main Controller
 */

import { CineMatchAPI } from './api.js';
import {
  renderPillChips,
  renderMessage,
  renderRecommendationCard,
  renderWatchlistCard,
  renderDiscoverCard,
  renderHistoryCard
} from './components.js';

class CineMatchApp {
  constructor() {
    this.currentSessionId = null;
    this.currentPreferences = null;
    this.watchlist = [];
    this.watchlistMovieIds = new Set();
    this.isStreaming = false;

    this.initElements();
    this.bindEvents();
    this.initApp();
  }

  initElements() {
    // Nav tabs
    this.tabBtns = document.querySelectorAll('.tab-btn');
    this.tabContents = document.querySelectorAll('.tab-content');
    this.watchlistBadge = document.getElementById('watchlistBadge');
    this.sparkBtn = document.getElementById('sparkBtn');

    // Chat elements
    this.chatHistory = document.getElementById('chatHistory');
    this.chatInput = document.getElementById('chatInput');
    this.sendBtn = document.getElementById('sendBtn');
    this.pillsChipsContainer = document.getElementById('pillsChips');
    this.editPillsBtn = document.getElementById('editPillsBtn');

    // Tab Containers
    this.discoverGrid = document.getElementById('discoverGrid');
    this.watchlistGrid = document.getElementById('watchlistGrid');
    this.historyContainer = document.getElementById('historyContainer');
    this.watchlistFilters = document.querySelectorAll('.filter-chip');

    // Modals
    this.pillsModal = document.getElementById('pillsModal');
    this.movieModal = document.getElementById('movieModal');
    this.modalCloseBtns = document.querySelectorAll('.modal-close-btn');

    // Pills Modal Form Elements
    this.moodTagBtns = document.querySelectorAll('.mood-tag-select');
    this.genreTagBtns = document.querySelectorAll('.genre-tag-select');
    this.platformTagBtns = document.querySelectorAll('.platform-tag-select');
    this.runtimeSlider = document.getElementById('runtimeSlider');
    this.runtimeValue = document.getElementById('runtimeValue');
    this.savePillsBtn = document.getElementById('savePillsBtn');

    // Toast
    this.toastContainer = document.getElementById('toastContainer');
  }

  bindEvents() {
    // Tab switching
    this.tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Chat input
    this.sendBtn.addEventListener('click', () => this.handleSendMessage());
    this.chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSendMessage();
      }
    });

    // Mood Spark button
    this.sparkBtn.addEventListener('click', () => this.handleSurpriseMe());

    // Pills Edit Modal
    this.editPillsBtn.addEventListener('click', () => this.openPillsModal());
    this.savePillsBtn.addEventListener('click', () => this.savePillsPreferences());

    this.runtimeSlider.addEventListener('input', (e) => {
      const val = e.target.value;
      this.runtimeValue.textContent = val > 0 ? `${val} mins` : 'Any runtime';
    });

    // Toggle selectable tags in modal
    document.querySelectorAll('.selectable-tag').forEach(tag => {
      tag.addEventListener('click', () => {
        tag.classList.toggle('selected');
      });
    });

    // Close modals on overlay click or close button
    this.modalCloseBtns.forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        this.closeAllModals();
      }
    });

    // Delegated actions (Quick reply chips, Watchlist toggles, Detail buttons)
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;

      // Quick chip
      if (target.classList.contains('quick-chip')) {
        const prompt = target.getAttribute('data-prompt');
        if (prompt && !this.isStreaming) {
          this.sendMessage(prompt);
        }
      }

      // Toggle watchlist on recommendation card
      if (target.getAttribute('data-action') === 'toggle-watchlist') {
        const movieId = target.getAttribute('data-movie-id');
        this.toggleWatchlistMovie(movieId, target);
      }

      // Remove from watchlist tab
      if (target.getAttribute('data-action') === 'remove-watchlist') {
        const itemId = target.getAttribute('data-item-id');
        this.removeFromWatchlist(itemId);
      }

      // Toggle watched status in watchlist
      if (target.getAttribute('data-action') === 'toggle-status') {
        const itemId = target.getAttribute('data-item-id');
        const currentStatus = target.getAttribute('data-current-status');
        const newStatus = currentStatus === 'watched' ? 'to_watch' : 'watched';
        this.updateWatchlistStatus(itemId, newStatus);
      }

      // View movie detail modal
      if (target.getAttribute('data-action') === 'view-detail') {
        const movieId = target.getAttribute('data-movie-id');
        this.openMovieDetailModal(movieId);
      }

      // Discover preset explore
      if (target.getAttribute('data-action') === 'explore-preset') {
        const presetId = target.getAttribute('data-preset-id');
        this.exploreDiscoverPreset(presetId);
      }

      // Resume history session
      if (target.getAttribute('data-action') === 'resume-session') {
        const sessionId = target.getAttribute('data-session-id');
        this.loadSession(sessionId);
      }

      // Delete history session
      if (target.getAttribute('data-action') === 'delete-session') {
        const sessionId = target.getAttribute('data-session-id');
        this.deleteSession(sessionId);
      }
    });

    // Watchlist sub-filters (All, To Watch, Watched)
    this.watchlistFilters.forEach(f => {
      f.addEventListener('click', () => {
        this.watchlistFilters.forEach(item => item.classList.remove('active'));
        f.classList.add('active');
        const filterType = f.getAttribute('data-filter');
        this.renderWatchlistGrid(filterType);
      });
    });
  }

  async initApp() {
    await CineMatchAPI.initUser();
    await this.fetchWatchlist();

    // Check if there are past sessions, else create new
    const sessionRes = await CineMatchAPI.listSessions();
    if (sessionRes.sessions && sessionRes.sessions.length > 0) {
      await this.loadSession(sessionRes.sessions[0].id);
    } else {
      await this.startNewSession();
    }

    // Preload Discover tab
    this.loadDiscoverPresets();
  }

  async startNewSession(title = 'New CineMatch Thread') {
    const res = await CineMatchAPI.createSession(title);
    if (res.session) {
      this.currentSessionId = res.session.id;
      this.currentPreferences = res.session.preference_state || {
        mood_tags: [],
        genre_tags: [],
        platform_filters: [],
        max_runtime_minutes: null
      };
      this.updatePillsBar();
      this.renderWelcomeMessage();
    }
  }

  async loadSession(sessionId) {
    this.currentSessionId = sessionId;
    this.switchTab('chat');

    const msgRes = await CineMatchAPI.getSessionMessages(sessionId);
    this.chatHistory.innerHTML = '';

    if (msgRes.messages && msgRes.messages.length > 0) {
      msgRes.messages.forEach(msg => {
        this.appendMessageElement(msg);
      });
      // Update preferences from last assistant message or session
      const lastAssistant = [...msgRes.messages].reverse().find(m => m.role === 'assistant');
      if (lastAssistant && lastAssistant.preference_state) {
        this.currentPreferences = lastAssistant.preference_state;
      }
    } else {
      this.renderWelcomeMessage();
    }

    this.updatePillsBar();
    this.scrollToBottom();
  }

  async deleteSession(sessionId) {
    if (!confirm('Are you sure you want to delete this session?')) return;
    await CineMatchAPI.deleteSession(sessionId);
    this.showToast('Session deleted');

    if (this.currentSessionId === sessionId) {
      await this.startNewSession();
    }
    this.loadHistoryTab();
  }

  renderWelcomeMessage() {
    this.chatHistory.innerHTML = `
      <div class="message-row assistant">
        <div class="message-avatar assistant">🍿</div>
        <div style="display: flex; flex-direction: column; max-width: 100%; flex: 1;">
          <div class="message-bubble">
            <strong>Welcome to CineMatch!</strong><br/>
            Tell me what you're in the mood for — a specific vibe, genre, twisty thriller, or cozy comedy.<br/><br/>
            <em>Try one of these quick prompts to get started:</em>
          </div>
          <div class="quick-replies-container" style="margin-top: 0.75rem;">
            <button class="quick-chip" data-prompt="Mind-bending sci-fi thriller with huge twists 🌀">Mind-bending sci-fi thriller with huge twists 🌀</button>
            <button class="quick-chip" data-prompt="Something witty, fast-paced, and darkly funny 🍸">Something witty, fast-paced, and darkly funny 🍸</button>
            <button class="quick-chip" data-prompt="Cozy, heartwarming movie to unwind tonight ☕">Cozy, heartwarming movie to unwind tonight ☕</button>
            <button class="quick-chip" data-prompt="High-octane action thriller on Netflix ⚡">High-octane action thriller on Netflix ⚡</button>
          </div>
        </div>
      </div>
    `;
  }

  switchTab(tabName) {
    this.tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });

    this.tabContents.forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}Tab`);
    });

    if (tabName === 'watchlist') {
      this.loadWatchlistTab();
    } else if (tabName === 'discover') {
      this.loadDiscoverPresets();
    } else if (tabName === 'history') {
      this.loadHistoryTab();
    }
  }

  updatePillsBar() {
    this.pillsChipsContainer.innerHTML = renderPillChips(this.currentPreferences);
  }

  scrollToBottom() {
    this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
  }

  async handleSendMessage() {
    const text = this.chatInput.value.trim();
    if (!text || this.isStreaming) return;

    this.chatInput.value = '';
    await this.sendMessage(text);
  }

  async handleSurpriseMe() {
    if (this.isStreaming) return;
    this.switchTab('chat');
    this.showToast('Sparking surprise movie match... ✨');
    
    // Add user spark prompt
    this.sendMessage("✨ Surprise me with something exceptional and unpredictable!");
  }

  async sendMessage(text) {
    if (!this.currentSessionId) {
      await this.startNewSession();
    }

    this.isStreaming = true;
    this.sendBtn.disabled = true;

    // Render user message row immediately
    const userMsgRow = document.createElement('div');
    userMsgRow.className = 'message-row user';
    userMsgRow.innerHTML = `
      <div class="message-avatar user">👤</div>
      <div class="message-bubble">${this.escapeHtml(text)}</div>
    `;
    this.chatHistory.appendChild(userMsgRow);
    this.scrollToBottom();

    // Create placeholder assistant message row
    const assistantRow = document.createElement('div');
    assistantRow.className = 'message-row assistant';
    const msgId = 'msg_' + Date.now();
    assistantRow.id = msgId;
    assistantRow.innerHTML = `
      <div class="message-avatar assistant">🍿</div>
      <div style="display: flex; flex-direction: column; max-width: 100%; flex: 1;">
        <div class="message-bubble" id="${msgId}_bubble">
          <span class="status-typing">Searching verified catalog & scoring matches...</span>
        </div>
        <div id="${msgId}_recs"></div>
        <div id="${msgId}_chips"></div>
      </div>
    `;
    this.chatHistory.appendChild(assistantRow);
    this.scrollToBottom();

    const bubbleEl = document.getElementById(`${msgId}_bubble`);
    const recsEl = document.getElementById(`${msgId}_recs`);
    const chipsEl = document.getElementById(`${msgId}_chips`);
    let accumulatedText = '';

    await CineMatchAPI.sendMessageStream(this.currentSessionId, text, {
      onStatus: (statusMsg) => {
        if (!accumulatedText) {
          bubbleEl.innerHTML = `<span class="status-typing">${statusMsg}</span>`;
        }
      },
      onToken: (token) => {
        if (!accumulatedText) {
          bubbleEl.innerHTML = '';
        }
        accumulatedText += token;
        bubbleEl.innerHTML = this.formatMarkdown(accumulatedText);
        this.scrollToBottom();
      },
      onDone: (payload) => {
        this.isStreaming = false;
        this.sendBtn.disabled = false;

        // Render full assistant text
        if (payload.assistantMessage) {
          bubbleEl.innerHTML = this.formatMarkdown(payload.assistantMessage.content);
        }

        // Render movie recommendation cards
        if (payload.recommendations && payload.recommendations.length > 0) {
          const cardsHtml = payload.recommendations.map(r => 
            renderRecommendationCard(r, this.watchlistMovieIds.has(r.movie_id))
          ).join('');
          recsEl.innerHTML = `<div class="recommendations-grid">${cardsHtml}</div>`;
        }

        // Render quick reply chips
        if (payload.quickReplies && payload.quickReplies.length > 0) {
          const chipsHtml = payload.quickReplies.map(c => `
            <button class="quick-chip" data-prompt="${c}">${c}</button>
          `).join('');
          chipsEl.innerHTML = `<div class="quick-replies-container">${chipsHtml}</div>`;
        }

        // Update preference state pills
        if (payload.preferenceState) {
          this.currentPreferences = payload.preferenceState;
          this.updatePillsBar();
        }

        this.scrollToBottom();
      },
      onError: (err) => {
        this.isStreaming = false;
        this.sendBtn.disabled = false;
        bubbleEl.innerHTML = `<span style="color: #f87171;">Error generating recommendations. Please try again.</span>`;
        console.error('Chat error:', err);
      }
    });
  }

  appendMessageElement(msg) {
    const el = document.createElement('div');
    el.innerHTML = renderMessage(msg, this.watchlistMovieIds);
    this.chatHistory.appendChild(el.firstElementChild);
  }

  // Watchlist Operations
  async fetchWatchlist() {
    const res = await CineMatchAPI.getWatchlist();
    if (res.watchlist) {
      this.watchlist = res.watchlist;
      this.watchlistMovieIds = new Set(res.watchlist.map(w => w.movie_id));
      this.watchlistBadge.textContent = this.watchlist.length;
    }
  }

  async toggleWatchlistMovie(movieId, btnElement) {
    if (this.watchlistMovieIds.has(movieId)) {
      await CineMatchAPI.removeFromWatchlist(movieId);
      this.watchlistMovieIds.delete(movieId);
      this.watchlist = this.watchlist.filter(w => w.movie_id !== movieId);
      if (btnElement) {
        btnElement.classList.remove('in-watchlist');
        btnElement.textContent = '+';
      }
      this.showToast('Removed from Watchlist');
    } else {
      const res = await CineMatchAPI.addToWatchlist(movieId);
      if (res.item) {
        this.watchlist.unshift(res.item);
        this.watchlistMovieIds.add(movieId);
        if (btnElement) {
          btnElement.classList.add('in-watchlist');
          btnElement.textContent = '✓';
        }
        this.showToast('Added to Watchlist! 🔖');
      }
    }
    this.watchlistBadge.textContent = this.watchlist.length;
  }

  async removeFromWatchlist(itemId) {
    await CineMatchAPI.removeFromWatchlist(itemId);
    this.watchlist = this.watchlist.filter(w => w.id !== itemId);
    this.watchlistMovieIds = new Set(this.watchlist.map(w => w.movie_id));
    this.watchlistBadge.textContent = this.watchlist.length;
    this.showToast('Removed from Watchlist');
    this.loadWatchlistTab();
  }

  async updateWatchlistStatus(itemId, newStatus) {
    await CineMatchAPI.updateWatchlistStatus(itemId, newStatus);
    const item = this.watchlist.find(w => w.id === itemId);
    if (item) item.status = newStatus;
    this.showToast(newStatus === 'watched' ? 'Marked as Watched ✓' : 'Moved to To Watch');
    this.loadWatchlistTab();
  }

  loadWatchlistTab() {
    const activeFilterEl = document.querySelector('.filter-chip.active');
    const filterType = activeFilterEl ? activeFilterEl.getAttribute('data-filter') : 'all';
    this.renderWatchlistGrid(filterType);
  }

  renderWatchlistGrid(filterType = 'all') {
    let filtered = [...this.watchlist];
    if (filterType === 'to_watch') {
      filtered = filtered.filter(w => w.status === 'to_watch');
    } else if (filterType === 'watched') {
      filtered = filtered.filter(w => w.status === 'watched');
    }

    if (filtered.length === 0) {
      this.watchlistGrid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem 1rem; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🔖</div>
          <h3 style="color: #fff; font-family: Outfit, sans-serif; margin-bottom: 0.25rem;">Your Watchlist is empty</h3>
          <p style="font-size: 0.85rem;">Ask CineMatch for recommendations and tap the <strong>+</strong> icon to save movies for later.</p>
        </div>
      `;
      return;
    }

    this.watchlistGrid.innerHTML = filtered.map(item => renderWatchlistCard(item)).join('');
  }

  // Discover Operations
  async loadDiscoverPresets() {
    const res = await CineMatchAPI.getDiscoverMoods();
    if (res.presets) {
      this.discoverGrid.innerHTML = res.presets.map(p => renderDiscoverCard(p)).join('');
    }
  }

  async exploreDiscoverPreset(presetId) {
    const res = await fetch(`/api/discover/moods/${presetId}`).then(r => r.json());
    if (res.preset) {
      await this.startNewSession(`${res.preset.label} Session`);
      this.switchTab('chat');

      // Update preferences
      if (res.preset.seed_filters) {
        await CineMatchAPI.updatePreferences(this.currentSessionId, res.preset.seed_filters);
        this.currentPreferences = {
          session_id: this.currentSessionId,
          mood_tags: res.preset.seed_filters.mood_tags || [],
          genre_tags: res.preset.seed_filters.genre_tags || [],
          platform_filters: res.preset.seed_filters.platform_filters || [],
          max_runtime_minutes: res.preset.seed_filters.max_runtime_minutes || null,
          excluded_tags: []
        };
        this.updatePillsBar();
      }

      // Send starting prompt
      this.sendMessage(`Let's dive into ${res.preset.label}! (${res.preset.tagline})`);
    }
  }

  // History Tab
  async loadHistoryTab() {
    const res = await CineMatchAPI.listSessions();
    if (res.sessions && res.sessions.length > 0) {
      this.historyContainer.innerHTML = res.sessions.map(s => renderHistoryCard(s)).join('');
    } else {
      this.historyContainer.innerHTML = `
        <div style="text-align: center; padding: 3rem 1rem; color: #64748b;">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🕒</div>
          <h3 style="color: #fff; font-family: Outfit, sans-serif; margin-bottom: 0.25rem;">No past sessions yet</h3>
          <p style="font-size: 0.85rem;">Start chatting to explore movies and your conversations will appear here.</p>
        </div>
      `;
    }
  }

  // Pills Edit Modal
  openPillsModal() {
    // Populate current preferences into modal
    const moods = this.currentPreferences?.mood_tags || [];
    const genres = this.currentPreferences?.genre_tags || [];
    const platforms = this.currentPreferences?.platform_filters || [];
    const runtime = this.currentPreferences?.max_runtime_minutes || 0;

    this.moodTagBtns.forEach(btn => {
      const tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', moods.includes(tag));
    });

    this.genreTagBtns.forEach(btn => {
      const tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', genres.includes(tag));
    });

    this.platformTagBtns.forEach(btn => {
      const tag = btn.getAttribute('data-tag');
      btn.classList.toggle('selected', platforms.includes(tag));
    });

    this.runtimeSlider.value = runtime || 0;
    this.runtimeValue.textContent = runtime > 0 ? `${runtime} mins` : 'Any runtime';

    this.pillsModal.classList.add('open');
  }

  async savePillsPreferences() {
    const selectedMoods = Array.from(document.querySelectorAll('.mood-tag-select.selected')).map(b => b.getAttribute('data-tag'));
    const selectedGenres = Array.from(document.querySelectorAll('.genre-tag-select.selected')).map(b => b.getAttribute('data-tag'));
    const selectedPlatforms = Array.from(document.querySelectorAll('.platform-tag-select.selected')).map(b => b.getAttribute('data-tag'));
    const runtimeVal = parseInt(this.runtimeSlider.value) || null;

    const updates = {
      mood_tags: selectedMoods,
      genre_tags: selectedGenres,
      platform_filters: selectedPlatforms,
      max_runtime_minutes: runtimeVal > 0 ? runtimeVal : null
    };

    if (this.currentSessionId) {
      const res = await CineMatchAPI.updatePreferences(this.currentSessionId, updates);
      if (res.preference_state) {
        this.currentPreferences = res.preference_state;
        this.updatePillsBar();
        this.showToast('Active filters updated! 🎯');
      }
    }

    this.closeAllModals();
  }

  // Movie Detail Modal
  async openMovieDetailModal(movieId) {
    const res = await CineMatchAPI.getMovie(movieId);
    if (!res.movie) return;

    const m = res.movie;
    const modalContent = document.getElementById('movieModalContent');
    const isInWatchlist = this.watchlistMovieIds.has(m.id);

    modalContent.innerHTML = `
      <div style="position: relative; height: 220px; border-radius: 12px; overflow: hidden; margin-bottom: 1.25rem;">
        <img src="${m.backdrop_url || m.poster_url}" alt="${m.title}" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; inset: 0; background: linear-gradient(to top, #0f172a 0%, transparent 80%);"></div>
        <div style="position: absolute; bottom: 15px; left: 15px; right: 15px;">
          <h2 style="font-family: Outfit, sans-serif; font-size: 1.5rem; font-weight: 700; color: #fff;">${m.title}</h2>
          <div style="font-size: 0.82rem; color: #94a3b8; display: flex; gap: 8px; align-items: center; margin-top: 4px;">
            <span>${m.year}</span> • <span>${m.runtime_minutes} mins</span> • <span>★ ${m.rating ? Number(m.rating).toFixed(1) : '8.0'}</span>
          </div>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.85rem; font-size: 0.9rem;">
        <p style="line-height: 1.6; color: #cbd5e1;">${m.overview}</p>
        
        <div style="background: rgba(255, 255, 255, 0.04); padding: 0.75rem; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.08);">
          <div style="font-size: 0.75rem; font-weight: 700; color: #c084fc; text-transform: uppercase; margin-bottom: 4px;">Director & Cast</div>
          <div style="color: #fff;">${m.director ? `Director: ${m.director}` : ''}</div>
          <div style="font-size: 0.8rem; color: #94a3b8;">Starring: ${(m.cast_members || []).join(', ')}</div>
        </div>

        <div>
          <div style="font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 6px;">Available on Platforms</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${(m.streaming_platforms || []).map((p) => `<span class="platform-badge platform-netflix" style="font-size: 0.75rem;">${p}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.75rem;">
          ${m.trailer_url ? `
            <a href="${m.trailer_url}" target="_blank" rel="noopener noreferrer" class="spark-btn" style="text-decoration: none; flex: 1; justify-content: center;">
              ▶ Watch Trailer
            </a>
          ` : ''}
          <button class="modal-save-btn" style="margin-top: 0; flex: 1;" data-action="toggle-watchlist" data-movie-id="${m.id}">
            ${isInWatchlist ? '✓ In Watchlist' : '+ Add to Watchlist'}
          </button>
        </div>
      </div>
    `;

    this.movieModal.classList.add('open');
  }

  closeAllModals() {
    this.pillsModal.classList.remove('open');
    this.movieModal.classList.remove('open');
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    this.toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  formatMarkdown(str) {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  window.cinematch = new CineMatchApp();
});
