// expo-file-system SDK 55 moved legacy APIs — use the explicit legacy subpath
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { getDatabase } from '../db/database';
import { Customer, Transaction } from '../db/queries';

export async function exportToCSV(businessName: string): Promise<void> {
  const db = await getDatabase();

  const customers = await db.getAllAsync<Customer>('SELECT * FROM customers');
  const transactions = await db.getAllAsync<Transaction>('SELECT * FROM transactions');
  let csvContent = "Khata Book Data Export\n\n";
  csvContent += "--- CUSTOMERS ---\n";
  csvContent += "ID,Name,Phone,Opening Balance,Created At\n";
  customers.forEach(c => {
    csvContent += `"${c.id}","${c.name}","${c.phone ?? ''}","${c.opening_balance}","${c.created_at}"\n`;
  });

  csvContent += "\n--- TRANSACTIONS ---\n";
  csvContent += "ID,Customer ID,Type,Amount,Date,Due Date,Note,Created At\n";
  transactions.forEach(t => {
    // Strip quotes and newlines from notes just in case
    const safeNote = (t.note ?? '').replace(/"/g, '""').replace(/\n/g, ' ');
    csvContent += `"${t.id}","${t.customer_id}","${t.type}","${t.amount}","${t.date}","${t.due_date ?? ''}","${safeNote}","${t.created_at}"\n`;
  });
  const rawDate = new Date().toISOString().split('T')[0];
  const fileUri = FileSystem.documentDirectory + `${businessName.replace(/\s+/g, '_')}_Backup_${rawDate}.csv`;
  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });
  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export CSV Data',
      UTI: 'public.comma-separated-values-text',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}
