import { query } from './client';

export type Offer = {
  id: string;
  title: string;
  description: string;
  discountType: string;
  discountValue: number;
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
  applicableOn: string;
  itemIds?: string[];
  createdAt: string;
  updatedAt: string;
};

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function toApi(r: any): Offer {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    discountType: r.discount_type,
    discountValue: Number(r.discount_value),
    minOrderAmount: r.min_order_amount != null ? Number(r.min_order_amount) : undefined,
    maxDiscountAmount: r.max_discount_amount != null ? Number(r.max_discount_amount) : undefined,
    validFrom: r.valid_from,
    validUntil: r.valid_until,
    isActive: r.is_active,
    applicableOn: r.applicable_on,
    itemIds: r.item_ids ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listOffers(filter: { isActive?: boolean }) {
  const clauses: string[] = [];
  const params: any[] = [];
  let idx = 1;
  if (typeof filter.isActive === 'boolean') { clauses.push(`is_active=$${idx++}`); params.push(filter.isActive); }
  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await query<any>(`SELECT * FROM offers ${where} ORDER BY created_at DESC`);
  return rows.map(toApi);
}

export async function getOfferById(id: string) {
  const { rows } = await query<any>('SELECT * FROM offers WHERE id=$1', [id]);
  return rows.length ? toApi(rows[0]) : null;
}

export async function createOffer(data: Partial<Offer>) {
  const id = data.id ?? genId('off');
  await query(
    `INSERT INTO offers (id, title, description, discount_type, discount_value, min_order_amount, max_discount_amount, valid_from, valid_until, is_active, applicable_on, item_ids)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      id,
      data.title,
      data.description,
      data.discountType,
      data.discountValue,
      data.minOrderAmount ?? null,
      data.maxDiscountAmount ?? null,
      data.validFrom,
      data.validUntil,
      data.isActive ?? true,
      data.applicableOn ?? 'all',
      data.itemIds ?? [],
    ]
  );
  return await getOfferById(id);
}

export async function updateOffer(id: string, update: Partial<Offer>) {
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;
  const map: Record<string, string> = {
    title: 'title', description: 'description', discountType: 'discount_type', discountValue: 'discount_value', minOrderAmount: 'min_order_amount', maxDiscountAmount: 'max_discount_amount', validFrom: 'valid_from', validUntil: 'valid_until', isActive: 'is_active', applicableOn: 'applicable_on', itemIds: 'item_ids'
  };
  for (const [k, v] of Object.entries(update)) {
    const col = map[k];
    if (!col) continue;
    fields.push(`${col}=$${idx++}`);
    params.push(v);
  }
  if (!fields.length) return await getOfferById(id);
  params.push(id);
  await query(`UPDATE offers SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
  return await getOfferById(id);
}

export async function deleteOffer(id: string) {
  await query('DELETE FROM offers WHERE id=$1', [id]);
  return true;
}

