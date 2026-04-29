import { getDatabase } from '../database';

export interface Transaction {
  id: number;
  customer_id: number;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  note: string | null;
  date: string;
  due_date: string | null;
  created_at: string;
  customer_name?: string;
}

export const TransactionRepository = {
  async create(
    customerId: number,
    type: 'CREDIT' | 'DEBIT',
    amount: number,
    note?: string,
    date?: string,
    dueDate?: string
  ): Promise<number> {
    const db = await getDatabase();
    const txDate = date ?? new Date().toISOString().split('T')[0];
    
    let lastInsertRowId = 0;
    // Use a transaction for safety
    await db.withTransactionAsync(async () => {
      const result = await db.runAsync(
        'INSERT INTO transactions (customer_id, type, amount, note, date, due_date) VALUES (?, ?, ?, ?, ?, ?)',
        [customerId, type, amount, note ?? null, txDate, dueDate ?? null]
      );
      lastInsertRowId = result.lastInsertRowId;
    });
    
    return lastInsertRowId;
  },

  async getByCustomer(customerId: number): Promise<Transaction[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Transaction>(
      'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC, created_at DESC',
      [customerId]
    );
  },

  async delete(id: number): Promise<void> {
    const db = await getDatabase();
    await db.withTransactionAsync(async () => {
      await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
    });
  },

  async update(
    id: number,
    amount: number,
    note?: string,
    date?: string,
    dueDate?: string
  ): Promise<void> {
    const db = await getDatabase();
    const txDate = date ?? new Date().toISOString().split('T')[0];
    await db.withTransactionAsync(async () => {
      await db.runAsync(
        'UPDATE transactions SET amount = ?, note = ?, date = ?, due_date = ? WHERE id = ?',
        [amount, note ?? null, txDate, dueDate ?? null, id]
      );
    });
  },
};
