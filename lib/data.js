// ===== RUTAS DE RECOLECCIÓN (basado en mapa oficial de Neiva) =====
// Zonas según mapa: 
// 01 Lunes-Miercoles-Viernes (verde claro / norte aeropuerto)
// 02 Martes-Jueves-Sabado (rosado / oriente)
// 03 Lunes-Miercoles-Viernes (azul petroleo / centro)
// 04 Martes-Jueves-Sabado (verde oscuro / suroccidente)
// 05 Lunes a Sabado (turquesa / zona industrial sur)

export const ZONAS_RECOLECCION = {
  '01': {
    nombre: 'Zona Norte - Aeropuerto',
    color: '#c8e6c9',
    dias: 'Lunes, Miércoles y Viernes',
    horario: '7AM - 1PM',
    comunas: ['1', '2'],
  },
  '02': {
    nombre: 'Zona Oriente',
    color: '#ef9a9a',
    dias: 'Martes, Jueves y Sábado',
    horario: '7AM - 1PM',
    comunas: ['5', '7', '10'],
  },
  '03': {
    nombre: 'Zona Centro',
    color: '#80cbc4',
    dias: 'Lunes, Miércoles y Viernes',
    horario: '1PM - 7PM',
    comunas: ['3', '4'],
  },
  '04': {
    nombre: 'Zona Sur',
    color: '#a5d6a7',
    dias: 'Martes, Jueves y Sábado',
    horario: '1PM - 7PM',
    comunas: ['6', '8'],
  },
  '05': {
    nombre: 'Zona Industrial Sur / Caguán',
    color: '#b2dfdb',
    dias: 'Lunes a Sábado',
    horario: '7AM - 3PM',
    comunas: ['9'],
  },
};

export const HORARIOS_POR_COMUNA = {
  '1': { zona: '01', dias: 'Lunes, Miércoles y Viernes', horario: '7AM - 1PM', nombreZona: 'Norte - Aeropuerto' },
  '2': { zona: '01', dias: 'Lunes, Miércoles y Viernes', horario: '7AM - 1PM', nombreZona: 'Norte - Aeropuerto' },
  '3': { zona: '03', dias: 'Lunes, Miércoles y Viernes', horario: '1PM - 7PM', nombreZona: 'Centro Entre Ríos' },
  '4': { zona: '03', dias: 'Lunes, Miércoles y Viernes', horario: '1PM - 7PM', nombreZona: 'Centro' },
  '5': { zona: '02', dias: 'Martes, Jueves y Sábado', horario: '7AM - 1PM', nombreZona: 'Oriental' },
  '6': { zona: '04', dias: 'Martes, Jueves y Sábado', horario: '1PM - 7PM', nombreZona: 'Sur' },
  '7': { zona: '02', dias: 'Martes, Jueves y Sábado', horario: '7AM - 1PM', nombreZona: 'Centro Oriente' },
  '8': { zona: '04', dias: 'Martes, Jueves y Sábado', horario: '1PM - 7PM', nombreZona: 'Sur Oriental' },
  '9': { zona: '05', dias: 'Lunes a Sábado', horario: '7AM - 3PM', nombreZona: 'Norte' },
  '10': { zona: '02', dias: 'Martes, Jueves y Sábado', horario: '7AM - 1PM', nombreZona: 'Oriente Alto' },
};

