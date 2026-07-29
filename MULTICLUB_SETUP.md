# Sistema Multi-Club

El sistema ahora soporta múltiples clubes con autenticación por contraseña individual para cada uno.

## Características

### Pantalla de Inicio
Al abrir la aplicación, verás:
- Lista de todos los clubes creados
- Botón para crear un nuevo club
- Cada club muestra su nombre y descripción (opcional)

### Crear Nuevo Club
1. Haz clic en "Crear Nuevo Club"
2. Completa el formulario:
   - **Nombre del Club**: Nombre identificador (ej: "Club Padel Central")
   - **Descripción** (opcional): Información adicional (ej: "Sede Norte")
   - **Contraseña**: Mínimo 4 caracteres
   - **Confirmar Contraseña**: Debe coincidir con la anterior

### Acceder a un Club
1. Selecciona el club de la lista
2. Ingresa la contraseña del club
3. El sistema te redirigirá al dashboard del club

### Dentro de un Club
- Todos los datos están aislados por club
- Cada club tiene sus propios:
  - Alumnos
  - Clases
  - Transacciones
  - Recibos
  - Pagos
  - Facturas

- Verás el nombre del club en la barra superior
- Botón "Salir" para volver a la selección de clubes

## Estructura de Datos en Firebase

```
clubs/
  {clubId}/
    name: "Club Padel Central"
    password: "1234"
    description: "Sede Norte"
    createdAt: timestamp

    students/
      {studentId}/...

    classes/
      {classId}/...

    transactions/
      {transactionId}/...

    receipts/
      {receiptId}/...

    payments/
      {paymentId}/...

    invoices/
      {invoiceId}/...

    users/
      default/...
```

## Seguridad

- Cada club requiere contraseña para acceder
- Las contraseñas se almacenan en Firebase
- Los datos de cada club están completamente aislados
- No se puede acceder a los datos de un club sin la contraseña correcta

## Administración Multi-Club

### Ventajas
1. **Gestión Centralizada**: Administra múltiples clubes desde una sola aplicación
2. **Aislamiento de Datos**: Los datos de cada club están completamente separados
3. **Fácil Navegación**: Cambia entre clubes con solo cerrar sesión y seleccionar otro
4. **Escalabilidad**: Agrega tantos clubes como necesites sin límite

### Casos de Uso
- Administrar múltiples sedes de tu academia
- Gestionar clubes diferentes con equipos separados
- Mantener datos de prueba y producción separados
- Ofrecer el sistema a diferentes clientes manteniendo sus datos privados

## Sesión Persistente

- La última sesión del club se guarda en el navegador
- Al recargar la página, automáticamente vuelves al club seleccionado
- Para cambiar de club, usa el botón "Salir"

## Notas Importantes

1. **Contraseñas**: Guarda las contraseñas de forma segura. No hay recuperación automática
2. **Privacidad**: Cada club solo ve sus propios datos
3. **Rendimiento**: Los datos se cargan solo del club actual, mejorando la velocidad
4. **Firebase**: Asegúrate de configurar las reglas de seguridad apropiadas en Firebase Console

## Mejoras Futuras Posibles

- Sistema de recuperación de contraseñas
- Roles y permisos por club
- Compartir usuarios entre clubes
- Dashboard de administración global
- Estadísticas consolidadas de todos los clubes
- Exportación masiva de datos
