import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { Student } from '../types';
import { X, Calendar, DollarSign, CheckCircle, XCircle, FileText, Download, Printer, Receipt, TrendingDown, TrendingUp, Info } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface StudentAccountHistoryProps {
  student: Student;
  onClose: () => void;
}

type HistoryItem = {
  id: string;
  date: Date;
  description: string;
  type: 'class' | 'payment' | 'receipt' | 'discount' | 'attendance';
  amount: number;
  status: string;
  detail?: string;
};

export function StudentAccountHistory({ student, onClose }: StudentAccountHistoryProps) {
  const { state } = useApp();
  const [filterType, setFilterType] = useState<'all' | 'pending' | 'paid'>('all');

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const studentTransactions = useMemo(
    () => state.transactions
      .filter(t => t.studentId === student.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.transactions, student.id]
  );

  const studentReceipts = useMemo(
    () => state.receipts
      .filter(r => r.studentId === student.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [state.receipts, student.id]
  );

  const unifiedHistory = useMemo<HistoryItem[]>(() => {
    const items: HistoryItem[] = [];

    studentTransactions.forEach(tx => {
      const classData = tx.classId ? state.classes.find(c => c.id === tx.classId) : null;
      const isOrphan = tx.classId && !classData;
      items.push({
        id: `tx-${tx.id}`,
        date: new Date(tx.date),
        description: tx.className || tx.description || 'Clase',
        type: tx.type === 'charge' ? 'class' : 'payment',
        amount: tx.amount,
        status: tx.status,
        detail: isOrphan
          ? 'La clase original fue eliminada del calendario, pero el cargo sigue registrado'
          : classData
            ? `Clase de ${classData.type === 'individual' ? 'individual' : 'grupo'} - ${new Date(classData.date).toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })} hs`
            : undefined,
      });
    });

    studentReceipts.forEach(r => {
      items.push({
        id: `receipt-${r.id}`,
        date: new Date(r.date),
        description: `Recibo de cobro`,
        type: 'receipt',
        amount: r.paidAmount ?? r.totalAmount,
        status: r.discountAmount && r.discountAmount > 0 ? `Con descuento de ${formatCurrency(r.discountAmount)}` : 'Completo',
        detail: `${r.transactions.length} clase(s) cobrada(s) - Total: ${formatCurrency(r.totalAmount)}`,
      });
    });

    (student.accountHistory || []).forEach(entry => {
      if (entry.kind === 'discount') {
        items.push({
          id: `disc-${entry.id}`,
          date: new Date(entry.date),
          description: entry.note || 'Descuento aplicado',
          type: 'discount',
          amount: entry.amount,
          status: 'Aplicado',
        });
      } else if (!studentTransactions.some(t => t.classId === entry.classId)) {
        items.push({
          id: `att-${entry.id}`,
          date: new Date(entry.date),
          description: entry.className || 'Asistencia',
          type: 'attendance',
          amount: entry.amount,
          status: entry.attendanceStatus,
        });
      }
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [studentTransactions, studentReceipts, student.accountHistory, state.classes]);

  const filteredHistory = useMemo(() => {
    if (filterType === 'all') return unifiedHistory;
    return unifiedHistory.filter(item => {
      if (filterType === 'pending') return item.status === 'Pendiente';
      if (filterType === 'paid') return item.status === 'Pagado';
      return true;
    });
  }, [unifiedHistory, filterType]);

  const totalCharges = studentTransactions
    .filter(t => t.type === 'charge')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPaid = studentTransactions
    .filter(t => t.status === 'Pagado')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const totalPending = studentTransactions
    .filter(t => t.status === 'Pendiente')
    .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Descripcion', 'Tipo', 'Monto', 'Estado'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(item =>
        [
          formatDate(item.date),
          `"${item.description}"`,
          item.type,
          item.amount,
          `"${item.status}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `cuenta_corriente_${student.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Cuenta Corriente - ${student.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #1f2937; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
            .student-info { background-color: #f9fafb; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .summary { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; }
            .summary-item { background-color: #f3f4f6; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .pagado { color: #059669; }
            .pendiente { color: #dc2626; }
          </style>
        </head>
        <body>
          <h1>Cuenta Corriente</h1>
          <div class="student-info">
            <h2>${student.name}</h2>
            <p><strong>DNI:</strong> ${student.dni}</p>
            <p><strong>Teléfono:</strong> ${student.phone}</p>
            <p><strong>Fecha de generación:</strong> ${new Date().toLocaleDateString('es-AR')}</p>
          </div>
          <div class="summary">
            <div class="summary-item"><h3>Total Cargos</h3><p style="font-size:24px;font-weight:bold;">${formatCurrency(totalCharges)}</p></div>
            <div class="summary-item"><h3>Total Pagado</h3><p style="font-size:24px;font-weight:bold;color:#059669;">${formatCurrency(totalPaid)}</p></div>
            <div class="summary-item"><h3>Saldo Pendiente</h3><p style="font-size:24px;font-weight:bold;color:#dc2626;">${formatCurrency(totalPending)}</p></div>
            <div class="summary-item"><h3>Cantidad de recibos</h3><p style="font-size:24px;font-weight:bold;">${studentReceipts.length}</p></div>
          </div>
          <table>
            <thead><tr><th>Fecha</th><th>Descripción</th><th>Tipo</th><th>Monto</th><th>Estado</th></tr></thead>
            <tbody>
              ${filteredHistory.map(item => `
                <tr>
                  <td>${formatDate(item.date)}</td>
                  <td>${item.description}${item.detail ? '<br><small>' + item.detail + '</small>' : ''}</td>
                  <td>${item.type}</td>
                  <td>${formatCurrency(item.amount)}</td>
                  <td class="${item.status === 'Pagado' ? 'pagado' : item.status === 'Pendiente' ? 'pendiente' : ''}">${item.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const typeConfig = {
    class: { icon: <Calendar size={16} className="text-blue-600" />, label: 'Cargo por clase', color: 'blue' },
    payment: { icon: <DollarSign size={16} className="text-green-600" />, label: 'Pago', color: 'green' },
    receipt: { icon: <Receipt size={16} className="text-purple-600" />, label: 'Recibo', color: 'purple' },
    discount: { icon: <TrendingDown size={16} className="text-orange-600" />, label: 'Descuento', color: 'orange' },
    attendance: { icon: <CheckCircle size={16} className="text-gray-500" />, label: 'Asistencia', color: 'gray' },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Cuenta Corriente - {student.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              DNI: {student.dni} | Tel: {student.phone}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportToCSV} className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2 text-sm">
              <Download size={16} /> CSV
            </button>
            <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <TrendingUp size={20} className="text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Total Cargos</p>
                <p className="text-xl font-bold text-blue-900">{formatCurrency(totalCharges)}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <CheckCircle size={20} className="text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-800">Total Pagado</p>
                <p className="text-xl font-bold text-green-900">{formatCurrency(totalPaid)}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-800">Saldo Pendiente</p>
                <p className="text-xl font-bold text-red-900">{formatCurrency(totalPending)}</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <Receipt size={20} className="text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-800">Recibos emitidos</p>
                <p className="text-xl font-bold text-purple-900">{studentReceipts.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: 'Todo el historial' },
            { key: 'pending', label: 'Pendientes de cobro' },
            { key: 'paid', label: 'Pagados' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilterType(key as any)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filterType === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Unified history table */}
        <div className="bg-white border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">
              Historial completo ({filteredHistory.length} registros)
            </h3>
          </div>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No hay registros para este filtro</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[45vh] overflow-y-auto">
              <table className="w-full">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Concepto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Tipo</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-900">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => {
                    const cfg = typeConfig[item.type];
                    return (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900 text-sm whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-start gap-2">
                            {cfg.icon}
                            <div>
                              <p className="text-gray-900 text-sm font-medium">{item.description}</p>
                              {item.detail && (
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                  <Info size={12} />
                                  {item.detail}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{cfg.label}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-medium text-sm ${
                            item.amount > 0 ? 'text-gray-900'
                            : item.amount < 0 ? 'text-orange-600'
                            : 'text-gray-400'
                          }`}>
                            {formatCurrency(item.amount)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            item.status === 'Pagado' ? 'bg-green-100 text-green-800'
                            : item.status === 'Pendiente' ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-600'
                          }`}>
                            {item.status === 'Pagado' && <CheckCircle size={12} />}
                            {item.status === 'Pendiente' && <XCircle size={12} />}
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Close button */}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