export const BARRIOS_POR_COMUNA = {
  '1': ['Santa Inés', 'Cándido Leguízamo', 'Las Mercedes', 'Las Ferias', 'Chícalá', 'Minuto de Dios Norte', 'La Inmaculada', 'Villa del Río', 'Rodrigo Lara Bonilla', 'Conjunto La Magdalena', 'Acrópolis', 'Los Elisios', 'California', 'Media Luna', 'San Nicolás', 'Los Andaquíes', 'Los Dujos', 'San Silvestre', 'Carlos Pizarro', 'El Triángulo', 'José Martí', 'Pigoanza', 'Madrigal', 'Conarvar', 'Colmenar', 'Villa Magdalena Norte', 'La Fortaleza', 'Bajo Chicalá', 'Mansiones del Norte', 'Ciudadela Carlos Pizarro', 'Ciudadela Comfamiliar', 'Torres de la Camila', 'Portal de San Felipe', 'Balcones de la Riviera', 'Riviera I', 'Riviera II', 'Portales de Varanta', 'Minuto de Dios', 'La Vorágine'],
  '2': ['Aeropuerto', 'Alvaro Sánchez Silva', 'Santa Lucía', 'Santa Clara', 'Los Cámbaros', 'Los Molinos', 'Las Granjas', 'Bosques de Tamarindo', 'Santa Mónica', 'El Prado', 'Los Pinos', 'Alamos Norte', 'El Cortijo', 'Municipal', 'Villa Cecilia', 'Los Andes', 'Villa Milena', 'Gualanday', 'Villa Aurora', 'Villa Urbe', 'Versalles', 'Santa Ana', 'Conjunto Camino Real', 'Conjunto Málaga', 'Portal de la Calleja', 'El Rosal', 'Las Villas', 'Villa del Prado', 'Villa Flor', 'Villa Esmeralda', 'Torres de Varegal', 'Cataluña', 'San Diego'],
  '3': ['El Lago', 'Caracolí', 'San Vicente de Paúl', 'La Cordialidad', 'Guillermo Plazas Alcid', 'Reinaldo Matiz Trujillo', 'Rojas Trujillo', 'Las Delicias', 'Sevilla', 'Las Ceibas', 'Quirinal', 'José Eustasio Rivera', 'Tenerife', 'Campo Núñez', 'La Torna', 'Chapinero', 'Santa Librada', 'Los Samanes', 'Villa Patricia', 'La Estrella', 'Las Ceibitas', 'Conjunto Brisas del Magdalena', 'Los Profesionales', 'Alcalá'],
  '4': ['Bonilla', 'Los Martires', 'El Centro', 'San Pedro', 'Los Almendros', 'El Estadio', 'Altico', 'Modelo', 'San José', 'Diego de Ospina', 'La Unión'],
  '5': ['Primero de Mayo', 'La Libertad', 'Loma de La Cruz', 'La Colina', 'Kennedy', 'Monserrate', 'Siete de Agosto', 'San Antonio', 'La Independencia', 'El Jardín', 'Buganviles', 'La Orquídea', 'Los Guaduales', 'Jordán', 'Faro', 'Veinte de Julio', 'Rosa', 'Independencia Baja', 'El Vergel', 'Brisas del Avichente', 'Los Laureles', 'Sector La Colina', 'Alto Llano', 'Villa Café', 'Altos de la Ferreira', 'Villa Regina', 'Alta Vista', 'Conjunto Altos de Tivoli', 'Conjunto Aragonés'],
  '6': ['Minuto de Dios', 'Miramar', 'Andalucía', 'Alto del Limonar', 'Emayá', 'Santa Isabel', 'La Esperanza', 'Bogotá', 'Buenos Aires', 'Sinaí', 'José Antonio Galán', 'Los Nazarenos', 'Pozo Azul', 'Loma Linda', 'Arismendi Mora', 'Timanco', 'Bella Vista', 'El Limonar', 'Villa Inés', 'Los Caobos', 'Manzanares', 'San Francisco de Asís', 'Tuquíla', 'Las Lajas', 'El Bosque', 'Sector Santa Isabel', 'Sector Galán', 'Sector Bogotá', 'Canaíma', 'Conjunto Multifamiliar Los Arrayanes'],
  '7': ['Las Brisas', 'Casa Loma', 'La Floresta', 'Ipanema', 'Casa de Campo', 'Altamíra', 'Prado Alto', 'Casa Blanca', 'La Gaitana', 'Calixto Leyva', 'Buena Vista', 'Jorge Eliécer Gaitán', 'Obrero', 'Ventilador', 'San Martín', 'La Juventud', 'Conjunto Punta del Este', 'Santa Faula', 'Altos de Manzanillo', 'Gaitana Dos', 'Conjunto Portal del Campo', 'Paseo La Castellana', 'Conjunto Torres de Bizancio', 'Antigua', 'Santorini', 'Caminos de Oriente', 'Altos de la Pradera'],
  '8': ['La Isla', 'Las Américas', 'Alfonso López', 'Las Acacias', 'Nueva Granada', 'Los Parques', 'Guillermo Liévano', 'La Florida', 'Surorientales', 'Los Alpes', 'Rafael Azuero', 'La Paz', 'Simón Bolívar', 'Los Arrayanes', 'Rafael Uribe Uribe', 'Panorama', 'San Carlos', 'Villa Amarilla', 'La Cristalina', 'Bajo Pedregal', 'El Peñón', 'El Caracol', 'El Porvenir', 'La Esperanza', 'Las Rocas', 'Divino Niño', 'Siete de Agosto', 'Peñón Redondo', 'Bajo Américas', 'El Dorado', 'La Cabuya', 'Buenos Aires', 'La Chamiza', 'La Provincia'],
  '9': ['Trínidad', 'Alberto Galindo', 'José María Carbonell', 'Luis Ignacio Andrade', 'Eduardo Santos', 'Darío Echandía', 'Villa Magdalena', 'La Riviera', 'Luis Eduardo Vanegas', 'Luis Carlos Galán', 'Santa Rosa', 'Carbonell II', 'Los Libertadores', 'Minuto de Dios VI etapa', 'Vicente Araújo', 'Villa Nazaret', 'El Progreso', 'Virgilio Barco', 'Villa Marcela', 'Villa Esmeralda', 'Calamari', 'Villa Colombia', 'Alvaro Leyva Liévano', 'Sector Galindo'],
  '10': ['La Rioja', 'Once de Noviembre', 'Misael Pastrana Borrero', 'Los Comuneros', 'Triunfo', 'Las Camelias', 'Palmas I', 'Palmas II', 'Palmas III', 'El Pedregal', 'Santander', 'Enrique Olaya Herrera', 'Alberto Yepes', 'Katakandrú', 'Sector Barreiro', 'Nuevo Horizonte', 'Pablo Sexto', 'Victor Félix Díaz', 'Villa Nadia', 'San Bernardo del Viento', 'Oro Negro', 'La Victoria', 'Palmitas II', 'La Pradera', 'Granja San Bernardo', 'Villa Aranzazu', 'Folicarpo', 'Calle Real', 'El Paraíso', 'Los Machines', 'Los Rosales', 'Los Colores', 'El Oasis', 'Antonio Nariño'],
};

