import express from 'express';
import { listCategories, getCategoryWithItems, createCategory, updateCategory, deleteCategory, initializeDefaultCategories } from '../db/categories.js';
const router = express.Router();
// GET all categories with their items
router.get('/', async (req, res) => {
    try {
        const { displayOnHomepage } = req.query;
        const filter = {};
        if (displayOnHomepage !== undefined) {
            filter.displayOnHomepage = displayOnHomepage === 'true';
        }
        const categories = await listCategories({ displayOnHomepage: filter.displayOnHomepage });
        const withItems = await Promise.all(categories.map(async (cat) => await getCategoryWithItems(cat.id)));
        res.json(withItems);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET single category with items
router.get('/:id', async (req, res) => {
    try {
        const category = await getCategoryWithItems(req.params.id);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// POST create category
router.post('/', async (req, res) => {
    try {
        const category = await createCategory(req.body);
        res.status(201).json({ ...category, items: [] });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// PUT update category
router.put('/:id', async (req, res) => {
    try {
        const category = await updateCategory(req.params.id, req.body);
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        res.json(category);
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE category
router.delete('/:id', async (req, res) => {
    try {
        const existing = await getCategoryWithItems(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Category not found' });
        }
        await deleteCategory(req.params.id);
        res.json({ message: 'Category and its items deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Initialize default categories
router.post('/initialize', async (req, res) => {
    try {
        const defaultCategories = [
            { name: 'Appetizers', description: 'Starters & Snacks', icon: '🍤', displayOnHomepage: true },
            { name: 'Main Course', description: 'Rice, Roti & Curries', icon: '🍛', displayOnHomepage: true },
            { name: 'Fast Food', description: 'Burgers, Pizza & More', icon: '🍔', displayOnHomepage: true },
            { name: 'Beverages', description: 'Drinks & Juices', icon: '🥤', displayOnHomepage: true },
            { name: 'Desserts', description: 'Sweet Treats', icon: '🍰', displayOnHomepage: true },
            { name: 'Breads', description: 'Naan, Roti & Paratha', icon: '🥖', displayOnHomepage: true },
            { name: 'Soups', description: 'Hot & Healthy Soups', icon: '🍲', displayOnHomepage: false },
            { name: 'Salads', description: 'Fresh & Healthy', icon: '🥗', displayOnHomepage: false },
        ];
        const categories = await initializeDefaultCategories();
        res.status(201).json({ message: 'Categories initialized successfully', categories });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=categories.js.map