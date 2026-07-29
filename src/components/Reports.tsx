import React, { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { useApp } from '../context/AppContextWithClub';
import { exportCSV, exportJSON, formatCurrency } from '../utils/format';

export function Reports() {
  const { state } = useApp();
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  const filtered = useMemo(() => {
    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;
    return state.transactions.filter(t => {
      const d = new Date(t.date);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [state.transactions, from, to]);

  const rows = filtered.map(t => ({
    fecha: new Date(t.date).toISOString().slice(0, 10),
    alumno: t.studentName,
    tipo: t.type,
    clase: t.className,
    descripcion: t.description,
    estado: t.status,
    liquidacion: t.settlementKind || '',
    monto: t.amount
  }));

  const total = filtered.reduce((acc, t) => acc + (t.type === 'charge' ? t.amount : 0), 0);

  const handleExportJSON = () => exportJSON(`reportes_${from || 'inicio'}_${to || 'hoy'}`, rows);
  const handleExportCSV = () => exportCSV(`reportes_${from || 'inicio'}_${to || 'hoy'}`, rows);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 animate-slide-in">
        <div className="text-4xl">📊</div>
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reportes y Análisis</h1>
          <p className="text-gray-600">Analiza el rendimiento de tu academia</p>
        </div>
      </div>
      
      <div className="padel-card p-6 animate-slide-in">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Desde</label>
            <input 
              type="date" 
              className="padel-input w-full" 
              value={from} 
              onChange={e => setFrom(e.target.value)} 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">📅 Hasta</label>
            <input 
              type="date" 
              className="padel-input w-full" 
              value={to} 
              onChange={e => setTo(e.target.value)} 
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportJSON} 
            className="btn-padel-secondary flex items-center gap-2 hover-lift"
          >
            <Download size={16} /> 
            <span className="hidden sm:inline">Exportar JSON</span>
            <span className="sm:hidden">JSON</span>
          </button>
          <button 
            onClick={handleExportCSV} 
            className="btn-padel-primary flex items-center gap-2 hover-lift"
          >
            <Download size={16} /> 
            <span className="hidden sm:inline">Exportar CSV</span>
            <span className="sm:hidden">CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="padel-table min-w-full text-sm">
          <thead>
            <tr>
              <th className="py-4 px-4 font-semibold">📅 Fecha</th>
              <th className="py-4 px-4 font-semibold">👤 Alumno</th>
              <th className="py-4 px-4 font-semibold">🏷️ Tipo</th>
              <th className="py-4 px-4 font-semibold">🎾 Clase</th>
              <th className="py-4 px-4 font-semibold">📝 Descripción</th>
              <th className="py-4 px-4 font-semibold">⚡ Estado</th>
              <th className="py-4 px-4 font-semibold">💼 Liquidación</th>
              <th className="py-4 px-4 font-semibold">💰 Monto</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td className="py-3 px-4 font-medium">{r.fecha}</td>
                <td className="py-3 px-4 font-semibold text-gray-800">{r.alumno}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.tipo === 'charge' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {r.tipo}
                  </span>
                </td>
                <td className="py-3 px-4">{r.clase}</td>
                <td className="py-3 px-4">{r.descripcion}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    r.estado === 'Pagado' ? 'badge-presente' : 'badge-pendiente'
                  }`}>
                    {r.estado}
                  </span>
                </td>
                <td className="py-3 px-4">{r.liquidacion}</td>
                <td className="py-3 px-4 font-bold text-lg text-green-600">{formatCurrency(r.monto)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay datos</h3>
                  <p className="text-gray-500">No se encontraron transacciones en el período seleccionado</p>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr className="bg-gradient-to-r from-green-100 to-green-200">
              <td colSpan={7} className="py-4 px-4 font-bold text-right text-green-800">🏆 Total cargos</td>
              <td className="py-4 px-4 font-bold text-xl text-green-700">{formatCurrency(total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      </div>
    </div>
  );
}
