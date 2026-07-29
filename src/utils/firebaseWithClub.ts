import { firebaseService } from '../firebase/firebaseService';
import { Student, Class, Transaction, Receipt, Payment, Invoice, User } from '../types';

export function createFirebaseServiceWithClub(clubId: string) {
  return {
    async getAllStudents() {
      return firebaseService.getAllStudents(clubId);
    },
    async getStudent(id: string) {
      return firebaseService.getStudent(clubId, id);
    },
    async saveStudent(student: Student) {
      return firebaseService.saveStudent(clubId, student);
    },
    async updateStudent(student: Student) {
      return firebaseService.updateStudent(clubId, student);
    },
    async deleteStudent(id: string) {
      return firebaseService.deleteStudent(clubId, id);
    },
    async getAllClasses() {
      return firebaseService.getAllClasses(clubId);
    },
    async getClass(id: string) {
      return firebaseService.getClass(clubId, id);
    },
    async saveClass(classData: Class) {
      return firebaseService.saveClass(clubId, classData);
    },
    async updateClass(classData: Class) {
      return firebaseService.updateClass(clubId, classData);
    },
    async deleteClass(id: string) {
      return firebaseService.deleteClass(clubId, id);
    },
    async getAllTransactions() {
      return firebaseService.getAllTransactions(clubId);
    },
    async getTransaction(id: string) {
      return firebaseService.getTransaction(clubId, id);
    },
    async saveTransaction(transaction: Transaction) {
      return firebaseService.saveTransaction(clubId, transaction);
    },
    async updateTransaction(transaction: Transaction) {
      return firebaseService.updateTransaction(clubId, transaction);
    },
    async deleteTransaction(id: string) {
      return firebaseService.deleteTransaction(clubId, id);
    },
    async deleteTransactionsByClassId(classId: string) {
      return firebaseService.deleteTransactionsByClassId(clubId, classId);
    },
    async getAllReceipts() {
      return firebaseService.getAllReceipts(clubId);
    },
    async getReceipt(id: string) {
      return firebaseService.getReceipt(clubId, id);
    },
    async saveReceipt(receipt: Receipt) {
      return firebaseService.saveReceipt(clubId, receipt);
    },
    async deleteReceipt(id: string) {
      return firebaseService.deleteReceipt(clubId, id);
    },
    async getAllPayments() {
      return firebaseService.getAllPayments(clubId);
    },
    async savePayment(payment: Payment) {
      return firebaseService.savePayment(clubId, payment);
    },
    async getAllInvoices() {
      return firebaseService.getAllInvoices(clubId);
    },
    async saveInvoice(invoice: Invoice) {
      return firebaseService.saveInvoice(clubId, invoice);
    },
    async getCurrentUser() {
      return firebaseService.getCurrentUser(clubId);
    },
    async saveCurrentUser(user: User) {
      return firebaseService.saveCurrentUser(clubId, user);
    }
  };
}
