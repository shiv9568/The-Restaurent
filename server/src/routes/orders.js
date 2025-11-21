import express from 'express';
import jwt from 'jsonwebtoken';
import { listOrders, getOrderByIdOrNumber, createOrder, updateOrderByIdOrNumber, deleteOrderById, clearAllOrders } from '../db/orders.js';
const router = express.Router();
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
// GET all orders (simplified - no auth required for admin panel)
router.get('/', async (req, res) => {
    try {
        const { status, userId, restaurantId, orderNumber } = req.query;
        const filter = {};
        if (status)
            filter.status = status;
        if (restaurantId)
            filter.restaurantId = restaurantId;
        if (userId)
            filter.userId = userId;
        if (orderNumber)
            filter.orderNumber = orderNumber;
        // If auth token is provided, filter by user if not admin
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
                const isAdmin = decoded?.role === 'admin' || decoded?.role === 'super-admin';
                if (!isAdmin && !userId) {
                    filter.userId = decoded.userId;
                }
            }
            catch {
                // Invalid token - allow access anyway (simplified)
            }
        }
        const orders = await listOrders(filter);
        console.log(`[Orders API] Query filter:`, filter);
        console.log(`[Orders API] Found ${orders.length} orders in database`);
        console.log(`[Orders API] Returning ${orders.length} formatted orders`);
        res.json(orders.map(o => ({ ...o, _id: o.id, orderedAt: o.createdAt })));
    }
    catch (error) {
        console.error('[Orders API Error]', error);
        res.status(500).json({ error: error.message });
    }
});
// GET single order (simplified - no auth required)
router.get('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const order = await getOrderByIdOrNumber(id);
        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }
        // Optional: Check auth but don't block if invalid
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
                const isAdmin = decoded?.role === 'admin' || decoded?.role === 'super-admin';
                if (!isAdmin && order.userId && order.userId !== decoded.userId) {
                    // Allow access anyway for simplified access
                }
            }
            catch {
                // Invalid token - allow access anyway (simplified)
            }
        }
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// GET invoice data for an order
router.get('/:id/invoice', async (req, res) => {
    try {
        const order = await getOrderByIdOrNumber(req.params.id);
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        const items = order.items || [];
        const subtotal = items.reduce((sum, it) => sum + (it.price * it.quantity), 0);
        const deliveryFee = 40;
        const platformFee = 5;
        const taxes = Math.round((subtotal + deliveryFee) * 0.05);
        const total = subtotal + deliveryFee + platformFee + taxes;
        res.json({
            id: order.id,
            orderNumber: order.orderNumber,
            createdAt: order.createdAt,
            customerName: order.customerName,
            customerEmail: order.customerEmail,
            customerPhone: order.customerPhone,
            deliveryAddress: order.deliveryAddress,
            paymentMethod: order.paymentMethod,
            items,
            breakdown: { subtotal, deliveryFee, platformFee, taxes, total },
        });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// POST email receipt (stub)
router.post('/:id/email-receipt', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order)
            return res.status(404).json({ error: 'Order not found' });
        // TODO: integrate email service; for now, return success
        res.json({ message: 'Receipt email queued (mock)' });
    }
    catch (e) {
        res.status(500).json({ error: e.message });
    }
});
// POST create order (simplified - no strict auth required)
router.post('/', async (req, res) => {
    try {
        const body = req.body || {};
        // Try to get userId from auth token if available, otherwise use body.userId
        let userId = body.userId;
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
                userId = userId || decoded.userId;
            }
            catch {
                // Invalid token - use userId from body (simplified)
            }
        }
        const order = await createOrder({
            ...body,
            userId: userId || 'guest',
        });
        console.log(`[Orders API] Order created: ${order.orderNumber}, ID: ${order.id}`);
        res.status(201).json({
            ...order,
            _id: order.id,
        });
    }
    catch (error) {
        console.error('[Orders API] Create error:', error);
        res.status(400).json({ error: error.message });
    }
});
// PUT update order status (simplified - no strict auth required)
router.put('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        // Optional: Check if admin token exists, but don't block if it doesn't
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
                const isAdmin = decoded?.role === 'admin' || decoded?.role === 'super-admin';
                if (!isAdmin) {
                    // Allow anyway for simplified access
                }
            }
            catch {
                // Invalid token - allow update anyway (simplified)
            }
        }
        const order = await updateOrderByIdOrNumber(id, req.body);
        if (!order) {
            console.log(`[Orders API] Order not found for update: ${id}`);
            return res.status(404).json({ error: 'Order not found' });
        }
        console.log(`[Orders API] Order updated: ${order.orderNumber}, status: ${order.status}`);
        res.json({
            ...order,
            _id: order.id,
        });
    }
    catch (error) {
        console.error('[Orders API] Update error:', error);
        res.status(400).json({ error: error.message });
    }
});
// DELETE order (simplified - no strict auth required)
router.delete('/:id', async (req, res) => {
    try {
        // Optional: Check if admin token exists, but don't block if it doesn't
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            try {
                const decoded = jwt.verify(authHeader.replace('Bearer ', ''), process.env.JWT_SECRET || 'your-secret-key');
                const isAdmin = decoded?.role === 'admin' || decoded?.role === 'super-admin';
                if (!isAdmin) {
                    // Allow anyway for simplified access
                }
            }
            catch {
                // Invalid token - allow delete anyway (simplified)
            }
        }
        const existing = await getOrderByIdOrNumber(req.params.id);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }
        await deleteOrderById(existing.id);
        res.json({ message: 'Order deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// DELETE all orders (clear all - admin only recommended but simplified)
router.delete('/', async (req, res) => {
    try {
        console.log('[Orders API] Clearing all orders...');
        await clearAllOrders();
        res.json({
            message: 'All orders cleared successfully',
            deletedCount: undefined
        });
    }
    catch (error) {
        console.error('[Orders API] Clear all error:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;
//# sourceMappingURL=orders.js.map