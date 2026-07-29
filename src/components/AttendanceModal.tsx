import React, { useState } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { X, UserCheck, UserX, Clock, Users, Plus, Save } from 'lucide-react';
import { Class, Student } from '../types';
import { generateUUID } from '../utils/uuid';

interface AttendanceModalProps {
  classData: Class;
  onClose: () => void;
}

export function AttendanceModal({ classData, onClose }: AttendanceModalProps) {
  const { state, dispatch } = useApp();
  const [selectedStudents, setSelectedStudents] = useState<{[key: string]: 'Presente' | 'Ausente' | null}>({});
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentDNI, setNewStudentDNI] = useState('');

  const assignedStudents = state.students.filter(student => 
    classData.students.includes(student.id)
  );

  const handleAttendanceChange = (studentId: string, status: 'Presente' | 'Ausente') => {
    setSelectedStudents(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? null : status
    }));
  };

  const handleAddStudent = () => {
    if (!newStudentName.trim() || !newStudentDNI.trim()) return;
    
    const newStudent: Student = {
      id: generateUUID(),
      name: newStudentName.trim(),
      dni: newStudentDNI.trim(),
      phone: '',
      lot: '',
      neighborhood: '',
      condition: 'Titular',
      observations: '',
      currentBalance: 0,
      createdAt: new Date(),
      accountHistory: []
    };

    // Add student to system
    dispatch({ type: 'ADD_STUDENT', payload: newStudent });
    
    // Add student to current class
    const updatedClass = {
      ...classData,
      students: [...classData.students, newStudent.id]
    };
    dispatch({ type: 'UPDATE_CLASS', payload: updatedClass });
    
    // Reset form
    setNewStudentName('');
    setNewStudentDNI('');
    setShowAddStudent(false);
  };

  const handleSaveAttendance = () => {
    // Registrar asistencia para cada estudiante
    Object.entries(selectedStudents).forEach(([studentId, status]) => {
      if (status) {
        dispatch({
          type: 'RECORD_ATTENDANCE',
          payload: {
            studentId,
            classId: classData.id,
            className: classData.observations || `Clase ${classData.type === 'individual' ? 'Individual' : 'Grupal'}`,
            attendanceStatus: status,
            amount: status === 'Presente' ? classData.pricePerStudent : 0,
            date: new Date(classData.date)
          }
        });
      }
    });

    // Actualizar asistencias en la clase
    const updatedAttendances = { ...classData.attendances };
    Object.entries(selectedStudents).forEach(([studentId, status]) => {
      if (status) {
        updatedAttendances[studentId] = status === 'Presente';
      }
    });

    const updatedClass = {
      ...classData,
      attendances: updatedAttendances,
      status: 'completed' as const
    };

    dispatch({ type: 'UPDATE_CLASS', payload: updatedClass });

    // Marcar clase como completada si hay asistencias registradas
    if (Object.values(selectedStudents).some(status => status !== null)) {
      console.log('Clase marcada como completada');
    }

    onClose();
  };

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <UserCheck size={24} className="text-blue-600" />
              Registrar Asistencia
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {formatDateTime(classData.date)}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        {/* Información de la clase */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <span>Tipo: {classData.type === 'individual' ? 'Individual' : 'Grupal'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-500" />
              <span>Precio: {formatCurrency(classData.pricePerStudent)}</span>
            </div>
          </div>
          {classData.observations && (
            <p className="text-sm text-gray-600 mt-2">
              <strong>Observaciones:</strong> {classData.observations}
            </p>
          )}
        </div>

        {/* Lista de estudiantes */}
        <div className="space-y-4 mb-4">
          <h3 className="font-semibold text-gray-900">
            Estudiantes Asignados ({assignedStudents.length}) 
            <button
              onClick={() => setShowAddStudent(true)}
              className="ml-3 text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 inline-flex items-center gap-1"
            >
              <Plus size={14} />
              Agregar Alumno
            </button>
          </h3>
          
          {assignedStudents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users size={48} className="mx-auto mb-2 text-gray-300" />
              <p>No hay estudiantes asignados a esta clase</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignedStudents.map(student => {
                const currentStatus = selectedStudents[student.id];
                const existingAttendance = classData.attendances?.[student.id];
                
                return (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{student.name}</h4>
                        <p className="text-sm text-gray-500">{student.phone}</p>
                        {existingAttendance !== undefined && (
                          <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                            existingAttendance 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            Ya registrado: {existingAttendance ? 'Presente' : 'Ausente'}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'Presente')}
                          className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                            currentStatus === 'Presente'
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-green-50 hover:text-green-700'
                          }`}
                        >
                          <UserCheck size={16} />
                          Presente
                        </button>
                        
                        <button
                          onClick={() => handleAttendanceChange(student.id, 'Ausente')}
                          className={`px-4 py-2 rounded-md flex items-center gap-2 transition-all ${
                            currentStatus === 'Ausente'
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-700'
                          }`}
                        >
                          <UserX size={16} />
                          Ausente
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Student Form */}
        {showAddStudent && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-3">Agregar Nuevo Alumno</h4>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nombre completo"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                placeholder="DNI"
                value={newStudentDNI}
                onChange={(e) => setNewStudentDNI(e.target.value)}
                className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAddStudent}
                disabled={!newStudentName.trim() || !newStudentDNI.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Save size={16} />
                Agregar
              </button>
              <button
                onClick={() => {
                  setShowAddStudent(false);
                  setNewStudentName('');
                  setNewStudentDNI('');
                }}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Resumen */}
        {Object.keys(selectedStudents).length > 0 && (
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-blue-900 mb-2">Resumen de Asistencia</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-green-700 font-medium">
                  Presentes: {Object.values(selectedStudents).filter(s => s === 'Presente').length}
                </span>
              </div>
              <div>
                <span className="text-red-700 font-medium">
                  Ausentes: {Object.values(selectedStudents).filter(s => s === 'Ausente').length}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-blue-200">
              <span className="text-blue-900 font-medium">
                Total a facturar: {formatCurrency(
                  Object.values(selectedStudents).filter(s => s === 'Presente').length * classData.pricePerStudent
                )}
              </span>
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveAttendance}
            disabled={Object.keys(selectedStudents).length === 0}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Guardar Asistencia
          </button>
        </div>
      </div>
    </div>
  );
}