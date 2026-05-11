import { getDatabase } from '../database';
import { hashPin } from '../../security/pin';

export interface User {
  id: number;
  name: string;
  phone: string;
  pin: string; // stored as SHA-256 hash
  created_at: string;
}

export const UserRepository = {
  async create(name: string, phone: string, rawPin: string): Promise<number> {
    const db = await getDatabase();
    const pinHash = await hashPin(rawPin);
    const result = await db.runAsync(
      'INSERT INTO users (name, phone, pin) VALUES (?, ?, ?)',
      [name, phone, pinHash]
    );
    return result.lastInsertRowId;
  },

  async getFirst(): Promise<User | null> {
    const db = await getDatabase();
    return (await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1')) ?? null;
  },

  async getAll(): Promise<User[]> {
    const db = await getDatabase();
    return await db.getAllAsync<User>('SELECT * FROM users ORDER BY created_at ASC');
  },

  async updatePin(userId: number, rawPin: string): Promise<void> {
    const db = await getDatabase();
    const pinHash = await hashPin(rawPin);
    await db.runAsync('UPDATE users SET pin = ? WHERE id = ?', [pinHash, userId]);
  },

  /**
   * One-time migration: if existing PIN is unhashed (length < 64),
   * hash it and update. Safe to call repeatedly.
   */
  async migratePin(user: User): Promise<User> {
    if (user.pin.length < 64) {
      await UserRepository.updatePin(user.id, user.pin);
      return { ...user, pin: await hashPin(user.pin) };
    }
    return user;
  },
};
