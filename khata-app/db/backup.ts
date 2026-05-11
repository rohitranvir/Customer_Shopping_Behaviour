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
 * Extracts all tables and their rows from the local SQLite DB into a JSON object,
 * isolated only to the active user.
 */
export async function exportDatabaseAsJSON(userId: number): Promise<string> {
  const db = await getDatabase();
  
  const users = await db.getAllAsync<User>('SELECT * FROM users WHERE id = ?', [userId]);
  const business = await db.getAllAsync<Business>('SELECT * FROM business WHERE user_id = ?', [userId]);
  
  const businessIds = business.map(b => b.id);
  let customers: Customer[] = [];
  let transactions: Transaction[] = [];

  if (businessIds.length > 0) {
    const placeholders = businessIds.map(() => '?').join(',');
    customers = await db.getAllAsync<Customer>(
      `SELECT * FROM customers WHERE business_id IN (${placeholders})`,
      businessIds
    );
    
    const customerIds = customers.map(c => c.id);
    if (customerIds.length > 0) {
      const custPlaceholders = customerIds.map(() => '?').join(',');
      transactions = await db.getAllAsync<Transaction>(
        `SELECT * FROM transactions WHERE customer_id IN (${custPlaceholders})`,
        customerIds
      );
    }
  }

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
 * Executes the database restore from a parsed backup object for a specific local user.
 * Merges the business data, and remaps all customer and transaction IDs.
 */
async function executeRestoreTransaction(backup: DatabaseBackup, localUserId: number): Promise<void> {
  const db = await getDatabase();
  
  await db.withTransactionAsync(async () => {
    // 1. Get the local business for this user
    const localBiz = await db.getFirstAsync<Business>('SELECT * FROM business WHERE user_id = ?', [localUserId]);
    if (!localBiz) throw new Error('Local business not found for this user');

    // 2. Wipe current customers and transactions for this local business (clean slate for this user only)
    const localCustomers = await db.getAllAsync<Customer>('SELECT id FROM customers WHERE business_id = ?', [localBiz.id]);
    const localCustomerIds = localCustomers.map(c => c.id);
    if (localCustomerIds.length > 0) {
      const placeholders = localCustomerIds.map(() => '?').join(',');
      await db.runAsync(`DELETE FROM transactions WHERE customer_id IN (${placeholders})`, localCustomerIds);
      await db.runAsync(`DELETE FROM customers WHERE business_id = ?`, [localBiz.id]);
    }

    // 3. Update the local business name/address from backup
    if (backup.business && backup.business.length > 0) {
      const bBackup = backup.business[0];
      await db.runAsync(
        'UPDATE business SET name = ?, address = ?, logo = ? WHERE id = ?',
        [bBackup.name, bBackup.address, bBackup.logo, localBiz.id]
      );
    }

    // 4. Insert Customers with new IDs and build a mapping
    const customerIdMap = new Map<number, number>();
    for (const c of backup.customers) {
      const res = await db.runAsync(
        'INSERT INTO customers (business_id, name, phone, opening_balance, created_at) VALUES (?, ?, ?, ?, ?)',
        [localBiz.id, c.name, c.phone, c.opening_balance, c.created_at]
      );
      customerIdMap.set(c.id, res.lastInsertRowId);
    }

    // 5. Insert Transactions using mapped customer IDs
    for (const t of backup.transactions) {
      const newCustomerId = customerIdMap.get(t.customer_id);
      if (!newCustomerId) continue; // Skip if mapped customer not found (shouldn't happen)

      await db.runAsync(
        'INSERT INTO transactions (customer_id, type, amount, note, date, due_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [newCustomerId, t.type, t.amount, t.note, t.date, t.due_date, t.created_at]
      );
    }
  });
}

/**
 * Imports specific user data from JSON into the current active user, safely remapping IDs to prevent conflicts.
 */
export async function importDatabaseFromJSON(jsonString: string, activeUserId: number): Promise<void> {
  const backup: DatabaseBackup = JSON.parse(jsonString);
  
  // Create a local snapshot BEFORE attempting to restore
  const snapshotJson = await exportDatabaseAsJSON(activeUserId);
  const snapshot = JSON.parse(snapshotJson);

  try {
    await executeRestoreTransaction(backup, activeUserId);
  } catch (error) {
    console.error('Restore failed, attempting to rollback to snapshot...', error);
    try {
      await executeRestoreTransaction(snapshot, activeUserId);
      console.log('Successfully rolled back to snapshot.');
    } catch (rollbackError) {
      console.error('CRITICAL: Rollback failed. Database may be in an inconsistent state.', rollbackError);
      throw new Error('Restore failed and rollback failed. Data may be corrupted.');
    }
    throw error;
  }
}
