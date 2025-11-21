import express, { Request, Response } from 'express';
import { listDeliveryZones, getDeliveryZoneById, createDeliveryZone, updateDeliveryZone, deleteDeliveryZone } from '../db/deliveryZones.js';

const router = express.Router();

// GET all delivery zones
router.get('/', async (req: Request, res: Response) => {
  try {
    const { isActive } = req.query;
    const filter: any = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const zones = await listDeliveryZones({ isActive: filter.isActive });
    res.json(zones);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// GET single delivery zone
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const zone = await getDeliveryZoneById(req.params.id);
    if (!zone) {
      return res.status(404).json({ error: 'Delivery zone not found' });
    }
    res.json(zone);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// POST create delivery zone
router.post('/', async (req: Request, res: Response) => {
  try {
    const zone = await createDeliveryZone(req.body);
    res.status(201).json(zone);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update delivery zone
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const zone = await updateDeliveryZone(req.params.id, req.body);
    if (!zone) {
      return res.status(404).json({ error: 'Delivery zone not found' });
    }
    res.json(zone);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE delivery zone
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await getDeliveryZoneById(req.params.id);
    if (!existing) {
      return res.status(404).json({ error: 'Delivery zone not found' });
    }
    await deleteDeliveryZone(req.params.id);
    res.json({ message: 'Delivery zone deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

