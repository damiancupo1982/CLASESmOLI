# 📋 PROMPT PARA SISTEMA ANTERIOR (Firebase)

## 🎯 Copia y Pega Este Prompt en tu Sistema Anterior

---

```
Necesito agregar funcionalidades de Backup y Restauración en mi sistema de gestión de clases de pádel que usa Firebase.

REQUISITOS:

1. Crear un módulo de Backup y Restauración con las siguientes características:

   A) EXPORTAR BACKUP:
   - Debe exportar TODA la información del sistema Firebase
   - Incluir: students, classes, transactions, receipts
   - Formato: JSON con la siguiente estructura:
     {
       "version": "1.0",
       "exportDate": "ISO timestamp",
       "clubId": "id del club si es multi-club, o 'default'",
       "clubName": "nombre del club",
       "students": [...],
       "classes": [...],
       "transactions": [...],
       "receipts": [...],
       "metadata": {
         "totalStudents": número,
         "totalClasses": número,
         "totalTransactions": número,
         "totalReceipts": número
       }
     }
   - Convertir todos los timestamps de Firebase a ISO strings
   - Nombre del archivo: backup-[nombre-club]-[fecha].json

   B) RESTAURAR BACKUP:
   - Leer archivo JSON con el formato anterior
   - Validar que tenga la estructura correcta
   - Restaurar todos los datos en Firebase/Firestore
   - Convertir ISO strings de vuelta a timestamps de Firebase
   - Usar batch writes para optimizar (máximo 500 operaciones por batch)
   - NO SOBRESCRIBIR reglas de seguridad - trabajar con las reglas existentes
   - Mostrar mensaje de éxito con cantidad de registros restaurados
   - Recargar la página automáticamente después de restaurar

2. IMPORTANTE - Configuración de Firebase:
   - NO cambiar las reglas de seguridad actuales
   - Usar las credenciales y configuración existente
   - Si hay reglas de seguridad, temporalmente comentar o ajustar para permitir escritura durante restauración
   - Después de restaurar, las reglas vuelven a su estado normal

3. Interfaz de Usuario:
   - Agregar esta funcionalidad en la sección de Configuración/Settings
   - Dos botones principales:
     * "Descargar Backup" → Exporta todo a JSON
     * "Seleccionar Archivo" → Permite cargar un backup para restaurar
   - Mostrar mensajes de estado (cargando, éxito, error)
   - Mostrar información del backup (cantidad de registros)
   - Diseño profesional y claro

4. CRÍTICO - Batch Writes en Firebase:
   - IMPORTANTE: En Firebase, un batch solo se puede usar UNA VEZ
   - Después de hacer batch.commit(), el batch queda "usado"
   - SOLUCIÓN: Crear un nuevo batch después de cada commit
   - Usar 'let batch = writeBatch(db)' (NO 'const')
   - En la función commitBatch, después de await batch.commit(), hacer: batch = writeBatch(db)
   - Esto evita el error "indexOf is not a function" o similar

   Ejemplo correcto:
   ```typescript
   let batch = writeBatch(db); // Usar 'let' no 'const'
   let batchCount = 0;

   const commitBatch = async () => {
     if (batchCount > 0) {
       await batch.commit();
       batch = writeBatch(db); // CREAR NUEVO BATCH
       batchCount = 0;
     }
   };
   ```

5. Estructura de Datos a Exportar/Importar:

   STUDENTS:
   - id, name, dni, phone, address, condition, currentBalance, createdAt, updatedAt

   CLASSES:
   - id, title, date, time, duration, students (array), teacher, price, type, court, status, createdAt

   TRANSACTIONS:
   - id, studentId, amount, type (payment/charge), description, date, method, createdAt

   RECEIPTS:
   - id, studentId, amount, date, method, items (array), createdAt

5. Manejo de Errores:
   - Si el archivo JSON es inválido, mostrar error claro
   - Si falla la restauración, revertir cambios si es posible
   - Logging de errores en consola para debugging

6. Compatibilidad:
   - El backup debe ser compatible con otros sistemas que usen la misma estructura
   - Debe poder restaurar backups generados en otros sistemas
   - Validar versión del backup (actualmente 1.0)

7. Código de Referencia:

Usa esta estructura para el componente BackupRestore:

```typescript
import React, { useState } from 'react';
import { Download, Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { db } from '../firebase/config'; // Tu configuración actual

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

export function BackupRestore() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const exportBackup = async () => {
    // 1. Obtener todas las colecciones de Firebase/Firestore
    // 2. Convertir timestamps a ISO strings
    // 3. Crear objeto con estructura BackupData
    // 4. Generar archivo JSON y descargarlo
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files?.[0];
    // 1. Leer archivo
    // 2. Parsear JSON
    // 3. Validar estructura
    // 4. Restaurar en Firebase usando batch writes
    // IMPORTANTE: Crear nuevo batch después de cada commit
    // let batch = writeBatch(db); // Usar 'let' no 'const'
    // Después de batch.commit(), hacer: batch = writeBatch(db);
    // 5. Mostrar éxito y recargar página
  };

  return (
    <div>
      {/* Interfaz con botones de exportar/importar */}
    </div>
  );
}
```

8. NOTAS IMPORTANTES:
   - NO crear nuevas reglas de seguridad de Firebase
   - Trabajar con la estructura de base de datos existente
   - Si tu sistema NO es multi-club, usa un clubId fijo como "default"
   - Para Firebase Realtime Database, ajustar las rutas según tu estructura
   - Para Firestore, usar las colecciones existentes
   - Asegurarte de que las fechas se manejen correctamente (Firebase Timestamp <-> ISO String)

9. Integración:
   - Agregar el componente en la sección de Settings/Configuración
   - Si no existe, crear una vista de Settings
   - El componente debe ser independiente y no afectar otras funcionalidades

10. Testing:
    - Probar exportar un backup pequeño primero
    - Verificar que el JSON se descargue correctamente
    - Probar restaurar en un club/ambiente de prueba
    - Verificar que todos los datos se restauren correctamente

POR FAVOR:
- Crea el componente completo de BackupRestore
- Intégralo en la sección de Settings
- Asegúrate de que funcione con mi configuración actual de Firebase
- No modifiques las reglas de seguridad existentes
- Hazlo compatible con el formato de backup especificado
```

