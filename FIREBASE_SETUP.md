# Configuración de Firebase

Este proyecto ahora utiliza Firebase Firestore como base de datos en la nube para almacenar todos los datos de tu sistema de gestión de clases.

## Pasos para configurar Firebase

### 1. Crear un proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Haz clic en "Agregar proyecto" (o "Add project")
3. Ingresa un nombre para tu proyecto
4. Sigue los pasos del asistente hasta completar la creación

### 2. Crear una aplicación web

1. En la consola de Firebase, ve a la configuración del proyecto (ícono de engranaje)
2. En la pestaña "General", baja hasta "Tus aplicaciones"
3. Haz clic en el ícono de </> (Web)
4. Dale un nombre a tu app (por ejemplo: "Sistema de Clases")
5. NO necesitas configurar Firebase Hosting
6. Haz clic en "Registrar app"

### 3. Obtener las credenciales

Firebase te mostrará un objeto de configuración similar a este:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:xxxxxxxxxxxxx"
};
```

### 4. Configurar las variables de entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza los valores de las variables de Firebase con tus credenciales:

```env
VITE_FIREBASE_API_KEY=tu_api_key_aqui
VITE_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu_proyecto_id
VITE_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
VITE_FIREBASE_APP_ID=tu_app_id
```

### 5. Habilitar Firestore Database

1. En la consola de Firebase, ve a "Firestore Database" en el menú lateral
2. Haz clic en "Crear base de datos"
3. Selecciona **"Comenzar en modo de prueba"** (puedes ajustar las reglas después)
4. Elige la ubicación más cercana a tus usuarios
5. Haz clic en "Habilitar"

### 6. Habilitar Autenticación Anónima (⚠️ CRÍTICO - OBLIGATORIO)

**IMPORTANTE: Sin este paso, el sistema NO FUNCIONARÁ. Los alumnos no se guardarán.**

1. En la consola de Firebase, ve a **"Authentication"** en el menú lateral
2. Si es la primera vez, haz clic en **"Get started"** o **"Comenzar"**
3. Ve a la pestaña **"Sign-in method"** (Método de inicio de sesión)
4. En la lista de proveedores, busca **"Anonymous"** (Anónimo)
5. Haz clic sobre **"Anonymous"**
6. **ACTIVA el interruptor** para habilitar la autenticación anónima
7. Haz clic en **"Guardar"**

**Enlace directo para tu proyecto:**
https://console.firebase.google.com/project/clasespadelsil/authentication/providers

**¿Por qué es necesario?**
El sistema usa autenticación anónima de Firebase para acceder a Firestore de forma segura. Sin esto, todas las operaciones de base de datos fallarán silenciosamente.

**Síntomas si no está habilitado:**
- Los alumnos no aparecen después de crearlos
- Las clases no se guardan
- La consola del navegador muestra errores de Firebase Auth

### 7. Configurar reglas de seguridad (Importante)

Por defecto, el modo de prueba permite acceso de lectura y escritura durante 30 días. Para producción, necesitas configurar reglas de seguridad adecuadas.

Ve a la pestaña "Reglas" en Firestore y configura según tus necesidades. Ejemplo básico:

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

**NOTA:** Esta configuración permite acceso completo. Para producción, deberías implementar autenticación y reglas más restrictivas.

## Estructura de datos en Firebase

El sistema crea las siguientes colecciones automáticamente:

- **students**: Información de los estudiantes
- **classes**: Clases programadas y realizadas
- **transactions**: Transacciones de cargo/pago
- **receipts**: Recibos generados
- **payments**: Pagos realizados
- **invoices**: Facturas emitidas
- **users**: Información del usuario actual

## Migración de datos existentes

Si ya tienes datos en localStorage que deseas migrar a Firebase, puedes usar la consola del navegador:

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Console"
3. Ejecuta este código para exportar tus datos:

```javascript
const data = {
  students: JSON.parse(localStorage.getItem('students') || '[]'),
  classes: JSON.parse(localStorage.getItem('classes') || '[]'),
  transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
  receipts: JSON.parse(localStorage.getItem('receipts') || '[]')
};
console.log(JSON.stringify(data));
```

Luego puedes importar estos datos manualmente a Firebase Firestore.

## Verificación

Una vez configurado, **recarga la página** (F5) y verifica en la consola del navegador (F12):

1. Deberías ver el mensaje: **"Sesión anónima establecida correctamente"**
2. NO deberías ver errores relacionados con Firebase Auth
3. Crea un alumno de prueba y verifica que aparezca en el listado
4. Ve a Firebase Console > Firestore Database y verifica que se creó la estructura de datos

**Consola del navegador (F12):**
- ✅ CORRECTO: "Sesión anónima establecida correctamente"
- ❌ ERROR: "No se pudo iniciar sesión anónima" → Ve al paso 6 y habilita Authentication

## Solución de problemas

### Problema: Los alumnos no aparecen después de crearlos

**Causa:** La autenticación anónima no está habilitada en Firebase.

**Solución:**
1. Abre la consola del navegador (F12)
2. Busca el error que dice: "No se pudo iniciar sesión anónima en Firebase"
3. Ve a: https://console.firebase.google.com/project/clasespadelsil/authentication/providers
4. Habilita "Anonymous" (Anónimo)
5. Recarga la página

### Problema: Errores de permisos en Firestore

**Causa:** Las reglas de seguridad son muy restrictivas.

**Solución temporal (solo para desarrollo):**
1. Ve a Firebase Console > Firestore Database > Reglas
2. Usa estas reglas temporales:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```
3. Publica las reglas

### Otras verificaciones

1. Verifica que todas las variables de entorno estén correctamente configuradas en `.env`
2. Asegúrate de que Firestore esté habilitado en tu proyecto de Firebase
3. Revisa la consola del navegador en busca de errores específicos
4. Verifica que hayas recargado la página después de hacer cambios en Firebase Console
