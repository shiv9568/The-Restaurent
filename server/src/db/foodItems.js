import { query } from './client';
function genId(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function toApi(r) {
    return {
        id: r.id,
        name: r.name,
        description: r.description ?? undefined,
        price: Number(r.price),
        image: r.image,
        category: r.category,
        categoryId: r.category_id ?? undefined,
        isVeg: r.is_veg,
        isAvailable: r.is_available,
        displayOnHomepage: r.display_on_homepage,
        rating: Number(r.rating ?? 0),
        restaurantId: r.restaurant_id ?? undefined,
        createdAt: r.created_at,
        updatedAt: r.updated_at,
    };
}
export async function listFoodItems(filter) {
    const clauses = [];
    const params = [];
    let idx = 1;
    if (filter.category) {
        clauses.push(`category=$${idx++}`);
        params.push(filter.category);
    }
    if (filter.categoryId) {
        clauses.push(`category_id=$${idx++}`);
        params.push(filter.categoryId);
    }
    if (typeof filter.displayOnHomepage === 'boolean') {
        clauses.push(`display_on_homepage=$${idx++}`);
        params.push(filter.displayOnHomepage);
    }
    if (typeof filter.isAvailable === 'boolean') {
        clauses.push(`is_available=$${idx++}`);
        params.push(filter.isAvailable);
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const { rows } = await query(`SELECT * FROM food_items ${where} ORDER BY created_at DESC`, params);
    return rows.map(toApi);
}
export async function getFoodItemById(id) {
    const { rows } = await query('SELECT * FROM food_items WHERE id=$1', [id]);
    return rows.length ? toApi(rows[0]) : null;
}
export async function createFoodItem(data) {
    const id = data.id ?? genId('fit');
    await query(`INSERT INTO food_items (id, name, description, price, image, category, category_id, is_veg, is_available, display_on_homepage, rating, restaurant_id)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`, [
        id,
        data.name,
        data.description ?? null,
        data.price,
        data.image,
        data.category,
        data.categoryId ?? null,
        data.isVeg ?? false,
        data.isAvailable ?? true,
        data.displayOnHomepage ?? false,
        data.rating ?? 0,
        data.restaurantId ?? null,
    ]);
    return await getFoodItemById(id);
}
export async function updateFoodItem(id, update) {
    const fields = [];
    const params = [];
    let idx = 1;
    const map = {
        name: 'name', description: 'description', price: 'price', image: 'image', category: 'category', categoryId: 'category_id',
        isVeg: 'is_veg', isAvailable: 'is_available', displayOnHomepage: 'display_on_homepage', rating: 'rating', restaurantId: 'restaurant_id'
    };
    for (const [k, v] of Object.entries(update)) {
        const col = map[k];
        if (!col)
            continue;
        fields.push(`${col}=$${idx++}`);
        params.push(v);
    }
    if (!fields.length)
        return await getFoodItemById(id);
    params.push(id);
    await query(`UPDATE food_items SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
    return await getFoodItemById(id);
}
export async function deleteFoodItem(id) {
    await query('DELETE FROM food_items WHERE id=$1', [id]);
    return true;
}
//# sourceMappingURL=foodItems.js.map