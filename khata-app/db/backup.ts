import { getDatabase } from './database';
import { User, Business, Customer, Transaction } from './queries';

export interface DatabaseBackup {
  users: User[];
  business: Business[];
  customers: Customer[];
  transactions: Transaction[];
  exported_at: string;
}

/**
 * Extracts all tables and their rows from the local SQLite DB into a JSON object.
 */
export async function exportDatabaseAsJSON(): Promise<string> {
  const db = await getDatabase();
  
  const users = await db.getAllAsync<User>('SELECT * FROM users');
  const business = await db.getAllAsync<Business>('SELECT * FROM business');
  const customers = await db.getAllAsync<Customer>('SELECT * FROM customers');
  const transactions = await db.getAllAsync<Transaction>('SELECT * FROM transactions');

  const backup: DatabaseBackup = {
    users,
    business,
    customers,
    transactions,
    exported_at: new Date().toISOString(),
  };

  return JSON.stringify(backup);
}

/**
 * Wipes the current database tables and forcefully imports exact rows from the JSON object.
 * Warning: This completely destroys all existing local data.
 */
export async function importDatabaseFromJSON(jsonString: string): Promise<void> {
  const db = await getDatabase();
  const backup: DatabaseBackup = JSON.parse(jsonString);

  // Use a transaction to ensure rollback if an error occurs during restore
  await db.withTransactionAsync(async () => {
    // 1. Wipe current tables safely
    await db.runAsync('DELETE FROM transactions');
    await db.runAsync('DELETE FROM customers');
    await db.runAsync('DELETE FROM business');
    await db.runAsync('DELETE FROM users');

    // 2. Insert Users
    for (const u of backup.users) {
      await db.runAsync(
        'INSERT INTO users (id, name, phone, pin, created_at) VALUES (?, ?, ?, ?, ?)',
        [u.id, u.name, u.phone, u.pin, u.created_at]
      );
    }

    // 3. Insert Businesses
    for (const b of backup.business) {
      await db.runAsync(
        'INSERT INTO business (id, user_id, name, address, logo) VALUES (?, ?, ?, ?, ?)',
        [b.id, b.user_id, b.name, b.address, b.logo]
      );
    }

    // 4. Insert Customers
    for (const c of backup.customers) {
      await db.runAsync(
        'INSERT INTO customers (id, business_id, name, phone, opening_balance, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [c.id, c.business_id, c.name, c.phone, c.opening_balance, c.created_at]
      );
    }

    // 5. Insert Transactions
    for (const t of backup.transactions) {
      await db.runAsync(
        'INSERT INTO transactions (id, customer_id, type, amount, note, date, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [t.id, t.customer_id, t.type, t.amount, t.note, t.date, t.due_date, t.created_at]
      );
    }
  });
}
