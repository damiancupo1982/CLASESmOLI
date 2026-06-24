# 🔍 Verificación de Firestore - Los alumnos no aparecen

## Paso 1: Abrir la Consola del Navegador

1. Abre tu aplicación en el navegador
2. Presiona **F12** para abrir las herramientas de desarrollador
3. Ve a la pestaña **Console**

## Paso 2: Revisar los mensajes de logging

Busca estos mensajes en orden:

### ✅ Mensajes CORRECTOS que deberías ver:

```
Iniciando sesión anónima en Firebase...
Sesión anónima establecida correctamente
🔄 Cargando datos para club: [tu-club-id]
📊 Datos cargados de Firebase:
  - Alumnos: 0
  - Clases: 0
  - Transacciones: 0
✅ Datos cargados en el estado exitosamente
```

### ❌ ERRORES comunes y sus soluciones:

#### Error 1: "permission-denied" o "PERMISSION_DENIED"

**Lo que ves:**
```
❌ Error loading data from Firebase: FirebaseError: Missing or insufficient permissions
```

**Causa:** Las reglas de Firestore están muy restrictivas.

**Solución:** Ve al **Paso 3**.

---

#### Error 2: "No se pudo iniciar sesión anónima"

**Lo que ves:**
```
ERROR: No se pudo iniciar sesión anónima en Firebase
FirebaseError: Firebase: Error (auth/operation-not-allowed)
```

**Causa:** La autenticación anónima no está habilitada.

**Solución:** Sigue las instrucciones en `SOLUCION_ALUMNOS_NO_APARECEN.md`.

---

## Paso 3: Verificar y Corregir las Reglas de Firestore

### 3.1 Ir a las Reglas de Firestore

1. Abre: https://console.firebase.google.com/project/clasespadelsil/firestore/rules
2. O navega manualmente:
   - Firebase Console
   - Firestore Database
   - Pestaña "Reglas" (Rules)

### 3.2 Revisar las Reglas Actuales

Verás algo como esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false;  // ❌ ESTO BLOQUEA TODO
    }
  }
}
```

O esto:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if
          request.time < timestamp.date(2026, 3, 1);  // ⚠️ EXPIRÓ
    }
  }
}
```

### 3.3 Usar estas Reglas (Para Desarrollo)

**COPIA Y PEGA estas reglas en el editor:**

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso solo a usuarios autenticados (incluso anónimos)
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3.4 Publicar las Reglas

1. Haz clic en el botón **"Publicar"** (Publish)
2. Espera a que diga "Reglas publicadas correctamente"

### 3.5 Verificar en tu App

1. Vuelve a tu aplicación
2. **Recarga la página** (F5)
3. Abre la consola (F12)
4. Deberías ver:
   ```
   ✅ Sesión anónima establecida correctamente
   🔄 Cargando datos para club: [tu-club-id]
   ```

---

## Paso 4: Crear un Alumno de Prueba

1. En tu aplicación, crea un nuevo alumno
2. Mira la consola del navegador (F12)

### ✅ Deberías ver:

```
🟢 ADD_STUDENT: Guardando alumno: {id: "1234567890", name: "Juan Pérez", ...}
✅ Alumno guardado exitosamente en Firebase
```

### ❌ Si ves esto, hay un problema:

```
🟢 ADD_STUDENT: Guardando alumno: {id: "1234567890", name: "Juan Pérez", ...}
❌ ERROR al guardar alumno en Firebase: FirebaseError: Missing or insufficient permissions
Detalles del error: Missing or insufficient permissions.
```

**Solución:** Vuelve al **Paso 3** y asegúrate de haber publicado las reglas correctamente.

---

## Paso 5: Verificar en Firebase Console

1. Abre: https://console.firebase.google.com/project/clasespadelsil/firestore/data
2. Deberías ver esta estructura:

```
📁 clubs
  └─ 📁 [tu-club-id]
       ├─ 📁 students
       │    └─ 📄 [student-id]
       ├─ 📁 classes
       └─ 📁 transactions
```

3. Haz clic en **clubs** → **[tu-club-id]** → **students**
4. Deberías ver los documentos de tus alumnos

---

## Resumen de Verificación

### ✅ Todo funciona bien si:

1. ✅ Ves "Sesión anónima establecida correctamente"
2. ✅ Ves "🔄 Cargando datos para club..."
3. ✅ Cuando creas un alumno, ves "✅ Alumno guardado exitosamente"
4. ✅ Los alumnos aparecen en el listado
5. ✅ En Firebase Console > Firestore, ves los documentos creados

### ❌ Hay un problema si:

1. ❌ Ves errores de "permission-denied" → Revisa las reglas (Paso 3)
2. ❌ Ves "auth/operation-not-allowed" → Habilita auth anónima
3. ❌ Los alumnos no aparecen pero no hay errores → Recarga la página (F5)
4. ❌ Firestore está vacío → Las reglas están bloqueando las escrituras

---

## Reglas de Firestore - Explicación

### Qué significan las reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      // Esta regla se aplica a TODOS los documentos
      allow read, write: if request.auth != null;
      // Permite leer y escribir solo si hay un usuario autenticado
      // (incluyendo usuarios anónimos)
    }
  }
}
```

### Para Producción (más seguras):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /clubs/{clubId} {
      // Cualquier usuario autenticado puede leer clubs
      allow read: if request.auth != null;
      // Solo para crear (puedes ajustar esto)
      allow create: if request.auth != null;

      // Subcolecciones del club
      match /{subcollection=**} {
        // Leer/escribir datos del club si está autenticado
        allow read, write: if request.auth != null;
      }
    }
  }
}
```

---

## Contacto y Soporte

Si después de seguir todos estos pasos sigue sin funcionar:

1. Copia TODOS los mensajes de error de la consola
2. Verifica que Firebase Authentication esté habilitado
3. Verifica que Firestore Database esté habilitado
4. Verifica que las reglas estén publicadas
5. Intenta crear un documento manualmente en Firestore Console para verificar permisos
