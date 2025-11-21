import { query } from './client';
import bcrypt from 'bcryptjs';

function genId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

export type Address = {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  clerkId?: string;
  role: 'user' | 'admin' | 'super-admin';
  addresses?: Address[];
  createdAt: string;
  updatedAt: string;
};

export async function findAllUsers() {
  const { rows } = await query<any>('SELECT id, name, email, phone, clerk_id, role, created_at, updated_at FROM users ORDER BY created_at DESC');
  return rows.map(toApiUser);
}

export async function findUserById(id: string) {
  const { rows } = await query<any>('SELECT id, name, email, phone, clerk_id, role, created_at, updated_at FROM users WHERE id=$1', [id]);
  if (!rows.length) return null;
  const user = toApiUser(rows[0]);
  user.addresses = await getAddresses(id);
  return user;
}

export async function findUserByEmail(email: string) {
  const { rows } = await query<any>('SELECT * FROM users WHERE email=$1', [email]);
  return rows.length ? rows[0] : null;
}

export async function findUserByClerkId(clerkId: string) {
  const { rows } = await query<any>('SELECT * FROM users WHERE clerk_id=$1', [clerkId]);
  return rows.length ? rows[0] : null;
}

export async function createUser(data: { name: string; email: string; password?: string; phone?: string; role?: string; clerkId?: string }) {
  const id = genId('usr');
  const hashed = data.password ? await bcrypt.hash(data.password, 12) : null;
  await query(
    `INSERT INTO users (id, name, email, password, phone, role, clerk_id) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [id, data.name, data.email, hashed, data.phone ?? null, data.role ?? 'user', data.clerkId ?? null]
  );
  const { rows } = await query<any>('SELECT id, name, email, phone, clerk_id, role, created_at, updated_at FROM users WHERE id=$1', [id]);
  return toApiUser(rows[0]);
}

export async function comparePassword(user: any, candidate: string) {
  if (!user.password) return false;
  return bcrypt.compare(candidate, user.password);
}

export async function updateUser(id: string, update: Partial<User>) {
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;
  const map: Record<string, string> = {
    name: 'name',
    email: 'email',
    phone: 'phone',
    clerkId: 'clerk_id',
    role: 'role',
  };
  for (const [k, v] of Object.entries(update)) {
    const col = map[k];
    if (!col) continue;
    fields.push(`${col}=$${idx++}`);
    params.push(v);
  }
  if (!fields.length) return await findUserById(id);
  params.push(id);
  await query(`UPDATE users SET ${fields.join(', ')}, updated_at=NOW() WHERE id=$${idx}`, params);
  return await findUserById(id);
}

export async function deleteUser(id: string) {
  await query('DELETE FROM users WHERE id=$1', [id]);
  return true;
}

export async function getAddresses(userId: string) {
  const { rows } = await query<any>('SELECT * FROM addresses WHERE user_id=$1', [userId]);
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    street: r.street,
    city: r.city,
    state: r.state,
    pincode: r.pincode,
    isDefault: r.is_default,
  }));
}

export async function addAddress(userId: string, address: Omit<Address, 'id'> & { id?: string }) {
  const id = address.id ?? genId('adr');
  if (address.isDefault) {
    await query('UPDATE addresses SET is_default=FALSE WHERE user_id=$1', [userId]);
  }
  await query(
    `INSERT INTO addresses (id, user_id, label, street, city, state, pincode, is_default)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
    [id, userId, address.label, address.street, address.city, address.state, address.pincode, address.isDefault]
  );
  return await getAddresses(userId);
}

export async function updateAddress(userId: string, addressId: string, update: Partial<Address>) {
  const currentQ = await query<any>('SELECT * FROM addresses WHERE id=$1 AND user_id=$2', [addressId, userId]);
  if (!currentQ.rows.length) return null;
  if (update.isDefault) {
    await query('UPDATE addresses SET is_default=FALSE WHERE user_id=$1', [userId]);
  }
  const fields: string[] = [];
  const params: any[] = [];
  let idx = 1;
  const map: Record<string, string> = {
    label: 'label', street: 'street', city: 'city', state: 'state', pincode: 'pincode', isDefault: 'is_default',
  };
  for (const [k, v] of Object.entries(update)) {
    const col = map[k];
    if (!col) continue;
    fields.push(`${col}=$${idx++}`);
    params.push(v);
  }
  params.push(addressId, userId);
  await query(`UPDATE addresses SET ${fields.join(', ')} WHERE id=$${idx++} AND user_id=$${idx}`, params);
  return await getAddresses(userId);
}

export async function deleteAddress(userId: string, addressId: string) {
  await query('DELETE FROM addresses WHERE id=$1 AND user_id=$2', [addressId, userId]);
  return await getAddresses(userId);
}

function toApiUser(r: any): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    clerkId: r.clerk_id ?? undefined,
    role: r.role,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    addresses: [],
  };
}
