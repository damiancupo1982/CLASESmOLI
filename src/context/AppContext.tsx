import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  AppState, Student, Class, Payment, Invoice, Transaction,
  User, Receipt, AccountEntry
} from '../types';
import { generateRecurringClasses } from '../utils/classRecurrence';
import { firebaseService } from '../firebase/firebaseService';

type ApplyDiscountPayload = {
  studentId: string;
  mode: 'amount' | 'percent';
  value: number;          // si mode === 'percent' es 0-100
  note?: string;
};

type Action =
  | { type: 'LOAD_DATA'; payload: Partial<AppState> }
  | { type: 'ADD_STUDENT'; payload: Student }
  | { type: 'UPDATE_STUDENT'; payload: Student }
  | { type: 'DELETE_STUDENT'; payload: string }
  | { type: 'ADD_CLASS'; payload: Class }
  | { type: 'UPDATE_CLASS'; payload: Class }
  | { type: 'DELETE_CLASS'; payload: string }
  | { type: 'RECORD_ATTENDANCE'; payload: { studentId: string; classId: string; attendanceStatus: 'Presente' | 'Ausente'; amount: number; date: Date | string; className: string } }
  | { type: 'UPDATE_TRANSACTION_STATUS'; payload: { id: string; status: 'Pendiente' | 'Pagado' } }
  | { type: 'ADD_TRANSACTION'; payload: Transaction }
  | { type: 'ADD_RECEIPT'; payload: Receipt }
  | { type: 'DELETE_RECEIPT'; payload: string }
  | { type: 'APPLY_DISCOUNT'; payload: ApplyDiscountPayload }
  | { type: 'SET_USER'; payload: User };

const initialState: AppState = {
  students: [],
  classes: [],
  payments: [],
  invoices: [],
  transactions: [],
  receipts: [],
  currentUser: { id: 'default', name: 'Profesor', role: 'professor' }
};

