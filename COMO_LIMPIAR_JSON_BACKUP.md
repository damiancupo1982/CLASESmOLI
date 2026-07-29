# 🧹 Cómo Limpiar un Archivo JSON de Backup

## 📋 Cuándo Usar Esta Guía

Usa esta guía si:
- Tu backup tiene datos de otro sistema mezclado
- Quieres asegurarte de que solo se restauren datos del sistema de pádel
- Prefieres limpiar el archivo manualmente antes de restaurar

**NOTA**: Con el fix aplicado, el sistema automáticamente omite datos inválidos. Esta guía es OPCIONAL.

---

## 🔍 Identificar Datos Problemáticos

### 1. Abre el Archivo JSON

Abre tu archivo de backup (`.json`) con un editor de texto como:
- Notepad (Windows)
- TextEdit (Mac)
- VS Code, Sublime Text, etc.

### 2. Busca la Sección "receipts"

El JSON tiene esta estructura:
```json
{
  "version": "1.0",
  "exportDate": "2026-02-11...",
  "clubId": "default",
  "clubName": "Mi Club",
  "students": [...],
  "classes": [...],
  "transactions": [...],
  "receipts": [    // ← BUSCA ESTA SECCIÓN
    ...
  ]
}
```

### 3. Identifica Recibos Inválidos

Los recibos del sistema de pádel tienen estos campos:
```json
{
  "id": "rcpt_sel_...",
  "studentId": "...",        // ✅ Campo correcto
  "studentName": "...",      // ✅ Campo correcto
  "date": "...",
  "transactions": [...],     // ✅ Campo correcto
  "totalAmount": 1000,
  "paidAmount": 1000
}
```

Los recibos de OTROS sistemas tienen campos diferentes:
```json
{
  "id": 1,
  "tenant": "Juan Pérez",           // ❌ NO es del sistema de pádel
  "property": "Depto A-101",        // ❌ NO es del sistema de pádel
  "building": "Edificio Central",   // ❌ NO es del sistema de pádel
  "rent": 25000,                    // ❌ NO es del sistema de pádel
  "expenses": 3000                  // ❌ NO es del sistema de pádel
}
```

---

## ✂️ Cómo Limpiar el Archivo

### Opción 1: Eliminar Recibo Completo (RECOMENDADO)

1. **Encuentra el recibo inválido** (el que tiene `tenant`, `property`, etc.)

2. **Selecciona el recibo completo**, desde el `{` de apertura hasta el `}` de cierre, incluyendo la coma si hay otra entrada después:

```json
"receipts": [
  // ← INICIO: Selecciona desde aquí
  {
    "id": 1,
    "tenant": "Juan Pérez",
    "property": "Depto A-101",
    ...
  },  // ← FIN: Hasta aquí (incluye la coma)
  // ← FIN ALTERNATIVO: Si no hay más recibos después, no incluyas la coma
  {
    "id": "rcpt_sel_...",
    // Este es válido, NO lo borres
  }
]
```

3. **Elimina la selección** (Delete o Backspace)

4. **Verifica la sintaxis**:
   - Si quedó una coma extra antes del `]`, elimínala
   - Asegúrate de que los `{` y `}` estén balanceados

### Opción 2: Vaciar la Sección de Recibos

Si prefieres eliminar TODOS los recibos (válidos e inválidos):

**Antes:**
```json
"receipts": [
  { ... },
  { ... }
],
```

**Después:**
```json
"receipts": [],
```

### Opción 3: Dejar que el Sistema lo Haga Automáticamente

Con el fix aplicado, puedes simplemente:
1. Restaurar el backup tal cual está
2. El sistema omitirá automáticamente los datos inválidos
3. Recibirás un mensaje informando cuántos registros se omitieron

---

## 📝 Ejemplo Completo: Antes y Después

### ANTES (Con datos mezclados):

```json
{
  "version": "1.0",
  "students": [
    {
      "id": "1770779500290",
      "name": "GGGGG",
      ...
    }
  ],
  "classes": [...],
  "transactions": [...],
  "receipts": [
    {
      "id": 1,
      "receiptNumber": "REC-2025-001",
      "tenant": "Juan Pérez",
      "property": "Departamento A-101",
      "building": "Edificio Central",
      "month": "Enero",
      "year": 2025,
      "rent": 25000,
      "expenses": 3000
    },
    {
      "id": "rcpt_sel_1770779500290_1770779536715",
      "studentId": "1770779500290",
      "studentName": "GGGGG",
      "date": "2026-02-11T03:12:16.715Z",
      "transactions": [...],
      "totalAmount": 1000,
      "paidAmount": 1000
    }
  ]
}
```

### DESPUÉS (Solo datos del sistema de pádel):

```json
{
  "version": "1.0",
  "students": [
    {
      "id": "1770779500290",
      "name": "GGGGG",
      ...
    }
  ],
  "classes": [...],
  "transactions": [...],
  "receipts": [
    {
      "id": "rcpt_sel_1770779500290_1770779536715",
      "studentId": "1770779500290",
      "studentName": "GGGGG",
      "date": "2026-02-11T03:12:16.715Z",
      "transactions": [...],
      "totalAmount": 1000,
      "paidAmount": 1000
    }
  ]
}
```

