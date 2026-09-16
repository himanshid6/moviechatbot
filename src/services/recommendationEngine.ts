import { MovieCatalogService, MovieRecord } from './movieCatalogService.js';
import { ConversationService, PreferenceState, MessageRecord, RecommendationRecord } from './conversationService.js';
import { LLMService, LLMRecommendationResult } from './llmService.js';
import { Response } from 'express';

export interface ProcessMessageResult {
  assistantMessage: MessageRecord;
  recommendations: RecommendationRecord[];
  preferenceState: PreferenceState;
  quickReplies: string[];
}

export class RecommendationEngine {
  /**
   * Process a user message and generate recommendations
   */
  public static async processMessage(
    sessionId: string,
    userContent: string
  ): Promise<ProcessMessageResult> {
    // 1. Get session and current preference state
    const session = ConversationService.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const currentPreferences = ConversationService.getPreferenceState(sessionId) || {
      session_id: sessionId,
      mood_tags: [],
      genre_tags: [],
      platform_filters: [],
      max_runtime_minutes: null,
      excluded_tags: [],
      updated_at: new Date().toISOString()
    };

    // 2. Persist user message
    ConversationService.addMessage(sessionId, 'user', userContent);

    // 3. Parse intent and get candidate shortlist from catalog
    const parsedIntent = LLMService.parseIntent(userContent, currentPreferences);

    const candidates = MovieCatalogService.getCandidatesForRecommendation({
      mood_tags: parsedIntent.extractedMoods,
      genre_tags: parsedIntent.extractedGenres,
      platform_filters: parsedIntent.extractedPlatforms,
      max_runtime_minutes: parsedIntent.maxRuntimeMinutes || undefined,
      excluded_tags: parsedIntent.excludedTags
    });

    // 4. Fetch prior message history for context
    const history = ConversationService.getMessages(sessionId).map(m => ({
      role: m.role,
      content: m.content
    }));

    // 5. Generate grounded recommendations from candidates
    const llmResult: LLMRecommendationResult = await LLMService.generateRecommendations(
      userContent,
      candidates,
      currentPreferences,
      history
    );

    // 6. Update session preference state
    const updatedPreferences = ConversationService.updatePreferenceState(
      sessionId,
      llmResult.updatedPreferences
    );

    // 7. Auto-update session title if it's the initial turn
    if (session.title === 'New CineMatch Thread' || !session.title) {
      const firstMood = updatedPreferences.mood_tags[0] || updatedPreferences.genre_tags[0] || 'Movie Night';
      const capitalized = firstMood.charAt(0).toUpperCase() + firstMood.slice(1);
      ConversationService.updateSessionTitle(sessionId, `${capitalized} Picks`);
    }

    // 8. Save assistant message and linked recommendations
    const assistantMessage = ConversationService.addMessage(
      sessionId,
      'assistant',
      llmResult.replyText,
      llmResult.quickReplies
    );

    const savedRecs = ConversationService.saveRecommendations(
      sessionId,
      assistantMessage.id,
      llmResult.recommendations.map(r => ({
        movieId: r.movieId,
        matchScore: r.matchScore,
        reasonText: r.reasonText,
        quote: r.quote,
        rank: r.rank
      }))
    );

    assistantMessage.recommendations = savedRecs;

    return {
      assistantMessage,
      recommendations: savedRecs,
      preferenceState: updatedPreferences,
      quickReplies: llmResult.quickReplies
    };
  }

