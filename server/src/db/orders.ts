import { query } from './client';

export type OrderItem = {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId?: string;
  restaurantId?: string;
  restaurantName: string;
  items: OrderItem[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryAddress?: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  estimatedTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function listOrders(filter: {
  status?: string;
  userId?: string;
  restaurantId?: string;
  orderNumber?: string;
}) {
  const conditions: string[] = [];
  const params: any[] = [];
  let idx = 1;
  if (filter.status) { conditions.push(`status=$${idx++}`); params.push(filter.status); }
  if (filter.userId) { conditions.push(`user_id=$${idx++}`); params.push(filter.userId); }
  if (filter.restaurantId) { conditions.push(`restaurant_id=$${idx++}`); params.push(filter.restaurantId); }
  if (filter.orderNumber) { conditions.push(`order_number=$${idx++}`); params.push(filter.orderNumber); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await query<any>(`SELECT * FROM orders ${where} ORDER BY created_at DESC`, params);
  const results = await Promise.all(rows.map(async (o) => {
    const items = await query<any>('SELECT * FROM order_items WHERE order_id=$1', [o.id]);
    return toApiOrder(o, items.rows);
  }));
  return results;
}

export async function getOrderByIdOrNumber(idOrNumber: string) {
  // Try id first then order_number
  let row: any | null = null;
  const byId = await query<any>('SELECT * FROM orders WHERE id=$1', [idOrNumber]);
  if (byId.rows.length) row = byId.rows[0];
  if (!row) {
    const byNum = await query<any>('SELECT * FROM orders WHERE order_number=$1', [idOrNumber]);
    if (byNum.rows.length) row = byNum.rows[0];
  }
  if (!row) return null;
  const items = await query<any>('SELECT * FROM order_items WHERE order_id=$1', [row.id]);
  return toApiOrder(row, items.rows);
}

export async function createOrder(data: Partial<Order>) {
  // Generate id and order number
  const id = genId('ord');
  let orderNumber = data.orderNumber;
  if (!orderNumber) {
    const c = await query<{ count: string }>('SELECT COUNT(*)::int AS count FROM orders');
    const next = (Number(c.rows[0]?.count || 0) + 1);
    orderNumber = `ORD${String(next).padStart(6, '0')}`;
  }
  const {
    userId, restaurantId, restaurantName,
    total, status = 'pending', paymentMethod = 'cash', paymentStatus = 'pending',
    deliveryAddress, customerName, customerPhone, customerEmail, estimatedTime, notes
  } = data;

  await query(
    `INSERT INTO orders (
      id, order_number, user_id, restaurant_id, restaurant_name, total, status,
      payment_method, payment_status, delivery_address, customer_name, customer_phone,
      customer_email, estimated_time, notes
    ) VALUES (
      $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
    )`,
    [id, orderNumber, userId ?? null, restaurantId ?? null, restaurantName, total, status,
     paymentMethod, paymentStatus, deliveryAddress ?? null, customerName ?? null, customerPhone ?? null,
     customerEmail ?? null, estimatedTime ?? null, notes ?? null]
  );

  const items = (data.items ?? []) as OrderItem[];
  for (const it of items) {
    await query(
      `INSERT INTO order_items (id, order_id, item_id, name, price, quantity, image)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [genId('oit'), id, it.itemId, it.name, it.price, it.quantity, it.image ?? null]
    );
  }
  const inserted = await query<any>('SELECT * FROM orders WHERE id=$1', [id]);
  const rowsItems = await query<any>('SELECT * FROM order_items WHERE order_id=$1', [id]);
  return toApiOrder(inserted.rows[0], rowsItems.rows);
}

export async function updateOrderByIdOrNumber(idOrNumber: string, update: Partial<Order>) {
  // Resolve target id
  const target = await query<any>('SELECT * FROM orders WHERE id=$1 OR order_number=$1', [idOrNumber]);
  if (!target.rows.length) return null;
  const row = target.rows[0];
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;
  const mapping: Record<string, string> = {
    userId: 'user_id',
    restaurantId: 'restaurant_id',
    restaurantName: 'restaurant_name',
    total: 'total',
    status: 'status',
    paymentMethod: 'payment_method',
    paymentStatus: 'payment_status',
    deliveryAddress: 'delivery_address',
    customerName: 'customer_name',
    customerPhone: 'customer_phone',
    customerEmail: 'customer_email',
    estimatedTime: 'estimated_time',
    notes: 'notes',
  };
  for (const [k, v] of Object.entries(update)) {
    const col = mapping[k];
    if (!col) continue;
    fields.push(`${col}=$${idx++}`);
    params.push(v);
  }
  if (!fields.length) {
    return await getOrderByIdOrNumber(row.id);
  }
  params.push(row.id);
  await query(`UPDATE orders SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
  return await getOrderByIdOrNumber(row.id);
}

export async function deleteOrderById(id: string) {
  await query('DELETE FROM orders WHERE id=$1', [id]);
  return true;
}

export async function clearAllOrders() {
  const r = await query('DELETE FROM orders');
  return r.rows;
}

export async function dashboardStats() {
  const totalOrdersQ = await query<{ count: string }>('SELECT COUNT(1)::int AS count FROM orders');
  const revenueQ = await query<{ total_revenue: string }>('SELECT COALESCE(SUM(total),0) AS total_revenue FROM orders');
  const pendingQ = await query<{ count: string }>("SELECT COUNT(1)::int AS count FROM orders WHERE status='pending'");
  const completedQ = await query<{ count: string }>("SELECT COUNT(1)::int AS count FROM orders WHERE status='delivered'");
  const recentQ = await query<any>('SELECT * FROM orders ORDER BY created_at DESC LIMIT 5');
  const recent = await Promise.all(recentQ.rows.map(async (o) => {
    return {
      id: o.id,
      total: Number(o.total),
      status: o.status,
      orderedAt: o.created_at,
    };
  }));
  const topItemsQ = await query<any>(
    `SELECT oi.item_id as id, oi.name, SUM(oi.quantity) as quantity,
            SUM(oi.price * oi.quantity) as revenue
     FROM order_items oi
     GROUP BY oi.item_id, oi.name
     ORDER BY quantity DESC
     LIMIT 5`
  );
  const totalOrders = Number(totalOrdersQ.rows[0]?.count || 0);
  const totalRevenue = Number(revenueQ.rows[0]?.total_revenue || 0);
  const pendingOrders = Number(pendingQ.rows[0]?.count || 0);
  const completedOrders = Number(completedQ.rows[0]?.count || 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    completedOrders,
    averageOrderValue,
    topSellingItems: topItemsQ.rows.map((r) => ({
      id: r.id || r.name,
      name: r.name,
      quantity: Number(r.quantity),
      revenue: Number(r.revenue),
    })),
    recentOrders: recent,
    revenueChart: [],
  };
}

function toApiOrder(row: any, itemsRows: any[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id ?? undefined,
    restaurantId: row.restaurant_id ?? undefined,
    restaurantName: row.restaurant_name,
    items: itemsRows.map((it) => ({
      itemId: it.item_id,
      name: it.name,
      price: Number(it.price),
      quantity: Number(it.quantity),
      image: it.image ?? undefined,
    })),
    total: Number(row.total),
    status: row.status,
    paymentMethod: row.payment_method,
    paymentStatus: row.payment_status,
    deliveryAddress: row.delivery_address ?? undefined,
    customerName: row.customer_name ?? undefined,
    customerPhone: row.customer_phone ?? undefined,
    customerEmail: row.customer_email ?? undefined,
    estimatedTime: row.estimated_time ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

