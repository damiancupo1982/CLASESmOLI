# 🔐 Módulo de Administrador

## 🎯 Descripción

El **Módulo de Administrador** es un panel de control completo que te permite supervisar y gestionar todos los clubes desde un solo lugar. Es la herramienta perfecta para tener una vista panorámica del negocio.

---

## 🚀 Cómo Acceder

### Desde la Pantalla de Selección de Clubes:

1. En la pantalla inicial donde seleccionas el club, verás un botón al final:
   ```
   🛡️ Modo Administrador
   ```

2. Haz clic en el botón

3. Ingresa la contraseña de administrador: **`842114`**

4. Presiona **"Ingresar"**

---

## 📊 Funcionalidades Principales

### 1. **Dashboard (Tablero Principal)**

Vista general con las métricas más importantes:

#### 📈 Tarjetas de Estadísticas:
- **Total Clubes**: Cantidad de clubes activos en el sistema
- **Total Alumnos**: Suma de todos los alumnos de todos los clubes
- **Deuda Total**: Monto total adeudado por todos los clientes morosos
- **Facturación**: Ingresos totales del periodo seleccionado

#### 📊 Estadísticas Detalladas:

**Estado de Clientes:**
- Alumnos al día
- Alumnos morosos
- Total de alumnos

**Resumen Financiero:**
- Ingresos (pagos recibidos)
- Egresos (cargos realizados)
- Neto (balance)

**Saldos:**
- Crédito a favor
- Deudas pendientes
- Balance total

#### 📉 Gráfico de Facturación:
- Visualización de ingresos por mes
- Barras de progreso mostrando los últimos 6 meses
- Comparación visual entre meses

---

### 2. **Clubes**

Vista detallada de cada club con:

- **Nombre del club**
- **Total de alumnos** en ese club
- **Cantidad de morosos** por club
- **Deuda total** de ese club

Cada club se muestra en una tarjeta individual con toda su información.

---

### 3. **Morosos**

Lista completa de todos los clientes que adeudan dinero:

#### Tabla con:
- **Nombre** del alumno
- **DNI** del alumno
- **Club** al que pertenece
- **Deuda** (monto adeudado)

La tabla está ordenada de mayor a menor deuda, para que veas primero los casos más urgentes.

---

### 4. **Reportes**

Exportación de datos y resumen ejecutivo:

#### Resumen Ejecutivo Incluye:
- Total de clubes activos
- Total de alumnos
- Tasa de morosidad (%)
- Facturación total
- Deuda pendiente

#### Exportación:
- Botón **"Exportar Reporte"** genera un archivo JSON con:
  - Todas las estadísticas
  - Datos por club
  - Fecha del reporte
  - Filtros aplicados

---

## 🔍 Sistema de Filtros Avanzados

Haz clic en **"Filtros"** (parte superior) para acceder a:

### Filtros Disponibles:

1. **Por Club**
   - Selecciona un club específico
   - O mantén "Todos los clubes" para ver todo

2. **Por Fecha (Desde)**
   - Filtra transacciones desde una fecha específica
   - Útil para ver periodos personalizados

3. **Por Fecha (Hasta)**
   - Filtra transacciones hasta una fecha específica
   - Combínalo con "Desde" para rangos exactos

4. **Por Mes**
   - Selector rápido de mes completo
   - Ideal para reportes mensuales

### Cómo Usar los Filtros:

1. Haz clic en **"Filtros"** para expandir
2. Selecciona los filtros que necesites
3. Los datos se actualizan automáticamente
4. Haz clic en **"Limpiar filtros"** para resetear

---

## 💡 Casos de Uso Prácticos

### 📅 Ver Facturación de un Mes Específico:
1. Abre "Filtros"
2. Selecciona el mes (ej: "2024-02")
3. Ve a "Dashboard" para ver las estadísticas
4. Ve a "Reportes" para exportar

### 🏢 Analizar un Club Específico:
1. Abre "Filtros"
2. Selecciona el club
3. Ve a "Dashboard" para métricas
4. Ve a "Morosos" para ver deudores de ese club

### 📊 Reporte Trimestral:
1. Abre "Filtros"
2. Configura "Desde": 01/01/2024
3. Configura "Hasta": 31/03/2024
4. Ve a "Reportes" y exporta

