import { getDatabase } from './database';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface User {
  id: number;
  name: string;
  phone: string;
  pin: string;
  created_at: string;
}

export interface Business {
  id: number;
  user_id: number;
  name: string;
  address: string | null;
  logo: string | null;
}

export interface Customer {
  id: number;
  business_id: number;
  name: string;
  phone: string | null;
  opening_balance: number;
  created_at: string;
  // computed
  balance?: number;
  last_tx_date?: string | null;
  is_overdue?: boolean;
}

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

// ─── User Queries ─────────────────────────────────────────────────────────────

export async function createUser(
  name: string,
  phone: string,
  pin: string
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO users (name, phone, pin) VALUES (?, ?, ?)',
    [name, phone, pin]
  );
  return result.lastInsertRowId;
}

export async function getUser(): Promise<User | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<User>('SELECT * FROM users LIMIT 1');
  return row ?? null;
}

export async function updateUserPin(userId: number, newPin: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('UPDATE users SET pin = ? WHERE id = ?', [newPin, userId]);
}

// ─── Business Queries ─────────────────────────────────────────────────────────

export async function createBusiness(
  userId: number,
  name: string,
  address?: string,
  logo?: string
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO business (user_id, name, address, logo) VALUES (?, ?, ?, ?)',
    [userId, name, address ?? null, logo ?? null]
  );
  return result.lastInsertRowId;
}

export async function getBusinessByUser(userId: number): Promise<Business | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Business>(
    'SELECT * FROM business WHERE user_id = ? LIMIT 1',
    [userId]
  );
  return row ?? null;
}

export async function getBusinessesByUser(userId: number): Promise<Business[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Business>(
    'SELECT * FROM business WHERE user_id = ?',
    [userId]
  );
  return rows;
}

export async function updateBusiness(
  businessId: number,
  name: string,
  address?: string,
  logo?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE business SET name = ?, address = ?, logo = ? WHERE id = ?',
    [name, address ?? null, logo ?? null, businessId]
  );
}

// ─── Customer Queries ─────────────────────────────────────────────────────────

export async function createCustomer(
  businessId: number,
  name: string,
  phone?: string,
  openingBalance: number = 0
): Promise<number> {
  const db = await getDatabase();
  const result = await db.runAsync(
    'INSERT INTO customers (business_id, name, phone, opening_balance) VALUES (?, ?, ?, ?)',
    [businessId, name, phone ?? null, openingBalance]
  );
  return result.lastInsertRowId;
}

