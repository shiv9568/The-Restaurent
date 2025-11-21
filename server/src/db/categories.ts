import { query } from './client';
import { listFoodItems } from './foodItems';

export type Category = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOnHomepage: boolean;
  restaurantId?: string;
  createdAt: string;
  updatedAt: string;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function toApi(r: any): Category {
  return {
    id: r.id,
    name: r.name,
    description: r.description ?? undefined,
    icon: r.icon ?? undefined,
    displayOnHomepage: r.display_on_homepage,
    restaurantId: r.restaurant_id ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listCategories(filter: { displayOnHomepage?: boolean }) {
  const clauses: string[] = [];
  const params: any[] = [];
  let idx = 1;
  if (typeof filter.displayOnHomepage === 'boolean') { clauses.push(`display_on_homepage=$${idx++}`); params.push(filter.displayOnHomepage); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query<any>(`SELECT * FROM categories ${where} ORDER BY name ASC`);
  return rows.map(toApi);
}

export async function getCategoryWithItems(id: string) {
  const { rows } = await query<any>('SELECT * FROM categories WHERE id=$1', [id]);
  if (!rows.length) return null;
  const cat = toApi(rows[0]);
  let items = await listFoodItems({ categoryId: id });
  if (!items.length) {
    items = await listFoodItems({ category: cat.name });
  }
  return { ...cat, items } as any;
}

export async function createCategory(data: Partial<Category>) {
  const id = data.id ?? genId('cat');
  await query(
    `INSERT INTO categories (id, name, description, icon, display_on_homepage, restaurant_id)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [id, data.name, data.description ?? null, data.icon ?? null, data.displayOnHomepage ?? true, data.restaurantId ?? null]
  );
  const { rows } = await query<any>('SELECT * FROM categories WHERE id=$1', [id]);
  return toApi(rows[0]);
}

export async function updateCategory(id: string, update: Partial<Category>) {
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;
  const map: Record<string, string> = { name: 'name', description: 'description', icon: 'icon', displayOnHomepage: 'display_on_homepage', restaurantId: 'restaurant_id' };
  for (const [k, v] of Object.entries(update)) {
    const col = map[k];
    if (!col) continue;
    fields.push(`${col}=$${idx++}`);
    params.push(v);
  }
  if (!fields.length) return await getCategoryWithItems(id);
  params.push(id);
  await query(`UPDATE categories SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}` , params);
  return await getCategoryWithItems(id);
}

export async function deleteCategory(id: string) {
  await query('DELETE FROM food_items WHERE category_id=$1', [id]);
  await query('DELETE FROM categories WHERE id=$1', [id]);
  return true;
}

export async function initializeDefaultCategories() {
  const defaults = [
    { name: 'Appetizers', description: 'Starters & Snacks', icon: '🍤', displayOnHomepage: true },
    { name: 'Main Course', description: 'Rice, Roti & Curries', icon: '🍛', displayOnHomepage: true },
    { name: 'Fast Food', description: 'Burgers, Pizza & More', icon: '🍔', displayOnHomepage: true },
    { name: 'Beverages', description: 'Drinks & Juices', icon: '🥤', displayOnHomepage: true },
    { name: 'Desserts', description: 'Sweet Treats', icon: '🍰', displayOnHomepage: true },
    { name: 'Breads', description: 'Naan, Roti & Paratha', icon: '🥖', displayOnHomepage: true },
    { name: 'Soups', description: 'Hot & Healthy Soups', icon: '🍲', displayOnHomepage: false },
    { name: 'Salads', description: 'Fresh & Healthy', icon: '🥗', displayOnHomepage: false },
  ];

  const { rows } = await query<any>('SELECT COUNT(*)::int AS count FROM categories');
  if (rows[0]?.count > 0) {
    const existing = await query<any>('SELECT * FROM categories');
    return existing.rows.map(toApi);
  }
  for (const cat of defaults) {
    await createCategory(cat as any);
  }
  const all = await query<any>('SELECT * FROM categories ORDER BY name ASC');
  return all.rows.map(toApi);
}
