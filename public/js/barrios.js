const BARRIOS_DATA = {
  '1': { zona: '01', dias: 'Lunes, Miércoles y Viernes', horario: '7AM–1PM', nombre: 'Norte — Aeropuerto', color: '#c8e6c9' },
  '2': { zona: '01', dias: 'Lunes, Miércoles y Viernes', horario: '7AM–1PM', nombre: 'Norte — Aeropuerto', color: '#c8e6c9' },
  '3': { zona: '03', dias: 'Lunes, Miércoles y Viernes', horario: '1PM–7PM', nombre: 'Centro — Entre Ríos', color: '#80cbc4' },
  '4': { zona: '03', dias: 'Lunes, Miércoles y Viernes', horario: '1PM–7PM', nombre: 'Centro', color: '#80cbc4' },
  '5': { zona: '02', dias: 'Martes, Jueves y Sábado', horario: '7AM–1PM', nombre: 'Oriental', color: '#ef9a9a' },
  '6': { zona: '04', dias: 'Martes, Jueves y Sábado', horario: '1PM–7PM', nombre: 'Sur', color: '#a5d6a7' },
  '7': { zona: '02', dias: 'Martes, Jueves y Sábado', horario: '7AM–1PM', nombre: 'Centro Oriente', color: '#ef9a9a' },
  '8': { zona: '04', dias: 'Martes, Jueves y Sábado', horario: '1PM–7PM', nombre: 'Sur Oriental', color: '#a5d6a7' },
  '9': { zona: '05', dias: 'Lunes a Sábado', horario: '7AM–3PM', nombre: 'Norte — Galindo', color: '#b2dfdb' },
  '10': { zona: '02', dias: 'Martes, Jueves y Sábado', horario: '7AM–1PM', nombre: 'Oriente Alto', color: '#ef9a9a' },
};

