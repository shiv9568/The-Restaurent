import express from 'express';
import { listFoodItems, getFoodItemById, createFoodItem, updateFoodItem, deleteFoodItem } from '../db/foodItems.js';
const router = express.Router();
// GET all food items
router.get('/', async (req, res) => {
    try {
        const { category, categoryId, displayOnHomepage, isAvailable } = req.query;
        const filter = {};
        if (category)
            filter.category = category;
        if (categoryId)
            filter.categoryId = categoryId;
        if (displayOnHomepage !== undefined)
            filter.displayOnHomepage = displayOnHomepage === 'true';
        if (isAvailable !== undefined)
            filter.isAvailable = isAvailable === 'true';
        console.log('Fetching food items with filter:', filter);
        const items = await listFoodItems({
            category: filter.category,
            categoryId: filter.categoryId,
            displayOnHomepage: filter.displayOnHomepage,
            isAvailable: filter.isAvailable,
        });
        console.log(`Found ${items.length} food items`);
        res.json(items);
    }
    catch (error) {
        console.error('Error fetching food items:', error);
        res.status(500).json({ error: error.message });
    }
});
// GET single food item
router.get('/:id', async (req, res) => {
    try {
        const item = await getFoodItemById(req.params.id);
        if (!item) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST create food item
router.post('/', async (req, res) => {
    try {
        console.log('Creating food item with data:', req.body);
        console.log('CategoryId in request:', req.body.categoryId);
        const item = await createFoodItem(req.body);
        console.log('Food item saved successfully:', {
            id: item.id,
            name: item.name,
            categoryId: item.categoryId,
            category: item.category
        });
        res.status(201).json(item);
    }
    catch (error) {
        console.error('Error creating food item:', error);
        res.status(400).json({ error: error.message });
    }
});
// PUT update food item
router.put('/:id', async (req, res) => {
    try {
        const item = await updateFoodItem(req.params.id, req.body);
        if (!item) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        res.json(item);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE food item
router.delete('/:id', async (req, res) => {
    try {
        const existing = await getFoodItemById(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Food item not found' });
        }
        await deleteFoodItem(req.params.id);
        res.json({ message: 'Food item deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=foodItems.js.map