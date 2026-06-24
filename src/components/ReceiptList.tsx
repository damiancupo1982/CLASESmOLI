import React from 'react';
import { useApp } from '../context/AppContextWithClub';
import { FileText, Printer } from 'lucide-react';

export function ReceiptList() {
  const { state } = useApp();

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);

  const handlePrint = (receiptId: string) => {
    const receipt = state.receipts.find(r => r.id === receiptId);
    if (!receipt) return;

    const student = state.students.find(s => s.id === receipt.studentId);
    const receiptTransactions = state.transactions.filter(t =>
      receipt.transactions.includes(t.id)
    );

    const content = `
      <html>
        <head>
          <title>Recibo</title>
          <style>
            body { font-family: sans-serif; padding: 24px; }
            h2 { margin-bottom: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 12px; }
            td, th { border: 1px solid #ccc; padding: 8px; text-align: left; }
          </style>
        </head>
        <body>
          <h2>Recibo #${receipt.id}</h2>
          <p><strong>Alumno:</strong> ${student?.name}</p>
          <p><strong>Método de pago:</strong> ${receipt.method}</p>
          <p><strong>Fecha:</strong> ${new Date(receipt.createdAt).toLocaleDateString('es-AR')}</p>

          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              ${receiptTransactions.map(t => `
                <tr>
                  <td>${t.description}</td>
                  <td>${formatCurrency(t.amount)}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr>
                <td><strong>Total</strong></td>
                <td><strong>${formatCurrency(receipt.amount)}</strong></td>
              </tr>
            </tfoot>
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText size={20} />
        Recibos Emitidos
      </h2>
      {state.receipts.length === 0 ? (
        <p className="text-gray-500 text-sm">Todavía no se han generado recibos.</p>
      ) : (
        <div className="space-y-3">
          {state.receipts.map(receipt => {
            const student = state.students.find(s => s.id === receipt.studentId);
            return (
              <div
                key={receipt.id}
                className="border rounded-md p-4 flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{student?.name || 'Alumno'}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(receipt.createdAt).toLocaleDateString('es-AR')} — {receipt.method}
                  </p>
                  <p className="text-green-700 font-semibold">
                    {formatCurrency(receipt.amount)}
                  </p>
                </div>
                <button
                  onClick={() => handlePrint(receipt.id)}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-md flex items-center gap-2"
                >
                  <Printer size={16} />
                  Imprimir
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
