# 🔍 Cómo Ver Errores en la Consola del Navegador

## ¿Por qué necesito la consola?

La consola del navegador muestra mensajes detallados sobre qué está pasando en tu aplicación. Es la forma más rápida de diagnosticar problemas.

---

## Paso 1: Abrir la Consola

### En Google Chrome, Edge, o Brave:

**Opción A:** Presiona **F12** en tu teclado

**Opción B:**
1. Clic derecho en cualquier parte de la página
2. Selecciona "Inspeccionar" o "Inspect"
3. Haz clic en la pestaña "Console"

**Opción C:**
1. Menú (tres puntos arriba a la derecha)
2. Más herramientas → Herramientas para desarrolladores
3. Pestaña "Console"

---

### En Firefox:

**Opción A:** Presiona **F12** en tu teclado

**Opción B:**
1. Menú (tres líneas arriba a la derecha)
2. Más herramientas → Herramientas para desarrolladores web
3. Pestaña "Consola"

---

### En Safari (Mac):

Primero habilita el menú de desarrollo:
1. Safari → Preferencias
2. Avanzado
3. Marca "Mostrar el menú Desarrollo en la barra de menús"

Luego:
**Opción A:** Presiona **Cmd + Option + C**

**Opción B:**
1. Menú Desarrollo → Mostrar Consola JavaScript

---

## Paso 2: Recargar la Página

Una vez que tienes la consola abierta:

1. Presiona **F5** o **Ctrl + R** (Windows/Linux)
2. O **Cmd + R** (Mac)
3. Esto recarga la página y verás todos los mensajes desde el inicio

---

## Paso 3: Leer los Mensajes

La consola muestra diferentes tipos de mensajes:

### ✅ Mensajes Informativos (azul/gris)

Ejemplo:
```
Iniciando sesión anónima en Firebase...
🔄 Cargando datos para club: abc123
```

Estos son normales y buenos.

---

### ⚠️ Advertencias (amarillo/naranja)

Ejemplo:
```
⚠️ Warning: Something might be wrong
[Contextify] [WARNING] running source code in new context
```

Las advertencias no son críticas pero pueden indicar problemas potenciales.

---

### ❌ Errores (rojo)

Ejemplo:
```
❌ ERROR: No se pudo iniciar sesión anónima en Firebase
FirebaseError: Missing or insufficient permissions
```

Los errores ROJOS son los más importantes. **Cópialos completamente**.

---

## Paso 4: Buscar Errores Específicos

### Error 1: Authentication

**Busca este texto:**
```
ERROR: No se pudo iniciar sesión anónima
auth/operation-not-allowed
```

**Qué significa:** Firebase Authentication no está habilitada

**Solución:** Lee `SOLUCION_ALUMNOS_NO_APARECEN.md`

---

### Error 2: Permisos de Firestore

**Busca este texto:**
```
FirebaseError: Missing or insufficient permissions
permission-denied
PERMISSION_DENIED
```

**Qué significa:** Las reglas de Firestore están bloqueando el acceso

**Solución:** Lee `VERIFICAR_FIRESTORE.md`

---

### Error 3: Sin Club ID

**Busca este texto:**
```
⚠️ No hay clubId, no se pueden cargar datos
```

**Qué significa:** No has seleccionado un club o hay un problema con el sistema de clubs

**Solución:**
1. Vuelve a la pantalla de selección de club
2. Selecciona un club
3. Ingresa la contraseña correcta

---

### Error 4: Variables de entorno

**Busca este texto:**
```
FirebaseError: Firebase: Error (app/invalid-api-key)
FirebaseError: Firebase: Error (app/invalid-project-id)
```

**Qué significa:** Las credenciales en `.env` están mal configuradas

**Solución:** Lee `FIREBASE_SETUP.md` sección "Configurar las variables de entorno"

---

## Paso 5: Verificar el Flujo Completo

Cuando la aplicación funciona bien, deberías ver esta secuencia:

