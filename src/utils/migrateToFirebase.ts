import { Student, Class, Transaction, Receipt, Payment, Invoice } from '../types';
import { createFirebaseServiceWithClub } from './firebaseWithClub';

type LegacyData = {
  students: Student[];
  classes: Class[];
  transactions: Transaction[];
  receipts: Receipt[];
  payments: Payment[];
  invoices: Invoice[];
};

const parseLocalStorageDate = (item: any) => {
  if (item.date) item.date = new Date(item.date);
  if (item.createdAt) item.createdAt = new Date(item.createdAt);
  if (item.paidAt) item.paidAt = new Date(item.paidAt);

  if (item.accountHistory) {
    item.accountHistory = item.accountHistory.map((entry: any) => ({
      ...entry,
      date: new Date(entry.date),
      createdAt: new Date(entry.createdAt)
    }));
  }

  if (item.transactions) {
    item.transactions = item.transactions.map((tx: any) => ({
      ...tx,
      date: new Date(tx.date)
    }));
  }

  return item;
};

export function readLegacyData(): LegacyData {
  return {
    students: JSON.parse(localStorage.getItem('students') || '[]').map(parseLocalStorageDate),
    classes: JSON.parse(localStorage.getItem('classes') || '[]').map(parseLocalStorageDate),
    transactions: JSON.parse(localStorage.getItem('transactions') || '[]').map(parseLocalStorageDate),
    receipts: JSON.parse(localStorage.getItem('receipts') || '[]').map(parseLocalStorageDate),
    payments: JSON.parse(localStorage.getItem('payments') || '[]').map(parseLocalStorageDate),
    invoices: JSON.parse(localStorage.getItem('invoices') || '[]').map(parseLocalStorageDate)
  };
}

export function hasLegacyData(): boolean {
  if (typeof window === 'undefined') return false;
  const data = readLegacyData();
  return Object.values(data).some(items => items.length > 0);
}

export async function migrateLocalStorageToClub(clubId: string): Promise<void> {
  const data = readLegacyData();
  const service = createFirebaseServiceWithClub(clubId);

  for (const student of data.students) await service.saveStudent(student);
  for (const classItem of data.classes) await service.saveClass(classItem);
  for (const transaction of data.transactions) await service.saveTransaction(transaction);
  for (const receipt of data.receipts) await service.saveReceipt(receipt);
  for (const payment of data.payments) await service.savePayment(payment);
  for (const invoice of data.invoices) await service.saveInvoice(invoice);
}

if (typeof window !== 'undefined') {
  (window as any).migrateToFirebase = async (clubId?: string) => {
    const savedClub = JSON.parse(localStorage.getItem('currentClub') || 'null');
    const targetClubId = clubId || savedClub?.id;
    if (!targetClubId) throw new Error('Selecciona o crea un club antes de migrar los datos.');
    await migrateLocalStorageToClub(targetClubId);
  };
}