---

## ⚠️ Errores Comunes al Editar JSON

### 1. Coma Extra al Final
❌ **Incorrecto:**
```json
"receipts": [
  { "id": "...", ... },   // ← Coma extra antes del ]
]
```

✅ **Correcto:**
```json
"receipts": [
  { "id": "...", ... }   // ← Sin coma antes del ]
]
```

### 2. Falta de Coma entre Elementos
❌ **Incorrecto:**
```json
"receipts": [
  { "id": "...", ... }   // ← Falta coma
  { "id": "...", ... }
]
```

✅ **Correcto:**
```json
"receipts": [
  { "id": "...", ... },   // ← Coma necesaria
  { "id": "...", ... }
]
```

### 3. Llaves Desbalanceadas
Asegúrate de que cada `{` tenga su correspondiente `}` y cada `[` tenga su `]`.

---

## 🔍 Validar el JSON Antes de Restaurar

### Opción 1: Validador Online
1. Ve a: https://jsonlint.com/
2. Pega tu JSON
3. Haz clic en "Validate JSON"
4. Si hay errores, te dirá dónde están

### Opción 2: Editor de Código
Editores como VS Code automáticamente resaltan errores de sintaxis JSON.

---

## 🚀 Después de Limpiar

1. **Guarda el archivo** (Ctrl+S o Cmd+S)
2. **Verifica que tenga extensión `.json`**
3. **Ve a la aplicación**
4. **Settings → Restaurar Backup**
5. **Selecciona el archivo limpio**
6. **Restaura**

---

## 💡 Consejos

### 1. Haz una Copia de Respaldo
Antes de editar, haz una copia del archivo original por si acaso:
- `backup-original.json` (original)
- `backup-limpio.json` (editado)

### 2. Usa un Editor con Sintaxis JSON
Editores como VS Code, Sublime Text o Notepad++ resaltan la sintaxis y facilitan la edición.

### 3. No Es Necesario Si Usas el Sistema Actualizado
El sistema ahora automáticamente omite datos inválidos. Solo limpia manualmente si prefieres tener un archivo 100% limpio.

### 4. Exporta un Backup Nuevo Como Referencia
Exporta un backup del sistema actual para ver cómo debe ser la estructura correcta.

---

## 📊 Comparación: Manual vs Automático

### Limpieza Manual:
- ✅ Archivo queda 100% limpio
- ✅ Control total sobre qué se elimina
- ✅ Útil para aprender la estructura
- ❌ Requiere tiempo y cuidado
- ❌ Riesgo de errores de sintaxis

### Omisión Automática (Sistema Actualizado):
- ✅ Rápido y sin esfuerzo
- ✅ Sin riesgo de errores de sintaxis
- ✅ Informes claros sobre qué se omitió
- ✅ Restaura inmediatamente los datos válidos
- ❌ El archivo original no se modifica

**RECOMENDACIÓN**: Usa la omisión automática a menos que tengas una razón específica para limpiar manualmente.

---

## 🆘 Si Algo Sale Mal

### Error: "Formato de backup inválido"
- Verifica la sintaxis JSON en jsonlint.com
- Asegúrate de que estén las secciones: `version`, `students`, `classes`
- Revisa que no hayas eliminado llaves importantes

### Error: "No se restauró ningún dato"
- Verifica que las secciones no estén vacías
- Confirma que los datos tengan los campos correctos
- Revisa la consola (F12) para ver qué se omitió

### El JSON No Es Válido Después de Editar
- Revisa comas extra o faltantes
- Verifica llaves y corchetes balanceados
- Usa un validador JSON online
- Si no puedes arreglarlo, usa el archivo original y deja que el sistema omita automáticamente

---

## ✅ Checklist de Limpieza

- [ ] Hice copia del archivo original
- [ ] Abrí el archivo con un editor de texto
- [ ] Identifiqué los recibos con campos como `tenant`, `property`, `rent`
- [ ] Eliminé los recibos inválidos completos (con cuidado con las comas)
- [ ] Validé el JSON en jsonlint.com o editor
- [ ] Guardé el archivo
- [ ] Probé restaurar el backup limpio

---

## 🎓 Resumen

1. **Identifica** los datos inválidos (busca campos como `tenant`, `property`)
2. **Elimina** el recibo completo (desde `{` hasta `}`, incluyendo coma si hay)
3. **Valida** la sintaxis JSON
4. **Guarda** el archivo
5. **Restaura** el backup

O simplemente:

**Deja que el sistema lo haga automáticamente**. El fix implementado omite datos inválidos y te informa sobre ello.

---

**Fecha**: 2024-02-11
**Versión**: 1.0

Este documento es complementario a `SOLUCION_BACKUP_JSON_MEZCLADO.md`
