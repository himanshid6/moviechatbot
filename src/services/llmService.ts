import dotenv from 'dotenv';
import { MovieRecord } from './movieCatalogService.js';
import { PreferenceState } from './conversationService.js';

dotenv.config();

export interface ParsedIntent {
  extractedMoods: string[];
  extractedGenres: string[];
  extractedPlatforms: string[];
  maxRuntimeMinutes?: number | null;
  excludedTags: string[];
  refinementType?: string;
  isSparkSurprise?: boolean;
}

export interface SelectedRecommendation {
  movieId: string;
  matchScore: number;
  reasonText: string;
  quote?: string;
  rank: number;
}

export interface LLMRecommendationResult {
  replyText: string;
  recommendations: SelectedRecommendation[];
  quickReplies: string[];
  updatedPreferences: {
    mood_tags: string[];
    genre_tags: string[];
    platform_filters: string[];
    max_runtime_minutes?: number | null;
    excluded_tags: string[];
  };
}

export class LLMService {
  private static geminiApiKey = process.env.GEMINI_API_KEY || '';
  private static openaiApiKey = process.env.OPENAI_API_KEY || '';

  /**
   * Check if external LLM API is configured
   */
  public static isLLMAvailable(): boolean {
    return !!(this.geminiApiKey || this.openaiApiKey);
  }

  /**
   * Parse user message for moods, genres, platforms, runtime caps, and constraints
   */
  public static parseIntent(
    userMessage: string,
    currentPreferences: PreferenceState
  ): ParsedIntent {
    const text = userMessage.toLowerCase();

    const extractedMoods: string[] = [...(currentPreferences.mood_tags || [])];
    const extractedGenres: string[] = [...(currentPreferences.genre_tags || [])];
    const extractedPlatforms: string[] = [...(currentPreferences.platform_filters || [])];
    let maxRuntimeMinutes: number | null = currentPreferences.max_runtime_minutes || null;
    const excludedTags: string[] = [...(currentPreferences.excluded_tags || [])];

    // Mood patterns
    const moodMap: Record<string, string[]> = {
      'mind-bending': ['mind-bending', 'mind bending', 'twist', 'twists', 'trippy', 'confusing', 'cerebral', 'time loop', 'multiverse'],
      'dark comedy': ['dark comedy', 'dark humor', 'satire', 'satirical', 'cynical humor', 'black comedy'],
      'wholesome': ['wholesome', 'feel-good', 'feel good', 'comfort', 'cozy', 'sweet', 'warm', 'uplifting', 'heartwarming'],
      'atmospheric': ['atmospheric', 'neon', 'rainy', 'nocturnal', 'slow burn', 'slow-burn', 'moody'],
      'tense': ['tense', 'suspense', 'edge of seat', 'gripping', 'anxiety', 'nail-biting', 'thrilling'],
      'adrenaline': ['adrenaline', 'high-octane', 'action packed', 'intense action', 'hyper', 'explosive'],
      'melancholic': ['sad', 'melancholy', 'melancholic', 'poignant', 'crying', 'tearjerker', 'bittersweet', 'heartbreak'],
      'witty': ['witty', 'clever', 'sharp dialogue', 'fast-talking', 'sarcastic', 'smart'],
      'dread': ['scary', 'dread', 'creepy', 'unsettling', 'terrifying', 'disturbing', 'spooky', 'horror']
    };

    for (const [mood, keywords] of Object.entries(moodMap)) {
      if (keywords.some(k => text.includes(k)) && !extractedMoods.includes(mood)) {
        extractedMoods.push(mood);
      }
    }

    // Genre patterns
    const genreMap: Record<string, string[]> = {
      'Sci-Fi': ['sci-fi', 'scifi', 'science fiction', 'space', 'aliens', 'time travel'],
      'Thriller': ['thriller', 'mystery', 'detective', 'whodunit', 'suspense'],
      'Comedy': ['comedy', 'funny', 'laugh', 'hilarious'],
      'Drama': ['drama', 'emotional', 'character study', 'heavy'],
      'Action': ['action', 'fight', 'chase', 'guns', 'stunts'],
      'Horror': ['horror', 'ghost', 'monsters', 'scary movie'],
      'Romance': ['romance', 'romantic', 'love story', 'date night'],
      'Animation': ['animation', 'animated', 'anime', 'pixar', 'studio ghibli'],
      'Crime': ['crime', 'gangster', 'heist', 'mob', 'police', 'noir']
    };

    for (const [genre, keywords] of Object.entries(genreMap)) {
      if (keywords.some(k => text.includes(k)) && !extractedGenres.includes(genre)) {
        extractedGenres.push(genre);
      }
    }

    // Platform patterns
    const platformMap: Record<string, string[]> = {
      'Netflix': ['netflix', 'only netflix', 'on netflix'],
      'Prime Video': ['prime', 'amazon', 'prime video'],
      'Max': ['max', 'hbo', 'hbo max'],
      'Disney+': ['disney', 'disney+'],
      'Apple TV+': ['apple', 'apple tv', 'apple tv+'],
      'Hulu': ['hulu'],
      'Paramount+': ['paramount', 'paramount+']
    };

    for (const [platform, keywords] of Object.entries(platformMap)) {
      if (keywords.some(k => text.includes(k)) && !extractedPlatforms.includes(platform)) {
        extractedPlatforms.push(platform);
      }
    }

    // Runtime patterns
    if (text.includes('under 90') || text.includes('under 90m') || text.includes('under 90 min') || text.includes('short') || text.includes('quick watch')) {
      maxRuntimeMinutes = 90;
    } else if (text.includes('under 100') || text.includes('under 100 min')) {
      maxRuntimeMinutes = 100;
    } else if (text.includes('under 2 hours') || text.includes('under 120') || text.includes('under 120 min')) {
      maxRuntimeMinutes = 120;
    }

    // Refinements / modifiers
    let refinementType: string | undefined;
    if (text.includes('lighter') || text.includes('more fun') || text.includes('happier')) {
      refinementType = 'lighter';
      if (!extractedMoods.includes('wholesome')) extractedMoods.push('wholesome');
    } else if (text.includes('darker') || text.includes('more intense') || text.includes('turn up the tension')) {
      refinementType = 'darker';
      if (!extractedMoods.includes('tense')) extractedMoods.push('tense');
    } else if (text.includes('shorter') || text.includes('under 90 mins')) {
      refinementType = 'shorter';
      maxRuntimeMinutes = 90;
    }

    return {
      extractedMoods,
      extractedGenres,
      extractedPlatforms,
      maxRuntimeMinutes,
      excludedTags,
      refinementType,
      isSparkSurprise: text.includes('surprise') || text.includes('spark')
    };
  }

