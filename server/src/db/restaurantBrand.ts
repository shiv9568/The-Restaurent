import { query } from './client';

export type RestaurantBrand = {
  id: string;
  name: string;
  logo?: string;
  about?: string;
  address?: string;
  openTime?: string;
  closeTime?: string;
  contactNumber?: string;
  deliveryZones?: string[];
  isClosed: boolean;
  createdAt: string;
  updatedAt: string;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function toApi(r: any): RestaurantBrand {
  return {
    id: r.id,
    name: r.name,
    logo: r.logo ?? undefined,
    about: r.about ?? undefined,
    address: r.address ?? undefined,
    openTime: r.open_time ?? undefined,
    closeTime: r.close_time ?? undefined,
    contactNumber: r.contact_number ?? undefined,
    deliveryZones: r.delivery_zones ?? [],
    isClosed: r.is_closed,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function getBrand() {
  const { rows } = await query<any>('SELECT * FROM restaurant_brand ORDER BY created_at ASC LIMIT 1');
  return rows.length ? toApi(rows[0]) : null;
}

export async function upsertBrand(update: Partial<RestaurantBrand>) {
  const current = await getBrand();
  if (!current) {
    const id = genId('brd');
    await query(
      `INSERT INTO restaurant_brand (id, name, logo, about, address, open_time, close_time, contact_number, delivery_zones, is_closed)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [id, update.name ?? 'Restaurant', update.logo ?? null, update.about ?? null, update.address ?? null, update.openTime ?? null, update.closeTime ?? null, update.contactNumber ?? null, update.deliveryZones ?? [], update.isClosed ?? false]
    );
    const { rows } = await query<any>('SELECT * FROM restaurant_brand WHERE id=$1', [id]);
    return toApi(rows[0]);
  } else {
    const fields: string[] = [];
    const params: any[] = [];
    let idx = 1;
    const map: Record<string, string> = {
      name: 'name', logo: 'logo', about: 'about', address: 'address', openTime: 'open_time', closeTime: 'close_time', contactNumber: 'contact_number', deliveryZones: 'delivery_zones', isClosed: 'is_closed'
    };
    for (const [k, v] of Object.entries(update)) {
      const col = map[k];
      if (!col) continue;
      fields.push(`${col}=$${idx++}`);
      params.push(col === 'delivery_zones' ? (v ?? []) : v);
    }
    params.push(current.id);
    await query(`UPDATE restaurant_brand SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
    const { rows } = await query<any>('SELECT * FROM restaurant_brand WHERE id=$1', [current.id]);
    return toApi(rows[0]);
  }
}

