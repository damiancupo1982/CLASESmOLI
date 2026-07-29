import { supabase } from "./config";
import {
  Student,
  Class,
  Transaction,
  Receipt,
  Payment,
  Invoice,
  User,
  Club
} from "../types";

async function ensureAuth(): Promise<void> {
  return Promise.resolve();
}

const convertDatesToISO = (obj: any): any => {
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  if (Array.isArray(obj)) {
    return obj.map(convertDatesToISO);
  }
  if (obj && typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertDatesToISO(obj[key]);
    }
    return converted;
  }
  return obj;
};

const convertISOToDates = (obj: any): any => {
  if (typeof obj === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(obj)) {
    return new Date(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(convertISOToDates);
  }
  if (obj && typeof obj === "object") {
    const converted: any = {};
    for (const key in obj) {
      converted[key] = convertISOToDates(obj[key]);
    }
    return converted;
  }
  return obj;
};

export const firebaseService = {
  async getAllClubs(): Promise<Club[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(d => convertISOToDates(d));
  },

  async getClub(id: string): Promise<Club | null> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data ? convertISOToDates(data) : null;
  },

  async createClub(club: Omit<Club, 'id' | 'createdAt'>): Promise<string> {
    await ensureAuth();
    const clubData = {
      ...club,
      created_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('clubs')
      .insert(clubData)
      .select()
      .single();

    if (error) throw error;
    return data.id;
  },

  async updateClub(clubId: string, updates: Partial<Omit<Club, 'id' | 'createdAt'>>): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('clubs')
      .update(convertDatesToISO(updates))
      .eq('id', clubId);

    if (error) throw error;
  },

  async deleteClub(clubId: string): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('clubs')
      .delete()
      .eq('id', clubId);

    if (error) throw error;
  },

  async verifyClubPassword(clubId: string, password: string): Promise<boolean> {
    const club = await this.getClub(clubId);
    return club?.password === password;
  },

  async getAllStudents(clubId: string): Promise<Student[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('students')
      .select('*, account_entries(*)')
      .eq('club_id', clubId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(student => {
      const accountHistory = (student.account_entries || []).map((entry: any) => ({
        id: entry.id,
        date: new Date(entry.date),
        className: entry.class_name,
        classId: entry.class_id,
        attendanceStatus: entry.attendance_status,
        amount: parseFloat(entry.amount),
        createdAt: new Date(entry.created_at),
        kind: entry.kind,
        note: entry.note
      }));

      return {
        id: student.id,
        name: student.name,
        dni: student.dni,
        phone: student.phone,
        lot: student.lot,
        neighborhood: student.neighborhood,
        condition: student.condition,
        observations: student.observations,
        currentBalance: parseFloat(student.current_balance),
        createdAt: new Date(student.created_at),
        accountHistory
      };
    });
  },

  async getStudent(clubId: string, id: string): Promise<Student | null> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('students')
      .select('*, account_entries(*)')
      .eq('id', id)
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    const accountHistory = (data.account_entries || []).map((entry: any) => ({
      id: entry.id,
      date: new Date(entry.date),
      className: entry.class_name,
      classId: entry.class_id,
      attendanceStatus: entry.attendance_status,
      amount: parseFloat(entry.amount),
      createdAt: new Date(entry.created_at),
      kind: entry.kind,
      note: entry.note
    }));

    return {
      id: data.id,
      name: data.name,
      dni: data.dni,
      phone: data.phone,
      lot: data.lot,
      neighborhood: data.neighborhood,
      condition: data.condition,
      observations: data.observations,
      currentBalance: parseFloat(data.current_balance),
      createdAt: new Date(data.created_at),
      accountHistory
    };
  },

  async saveStudent(clubId: string, student: Student): Promise<void> {
    await ensureAuth();
    const { account_history, ...studentData } = student as any;
    const dbStudent = {
      id: student.id,
      club_id: clubId,
      name: student.name,
      dni: student.dni,
      phone: student.phone,
      lot: student.lot,
      neighborhood: student.neighborhood,
      condition: student.condition,
      observations: student.observations,
      current_balance: student.currentBalance,
      created_at: student.createdAt.toISOString()
    };

    const { error } = await supabase
      .from('students')
      .upsert(dbStudent);

    if (error) throw error;

    if (student.accountHistory && student.accountHistory.length > 0) {
      const entries = student.accountHistory.map(entry => ({
        id: entry.id,
        student_id: student.id,
        date: entry.date.toISOString(),
        class_name: entry.className,
        class_id: entry.classId,
        attendance_status: entry.attendanceStatus,
        amount: entry.amount,
        kind: entry.kind || 'class',
        note: entry.note || '',
        created_at: entry.createdAt.toISOString()
      }));

      const { error: entriesError } = await supabase
        .from('account_entries')
        .upsert(entries);

      if (entriesError) throw entriesError;
    }
  },

  async updateStudent(clubId: string, student: Student): Promise<void> {
    await this.saveStudent(clubId, student);
  },

  async deleteStudent(clubId: string, id: string): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('students')
      .delete()
      .eq('id', id)
      .eq('club_id', clubId);

    if (error) throw error;
  },

  async getAllClasses(clubId: string): Promise<Class[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('club_id', clubId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(cls => ({
      id: cls.id,
      date: new Date(cls.date),
      type: cls.type,
      maxStudents: cls.max_students,
      pricePerStudent: parseFloat(cls.price_per_student),
      observations: cls.observations,
      repeating: cls.repeating,
      students: cls.students || [],
      attendances: cls.attendances || {},
      status: cls.status,
      createdAt: new Date(cls.created_at),
      parentId: cls.parent_id
    }));
  },

  async getClass(clubId: string, id: string): Promise<Class | null> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', id)
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      date: new Date(data.date),
      type: data.type,
      maxStudents: data.max_students,
      pricePerStudent: parseFloat(data.price_per_student),
      observations: data.observations,
      repeating: data.repeating,
      students: data.students || [],
      attendances: data.attendances || {},
      status: data.status,
      createdAt: new Date(data.created_at),
      parentId: data.parent_id
    };
  },

  async saveClass(clubId: string, classData: Class): Promise<void> {
    await ensureAuth();
    const dbClass = {
      id: classData.id,
      club_id: clubId,
      date: classData.date.toISOString(),
      type: classData.type,
      max_students: classData.maxStudents,
      price_per_student: classData.pricePerStudent,
      observations: classData.observations,
      repeating: classData.repeating,
      students: classData.students,
      attendances: classData.attendances,
      status: classData.status,
      parent_id: classData.parentId,
      created_at: classData.createdAt.toISOString()
    };

    const { error } = await supabase
      .from('classes')
      .upsert(dbClass);

    if (error) throw error;
  },

  async updateClass(clubId: string, classData: Class): Promise<void> {
    await this.saveClass(clubId, classData);
  },

  async deleteClass(clubId: string, id: string): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', id)
      .eq('club_id', clubId);

    if (error) throw error;
  },

  async getAllTransactions(clubId: string): Promise<Transaction[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('club_id', clubId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(t => ({
      id: t.id,
      studentId: t.student_id,
      studentName: t.student_name,
      classId: t.class_id,
      className: t.class_name,
      type: t.type,
      amount: parseFloat(t.amount),
      date: new Date(t.date),
      description: t.description,
      status: t.status,
      invoiceId: t.invoice_id,
      settlementKind: t.settlement_kind
    }));
  },

  async getTransaction(clubId: string, id: string): Promise<Transaction | null> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student_name,
      classId: data.class_id,
      className: data.class_name,
      type: data.type,
      amount: parseFloat(data.amount),
      date: new Date(data.date),
      description: data.description,
      status: data.status,
      invoiceId: data.invoice_id,
      settlementKind: data.settlement_kind
    };
  },

  async saveTransaction(clubId: string, transaction: Transaction): Promise<void> {
    await ensureAuth();
    const dbTransaction = {
      id: transaction.id,
      club_id: clubId,
      student_id: transaction.studentId,
      student_name: transaction.studentName,
      class_id: transaction.classId,
      class_name: transaction.className,
      type: transaction.type,
      amount: transaction.amount,
      date: transaction.date.toISOString(),
      description: transaction.description,
      status: transaction.status,
      invoice_id: transaction.invoiceId,
      settlement_kind: transaction.settlementKind
    };

    const { error } = await supabase
      .from('transactions')
      .upsert(dbTransaction);

    if (error) throw error;
  },

  async updateTransaction(clubId: string, transaction: Transaction): Promise<void> {
    await this.saveTransaction(clubId, transaction);
  },

  async deleteTransaction(clubId: string, id: string): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('club_id', clubId);

    if (error) throw error;
  },

  async deleteTransactionsByClassId(clubId: string, classId: string): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('class_id', classId)
      .eq('club_id', clubId);

    if (error) throw error;
  },

  async getAllReceipts(clubId: string): Promise<Receipt[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('club_id', clubId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      studentId: r.student_id,
      studentName: r.student_name,
      date: new Date(r.date),
      transactions: r.transactions || [],
      totalAmount: parseFloat(r.total_amount),
      discountAmount: r.discount_amount ? parseFloat(r.discount_amount) : undefined,
      paidAmount: r.paid_amount ? parseFloat(r.paid_amount) : undefined
    }));
  },

  async getReceipt(clubId: string, id: string): Promise<Receipt | null> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('receipts')
      .select('*')
      .eq('id', id)
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      studentId: data.student_id,
      studentName: data.student_name,
      date: new Date(data.date),
      transactions: data.transactions || [],
      totalAmount: parseFloat(data.total_amount),
      discountAmount: data.discount_amount ? parseFloat(data.discount_amount) : undefined,
      paidAmount: data.paid_amount ? parseFloat(data.paid_amount) : undefined
    };
  },

  async saveReceipt(clubId: string, receipt: Receipt): Promise<void> {
    await ensureAuth();
    const dbReceipt = {
      id: receipt.id,
      club_id: clubId,
      student_id: receipt.studentId,
      student_name: receipt.studentName,
      date: receipt.date.toISOString(),
      transactions: receipt.transactions,
      total_amount: receipt.totalAmount,
      discount_amount: receipt.discountAmount,
      paid_amount: receipt.paidAmount
    };

    const { error } = await supabase
      .from('receipts')
      .upsert(dbReceipt);

    if (error) throw error;
  },

  async deleteReceipt(clubId: string, id: string): Promise<void> {
    await ensureAuth();
    const { error } = await supabase
      .from('receipts')
      .delete()
      .eq('id', id)
      .eq('club_id', clubId);

    if (error) throw error;
  },

  async getAllPayments(clubId: string): Promise<Payment[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('club_id', clubId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(p => ({
      id: p.id,
      studentId: p.student_id,
      amount: parseFloat(p.amount),
      method: p.method,
      date: new Date(p.date),
      description: p.description,
      invoiceId: p.invoice_id,
      transactionIds: p.transaction_ids || []
    }));
  },

  async savePayment(clubId: string, payment: Payment): Promise<void> {
    await ensureAuth();
    const dbPayment = {
      id: payment.id,
      club_id: clubId,
      student_id: payment.studentId,
      amount: payment.amount,
      method: payment.method,
      date: payment.date.toISOString(),
      description: payment.description,
      invoice_id: payment.invoiceId,
      transaction_ids: payment.transactionIds
    };

    const { error } = await supabase
      .from('payments')
      .upsert(dbPayment);

    if (error) throw error;
  },

  async getAllInvoices(clubId: string): Promise<Invoice[]> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('club_id', clubId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(i => ({
      id: i.id,
      studentId: i.student_id,
      number: i.number,
      date: new Date(i.date),
      items: i.items || [],
      subtotal: parseFloat(i.subtotal),
      total: parseFloat(i.total),
      status: i.status,
      paymentMethod: i.payment_method,
      paidAt: i.paid_at ? new Date(i.paid_at) : undefined
    }));
  },

  async saveInvoice(clubId: string, invoice: Invoice): Promise<void> {
    await ensureAuth();
    const dbInvoice = {
      id: invoice.id,
      club_id: clubId,
      student_id: invoice.studentId,
      number: invoice.number,
      date: invoice.date.toISOString(),
      items: invoice.items,
      subtotal: invoice.subtotal,
      total: invoice.total,
      status: invoice.status,
      payment_method: invoice.paymentMethod,
      paid_at: invoice.paidAt ? invoice.paidAt.toISOString() : null
    };

    const { error } = await supabase
      .from('invoices')
      .upsert(dbInvoice);

    if (error) throw error;
  },

  async getCurrentUser(clubId: string): Promise<User | null> {
    await ensureAuth();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('club_id', clubId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  async saveCurrentUser(clubId: string, user: User): Promise<void> {
    await ensureAuth();
    const dbUser = {
      id: user.id,
      club_id: clubId,
      name: user.name,
      role: user.role
    };

    const { error } = await supabase
      .from('users')
      .upsert(dbUser);

    if (error) throw error;
  }
};