  /**
   * Generate grounded recommendations from verified candidates
   */
  public static async generateRecommendations(
    userMessage: string,
    candidates: MovieRecord[],
    currentPreferences: PreferenceState,
    history: Array<{ role: string; content: string }>
  ): Promise<LLMRecommendationResult> {
    const parsed = this.parseIntent(userMessage, currentPreferences);

    // If Gemini key is available, attempt Gemini call
    if (this.geminiApiKey) {
      try {
        const geminiResult = await this.callGemini(userMessage, candidates, currentPreferences, history);
        if (geminiResult) return geminiResult;
      } catch (err) {
        console.warn('Gemini API call failed, using intelligent ranking fallback:', err);
      }
    }

    // High quality intelligent ranking engine
    return this.fallbackGroundedRanking(userMessage, candidates, parsed, currentPreferences);
  }

  /**
   * High quality grounded ranking and personalized reasoning generator
   */
  private static fallbackGroundedRanking(
    userMessage: string,
    candidates: MovieRecord[],
    parsed: ParsedIntent,
    currentPreferences: PreferenceState
  ): LLMRecommendationResult {
    // Rank candidates by composite match score
    const scoredCandidates = candidates.map((movie, index) => {
      let score = 84;

      // Rating boost
      score += Math.round((movie.rating - 7.0) * 4);

      // Genre alignment
      if (parsed.extractedGenres.length > 0) {
        const genreMatches = movie.genres.filter(g => 
          parsed.extractedGenres.some(eg => eg.toLowerCase() === g.toLowerCase())
        ).length;
        score += genreMatches * 4;
      }

      // Mood alignment
      if (parsed.extractedMoods.length > 0) {
        const moodMatches = movie.moods.filter(m => 
          parsed.extractedMoods.some(em => em.toLowerCase() === m.toLowerCase())
        ).length;
        score += moodMatches * 5;
      }

      // Platform match
      if (parsed.extractedPlatforms.length > 0) {
        const hasPlatform = movie.streaming_platforms.some(sp => 
          parsed.extractedPlatforms.some(ep => sp.toLowerCase().includes(ep.toLowerCase()))
        );
        if (hasPlatform) score += 6;
      }

      // Runtime cap match
      if (parsed.maxRuntimeMinutes && movie.runtime_minutes <= parsed.maxRuntimeMinutes) {
        score += 4;
      }

      // Cap score between 82 and 98
      score = Math.min(98, Math.max(82, score - (index * 2)));

      // Construct rich "Why this fits" reason grounded in movie's overview and requested vibe
      let reasonText = '';
      const moodText = movie.moods.slice(0, 2).join(' and ');
      const genreText = movie.genres.slice(0, 2).join('/');

      if (parsed.refinementType === 'lighter') {
        reasonText = `Brings a refreshing, lighter balance with its witty ${genreText} energy and vibrant storytelling.`;
      } else if (parsed.refinementType === 'darker' || parsed.extractedMoods.includes('tense')) {
        reasonText = `Delivers immaculate tension and a gripping ${moodText} atmosphere crafted by ${movie.director || 'the director'}.`;
      } else if (parsed.maxRuntimeMinutes && movie.runtime_minutes <= parsed.maxRuntimeMinutes) {
        reasonText = `A razor-sharp ${movie.runtime_minutes}-minute watch that wastes zero time delivering peak ${moodText} moments.`;
      } else if (movie.moods.includes('mind-bending')) {
        reasonText = `A masterclass in intricate plotting that keeps you questioning reality with astonishing visual flair.`;
      } else if (movie.moods.includes('wholesome')) {
        reasonText = `Deeply satisfying, heartfelt comfort cinema with genuine warmth and unforgettable character chemistry.`;
      } else {
        reasonText = `Hits the exact ${movie.moods[0] || 'cinematic'} vibe you asked for—pairing stellar performances with a captivating ${genreText.toLowerCase()} narrative.`;
      }

      return {
        movieId: movie.id,
        matchScore: score,
        reasonText,
        quote: movie.quote || `"${movie.overview.slice(0, 60)}..."`,
        rank: 0,
        movie
      };
    });

    // Sort by match score descending
    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    // Pick top 3 recommendations
    const topPicks = scoredCandidates.slice(0, 3).map((pick, i) => ({
      movieId: pick.movieId,
      matchScore: pick.matchScore,
      reasonText: pick.reasonText,
      quote: pick.quote,
      rank: i + 1
    }));

    // Generate conversational reply text
    const selectedTitles = topPicks.map(p => {
      const m = candidates.find(c => c.id === p.movieId);
      return m ? `**${m.title}**` : '';
    }).filter(Boolean).join(', ');

    let replyText = `I found a curated selection dialed right into your vibe! Here are top-tier picks: ${selectedTitles}.`;
    if (parsed.extractedPlatforms.length > 0) {
      replyText += ` Filtered for availability on ${parsed.extractedPlatforms.join(', ')}.`;
    }

    // Generate contextual quick reply chips
    const quickReplies = this.generateQuickReplies(parsed, topPicks, candidates);

    return {
      replyText,
      recommendations: topPicks,
      quickReplies,
      updatedPreferences: {
        mood_tags: Array.from(new Set(parsed.extractedMoods)),
        genre_tags: Array.from(new Set(parsed.extractedGenres)),
        platform_filters: Array.from(new Set(parsed.extractedPlatforms)),
        max_runtime_minutes: parsed.maxRuntimeMinutes,
        excluded_tags: parsed.excludedTags
      }
    };
  }

