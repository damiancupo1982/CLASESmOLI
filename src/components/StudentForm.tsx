import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { Student } from '../types';
import { generateUUID } from '../utils/uuid';

interface Props {
  student: Student | null;
  onClose: () => void;
}

export function StudentForm({ student, onClose }: Props) {
  const { dispatch } = useApp();

  const [form, setForm] = useState<Student>({
    id: '',
    name: '',
    dni: '',
    phone: '',
    lot: '',
    neighborhood: '',
    condition: 'Titular',
    observations: '',
    currentBalance: 0,
    createdAt: new Date()
  });

  useEffect(() => {
    if (student) {
      setForm(student);
    }
  }, [student]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log('📝 StudentForm: handleSubmit iniciado');
    console.log('📝 Datos del formulario:', form);

    if (!form.name.trim()) {
      console.error('❌ Error: El nombre está vacío');
      alert('El nombre es obligatorio');
      return;
    }

    if (form.id) {
      console.log('✏️ Actualizando alumno existente:', form.id);
      dispatch({ type: 'UPDATE_STUDENT', payload: form });
    } else {
      const newStudent = {
        ...form,
        id: generateUUID(),
        createdAt: new Date()
      };
      console.log('➕ Creando nuevo alumno:', newStudent);
      console.log('➕ Despachando acción ADD_STUDENT...');

      dispatch({
        type: 'ADD_STUDENT',
        payload: newStudent
      });

      console.log('✅ Acción ADD_STUDENT despachada');
    }

    console.log('🔒 Cerrando formulario');
    onClose();
  };

  const handleDelete = () => {
    if (form.id && confirm('¿Seguro que querés eliminar este alumno? Esta acción no se puede deshacer.')) {
      dispatch({ type: 'DELETE_STUDENT', payload: form.id });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg p-6 w-full max-w-md space-y-4 shadow-xl"
      >
        <h2 className="text-xl font-bold text-gray-900">
          {form.id ? 'Editar Alumno' : 'Nuevo Alumno'}
        </h2>

        <input
          type="text"
          name="name"
          placeholder="Nombre completo"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          name="dni"
          placeholder="DNI"
          value={form.dni}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <input
          type="text"
          name="phone"
          placeholder="Teléfono"
          value={form.phone}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex gap-2">
          <input
            type="text"
            name="lot"
            placeholder="Lote"
            value={form.lot}
            onChange={handleChange}
            className="w-1/2 border px-3 py-2 rounded"
          />
          <input
            type="text"
            name="neighborhood"
            placeholder="Barrio"
            value={form.neighborhood}
            onChange={handleChange}
            className="w-1/2 border px-3 py-2 rounded"
          />
        </div>

        <select
          name="condition"
          value={form.condition}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="Titular">Titular</option>
          <option value="Familiar">Familiar</option>
          <option value="Invitado">Invitado</option>
        </select>

        <textarea
          name="observations"
          placeholder="Observaciones"
          value={form.observations}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        />

        <div className="flex justify-between items-center gap-3 mt-4">
          {form.id && (
            <button
              type="button"
              onClick={handleDelete}
              className="text-red-600 border border-red-300 hover:bg-red-50 px-4 py-2 rounded"
            >
              Eliminar
            </button>
          )}
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {form.id ? 'Actualizar' : 'Agregar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
