# 💾 Guía Rápida: Backup y Restauración

## 🚀 Inicio Rápido

### ¿Dónde está?
**Settings → Configuración** (último ícono en la barra de navegación)

### ¿Qué hace?
- **Exporta** todos tus datos a un archivo JSON
- **Restaura** datos desde un backup anterior
- **Migra** información entre sistemas

---

## 📥 Cómo Hacer un Backup

### Pasos:
1. Ingresa a tu club
2. Ve a **Settings** (ícono de engranaje)
3. Haz clic en **"Descargar Backup"**
4. El archivo se descarga automáticamente

### Archivo descargado:
```
backup-NombreDelClub-2024-02-11.json
```

### ¿Qué incluye?
✅ Todos los alumnos
✅ Todas las clases programadas
✅ Todas las transacciones (pagos y cargos)
✅ Todos los recibos generados

---

## 📤 Cómo Restaurar un Backup

### Pasos:
1. Ingresa al club donde quieres restaurar
2. Ve a **Settings**
3. Haz clic en **"Seleccionar Archivo"**
4. Elige el archivo de backup (.json)
5. Espera a que termine (verás un mensaje de éxito)
6. La página se recargará automáticamente

### ⚠️ Importante:
- Los datos se **agregan** al club actual (no se borran los existentes)
- Si hay IDs duplicados, se sobrescriben
- Asegúrate de seleccionar el club correcto antes de restaurar

---

## 🔄 Migración Entre Sistemas

### Escenario: Tienes datos en el sistema anterior (Firebase) y quieres pasarlos al nuevo

### Paso 1: En el Sistema Anterior
1. Implementa la función de backup (usa el prompt en `BACKUP_RESTORE_PROMPT.md`)
2. Exporta el backup
3. Guarda el archivo JSON

### Paso 2: En el Sistema Nuevo (Este)
1. Crea un nuevo club o usa uno existente
2. Ve a Settings
3. Restaura el backup
4. ¡Listo! Todos tus datos migrados

---

## 📊 Formato del Backup

### Estructura del Archivo:
```json
{
  "version": "1.0",
  "exportDate": "2024-02-11T10:30:00.000Z",
  "clubId": "abc123",
  "clubName": "Mi Club",
  "students": [...],
  "classes": [...],
  "transactions": [...],
  "receipts": [...],
  "metadata": {
    "totalStudents": 50,
    "totalClasses": 120,
    "totalTransactions": 200,
    "totalReceipts": 180
  }
}
```

### Compatible con:
✅ Este sistema (Firebase actual)
✅ Sistema anterior (Firebase)
✅ Cualquier sistema que use esta estructura

---

## 🛡️ Seguridad y Buenas Prácticas

### Guarda tus Backups:
1. **Frecuencia recomendada**: Semanal o mensual
2. **Dónde guardar**:
   - Google Drive
   - Dropbox
   - Disco externo
   - Computadora local
3. **Nombrado**: Usa nombres descriptivos con fechas

### Ejemplo de organización:
```
Backups/
  ├── 2024-01-Enero/
  │   ├── backup-MiClub-2024-01-07.json
  │   ├── backup-MiClub-2024-01-14.json
  │   ├── backup-MiClub-2024-01-21.json
  │   └── backup-MiClub-2024-01-28.json
  └── 2024-02-Febrero/
      ├── backup-MiClub-2024-02-04.json
      └── backup-MiClub-2024-02-11.json
```

---

## 🎯 Casos de Uso

### 1. Backup de Seguridad Regular
- Haz un backup cada semana
- Guárdalo en la nube
- Si algo sale mal, puedes restaurar

### 2. Migración de Sistema
- Exporta del sistema viejo
- Importa en el sistema nuevo
- Verifica que todo esté correcto

### 3. Duplicar Información
- Exporta de un club
- Crea un nuevo club
- Restaura el backup en el nuevo club

### 4. Recuperación de Datos
- Si borraste algo por error
- Restaura un backup anterior
- Recupera la información perdida

### 5. Pruebas sin Riesgo
- Exporta tus datos actuales
- Prueba nuevas funcionalidades
- Si algo falla, restaura el backup

---

## ⚡ Consejos Rápidos

### ✅ DO (Hacer):
- Hacer backups regularmente
- Guardar en múltiples lugares
- Verificar el backup después de exportar
- Probar la restauración en un club de prueba primero