  /**
   * Generate contextual follow-up quick-reply chips
   */
  private static generateQuickReplies(
    parsed: ParsedIntent,
    picks: SelectedRecommendation[],
    candidates: MovieRecord[]
  ): string[] {
    const chips: string[] = [];

    if (!parsed.maxRuntimeMinutes || parsed.maxRuntimeMinutes > 100) {
      chips.push('Under 90 mins ⏱️');
    }

    if (!parsed.extractedPlatforms.includes('Netflix')) {
      chips.push('Only show Netflix 🍿');
    } else if (!parsed.extractedPlatforms.includes('Prime Video')) {
      chips.push('Available on Prime Video 📦');
    }

    if (!parsed.extractedMoods.includes('tense')) {
      chips.push('Turn up the tension ⚡');
    } else {
      chips.push('Something lighter & funny 😄');
    }

    chips.push('More like this 🎬');

    return chips.slice(0, 4);
  }

  /**
   * Gemini API client integration for structured reasoning
   */
  private static async callGemini(
    userMessage: string,
    candidates: MovieRecord[],
    currentPreferences: PreferenceState,
    history: Array<{ role: string; content: string }>
  ): Promise<LLMRecommendationResult | null> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`;

    const candidateBriefs = candidates.map(c => ({
      id: c.id,
      title: c.title,
      year: c.year,
      runtime: c.runtime_minutes,
      genres: c.genres,
      moods: c.moods,
      platforms: c.streaming_platforms,
      director: c.director,
      rating: c.rating,
      overview: c.overview
    }));

    const systemPrompt = `You are CineMatch, an elite conversational cinema concierge.
CRITICAL CONSTRAINT: You MUST ONLY recommend movies from the provided candidate list. Never invent or hallucinate a title.

Candidate List:
${JSON.stringify(candidateBriefs, null, 2)}

Current User Preferences:
${JSON.stringify(currentPreferences, null, 2)}

Respond with JSON format:
{
  "replyText": "Warm, conversational 1-2 sentence introduction acknowledging their vibe",
  "recommendations": [
    {
      "movieId": "exact id from candidate list",
      "matchScore": 95,
      "reasonText": "1-2 sentence why this fits their requested mood/constraints",
      "quote": "Memorable tagline or quote",
      "rank": 1
    }
  ],
  "quickReplies": ["3-4 relevant quick refinement prompts like 'Turn up tension', 'Under 90 mins', etc."],
  "updatedPreferences": {
    "mood_tags": ["extracted mood tags"],
    "genre_tags": ["extracted genre tags"],
    "platform_filters": ["extracted platform filters"],
    "max_runtime_minutes": null or number,
    "excluded_tags": []
  }
}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Message: "${userMessage}"` }] }
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    const parsed = JSON.parse(rawText);
    // Ensure all movieId in parsed.recommendations exist in candidates
    const validCandidateIds = new Set(candidates.map(c => c.id));
    parsed.recommendations = (parsed.recommendations || []).filter((r: any) => validCandidateIds.has(r.movieId));

    if (parsed.recommendations.length === 0) {
      return null;
    }

    return parsed as LLMRecommendationResult;
  }
}
