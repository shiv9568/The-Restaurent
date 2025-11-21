import express from 'express';
import { listRestaurants, getRestaurantById, createRestaurant, updateRestaurant, deleteRestaurant } from '../db/restaurants.js';
const router = express.Router();
// GET all restaurants
router.get('/', async (req, res) => {
    try {
        const { isActive } = req.query;
        const filter = {};
        if (isActive !== undefined)
            filter.isActive = isActive === 'true';
        const restaurants = await listRestaurants({});
        res.json(restaurants);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET single restaurant
router.get('/:id', async (req, res) => {
    try {
        const restaurant = await getRestaurantById(req.params.id);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST create restaurant
router.post('/', async (req, res) => {
    try {
        const restaurant = await createRestaurant(req.body);
        res.status(201).json(restaurant);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT update restaurant
router.put('/:id', async (req, res) => {
    try {
        const restaurant = await updateRestaurant(req.params.id, req.body);
        if (!restaurant) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        res.json(restaurant);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE restaurant
router.delete('/:id', async (req, res) => {
    try {
        const existing = await getRestaurantById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Restaurant not found' });
        }
        await deleteRestaurant(req.params.id);
        res.json({ message: 'Restaurant deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=restaurants.js.map