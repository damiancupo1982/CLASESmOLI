# 🎾 Sistema de Gestión de Clases de Pádel

Un sistema completo y profesional para la gestión de academias de pádel, desarrollado con React, TypeScript y Tailwind CSS.

## 🚀 Características Principales

### 🏢 Sistema Multi-Club
- ✅ Gestiona múltiples clubes desde una sola aplicación
- ✅ Autenticación con contraseña para cada club
- ✅ Datos completamente aislados por club
- ✅ Cambio rápido entre clubes
- ✅ Sesión persistente por club

### 👥 Gestión de Alumnos
- ✅ Registro completo de estudiantes (nombre, DNI, teléfono, dirección)
- ✅ Clasificación por condición (Titular, Familiar, Invitado)
- ✅ Búsqueda y filtrado avanzado
- ✅ Historial de cuenta corriente individual
- ✅ Seguimiento de saldos pendientes

### 📅 Calendario y Clases
- ✅ Calendario mensual interactivo
- ✅ Creación de clases individuales y grupales
- ✅ Programación con repetición (semanal/mensual)
- ✅ Replicación inteligente de clases del mes anterior
- ✅ Edición completa de clases programadas
- ✅ Eliminación segura con confirmación
- ✅ Registro de asistencia con un click

### 💰 Sistema de Facturación
- ✅ Gestión de facturas pendientes
- ✅ **Pagos parciales** - Permite cobrar montos menores al total adeudado
- ✅ **Sistema de descuentos** - Aplicar descuentos por clase
- ✅ **Montos personalizados** - Modificar precios individuales
- ✅ Múltiples métodos de pago (efectivo, transferencia, tarjeta)
- ✅ Generación automática de recibos
- ✅ Cálculo automático de saldos restantes

### 📊 Reportes y Análisis
- ✅ Reportes detallados por período
- ✅ Estadísticas de asistencia
- ✅ Análisis de ingresos
- ✅ Exportación a CSV
- ✅ Impresión de reportes
- ✅ Historial completo de recibos

### 🔐 Módulo de Administrador
- ✅ **Panel de control centralizado** para supervisar todos los clubes
- ✅ **Dashboard completo** con métricas en tiempo real
- ✅ **Vista de todos los clubes** con estadísticas individuales
- ✅ **Seguimiento de morosos** con tabla detallada
- ✅ **Filtros avanzados** por club, fecha y rangos
- ✅ **Gráficos de facturación** mensuales
- ✅ **Exportación de reportes** en JSON
- ✅ **Análisis comparativo** entre clubes
- ✅ **Métricas financieras** completas (ingresos, egresos, balance)
- ✅ **Tasa de morosidad** y estadísticas de clientes
- 🔒 Acceso protegido con contraseña: `842114`

📖 **Documentación completa**: Ver [ADMIN_MODULE.md](./ADMIN_MODULE.md)

### 💾 Backup y Restauración
- ✅ **Exportación completa** de todos los datos a JSON
- ✅ **Importación/Restauración** desde archivos de backup
- ✅ **Migración entre sistemas** compatible con formato estándar
- ✅ **Incluye todo**: alumnos, clases, transacciones, recibos
- ✅ **Batch processing** optimizado para grandes volúmenes
- ✅ **Validación de formato** antes de restaurar
- ✅ **Sin pérdida de datos** - operaciones seguras
- ✅ **Compatible** con sistema anterior (Firebase)

📖 **Documentación completa**: Ver [GUIA_BACKUP_RESTORE.md](./GUIA_BACKUP_RESTORE.md)
📋 **Prompt para sistema anterior**: Ver [BACKUP_RESTORE_PROMPT.md](./BACKUP_RESTORE_PROMPT.md)

### 🔧 Características Técnicas
- ✅ Interfaz responsive (móvil y desktop)
- ✅ Base de datos en la nube con Firebase
- ✅ Acceso desde cualquier dispositivo
- ✅ Validaciones completas
- ✅ Manejo de errores
- ✅ Diseño profesional con Tailwind CSS
- ✅ Iconografía con Lucide React

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 18 + TypeScript
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Build Tool**: Vite
- **Base de Datos**: Firebase Firestore

## 📦 Instalación

