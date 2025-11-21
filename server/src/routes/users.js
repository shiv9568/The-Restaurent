import express from 'express';
import { findAllUsers, findUserById, updateUser, deleteUser, getAddresses, addAddress, updateAddress, deleteAddress } from '../db/users.js';
import jwt from 'jsonwebtoken';
const router = express.Router();
// Middleware to check JWT
function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Missing token' });
    try {
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
// Helper: require admin middleware
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
        return res.status(401).json({ error: 'Missing token' });
    try {
        const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
        if (decoded?.role !== 'admin' && decoded?.role !== 'super-admin') {
            return res.status(403).json({ error: 'Forbidden' });
        }
        req.user = decoded;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
}
// GET all users (admin only)
router.get('/', requireAdmin, async (req, res) => {
    try {
        const users = await findAllUsers();
        res.json(users.map(u => ({ ...u, _id: u.id })));
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET single user
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const requester = req.user;
        if (requester.role !== 'admin' && requester.role !== 'super-admin' && requester.userId !== req.params.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        const user = await findUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ ...user, _id: user.id });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// PUT update user
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const requester = req.user;
        if (requester.role !== 'admin' && requester.role !== 'super-admin' && requester.userId !== req.params.id) {
            return res.status(403).json({ error: 'Forbidden' });
        }
        // Don't allow password updates through this route
        const { password, ...updateData } = req.body;
        const user = await updateUser(req.params.id, updateData);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({ ...user, _id: user.id });
    }
    catch (error) {
        res.status(400).json({ error: error.message });
    }
});
// DELETE user
router.delete('/:id', async (req, res) => {
    try {
        const user = await findUserById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await deleteUser(req.params.id);
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Address CRUD (all require auth)
router.get('/:id/addresses', authMiddleware, async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const addresses = await getAddresses(req.params.id);
    res.json(addresses);
});
router.post('/:id/addresses', authMiddleware, async (req, res) => {
    const address = req.body;
    const user = await findUserById(req.params.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const addresses = await addAddress(req.params.id, address);
    res.status(201).json(addresses);
});
router.put('/:id/addresses/:addressId', authMiddleware, async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const updated = await updateAddress(req.params.id, req.params.addressId, req.body);
    if (!updated)
        return res.status(404).json({ error: 'Address not found' });
    res.json(updated);
});
router.delete('/:id/addresses/:addressId', authMiddleware, async (req, res) => {
    const user = await findUserById(req.params.id);
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    const addresses = await deleteAddress(req.params.id, req.params.addressId);
    res.json(addresses);
});
export default router;
//# sourceMappingURL=users.js.map