### 🚨 Identificar Problemas de Morosidad:
1. Ve a la pestaña "Morosos"
2. Ordena por deuda (ya ordenado automáticamente)
3. Ve qué club tiene más morosos
4. Toma acciones específicas

---

## 🎨 Interfaz Visual

### Colores y Significados:

- **Azul**: Información general, clubes
- **Verde**: Datos positivos (ingresos, alumnos al día, créditos)
- **Rojo**: Alertas (morosos, deudas, egresos)
- **Gris**: Controles y navegación

### Navegación:

La barra superior tiene 4 pestañas principales:
- 📊 **Dashboard**: Vista general
- 👥 **Clubes**: Gestión de clubes
- ⚠️ **Morosos**: Lista de deudores
- 📥 **Reportes**: Exportación de datos

---

## 🔒 Seguridad

### Contraseña de Administrador:
- **Contraseña actual**: `842114`
- Solo personas autorizadas deben conocer esta contraseña
- Se solicita cada vez que abres el módulo

### Recomendaciones:
- No compartas la contraseña con personas no autorizadas
- Cierra el módulo al terminar
- La contraseña está codificada en el componente (no en base de datos)

### Para Cambiar la Contraseña:
Edita el archivo: `src/components/AdminPanel.tsx`
Busca la línea:
```typescript
if (password === '842114') {
```
Y cambia `'842114'` por tu nueva contraseña.

---

## 📈 Métricas Calculadas

### Cómo se Calculan:

**Deuda Total:**
```
Suma de todos los saldos negativos de alumnos
```

**Facturación:**
```
Suma de todas las transacciones tipo "payment"
```

**Ingresos Netos:**
```
Total de pagos - Total de cargos
```

**Tasa de Morosidad:**
```
(Alumnos morosos / Total alumnos) × 100
```

---

## 🎯 Tips de Uso

### 1. Revisión Diaria
- Abre el Dashboard
- Revisa las métricas principales
- Identifica anomalías

### 2. Análisis Mensual
- Usa el filtro de mes
- Exporta el reporte
- Compara con meses anteriores

### 3. Seguimiento de Morosos
- Revisa la pestaña "Morosos" semanalmente
- Ordena por deuda
- Contacta a los primeros de la lista

### 4. Comparación Entre Clubes
- Ve a "Clubes"
- Compara métricas
- Identifica el club con mejor rendimiento

---

## 🚀 Funcionalidades Futuras (Próximamente)

- Gráficos interactivos con más detalle
- Exportación a PDF y Excel
- Envío automático de recordatorios a morosos
- Comparación histórica mes a mes
- Alertas automáticas de morosidad
- Dashboard personalizable

---

## 🐛 Solución de Problemas

### No veo el botón "Modo Administrador"
- Recarga la página (F5)
- Verifica que estés en la pantalla de selección de clubes

### "Contraseña incorrecta"
- Verifica que ingresaste: `842114`
- No agregues espacios antes o después
- Si olvidaste la contraseña, revisa este documento

### Los datos no cargan
- Verifica tu conexión a internet
- Asegúrate de tener permisos en Firebase
- Abre la consola (F12) y busca errores

### Los filtros no funcionan
- Haz clic en "Limpiar filtros" primero
- Recarga la página
- Intenta con un solo filtro a la vez

---

## 📞 Soporte

Para cualquier problema con el módulo de administrador:

1. Verifica esta documentación primero
2. Revisa la consola del navegador (F12)
3. Documenta el error que ves
4. Contacta al desarrollador con:
   - Descripción del problema
   - Pasos para reproducirlo
   - Captura de pantalla si es posible

---

## 🎉 Resumen Rápido

1. **Acceso**: Botón "Modo Administrador" → Contraseña: `842114`
2. **Dashboard**: Vista general de todas las métricas
3. **Clubes**: Detalles por club
4. **Morosos**: Lista de deudores
5. **Reportes**: Exportación de datos
6. **Filtros**: Por club, fecha o mes
7. **Exportar**: Descarga reportes en JSON

---

¡Disfruta del poder total de gestión con el Módulo de Administrador! 🚀
