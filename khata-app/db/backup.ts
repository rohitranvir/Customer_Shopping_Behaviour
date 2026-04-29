import { getDatabase } from './database';
import { User } from './repositories/userRepository';
import { Business } from './repositories/businessRepository';
import { Customer } from './repositories/customerRepository';
import { Transaction } from './repositories/transactionRepository';

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
 * Executes the database wipe and restore from a parsed backup object.
 * Private helper to keep the transaction logic clean.
 */
async function executeRestoreTransaction(backup: DatabaseBackup): Promise<void> {
  const db = await getDatabase();
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

/**
 * Wipes the current database tables and forcefully imports exact rows from the JSON object.
 * Now includes a safety snapshot to prevent data loss on failed restores.
 */
export async function importDatabaseFromJSON(jsonString: string): Promise<void> {
  const backup: DatabaseBackup = JSON.parse(jsonString);
  
  // Create a local snapshot BEFORE attempting to restore the external backup
  const snapshotJson = await exportDatabaseAsJSON();
  const snapshot = JSON.parse(snapshotJson);

  try {
    await executeRestoreTransaction(backup);
  } catch (error) {
    console.error('Restore failed, attempting to rollback to snapshot...', error);
    try {
      // If the restore fails, automatically roll back to the snapshot
      await executeRestoreTransaction(snapshot);
      console.log('Successfully rolled back to snapshot.');
    } catch (rollbackError) {
      console.error('CRITICAL: Rollback failed. Database may be in an inconsistent state.', rollbackError);
      throw new Error('Restore failed and rollback failed. Data may be corrupted.');
    }
    // Throw the original error so the UI knows the restore failed
    throw error;
  }
}
