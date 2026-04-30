import { getDatabase } from '../database';
import { Customer } from './customerRepository';
import { Transaction } from './transactionRepository';

export interface BusinessSummary {
  total_customers: number;
  total_credit: number;
  total_debit: number;
  net_balance: number;
  customers_with_due: number;
}

export const ReportRepository = {
  async getBusinessSummary(businessId: number): Promise<BusinessSummary> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<BusinessSummary>(
      `SELECT
         COUNT(c.id) AS total_customers,
         COALESCE(SUM(CASE WHEN t_sums.balance > 0 THEN t_sums.balance ELSE 0 END), 0) AS total_credit,
         COALESCE(SUM(CASE WHEN t_sums.balance < 0 THEN ABS(t_sums.balance) ELSE 0 END), 0) AS total_debit,
         COALESCE(SUM(t_sums.balance), 0) AS net_balance,
         COALESCE(SUM(CASE WHEN t_sums.has_due > 0 THEN 1 ELSE 0 END), 0) AS customers_with_due
       FROM customers c
       LEFT JOIN (
         SELECT c_inner.id as customer_id,
           c_inner.opening_balance + COALESCE(SUM(CASE WHEN t.type = 'CREDIT' THEN t.amount WHEN t.type = 'DEBIT' THEN -t.amount ELSE 0 END), 0) as balance,
           MAX(CASE WHEN t.due_date IS NOT NULL AND t.due_date < date('now') THEN 1 ELSE 0 END) AS has_due
         FROM customers c_inner
         LEFT JOIN transactions t ON t.customer_id = c_inner.id
         GROUP BY c_inner.id
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
  },

  async getRecentTransactions(businessId: number, limit: number = 10): Promise<Transaction[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Transaction>(
      `SELECT t.*, c.name as customer_name 
       FROM transactions t
       JOIN customers c ON t.customer_id = c.id
       WHERE c.business_id = ?
       ORDER BY t.date DESC, t.id DESC
       LIMIT ?`,
      [businessId, limit]
    );
  },

  async getOverdueCustomers(businessId: number): Promise<Customer[]> {
    const db = await getDatabase();
    return await db.getAllAsync<Customer>(
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
  },
};
