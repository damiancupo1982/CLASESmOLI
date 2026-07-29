import React, { useState, useEffect } from 'react';

export const ClassDetail = ({ classData, assignedStudents }) => {
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    if (assignedStudents && Array.isArray(assignedStudents)) {
      const initialStatus = {};
      assignedStudents.forEach((student) => {
        initialStatus[student.id] = student.attendance || null;
      });
      setAttendance(initialStatus);
    }
  }, [assignedStudents]);

  const markAttendance = (studentId, status) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  const getAttendanceStatus = (student) => {
    return attendance[student.id] || 'none';
  };

  if (!assignedStudents || assignedStudents.length === 0) {
    return <div>No hay alumnos asignados a esta clase.</div>;
  }

  return (
    <div className="space-y-3">
      {assignedStudents.map((student) => {
        const attendanceStatus = getAttendanceStatus(student);

        return (
          <div key={student.id} className="flex justify-between items-center">
            <span className="font-medium">{student.name}</span>
            {classData.status === 'scheduled' ? (
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1 rounded ${
                    attendanceStatus === 'present'
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => markAttendance(student.id, 'present')}
                >
                  👤 Presente
                </button>
                <button
                  className={`px-3 py-1 rounded ${
                    attendanceStatus === 'absent'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-800'
                  }`}
                  onClick={() => markAttendance(student.id, 'absent')}
                >
                  🚫 Ausente
                </button>
              </div>
            ) : (
              <span>
                {attendanceStatus === 'present'
                  ? 'Presente'
                  : attendanceStatus === 'absent'
                  ? 'Ausente'
                  : 'Sin marcar'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
