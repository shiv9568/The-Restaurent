import express from 'express';
import { dashboardStats } from '../db/orders.js';
import jwt from 'jsonwebtoken';
const router = express.Router();
// Admin auth middleware - requires admin or super-admin role
function requireAdmin(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing authentication token' });
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        // Check if user has admin role
        if (decoded.role !== 'admin' && decoded.role !== 'super-admin') {
            return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired. Please login again.' });
        }
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}
// GET /api/admin/dashboard/stats
router.get('/dashboard/stats', requireAdmin, async (req, res) => {
    try {
        const stats = await dashboardStats();
        res.json(stats);
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
export default router;
//# sourceMappingURL=admin.js.map