export async function getAllCustomers(businessId: number): Promise<Customer[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Customer>(
    `SELECT c.*,
       (c.opening_balance +
        COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount
                          WHEN t.type = 'DEBIT'  THEN -t.amount ELSE 0 END), 0)
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
  return rows;
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<Customer>(
    `SELECT c.*,
       (c.opening_balance +
        COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount
                          WHEN t.type = 'DEBIT'  THEN -t.amount ELSE 0 END), 0)
       ) AS balance
     FROM customers c
     LEFT JOIN transactions t ON t.customer_id = c.id
     WHERE c.id = ?
     GROUP BY c.id`,
    [id]
  );
  return row ?? null;
}

export async function updateCustomer(
  id: number,
  name: string,
  phone?: string
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    'UPDATE customers SET name = ?, phone = ? WHERE id = ?',
    [name, phone ?? null, id]
  );
}

export async function deleteCustomer(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
}

// ─── Transaction Queries ──────────────────────────────────────────────────────

export async function createTransaction(
  customerId: number,
  type: 'CREDIT' | 'DEBIT',
  amount: number,
  note?: string,
  date?: string,
  dueDate?: string
): Promise<number> {
  const db = await getDatabase();
  const txDate = date ?? new Date().toISOString().split('T')[0];
  const result = await db.runAsync(
    'INSERT INTO transactions (customer_id, type, amount, note, date, due_date) VALUES (?, ?, ?, ?, ?, ?)',
    [customerId, type, amount, note ?? null, txDate, dueDate ?? null]
  );
  return result.lastInsertRowId;
}

export async function getTransactionsByCustomer(customerId: number): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE customer_id = ? ORDER BY date DESC, created_at DESC',
    [customerId]
  );
  return rows;
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function updateTransaction(
  id: number,
  amount: number,
  note?: string,
  date?: string,
  dueDate?: string
): Promise<void> {
  const db = await getDatabase();
  const txDate = date ?? new Date().toISOString().split('T')[0];
  await db.runAsync(
    'UPDATE transactions SET amount = ?, note = ?, date = ?, due_date = ? WHERE id = ?',
    [amount, note ?? null, txDate, dueDate ?? null, id]
  );
}

// ─── Report / Summary Queries ─────────────────────────────────────────────────

export interface BusinessSummary {
  total_customers: number;
  total_credit: number;
  total_debit: number;
  net_balance: number;
  customers_with_due: number;
}

export async function getBusinessSummary(businessId: number): Promise<BusinessSummary> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<BusinessSummary>(
    `SELECT
       COUNT(c.id) AS total_customers,
       COALESCE(SUM(t_sums.total_credit), 0) AS total_credit,
       COALESCE(SUM(t_sums.total_debit), 0) AS total_debit,
       COALESCE(SUM(c.opening_balance), 0) + COALESCE(SUM(t_sums.net_tx), 0) AS net_balance,
       COALESCE(SUM(CASE WHEN t_sums.has_due > 0 THEN 1 ELSE 0 END), 0) AS customers_with_due
     FROM customers c
     LEFT JOIN (
       SELECT customer_id,
         SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END) AS total_credit,
         SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END) AS total_debit,
         SUM(CASE WHEN type = 'CREDIT' THEN amount WHEN type = 'DEBIT' THEN -amount ELSE 0 END) AS net_tx,
         MAX(CASE WHEN due_date IS NOT NULL AND due_date < date('now') THEN 1 ELSE 0 END) AS has_due
       FROM transactions
       GROUP BY customer_id
     ) t_sums ON t_sums.customer_id = c.id
     WHERE c.business_id = ?`,
    [businessId]
  );
  return row ?? {
    total_customers: 0,
    total_credit: 0,
    total_debit: 0,
    net_balance: 0,
    customers_with_due: 0,
  };
}

export async function searchCustomers(businessId: number, query: string): Promise<Customer[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Customer>(
    `SELECT c.*,
       (c.opening_balance +
        COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount
                          WHEN t.type = 'DEBIT'  THEN -t.amount ELSE 0 END), 0)
       ) AS balance,
       MAX(t.date) AS last_tx_date,
       MAX(CASE WHEN t.due_date IS NOT NULL AND t.due_date < date('now') THEN 1 ELSE 0 END) AS is_overdue
     FROM customers c
     LEFT JOIN transactions t ON t.customer_id = c.id
     WHERE c.business_id = ? AND (c.name LIKE ? OR c.phone LIKE ?)
     GROUP BY c.id
     ORDER BY balance DESC, c.name ASC`,
    [businessId, `%${query}%`, `%${query}%`]
  );
  return rows;
}

export async function getRecentTransactions(businessId: number, limit: number = 10): Promise<Transaction[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<Transaction>(
    `SELECT t.*, c.name as customer_name 
     FROM transactions t
     JOIN customers c ON t.customer_id = c.id
     WHERE c.business_id = ?
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    [businessId, limit]
  );
  return rows;
}

export async function getOverdueCustomers(businessId: number): Promise<Customer[]> {
  const db = await getDatabase();
  // Fetch customers with a positive balance (they owe money) and at least one past due transaction
  const rows = await db.getAllAsync<Customer>(
    `SELECT c.*,
       (c.opening_balance +
        COALESCE(SUM(CASE WHEN t2.type = 'CREDIT' THEN t2.amount
                          WHEN t2.type = 'DEBIT'  THEN -t2.amount ELSE 0 END), 0)
       ) AS balance
     FROM customers c
     LEFT JOIN transactions t2 ON t2.customer_id = c.id
     WHERE c.business_id = ? AND EXISTS (
       SELECT 1 FROM transactions t 
       WHERE t.customer_id = c.id AND t.due_date IS NOT NULL AND t.due_date < date('now')
     )
     GROUP BY c.id
     HAVING balance > 0
     ORDER BY balance DESC`,
    [businessId]
  );
  return rows;
}

