import { query } from './client';
function genId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function toApi(r) {
    return {
        id: r.id,
        name: r.name,
        logo: r.logo ?? undefined,
        about: r.about ?? undefined,
        address: r.address ?? undefined,
        openTime: r.open_time ?? undefined,
        closeTime: r.close_time ?? undefined,
        contactNumber: r.contact_number ?? undefined,
        isClosed: r.is_closed,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}
export async function listRestaurants(filter) {
    // Mongoose had rating; schema does not. Sort by created_at desc.
    const { rows } = await query('SELECT * FROM restaurants ORDER BY created_at DESC');
    return rows.map(toApi);
}
export async function getRestaurantById(id) {
    const { rows } = await query('SELECT * FROM restaurants WHERE id=$1', [id]);
    return rows.length ? toApi(rows[0]) : null;
}
export async function createRestaurant(data) {
    const id = data.id ?? genId('rst');
    await query(`INSERT INTO restaurants (id, name, logo, about, address, open_time, close_time, contact_number, is_closed)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`, [id, data.name, data.logo ?? null, data.about ?? null, data.address ?? null, data.openTime ?? null, data.closeTime ?? null, data.contactNumber ?? null, data.isClosed ?? false]);
    return await getRestaurantById(id);
}
export async function updateRestaurant(id, update) {
    const fields = [];
    const params = [];
    let idx = 1;
    const map = {
        name: 'name', logo: 'logo', about: 'about', address: 'address', openTime: 'open_time', closeTime: 'close_time', contactNumber: 'contact_number', isClosed: 'is_closed'
    };
    for (const [k, v] of Object.entries(update)) {
        const col = map[k];
        if (!col)
            continue;
        fields.push(`${col}=$${idx++}`);
        params.push(v);
    }
    if (!fields.length)
        return await getRestaurantById(id);
    params.push(id);
    await query(`UPDATE restaurants SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
    return await getRestaurantById(id);
}
export async function deleteRestaurant(id) {
    await query('DELETE FROM restaurants WHERE id=$1', [id]);
    return true;
}
//# sourceMappingURL=restaurants.js.map