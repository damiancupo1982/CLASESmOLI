import React, { useState } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { Student } from '../types';
import { X, Calendar, DollarSign, CheckCircle, XCircle, FileText, Download, Printer } from 'lucide-react';

interface StudentAccountHistoryProps {
  student: Student;
  onClose: () => void;
}

export function StudentAccountHistory({ student, onClose }: StudentAccountHistoryProps) {
  const { state } = useApp();
  const [filterStatus, setFilterStatus] = useState<'all' | 'Presente' | 'Ausente'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredHistory = student.accountHistory?.filter(entry => 
    filterStatus === 'all' || entry.attendanceStatus === filterStatus
  ) || [];

  const totalPresent = student.accountHistory?.filter(entry => entry.attendanceStatus === 'Presente').length || 0;
  const totalAbsent = student.accountHistory?.filter(entry => entry.attendanceStatus === 'Ausente').length || 0;
  const totalAmount = student.accountHistory?.reduce((sum, entry) => sum + entry.amount, 0) || 0;

  const studentTransactions = state.transactions.filter(t => t.studentId === student.id);
  const totalPaid = studentTransactions.filter(t => t.status === 'Pagado').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = studentTransactions.filter(t => t.status === 'Pendiente').reduce((sum, t) => sum + t.amount, 0);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Clase', 'Asistencia', 'Monto', 'Estado Pago'];
    const csvContent = [
      headers.join(','),
      ...filteredHistory.map(entry => {
        const transaction = studentTransactions.find(t => t.classId === entry.classId);
        return [
          formatDate(entry.date),
          `"${entry.className}"`,
          entry.attendanceStatus,
          entry.amount,
          transaction?.status || 'N/A'
        ].join(',');
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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
            .presente { color: #059669; }
            .ausente { color: #dc2626; }
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
            <div class="summary-item">
              <h3>Clases Asistidas</h3>
              <p style="font-size: 24px; font-weight: bold; color: #059669;">${totalPresent}</p>
            </div>
            <div class="summary-item">
              <h3>Ausencias</h3>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${totalAbsent}</p>
            </div>
            <div class="summary-item">
              <h3>Total Pagado</h3>
              <p style="font-size: 24px; font-weight: bold; color: #059669;">${formatCurrency(totalPaid)}</p>
            </div>
            <div class="summary-item">
              <h3>Saldo Pendiente</h3>
              <p style="font-size: 24px; font-weight: bold; color: #dc2626;">${formatCurrency(totalPending)}</p>
            </div>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Clase</th>
                <th>Asistencia</th>
                <th>Monto</th>
                <th>Estado Pago</th>
              </tr>
            </thead>
            <tbody>
              ${filteredHistory.map(entry => {
                const transaction = studentTransactions.find(t => t.classId === entry.classId);
                return `
                  <tr>
                    <td>${formatDate(entry.date)}</td>
                    <td>${entry.className}</td>
                    <td class="${entry.attendanceStatus.toLowerCase()}">${entry.attendanceStatus}</td>
                    <td>${formatCurrency(entry.amount)}</td>
                    <td>${transaction?.status || 'N/A'}</td>
                  </tr>
                `;
              }).join('')}
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <FileText size={24} className="text-blue-600" />
              Cuenta Corriente - {student.name}
            </h2>
            <p className="text-sm text-gray-600">
              DNI: {student.dni} | Teléfono: {student.phone}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={exportToCSV} className="bg-green-600 text-white px-3 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center gap-2">
              <Download size={16} /> CSV
            </button>
            <button onClick={handlePrint} className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Printer size={16} /> Imprimir
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ResumenItem icon={<CheckCircle size={20} className="text-green-600" />} label="Clases Asistidas" value={totalPresent} color="green" />
          <ResumenItem icon={<XCircle size={20} className="text-red-600" />} label="Ausencias" value={totalAbsent} color="red" />
          <ResumenItem icon={<CheckCircle size={20} className="text-green-600" />} label="Total Pagado" value={formatCurrency(totalPaid)} color="green" />
          <ResumenItem icon={<DollarSign size={20} className="text-red-600" />} label="Saldo Pendiente" value={formatCurrency(totalPending)} color="red" />
        </div>

        {/* Filtros */}
        <div className="flex gap-2 mb-4">
          {['all', 'Presente', 'Ausente'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filterStatus === status
                  ? status === 'Presente' ? 'bg-green-600 text-white'
                  : status === 'Ausente' ? 'bg-red-600 text-white'
                  : 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status === 'all' ? 'Todas' : status}s ({student.accountHistory?.filter(e => status === 'all' || e.attendanceStatus === status).length || 0})
            </button>
          ))}
        </div>

        {/* Historial */}
        <div className="bg-white border rounded-lg">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-900">Historial de Clases</h3>
          </div>
          <div className="overflow-x-auto">
            {filteredHistory.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar size={48} className="mx-auto mb-2 text-gray-300" />
                <p>No hay registros de asistencia</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Fecha</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Clase</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Asistencia</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Monto</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Estado Pago</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((entry) => {
                      const transaction = studentTransactions.find(t => t.classId === entry.classId);
                      return (
                        <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-900">{formatDate(entry.date)}</td>
                          <td className="py-3 px-4 text-gray-900">{entry.className}</td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                              entry.attendanceStatus === 'Presente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {entry.attendanceStatus === 'Presente' ? <CheckCircle size={12} /> : <XCircle size={12} />}
                              {entry.attendanceStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`font-medium ${
                              entry.amount > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {formatCurrency(entry.amount)}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {transaction ? (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.status === 'Pagado'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {transaction.status}
                              </span>
                            ) : (
                              <span className="text-gray-400 text-xs">N/A</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Botón cerrar */}
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

function ResumenItem({ icon, label, value, color }) {
  return (
    <div className={`bg-${color}-50 rounded-lg p-4`}>
      <div className="flex items-center gap-2">
        {icon}
        <div>
          <p className={`text-sm font-medium text-${color}-800`}>{label}</p>
          <p className={`text-2xl font-bold text-${color}-900`}>{value}</p>
        </div>
      </div>
    </div>
  );
}