---

## 📝 INSTRUCCIONES DE USO PARA EL SISTEMA ANTERIOR

### Paso 1: Copiar el Prompt
Copia todo el texto entre las comillas invertidas (```) arriba.

### Paso 2: Pegar en tu IA Assistant
Pega el prompt en Claude, ChatGPT, o el asistente que estés usando para el sistema anterior.

### Paso 3: Verificar la Implementación
El asistente debería crear:
- Un componente `BackupRestore.tsx` (o `.jsx` si no usas TypeScript)
- Integrarlo en tu sección de Settings
- Funciones para exportar e importar

### Paso 4: Ajustes Específicos
Si tu sistema tiene diferencias, menciona:
- Si usas Firebase Realtime Database o Firestore
- Si tienes multi-club o un solo club
- La ruta/estructura de tus colecciones
- Cualquier campo adicional personalizado

### Paso 5: Probar
1. Exporta un backup del sistema anterior
2. Guarda el archivo JSON
3. Usa ese archivo para restaurar en el sistema nuevo

---

## 🔄 MIGRACIÓN ENTRE SISTEMAS

### Flujo Completo:

```
Sistema Anterior (Firebase)
         ↓
    [Exportar Backup]
         ↓
    backup-club-2024.json
         ↓
    [Guardar archivo]
         ↓
Sistema Nuevo (Este)
         ↓
    [Restaurar Backup]
         ↓
    ¡Datos migrados! ✅
```

### Pasos Detallados:

1. **En el Sistema Anterior:**
   - Ve a Settings/Configuración
   - Haz clic en "Descargar Backup"
   - Guarda el archivo JSON

2. **En el Sistema Nuevo:**
   - Ve a Settings/Configuración
   - Haz clic en "Seleccionar Archivo"
   - Elige el backup del sistema anterior
   - Espera a que termine la restauración
   - La página se recargará automáticamente

3. **Verificar:**
   - Revisa que todos los alumnos estén
   - Verifica las clases en el calendario
   - Chequea las transacciones
   - Confirma los recibos

---

## ⚙️ CONFIGURACIÓN DE FIREBASE (Sistema Anterior)

### Si tienes problemas con las reglas de seguridad:

**Para Firebase Realtime Database:**
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

**Para Firestore:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

⚠️ **ADVERTENCIA**: Estas reglas son muy permisivas. Úsalas solo temporalmente para la migración y luego restaura tus reglas de seguridad originales.

### Reglas más seguras (recomendadas después de migrar):

**Firestore:**
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /students/{studentId} {
      allow read, write: if true;
    }
    match /classes/{classId} {
      allow read, write: if true;
    }
    match /transactions/{transactionId} {
      allow read, write: if true;
    }
    match /receipts/{receiptId} {
      allow read, write: if true;
    }
  }
}
```

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Problema: "Permission denied" al restaurar
**Solución**: Ajusta temporalmente las reglas de Firebase como se indicó arriba.

### Problema: "Invalid backup format"
**Solución**: Verifica que el archivo JSON tenga la estructura correcta con las propiedades: version, students, classes, etc.

### Problema: Las fechas no se muestran correctamente
**Solución**: Verifica que las conversiones de timestamp estén correctas. Firebase usa objetos Timestamp especiales.

### Problema: No se restauran todos los datos
**Solución**:
- Revisa la consola del navegador (F12) para ver errores
- Verifica que el batch write esté funcionando
- Asegúrate de que no haya límites de rate en Firebase

### Problema: El archivo es muy grande
**Solución**:
- Divide el backup en varios archivos más pequeños
- O aumenta el límite de batch size (actualmente 500)

---

## 📊 FORMATO DEL BACKUP (Referencia Técnica)

### Estructura Completa:

```json
{
  "version": "1.0",
  "exportDate": "2024-02-11T10:30:00.000Z",
  "clubId": "club-123-abc",
  "clubName": "Mi Club de Pádel",
  "students": [
    {
      "id": "student-1",
      "name": "Juan Pérez",
      "dni": "12345678",
      "phone": "123456789",
      "address": "Calle Principal 123",
      "condition": "Titular",
      "currentBalance": 0,
      "createdAt": "2024-01-01T10:00:00.000Z",
      "updatedAt": "2024-02-01T15:30:00.000Z"
    }
  ],
  "classes": [
    {
      "id": "class-1",
      "title": "Clase Grupal",
      "date": "2024-02-15T18:00:00.000Z",
      "time": "18:00",
      "duration": 60,
      "students": ["student-1", "student-2"],
      "teacher": "Profesor Carlos",
      "price": 1000,
      "type": "Grupal",
      "court": "Cancha 1",
      "status": "scheduled",
      "createdAt": "2024-02-01T10:00:00.000Z"
    }
  ],
  "transactions": [
    {
      "id": "trans-1",
      "studentId": "student-1",
      "amount": 1000,
      "type": "payment",
      "description": "Pago de clase",
      "date": "2024-02-10T14:00:00.000Z",
      "method": "efectivo",
      "createdAt": "2024-02-10T14:00:00.000Z"
    }
  ],
  "receipts": [
    {
      "id": "receipt-1",
      "studentId": "student-1",
      "amount": 1000,
      "date": "2024-02-10T14:00:00.000Z",
      "method": "efectivo",
      "items": [
        {
          "description": "Clase Grupal",
          "amount": 1000
        }
      ],
      "createdAt": "2024-02-10T14:00:00.000Z"
    }
  ],
  "metadata": {
    "totalStudents": 1,
    "totalClasses": 1,
    "totalTransactions": 1,
    "totalReceipts": 1
  }
}
```

### Campos Obligatorios:

- `version`: Versión del formato (actualmente "1.0")
- `exportDate`: Fecha de exportación en ISO format
- `students`, `classes`, `transactions`, `receipts`: Arrays (pueden estar vacíos)
- `metadata`: Objeto con contadores

### Campos Opcionales:

- `clubId`: Si no es multi-club, puede ser "default"
- `clubName`: Nombre descriptivo del club
- Cualquier campo adicional personalizado en tus objetos

---

## ✅ CHECKLIST DE MIGRACIÓN

Antes de migrar:
- [ ] Hacer backup del sistema anterior
- [ ] Verificar que el archivo JSON se descargó correctamente
- [ ] Abrir el JSON y verificar que tiene datos
- [ ] Revisar las reglas de Firebase del sistema nuevo

Durante la migración:
- [ ] Restaurar el backup en el sistema nuevo
- [ ] Esperar a que termine el proceso
- [ ] No cerrar la página durante la restauración

Después de migrar:
- [ ] Verificar que los alumnos se importaron
- [ ] Verificar que las clases están en el calendario
- [ ] Verificar transacciones y saldos
- [ ] Verificar recibos
- [ ] Hacer un nuevo backup del sistema nuevo
- [ ] Guardar ambos backups en lugar seguro

---

## 🎉 ¡LISTO!

Con estas instrucciones y el prompt, podrás:
1. Implementar backup/restore en tu sistema anterior
2. Migrar datos entre sistemas sin problemas
3. Mantener backups de seguridad de toda tu información

Si tienes algún problema, revisa la sección de Solución de Problemas o verifica los logs en la consola del navegador (F12).
