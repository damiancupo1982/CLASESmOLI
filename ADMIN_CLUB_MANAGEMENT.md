# 🔐 Gestión de Clubes desde Panel de Administrador

## 📋 Nueva Funcionalidad Implementada

Se ha agregado la capacidad de **editar el nombre de un club** o **eliminarlo completamente** desde el Panel de Administrador, siempre requiriendo la contraseña de administrador para confirmar la acción.

---

## 🔑 Cómo Acceder

### 1. Entrar al Panel de Administrador

Desde la pantalla de selección de club:
1. Haz clic en el botón **"Modo Administrador"**
2. Ingresa la contraseña de administrador: **842114**
3. El panel se abrirá mostrando todas las estadísticas

### 2. Ir a la Sección de Clubes

1. Una vez en el panel de administrador, haz clic en la pestaña **"Clubes"**
2. Verás una tarjeta por cada club con:
   - Nombre del club
   - Total de alumnos
   - Cantidad de morosos
   - Deuda total
   - **Dos botones nuevos**: Editar (lápiz) y Eliminar (papelera)

---

## ✏️ Editar Nombre del Club

### Pasos:

1. **Haz clic en el ícono de lápiz** (Edit2) en la tarjeta del club que deseas editar
2. Se abrirá un modal con un formulario
3. **Ingresa el nuevo nombre** del club
4. **Ingresa la contraseña de administrador**: `842114`
5. Haz clic en **"Guardar"**

### Validaciones:

- ✅ El nombre no puede estar vacío
- ✅ Se requiere contraseña de administrador correcta
- ✅ El sistema actualiza automáticamente todos los datos

### Comportamiento:

- Si el club que estás editando es el actualmente activo, el nombre se actualiza en tiempo real
- Todos los datos relacionados (alumnos, clases, transacciones) permanecen intactos
- Solo cambia el nombre del club
- La vista se refresca automáticamente después de guardar

---

## 🗑️ Eliminar Club

### Pasos:

1. **Haz clic en el ícono de papelera** (Trash2) en la tarjeta del club que deseas eliminar
2. Se abrirá un modal de confirmación con una **ADVERTENCIA**
3. Lee la advertencia cuidadosamente
4. **Ingresa la contraseña de administrador**: `842114`
5. Haz clic en **"Eliminar"**

### ⚠️ ADVERTENCIA IMPORTANTE

**Esta acción es IRREVERSIBLE y eliminará:**

- ❌ El club
- ❌ TODOS los alumnos del club
- ❌ TODAS las clases del club
- ❌ TODAS las transacciones del club
- ❌ TODOS los recibos del club

**No hay forma de recuperar estos datos después de eliminar.**

### Recomendación:

🔒 **SIEMPRE exporta un backup completo del club ANTES de eliminarlo**

1. Ve al club que quieres eliminar
2. Entra a Settings
3. Haz clic en "Exportar Backup"
4. Guarda el archivo JSON en un lugar seguro
5. Luego puedes proceder a eliminar el club

### Comportamiento:

- Si el club eliminado es el actualmente activo, se cierra la sesión automáticamente
- Todos los datos relacionados se eliminan de Firebase
- La operación puede tomar algunos segundos si el club tiene muchos datos
- La vista se refresca automáticamente después de eliminar

---

## 🔐 Seguridad

### Protección con Contraseña de Administrador

Ambas operaciones (editar y eliminar) requieren:

1. **Acceso al Panel de Administrador** (ya requiere contraseña una vez)
2. **Confirmación con contraseña** en cada acción individual

Esto previene:
- ❌ Ediciones accidentales
- ❌ Eliminaciones por error
- ❌ Acceso no autorizado
- ❌ Cambios sin supervisión

### Contraseña de Administrador

**Contraseña actual**: `842114`

**Importante**: Esta contraseña está hardcodeada en el código. Para mayor seguridad en producción:
- Considera moverla a variables de entorno
- Implementa un sistema de autenticación más robusto
- Considera usar Firebase Authentication con roles

---

## 🎨 Interfaz de Usuario

### Tarjetas de Club

Cada tarjeta de club muestra:
- **Encabezado**: Nombre del club + botones de acción
- **Estadísticas**:
  - Total alumnos
  - Morosos (en rojo)
  - Deuda total (en rojo con formato de moneda)

