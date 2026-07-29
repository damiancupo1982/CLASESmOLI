import React, { useState } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { StudentForm } from './StudentForm';
import { StudentAccountHistory } from './StudentAccountHistory';
import { Search, Plus, CreditCard as Edit, Trash2, DollarSign, AlertTriangle } from 'lucide-react';
import { firebaseService } from '../firebase/firebaseService';
import { useClub } from '../context/ClubContext';

export function StudentList() {
  const { state, dispatch } = useApp();
  const { currentClub } = useClub();
  const [showForm, setShowForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showAccountHistory, setShowAccountHistory] = useState(false);
  const [selectedStudentForAccount, setSelectedStudentForAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [cleaningDuplicates, setCleaningDuplicates] = useState(false);

  const filteredStudents = state.students.filter(student => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.dni.includes(searchTerm) ||
      student.phone.includes(searchTerm);

    const matchesCondition =
      conditionFilter === 'all' || student.condition === conditionFilter;

    return matchesSearch && matchesCondition;
  });

  const handleEdit = (student) => {
    setEditingStudent(student);
    setShowForm(true);
  };

  const handleDelete = (studentId: string) => {
    if (confirm('¿Está seguro de eliminar este alumno?')) {
      dispatch({ type: 'DELETE_STUDENT', payload: studentId });
    }
  };

  const handleShowAccount = (student) => {
    setSelectedStudentForAccount(student);
    setShowAccountHistory(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getStudentBalance = (student) => {
    const transactions = state.transactions.filter(t => t.studentId === student.id);
    const charges = transactions
      .filter(t => t.type === 'charge')
      .reduce((sum, t) => sum + t.amount, 0);
    const payments = transactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + t.amount, 0);
    return charges - payments;
  };

  const findDuplicates = () => {
    const duplicates = new Map();

    state.students.forEach(student => {
      const key = student.name.toLowerCase().trim();
      if (!duplicates.has(key)) {
        duplicates.set(key, []);
      }
      duplicates.get(key).push(student);
    });

    const duplicateGroups = Array.from(duplicates.values()).filter(group => group.length > 1);
    return duplicateGroups;
  };

  const handleCleanDuplicates = async () => {
    if (!currentClub) return;

    const duplicateGroups = findDuplicates();

    if (duplicateGroups.length === 0) {
      alert('No se encontraron alumnos duplicados.');
      return;
    }

    const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + (group.length - 1), 0);

    if (!confirm(`Se encontraron ${duplicateGroups.length} grupos de alumnos duplicados (${totalDuplicates} duplicados en total).\n\n¿Deseas eliminar los duplicados? Se mantendrá el alumno más reciente de cada grupo.`)) {
      return;
    }

    setCleaningDuplicates(true);

    try {
      let deletedCount = 0;

      for (const group of duplicateGroups) {
        const sortedByDate = group.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const keepStudent = sortedByDate[0];
        const toDelete = sortedByDate.slice(1);

        console.log(`Grupo "${keepStudent.name}": Manteniendo ID ${keepStudent.id}, eliminando ${toDelete.length} duplicados`);

        for (const duplicate of toDelete) {
          try {
            await firebaseService.deleteStudent(currentClub.id, duplicate.id);
            dispatch({ type: 'DELETE_STUDENT', payload: duplicate.id });
            deletedCount++;
            console.log(`Eliminado duplicado: ${duplicate.name} (ID: ${duplicate.id})`);
          } catch (err) {
            console.error(`Error al eliminar duplicado ${duplicate.id}:`, err);
          }
        }
      }

      alert(`Se eliminaron ${deletedCount} alumnos duplicados exitosamente.`);

    } catch (error) {
      console.error('Error al limpiar duplicados:', error);
      alert('Hubo un error al eliminar los duplicados. Por favor verifica la consola.');
    } finally {
      setCleaningDuplicates(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center animate-slide-in">
        <div className="flex items-center gap-3">
          <div className="text-4xl">👥</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Gestión de Alumnos</h1>
            <p className="text-gray-600">Administra tu base de estudiantes</p>
          </div>
        </div>
        <div className="flex gap-3">
          {findDuplicates().length > 0 && (
            <button
              onClick={handleCleanDuplicates}
              disabled={cleaningDuplicates}
              className="btn-padel-secondary flex items-center gap-2 hover-lift bg-orange-600 hover:bg-orange-700 text-white"
            >
              <AlertTriangle size={20} />
              {cleaningDuplicates ? 'Limpiando...' : `Limpiar Duplicados (${findDuplicates().length})`}
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="btn-padel-primary flex items-center gap-2 hover-lift"
          >
            <Plus size={20} />
            Nuevo Alumno
          </button>
        </div>
      </div>

      <div className="padel-card p-6 animate-slide-in">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-green-500" size={20} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="padel-input w-full pl-12 pr-4"
            />
          </div>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="padel-input"
          >
            <option value="all">Todas las condiciones</option>
            <option value="Titular">Titular</option>
            <option value="Familiar">Familiar</option>
            <option value="Invitado">Invitado</option>
          </select>
        </div>

        <div className="overflow-x-auto rounded-xl">
          <table className="padel-table w-full">
            <thead>
              <tr>
                <th className="text-left py-4 px-6 font-semibold">👤 Nombre</th>
                <th className="text-left py-4 px-6 font-semibold">🆔 DNI</th>
                <th className="text-left py-4 px-6 font-semibold">📞 Teléfono</th>
                <th className="text-left py-4 px-6 font-semibold">🏠 Lote/Barrio</th>
                <th className="text-left py-4 px-6 font-semibold">⭐ Condición</th>
                <th className="text-left py-4 px-6 font-semibold">💰 Saldo</th>
                <th className="text-left py-4 px-6 font-semibold">⚙️ Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const currentBalance = getStudentBalance(student);
                return (
                  <tr key={student.id}>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-gray-800">{student.name}</div>
                        {student.observations && (
                          <div className="text-sm text-gray-600 mt-1">{student.observations}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-medium">{student.dni}</td>
                    <td className="py-4 px-6 text-gray-700">{student.phone}</td>
                    <td className="py-4 px-6 text-gray-700">
                      {student.lot} - {student.neighborhood}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        student.condition === 'Titular'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                          : student.condition === 'Familiar'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                          : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                      }`}>
                        {student.condition}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-bold text-lg ${
                        currentBalance > 0 ? 'text-red-500' : 'text-green-500'
                      }`}>
                        {formatCurrency(currentBalance)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all hover-lift"
                          title="Editar"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleShowAccount(student)}
                          className="p-2 rounded-lg bg-green-100 text-green-600 hover:bg-green-200 transition-all hover-lift"
                          title="Cuenta corriente"
                        >
                          <DollarSign size={16} />
                        </button>
                        {state.currentUser?.role === 'admin' && (
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all hover-lift"
                            title="Eliminar"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎾</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay alumnos</h3>
            <p className="text-gray-500">No se encontraron alumnos que coincidan con los filtros aplicados.</p>
          </div>
        )}
      </div>

      {showForm && (
        <StudentForm
          student={editingStudent}
          onClose={() => {
            setShowForm(false);
            setEditingStudent(null);
          }}
        />
      )}

      {showAccountHistory && selectedStudentForAccount && (
        <StudentAccountHistory
          student={selectedStudentForAccount}
          onClose={() => {
            setShowAccountHistory(false);
            setSelectedStudentForAccount(null);
          }}
        />
      )}
    </div>
  );
}