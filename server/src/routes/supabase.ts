import express, { Request, Response } from 'express';
import { supabase, isSupabaseConfigured } from '../db/supabaseClient.js';

const router = express.Router();

router.get('/users', async (_req: Request, res: Response) => {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return res.status(500).json({ error: 'Supabase not configured on server' });
    }
    const { data, error } = await supabase
      .from('users')
      .select('id,name,email,phone,clerk_id,role,created_at,updated_at')
      .order('created_at', { ascending: false });
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json(data ?? []);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;