const BARRIOS_POR_COMUNA = {
  '1': ['Santa Inés','Cándido Leguízamo','Las Mercedes','Las Ferias','Chícalá','Minuto de Dios Norte','La Inmaculada','Villa del Río','Rodrigo Lara Bonilla','La Magdalena','Acrópolis','Los Elisios','California','Media Luna','San Nicolás','Los Andaquíes','Los Dujos','San Silvestre','Carlos Pizarro','El Triángulo','José Martí','Pigoanza','Madrigal','Conarvar','Colmenar','Villa Magdalena Norte','La Fortaleza','Bajo Chicalá','Mansiones del Norte','Ciudadela Carlos Pizarro','Ciudadela Comfamiliar','Torres de la Camila','Portal de San Felipe','Balcones de la Riviera','Riviera I','Riviera II','Portales de Varanta','Minuto de Dios','La Vorágine'],
  '2': ['Aeropuerto','Alvaro Sánchez Silva','Santa Lucía','Santa Clara','Los Cámbaros','Los Molinos','Las Granjas','Bosques de Tamarindo','Santa Mónica','El Prado','Los Pinos','Alamos Norte','El Cortijo','Municipal','Villa Cecilia','Los Andes','Villa Milena','Gualanday','Villa Aurora','Villa Urbe','Versalles','Santa Ana','Camino Real','Conjunto Málaga','Portal de la Calleja','El Rosal','Las Villas','Villa del Prado','Villa Flor','Villa Esmeralda','Torres de Varegal','Cataluña','San Diego'],
  '3': ['El Lago','Caracolí','San Vicente de Paúl','La Cordialidad','Guillermo Plazas Alcid','Reinaldo Matiz Trujillo','Rojas Trujillo','Las Delicias','Sevilla','Las Ceibas','Quirinal','José Eustasio Rivera','Tenerife','Campo Núñez','La Torna','Chapinero','Santa Librada','Los Samanes','Villa Patricia','La Estrella','Las Ceibitas','Brisas del Magdalena','Los Profesionales','Alcalá'],
  '4': ['Bonilla','Los Martires','El Centro','San Pedro','Los Almendros','El Estadio','Altico','Modelo','San José','Diego de Ospina','La Unión'],
  '5': ['Primero de Mayo','La Libertad','Loma de La Cruz','La Colina','Kennedy','Monserrate','Siete de Agosto','San Antonio','La Independencia','El Jardín','Buganviles','La Orquídea','Los Guaduales','Jordán','Faro','Veinte de Julio','Independencia Baja','El Vergel','Brisas del Avichente','Los Laureles','Alto Llano','Villa Café','Altos de la Ferreira','Villa Regina','Alta Vista','Altos de Tivoli','Aragonés'],
  '6': ['Minuto de Dios','Miramar','Andalucía','Alto del Limonar','Emayá','Santa Isabel','La Esperanza','Bogotá','Buenos Aires','Sinaí','José Antonio Galán','Los Nazarenos','Pozo Azul','Loma Linda','Arismendi Mora','Timanco','Bella Vista','El Limonar','Villa Inés','Los Caobos','Manzanares','San Francisco de Asís','Tuquíla','Las Lajas','El Bosque','Canaíma','Los Arrayanes'],
  '7': ['Las Brisas','Casa Loma','La Floresta','Ipanema','Casa de Campo','Altamíra','Prado Alto','Casa Blanca','La Gaitana','Calixto Leyva','Buena Vista','Jorge Eliécer Gaitán','Obrero','Ventilador','San Martín','La Juventud','Punta del Este','Santa Faula','Altos de Manzanillo','Gaitana Dos','Portal del Campo','Paseo La Castellana','Torres de Bizancio','Antigua','Santorini','Caminos de Oriente','Altos de la Pradera'],
  '8': ['La Isla','Las Américas','Alfonso López','Las Acacias','Nueva Granada','Los Parques','Guillermo Liévano','La Florida','Surorientales','Los Alpes','Rafael Azuero','La Paz','Simón Bolívar','Los Arrayanes','Rafael Uribe Uribe','Panorama','San Carlos','Villa Amarilla','La Cristalina','Bajo Pedregal','El Peñón','El Caracol','El Porvenir','La Esperanza','Las Rocas','Divino Niño','Peñón Redondo','Bajo Américas','El Dorado','La Cabuya','La Chamiza','La Provincia'],
  '9': ['Trínidad','Alberto Galindo','José María Carbonell','Luis Ignacio Andrade','Eduardo Santos','Darío Echandía','Villa Magdalena','La Riviera','Luis Eduardo Vanegas','Luis Carlos Galán','Santa Rosa','Carbonell II','Los Libertadores','Minuto de Dios VI','Vicente Araújo','Villa Nazaret','El Progreso','Virgilio Barco','Villa Marcela','Villa Esmeralda','Calamari','Villa Colombia','Alvaro Leyva Liévano','Sector Galindo'],
  '10': ['La Rioja','Once de Noviembre','Misael Pastrana Borrero','Los Comuneros','Triunfo','Las Camelias','Palmas I','Palmas II','Palmas III','El Pedregal','Santander','Enrique Olaya Herrera','Alberto Yepes','Katakandrú','Sector Barreiro','Nuevo Horizonte','Pablo Sexto','Victor Félix Díaz','Villa Nadia','San Bernardo del Viento','Oro Negro','La Victoria','Palmitas II','La Pradera','Villa Aranzazu','Folicarpo','Calle Real','El Paraíso','Los Machines','Los Rosales','Los Colores','El Oasis','Antonio Nariño'],
};

const ALL_BARRIOS = Object.entries(BARRIOS_POR_COMUNA).flatMap(([comuna, barrios]) =>
  barrios.map(b => ({ nombre: b, comuna }))
).sort((a, b) => a.nombre.localeCompare(b.nombre));

