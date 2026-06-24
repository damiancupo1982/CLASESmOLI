import React from 'react';
import { X, Share2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface InvoiceItem {
  id: string;
  date: Date;
  className: string;
  amount: number;
}

interface InvoicePreviewProps {
  studentName: string;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  onClose: () => void;
  clubName?: string;
}

export function InvoicePreview({
  studentName,
  items,
  subtotal,
  discount,
  total,
  onClose,
  clubName = 'Club de Padel'
}: InvoicePreviewProps) {
  const currentDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const generateWhatsAppMessage = () => {
    let message = `*FACTURA - TIPO X*\n\n`;
    message += `*${clubName.toUpperCase()}*\n`;
    message += `Fecha: ${currentDate}\n`;
    message += `Cliente: ${studentName}\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `*DETALLE DE CLASES*\n\n`;

    items.forEach((item, idx) => {
      const fecha = new Date(item.date).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit'
      });
      message += `${idx + 1}. ${fecha} - ${item.className || 'Clase'}\n`;
      message += `   ${formatCurrency(item.amount)}\n\n`;
    });

    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Subtotal: ${formatCurrency(subtotal)}\n`;

    if (discount > 0) {
      message += `Descuento: -${formatCurrency(discount)}\n`;
    }

    message += `\n*TOTAL A PAGAR: ${formatCurrency(total)}*\n\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    message += `Gracias por tu preferencia`;

    return encodeURIComponent(message);
  };

  const shareViaWhatsApp = () => {
    const message = generateWhatsAppMessage();
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Vista Previa de Factura</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        {/* Factura Preview */}
        <div className="p-8">
          <div className="border-2 border-gray-300 rounded-lg p-6 bg-white shadow-sm">
            {/* Header de Factura */}
            <div className="text-center mb-6 border-b-2 border-gray-200 pb-4">
              <h1 className="text-2xl font-bold text-gray-800 mb-1">{clubName}</h1>
              <p className="text-sm text-gray-600">FACTURA - TIPO X</p>
              <p className="text-xs text-gray-500 mt-2">Documento no válido como factura fiscal</p>
            </div>

            {/* Datos del Cliente y Fecha */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <p className="text-gray-600">Fecha:</p>
                <p className="font-semibold">{currentDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Cliente:</p>
                <p className="font-semibold">{studentName}</p>
              </div>
            </div>

            {/* Tabla de Items */}
            <div className="mb-6">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-3 px-3 font-semibold">#</th>
                    <th className="text-left py-3 px-3 font-semibold">Fecha</th>
                    <th className="text-left py-3 px-3 font-semibold">Descripción</th>
                    <th className="text-right py-3 px-3 font-semibold">Importe</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className="py-3 px-3">{idx + 1}</td>
                      <td className="py-3 px-3">
                        {new Date(item.date).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-3">{item.className || 'Clase'}</td>
                      <td className="py-3 px-3 text-right font-medium">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div className="border-t-2 border-gray-300 pt-4">
              <div className="flex justify-end mb-6">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Descuento:</span>
                      <span className="font-medium">-{formatCurrency(discount)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-lg font-bold border-t-2 border-gray-300 pt-2">
                    <span>TOTAL A PAGAR:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 mt-6 pt-4 border-t border-gray-200">
                <p>Gracias por elegirnos!!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="sticky bottom-0 bg-gray-50 border-t px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={shareViaWhatsApp}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <Share2 size={18} />
            Compartir por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
