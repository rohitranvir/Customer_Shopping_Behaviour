import { getDatabase } from '../database';

export interface Customer {
  id: number;
  business_id: number;
  name: string;
  phone: string | null;
  type: 'CUSTOMER' | 'SUPPLIER';
  opening_balance: number;
  created_at: string;
  // computed
  balance?: number;
  last_tx_date?: string | null;
  is_overdue?: boolean;
}

export const CustomerRepository = {
  async create(businessId: number, name: string, phone?: string, openingBalance: number = 0, type: 'CUSTOMER' | 'SUPPLIER' = 'CUSTOMER'): Promise<number> {
    const db = await getDatabase();
    
    // Explicitly verify business exists to prevent foreign key constraint errors
    // when Zustand state is out of sync with SQLite database
    const businessExists = await db.getFirstAsync('SELECT id FROM business WHERE id = ?', [businessId]);
    if (!businessExists) {
      throw new Error('Business profile not found in database. Please log out and log in again to sync your profile.');
    }

    try {
      const result = await db.runAsync(
        'INSERT INTO customers (business_id, name, phone, opening_balance, type) VALUES (?, ?, ?, ?, ?)',
        [businessId, name, phone ?? null, openingBalance, type]
      );
      return result.lastInsertRowId;
    } catch (error: any) {
      if (error.message?.includes('FOREIGN KEY')) {
        throw new Error('Business reference is invalid or missing. Please restart the app.');
      }
      throw error;
    }
  },

  async getAll(businessId: number): Promise<Customer[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Customer>(
      `SELECT c.*,
         (c.opening_balance +
          COALESCE(SUM(CASE WHEN t.type = 'DEBIT' THEN t.amount
                            WHEN t.type = 'CREDIT' THEN -t.amount ELSE 0 END), 0)
         ) AS balance,
         MAX(t.date) AS last_tx_date,
         MAX(CASE WHEN t.due_date IS NOT NULL AND t.due_date < date('now') THEN 1 ELSE 0 END) AS is_overdue
       FROM customers c
       LEFT JOIN transactions t ON t.customer_id = c.id
       WHERE c.business_id = ?
       GROUP BY c.id
       ORDER BY balance DESC, c.name ASC`,
      [businessId]
    );
  },

  async getById(id: number): Promise<Customer | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<Customer>(
      `SELECT c.*,
         (c.opening_balance +
          COALESCE(SUM(CASE WHEN t.type = 'DEBIT' THEN t.amount
                            WHEN t.type = 'CREDIT' THEN -t.amount ELSE 0 END), 0)
         ) AS balance
       FROM customers c
       LEFT JOIN transactions t ON t.customer_id = c.id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );
    return row ?? null;
  },

  async update(id: number, name: string, phone?: string, type?: 'CUSTOMER' | 'SUPPLIER'): Promise<void> {
    const db = await getDatabase();
    if (type) {
      await db.runAsync(
        'UPDATE customers SET name = ?, phone = ?, type = ? WHERE id = ?',
        [name, phone ?? null, type, id]
      );
    } else {
      await db.runAsync(
        'UPDATE customers SET name = ?, phone = ? WHERE id = ?',
        [name, phone ?? null, id]
      );
    }
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    // Wrap in transaction just in case, though PRAGMA foreign_keys = ON handles cascades
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
    });
  },

  async search(businessId: number, query: string, type?: 'CUSTOMER' | 'SUPPLIER'): Promise<Customer[]> {
    const db = await getDatabase();
    const likeQuery = `%${query}%`;
    if (type) {
      return await db.getAllAsync<Customer>(
        `SELECT c.*,
           (c.opening_balance +
            COALESCE(SUM(CASE WHEN t.type = 'DEBIT' THEN t.amount
                              WHEN t.type = 'CREDIT' THEN -t.amount ELSE 0 END), 0)
           ) AS balance,
           MAX(t.date) AS last_tx_date,
           MAX(CASE WHEN t.due_date IS NOT NULL AND t.due_date < date('now') THEN 1 ELSE 0 END) AS is_overdue
         FROM customers c
         LEFT JOIN transactions t ON t.customer_id = c.id
         WHERE c.business_id = ? AND c.type = ? AND (c.name LIKE ? OR c.phone LIKE ?)
         GROUP BY c.id
         ORDER BY balance DESC, c.name ASC`,
        [businessId, type, likeQuery, likeQuery]
      );
    }
    return await db.getAllAsync<Customer>(
      `SELECT c.*,
         (c.opening_balance +
          COALESCE(SUM(CASE WHEN t.type = 'DEBIT' THEN t.amount
                            WHEN t.type = 'CREDIT' THEN -t.amount ELSE 0 END), 0)
         ) AS balance,
         MAX(t.date) AS last_tx_date,
         MAX(CASE WHEN t.due_date IS NOT NULL AND t.due_date < date('now') THEN 1 ELSE 0 END) AS is_overdue
       FROM customers c
       LEFT JOIN transactions t ON t.customer_id = c.id
       WHERE c.business_id = ? AND (c.name LIKE ? OR c.phone LIKE ?)
       GROUP BY c.id
       ORDER BY balance DESC, c.name ASC`,
      [businessId, likeQuery, likeQuery]
    );
  },
};
