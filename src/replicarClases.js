// Suponemos que esta función te da las clases del mes anterior
function obtenerClasesDelMesAnterior() {
  return [
    { fecha: '2026-01-02T10:00:00', asistencia: false, tipo: 'Grupal (1/2)' },
    { fecha: '2026-01-09T10:00:00', asistencia: false, tipo: 'Grupal (1/2)' },
    { fecha: '2026-01-16T10:00:00', asistencia: false, tipo: 'Grupal (1/2)' },
    { fecha: '2026-01-23T10:00:00', asistencia: true, tipo: 'Grupal (1/2)' } // esta no se replica
  ];
}

// Suponemos que esta función verifica si ya existe una clase en esa fecha
function existeClaseEnFecha(fecha) {
  // Reemplazar con tu propia lógica real si tenés lista de clases existentes
  return false;
}

// Crear clase (acá podés conectar con tu backend o base de datos)
function crearClase(fecha, tipo) {
  console.log(`Clase creada: ${fecha.toISOString()} - ${tipo}`);
}

// Devuelve todas las fechas del mes actual con el mismo día de la semana
function obtenerFechasDelMesConDiaSemana(diaSemana, mes, anio) {
  const fechas = [];
  const fecha = new Date(anio, mes, 1);
  while (fecha.getMonth() === mes) {
    if (fecha.getDay() === diaSemana) {
      fechas.push(new Date(fecha));
    }
    fecha.setDate(fecha.getDate() + 1);
  }
  return fechas;
}

// Función principal de replicación
function replicarClasesPorDiaSemana() {
  const clasesAnteriores = obtenerClasesDelMesAnterior();
  const hoy = new Date();
  const mesActual = hoy.getMonth();
  const anioActual = hoy.getFullYear();

  for (const clase of clasesAnteriores) {
    if (clase.asistencia) continue; // saltar clases con asistencia

    const fechaClase = new Date(clase.fecha);
    const diaSemana = fechaClase.getDay();
    const horaClase = fechaClase.getHours();
    const minutosClase = fechaClase.getMinutes();

    const fechasRepetidas = obtenerFechasDelMesConDiaSemana(diaSemana, mesActual, anioActual);

    for (const fechaDestino of fechasRepetidas) {
      fechaDestino.setHours(horaClase, minutosClase, 0, 0);

      if (existeClaseEnFecha(fechaDestino)) continue; // evitar duplicados

      crearClase(fechaDestino, clase.tipo);
    }
  }
}

// Ejecutar la lógica
replicarClasesPorDiaSemana();
