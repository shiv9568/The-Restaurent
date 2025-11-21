import express, { Request, Response } from 'express';
import { getBrand, upsertBrand } from '../db/restaurantBrand.js';

const router = express.Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const doc = await getBrand();
    res.json(doc || null);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/', async (req: Request, res: Response) => {
  try {
    const update = req.body || {};
    const doc = await upsertBrand(update);
    res.json(doc);
  } catch (e: any) {
    res.status(400).json({ error: e.message });
  }
});

export default router;
