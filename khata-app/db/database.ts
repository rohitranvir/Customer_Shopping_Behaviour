import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('khata.db');
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = await getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      name      TEXT    NOT NULL,
      phone     TEXT    UNIQUE NOT NULL,
      pin       TEXT    NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS business (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name     TEXT NOT NULL,
      address  TEXT,
      logo     TEXT
    );

    CREATE TABLE IF NOT EXISTS customers (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      business_id     INTEGER NOT NULL REFERENCES business(id) ON DELETE CASCADE,
      name            TEXT    NOT NULL,
      phone           TEXT,
      type            TEXT    DEFAULT 'CUSTOMER',
      opening_balance REAL    DEFAULT 0,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
      type        TEXT    CHECK(type IN ('CREDIT','DEBIT')) NOT NULL,
      amount      REAL    NOT NULL,
      note        TEXT,
      date        TEXT    NOT NULL,
      due_date    TEXT,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
    CREATE INDEX IF NOT EXISTS idx_customers_business ON customers(business_id);
  `);

  // Simple migration for existing databases
  try {
    await database.execAsync(`ALTER TABLE customers ADD COLUMN type TEXT DEFAULT 'CUSTOMER';`);
  } catch (e) {
    // Column already exists
  }
}

export async function resetDatabase(): Promise<void> {
  const database = await getDatabase();
  await database.execAsync(`
    DROP TABLE IF EXISTS transactions;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS business;
    DROP TABLE IF EXISTS users;
  `);
  await initDatabase();
}
