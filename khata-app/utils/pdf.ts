import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Customer, Transaction } from '../db/queries';
import { formatINR, formatDate } from './formatters';
import { APP_NAME } from './constants';

function buildLedgerHTML(
  businessName: string,
  customer: Customer,
  allTransactions: Transaction[],
  startDate?: string,
  endDate?: string
): string {
  // Sort transactions chronologically (oldest first) to compute running balances natively
  const chronological = [...allTransactions].reverse();
  
  let currentBalance = customer.opening_balance;
  let balanceForward = customer.opening_balance;

  // Compute up to start date
  const filteredRows = [];
  let totalCreditInRange = 0;
  let totalDebitInRange = 0;

  for (const tx of chronological) {
    const txDate = tx.date;
    const isBeforeStart = startDate && txDate < startDate;
    const isAfterEnd = endDate && txDate > endDate;

    if (tx.type === 'CREDIT') {
      currentBalance += tx.amount;
    } else {
      currentBalance -= tx.amount;
    }

    if (isBeforeStart) {
      balanceForward = currentBalance;
      continue;
    }

    if (isAfterEnd) continue;

    // Track range totals
    if (tx.type === 'CREDIT') totalCreditInRange += tx.amount;
    if (tx.type === 'DEBIT') totalDebitInRange += tx.amount;

    filteredRows.push({ ...tx, runningBalance: currentBalance });
  }

  // Generate HTML Rows (Map newest first traditionally)
  const rowsHtml = filteredRows
    .reverse()
    .map((tx) => {
      const isCredit = tx.type === 'CREDIT';
      return `
      <tr>
        <td>${formatDate(tx.date)}</td>
        <td>${tx.note ?? '—'}</td>
        <td style="color: #16a34a; font-weight: 600;">${isCredit ? '+' + formatINR(tx.amount) : ''}</td>
        <td style="color: #dc2626; font-weight: 600;">${!isCredit ? '-' + formatINR(tx.amount) : ''}</td>
        <td style="font-weight: 700;">${formatINR(Math.abs(tx.runningBalance))} ${tx.runningBalance >= 0 ? '(Cr)' : '(Dr)'}</td>
      </tr>`;
    })
    .join('');

  // Date formatted strings
  const titleStr = startDate && endDate 
    ? `Statement (${formatDate(startDate)} to ${formatDate(endDate)})` 
    : 'Complete Ledger Statement';

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Ledger – ${customer.name}</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: -apple-system, Arial, sans-serif; color: #0f172a; padding: 32px; }
      header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; }
      .biz-name { font-size: 22px; font-weight: 800; color: #2563eb; }
      .doc-title { font-size: 13px; color: #64748b; margin-top: 4px; font-weight: 500; }
      .customer-block { background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 16px; border: 1px solid #e2e8f0; }
      .customer-name { font-size: 18px; font-weight: 800; }
      .customer-phone { color: #64748b; font-size: 13px; margin-top: 4px; }
      
      .balance-forward { font-size: 13px; font-style: italic; color: #64748b; margin-bottom: 12px; text-align: right; }
      
      table { width: 100%; border-collapse: collapse; font-size: 13px; }
      th { background: #0f172a; color: #fff; text-align: left; padding: 10px 12px; font-weight: 600; }
      td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
      tr:nth-child(even) td { background: #f8fafc; }
      
      .summary { display: flex; gap: 16px; margin-top: 24px; }
      .summary-card { flex: 1; border-radius: 8px; padding: 16px; text-align: center; }
      .summary-card.credit { background: #dcfce7; }
      .summary-card.debit { background: #fee2e2; }
      .summary-card.net { background: #eff6ff; }
      .summary-label { font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
      .summary-value { font-size: 18px; font-weight: 800; margin-top: 4px; }
      .credit .summary-value { color: #16a34a; }
      .debit .summary-value { color: #dc2626; }
      .net .summary-value { color: #2563eb; }
      
      footer { margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 12px; font-size: 11px; color: #94a3b8; text-align: center; }
    </style>
  </head>
  <body>
    <header>
      <div>
        <div class="biz-name">${businessName}</div>
        <div class="doc-title">${titleStr}</div>
      </div>
      <div style="text-align:right; font-size:12px; color:#64748b;">
        Generated: ${new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
      </div>
    </header>

    <div class="customer-block">
      <div class="customer-name">${customer.name}</div>
      ${customer.phone ? `<div class="customer-phone">📞 ${customer.phone}</div>` : ''}
    </div>

    ${startDate ? `<div class="balance-forward">Balance Forward as of ${formatDate(startDate)}: ${formatINR(Math.abs(balanceForward))} ${balanceForward >= 0 ? '(Cr)' : '(Dr)'}</div>` : ''}

    ${
      rowsHtml
        ? `<table>
            <thead>
              <tr>
                <th>Date</th><th>Note</th><th>Udhar (Credit)</th><th>Payment (Debit)</th><th>Balance</th>
              </tr>
            </thead>
            <tbody>${rowsHtml}</tbody>
          </table>`
        : '<p style="color:#64748b; text-align:center; padding:32px 0; border: 1px dashed #cbd5e1; border-radius: 8px;">No transactions recorded in this period</p>'
    }

    <div class="summary">
      <div class="summary-card credit">
        <div class="summary-label">Credit Added</div>
        <div class="summary-value">+${formatINR(totalCreditInRange)}</div>
      </div>
      <div class="summary-card debit">
        <div class="summary-label">Debit Processed</div>
        <div class="summary-value">-${formatINR(totalDebitInRange)}</div>
      </div>
      <div class="summary-card net">
        <div class="summary-label">Ending Balance</div>
        <div class="summary-value">${formatINR(Math.abs(currentBalance))} ${currentBalance >= 0 ? '(Cr)' : '(Dr)'}</div>
      </div>
    </div>

    <footer>Generated seamlessly via ${APP_NAME} • Offline Digital Ledger</footer>
  </body>
  </html>`;
}

export async function exportLedgerPDF(
  businessName: string,
  customer: Customer,
  allTransactions: Transaction[],
  startDate?: string,
  endDate?: string
): Promise<void> {
  try {
    const html = buildLedgerHTML(businessName, customer, allTransactions, startDate, endDate);
    const { uri } = await Print.printToFileAsync({ html, base64: false });
    const canShare = await Sharing.isAvailableAsync();
    
    // Naming convention for export file 
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `${customer.name.replace(/\s+/g, '_')}_Ledger_${dateStr}.pdf`;

    if (canShare) {
      // In Expo Go iOS `dialogTitle` isn't fully enforced file naming, but UTI is mapped.
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: fileName,
        UTI: 'com.adobe.pdf',
      });
    } else {
      await Print.printAsync({ uri });
    }
  } catch (e) {
    console.error('PDF export failed:', e);
    throw e;
  }
}