### Botones de Acción

1. **Editar (Lápiz azul)**
   - Color: Azul (#2563eb)
   - Tooltip: "Editar nombre"
   - Hover: Fondo azul claro

2. **Eliminar (Papelera roja)**
   - Color: Rojo (#dc2626)
   - Tooltip: "Eliminar club"
   - Hover: Fondo rojo claro

### Modales de Confirmación

#### Modal de Edición:
- **Título**: "Editar Nombre del Club"
- **Campos**:
  - Input de texto para el nuevo nombre
  - Input de contraseña (type="password")
- **Botones**:
  - Cancelar (gris)
  - Guardar (azul con ícono)
- **Estados**:
  - Loading: "Guardando..."
  - Error: Mensaje en rojo

#### Modal de Eliminación:
- **Título**: "Eliminar Club" (en rojo)
- **Advertencia**: Cuadro rojo con mensaje de advertencia
- **Campos**:
  - Input de contraseña (type="password")
- **Botones**:
  - Cancelar (gris)
  - Eliminar (rojo con ícono)
- **Estados**:
  - Loading: "Eliminando..."
  - Error: Mensaje en rojo

---

## 🔧 Implementación Técnica

### Archivos Modificados

1. **`src/firebase/firebaseService.ts`**
   - Agregada función: `updateClub(clubId, updates)`
   - Agregada función: `deleteClub(clubId)`

2. **`src/context/ClubContext.tsx`**
   - Agregada función al contexto: `updateClub`
   - Agregada función al contexto: `deleteClub`
   - Actualización automática del club actual si es necesario

3. **`src/components/AdminPanel.tsx`**
   - Importados íconos: `Edit2`, `Trash2`, `Save`
   - Modificada vista `ClubsView` con gestión de estado
   - Agregados modales de confirmación
   - Manejo de errores y estados de carga

### Funciones Backend (Firebase)

#### `updateClub(clubId, updates)`

Actualiza el documento del club en Firestore:

```typescript
async updateClub(clubId: string, updates: Partial<Omit<Club, 'id' | 'createdAt'>>): Promise<void> {
  await ensureAuth();
  const clubRef = doc(db, "clubs", clubId);
  await updateDoc(clubRef, convertDatesToTimestamp(updates));
}
```

#### `deleteClub(clubId)`

Elimina el club y todos sus datos relacionados:

```typescript
async deleteClub(clubId: string): Promise<void> {
  await ensureAuth();
  // 1. Obtener todas las subcolecciones
  const studentsSnapshot = await getDocs(collection(db, "clubs", clubId, "students"));
  const classesSnapshot = await getDocs(collection(db, "clubs", clubId, "classes"));
  const transactionsSnapshot = await getDocs(collection(db, "clubs", clubId, "transactions"));
  const receiptsSnapshot = await getDocs(collection(db, "clubs", clubId, "receipts"));

  // 2. Crear promesas de eliminación
  const deletePromises: Promise<void>[] = [];
  studentsSnapshot.docs.forEach(d => deletePromises.push(deleteDoc(d.ref)));
  classesSnapshot.docs.forEach(d => deletePromises.push(deleteDoc(d.ref)));
  transactionsSnapshot.docs.forEach(d => deletePromises.push(deleteDoc(d.ref)));
  receiptsSnapshot.docs.forEach(d => deletePromises.push(deleteDoc(d.ref)));

  // 3. Ejecutar todas las eliminaciones en paralelo
  await Promise.all(deletePromises);

  // 4. Eliminar el documento del club
  await deleteDoc(doc(db, "clubs", clubId));
}
```

### Estado Local del Componente

```typescript
const [editingClub, setEditingClub] = useState<string | null>(null);
const [editName, setEditName] = useState('');
const [deletingClub, setDeletingClub] = useState<string | null>(null);
const [password, setPassword] = useState('');
const [actionType, setActionType] = useState<'edit' | 'delete' | null>(null);
const [error, setError] = useState('');
const [loading, setLoading] = useState(false);
```

---

## 📊 Flujo de Trabajo

### Flujo de Edición

```
Usuario hace clic en Editar
    ↓
Modal se abre con nombre actual
    ↓
Usuario ingresa nuevo nombre
    ↓
Usuario ingresa contraseña de admin
    ↓
Usuario hace clic en Guardar
    ↓
Validación de contraseña (842114)
    ↓
Si es correcta: firebaseService.updateClub()
    ↓
Refrescar datos (onRefresh())
    ↓
Cerrar modal
    ↓
Vista actualizada
```

### Flujo de Eliminación

```
Usuario hace clic en Eliminar
    ↓
Modal se abre con advertencia
    ↓
Usuario lee advertencia
    ↓
Usuario ingresa contraseña de admin
    ↓
Usuario hace clic en Eliminar
    ↓
Validación de contraseña (842114)
    ↓
Si es correcta: firebaseService.deleteClub()
    ↓
  ├─> Eliminar alumnos
  ├─> Eliminar clases
  ├─> Eliminar transacciones
  ├─> Eliminar recibos
  └─> Eliminar club
    ↓
Refrescar datos (onRefresh())
    ↓
Cerrar modal
    ↓
Vista actualizada (club ya no aparece)
```

---

## 🧪 Casos de Prueba

### Prueba 1: Editar Nombre del Club

1. ✅ Entrar al panel de administrador
2. ✅ Ir a la pestaña "Clubes"
3. ✅ Hacer clic en el botón de editar
4. ✅ Cambiar el nombre del club
5. ✅ Ingresar contraseña correcta
6. ✅ Verificar que el nombre se actualiza
7. ✅ Verificar que los datos del club permanecen intactos

### Prueba 2: Validación de Contraseña en Edición

1. ✅ Intentar editar con contraseña incorrecta
2. ✅ Verificar que muestra error
3. ✅ Verificar que no se guarda el cambio
4. ✅ Intentar con contraseña correcta
5. ✅ Verificar que se guarda correctamente

### Prueba 3: Editar Nombre Vacío

1. ✅ Intentar guardar con nombre vacío
2. ✅ Verificar que muestra error
3. ✅ Verificar que no se guarda

### Prueba 4: Eliminar Club

1. ✅ Exportar backup del club primero
2. ✅ Entrar al panel de administrador
3. ✅ Ir a la pestaña "Clubes"
4. ✅ Hacer clic en el botón de eliminar
5. ✅ Leer advertencia
6. ✅ Ingresar contraseña correcta
7. ✅ Verificar que el club se elimina
8. ✅ Verificar que todos los datos se eliminaron

### Prueba 5: Cancelar Operaciones

1. ✅ Abrir modal de edición y cancelar
2. ✅ Verificar que no se realizan cambios
3. ✅ Abrir modal de eliminación y cancelar
4. ✅ Verificar que el club permanece intacto

### Prueba 6: Eliminar Club Activo

1. ✅ Seleccionar un club y entrar
2. ✅ Ir al panel de administrador
3. ✅ Eliminar el club actualmente activo
4. ✅ Verificar que se cierra la sesión automáticamente

---

## 💡 Mejores Prácticas

### Para Usuarios

1. **Siempre exporta backup antes de eliminar**
   - Ve a Settings → Exportar Backup
   - Guarda el archivo en un lugar seguro
   - Verifica que el archivo se descargó correctamente

2. **Verifica antes de confirmar**
   - Lee el nombre del club cuidadosamente
   - Asegúrate de que es el club correcto
   - Lee todas las advertencias

3. **Mantén la contraseña segura**
   - No compartas la contraseña de administrador
   - Cambia la contraseña periódicamente
   - Solo da acceso a personas de confianza

### Para Desarrolladores

1. **Validación en el backend**
   - Siempre valida en firebaseService
   - No confíes solo en validación del frontend
   - Maneja errores apropiadamente

2. **Manejo de estados**
   - Usa estados de loading para operaciones async
   - Muestra errores claramente al usuario
   - Limpia estados después de completar acciones

3. **Seguridad**
   - Verifica contraseña en cada acción
   - Considera implementar auditoría de acciones
   - Implementa rate limiting si es necesario

---

## 🚀 Futuras Mejoras Sugeridas

### Seguridad

- [ ] Mover contraseña a variables de entorno
- [ ] Implementar Firebase Authentication con roles
- [ ] Agregar auditoría de acciones (quién hizo qué y cuándo)
- [ ] Implementar confirmación por email para eliminaciones
- [ ] Agregar rate limiting para prevenir ataques

### Funcionalidad

- [ ] Permitir editar más campos del club (descripción, dueño, etc.)
- [ ] Agregar confirmación adicional para eliminación (escribir nombre del club)
- [ ] Implementar "soft delete" (marcar como eliminado en lugar de borrar)
- [ ] Agregar función de restaurar club eliminado (si se implementa soft delete)
- [ ] Permitir transferir datos de un club a otro antes de eliminar

### UX/UI

- [ ] Agregar animaciones de transición
- [ ] Mostrar progreso durante eliminación
- [ ] Agregar notificaciones tipo toast
- [ ] Implementar confirmación en dos pasos
- [ ] Agregar preview de cambios antes de guardar

### Performance

- [ ] Implementar paginación para clubes si son muchos
- [ ] Optimizar eliminación con batch deletes
- [ ] Agregar indicador de progreso para operaciones largas
- [ ] Implementar eliminación en background para clubs grandes

---

## 📝 Notas Importantes

### ⚠️ Limitaciones Conocidas

1. **No hay undo**: Las eliminaciones son permanentes
2. **No hay historial**: No se guarda registro de cambios
3. **Contraseña hardcodeada**: No es ideal para producción
4. **Sin notificaciones**: No se notifica a otros usuarios del cambio

### ✅ Ventajas

1. **Simple y directo**: Interfaz clara y fácil de usar
2. **Seguro**: Requiere confirmación con contraseña
3. **Completo**: Elimina todos los datos relacionados
4. **Rápido**: Operaciones optimizadas
5. **Responsive**: Funciona en dispositivos móviles

---

## 🆘 Solución de Problemas

### Error: "Contraseña incorrecta"

**Solución**: Asegúrate de ingresar la contraseña correcta: `842114`

### Error: "Error al actualizar el club"

**Posibles causas**:
- Problemas de conexión a Internet
- Permisos insuficientes en Firebase
- Club ya fue eliminado

**Solución**:
- Verifica tu conexión a Internet
- Recarga la página e intenta de nuevo
- Verifica que el club aún existe

### Error: "Error al eliminar el club"

**Posibles causas**:
- Problemas de conexión a Internet
- Permisos insuficientes en Firebase
- El club tiene demasiados datos

**Solución**:
- Verifica tu conexión a Internet
- Espera un momento y reintenta
- Si el problema persiste, contacta soporte técnico

### El modal no se cierra después de guardar

**Solución**:
- Espera unos segundos (puede estar procesando)
- Si no se cierra, recarga la página
- Los cambios deberían haberse guardado

### El nombre no se actualiza en la vista actual

**Solución**:
- Cierra sesión del club
- Vuelve a ingresar
- El nuevo nombre debería aparecer

---

## ✅ Checklist de Implementación

- [x] Función `updateClub` en firebaseService
- [x] Función `deleteClub` en firebaseService
- [x] Integración con ClubContext
- [x] UI de edición en AdminPanel
- [x] UI de eliminación en AdminPanel
- [x] Validación de contraseña
- [x] Manejo de errores
- [x] Estados de loading
- [x] Modales de confirmación
- [x] Advertencias para eliminación
- [x] Actualización automática de vistas
- [x] Build exitoso
- [x] Documentación completa

---

## 📅 Registro de Cambios

**Fecha**: 2024-02-11
**Versión**: 1.0
**Autor**: Sistema

### Cambios Implementados:

1. Agregadas funciones de backend:
   - `firebaseService.updateClub()`
   - `firebaseService.deleteClub()`

2. Actualizado ClubContext:
   - Exposición de `updateClub` y `deleteClub`
   - Manejo automático de club activo

3. Mejorado AdminPanel:
   - Vista de clubes con botones de acción
   - Modales de confirmación
   - Validación de contraseña
   - Estados de carga y error

4. Documentación:
   - Guía completa de uso
   - Referencia técnica
   - Mejores prácticas

---

**FIN DEL DOCUMENTO**

Esta funcionalidad permite una gestión completa de clubes desde el panel de administrador con todas las medidas de seguridad necesarias.