const PUNTOS_ACOPIO = [
  { id: 1, nombre: 'Punto ECO Centro', direccion: 'Carrera 5 # 10-45, Centro', tipos: ['plastico','papel','vidrio'], lat: 2.9376, lng: -75.2720 },
  { id: 2, nombre: 'Estación Reciclaje Norte', direccion: 'Avenida 26 # 5-30, Prado Norte', tipos: ['plastico','metal','papel'], lat: 2.9500, lng: -75.2800 },
  { id: 3, nombre: 'Centro de Acopio Sur', direccion: 'Carrera 33 # 1-20, Zona Industrial', tipos: ['organico','vegetal'], lat: 2.9200, lng: -75.2600 },
  { id: 4, nombre: 'Punto Verde San Martín', direccion: 'Calle 8 # 15-50, San Martín', tipos: ['plastico','vidrio','papel'], lat: 2.9350, lng: -75.2650 },
  { id: 5, nombre: 'Reciclaje El Carmen', direccion: 'Carrera 8 # 12-30, El Carmen', tipos: ['metal','electronicos'], lat: 2.9400, lng: -75.2700 },
  { id: 6, nombre: 'EcoPunto La Toma', direccion: 'Calle 15 # 5-60, La Toma', tipos: ['plastico','papel','organico'], lat: 2.9380, lng: -75.2750 },
];

const ZONA_POLYGONS = {
  '01': [[2.9550,-75.3100],[2.9650,-75.2900],[2.9600,-75.2700],[2.9500,-75.2650],[2.9400,-75.2700],[2.9380,-75.2900],[2.9430,-75.3050]],
  '02': [[2.9500,-75.2650],[2.9600,-75.2700],[2.9550,-75.2450],[2.9400,-75.2300],[2.9200,-75.2350],[2.9150,-75.2500],[2.9300,-75.2600]],
  '03': [[2.9380,-75.2900],[2.9400,-75.2700],[2.9300,-75.2600],[2.9200,-75.2700],[2.9180,-75.2850],[2.9250,-75.3000],[2.9320,-75.3000]],
  '04': [[2.9180,-75.2850],[2.9200,-75.2700],[2.9150,-75.2500],[2.9000,-75.2600],[2.8950,-75.2800],[2.9050,-75.3000],[2.9130,-75.2950]],
  '05': [[2.9430,-75.3050],[2.9380,-75.2900],[2.9320,-75.3000],[2.9250,-75.3000],[2.9180,-75.2850],[2.9130,-75.2950],[2.9050,-75.3000],[2.9000,-75.3200],[2.9150,-75.3350],[2.9350,-75.3300]],
};

const ZONA_INFO = {
  '01': { fill: '#c8e6c9', border: '#4caf50', comunas: ['1','2'], label: 'Lun·Mié·Vie  7AM–1PM' },
  '02': { fill: '#ef9a9a', border: '#f44336', comunas: ['5','7','10'], label: 'Mar·Jue·Sáb  7AM–1PM' },
  '03': { fill: '#80cbc4', border: '#009688', comunas: ['3','4'], label: 'Lun·Mié·Vie  1PM–7PM' },
  '04': { fill: '#a5d6a7', border: '#388e3c', comunas: ['6','8'], label: 'Mar·Jue·Sáb  1PM–7PM' },
  '05': { fill: '#b2dfdb', border: '#00897b', comunas: ['9'], label: 'Lun–Sáb  7AM–3PM' },
};

function getBarrioInfo(nombre) {
  const q = nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  for (const [comuna, barrios] of Object.entries(BARRIOS_POR_COMUNA)) {
    for (const b of barrios) {
      if (b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') === q) {
        return { barrio: b, comuna, ...BARRIOS_DATA[comuna] };
      }
    }
  }
  for (const [comuna, barrios] of Object.entries(BARRIOS_POR_COMUNA)) {
    for (const b of barrios) {
      const bn = b.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (bn.includes(q) || q.includes(bn)) {
        return { barrio: b, comuna, ...BARRIOS_DATA[comuna] };
      }
    }
  }
  return null;
}

function searchBarrios(query) {
  if (query.length < 2) return [];
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return ALL_BARRIOS.filter(b =>
    b.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(q)
  ).slice(0, 8);
}