### ❌ DON'T (No Hacer):
- Esperar a que algo falle para hacer backup
- Guardar solo en un lugar
- Borrar backups antiguos inmediatamente
- Restaurar sin verificar el archivo primero

---

## 🐛 Solución de Problemas Rápidos

### "Error al exportar el backup"
- Verifica tu conexión a internet
- Refresca la página e intenta de nuevo
- Revisa la consola del navegador (F12)

### "Error al restaurar el backup" o "indexOf is not a function"
- Verifica que el archivo sea .json válido
- Abre el archivo y verifica que tenga contenido
- Asegúrate de que no esté corrupto
- Este error está SOLUCIONADO en la versión actual del código

### "Los datos no aparecen después de restaurar"
- Recarga la página manualmente (F5)
- Verifica que estés en el club correcto
- Revisa la consola para errores

### "El archivo es muy grande"
- Normal si tienes muchos datos
- La descarga puede tardar unos segundos
- La restauración puede tardar 1-2 minutos

---

## 📞 Información Técnica

### Límites:
- **Tamaño máximo**: Sin límite definido (depende del navegador)
- **Batch size**: 500 operaciones por lote
- **Tiempo de restauración**: Depende de la cantidad de datos

### Compatibilidad:
- **Navegadores**: Chrome, Firefox, Safari, Edge
- **Formato**: JSON (JavaScript Object Notation)
- **Versión actual**: 1.0

### Datos incluidos por tipo:

**Students:**
- Información personal (nombre, DNI, teléfono, dirección)
- Condición (Titular, Familiar, Invitado)
- Balance actual
- Fechas de creación y actualización

**Classes:**
- Detalles de la clase (título, fecha, hora, duración)
- Estudiantes inscritos
- Profesor, precio, tipo, cancha
- Estado (programada, completada, cancelada)

**Transactions:**
- Movimientos de dinero (pagos y cargos)
- Alumno relacionado
- Método de pago
- Descripción y monto

**Receipts:**
- Recibos generados
- Items incluidos
- Totales y métodos de pago

---

## 🎓 Ejemplos Prácticos

### Ejemplo 1: Backup Mensual
```
1. Día 1 del mes
2. Ingresa al club
3. Settings → Descargar Backup
4. Guarda en: "Backups/2024-02-Febrero/"
5. Nombre: "backup-MiClub-2024-02-01.json"
```

### Ejemplo 2: Migrar de Sistema Viejo
```
Sistema Viejo:
1. Settings → Descargar Backup
2. Guardar: "backup-club-antiguo.json"

Sistema Nuevo:
1. Crear nuevo club o usar existente
2. Settings → Seleccionar Archivo
3. Elegir: "backup-club-antiguo.json"
4. Esperar restauración
5. ¡Datos migrados!
```

### Ejemplo 3: Recuperar Datos Borrados
```
Problema: Borraste un alumno por error

Solución:
1. Busca el último backup (ej: hace 2 días)
2. Settings → Seleccionar Archivo
3. Elige el backup anterior
4. Restaura
5. El alumno vuelve a aparecer
```

---

## 📚 Recursos Adicionales

### Documentación Relacionada:
- `BACKUP_RESTORE_PROMPT.md` - Prompt para sistema anterior
- `README.md` - Documentación general del sistema
- `ADMIN_MODULE.md` - Módulo de administrador

### Soporte:
Si tienes problemas:
1. Revisa esta guía
2. Consulta la sección de solución de problemas
3. Revisa los logs en la consola (F12)
4. Documenta el error y contacta soporte

---

## ✅ Checklist de Backup

Copia esto para tu rutina mensual:

```
□ Hacer backup del club principal
□ Verificar que el archivo se descargó
□ Abrir el JSON y verificar contenido
□ Guardar en carpeta del mes actual
□ Subir a Google Drive/Dropbox
□ Mantener últimos 3 meses de backups
□ Borrar backups de hace más de 6 meses (opcional)
```

---

## 🎉 ¡Todo Listo!

Ahora tienes:
- ✅ Sistema de backup automático
- ✅ Capacidad de restauración
- ✅ Migración entre sistemas
- ✅ Seguridad de tus datos

**Recuerda**: Un backup al mes mantiene tus datos a salvo. ¡No esperes a perder información para hacer tu primer backup!

---

**Última actualización**: 2024-02-11
**Versión del sistema**: 1.0