// Mapeo inverso barrio -> comuna
export const BARRIO_A_COMUNA = {};
Object.keys(BARRIOS_POR_COMUNA).forEach(comuna => {
  BARRIOS_POR_COMUNA[comuna].forEach(barrio => {
    BARRIO_A_COMUNA[barrio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')] = comuna;
  });
});

export function getBarrioComuna(barrio) {
  const normalized = barrio.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (BARRIO_A_COMUNA[normalized]) return BARRIO_A_COMUNA[normalized];
  // Búsqueda parcial
  for (const [b, c] of Object.entries(BARRIO_A_COMUNA)) {
    if (b.includes(normalized) || normalized.includes(b)) return c;
  }
  return null;
}

export const PUNTOS_ACOPIO = [
  { id: 1, nombre: 'Punto ECO Centro', direccion: 'Carrera 5 # 10-45, Centro', tipos: ['plastico', 'papel', 'vidrio'], lat: 2.9376, lng: -75.2720 },
  { id: 2, nombre: 'Estación Reciclaje Norte', direccion: 'Avenida 26 # 5-30, Prado Norte', tipos: ['plastico', 'metal', 'papel'], lat: 2.9500, lng: -75.2800 },
  { id: 3, nombre: 'Centro de Acopio Sur', direccion: 'Carrera 33 # 1-20, Zona Industrial', tipos: ['organico', 'vegetal'], lat: 2.9200, lng: -75.2600 },
  { id: 4, nombre: 'Punto Verde San Martín', direccion: 'Calle 8 # 15-50, San Martín', tipos: ['plastico', 'vidrio', 'papel'], lat: 2.9350, lng: -75.2650 },
  { id: 5, nombre: 'Reciclaje El Carmen', direccion: 'Carrera 8 # 12-30, El Carmen', tipos: ['metal', 'electronicos'], lat: 2.9400, lng: -75.2700 },
  { id: 6, nombre: 'EcoPunto La Toma', direccion: 'Calle 15 # 5-60, La Toma', tipos: ['plastico', 'papel', 'organico'], lat: 2.9380, lng: -75.2750 },
];

// Neiva center
export const NEIVA_CENTER = [2.9376, -75.2818];
