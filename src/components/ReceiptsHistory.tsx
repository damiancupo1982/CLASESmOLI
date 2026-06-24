import React, { useMemo, useState } from 'react';
import { Download, Search, Eye, Printer, X } from 'lucide-react';
import { useApp } from '../context/AppContextWithClub';
import { exportCSV, exportJSON, formatCurrency } from '../utils/format';

export function ReceiptsHistory() {
  const { state } = useApp();

  // ── Filtros ──────────────────────────────────────────────────────────────────
  const [query, setQuery] = useState('');               // búsqueda libre por nombre
  const [studentId, setStudentId] = useState<string>(''); // filtro exacto por alumno
  const [dateFrom, setDateFrom] = useState<string>(''); // YYYY-MM-DD
  const [dateTo, setDateTo] = useState<string>('');

  // Preview/print
  const [previewId, setPreviewId] = useState<string | null>(null);

  const S = (v: any) => (typeof v === 'string' ? v : v?.toString?.() ?? '');
  const norm = (v: any) => S(v).toLowerCase();

  const studentsOptions = useMemo(() => {
    const uniq = new Map<string, string>();
    (state.students || []).forEach(s => uniq.set(s.id, s.name));
    return Array.from(uniq.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' }));
  }, [state.students]);

  const inDateRange = (d: Date) => {
    const ts = d.getTime();
    if (dateFrom) {
      const from = new Date(`${dateFrom}T00:00:00`);
      if (ts < from.getTime()) return false;
    }
    if (dateTo) {
      const to = new Date(`${dateTo}T23:59:59.999`);
      if (ts > to.getTime()) return false;
    }
    return true;
  };

  const filteredReceipts = useMemo(() => {
    const q = norm(query);
    return (state.receipts ?? [])
      .filter(r => {
        if (studentId && r.studentId !== studentId) return false;
        if (q && !norm(r?.studentName).includes(q)) return false;
        const dt = new Date(r?.date ?? 0);
        if (!inDateRange(dt)) return false;
        return true;
      })
      .sort((a, b) =>
        new Date(b?.date ?? 0).getTime() - new Date(a?.date ?? 0).getTime() ||
        S(a?.studentName).localeCompare(S(b?.studentName), 'es', { sensitivity: 'base' })
      );
  }, [state.receipts, query, studentId, dateFrom, dateTo]);

  // Normaliza un recibo a columnas
  const mapToRow = (r: any) => {
    const subTotal = Number(r?.totalAmount ?? 0);
    const discountExplicit = Number(r?.discountAmount ?? 0);
    const paidMaybe = r?.paidAmount != null ? Number(r.paidAmount) : undefined;

    const discountDerived = paidMaybe != null ? Math.max(0, subTotal - paidMaybe) : 0;
    const descuento = discountExplicit > 0 ? discountExplicit : discountDerived;

    const saldoTotal = Math.max(0, subTotal - descuento);
    const abonado = paidMaybe != null ? Math.min(paidMaybe, saldoTotal) : saldoTotal;

    const itemCount = Array.isArray(r?.transactions) ? r.transactions.length : 0;

    return {
      id: r?.id,
      fecha: new Date(r?.date ?? 0).toISOString().slice(0, 10),
      alumno: S(r?.studentName),
      item: itemCount,
      subTotal,
      descuento,
      saldoTotal,
      abonado
    };
  };

  const rows = filteredReceipts.map(mapToRow);

  const handleExportJSON = () => exportJSON('recibos_filtrados', rows);
  const handleExportCSV = () =>
    exportCSV('recibos_filtrados', rows.map(r => ({
      fecha: r.fecha,
      alumno: r.alumno,
      item: r.item,
      'sub-total': r.subTotal,
      descuento: r.descuento,
      'saldo total (sub total - descuento)': r.saldoTotal,
      'monto abonado': r.abonado
    })));

  const clearFilters = () => {
    setQuery('');
    setStudentId('');
    setDateFrom('');
    setDateTo('');
  };

  const receiptById = (id: string | null) =>
    (state.receipts ?? []).find(r => String(r.id) === String(id)) || null;

  const openPrintWindow = (receiptId: string) => {
    const r = receiptById(receiptId);
    if (!r) return;

    const subTotal = Number(r?.totalAmount ?? 0);
    const discountExplicit = Number(r?.discountAmount ?? 0);
    const paidMaybe = r?.paidAmount != null ? Number(r.paidAmount) : undefined;
    const discountDerived = paidMaybe != null ? Math.max(0, subTotal - paidMaybe) : 0;
    const descuento = discountExplicit > 0 ? discountExplicit : discountDerived;
    const saldoTotal = Math.max(0, subTotal - descuento);
    const abonado = paidMaybe != null ? Math.min(paidMaybe, saldoTotal) : saldoTotal;

    const dateStr = new Date(r.date).toLocaleString('es-AR');
    const itemsHtml = (r.transactions || [])
      .map((it: any) => `
        <tr>
          <td style="padding:6px;border-bottom:1px solid #eee;">${S(it.className)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;">${new Date(it.date).toISOString().slice(0,10)}</td>
          <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(Number(it.amount||0))}</td>
        </tr>
      `).join('');

    const html = `
<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>Recibo ${S(r.id)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,"Helvetica Neue",Arial,"Noto Sans",sans-serif;padding:24px;color:#111}
    .card{max-width:720px;margin:0 auto;border:1px solid #e5e7eb;border-radius:12px;padding:20px}
    .header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .title{font-size:18px;font-weight:700}
    .meta{color:#6b7280;font-size:12px}
    table{width:100%;border-collapse:collapse;font-size:14px;margin-top:10px}
    .tot{font-weight:700}
    .foot{margin-top:16px;font-size:12px;color:#6b7280}
    @media print { .noprint{display:none} }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <div>
        <div class="title">Recibo</div>
        <div class="meta">ID: ${S(r.id)}</div>
      </div>
      <div class="meta" style="text-align:right">
        <div>Alumno: ${S(r.studentName)}</div>
        <div>Fecha: ${dateStr}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr style="text-align:left;color:#374151">
          <th style="padding:6px;border-bottom:1px solid #e5e7eb;">Detalle</th>
          <th style="padding:6px;border-bottom:1px solid #e5e7eb;">Fecha</th>
          <th style="padding:6px;border-bottom:1px solid #e5e7eb;text-align:right;">Monto</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml || '<tr><td colspan="3" style="padding:12px;color:#6b7280;text-align:center">Sin items</td></tr>'}
      </tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:8px;text-align:right" class="tot">Sub-total</td>
          <td style="padding:8px;text-align:right" class="tot">${formatCurrency(subTotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px;text-align:right">Descuento</td>
          <td style="padding:8px;text-align:right">${formatCurrency(descuento)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px;text-align:right" class="tot">Saldo total (sub total - descuento)</td>
          <td style="padding:8px;text-align:right" class="tot">${formatCurrency(saldoTotal)}</td>
        </tr>
        <tr>
          <td colspan="2" style="padding:8px;text-align:right">Monto abonado</td>
          <td style="padding:8px;text-align:right">${formatCurrency(abonado)}</td>
        </tr>
      </tfoot>
    </table>

    <div class="foot">
      * Este recibo puede reimprimirse cuantas veces sea necesario.
    </div>

    <div class="noprint" style="margin-top:16px;text-align:right">
      <button onclick="window.print()" style="padding:8px 12px;border:1px solid #e5e7eb;border-radius:8px;background:#111;color:#fff;cursor:pointer">Imprimir</button>
    </div>
  </div>
</body>
</html>
    `.trim();

    const w = window.open('', '_blank', 'noopener,noreferrer,width=900,height=700');
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        {/* Barra de filtros */}
        <div className="flex flex-col lg:flex-row gap-3 lg:items-end lg:justify-between mb-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">
            {/* Buscar por nombre */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Buscar por alumno..."
                className="w-full sm:w-64 pl-9 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {/* Filtro exacto por alumno */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Alumno</label>
              <select
                className="w-full sm:w-56 border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Todos</option>
                {studentsOptions.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Rango de fechas */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Desde</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hasta</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Limpiar */}
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-2 px-3 py-2 border rounded-md self-start"
              title="Limpiar filtros"
            >
              <X size={16} /> Limpiar
            </button>
          </div>

          {/* Exportaciones respetan los filtros */}
          <div className="flex items-center gap-2">
            <button onClick={handleExportJSON} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md">
              <Download size={16} /> Exportar JSON
            </button>
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md">
              <Download size={16} /> Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2">Fecha</th>
                <th className="py-2">Alumno</th>
                <th className="py-2">Item</th>
                <th className="py-2">Sub-total</th>
                <th className="py-2">Descuento</th>
                <th className="py-2">Saldo total (sub total - descuento)</th>
                <th className="py-2">Monto abonado</th>
                <th className="py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={String(r.id)} className="border-t">
                  <td className="py-2">{r.fecha}</td>
                  <td className="py-2">{r.alumno}</td>
                  <td className="py-2">{r.item}</td>
                  <td className="py-2">{formatCurrency(r.subTotal)}</td>
                  <td className="py-2">{formatCurrency(r.descuento)}</td>
                  <td className="py-2">{formatCurrency(r.saldoTotal)}</td>
                  <td className="py-2">{formatCurrency(r.abonado)}</td>
                  <td className="py-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewId(String(r.id))}
                        className="inline-flex items-center gap-1 px-2 py-1 border rounded-md"
                        title="Previsualizar"
                      >
                        <Eye size={16} /> Ver
                      </button>
                      <button
                        onClick={() => openPrintWindow(String(r.id))}
                        className="inline-flex items-center gap-1 px-2 py-1 border rounded-md"
                        title="Imprimir"
                      >
                        <Printer size={16} /> Imprimir
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-gray-500">No hay recibos con los filtros aplicados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de previsualización */}
      {previewId && (() => {
        const r = receiptById(previewId);
        if (!r) return null;
        const subTotal = Number(r?.totalAmount ?? 0);
        const discountExplicit = Number(r?.discountAmount ?? 0);
        const paidMaybe = r?.paidAmount != null ? Number(r.paidAmount) : undefined;
        const discountDerived = paidMaybe != null ? Math.max(0, subTotal - paidMaybe) : 0;
        const descuento = discountExplicit > 0 ? discountExplicit : discountDerived;
        const saldoTotal = Math.max(0, subTotal - descuento);
        const abonado = paidMaybe != null ? Math.min(paidMaybe, saldoTotal) : saldoTotal;

        return (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-[95vw] max-w-3xl p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold">Previsualización de Recibo</h3>
                <button onClick={() => setPreviewId(null)} className="text-gray-600 hover:text-gray-900">✕</button>
              </div>
              <div className="border rounded-md p-4 max-h-[70vh] overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-bold text-gray-900">Recibo</div>
                    <div className="text-xs text-gray-500">ID: {String(r.id)}</div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>Alumno: {S(r.studentName)}</div>
                    <div>Fecha: {new Date(r.date).toLocaleString('es-AR')}</div>
                  </div>
                </div>

                <table className="min-w-full text-sm mb-2">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="py-1">Detalle</th>
                      <th className="py-1">Fecha</th>
                      <th className="py-1 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(r.transactions || []).map((it: any) => (
                      <tr key={String(it.id)} className="border-t">
                        <td className="py-1">{S(it.className)}</td>
                        <td className="py-1">{new Date(it.date).toISOString().slice(0,10)}</td>
                        <td className="py-1 text-right">{formatCurrency(Number(it.amount || 0))}</td>
                      </tr>
                    ))}
                    {(!r.transactions || r.transactions.length === 0) && (
                      <tr>
                        <td colSpan={3} className="py-6 text-center text-gray-500">Sin items</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                <div className="mt-2">
                  <div className="flex justify-end text-sm">
                    <div className="w-full max-w-sm space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sub-total</span>
                        <span className="font-semibold">{formatCurrency(subTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Descuento</span>
                        <span>{formatCurrency(descuento)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Saldo total (sub total - descuento)</span>
                        <span className="font-semibold">{formatCurrency(saldoTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monto abonado</span>
                        <span className="font-semibold">{formatCurrency(abonado)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-end gap-2">
                <button
                  onClick={() => {
                    const rid = String(r.id);
                    openPrintWindow(rid);
                  }}
                  className="inline-flex items-center gap-2 px-3 py-2 border rounded-md"
                >
                  <Printer size={16} /> Imprimir
                </button>
                <button
                  onClick={() => setPreviewId(null)}
                  className="px-3 py-2 rounded-md bg-blue-600 text-white"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
}