  /**
   * Process user message with Server-Sent Events (SSE) streaming
   */
  public static async processMessageStream(
    sessionId: string,
    userContent: string,
    res: Response
  ): Promise<void> {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const sendSSE = (event: string, data: any) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    try {
      sendSSE('status', { message: 'Analyzing mood & constraints...' });

      const session = ConversationService.getSession(sessionId);
      if (!session) {
        sendSSE('error', { error: `Session ${sessionId} not found` });
        res.end();
        return;
      }

      const currentPreferences = ConversationService.getPreferenceState(sessionId) || {
        session_id: sessionId,
        mood_tags: [],
        genre_tags: [],
        platform_filters: [],
        max_runtime_minutes: null,
        excluded_tags: [],
        updated_at: new Date().toISOString()
      };

      // Persist user message
      const userMessage = ConversationService.addMessage(sessionId, 'user', userContent);
      sendSSE('user_message', userMessage);

      // Parse and retrieve candidates
      sendSSE('status', { message: 'Querying catalog for verified matches...' });
      const parsedIntent = LLMService.parseIntent(userContent, currentPreferences);
      const candidates = MovieCatalogService.getCandidatesForRecommendation({
        mood_tags: parsedIntent.extractedMoods,
        genre_tags: parsedIntent.extractedGenres,
        platform_filters: parsedIntent.extractedPlatforms,
        max_runtime_minutes: parsedIntent.maxRuntimeMinutes || undefined,
        excluded_tags: parsedIntent.excludedTags
      });

      sendSSE('status', { message: 'Synthesizing match scores & reasons...' });
      const history = ConversationService.getMessages(sessionId).map(m => ({
        role: m.role,
        content: m.content
      }));

      const llmResult = await LLMService.generateRecommendations(
        userContent,
        candidates,
        currentPreferences,
        history
      );

      // Stream text tokens for typing effect
      const words = llmResult.replyText.split(' ');
      for (let i = 0; i < words.length; i++) {
        const chunk = (i === 0 ? '' : ' ') + words[i];
        sendSSE('token', { chunk });
        // small realistic token latency
        await new Promise(r => setTimeout(r, 20));
      }

      // Update preference state
      const updatedPreferences = ConversationService.updatePreferenceState(
        sessionId,
        llmResult.updatedPreferences
      );

      // Auto-update session title
      if (session.title === 'New CineMatch Thread' || !session.title) {
        const firstMood = updatedPreferences.mood_tags[0] || updatedPreferences.genre_tags[0] || 'Movie Night';
        const capitalized = firstMood.charAt(0).toUpperCase() + firstMood.slice(1);
        ConversationService.updateSessionTitle(sessionId, `${capitalized} Picks`);
      }

      // Save assistant message and recommendations
      const assistantMessage = ConversationService.addMessage(
        sessionId,
        'assistant',
        llmResult.replyText,
        llmResult.quickReplies
      );

      const savedRecs = ConversationService.saveRecommendations(
        sessionId,
        assistantMessage.id,
        llmResult.recommendations.map(r => ({
          movieId: r.movieId,
          matchScore: r.matchScore,
          reasonText: r.reasonText,
          quote: r.quote,
          rank: r.rank
        }))
      );

      assistantMessage.recommendations = savedRecs;

      // Final complete event
      sendSSE('done', {
        assistantMessage,
        recommendations: savedRecs,
        preferenceState: updatedPreferences,
        quickReplies: llmResult.quickReplies
      });

      res.end();
    } catch (err: any) {
      console.error('SSE streaming error:', err);
      sendSSE('error', { error: err.message || 'Internal recommendation error' });
      res.end();
    }
  }

  /**
   * "Surprise Me" / Mood spark instant generator
   */
  public static async surpriseMe(sessionId: string): Promise<ProcessMessageResult> {
    const surprisePrompts = [
      "Surprise me with something wildly unpredictable and visually breathtaking!",
      "I want an absolute hidden gem with razor-sharp dialogue and great twists.",
      "Give me something cozy, uplifting, and totally heartwarming for tonight.",
      "A fast-paced, high-octane thriller that hooks me in the first 5 minutes!",
      "A dark comedy with unforgettable style and biting satire."
    ];

    const randomPrompt = surprisePrompts[Math.floor(Math.random() * surprisePrompts.length)];
    return this.processMessage(sessionId, randomPrompt);
  }
}
