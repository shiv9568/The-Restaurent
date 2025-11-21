import express from 'express';
import { getBrand, upsertBrand } from '../db/restaurantBrand.js';
const router = express.Router();
router.get('/', async (_req, res) => {
    try {
        const doc = await getBrand();
        res.json(doc || null);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
router.put('/', async (req, res) => {
    try {
        const update = req.body || {};
        const doc = await upsertBrand(update);
        res.json(doc);
    }
    catch (e) {
        res.status(400).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=restaurantBrand.js.map