import { query } from './client';
function genId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function toApi(r) {
    return {
        id: r.id,
        name: r.name,
        description: r.description ?? undefined,
        deliveryFee: Number(r.delivery_fee),
        minOrderAmount: Number(r.min_order_amount),
        estimatedTime: r.estimated_time,
        isActive: r.is_active,
        coordinates: r.coordinates ?? [],
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}
export async function listDeliveryZones(filter) {
    const clauses = [];
    const params = [];
    let idx = 1;
    if (typeof filter.isActive === 'boolean') {
        clauses.push(`is_active=$${idx++}`);
        params.push(filter.isActive);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(`SELECT * FROM delivery_zones ${where} ORDER BY name ASC`);
    return rows.map(toApi);
}
export async function getDeliveryZoneById(id) {
    const { rows } = await query('SELECT * FROM delivery_zones WHERE id=$1', [id]);
    return rows.length ? toApi(rows[0]) : null;
}
export async function createDeliveryZone(data) {
    const id = data.id ?? genId('dzn');
    await query(`INSERT INTO delivery_zones (id, name, description, delivery_fee, min_order_amount, estimated_time, is_active, coordinates)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`, [id, data.name, data.description ?? null, data.deliveryFee, data.minOrderAmount, data.estimatedTime, data.isActive ?? true, JSON.stringify(data.coordinates ?? [])]);
    return await getDeliveryZoneById(id);
}
export async function updateDeliveryZone(id, update) {
    const fields = [];
    const params = [];
    let idx = 1;
    const map = {
        name: 'name', description: 'description', deliveryFee: 'delivery_fee', minOrderAmount: 'min_order_amount', estimatedTime: 'estimated_time', isActive: 'is_active', coordinates: 'coordinates'
    };
    for (const [k, v] of Object.entries(update)) {
        const col = map[k];
        if (!col)
            continue;
        const val = col === 'coordinates' ? JSON.stringify(v) : v;
        fields.push(`${col}=$${idx++}`);
        params.push(val);
    }
    if (!fields.length)
        return await getDeliveryZoneById(id);
    params.push(id);
    await query(`UPDATE delivery_zones SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
    return await getDeliveryZoneById(id);
}
export async function deleteDeliveryZone(id) {
    await query('DELETE FROM delivery_zones WHERE id=$1', [id]);
    return true;
}
//# sourceMappingURL=deliveryZones.js.map