import { getDatabase } from '../database';

export interface Business {
  id: number;
  user_id: number;
  name: string;
  address: string | null;
  logo: string | null;
}

export const BusinessRepository = {
  async create(userId: number, name: string, address?: string, logo?: string): Promise<number> {
    const db = await getDatabase();
    const result = await db.runAsync(
      'INSERT INTO business (user_id, name, address, logo) VALUES (?, ?, ?, ?)',
      [userId, name, address ?? null, logo ?? null]
    );
    return result.lastInsertRowId;
  },

  async getByUser(userId: number): Promise<Business[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Business>(
      'SELECT * FROM business WHERE user_id = ? ORDER BY id ASC',
      [userId]
    );
  },

  async getFirst(userId: number): Promise<Business | null> {
    const db = await getDatabase();
    return (
      (await db.getFirstAsync<Business>(
        'SELECT * FROM business WHERE user_id = ? LIMIT 1',
        [userId]
      )) ?? null
    );
  },

  async update(id: number, name: string, address?: string, logo?: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      'UPDATE business SET name = ?, address = ?, logo = ? WHERE id = ?',
      [name, address ?? null, logo ?? null, id]
    );
  },
};
