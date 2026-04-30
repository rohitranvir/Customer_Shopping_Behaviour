/**
 * db/seed.ts
 * Inserts fake test data into the database for development/QA testing.
 * Safe to call multiple times — skips customers that already exist by phone number.
 */
import { getDatabase } from './database';

interface SeedCustomer {
  name: string;
  phone: string;
  opening_balance: number;
  type: 'CUSTOMER' | 'SUPPLIER';
}

interface SeedTransaction {
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  note: string;
  date: string;       // YYYY-MM-DD
  due_date?: string;  // YYYY-MM-DD
}

const SEED_CUSTOMERS: { customer: SeedCustomer; transactions: SeedTransaction[] }[] = [
  {
    customer: {
      name: 'Amit Sharma',
      phone: '9876543210',
      opening_balance: 0,
      type: 'CUSTOMER',
    },
    transactions: [
      { type: 'DEBIT',  amount: 300, note: 'Grocery items',  date: '2024-04-01', due_date: '2024-04-15' },
      { type: 'DEBIT',  amount: 400, note: 'Monthly ration', date: '2024-04-10', due_date: '2024-04-25' },
      { type: 'CREDIT', amount: 200, note: 'Partial payment', date: '2024-04-20' },
      // Net balance: 300 + 400 - 200 = ₹500 due (they owe me)
    ],
  },
  {
    customer: {
      name: 'Priya Patel',
      phone: '8765432109',
      opening_balance: 0,
      type: 'CUSTOMER',
    },
    transactions: [
      { type: 'CREDIT', amount: 500, note: 'Advance payment', date: '2024-04-05' },
      { type: 'DEBIT',  amount: 200, note: 'Purchased goods', date: '2024-04-12' },
      { type: 'CREDIT', amount: 100, note: 'Extra advance',   date: '2024-04-18' },
      // Net balance: 200 - 500 - 100 = -₹400 advance (I owe them)
      // But user wants ₹200 advance so adjusted:
      { type: 'DEBIT',  amount: 200, note: 'Adjustment',      date: '2024-04-22' },
      // Net: 200 + 200 - 500 - 100 = -₹200 advance
    ],
  },
  {
    customer: {
      name: 'Rahul Singh',
      phone: '7654321098',
      opening_balance: 0,
      type: 'CUSTOMER',
    },
    transactions: [
      { type: 'DEBIT',  amount: 1000, note: 'Wholesale purchase', date: '2024-03-15', due_date: '2024-03-30' },
      { type: 'DEBIT',  amount:  800, note: 'Monthly supplies',   date: '2024-04-01', due_date: '2024-04-15' },
      { type: 'CREDIT', amount:  300, note: 'Partial payment',    date: '2024-04-10' },
      // Net: 1000 + 800 - 300 = ₹1500 due (they owe me)
    ],
  },
  {
    customer: {
      name: 'Sunita Desai',
      phone: '6543210987',
      opening_balance: 0,
      type: 'CUSTOMER',
    },
    transactions: [
      { type: 'DEBIT',  amount: 450, note: 'Household items', date: '2024-02-20' },
      { type: 'CREDIT', amount: 250, note: 'Cash payment',    date: '2024-03-05' },
      { type: 'CREDIT', amount: 200, note: 'Final payment',   date: '2024-03-25' },
      // Net: 450 - 250 - 200 = ₹0 (fully settled)
    ],
  },
];

/**
 * Inserts seed customers and their transactions for a given businessId.
 * Skips any customer whose phone number already exists in the database.
 * Returns the count of customers actually inserted.
 */
export async function seedTestData(businessId: number): Promise<number> {
  const db = await getDatabase();
  let inserted = 0;

  await db.withTransactionAsync(async () => {
    for (const entry of SEED_CUSTOMERS) {
      const { customer, transactions } = entry;

      // Check if this customer already exists by phone number under this business
      const existing = await db.getFirstAsync<{ id: number }>(
        'SELECT id FROM customers WHERE phone = ? AND business_id = ?',
        [customer.phone, businessId]
      );

      if (existing) {
        // Skip — already seeded
        continue;
      }

      // Insert the customer
      const result = await db.runAsync(
        'INSERT INTO customers (business_id, name, phone, opening_balance, type) VALUES (?, ?, ?, ?, ?)',
        [businessId, customer.name, customer.phone, customer.opening_balance, customer.type]
      );
      const customerId = result.lastInsertRowId;

      // Insert all transactions for this customer
      for (const tx of transactions) {
        await db.runAsync(
          'INSERT INTO transactions (customer_id, type, amount, note, date, due_date) VALUES (?, ?, ?, ?, ?, ?)',
          [customerId, tx.type, tx.amount, tx.note, tx.date, tx.due_date ?? null]
        );
      }

      inserted++;
    }
  });

  return inserted;
}
