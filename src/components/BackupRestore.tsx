import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle, Database, Shield } from 'lucide-react';
import { firebaseService } from '../firebase/firebaseService';
import { generateUUID } from '../utils/uuid';

interface BackupRestoreProps {
  clubId: string;
  clubName: string;
}

interface BackupData {
  version: string;
  exportDate: string;
  clubId: string;
  clubName: string;
  students: any[];
  classes: any[];
  transactions: any[];
  receipts: any[];
  metadata: {
    totalStudents: number;
    totalClasses: number;
    totalTransactions: number;
    totalReceipts: number;
  };
}

export function BackupRestore({ clubId, clubName }: BackupRestoreProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info', message: string } | null>(null);
  const [restoreMode, setRestoreMode] = useState(false);

  const isValidUUID = (id: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
  };

  const exportBackup = async () => {
    setLoading(true);
    setStatus({ type: 'info', message: 'Exportando datos...' });

    try {
      let students = [];
      let classes = [];
      let transactions = [];
      let receipts = [];

      try {
        students = await firebaseService.getAllStudents(clubId);
      } catch (err) {
        console.warn('No se pudieron cargar los alumnos:', err);
      }

      try {
        classes = await firebaseService.getAllClasses(clubId);
      } catch (err) {
        console.warn('No se pudieron cargar las clases:', err);
      }

      try {
        transactions = await firebaseService.getAllTransactions(clubId);
      } catch (err) {
        console.warn('No se pudieron cargar las transacciones:', err);
      }

      try {
        receipts = await firebaseService.getAllReceipts(clubId);
      } catch (err) {
        console.warn('No se pudieron cargar los recibos:', err);
      }

      const backupData: BackupData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        clubId: clubId,
        clubName: clubName,
        students: students.map(s => ({
          ...s,
          createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : s.createdAt
        })),
        classes: classes.map(c => ({
          ...c,
          date: c.date instanceof Date ? c.date.toISOString() : c.date,
          createdAt: c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt
        })),
        transactions: transactions.map(t => ({
          ...t,
          date: t.date instanceof Date ? t.date.toISOString() : t.date
        })),
        receipts: receipts.map(r => ({
          ...r,
          date: r.date instanceof Date ? r.date.toISOString() : r.date
        })),
        metadata: {
          totalStudents: students.length,
          totalClasses: classes.length,
          totalTransactions: transactions.length,
          totalReceipts: receipts.length
        }
      };

      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-${clubName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;

      try {
        document.body.appendChild(a);
        a.click();
      } finally {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

      setStatus({
        type: 'success',
        message: `Backup exportado exitosamente! ${backupData.metadata.totalStudents} alumnos, ${backupData.metadata.totalClasses} clases, ${backupData.metadata.totalTransactions} transacciones, ${backupData.metadata.totalReceipts} recibos.`
      });
    } catch (error) {
      console.error('Error al exportar backup:', error);
      setStatus({
        type: 'error',
        message: `Error al exportar el backup: ${error instanceof Error ? error.message : 'Error desconocido'}`
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setStatus({ type: 'info', message: 'Leyendo archivo de backup...' });

    try {
      const text = await file.text();
      let backupData: any;

      try {
        backupData = JSON.parse(text);
      } catch (e) {
        throw new Error('El archivo no contiene JSON válido. Verifica que sea un archivo de backup correcto.');
      }

      console.log('=== BACKUP DATA RECIBIDO ===');
      console.log('Estructura del backup:', Object.keys(backupData));
      console.log('Students:', backupData.students?.length || 0);
      console.log('Classes:', backupData.classes?.length || 0);
      console.log('Transactions:', backupData.transactions?.length || 0);
      console.log('Receipts:', backupData.receipts?.length || 0);
      console.log('Backup completo:', backupData);

      // Validar que tenga al menos datos
      const hasStudents = Array.isArray(backupData.students) && backupData.students.length > 0;
      const hasClasses = Array.isArray(backupData.classes) && backupData.classes.length > 0;
      const hasTransactions = Array.isArray(backupData.transactions) && backupData.transactions.length > 0;
      const hasReceipts = Array.isArray(backupData.receipts) && backupData.receipts.length > 0;

      if (!hasStudents && !hasClasses && !hasTransactions && !hasReceipts) {
        throw new Error('El archivo no contiene datos válidos (sin alumnos, clases, transacciones o recibos)');
      }

      const foundItems = [];
      if (hasStudents) foundItems.push(`${backupData.students.length} alumnos`);
      if (hasClasses) foundItems.push(`${backupData.classes.length} clases`);
      if (hasTransactions) foundItems.push(`${backupData.transactions.length} transacciones`);
      if (hasReceipts) foundItems.push(`${backupData.receipts.length} recibos`);

      setStatus({ type: 'info', message: `Encontrados: ${foundItems.join(', ')}. Restaurando...` });

      let restoredCounts = {
        students: 0,
        classes: 0,
        transactions: 0,
        receipts: 0
      };

      let errors: string[] = [];

      // Restaurar alumnos
      console.log('🔄 Iniciando restauración de alumnos...');
      if (hasStudents) {
        console.log(`📝 Restaurando ${backupData.students.length} alumnos...`);
        for (const student of backupData.students) {
          try {
            if (!student.name || !student.id) {
              console.warn('Alumno sin nombre o ID, omitiendo:', student);
              continue;
            }

            const studentId = isValidUUID(student.id) ? student.id : generateUUID();

            await firebaseService.saveStudent(clubId, {
              ...student,
              id: studentId,
              name: String(student.name).trim(),
              dni: student.dni || '',
              phone: student.phone || '',
              lot: student.lot || '',
              neighborhood: student.neighborhood || '',
              condition: student.condition || 'Titular',
              observations: student.observations || '',
              currentBalance: Number(student.currentBalance) || 0,
              createdAt: student.createdAt ? new Date(student.createdAt) : new Date(),
              accountHistory: Array.isArray(student.accountHistory) ? student.accountHistory : []
            });
            restoredCounts.students++;
          } catch (err) {
            console.error(`❌ Error restaurando alumno ${student.name}:`, err);
            errors.push(`Error al restaurar alumno ${student.name}: ${err}`);
          }
        }
        console.log(`✅ Alumnos restaurados: ${restoredCounts.students}/${backupData.students.length}`);
      }

      // Restaurar clases (en lotes de 50 para evitar timeout)
      console.log('🔄 Iniciando restauración de clases...');
      if (hasClasses) {
        console.log(`=== INICIANDO RESTAURACIÓN DE ${backupData.classes.length} CLASES ===`);
        const batchSize = 50;
        const totalClasses = backupData.classes.length;

        for (let i = 0; i < totalClasses; i++) {
          const classItem = backupData.classes[i];

          try {
            if (!classItem.id || !classItem.type) {
              console.warn('Clase sin ID o tipo, omitiendo:', classItem);
              continue;
            }

            const classId = isValidUUID(classItem.id) ? classItem.id : generateUUID();
            const parentId = classItem.parentId && isValidUUID(classItem.parentId) ? classItem.parentId : undefined;

            if (i % 10 === 0 && i > 0) {
              console.log(`📊 Progreso: ${i}/${totalClasses} clases procesadas`);
            }

            await firebaseService.saveClass(clubId, {
              ...classItem,
              id: classId,
              type: classItem.type,
              date: classItem.date ? new Date(classItem.date) : new Date(),
              maxStudents: Number(classItem.maxStudents) || 2,
              pricePerStudent: Number(classItem.pricePerStudent) || 0,
              students: Array.isArray(classItem.students) ? classItem.students : [],
              observations: classItem.observations || '',
              repeating: classItem.repeating || 'none',
              attendances: classItem.attendances || {},
              status: classItem.status || 'scheduled',
              createdAt: classItem.createdAt ? new Date(classItem.createdAt) : new Date(),
              parentId: parentId
            });
            restoredCounts.classes++;

            // Actualizar mensaje de progreso cada 50 clases
            if ((i + 1) % batchSize === 0) {
              setStatus({ type: 'info', message: `Restaurando clases: ${restoredCounts.classes}/${totalClasses}...` });
              // Pausa breve cada 50 clases para evitar sobrecarga
              await new Promise(resolve => setTimeout(resolve, 100));
            }
          } catch (err) {
            console.error(`✗ Error al restaurar clase ${i + 1}:`, err, classItem);
            errors.push(`Error al restaurar clase ${i + 1}: ${err}`);
            // Continuar con la siguiente clase en caso de error
          }
        }
        console.log(`=== FINALIZADA RESTAURACIÓN DE CLASES: ${restoredCounts.classes}/${totalClasses} exitosas ===`);
      }

      // Restaurar transacciones
      if (hasTransactions) {
        console.log(`=== INICIANDO RESTAURACIÓN DE ${backupData.transactions.length} TRANSACCIONES ===`);
        const totalTransactions = backupData.transactions.length;

        for (let i = 0; i < totalTransactions; i++) {
          const transaction = backupData.transactions[i];

          try {
            if (!transaction.id || !transaction.studentId) {
              console.warn('Transacción sin ID o studentId, omitiendo:', transaction);
              continue;
            }

            const transactionId = isValidUUID(transaction.id) ? transaction.id : generateUUID();
            const classId = transaction.classId && isValidUUID(transaction.classId) ? transaction.classId : '';

            if (i % 200 === 0) {
              console.log(`Restaurando transacción ${i + 1}/${totalTransactions}`);
              setStatus({ type: 'info', message: `Restaurando transacciones: ${i + 1}/${totalTransactions}...` });
            }

            await firebaseService.saveTransaction(clubId, {
              ...transaction,
              id: transactionId,
              studentId: transaction.studentId,
              studentName: transaction.studentName || '',
              type: transaction.type || 'charge',
              amount: Number(transaction.amount) || 0,
              date: transaction.date ? new Date(transaction.date) : new Date(),
              description: transaction.description || '',
              status: transaction.status || 'Pendiente',
              classId: classId,
              className: transaction.className || ''
            });
            restoredCounts.transactions++;
          } catch (err) {
            console.error(`✗ Error al restaurar transacción ${i + 1}:`, err);
            errors.push(`Error al restaurar transacción ${i + 1}: ${err}`);
          }
        }
        console.log(`=== FINALIZADA RESTAURACIÓN DE TRANSACCIONES: ${restoredCounts.transactions}/${totalTransactions} exitosas ===`);
      }

      // Restaurar recibos
      if (hasReceipts) {
        console.log(`=== INICIANDO RESTAURACIÓN DE ${backupData.receipts.length} RECIBOS ===`);
        const totalReceipts = backupData.receipts.length;

        for (let i = 0; i < totalReceipts; i++) {
          const receipt = backupData.receipts[i];

          try {
            if (!receipt.studentId || !receipt.id) {
              console.warn('Recibo sin studentId o ID, omitiendo:', receipt);
              continue;
            }

            const receiptId = isValidUUID(receipt.id) ? receipt.id : generateUUID();

            if (i % 100 === 0) {
              console.log(`Restaurando recibo ${i + 1}/${totalReceipts}`);
              setStatus({ type: 'info', message: `Restaurando recibos: ${i + 1}/${totalReceipts}...` });
            }

            await firebaseService.saveReceipt(clubId, {
              ...receipt,
              id: receiptId,
              studentId: receipt.studentId,
              studentName: receipt.studentName || '',
              date: receipt.date ? new Date(receipt.date) : new Date(),
              transactions: Array.isArray(receipt.transactions) ? receipt.transactions : [],
              totalAmount: Number(receipt.totalAmount) || 0,
              discountAmount: Number(receipt.discountAmount) || 0,
              paidAmount: Number(receipt.paidAmount) || 0
            });
            restoredCounts.receipts++;
          } catch (err) {
            console.error(`✗ Error al restaurar recibo ${i + 1}:`, err);
            errors.push(`Error al restaurar recibo ${i + 1}: ${err}`);
          }
        }
        console.log(`=== FINALIZADA RESTAURACIÓN DE RECIBOS: ${restoredCounts.receipts}/${totalReceipts} exitosas ===`);
      }

      let message = `¡Backup restaurado exitosamente!`;

      if (restoredCounts.students > 0) message += ` ${restoredCounts.students} alumnos`;
      if (restoredCounts.classes > 0) message += `${restoredCounts.students > 0 ? ',' : ''} ${restoredCounts.classes} clases`;
      if (restoredCounts.transactions > 0) message += `${restoredCounts.students > 0 || restoredCounts.classes > 0 ? ',' : ''} ${restoredCounts.transactions} transacciones`;
      if (restoredCounts.receipts > 0) message += `${restoredCounts.students > 0 || restoredCounts.classes > 0 || restoredCounts.transactions > 0 ? ',' : ''} ${restoredCounts.receipts} recibos`;

      message += ' restaurados.';

      if (errors.length > 0) {
        message += ` (${errors.length} registros tuvieron errores)`;
        console.error('Errores durante restauración:', errors);
      }

      message += ' Por favor recarga la página.';

      setStatus({
        type: restoredCounts.students + restoredCounts.classes + restoredCounts.transactions + restoredCounts.receipts > 0 ? 'success' : 'error',
        message
      });

      if (restoredCounts.students + restoredCounts.classes + restoredCounts.transactions + restoredCounts.receipts > 0) {
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }

    } catch (error) {
      console.error('❌ ERROR CRÍTICO AL RESTAURAR BACKUP:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
      console.error('Clases restauradas antes del error:', restoredCounts.classes);
      console.error('Alumnos restaurados antes del error:', restoredCounts.students);
      setStatus({
        type: 'error',
        message: `Error al restaurar el backup: ${error instanceof Error ? error.message : 'Error desconocido'}. Restauradas: ${restoredCounts.classes} clases, ${restoredCounts.students} alumnos.`
      });
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center space-x-3 mb-3">
          <Database className="w-8 h-8" />
          <h2 className="text-2xl font-bold">Backup y Restauración</h2>
        </div>
        <p className="text-blue-100">
          Guarda una copia completa de todos tus datos o restaura información desde un backup anterior.
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Importante:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>El backup incluye: alumnos, clases, transacciones y recibos</li>
              <li>Guarda los backups en un lugar seguro</li>
              <li>Al restaurar, los datos se agregarán al club actual</li>
              <li>Puedes restaurar backups de otros sistemas compatibles</li>
            </ul>
          </div>
        </div>
      </div>

      {status && (
        <div className={`p-4 rounded-lg border-l-4 ${
          status.type === 'success' ? 'bg-green-50 border-green-400' :
          status.type === 'error' ? 'bg-red-50 border-red-400' :
          'bg-blue-50 border-blue-400'
        }`}>
          <div className="flex items-start">
            {status.type === 'success' && <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3" />}
            {status.type === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />}
            {status.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />}
            <p className={`text-sm ${
              status.type === 'success' ? 'text-green-800' :
              status.type === 'error' ? 'text-red-800' :
              'text-blue-800'
            }`}>
              {status.message}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-green-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Download className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Exportar Backup</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Descarga una copia completa de todos tus datos en formato JSON. Incluye alumnos, clases, transacciones y recibos.
          </p>
          <button
            onClick={exportBackup}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-6 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>{loading ? 'Exportando...' : 'Descargar Backup'}</span>
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200">
          <div className="flex items-center space-x-3 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Upload className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">Restaurar Backup</h3>
          </div>
          <p className="text-gray-600 mb-6">
            Sube un archivo de backup para restaurar información. Compatible con backups de otros sistemas.
          </p>
          <label className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50">
            <Upload className="w-5 h-5" />
            <span>{loading ? 'Restaurando...' : 'Seleccionar Archivo'}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={loading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <Shield className="w-6 h-6 text-gray-600" />
          <h3 className="text-lg font-bold text-gray-800">Información del Club Actual</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Club:</p>
            <p className="font-semibold text-gray-800">{clubName}</p>
          </div>
          <div>
            <p className="text-gray-600">ID del Club:</p>
            <p className="font-mono text-xs text-gray-800">{clubId}</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
        <h3 className="text-lg font-bold text-blue-900 mb-3">¿Cómo usar esta función?</h3>
        <div className="space-y-3 text-sm text-blue-800">
          <div>
            <p className="font-semibold">1. Para hacer un backup:</p>
            <p className="ml-4">Haz clic en "Descargar Backup" y guarda el archivo JSON en un lugar seguro.</p>
          </div>
          <div>
            <p className="font-semibold">2. Para restaurar:</p>
            <p className="ml-4">Haz clic en "Seleccionar Archivo" y elige el archivo de backup que quieres restaurar.</p>
          </div>
          <div>
            <p className="font-semibold">3. Migración entre sistemas:</p>
            <p className="ml-4">Puedes usar un backup del sistema anterior y restaurarlo aquí sin problemas.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
