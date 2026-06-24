import { firebaseService } from '../firebase/firebaseService';
import { Student, Class, Transaction, Receipt, Payment, Invoice } from '../types';

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

export async function migrateLocalStorageToFirebase(): Promise<void> {
  try {
    console.log('Starting migration from localStorage to Firebase...');

    const students: Student[] = JSON.parse(localStorage.getItem('students') || '[]').map(parseLocalStorageDate);
    const classes: Class[] = JSON.parse(localStorage.getItem('classes') || '[]').map(parseLocalStorageDate);
    const transactions: Transaction[] = JSON.parse(localStorage.getItem('transactions') || '[]').map(parseLocalStorageDate);
    const receipts: Receipt[] = JSON.parse(localStorage.getItem('receipts') || '[]').map(parseLocalStorageDate);
    const payments: Payment[] = JSON.parse(localStorage.getItem('payments') || '[]').map(parseLocalStorageDate);
    const invoices: Invoice[] = JSON.parse(localStorage.getItem('invoices') || '[]').map(parseLocalStorageDate);

    console.log(`Found ${students.length} students, ${classes.length} classes, ${transactions.length} transactions`);

    if (students.length > 0) {
      console.log('Migrating students...');
      for (const student of students) {
        await firebaseService.saveStudent(student);
      }
      console.log(`✓ Migrated ${students.length} students`);
    }

    if (classes.length > 0) {
      console.log('Migrating classes...');
      for (const classItem of classes) {
        await firebaseService.saveClass(classItem);
      }
      console.log(`✓ Migrated ${classes.length} classes`);
    }

    if (transactions.length > 0) {
      console.log('Migrating transactions...');
      for (const transaction of transactions) {
        await firebaseService.saveTransaction(transaction);
      }
      console.log(`✓ Migrated ${transactions.length} transactions`);
    }

    if (receipts.length > 0) {
      console.log('Migrating receipts...');
      for (const receipt of receipts) {
        await firebaseService.saveReceipt(receipt);
      }
      console.log(`✓ Migrated ${receipts.length} receipts`);
    }

    if (payments.length > 0) {
      console.log('Migrating payments...');
      for (const payment of payments) {
        await firebaseService.savePayment(payment);
      }
      console.log(`✓ Migrated ${payments.length} payments`);
    }

    if (invoices.length > 0) {
      console.log('Migrating invoices...');
      for (const invoice of invoices) {
        await firebaseService.saveInvoice(invoice);
      }
      console.log(`✓ Migrated ${invoices.length} invoices`);
    }

    console.log('Migration completed successfully!');
    console.log('You can now safely clear your localStorage if desired.');

  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

if (typeof window !== 'undefined') {
  (window as any).migrateToFirebase = migrateLocalStorageToFirebase;
  console.log('Migration utility loaded. Run "migrateToFirebase()" in the console to migrate your data.');
}
