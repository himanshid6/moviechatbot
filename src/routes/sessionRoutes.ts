import { Router, Request, Response } from 'express';
import { ConversationService } from '../services/conversationService.js';
import { RecommendationEngine } from '../services/recommendationEngine.js';

export const sessionRoutes = Router();

/**
 * Create a new chat session
 */
sessionRoutes.post('/', (req: Request, res: Response) => {
  try {
    const userId = req.body?.user_id || (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const title = req.body?.title || 'New CineMatch Thread';
    const session = ConversationService.createSession(userId, title);

    return res.status(201).json({ success: true, session });
  } catch (err: any) {
    console.error('Error creating session:', err);
    return res.status(500).json({ error: err.message || 'Failed to create session' });
  }
});

/**
 * List all sessions for a user (History tab)
 */
sessionRoutes.get('/', (req: Request, res: Response) => {
  try {
    const userId = (req.query.user_id as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    const sessions = ConversationService.listUserSessions(userId);
    return res.json({ success: true, sessions });
  } catch (err: any) {
    console.error('Error listing sessions:', err);
    return res.status(500).json({ error: 'Failed to list sessions' });
  }
});

/**
 * Get specific session by ID
 */
sessionRoutes.get('/:id', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const session = ConversationService.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json({ success: true, session });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * Delete a session
 */
sessionRoutes.delete('/:id', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const deleted = ConversationService.deleteSession(sessionId);
    if (!deleted) {
      return res.status(404).json({ error: 'Session not found' });
    }
    return res.json({ success: true, message: 'Session deleted' });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete session' });
  }
});

/**
 * Get message history for a session
 */
sessionRoutes.get('/:id/messages', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const messages = ConversationService.getMessages(sessionId);
    return res.json({ success: true, messages });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve messages' });
  }
});

/**
 * Send user message -> standard JSON or SSE stream
 */
sessionRoutes.post('/:id/messages', async (req: Request, res: Response) => {
  const sessionId = req.params.id as string;
  const content = req.body?.content;
  const isStream = req.query.stream === 'true' || req.headers.accept === 'text/event-stream';

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'content is required' });
  }

  if (isStream) {
    return RecommendationEngine.processMessageStream(sessionId, content, res);
  }

  try {
    const result = await RecommendationEngine.processMessage(sessionId, content);
    return res.json({
      success: true,
      message: result.assistantMessage,
      recommendations: result.recommendations,
      preference_state: result.preferenceState,
      quick_replies: result.quickReplies
    });
  } catch (err: any) {
    console.error('Error processing message:', err);
    return res.status(500).json({ error: err.message || 'Failed to process message' });
  }
});

/**
 * Direct update of active mood/genre/platform/runtime preference state pills
 */
sessionRoutes.patch('/:id/preferences', (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const updates = req.body;

    const updatedState = ConversationService.updatePreferenceState(sessionId, updates);
    return res.json({ success: true, preference_state: updatedState });
  } catch (err: any) {
    console.error('Error updating preferences:', err);
    return res.status(500).json({ error: 'Failed to update preferences', details: err?.message });
  }
});

/**
 * "Mood Spark" (✨) / Surprise me instant recommendation
 */
sessionRoutes.post('/:id/surprise', async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id as string;
    const result = await RecommendationEngine.surpriseMe(sessionId);
    return res.json({
      success: true,
      message: result.assistantMessage,
      recommendations: result.recommendations,
      preference_state: result.preferenceState,
      quick_replies: result.quickReplies
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to generate surprise recommendation' });
  }
});
