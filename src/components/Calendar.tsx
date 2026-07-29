import React, { useState } from 'react';
import { useApp } from '../context/AppContextWithClub';
import { ClassForm } from './ClassForm';
import { AttendanceModal } from './AttendanceModal';
import { DeleteMonthModal } from './DeleteMonthModal';
import { ChevronLeft, ChevronRight, Plus, Trash2, Copy, CreditCard as Edit, X, CheckCircle } from 'lucide-react';
import { generateUUID } from '../utils/uuid';

export function Calendar() {
  const { state, dispatch } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showClassForm, setShowClassForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<any>(null);
  const [showRepeatModal, setShowRepeatModal] = useState(false);
  const [showDeleteMonthModal, setShowDeleteMonthModal] = useState(false);

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const arr: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) arr.push(null);
    for (let d = 1; d <= last.getDate(); d++) arr.push(new Date(year, month, d));
    return arr;
  };

  const getClassesForDate = (date: Date) =>
    state.classes
      .filter(cls => new Date(cls.date).toDateString() === date.toDateString())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const getMonthClasses = () => {
    return state.classes.filter(cls => {
      const clsDate = new Date(cls.date);
      return clsDate.getMonth() === currentDate.getMonth() &&
             clsDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const handleDeleteMonth = () => {
    dispatch({
      type: 'DELETE_MONTH_CLASSES',
      payload: {
        year: currentDate.getFullYear(),
        month: currentDate.getMonth()
      }
    });
    setShowDeleteMonthModal(false);
    alert(`Se han eliminado ${getMonthClasses().length} clases del mes de ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`);
  };

  const handlePrevMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const handleNextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingClass(null);
    setShowClassForm(true);
  };

  const handleClassClick = (cls: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedClass(cls);
  };

  const handleEditClass = (cls: any) => {
    setEditingClass(cls);
    setShowClassForm(true);
    setSelectedClass(null);
  };

  const handleDeleteClass = (cls: any) => {
    setShowDeleteConfirm(cls);
  };

  const confirmDeleteClass = () => {
    if (showDeleteConfirm) {
      dispatch({ type: 'DELETE_CLASS', payload: showDeleteConfirm.id });
      setShowDeleteConfirm(null);
      setSelectedClass(null);
    }
  };

  const confirmRepeatPreviousMonth = () => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth < 0) {
      prevMonth = 11;
      prevYear = currentYear - 1;
    }

    const prevClasses = state.classes.filter(cls => {
      const clsDate = new Date(cls.date);
      return clsDate.getMonth() === prevMonth && clsDate.getFullYear() === prevYear;
    });

    if (prevClasses.length === 0) {
      alert('No hay clases en el mes anterior para replicar.');
      setShowRepeatModal(false);
      return;
    }

    const classPatterns = new Map<string, any>();
    prevClasses.forEach(prevClass => {
      const prevDate = new Date(prevClass.date);
      const dayOfWeek = prevDate.getDay();
      const hours = prevDate.getHours();
      const minutes = prevDate.getMinutes();

      const patternKey = `${dayOfWeek}-${hours}-${minutes}-${prevClass.type}-${prevClass.pricePerStudent}-${JSON.stringify(
        [...prevClass.students].sort()
      )}-${prevClass.observations || ''}`;

      if (!classPatterns.has(patternKey)) {
        classPatterns.set(patternKey, {
          ...prevClass,
          dayOfWeek,
          hours,
          minutes
        });
      }
    });

    const newClasses: any[] = [];
    let duplicatesCount = 0;

    classPatterns.forEach((classPattern) => {
      const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

      for (let day = 1; day <= daysInCurrentMonth; day++) {
        const potentialDate = new Date(currentYear, currentMonth, day);

        if (potentialDate.getDay() === classPattern.dayOfWeek) {
          const newDate = new Date(currentYear, currentMonth, day, classPattern.hours, classPattern.minutes);

          const exists = state.classes.some(existingClass => {
            const existingDate = new Date(existingClass.date);
            return (
              existingDate.getTime() === newDate.getTime() &&
              existingClass.type === classPattern.type &&
              JSON.stringify([...existingClass.students].sort()) ===
              JSON.stringify([...classPattern.students].sort()) &&
              existingClass.pricePerStudent === classPattern.pricePerStudent &&
              (existingClass.observations || '') === (classPattern.observations || '')
            );
          });

          if (!exists) {
            newClasses.push({
              ...classPattern,
              id: generateUUID(),
              date: newDate,
              createdAt: new Date(),
              parentId: classPattern.id,
              repeating: 'none',
              attendances: {},
              status: 'scheduled'
            });
          } else {
            duplicatesCount++;
          }
        }
      }
    });

    console.log('🔄 Replicando clases:', newClasses.length);
    newClasses.forEach(newClass => {
      console.log('➕ Agregando clase replicada:', {
        id: newClass.id,
        date: newClass.date,
        students: newClass.students,
        type: newClass.type
      });
      dispatch({ type: 'ADD_CLASS', payload: newClass });
    });

    setShowRepeatModal(false);

    let message = `Se han replicado ${newClasses.length} clases basadas en ${classPatterns.size} patrones únicos del mes anterior.`;
    if (duplicatesCount > 0) {
      message += `\n${duplicatesCount} clases ya existían y no se duplicaron.`;
    }
    alert(message);
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 animate-slide-in">
        <div className="flex items-center gap-3">
          <div className="text-4xl">📅</div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{`${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}</h1>
            <p className="text-gray-600">Gestiona tu calendario de clases</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDeleteMonthModal(true)}
            className="btn-padel-danger flex items-center gap-2 hover-lift"
            title="Borrar todas las clases del mes"
          >
            <Trash2 size={18} />
            <span className="hidden sm:inline">Borrar Mes</span>
            <span className="sm:hidden">Borrar</span>
          </button>
          <button
            onClick={() => setShowRepeatModal(true)}
            className="btn-padel-secondary flex items-center gap-2 hover-lift"
          >
            <Copy size={18} />
            <span className="hidden sm:inline">Repetir mes anterior</span>
            <span className="sm:hidden">Repetir</span>
          </button>
          <button
            onClick={() => { setShowClassForm(true); setSelectedDate(null); setEditingClass(null); }}
            className="btn-padel-primary flex items-center gap-2 hover-lift"
          >
            <Plus size={18} />
            <span className="hidden sm:inline">Nueva Clase</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      <div className="padel-card p-6 animate-slide-in">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handlePrevMonth} 
            className="p-3 hover:bg-green-100 rounded-full transition-all hover-lift text-green-600"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{monthNames[currentDate.getMonth()]}</h2>
            <p className="text-gray-600">{currentDate.getFullYear()}</p>
          </div>
          <button 
            onClick={handleNextMonth} 
            className="p-3 hover:bg-green-100 rounded-full transition-all hover-lift text-green-600"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map((d, idx) => (
            <div key={d} className={`p-3 text-center font-bold text-sm ${
              idx === 0 || idx === 6 ? 'text-orange-600' : 'text-green-700'
            }`}>
              {d}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {days.map((dt, idx) => (
            <div
              key={idx}
              className={`min-h-[120px] p-3 border-2 rounded-xl cursor-pointer transition-all hover-lift ${
                dt?.toDateString() === new Date().toDateString() 
                  ? 'bg-gradient-to-br from-green-100 to-green-200 border-green-400 shadow-padel' 
                  : dt 
                    ? 'bg-white border-green-200 hover:bg-green-50 hover:border-green-300' 
                    : 'bg-gray-50 border-gray-200'
              }`}
              onClick={() => dt && handleDateClick(dt)}
            >
              {dt && (
                <div className="space-y-1">
                  <div className={`text-lg font-bold ${
                    dt?.toDateString() === new Date().toDateString() ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {dt.getDate()}
                  </div>
                  {getClassesForDate(dt).map(cls => (
                    <div key={cls.id} className="text-xs p-2 rounded-lg border-2 truncate bg-gradient-to-r from-orange-100 to-orange-200 border-orange-300 hover:from-orange-200 hover:to-orange-300 transition-all cursor-pointer">
                      <div
                        className="font-bold text-orange-800"
                        onClick={e => handleClassClick(cls, e)}
                      >
                        {new Date(cls.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div
                        className="text-orange-700 font-medium"
                        onClick={e => handleClassClick(cls, e)}
                      >
                        {cls.type === 'individual'
                          ? '👤 Individual'
                          : `Grupal (${cls.students.length}/${cls.maxStudents})`}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showClassForm && (
        <ClassForm
          classData={editingClass}
          selectedDate={selectedDate}
          onClose={() => { setShowClassForm(false); setSelectedDate(null); setEditingClass(null); }}
        />
      )}

      {/* Modal de DETALLES de clase */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Detalles de la Clase</h2>
              <button
                onClick={() => setSelectedClass(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>
            </div>

            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <p className="text-sm text-gray-700">
                <strong>Clase:</strong>{' '}
                {selectedClass.observations || (selectedClass.type === 'individual' ? 'Individual' : 'Grupal')}
              </p>
              <p className="text-sm text-gray-700">
                <strong>Fecha:</strong>{' '}
                {new Date(selectedClass.date).toLocaleDateString('es-AR')} a las{' '}
                {new Date(selectedClass.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Fecha:</span>
                  <p className="text-gray-900">
                    {new Date(selectedClass.date).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Hora:</span>
                  <p className="text-gray-900">
                    {new Date(selectedClass.date).toLocaleTimeString('es-AR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Tipo:</span>
                  <p className="text-gray-900">
                    {selectedClass.type === 'individual' ? 'Individual' : 'Grupal'}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Precio:</span>
                  <p className="text-gray-900">
                    {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(
                      selectedClass.pricePerStudent
                    )}
                  </p>
                </div>
              </div>

              {selectedClass.observations && (
                <div className="pt-3 border-t border-gray-200">
                  <span className="font-medium text-gray-700">Observaciones:</span>
                  <p className="text-gray-900 mt-1">{selectedClass.observations}</p>
                </div>
              )}

              <div>
                <span className="font-medium text-gray-700">Alumnos asignados:</span>
                <div className="mt-2 space-y-1">
                  {selectedClass.students.length === 0 ? (
                    <p className="text-gray-500 text-sm">No hay alumnos asignados</p>
                  ) : (
                    selectedClass.students.map((studentId: string) => {
                      const student = state.students.find(s => s.id === studentId);
                      return (
                        <div key={studentId} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
                          <span className="text-blue-900 font-medium">
                            {student?.name || 'Alumno no encontrado'}
                          </span>
                          {selectedClass.attendances?.[studentId] !== undefined && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                selectedClass.attendances[studentId]
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {selectedClass.attendances[studentId] ? 'Presente' : 'Ausente'}
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleEditClass(selectedClass)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Edit size={18} />
                Editar Clase
              </button>
              <button
                onClick={() => handleDeleteClass(selectedClass)}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Eliminar
              </button>
            </div>

            {selectedClass.status === 'scheduled' && (
              <button
                onClick={() => setShowAttendanceModal(true)}
                className="w-full mt-3 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle size={18} />
                Registrar Asistencia
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de CONFIRMACIÓN de borrado */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Eliminar clase</h3>
            <p className="text-sm text-gray-700 mb-4">
              ¿Seguro que querés eliminar la clase del{' '}
              {new Date(showDeleteConfirm.date).toLocaleDateString('es-AR')} a las{' '}
              {new Date(showDeleteConfirm.date).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 bg-gray-100 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-200"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteClass}
                className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de REPLICACIÓN */}
      {showRepeatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900">Repetir clases del mes anterior</h2>
            <div className="mb-6 space-y-3">
              <p className="text-gray-700">
                Esta acción replicará <strong>todas las clases del mes anterior</strong> en el mes actual por día de la semana, manteniendo:
              </p>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1 ml-4">
                <li>Mismo día de la semana</li>
                <li>Misma hora exacta</li>
                <li>Mismo precio por alumno</li>
                <li>Mismos alumnos asignados</li>
                <li>Mismo tipo de clase (individual/grupal)</li>
                <li>Mismas observaciones</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-sm text-yellow-800">
                  <strong>Ejemplo:</strong> Si Carlos tenía clases los lunes del mes pasado a las 10:00, se crearán clases todos los lunes del mes actual a las 10:00 con los mismos alumnos y precio.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowRepeatModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmRepeatPreviousMonth}
                className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Confirmar Replicación
              </button>
            </div>
          </div>
        </div>
      )}

      {showAttendanceModal && selectedClass && (
        <AttendanceModal
          classData={selectedClass}
          onClose={() => { setShowAttendanceModal(false); setSelectedClass(null); }}
        />
      )}

      {showDeleteMonthModal && (
        <DeleteMonthModal
          currentDate={currentDate}
          monthName={monthNames[currentDate.getMonth()]}
          classesCount={getMonthClasses().length}
          onConfirm={handleDeleteMonth}
          onClose={() => setShowDeleteMonthModal(false)}
        />
      )}
    </div>
  );
}
