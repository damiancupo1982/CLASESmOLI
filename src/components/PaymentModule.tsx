import React, { useState } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { FileText, X, Check } from 'lucide-react';

export function PaymentModule() {
  const { state, dispatch } = useApp();
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);

  const studentsWithDebt = state.students.filter(s => s.currentBalance < 0);

  const getPendingTransactions = (studentId: string) => {
    return state.transactions.filter(t => t.studentId === studentId && !t.paid);
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(amount);

  const openPaymentModal = (student: any) => {
    setSelectedStudent({
      ...student,
      charges: getPendingTransactions(student.id).map(t => ({
        ...t,
        selected: true,
        editableAmount: t.amount,
      })),
    });
    setShowModal(true);
  };

  const handleToggleClass = (index: number) => {
    const updated = [...selectedStudent.charges];
    updated[index].selected = !updated[index].selected;
    setSelectedStudent({ ...selectedStudent, charges: updated });
  };

  const handleAmountChange = (index: number, value: string) => {
    const updated = [...selectedStudent.charges];
    updated[index].editableAmount = parseFloat(value) || 0;
    setSelectedStudent({ ...selectedStudent, charges: updated });
  };

  const total = selectedStudent?.charges
    ?.filter(c => c.selected)
    .reduce((sum, c) => sum + (c.editableAmount || 0), 0) || 0;

  const handleConfirmPayment = () => {
    const paidTransactions = selectedStudent.charges.filter(c => c.selected);

    // Mark transactions as paid
    paidTransactions.forEach(tx => {
      dispatch({ type: 'MARK_TRANSACTION_PAID', payload: tx.id });
    });

    // Create receipt
    dispatch({
      type: 'ADD_RECEIPT',
      payload: {
        id: crypto.randomUUID(),
        studentId: selectedStudent.id,
        studentName: selectedStudent.name,
        date: new Date().toISOString(),
        paymentMethod: 'Efectivo',
        transactions: paidTransactions.map(t => ({
          id: t.id,
          date: t.date,
          amount: t.editableAmount,
          className: t.description || 'Clase',
        })),
        totalAmount: total,
      },
    });

    setShowModal(false);
    setSelectedStudent(null);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Facturación</h1>
      <div className="space-y-4">
        {studentsWithDebt.map(student => (
          <div
            key={student.id}
            className="flex justify-between items-center border p-4 rounded-lg bg-white shadow"
          >
            <div>
              <p className="text-lg font-medium">{student.name}</p>
              <p className="text-sm text-gray-500">
                {getPendingTransactions(student.id).length} clase(s) -{' '}
                {formatCurrency(Math.abs(student.currentBalance))}
              </p>
            </div>
            <button
              onClick={() => openPaymentModal(student)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Cobrar
            </button>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {showModal && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Cobro a {selectedStudent.name}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-black">
                <X />
              </button>
            </div>

            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {selectedStudent.charges.map((t, index) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between border rounded-md p-3 bg-gray-50"
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={t.selected}
                      onChange={() => handleToggleClass(index)}
                    />
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(t.date).toLocaleDateString('es-AR')}
                      </p>
                    </div>
                  </div>
                  <input
                    type="number"
                    value={t.editableAmount}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    className="w-24 border rounded px-2 py-1 text-right"
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-6 border-t pt-4">
              <strong>Total:</strong>
              <span className="text-lg font-bold text-green-600">{formatCurrency(total)}</span>
            </div>

            <button
              onClick={handleConfirmPayment}
              disabled={total <= 0}
              className="mt-4 w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition disabled:opacity-50"
            >
              Confirmar Cobro - {formatCurrency(total)}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
