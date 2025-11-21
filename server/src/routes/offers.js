import express from 'express';
import { listOffers, getOfferById, createOffer, updateOffer, deleteOffer } from '../db/offers.js';
const router = express.Router();
// GET all offers
router.get('/', async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const offers = await listOffers({ isActive: filter.isActive });
        res.json(offers);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET single offer
router.get('/:id', async (req, res) => {
    try {
        const offer = await getOfferById(req.params.id);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        res.json(offer);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST create offer
router.post('/', async (req, res) => {
    try {
        const offer = await createOffer(req.body);
        res.status(201).json(offer);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT update offer
router.put('/:id', async (req, res) => {
    try {
        const offer = await updateOffer(req.params.id, req.body);
        if (!offer) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        res.json(offer);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE offer
router.delete('/:id', async (req, res) => {
    try {
        const existing = await getOfferById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Offer not found' });
        }
        await deleteOffer(req.params.id);
        res.json({ message: 'Offer deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=offers.js.map