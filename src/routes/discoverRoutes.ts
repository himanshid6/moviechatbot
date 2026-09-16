import { Router, Request, Response } from 'express';
import { DiscoverService } from '../services/discoverService.js';

export const discoverRoutes = Router();

/**
 * List all curated mood presets
 */
discoverRoutes.get('/moods', (_req: Request, res: Response) => {
  try {
    const presets = DiscoverService.getMoodPresets();
    return res.json({ success: true, presets });
  } catch (err: any) {
    console.error('Error getting mood presets:', err);
    return res.status(500).json({ error: 'Failed to fetch mood presets' });
  }
});

/**
 * Get single mood preset
 */
discoverRoutes.get('/moods/:id', (req: Request, res: Response) => {
  try {
    const preset = DiscoverService.getMoodPresetById(req.params.id);
    if (!preset) {
      return res.status(404).json({ error: 'Mood preset not found' });
    }
    return res.json({ success: true, preset });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to fetch mood preset' });
  }
});
