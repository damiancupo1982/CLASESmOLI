export const STORAGE_KEYS = {
  STUDENTS: 'students',
  CLASSES: 'classes',
  PAYMENTS: 'payments',
  INVOICES: 'invoices',
  TRANSACTIONS: 'transactions',
  CURRENT_USER: 'currentUser'
};

export function loadFromStorage(key: string, fallback: any = null) {
  const data = localStorage.getItem(key);
  if (!data) return fallback;
  
  try {
    const parsed = JSON.parse(data);
    
    // Convertir fechas en estudiantes y su historial de cuenta
    if (key === STORAGE_KEYS.STUDENTS && Array.isArray(parsed)) {
      return parsed.map(student => ({
        ...student,
        createdAt: new Date(student.createdAt),
        accountHistory: (student.accountHistory || []).map(entry => ({
          ...entry,
          date: new Date(entry.date),
          createdAt: new Date(entry.createdAt)
        }))
      }));
    }
    
    // Convertir fechas en clases
    if (key === STORAGE_KEYS.CLASSES && Array.isArray(parsed)) {
      return parsed.map(cls => ({
        ...cls,
        date: new Date(cls.date),
        createdAt: new Date(cls.createdAt)
      }));
    }
    
    // Convertir fechas en transacciones
    if (key === STORAGE_KEYS.TRANSACTIONS && Array.isArray(parsed)) {
      return parsed.map(transaction => ({
        ...transaction,
        date: new Date(transaction.date)
      }));
    }
    
    // Convertir fechas en pagos
    if (key === STORAGE_KEYS.PAYMENTS && Array.isArray(parsed)) {
      return parsed.map(payment => ({
        ...payment,
        date: new Date(payment.date)
      }));
    }
    
    // Convertir fechas en facturas
    if (key === STORAGE_KEYS.INVOICES && Array.isArray(parsed)) {
      return parsed.map(invoice => ({
        ...invoice,
        date: new Date(invoice.date),
        paidAt: invoice.paidAt ? new Date(invoice.paidAt) : undefined
      }));
    }
    
    return parsed;
  } catch (error) {
    console.error('Error parsing stored data:', error);
    return fallback;
  }
}

export function saveToStorage(key: string, value: any) {
  localStorage.setItem(key, JSON.stringify(value));
}
