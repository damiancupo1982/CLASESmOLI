# 🔧 SOLUCIÓN: Los alumnos no aparecen en el listado

## Problema
Cuando creas alumnos en tu club, no aparecen en el listado de alumnos.

## ⚡ Solución Rápida
**PRIMERO LEE:** `SOLUCION_RAPIDA.md` - Tiene un diagnóstico paso a paso

## Posibles Causas

Este problema puede tener 2 causas principales:

1. **Firebase Authentication (Anónima) no está habilitada** ← Este documento
2. **Las reglas de Firestore están bloqueando las operaciones** ← Ver `VERIFICAR_FIRESTORE.md`

---

## Causa 1: Authentication no habilitada

Si ves este error en la consola (F12):
```
ERROR: No se pudo iniciar sesión anónima en Firebase
auth/operation-not-allowed
```

Significa que Firebase Authentication (Anónima) no está habilitada en tu proyecto.

## Solución (3 pasos simples)

### Paso 1: Abrir Firebase Console
1. Ve a: https://console.firebase.google.com/project/clasespadelsil/authentication/providers
2. O navega manualmente:
   - Abre https://console.firebase.google.com/
   - Selecciona tu proyecto "clasespadelsil"
   - En el menú lateral, haz clic en "Authentication"

### Paso 2: Habilitar Autenticación Anónima
1. Si es la primera vez, haz clic en **"Get started"** o **"Comenzar"**
2. Haz clic en la pestaña **"Sign-in method"**
3. En la lista de proveedores, busca **"Anonymous"** (Anónimo)
4. Haz clic sobre la fila "Anonymous"
5. **Activa el interruptor** (debe quedar en azul/verde)
6. Haz clic en **"Guardar"** o **"Save"**

### Paso 3: Verificar que funcione
1. Vuelve a tu aplicación en el navegador
2. **Recarga la página** (presiona F5)
3. Abre la consola del navegador (presiona F12)
4. Busca el mensaje: **"Sesión anónima establecida correctamente"**
5. Ahora intenta crear un alumno de nuevo
6. ¡Debería aparecer en el listado!

## Verificación Visual

### ✅ CORRECTO - En la consola del navegador verás:
```
Iniciando sesión anónima en Firebase...
Sesión anónima establecida correctamente
```

### ❌ ERROR - Si ves esto, es porque no está habilitado:
```
ERROR: No se pudo iniciar sesión anónima en Firebase:
FirebaseError: Firebase: Error (auth/operation-not-allowed)
SOLUCIÓN: Debes habilitar la autenticación anónima en Firebase Console
```

## ¿Por qué es necesario?

Firebase Firestore (la base de datos) requiere autenticación para todas las operaciones. Usamos autenticación anónima para que el sistema funcione sin que los usuarios tengan que crear cuentas.

Sin la autenticación habilitada:
- No se pueden guardar alumnos
- No se pueden guardar clases
- No se pueden guardar transacciones
- Básicamente, nada se guarda en la base de datos

## Video/Imágenes de referencia

En Firebase Console, "Anonymous" debe verse así:
- Estado: **Habilitado** (Enabled)
- Color: Verde o Azul
- El interruptor debe estar hacia la derecha

## ¿Necesitas más ayuda?

1. Revisa la consola del navegador (F12) para ver mensajes de error específicos
2. Verifica que las credenciales en `.env` sean correctas
3. Asegúrate de recargar la página después de hacer cambios en Firebase Console
4. Si el problema persiste, revisa que Firestore Database también esté habilitado