```bash
# Clonar el repositorio
git clone [url-del-repositorio]

# Instalar dependencias
npm install

# Configurar Firebase (ver FIREBASE_SETUP.md)
# Agregar tus credenciales de Firebase en el archivo .env

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🔥 Configuración de Firebase

Para usar este sistema necesitas configurar Firebase. Sigue la guía completa en [FIREBASE_SETUP.md](./FIREBASE_SETUP.md).

Pasos rápidos:
1. Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
2. Habilita Firestore Database
3. **Habilita Firebase Authentication (Anonymous)** ← MUY IMPORTANTE
4. Copia tus credenciales al archivo `.env`
5. ¡Listo para usar!

## 🆘 Solución de Problemas

### 🎉 ¿Acabas de actualizar? LEE ESTO PRIMERO

**[PROBLEMA_RESUELTO.md](./PROBLEMA_RESUELTO.md)** ⭐⭐⭐ - Si acabas de actualizar la aplicación, lee este archivo para verificar que todo funcione correctamente.

---

### ⚠️ Los alumnos no aparecen cuando los creo

Este es el problema más común. **EMPIEZA AQUÍ:**

1. **[SOLUCION_RAPIDA.md](./SOLUCION_RAPIDA.md)** ⭐ - Diagnóstico paso a paso (LEE ESTO PRIMERO)
2. **[COMO_VER_ERRORES.md](./COMO_VER_ERRORES.md)** - Cómo usar la consola del navegador (F12)
3. **[SOLUCION_ALUMNOS_NO_APARECEN.md](./SOLUCION_ALUMNOS_NO_APARECEN.md)** - Problema de autenticación
4. **[VERIFICAR_FIRESTORE.md](./VERIFICAR_FIRESTORE.md)** - Problema de permisos/reglas

### 📚 Índice de Ayuda

- **[AYUDA_INICIO.md](./AYUDA_INICIO.md)** - Índice completo de toda la documentación de ayuda

### Pasos Rápidos:

1. Abre la consola del navegador (presiona **F12**)
2. Recarga la página (presiona **F5**)
3. Busca mensajes en ROJO
4. Sigue las instrucciones en `SOLUCION_RAPIDA.md` según el error

### Verificación Rápida:

✅ **Todo funciona si ves estos mensajes en la consola:**
```
✅ Sesión anónima establecida correctamente
🔄 Cargando datos para club: [tu-club-id]
📊 Datos cargados de Firebase: - Alumnos: X
```

❌ **Hay un problema si ves:**
```
❌ ERROR: No se pudo iniciar sesión anónima
❌ FirebaseError: Missing or insufficient permissions
```

**Solución:** Lee `SOLUCION_RAPIDA.md`

## 🏢 Sistema Multi-Club

El sistema ahora soporta múltiples clubes con datos aislados y autenticación individual. Ver guía completa en [MULTICLUB_SETUP.md](./MULTICLUB_SETUP.md).

### Inicio Rápido:
1. Al abrir la app, verás la pantalla de selección de clubes
2. Haz clic en "Crear Nuevo Club" para tu primer club
3. Ingresa nombre, descripción y contraseña
4. Accede con la contraseña cuando selecciones el club
5. Todos los datos están aislados por club

## 🎯 Uso del Sistema

### 1. Gestión de Alumnos
1. Ve a la sección **"Alumnos"**
2. Haz click en **"Nuevo Alumno"** para registrar estudiantes
3. Usa la búsqueda para encontrar alumnos específicos
4. Click en el ícono de edición para modificar datos
5. Click en el ícono de dólar para ver la cuenta corriente

### 2. Programación de Clases
1. Ve a la sección **"Agenda"**
2. Haz click en cualquier día para crear una nueva clase
3. Configura tipo (individual/grupal), precio, alumnos y horario
4. Usa **"Repetir mes anterior"** para replicar clases automáticamente
5. Click en cualquier clase para editarla o eliminarla

### 3. Registro de Asistencia
1. En el calendario, click en una clase programada
2. Haz click en **"Registrar Asistencia"**
3. Marca cada alumno como Presente o Ausente
4. El sistema genera automáticamente los cargos por las clases

### 4. Facturación y Cobros
1. Ve a la sección **"Facturas"**
2. Verás todos los alumnos con deudas pendientes
3. Haz click en **"Cobrar"** para procesar pagos

#### Opciones de Pago:
- **Pago completo**: Cobra todas las clases seleccionadas
- **Pago parcial**: Activa el checkbox y ingresa el monto que paga el alumno
- **Descuentos**: Ingresa descuentos individuales por clase
- **Montos custom**: Modifica el precio de clases específicas

### 5. Reportes
1. Ve a la sección **"Reportes"**
2. Selecciona el rango de fechas
3. Exporta datos a CSV o imprime reportes
4. Click en cualquier alumno para ver su historial detallado

### 6. Historial de Recibos
1. Ve a la sección **"Recibos"**
2. Filtra por alumno o fecha
3. Imprime o exporta recibos individuales
4. Elimina recibos si es necesario

## 💡 Casos de Uso Comunes

### Pago Parcial
**Situación**: Un alumno debe $3000 pero solo puede pagar $1500
1. En "Facturas", click en "Cobrar"
2. Activa "Pago parcial"
3. Ingresa $1500
4. El sistema crea automáticamente una nueva deuda de $1500

### Aplicar Descuento
**Situación**: Dar 20% de descuento a un alumno regular
1. En "Facturas", selecciona las clases
2. En el campo "Descuento", ingresa el monto del descuento
3. El total se actualiza automáticamente

### Replicar Clases Mensuales
**Situación**: Copiar todas las clases del mes anterior
1. En "Agenda", click en "Repetir mes anterior"
2. El sistema replica automáticamente por día de semana
3. Mantiene horarios, precios y alumnos asignados

## 🔒 Seguridad y Datos

- Los datos se almacenan en Firebase Firestore (nube)
- Acceso desde cualquier dispositivo con las mismas credenciales
- Respaldo automático en la nube
- Validaciones para prevenir pérdida de datos
- Configura reglas de seguridad en Firebase Console

### Migración de Datos

Si tenías datos previos en localStorage, puedes migrarlos fácilmente:
1. Abre la consola del navegador (F12)
2. Ejecuta: `migrateToFirebase()`
3. Espera a que termine la migración
4. Recarga la página

## 🎨 Personalización

El sistema utiliza Tailwind CSS, permitiendo fácil personalización de:
- Colores y temas
- Espaciado y tipografía
- Componentes responsive
- Animaciones y transiciones

## 📱 Compatibilidad

- ✅ Chrome, Firefox, Safari, Edge
- ✅ Dispositivos móviles (responsive)
- ✅ Tablets y desktop
- ✅ Acceso multi-dispositivo con Firebase
- ✅ Sincronización en tiempo real

## 🚀 Despliegue

El sistema está optimizado para despliegue en:
- Netlify (recomendado)
- Vercel
- GitHub Pages
- Cualquier hosting de archivos estáticos

## 🤝 Contribuciones

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Envía un pull request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico o consultas:
- Crear un issue en GitHub
- Documentación completa en el README
- Código completamente comentado

---

**Desarrollado con ❤️ para academias de pádel profesionales**