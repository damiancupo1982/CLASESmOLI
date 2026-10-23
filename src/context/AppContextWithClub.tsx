import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import {
  AppState, Student, Class, Payment, Invoice, Transaction,
  User, Receipt, AccountEntry
} from '../types';
import { generateRecurringClasses } from '../utils/classRecurrence';
import { createFirebaseServiceWithClub } from '../utils/firebaseWithClub';
import { generateUUID } from '../utils/uuid';

function notifySaveError(message: string) {
  window.dispatchEvent(new CustomEvent('save-error', { detail: { message } }));
}

function safeSave<T>(promise: Promise<T>, label: string): Promise<T> {
  return promise.catch(err => {
    console.error(`Error guardando ${label}:`, err);
    notifySaveError(`No se pudo guardar: ${label}. Revisá tu conexión e intentá de nuevo.`);
    throw err;
  });
}

type ApplyDiscountPayload = {
  studentId: string;
  mode: 'amount' | 'percent';
  value: number;
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
  | { type: 'DELETE_MONTH_CLASSES'; payload: { year: number; month: number } }
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
  currentUser: { id: 'default', name: 'Profesor', role: 'professor' },
  currentClub: null
};

function createAppReducer(clubId: string) {
  const firebaseService = createFirebaseServiceWithClub(clubId);

  return function appReducer(state: AppState, action: Action): AppState {
    let newState: AppState;

    switch (action.type) {
      case 'LOAD_DATA':
        return { ...state, ...action.payload };

      case 'ADD_STUDENT':
        newState = { ...state, students: [...state.students, action.payload] };
        safeSave(firebaseService.saveStudent(action.payload), 'alumno');
        return newState;

      case 'UPDATE_STUDENT':
        newState = {
          ...state,
          students: state.students.map(s => s.id === action.payload.id ? action.payload : s)
        };
        safeSave(firebaseService.updateStudent(action.payload), 'alumno');
        return newState;

      case 'DELETE_STUDENT':
        newState = {
          ...state,
          students: state.students.filter(s => s.id !== action.payload)
        };
        safeSave(firebaseService.deleteStudent(action.payload), 'alumno');
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
            id: generateUUID(),
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

        classesToAdd.forEach(cls => safeSave(firebaseService.saveClass(cls), 'clase'));
        newTransactions.forEach(tx => safeSave(firebaseService.saveTransaction(tx), 'transacción de la clase'));
        return newState;
      }

      case 'UPDATE_CLASS': {
        const updated = action.payload;
        const previous = state.classes.find(c => c.id === updated.id);
        const previousStudentIds = previous?.students || [];
        const updatedClasses = state.classes.map(c => c.id === updated.id ? updated : c);
        const keptStudentIds = new Set(updated.students || []);
        const existingTransactions = state.transactions.filter(t => t.classId === updated.id);
        const transactionsToKeep = state.transactions.filter(t => t.classId !== updated.id || keptStudentIds.has(t.studentId));
        const newTransactions = (updated.students || [])
          .filter(studentId => !existingTransactions.some(t => t.studentId === studentId))
          .map(studentId => ({
            id: generateUUID(),
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
        const updatedTransactions = transactionsToKeep.map(transaction =>
          transaction.classId === updated.id && transaction.status === 'Pendiente'
            ? {
                ...transaction,
                studentName: state.students.find(s => s.id === transaction.studentId)?.name || transaction.studentName,
                className: updated.observations || transaction.className,
                amount: updated.pricePerStudent,
                date: new Date(updated.date),
                description: `Clase ${updated.type}`
              }
            : transaction
        );

        newState = {
          ...state,
          classes: updatedClasses,
          transactions: [...updatedTransactions, ...newTransactions]
        };

        safeSave(firebaseService.updateClass(updated), 'clase');
        newTransactions.forEach(tx => safeSave(firebaseService.saveTransaction(tx), 'transacción de la clase'));
        if (previousStudentIds.some(studentId => !keptStudentIds.has(studentId))) {
          state.transactions
            .filter(t => t.classId === updated.id && !keptStudentIds.has(t.studentId) && t.status === 'Pendiente')
            .forEach(t => safeSave(firebaseService.deleteTransaction(t.id), 'transacción eliminada'));
        }
        updatedTransactions
          .filter(t => t.classId === updated.id && t.status === 'Pendiente')
          .forEach(tx => safeSave(firebaseService.updateTransaction(tx), 'transacción de la clase'));
        return newState;
      }

      case 'DELETE_CLASS': {
        const cid = action.payload;

        newState = {
          ...state,
          classes: state.classes.filter(c => c.id !== cid)
        };

        safeSave(firebaseService.deleteClass(cid), 'clase eliminada');
        return newState;
      }

      case 'DELETE_MONTH_CLASSES': {
        const { year, month } = action.payload;

        const classesToDelete = state.classes.filter(cls => {
          const clsDate = new Date(cls.date);
          return clsDate.getFullYear() === year && clsDate.getMonth() === month;
        });

        console.log(`🗑️ Eliminando ${classesToDelete.length} clases del mes ${month + 1}/${year}`);

        newState = {
          ...state,
          classes: state.classes.filter(cls => {
            const clsDate = new Date(cls.date);
            return !(clsDate.getFullYear() === year && clsDate.getMonth() === month);
          })
        };

        classesToDelete.forEach(cls => safeSave(firebaseService.deleteClass(cls.id), 'clase eliminada del mes'));

        return newState;
      }

      case 'RECORD_ATTENDANCE': {
        const { studentId, classId, attendanceStatus, amount, date, className } = action.payload;
        const existingTransaction = state.transactions.find(t => t.classId === classId && t.studentId === studentId);
        const transaction = attendanceStatus === 'Presente' && !existingTransaction
          ? {
              id: generateUUID(),
              studentId,
              studentName: state.students.find(s => s.id === studentId)?.name || '',
              classId,
              className,
              type: 'charge' as const,
              amount,
              date: new Date(date),
              description: `Clase - ${className}`,
              status: 'Pendiente' as const
            }
          : null;
        const transactions = transaction ? [...state.transactions, transaction] : state.transactions;
        const updatedStudents = state.students.map(student => {
          if (student.id !== studentId) return student;
          const existingEntry = (student.accountHistory || []).find(entry => entry.classId === classId);
          const accountEntry: AccountEntry = {
            id: existingEntry?.id || generateUUID(),
            date: new Date(date),
            className,
            classId,
            attendanceStatus,
            amount: attendanceStatus === 'Presente' ? amount : 0,
            createdAt: existingEntry?.createdAt || new Date(),
            kind: 'class'
          };
          const accountHistory = existingEntry
            ? student.accountHistory.map(entry => entry.id === existingEntry.id ? accountEntry : entry)
            : [...(student.accountHistory || []), accountEntry];
          return {
            ...student,
            accountHistory,
            currentBalance: student.currentBalance + (attendanceStatus === 'Presente' && !existingEntry ? amount : 0)
          };
        });

        newState = { ...state, transactions, students: updatedStudents };
        updatedStudents
          .filter(student => student.id === studentId)
          .forEach(student => safeSave(firebaseService.updateStudent(student), 'alumno (asistencia)'));
        if (transaction) safeSave(firebaseService.saveTransaction(transaction), 'transacción de asistencia');
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
          safeSave(firebaseService.updateTransaction({ ...updatedTransaction, status: action.payload.status }), 'estado de transacción');
        }
        return newState;
      }

      case 'ADD_TRANSACTION':
        newState = {
          ...state,
          transactions: [...state.transactions, action.payload]
        };
        safeSave(firebaseService.saveTransaction(action.payload), 'transacción');
        return newState;

      case 'ADD_RECEIPT':
        newState = { ...state, receipts: [...state.receipts, action.payload] };
        safeSave(firebaseService.saveReceipt(action.payload), 'recibo');
        return newState;

      case 'DELETE_RECEIPT':
        newState = { ...state, receipts: state.receipts.filter(r => r.id !== action.payload) };
        safeSave(firebaseService.deleteReceipt(action.payload), 'recibo eliminado');
        return newState;

      case 'APPLY_DISCOUNT': {
        const { studentId, mode, value, note } = action.payload;

        const pendingTx = state.transactions.filter(t => t.studentId === studentId && t.status === 'Pendiente' && t.amount > 0);
        const totalPending = pendingTx.reduce((acc, t) => acc + t.amount, 0);

        if (totalPending <= 0) return state;

        const discountAmount = Math.min(
          mode === 'amount' ? value : (totalPending * (value / 100)),
          totalPending
        );
        const paidAmount = +(totalPending - discountAmount).toFixed(2);

        const updatedTransactions = state.transactions.map(t => {
          if (t.studentId === studentId && t.status === 'Pendiente') {
            return { ...t, status: 'Pagado' as const, description: `${t.description} (Saldada)` };
          }
          return t;
        });

        const updatedStudents = state.students.map(st => {
          if (st.id !== studentId) return st;
          const entry: AccountEntry = {
            id: generateUUID(),
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

        const student = state.students.find(s => s.id === studentId);
        const discountReceipt: Receipt = {
          id: generateUUID(),
          studentId,
          studentName: student?.name || '',
          date: new Date(),
          transactions: pendingTx.map(t => ({
            id: t.id,
            className: t.className,
            date: new Date(t.date),
            amount: t.amount
          })),
          totalAmount: totalPending,
          discountAmount: discountAmount,
          paidAmount: paidAmount
        };

        newState = {
          ...state,
          students: updatedStudents,
          transactions: updatedTransactions,
          receipts: [...state.receipts, discountReceipt]
        };

        updatedStudents.forEach(student => {
          if (student.id === studentId) {
            safeSave(firebaseService.updateStudent(student), 'alumno (descuento)');
          }
        });
        updatedTransactions.forEach(tx => {
          if (tx.studentId === studentId) {
            safeSave(firebaseService.updateTransaction(tx), 'transacción (descuento)');
          }
        });
        safeSave(firebaseService.saveReceipt(discountReceipt), 'recibo de descuento');
        return newState;
      }

      case 'SET_USER':
        newState = { ...state, currentUser: action.payload };
        safeSave(firebaseService.saveCurrentUser(action.payload), 'usuario');
        return newState;

      default:
        return state;
    }
  };
}

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action>; }>({
  state: initialState,
  dispatch: () => {}
});

export function AppProvider({ children, clubId }: { children: React.ReactNode; clubId: string }) {
  const appReducer = createAppReducer(clubId);
  const [state, dispatch] = useReducer(appReducer, initialState);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const firebaseService = createFirebaseServiceWithClub(clubId);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setSaveError(detail?.message || 'Error al guardar datos.');
    };
    window.addEventListener('save-error', handler);
    return () => window.removeEventListener('save-error', handler);
  }, []);

  useEffect(() => {
    if (!clubId) {
      console.warn('⚠️ No hay clubId, no se pueden cargar datos');
      return;
    }

    const loadData = async () => {
      try {
        setLoadError(null);
        const [students, classes, payments, invoices, transactions, receipts, currentUser] = await Promise.all([
          firebaseService.getAllStudents(),
          firebaseService.getAllClasses(),
          firebaseService.getAllPayments(),
          firebaseService.getAllInvoices(),
          firebaseService.getAllTransactions(),
          firebaseService.getAllReceipts(),
          firebaseService.getCurrentUser()
        ]);

        console.log('📊 Datos cargados de Firebase:');
        console.log('  - Alumnos:', students?.length || 0);
        console.log('  - Clases:', classes?.length || 0);
        console.log('  - Transacciones:', transactions?.length || 0);

        const existingKeys = new Set(
          transactions
            .filter((transaction: Transaction) => transaction.classId)
            .map((transaction: Transaction) => `${transaction.classId}:${transaction.studentId}`)
        );
        const recoveredTransactions = classes.flatMap(classData =>
          classData.students
            .filter(studentId => !existingKeys.has(`${classData.id}:${studentId}`))
            .map(studentId => ({
              id: generateUUID(),
              studentId,
              studentName: students.find(student => student.id === studentId)?.name || '',
              classId: classData.id,
              className: classData.observations || '',
              type: 'charge' as const,
              amount: classData.pricePerStudent,
              date: new Date(classData.date),
              description: `Clase ${classData.type}`,
              status: 'Pendiente' as const
            }))
        );
        recoveredTransactions.forEach(transaction => safeSave(firebaseService.saveTransaction(transaction), 'transacción recuperada'));
        const filteredTransactions = [...transactions, ...recoveredTransactions];

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

        console.log('✅ Datos cargados en el estado exitosamente');
      } catch (error) {
        console.error('❌ Error loading data from Firebase:', error);
        setLoadError('No se pudieron cargar los datos de este club. La información no fue eliminada; revisá la conexión o restaurá un backup.');
      }
    };

    loadData();
  }, [clubId]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {loadError && (
        <div className="mx-auto mt-4 max-w-7xl rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </div>
      )}
      {saveError && (
        <div className="fixed bottom-4 right-4 z-[100] max-w-sm rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-lg animate-slide-in">
          <div className="flex items-start justify-between gap-2">
            <span>{saveError}</span>
            <button
              onClick={() => setSaveError(null)}
              className="text-red-400 hover:text-red-600 flex-shrink-0"
            >
              x
            </button>
          </div>
        </div>
      )}
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