function appReducer(state: AppState, action: Action): AppState {
  let newState: AppState;

  switch (action.type) {
    case 'LOAD_DATA':
      return { ...state, ...action.payload };

    case 'ADD_STUDENT':
      newState = { ...state, students: [...state.students, action.payload] };
      firebaseService.saveStudent(action.payload).catch(console.error);
      return newState;

    case 'UPDATE_STUDENT':
      newState = {
        ...state,
        students: state.students.map(s => s.id === action.payload.id ? action.payload : s)
      };
      firebaseService.updateStudent(action.payload).catch(console.error);
      return newState;

    case 'DELETE_STUDENT':
      newState = {
        ...state,
        students: state.students.filter(s => s.id !== action.payload)
      };
      firebaseService.deleteStudent(action.payload).catch(console.error);
      return newState;

    case 'ADD_CLASS': {
      const cls = action.payload;
      let classesToAdd = [cls];

      if (cls.repeating !== 'none') {
        const recurring = generateRecurringClasses(cls).map((rec) => ({
          ...rec,
          students: [...cls.students],
          pricePerStudent: cls.pricePerStudent,
          observations: cls.observations,
          type: cls.type
        }));
        classesToAdd.push(...recurring);
      }

      const updatedClasses = [...state.classes, ...classesToAdd];

      const newTransactions = classesToAdd.flatMap(c =>
        c.students.map(studentId => ({
          id: `${c.id}_${studentId}_${Date.now()}`,
          studentId,
          studentName: state.students.find(s => s.id === studentId)?.name || '',
          classId: c.id,
          className: c.observations || '',
          type: 'charge' as const,
          amount: c.pricePerStudent,
          date: new Date(c.date),
          description: `Clase ${c.type}`,
          status: 'Pendiente' as const
        }))
      );

      newState = {
        ...state,
        classes: updatedClasses,
        transactions: [...state.transactions, ...newTransactions]
      };

      classesToAdd.forEach(cls => firebaseService.saveClass(cls).catch(console.error));
      newTransactions.forEach(tx => firebaseService.saveTransaction(tx).catch(console.error));
      return newState;
    }

    case 'UPDATE_CLASS': {
      const updated = action.payload;

      const updatedClasses = state.classes.map(c =>
        c.id === updated.id ? updated : c
      );

      const updatedTransactions = state.transactions.filter(t => t.classId !== updated.id);

      const newTransactions = (updated.students || []).map(studentId => ({
        id: `${updated.id}_${studentId}_${Date.now()}`,
        studentId,
        studentName: state.students.find(s => s.id === studentId)?.name || '',
        classId: updated.id,
        className: updated.observations || '',
        type: 'charge' as const,
        amount: updated.pricePerStudent,
        date: new Date(updated.date),
        description: `Clase ${updated.type}`,
        status: 'Pendiente' as const
      }));

      newState = {
        ...state,
        classes: updatedClasses,
        transactions: [...updatedTransactions, ...newTransactions]
      };

      firebaseService.updateClass(updated).catch(console.error);
      state.transactions.filter(t => t.classId === updated.id).forEach(t =>
        firebaseService.deleteTransaction(t.id).catch(console.error)
      );
      newTransactions.forEach(tx => firebaseService.saveTransaction(tx).catch(console.error));
      return newState;
    }

    case 'DELETE_CLASS': {
      const cid = action.payload;

      newState = {
        ...state,
        classes: state.classes.filter(c => c.id !== cid),
        transactions: state.transactions.filter(t => t.classId !== cid)
      };

      firebaseService.deleteClass(cid).catch(console.error);
      firebaseService.deleteTransactionsByClassId(cid).catch(console.error);
      return newState;
    }

    case 'RECORD_ATTENDANCE': {
      const { studentId, classId, attendanceStatus, amount, date, className } = action.payload;

      if (attendanceStatus === 'Presente') {
        const transaction: Transaction = {
          id: `${classId}_${studentId}_${Date.now()}`,
          studentId,
          studentName: state.students.find(s => s.id === studentId)?.name || '',
          classId,
          className,
          type: 'charge',
          amount,
          date: new Date(date),
          description: `Clase - ${className}`,
          status: 'Pendiente'
        };

        newState = {
          ...state,
          transactions: [...state.transactions, transaction]
        };
      } else {
        newState = state;
      }

      const updatedStudents = state.students.map(student => {
        if (student.id === studentId) {
          const accountEntry: AccountEntry = {
            id: `${classId}_${studentId}_${Date.now()}`,
            date: new Date(date),
            className,
            classId,
            attendanceStatus,
            amount: attendanceStatus === 'Presente' ? amount : 0,
            createdAt: new Date(),
            kind: 'class'
          };

          return {
            ...student,
            accountHistory: [...(student.accountHistory || []), accountEntry],
            currentBalance: student.currentBalance + (attendanceStatus === 'Presente' ? amount : 0)
          };
        }
        return student;
      });

      newState = {
        ...newState,
        students: updatedStudents
      };

      updatedStudents.forEach(student => {
        if (student.id === studentId) {
          firebaseService.updateStudent(student).catch(console.error);
        }
      });
      if (attendanceStatus === 'Presente' && newState.transactions.length > state.transactions.length) {
        const newTransaction = newState.transactions[newState.transactions.length - 1];
        firebaseService.saveTransaction(newTransaction).catch(console.error);
      }
      return newState;
    }

    case 'UPDATE_TRANSACTION_STATUS': {
      const updatedTransaction = state.transactions.find(t => t.id === action.payload.id);
      newState = {
        ...state,
        transactions: state.transactions.map(t =>
          t.id === action.payload.id ? { ...t, status: action.payload.status } : t
        )
      };
      if (updatedTransaction) {
        firebaseService.updateTransaction({ ...updatedTransaction, status: action.payload.status }).catch(console.error);
      }
      return newState;
    }

    case 'ADD_TRANSACTION':
      newState = {
        ...state,
        transactions: [...state.transactions, action.payload]
      };
      firebaseService.saveTransaction(action.payload).catch(console.error);
      return newState;

    case 'ADD_RECEIPT':
      newState = { ...state, receipts: [...state.receipts, action.payload] };
      firebaseService.saveReceipt(action.payload).catch(console.error);
      return newState;

    case 'DELETE_RECEIPT':
      newState = { ...state, receipts: state.receipts.filter(r => r.id !== action.payload) };
      firebaseService.deleteReceipt(action.payload).catch(console.error);
      return newState;

    case 'APPLY_DISCOUNT': {
      const { studentId, mode, value, note } = action.payload;

      // Transacciones pendientes del alumno
      const pendingTx = state.transactions.filter(t => t.studentId === studentId && t.status === 'Pendiente' && t.amount > 0);
      const totalPending = pendingTx.reduce((acc, t) => acc + t.amount, 0);

      if (totalPending <= 0) return state;

      const discountAmount = Math.min(
        mode === 'amount' ? value : (totalPending * (value / 100)),
        totalPending
      );
      const paidAmount = +(totalPending - discountAmount).toFixed(2);

      // Marcar todas las pendientes como Pagado (indicamos que se saldan con descuento+pago)
      const updatedTransactions = state.transactions.map(t => {
        if (t.studentId === studentId && t.status === 'Pendiente') {
          return { ...t, status: 'Pagado', description: `${t.description} (Saldada)` };
        }
        return t;
      });

      // Asiento en historial del alumno (negativo por el descuento)
      const updatedStudents = state.students.map(st => {
        if (st.id !== studentId) return st;
        const entry: AccountEntry = {
          id: `disc_${studentId}_${Date.now()}`,
          date: new Date(),
          className: 'Descuento sobre total',
          classId: 'descuento-total',
          attendanceStatus: 'Presente',
          amount: -discountAmount,
          createdAt: new Date(),
          kind: 'discount',
          note
        };
        return {
          ...st,
          accountHistory: [...(st.accountHistory || []), entry],
          currentBalance: Math.max(0, st.currentBalance - discountAmount)
        };
      });

      // *** Recibo completo con detalle, saldo total, descuento y pagado ***
      const student = state.students.find(s => s.id === studentId);
      const discountReceipt: Receipt = {
        id: `rcpt_discount_${studentId}_${Date.now()}`,
        studentId,
        studentName: student?.name || '',
        date: new Date(),
        transactions: pendingTx.map(t => ({
          id: t.id,
          className: t.className,
          date: new Date(t.date),
          amount: t.amount // positivo (cargo)
        })),
        totalAmount: totalPending,       // saldo total
        discountAmount: discountAmount,  // descuento aplicado
        paidAmount: paidAmount           // monto abonado (total - descuento)
      };

      newState = {
        ...state,
        students: updatedStudents,
        transactions: updatedTransactions,
        receipts: [...state.receipts, discountReceipt]
      };

      updatedStudents.forEach(student => {
        if (student.id === studentId) {
          firebaseService.updateStudent(student).catch(console.error);
        }
      });
      updatedTransactions.forEach(tx => {
        if (tx.studentId === studentId) {
          firebaseService.updateTransaction(tx).catch(console.error);
        }
      });
      firebaseService.saveReceipt(discountReceipt).catch(console.error);
      return newState;
    }

    case 'SET_USER':
      newState = { ...state, currentUser: action.payload };
      firebaseService.saveCurrentUser(action.payload).catch(console.error);
      return newState;

    default:
      return state;
  }
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action>; }>({
  state: initialState,
  dispatch: () => {}
});

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [students, classes, payments, invoices, transactions, receipts, currentUser] = await Promise.all([
          firebaseService.getAllStudents(),
          firebaseService.getAllClasses(),
          firebaseService.getAllPayments(),
          firebaseService.getAllInvoices(),
          firebaseService.getAllTransactions(),
          firebaseService.getAllReceipts(),
          firebaseService.getCurrentUser()
        ]);

        const filteredTransactions = transactions.filter((t: Transaction) => t.amount !== 0 || t.settlementKind === 'discount');

        dispatch({
          type: 'LOAD_DATA',
          payload: {
            students: students || [],
            classes: classes || [],
            payments: payments || [],
            invoices: invoices || [],
            transactions: filteredTransactions || [],
            receipts: receipts || [],
            currentUser: currentUser || initialState.currentUser
          }
        });
      } catch (error) {
        console.error('Error loading data from Firebase:', error);
        dispatch({
          type: 'LOAD_DATA',
          payload: initialState
        });
      }
    };

    loadData();
  }, []);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
