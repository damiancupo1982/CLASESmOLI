export function formatCurrency(value: number): string {
  return value.toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  });
}

/** Descarga un archivo en el navegador */
function downloadFile(filename: string, mime: string, data: BlobPart) {
  const blob = new Blob([data], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportJSON(baseName: string, rows: any[]) {
  const name = `${baseName}_${new Date().toISOString().slice(0, 10)}.json`;
  const json = JSON.stringify(rows, null, 2);
  // BOM para evitar problemas de encoding
  const bom = '\ufeff';
  downloadFile(name, 'application/json;charset=utf-8', bom + json);
}

export function exportCSV(baseName: string, rows: any[]) {
  const name = `${baseName}_${new Date().toISOString().slice(0, 10)}.csv`;
  if (!rows || rows.length === 0) {
    downloadFile(name, 'text/csv;charset=utf-8', '\ufeff');
    return;
  }

  const headers = Object.keys(rows[0]);
  const escape = (v: any) => {
    if (v === null || v === undefined) return '';
    const s = String(v).replace(/"/g, '""');
    // siempre entre comillas por seguridad
    return `"${s}"`;
  };

  const lines = [
    headers.map(h => escape(h)).join(','),
    ...rows.map(r => headers.map(h => escape(r[h])).join(','))
  ].join('\n');

  // Agregamos BOM
  downloadFile(name, 'text/csv;charset=utf-8', '\ufeff' + lines);
}
