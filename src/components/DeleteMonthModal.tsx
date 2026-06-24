import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteMonthModalProps {
  currentDate: Date;
  monthName: string;
  classesCount: number;
  onConfirm: () => void;
  onClose: () => void;
}

export function DeleteMonthModal({
  currentDate,
  monthName,
  classesCount,
  onConfirm,
  onClose
}: DeleteMonthModalProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (password !== 'graciasdamian') {
      setError('Clave incorrecta');
      return;
    }
    onConfirm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-600" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Eliminar clases del mes</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-6 space-y-3">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-2">
              Esta acción eliminará permanentemente:
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1 ml-2">
              <li><strong>{classesCount}</strong> clases del mes de <strong>{monthName} {currentDate.getFullYear()}</strong></li>
              <li>Todos los registros de asistencia de esas clases</li>
              <li>Esta acción <strong>NO SE PUEDE DESHACER</strong></li>
            </ul>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              <strong>Importante:</strong> Los pagos registrados de los alumnos NO se borrarán. Solo se eliminarán las clases del calendario.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700">
              Ingrese la clave de administrador para continuar:
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="Clave de administrador"
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors font-semibold"
          >
            Eliminar {classesCount} Clases
          </button>
        </div>
      </div>
    </div>
  );
}