```
1. Iniciando sesión anónima en Firebase...
2. ✅ Sesión anónima establecida correctamente
3. 🔄 Cargando datos para club: [tu-club-id]
4. 📊 Datos cargados de Firebase:
     - Alumnos: 5
     - Clases: 10
     - Transacciones: 15
5. ✅ Datos cargados en el estado exitosamente
```

---

## Paso 6: Crear un Alumno de Prueba

Con la consola abierta:

1. Crea un nuevo alumno en la aplicación
2. Observa la consola, deberías ver:

```
🟢 ADD_STUDENT: Guardando alumno: {id: "123", name: "Juan Pérez", ...}
✅ Alumno guardado exitosamente en Firebase
```

3. Si ves un error aquí, cópialo completo

---

## Paso 7: Copiar los Errores

Para copiar un error:

### Método 1: Copiar todo
1. Clic derecho en la consola
2. "Select all" o "Seleccionar todo"
3. Clic derecho → "Copy" o Ctrl+C
4. Pega en un archivo de texto

### Método 2: Copiar un mensaje específico
1. Clic derecho en el mensaje de error
2. "Copy" o "Copiar mensaje"
3. Pega en un archivo de texto

---

## Tips Útiles

### Limpiar la Consola

Si hay demasiados mensajes:
- Haz clic en el ícono 🚫 (prohibido) en la parte superior izquierda de la consola
- O presiona Ctrl+L (Windows) / Cmd+K (Mac)

### Filtrar Mensajes

En la parte superior de la consola hay opciones para filtrar:
- **Errors** (Errores) - Muestra solo errores rojos
- **Warnings** (Advertencias) - Muestra solo advertencias amarillas
- **Info** - Muestra mensajes informativos
- **Verbose** - Muestra todo

### Mantener el Log

Si la página se recarga y pierdes los mensajes:
1. Clic derecho en la consola
2. Marca "Preserve log" o "Conservar registro"
3. Ahora los mensajes no se borrarán al recargar

---

## ¿Qué hago con los errores?

1. **Lee el error completo** - No solo las primeras palabras
2. **Busca en esta guía** - Los errores comunes están listados arriba
3. **Consulta el archivo correspondiente** según el tipo de error
4. **Copia el error completo** si necesitas ayuda

---

## Ejemplos Visuales

### Consola Sin Errores ✅
```
Console                                    ×
▼ Iniciando sesión anónima en Firebase...
  ✅ Sesión anónima establecida correctamente
  🔄 Cargando datos para club: abc123
  📊 Datos cargados de Firebase:
    - Alumnos: 5
    - Clases: 10
  ✅ Datos cargados en el estado exitosamente
```

### Consola Con Error de Auth ❌
```
Console                                    ×
▼ Iniciando sesión anónima en Firebase...
  ❌ ERROR: No se pudo iniciar sesión anónima en Firebase
  ❌ FirebaseError: Firebase: Error (auth/operation-not-allowed)
  ❌ SOLUCIÓN: Debes habilitar la autenticación anónima
```

### Consola Con Error de Permisos ❌
```
Console                                    ×
  ✅ Sesión anónima establecida correctamente
  🔄 Cargando datos para club: abc123
  ❌ Error loading data from Firebase:
  ❌ FirebaseError: Missing or insufficient permissions
```

---

## Resumen

1. ✅ Abre la consola (F12)
2. ✅ Recarga la página (F5)
3. ✅ Lee los mensajes
4. ✅ Busca errores en ROJO
5. ✅ Consulta esta guía según el error
6. ✅ Sigue las instrucciones del archivo correspondiente

---

## Enlaces Rápidos

Según el error que encontraste:

- Error de Authentication → `SOLUCION_ALUMNOS_NO_APARECEN.md`
- Error de Permisos → `VERIFICAR_FIRESTORE.md`
- Diagnóstico general → `SOLUCION_RAPIDA.md`
- Configuración inicial → `FIREBASE_SETUP.md`
- Índice de ayuda → `AYUDA_INICIO.md`
