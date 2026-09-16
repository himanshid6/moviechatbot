import { Router, Request, Response } from 'express';
import { db } from '../db/database.js';
import { v4 as uuidv4 } from 'uuid';

export const authRoutes = Router();

/**
 * Issue or retrieve anonymous user token
 */
authRoutes.post('/anonymous', (req: Request, res: Response) => {
  try {
    const existingUserId = req.body?.user_id || req.headers['x-user-id'];

    if (existingUserId && typeof existingUserId === 'string') {
      const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(existingUserId);
      if (existing) {
        return res.json({ success: true, user: existing });
      }
    }

    const newUserId = uuidv4();
    const displayName = `MovieFan_${newUserId.slice(0, 5)}`;
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO users (id, display_name, is_anonymous, created_at)
      VALUES (?, ?, 1, ?)
    `).run(newUserId, displayName, now);

    return res.json({
      success: true,
      user: {
        id: newUserId,
        display_name: displayName,
        is_anonymous: 1,
        created_at: now
      }
    });
  } catch (err: any) {
    console.error('Error in /api/auth/anonymous:', err);
    return res.status(500).json({ error: 'Failed to create or verify anonymous user' });
  }
});
