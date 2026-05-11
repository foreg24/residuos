// ===== STATE =====
const AppState = {
    currentUser: null,
    currentSection: 'inicio',
    notifications: [],
    reportes: [],
    solicitudes: [],
    alertas: [],
    puntosAcopio: [
        { id: 1, name: 'Punto ECO Neiva Centro', address: 'Carrera 5 # 10-45, Centro', types: ['plastico', 'papel', 'vidrio'], lat: 2.9376, lng: -75.2720, distance: '0.5 km' },
        { id: 2, name: 'Estación de Reciclaje Norte', address: 'Avenida 26 # 5-30, Prado Norte', types: ['plastico', 'metal', 'papel'], lat: 2.9500, lng: -75.2800, distance: '1.2 km' },
        { id: 3, name: 'Centro de Acopio Sur', address: 'Carrera 33 # 1-20, Zona Industrial', types: ['organico', 'vegetal'], lat: 2.9200, lng: -75.2600, distance: '2.1 km' },
        { id: 4, name: 'Punto Verde San Martín', address: 'Calle 8 # 15-50, San Martín', types: ['plastico', 'vidrio', 'papel'], lat: 2.9350, lng: -75.2650, distance: '0.8 km' },
        { id: 5, name: 'Reciclaje El Carmen', address: 'Carrera 8 # 12-30, El Carmen', types: ['metal', 'electronicos'], lat: 2.9400, lng: -75.2700, distance: '0.3 km' },
        { id: 6, name: 'EcoPunto La Toma', address: 'Calle 15 # 5-60, La Toma', types: ['plastico', 'papel', 'organico'], lat: 2.9380, lng: -75.2750, distance: '1.5 km' }
    ],
    horariosPorComuna: {
        '1': { dia: 'Martes', horario: '2PM - 6PM', zona: 'Norte' },
        '2': { dia: 'Miércoles', horario: '2PM - 6PM', zona: 'Centro Occidente' },
        '3': { dia: 'Miércoles', horario: '2PM - 6PM', zona: 'Centro' },
        '4': { dia: 'Miércoles', horario: '2PM - 6PM', zona: 'Centro Oriente' },
        '5': { dia: 'Jueves', horario: '2PM - 6PM', zona: 'Centro' },
        '6': { dia: 'Sábado', horario: '7AM - 3PM', zona: 'Sur' },
        '7': { dia: 'Viernes', horario: '2PM - 6PM', zona: 'Oriente' },
        '8': { dia: 'Viernes', horario: '2PM - 6PM', zona: 'Oriente' },
        '9': { dia: 'Viernes', horario: '2PM - 6PM', zona: 'Oriente' }
    },
    diasSemana: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    currentCalendarDate: new Date()
};

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initSession();
    initSidebar();
    initNotifications();
    initDashboard();
    initCalendar();
    initPuntosAcopio();
    initAlertas();
    initCuenta();
    initRecicladorPanel();
    initFab();
    initAsistente();
});

// ===== SESSION =====
function initSession() {
    const session = localStorage.getItem('trankas_session');
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    AppState.currentUser = JSON.parse(session);
    updateUserUI();
}

function updateUserUI() {
    const user = AppState.currentUser;
    const firstName = getFirstName(user.name);
    const emailPrefix = getEmailPrefix(user.email);

    // Navbar
    document.getElementById('userName').textContent = firstName;
    document.getElementById('sidebarName').textContent = firstName;
    document.getElementById('sidebarRole').textContent = user.isReciclador ? 'Reciclador' : 'Ciudadano';

    // Avatares
    const avatars = document.querySelectorAll('#userAvatar, #sidebarAvatar, #cuentaAvatar');
    avatars.forEach(avatar => {
        avatar.src = user.avatar || '';
        if (!user.avatar) {
            avatar.style.background = 'var(--gradient-1)';
        }
    });

    // Mostrar/ocultar link de reciclador
    const recicladorLink = document.getElementById('recicladorLink');
    if (user.isReciclador) {
        recicladorLink.classList.add('visible');
    }
}

function getFirstName(fullName) {
    return fullName?.split(' ')[0] || 'Usuario';
}

function getEmailPrefix(email) {
    return email?.split('@')[0] || 'usuario';
}

// ===== NAVIGATION =====
function navigateTo(section) {
    AppState.currentSection = section;

    // Ocultar todas las secciones
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));

    // Mostrar sección seleccionada
    const targetSection = document.getElementById('section-' + section);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // Actualizar sidebar
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.classList.toggle('active', link.dataset.section === section);
    });

    // Cerrar sidebar en mobile
    if (window.innerWidth <= 768) {
        document.getElementById('sidebar').classList.remove('active');
        document.getElementById('sidebarOverlay').classList.remove('active');
    }

    // Cerrar dropdown de usuario
    document.getElementById('userDropdown').classList.remove('active');

    // Scroll al top
    window.scrollTo(0, 0);

    // Acciones especiales por sección
    if (section === 'inicio') updateDashboard();
    if (section === 'horario') updateHorario();
    if (section === 'cuenta') loadCuentaData();
    if (section === 'reciclador') loadRecicladorData();
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
}

function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('active');
}

// ===== NOTIFICATIONS =====
function initNotifications() {
    // Notificaciones de ejemplo
    AppState.notifications = [
        { id: 1, title: 'Recolección mañana', desc: 'El camión pasará por tu sector', time: 'Hace 2h', type: 'info', read: false },
        { id: 2, title: 'Reporte resuelto', desc: 'Tu reporte #123 ha sido atendido', time: 'Hace 5h', type: 'success', read: false },
        { id: 3, title: 'Nueva alerta cerca', desc: 'Acumulación reportada a 200m', time: 'Hace 1d', type: 'warning', read: true }
    ];
    renderNotifications();
}

function showNotifications() {
    const panel = document.getElementById('notificationsPanel');
    panel.classList.toggle('active');

    // Cerrar dropdown de usuario si está abierto
    document.getElementById('userDropdown').classList.remove('active');
}

function renderNotifications() {
    const container = document.getElementById('notificationsList');
    const unreadCount = AppState.notifications.filter(n => !n.read).length;
    document.getElementById('notifBadge').textContent = unreadCount;
    document.getElementById('notifBadge').style.display = unreadCount > 0 ? 'flex' : 'none';

    container.innerHTML = AppState.notifications.map(n => `
        <div class="notification-item ${n.read ? '' : 'unread'}" onclick="markRead(${n.id})">
            <div class="notification-icon ${n.type}">
                <i class="fas ${n.type === 'info' ? 'fa-info' : n.type === 'success' ? 'fa-check' : n.type === 'warning' ? 'fa-exclamation' : 'fa-times'}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${n.title}</div>
                <div class="notification-desc">${n.desc}</div>
                <div class="notification-time">${n.time}</div>
            </div>
        </div>
    `).join('');
}

function markRead(id) {
    const notif = AppState.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
    renderNotifications();
}

function markAllRead() {
    AppState.notifications.forEach(n => n.read = true);
    renderNotifications();
}

// ===== DASHBOARD =====
function initDashboard() {
    updateDashboard();

    // Cargar datos del usuario
    const reportes = JSON.parse(localStorage.getItem('trankas_reportes_' + AppState.currentUser.id) || '[]');
    const solicitudes = JSON.parse(localStorage.getItem('trankas_solicitudes_' + AppState.currentUser.id) || '[]');
    const alertas = JSON.parse(localStorage.getItem('trankas_alertas') || '[]').filter(a => a.userId === AppState.currentUser.id);

    document.getElementById('reportCount').textContent = reportes.length;
    document.getElementById('solicitudCount').textContent = solicitudes.length;
    document.getElementById('alertCount').textContent = alertas.length;
}

function updateDashboard() {
    const user = AppState.currentUser;
    if (!user?.location?.comuna) return;

    const horario = AppState.horariosPorComuna[user.location.comuna];
    if (!horario) return;

    document.getElementById('collectionDay').textContent = horario.dia;
    document.getElementById('collectionTime').textContent = horario.horario;

    // Calcular countdown
    updateCountdown(horario.dia);
}

function updateCountdown(diaRecoleccion) {
    const dias = { 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Domingo': 0 };
    const targetDay = dias[diaRecoleccion];
    const now = new Date();
    const currentDay = now.getDay();

    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;

    const countdownEl = document.getElementById('collectionCountdown');
    if (daysUntil === 0) {
        countdownEl.textContent = '¡Hoy es día de recolección!';
        countdownEl.style.background = 'rgba(16, 185, 129, 0.2)';
        countdownEl.style.color = 'var(--primary-light)';

        // Activar GPS
        document.querySelector('.gps-indicator').classList.remove('offline');
        document.querySelector('.gps-indicator').classList.add('online');
        document.querySelector('.gps-status p').textContent = 'Camión en ruta';
        document.querySelector('.gps-status small').textContent = 'Sigue la ubicación en tiempo real';
    } else {
        countdownEl.textContent = `Faltan ${daysUntil} día${daysUntil > 1 ? 's' : ''}`;
    }
}

// ===== HORARIO =====
function initCalendar() {
    renderCalendar();
}

function renderCalendar() {
    const date = AppState.currentCalendarDate;
    const year = date.getFullYear();
    const month = date.getMonth();

    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    document.getElementById('calendarMonth').textContent = `${monthNames[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = document.getElementById('calendarGrid');
    grid.innerHTML = '';

    // Headers
    const dayHeaders = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayHeaders.forEach(day => {
        const header = document.createElement('div');
        header.className = 'calendar-day-header';
        header.textContent = day;
        grid.appendChild(header);
    });

    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
        const day = document.createElement('div');
        day.className = 'calendar-day other-month';
        day.textContent = daysInPrevMonth - i;
        grid.appendChild(day);
    }

    // Current month days
    const user = AppState.currentUser;
    const diaRecoleccion = user?.location?.comuna ? 
        AppState.horariosPorComuna[user.location.comuna]?.dia : null;
    const diaNum = { 'Domingo': 0, 'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 
                     'Jueves': 4, 'Viernes': 5, 'Sábado': 6 }[diaRecoleccion];

    const today = new Date();

    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'calendar-day';
        day.textContent = i;

        const thisDate = new Date(year, month, i);
        if (thisDate.toDateString() === today.toDateString()) {
            day.classList.add('today');
        }

        if (thisDate.getDay() === diaNum) {
            day.classList.add('collection-day');
            day.title = 'Día de recolección';
        }

        grid.appendChild(day);
    }
}

function changeMonth(delta) {
    AppState.currentCalendarDate.setMonth(AppState.currentCalendarDate.getMonth() + delta);
    renderCalendar();
}

function updateHorario() {
    const user = AppState.currentUser;
    if (!user?.location) return;

    const loc = user.location;
    const horario = AppState.horariosPorComuna[loc.comuna];

    document.getElementById('scheduleLocation').innerHTML = `
        <i class="fas fa-map-marker-alt"></i>
        <span>Comuna ${loc.comuna} - ${loc.barrio}</span>
    `;

    if (horario) {
        document.getElementById('scheduleDayBig').innerHTML = `
            <i class="fas fa-calendar-day"></i>
            <span>${horario.dia}</span>
        `;
        document.getElementById('scheduleTimeBig').textContent = horario.horario;
        document.getElementById('scheduleZoneTag').textContent = `Zona: ${horario.zona}`;
    }
}

// ===== MAPA =====
function setMapFilter(filter) {
    document.querySelectorAll('.map-filters .filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.textContent.toLowerCase().includes(filter) || 
            (filter === 'all' && btn.textContent.includes('Todos')));
    });

    // Aquí iría la lógica para filtrar el mapa
    showToast('Filtro aplicado: ' + filter, 'info');
}

// ===== ASISTENTE IA =====
function initAsistente() {
    // Ya inicializado en el HTML
}

function sendAsistenteMessage() {
    const input = document.getElementById('asistenteInput');
    const message = input.value.trim();
    if (!message) return;

    addChatMessage(message, 'user');
    input.value = '';

    // Simular respuesta del asistente
    setTimeout(() => {
        const response = generateAsistenteResponse(message);
        addChatMessage(response, 'bot');
    }, 1000);
}

function addChatMessage(text, sender) {
    const chat = document.getElementById('asistenteChat');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;

    const avatar = sender === 'bot' ? 
        '<div class="chat-avatar"><i class="fas fa-robot"></i></div>' :
        '<div class="chat-avatar"><i class="fas fa-user"></i></div>';

    messageDiv.innerHTML = `
        ${avatar}
        <div class="chat-bubble">${text}</div>
    `;

    chat.appendChild(messageDiv);
    chat.scrollTop = chat.scrollHeight;
}

function generateAsistenteResponse(message) {
    const lowerMsg = message.toLowerCase();

    if (lowerMsg.includes('plástico') || lowerMsg.includes('botella')) {
        return `<strong>✅ Sí es aprovechable!</strong><br><br>
                Las botellas de plástico van en residuos <strong>aprovechables</strong>.<br>
                💡 <strong>Tip:</strong> Lávalas, quita las etiquetas y aplánalas para ocupar menos espacio.<br>
                📍 Llévalas a un punto de acopio o déjalas en el costal blanco.`;
    }

    if (lowerMsg.includes('orgánico') || lowerMsg.includes('comida') || lowerMsg.includes('fruta')) {
        return `<strong>🌱 Residuo Orgánico</strong><br><br>
                Los restos de comida y frutas van en residuos <strong>orgánicos</strong>.<br>
                💡 <strong>Tip:</strong> Puedes compostarlos en casa para crear abono natural.<br>
                🚫 No mezcles con plásticos o papel.`;
    }

    if (lowerMsg.includes('papel') || lowerMsg.includes('cartón')) {
        return `<strong>✅ Sí es aprovechable!</strong><br><br>
                El papel y cartón son materiales <strong>aprovechables</strong>.<br>
                💡 <strong>Tip:</strong> Aplánalas cajas de cartón y amarra el papel con hilo.<br>
                📍 Llévalos a un punto de acopio o déjalos en el costal blanco.`;
    }

    if (lowerMsg.includes('pilas') || lowerMsg.includes('batería') || lowerMsg.includes('electrónico')) {
        return `<strong>⚠️ Residuo Peligroso</strong><br><br>
                Las pilas, baterías y electrónicos son <strong>residuos peligrosos</strong>.<br>
                🚫 <strong>No</strong> los deposites en la basura común.<br>
                📍 Llévalos al <strong>Punto ECO Neiva Centro</strong> o a establecimientos autorizados.`;
    }

    if (lowerMsg.includes('vidrio')) {
        return `<strong>✅ Sí es aprovechable!</strong><br><br>
                El vidrio es 100% <strong>aprovechable</strong> e infinitamente reciclable.<br>
                💡 <strong>Tip:</strong> Enjuaga los envases y quita tapas de otros materiales.<br>
                ⚠️ <strong>Cuidado:</strong> Si está roto, envuélvelo en papel periódico.`;
    }

    if (lowerMsg.includes('escombros') || lowerMsg.includes('construcción')) {
        return `<strong>🏗️ Recolección Especial</strong><br><br>
                Los escombros y restos de construcción requieren <strong>recolección especial</strong>.<br>
                📱 <strong>Acción:</strong> Ve a "Solicitar Recolección" en el menú y solicita un reciclador.<br>
                💰 El reciclador más cercano te dará cotización.`;
    }

    return `<strong>🤔 No estoy seguro...</strong><br><br>
            Para darte una respuesta precisa, puedes:<br>
            📸 <strong>Subir una foto</strong> del residuo<br>
            📝 O describe mejor el material (¿es plástico, metal, vidrio, orgánico?)<br><br>
            También puedes consultar los puntos de acopio más cercanos.`;
}

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const chat = document.getElementById('asistenteChat');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message user';
        messageDiv.innerHTML = `
            <div class="chat-avatar"><i class="fas fa-user"></i></div>
            <div class="chat-bubble">
                <img src="${e.target.result}" class="chat-image" alt="Residuo">
            </div>
        `;
        chat.appendChild(messageDiv);
        chat.scrollTop = chat.scrollHeight;

        // Simular análisis de imagen
        setTimeout(() => {
            const responses = [
                `<strong>🔍 Análisis de imagen</strong><br><br>
                 Parece ser una <strong>botella de plástico PET</strong>.<br>
                 ✅ <strong>Clasificación:</strong> Aprovechable<br>
                 💡 Lávala, quita la etiqueta y aplánala antes de reciclar.`,

                `<strong>🔍 Análisis de imagen</strong><br><br>
                 Identifico <strong>restos de comida / orgánico</strong>.<br>
                 🌱 <strong>Clasificación:</strong> Residuo orgánico<br>
                 💡 Ideal para compostaje casero. No mezcles con plásticos.`,

                `<strong>🔍 Análisis de imagen</strong><br><br>
                 Detecto <strong>cartón / papel</strong>.<br>
                 ✅ <strong>Clasificación:</strong> Aprovechable<br>
                 💡 Aplana las cajas y amarra con hilo para facilitar la recolección.`
            ];

            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addChatMessage(randomResponse, 'bot');
        }, 1500);
    };
    reader.readAsDataURL(file);
}

// ===== REPORTES =====
function updateReporteSubtipos() {
    const tipo = document.getElementById('reporteTipo').value;
    const subtipoGroup = document.getElementById('subtipoGroup');
    const subtipoSelect = document.getElementById('reporteSubtipo');

    const subtipos = {
        'horario': ['Camión no pasó', 'Pasó antes de hora', 'Pasó después de hora', 'No recolectó todo'],
        'basurero': ['Acumulación pequeña', 'Acumulación grande', 'Quema de basura', 'Malos olores'],
        'vehiculo': ['Camión averiado', 'Camión muy viejo', 'Fuga de líquidos', 'Ruido excesivo'],
        'personal': ['Mal trato', 'No recolectó todo', 'Dañó contenedores', 'Actitud inapropiada']
    };

    if (subtipos[tipo]) {
        subtipoGroup.style.display = 'block';
        subtipoSelect.innerHTML = '<option value="">Selecciona</option>' +
            subtipos[tipo].map(s => `<option value="${s}">${s}</option>`).join('');
    } else {
        subtipoGroup.style.display = 'none';
    }
}

function previewReporteImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('reporteImagePreview').src = e.target.result;
        document.getElementById('reporteImagePreview').classList.remove('hidden');
        document.getElementById('reporteUploadPlaceholder').classList.add('hidden');
        document.getElementById('removeReporteImage').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
}

function removeReporteImage() {
    document.getElementById('reporteImagen').value = '';
    document.getElementById('reporteImagePreview').classList.add('hidden');
    document.getElementById('reporteUploadPlaceholder').classList.remove('hidden');
    document.getElementById('removeReporteImage').classList.add('hidden');
}

function useCurrentLocationForReport() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                document.getElementById('reporteUbicacion').value = 
                    `Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`;
                showToast('Ubicación obtenida', 'success');
            },
            () => showToast('No se pudo obtener ubicación', 'warning')
        );
    }
}

function handleReporte(e) {
    e.preventDefault();

    const reporte = {
        id: Date.now().toString(),
        userId: AppState.currentUser.id,
        tipo: document.getElementById('reporteTipo').value,
        subtipo: document.getElementById('reporteSubtipo').value,
        descripcion: document.getElementById('reporteDescripcion').value,
        ubicacion: document.getElementById('reporteUbicacion').value,
        imagen: document.getElementById('reporteImagePreview').src || null,
        fecha: new Date().toISOString(),
        status: 'pendiente'
    };

    const reportes = JSON.parse(localStorage.getItem('trankas_reportes_' + AppState.currentUser.id) || '[]');
    reportes.unshift(reporte);
    localStorage.setItem('trankas_reportes_' + AppState.currentUser.id, JSON.stringify(reportes));

    // Actualizar contador
    document.getElementById('reportCount').textContent = reportes.length;

    // Agregar a lista
    addReporteToList(reporte);

    showToast('Reporte enviado correctamente', 'success');
    e.target.reset();
    removeReporteImage();
}

function addReporteToList(reporte) {
    const list = document.getElementById('misReportesList');

    // Remover empty state si existe
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const item = document.createElement('div');
    item.className = 'reporte-item';
    item.innerHTML = `
        <div class="reporte-header">
            <span class="reporte-type"><i class="fas fa-flag"></i> ${reporte.tipo}</span>
            <span class="reporte-status status-pendiente">Pendiente</span>
        </div>
        <div class="reporte-desc">${reporte.descripcion}</div>
        <div class="reporte-date">${new Date(reporte.fecha).toLocaleDateString()}</div>
    `;

    list.insertBefore(item, list.firstChild);
}

// ===== SOLICITUDES =====
function previewSolicitudImages(event) {
    const files = event.target.files;
    const grid = document.getElementById('solicitudPreviewGrid');
    grid.innerHTML = '';

    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            grid.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
}

function handleSolicitud(e) {
    e.preventDefault();

    const solicitud = {
        id: Date.now().toString(),
        userId: AppState.currentUser.id,
        tipo: document.getElementById('solicitudTipo').value,
        volumen: document.getElementById('solicitudVolumen').value,
        descripcion: document.getElementById('solicitudDescripcion').value,
        direccion: document.getElementById('solicitudDireccion').value,
        fecha: document.getElementById('solicitudFecha').value,
        hora: document.getElementById('solicitudHora').value,
        status: 'buscando-reciclador',
        fechaSolicitud: new Date().toISOString(),
        reciclador: null
    };

    const solicitudes = JSON.parse(localStorage.getItem('trankas_solicitudes_' + AppState.currentUser.id) || '[]');
    solicitudes.unshift(solicitud);
    localStorage.setItem('trankas_solicitudes_' + AppState.currentUser.id, JSON.stringify(solicitudes));

    document.getElementById('solicitudCount').textContent = solicitudes.length;

    addSolicitudToList(solicitud);

    showToast('Solicitud enviada. Buscando reciclador cercano...', 'success');
    e.target.reset();
    document.getElementById('solicitudPreviewGrid').innerHTML = '';

    // Simular asignación de reciclador
    setTimeout(() => {
        solicitud.status = 'asignado';
        solicitud.reciclador = {
            name: 'Carlos Martínez',
            phone: '300 123 4567',
            rating: 4.8,
            vehicle: 'Camioneta',
            eta: '15 min'
        };
        localStorage.setItem('trankas_solicitudes_' + AppState.currentUser.id, JSON.stringify(solicitudes));
        showToast('¡Reciclador asignado! Carlos llegará en ~15 min', 'success');

        // Notificación
        AppState.notifications.unshift({
            id: Date.now(),
            title: 'Reciclador asignado',
            desc: 'Carlos Martínez está en camino',
            time: 'Ahora',
            type: 'success',
            read: false
        });
        renderNotifications();
    }, 3000);
}

function addSolicitudToList(solicitud) {
    const list = document.getElementById('misSolicitudesList');
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const statusLabels = {
        'buscando-reciclador': { text: 'Buscando reciclador', class: 'status-en-proceso' },
        'asignado': { text: 'Reciclador asignado', class: 'status-en-proceso' },
        'en-camino': { text: 'En camino', class: 'status-en-proceso' },
        'completado': { text: 'Completado', class: 'status-resuelto' },
        'cancelado': { text: 'Cancelado', class: 'status-cancelado' }
    };

    const status = statusLabels[solicitud.status] || statusLabels['buscando-reciclador'];

    const item = document.createElement('div');
    item.className = 'solicitud-item';
    item.innerHTML = `
        <div class="solicitud-header">
            <span class="solicitud-type"><i class="fas fa-box"></i> ${solicitud.tipo}</span>
            <span class="solicitud-status ${status.class}">${status.text}</span>
        </div>
        <div class="solicitud-desc">${solicitud.descripcion}</div>
        <div class="solicitud-date">${new Date(solicitud.fechaSolicitud).toLocaleDateString()}</div>
    `;

    list.insertBefore(item, list.firstChild);
}

// ===== PUNTOS DE ACOPIO =====
function initPuntosAcopio() {
    renderPuntos('todos');
}

function renderPuntos(filter) {
    const container = document.getElementById('puntosList');
    let puntos = AppState.puntosAcopio;

    if (filter !== 'todos') {
        puntos = puntos.filter(p => p.types.includes(filter));
    }

    container.innerHTML = puntos.map(p => `
        <div class="punto-card">
            <div class="punto-name"><i class="fas fa-recycle"></i> ${p.name}</div>
            <div class="punto-address">${p.address}</div>
            <div class="punto-types">
                ${p.types.map(t => `<span class="punto-type">${t}</span>`).join('')}
            </div>
            <div class="punto-distance"><i class="fas fa-walking"></i> ${p.distance}</div>
        </div>
    `).join('');
}

function filterPuntos(type) {
    document.querySelectorAll('.puntos-filters .filter-chip').forEach(chip => {
        chip.classList.toggle('active', chip.textContent.toLowerCase().includes(type) || 
            (type === 'todos' && chip.textContent.includes('Todos')));
    });
    renderPuntos(type);
}

// ===== ALERTAS =====
function initAlertas() {
    // Cargar alertas de localStorage o usar ejemplo
    const stored = localStorage.getItem('trankas_alertas');
    if (stored) {
        AppState.alertas = JSON.parse(stored);
    } else {
        AppState.alertas = [
            {
                id: 1,
                userId: 'otro',
                categoria: 'acumulacion',
                descripcion: 'Acumulación de basura en la esquina de la Carrera 5 con Calle 10',
                imagen: null,
                ubicacion: 'Carrera 5 # 10-20',
                lat: 2.9370,
                lng: -75.2710,
                fecha: new Date(Date.now() - 3600000).toISOString(),
                votosSi: 5,
                votosNo: 1,
                miVoto: null,
                resuelta: false
            },
            {
                id: 2,
                userId: 'otro',
                categoria: 'escombros',
                descripcion: 'Restos de construcción abandonados en vía pública',
                imagen: null,
                ubicacion: 'Calle 15 # 8-30',
                lat: 2.9380,
                lng: -75.2730,
                fecha: new Date(Date.now() - 7200000).toISOString(),
                votosSi: 8,
                votosNo: 0,
                miVoto: null,
                resuelta: false
            },
            {
                id: 3,
                userId: AppState.currentUser?.id,
                categoria: 'bloqueo',
                descripcion: 'Contenedores bloqueando el paso peatonal',
                imagen: null,
                ubicacion: 'Avenida 26 # 3-10',
                lat: 2.9400,
                lng: -75.2750,
                fecha: new Date(Date.now() - 86400000).toISOString(),
                votosSi: 3,
                votosNo: 2,
                miVoto: 'si',
                resuelta: true
            }
        ];
        localStorage.setItem('trankas_alertas', JSON.stringify(AppState.alertas));
    }

    renderAlertas('todas');
}

function renderAlertas(filter) {
    const container = document.getElementById('alertasList');
    let alertas = AppState.alertas;

    if (filter === 'activas') alertas = alertas.filter(a => !a.resuelta);
    if (filter === 'resueltas') alertas = alertas.filter(a => a.resuelta);
    if (filter === 'mias') alertas = alertas.filter(a => a.userId === AppState.currentUser?.id);

    const categorias = {
        'acumulacion': { icon: 'fa-trash', label: 'Acumulación' },
        'restos': { icon: 'fa-hammer', label: 'Restos' },
        'escombros': { icon: 'fa-building', label: 'Escombros' },
        'bloqueo': { icon: 'fa-ban', label: 'Bloqueo' },
        'taponamiento': { icon: 'fa-water', label: 'Taponamiento' },
        'basurero': { icon: 'fa-dumpster', label: 'Basurero' },
        'otro': { icon: 'fa-question', label: 'Otro' }
    };

    container.innerHTML = alertas.map(a => {
        const cat = categorias[a.categoria] || categorias['otro'];
        const timeAgo = getTimeAgo(new Date(a.fecha));

        return `
            <div class="alerta-card ${a.resuelta ? 'resuelta' : ''}">
                <div class="alerta-header">
                    <span class="alerta-category"><i class="fas ${cat.icon}"></i> ${cat.label}</span>
                    <span class="alerta-time">${timeAgo}</span>
                </div>
                ${a.imagen ? `<img src="${a.imagen}" class="alerta-image" alt="Alerta">` : ''}
                <div class="alerta-desc">${a.descripcion}</div>
                <div class="alerta-location"><i class="fas fa-map-marker-alt"></i> ${a.ubicacion}</div>
                <div class="alerta-actions">
                    <div class="alerta-votes">
                        <button class="vote-btn ${a.miVoto === 'si' ? 'active' : ''}" onclick="votarAlerta(${a.id}, 'si')">
                            <i class="fas fa-check"></i> Sí sigue (${a.votosSi})
                        </button>
                        <button class="vote-btn danger ${a.miVoto === 'no' ? 'active' : ''}" onclick="votarAlerta(${a.id}, 'no')">
                            <i class="fas fa-times"></i> Ya no (${a.votosNo})
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (alertas.length === 0) {
        container.innerHTML = '<p class="empty-state">No hay alertas en esta categoría</p>';
    }
}

function filterAlertas(filter) {
    document.querySelectorAll('.alertas-filters .filter-chip').forEach(chip => {
        chip.classList.toggle('active', 
            (filter === 'todas' && chip.textContent.includes('Todas')) ||
            (filter === 'activas' && chip.textContent.includes('Activas')) ||
            (filter === 'resueltas' && chip.textContent.includes('Resueltas')) ||
            (filter === 'mias' && chip.textContent.includes('Mis'))
        );
    });
    renderAlertas(filter);
}

function votarAlerta(id, voto) {
    const alerta = AppState.alertas.find(a => a.id === id);
    if (!alerta) return;

    // Quitar voto anterior
    if (alerta.miVoto === 'si') alerta.votosSi--;
    if (alerta.miVoto === 'no') alerta.votosNo--;

    // Agregar nuevo voto
    if (alerta.miVoto === voto) {
        alerta.miVoto = null; // Toggle off
    } else {
        alerta.miVoto = voto;
        if (voto === 'si') alerta.votosSi++;
        if (voto === 'no') alerta.votosNo++;
    }

    localStorage.setItem('trankas_alertas', JSON.stringify(AppState.alertas));
    renderAlertas('todas');
    showToast('Voto registrado', 'success');
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Hace un momento';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days}d`;
}

// ===== CUENTA =====
function initCuenta() {
    // Se carga al navegar a la sección
}

function loadCuentaData() {
    const user = AppState.currentUser;
    if (!user) return;

    document.getElementById('cuentaNombre').textContent = user.name;
    document.getElementById('cuentaEmail').textContent = user.email;
    document.getElementById('cuentaFecha').textContent = 'Se unió el ' + new Date(user.createdAt).toLocaleDateString('es-CO');

    document.getElementById('editName').value = user.name;
    document.getElementById('editEmail').value = user.email;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editGender').value = user.gender || '';

    // Ubicación
    if (user.location) {
        document.getElementById('locComuna').textContent = 'Comuna ' + user.location.comuna;
        document.getElementById('locBarrio').textContent = user.location.barrio;
        document.getElementById('locDireccion').textContent = user.location.direccion;
    }

    // Sección de contraseña
    const passwordSection = document.getElementById('passwordSection');
    if (user.authProvider === 'google' || user.authProvider === 'apple') {
        passwordSection.innerHTML = `
            <div class="password-message">
                <i class="fab fa-${user.authProvider}"></i>
                Iniciaste sesión con ${user.authProvider === 'google' ? 'Google' : 'Apple'}. 
                Tu cuenta no tiene contraseña local.
            </div>
            <button class="btn btn-outline" onclick="showAddPassword()">
                <i class="fas fa-plus"></i> Agregar contraseña local
            </button>
        `;
    } else {
        passwordSection.innerHTML = `
            <div class="password-display">
                <span class="password-dots">••••••••</span>
                <button class="btn btn-small btn-outline" onclick="togglePasswordVisibility()">
                    <i class="fas fa-eye"></i> Ver
                </button>
            </div>
            <button class="btn btn-outline" onclick="showChangePassword()">
                <i class="fas fa-key"></i> Cambiar Contraseña
            </button>
        `;
    }
}

function updateProfile(e) {
    e.preventDefault();

    const user = AppState.currentUser;
    user.name = document.getElementById('editName').value;
    user.phone = document.getElementById('editPhone').value || null;
    user.gender = document.getElementById('editGender').value || null;

    // Actualizar en storage
    const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
        users[idx] = user;
        localStorage.setItem('trankas_users', JSON.stringify(users));
    }
    localStorage.setItem('trankas_session', JSON.stringify(user));

    updateUserUI();
    showToast('Perfil actualizado correctamente', 'success');
}

function showAddPassword() {
    // Mostrar modal o form para agregar contraseña
    const newPass = prompt('Ingresa tu nueva contraseña (mínimo 6 caracteres):');
    if (newPass && newPass.length >= 6) {
        const confirmPass = prompt('Confirma tu contraseña:');
        if (newPass === confirmPass) {
            AppState.currentUser.password = newPass;
            AppState.currentUser.authProvider = 'email'; // Ahora tiene contraseña local

            const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
            const idx = users.findIndex(u => u.id === AppState.currentUser.id);
            if (idx >= 0) {
                users[idx] = AppState.currentUser;
                localStorage.setItem('trankas_users', JSON.stringify(users));
            }
            localStorage.setItem('trankas_session', JSON.stringify(AppState.currentUser));

            loadCuentaData();
            showToast('Contraseña agregada correctamente', 'success');
        } else {
            showToast('Las contraseñas no coinciden', 'error');
        }
    }
}

function showChangePassword() {
    const current = prompt('Contraseña actual:');
    if (current !== AppState.currentUser.password) {
        showToast('Contraseña incorrecta', 'error');
        return;
    }

    const newPass = prompt('Nueva contraseña (mínimo 6 caracteres):');
    if (newPass && newPass.length >= 6) {
        const confirmPass = prompt('Confirma nueva contraseña:');
        if (newPass === confirmPass) {
            AppState.currentUser.password = newPass;

            const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
            const idx = users.findIndex(u => u.id === AppState.currentUser.id);
            if (idx >= 0) {
                users[idx] = AppState.currentUser;
                localStorage.setItem('trankas_users', JSON.stringify(users));
            }
            localStorage.setItem('trankas_session', JSON.stringify(AppState.currentUser));

            showToast('Contraseña cambiada correctamente', 'success');
        } else {
            showToast('Las contraseñas no coinciden', 'error');
        }
    }
}

function togglePasswordVisibility() {
    const dots = document.querySelector('.password-dots');
    if (dots.textContent === '••••••••') {
        dots.textContent = AppState.currentUser.password;
    } else {
        dots.textContent = '••••••••';
    }
}

function editLocation() {
    showToast('Redirigiendo a edición de ubicación...', 'info');
    // Aquí se podría reutilizar el modal de setup
}

function changeAvatar() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            AppState.currentUser.avatar = ev.target.result;

            const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
            const idx = users.findIndex(u => u.id === AppState.currentUser.id);
            if (idx >= 0) {
                users[idx] = AppState.currentUser;
                localStorage.setItem('trankas_users', JSON.stringify(users));
            }
            localStorage.setItem('trankas_session', JSON.stringify(AppState.currentUser));

            updateUserUI();
            loadCuentaData();
            showToast('Foto de perfil actualizada', 'success');
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// ===== RECICLADOR =====
function initRecicladorPanel() {
    // Se carga al navegar
}

function loadRecicladorData() {
    if (!AppState.currentUser?.isReciclador) {
        navigateTo('aplicar-reciclador');
        return;
    }

    // Stats
    const solicitudes = JSON.parse(localStorage.getItem('trankas_solicitudes_all') || '[]');
    const misSolicitudes = solicitudes.filter(s => s.reciclador?.id === AppState.currentUser.id);

    document.getElementById('recicladorSolicitudes').textContent = misSolicitudes.length;
    document.getElementById('recicladorCompletadas').textContent = misSolicitudes.filter(s => s.status === 'completado').length;

    setRecicladorTab('disponibles');
}

function setRecicladorTab(tab) {
    document.querySelectorAll('.reciclador-tabs .tab-btn').forEach(btn => {
        btn.classList.toggle('active', 
            (tab === 'disponibles' && btn.textContent.includes('Disponibles')) ||
            (tab === 'activas' && btn.textContent.includes('Mis Recolecciones')) ||
            (tab === 'completadas' && btn.textContent.includes('Historial'))
        );
    });

    const content = document.getElementById('recicladorContent');

    if (tab === 'disponibles') {
        // Mostrar solicitudes disponibles (simuladas)
        content.innerHTML = `
            <div class="solicitud-reciclador">
                <div class="solicitud-reciclador-header">
                    <span class="solicitud-reciclador-type"><i class="fas fa-box"></i> Escombros</span>
                    <span class="solicitud-reciclador-pago">$45,000</span>
                </div>
                <div class="solicitud-reciclador-details">
                    <p><i class="fas fa-weight-hanging"></i> Volumen: Grande (6-10 bolsas)</p>
                    <p><i class="fas fa-map-marker-alt"></i> Carrera 5 # 10-20, Centro</p>
                    <p><i class="fas fa-clock"></i> Solicitado hace 10 min</p>
                    <p><i class="fas fa-road"></i> Distancia: 1.2 km</p>
                </div>
                <div class="solicitud-reciclador-actions">
                    <button class="btn btn-primary" onclick="aceptarSolicitud('123')">
                        <i class="fas fa-check"></i> Aceptar
                    </button>
                    <button class="btn btn-outline" onclick="verDetalleSolicitud('123')">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                </div>
            </div>
            <div class="solicitud-reciclador">
                <div class="solicitud-reciclador-header">
                    <span class="solicitud-reciclador-type"><i class="fas fa-box"></i> Muebles</span>
                    <span class="solicitud-reciclador-pago">$30,000</span>
                </div>
                <div class="solicitud-reciclador-details">
                    <p><i class="fas fa-weight-hanging"></i> Volumen: Mediano (2-5 bolsas)</p>
                    <p><i class="fas fa-map-marker-alt"></i> Calle 15 # 8-30, San Martín</p>
                    <p><i class="fas fa-clock"></i> Solicitado hace 25 min</p>
                    <p><i class="fas fa-road"></i> Distancia: 2.5 km</p>
                </div>
                <div class="solicitud-reciclador-actions">
                    <button class="btn btn-primary" onclick="aceptarSolicitud('124')">
                        <i class="fas fa-check"></i> Aceptar
                    </button>
                    <button class="btn btn-outline" onclick="verDetalleSolicitud('124')">
                        <i class="fas fa-eye"></i> Ver Detalle
                    </button>
                </div>
            </div>
        `;
    } else if (tab === 'activas') {
        content.innerHTML = `
            <div class="solicitud-reciclador">
                <div class="solicitud-reciclador-header">
                    <span class="solicitud-reciclador-type"><i class="fas fa-box"></i> Restos de construcción</span>
                    <span class="solicitud-reciclador-pago">$60,000</span>
                </div>
                <div class="solicitud-reciclador-details">
                    <p><i class="fas fa-map-marker-alt"></i> Avenida 26 # 3-10, Prado Norte</p>
                    <p><i class="fas fa-clock"></i> ETA: 8 min</p>
                    <p><i class="fas fa-user"></i> Cliente: María González</p>
                </div>
                <div class="solicitud-reciclador-actions">
                    <button class="btn btn-success" onclick="completarSolicitud('125')">
                        <i class="fas fa-check-circle"></i> Completar
                    </button>
                    <button class="btn btn-outline" onclick="contactarCliente('125')">
                        <i class="fas fa-phone"></i> Contactar
                    </button>
                </div>
            </div>
        `;
    } else {
        content.innerHTML = `
            <div class="solicitud-reciclador">
                <div class="solicitud-reciclador-header">
                    <span class="solicitud-reciclador-type"><i class="fas fa-box"></i> Escombros</span>
                    <span class="solicitud-reciclador-pago">$45,000</span>
                </div>
                <div class="solicitud-reciclador-details">
                    <p><i class="fas fa-map-marker-alt"></i> Carrera 8 # 12-30</p>
                    <p><i class="fas fa-check-circle"></i> Completado el 28/04/2026</p>
                    <p><i class="fas fa-star"></i> Calificación: 5.0</p>
                </div>
            </div>
        `;
    }
}

function aceptarSolicitud(id) {
    showToast('Solicitud aceptada. Dirígete al punto de recolección.', 'success');
    setRecicladorTab('activas');
}

function completarSolicitud(id) {
    showToast('Recolección completada. ¡Gracias!', 'success');
    setRecicladorTab('completadas');
}

function handleAplicarReciclador(e) {
    e.preventDefault();

    const fotoInput = document.getElementById('recicladorFoto');
    if (!fotoInput.files[0]) {
        showToast('La foto de perfil es obligatoria', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
        AppState.currentUser.isReciclador = true;
        AppState.currentUser.recicladorInfo = {
            nombre: document.getElementById('recicladorNombre').value,
            telefono: document.getElementById('recicladorTelefono').value,
            foto: ev.target.result,
            vehiculo: document.getElementById('recicladorVehiculo').value,
            zona: document.getElementById('recicladorZona').value
        };

        const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
        const idx = users.findIndex(u => u.id === AppState.currentUser.id);
        if (idx >= 0) {
            users[idx] = AppState.currentUser;
            localStorage.setItem('trankas_users', JSON.stringify(users));
        }
        localStorage.setItem('trankas_session', JSON.stringify(AppState.currentUser));

        showToast('¡Solicitud enviada! Pronto te contactaremos.', 'success');
        updateUserUI();
        navigateTo('reciclador');
    };
    reader.readAsDataURL(fotoInput.files[0]);
}

function previewRecicladorFoto(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('recicladorFotoPreview').src = e.target.result;
        document.getElementById('recicladorFotoPreview').classList.remove('hidden');
        document.getElementById('recicladorUploadPlaceholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

// ===== FAB =====
function initFab() {
    // Cerrar FAB al hacer click fuera
    document.addEventListener('click', (e) => {
        const fab = document.getElementById('fabContainer');
        if (!fab.contains(e.target)) {
            document.getElementById('fabActions').classList.remove('active');
            document.getElementById('fabMain').classList.remove('active');
        }
    });
}

function toggleFab() {
    const actions = document.getElementById('fabActions');
    const main = document.getElementById('fabMain');
    actions.classList.toggle('active');
    main.classList.toggle('active');
}

function fabAction(action) {
    if (action === 'asistente') {
        navigateTo('asistente');
    } else if (action === 'alerta') {
        document.getElementById('alertaModal').classList.add('active');
    }
    toggleFab();
}

// ===== ALERTA RÁPIDA =====
function closeAlertaModal() {
    document.getElementById('alertaModal').classList.remove('active');
}

function previewAlertaImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('alertaImagePreview').src = e.target.result;
        document.getElementById('alertaImagePreview').classList.remove('hidden');
        document.getElementById('alertaUploadPlaceholder').classList.add('hidden');
    };
    reader.readAsDataURL(file);
}

function useCurrentLocationForAlerta() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                document.getElementById('alertaUbicacion').value = 
                    `Lat: ${pos.coords.latitude.toFixed(6)}, Lng: ${pos.coords.longitude.toFixed(6)}`;
                showToast('Ubicación obtenida', 'success');
            },
            () => showToast('No se pudo obtener ubicación', 'warning')
        );
    }
}

function handleAlertaRapida(e) {
    e.preventDefault();

    const alerta = {
        id: Date.now(),
        userId: AppState.currentUser.id,
        categoria: document.getElementById('alertaCategoria').value,
        descripcion: document.getElementById('alertaDescripcion').value,
        imagen: document.getElementById('alertaImagePreview').src || null,
        ubicacion: document.getElementById('alertaUbicacion').value,
        lat: null,
        lng: null,
        fecha: new Date().toISOString(),
        votosSi: 1,
        votosNo: 0,
        miVoto: 'si',
        resuelta: false
    };

    AppState.alertas.unshift(alerta);
    localStorage.setItem('trankas_alertas', JSON.stringify(AppState.alertas));

    // Actualizar contador
    const alertasUser = AppState.alertas.filter(a => a.userId === AppState.currentUser.id);
    document.getElementById('alertCount').textContent = alertasUser.length;

    showToast('Alerta enviada a la comunidad', 'success');
    closeAlertaModal();
    e.target.reset();

    // Reset image
    document.getElementById('alertaImagePreview').classList.add('hidden');
    document.getElementById('alertaUploadPlaceholder').classList.remove('hidden');

    // Si estamos en alertas, recargar
    if (AppState.currentSection === 'alertas') {
        renderAlertas('todas');
    }
}

// ===== LOGOUT =====
function logout() {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('trankas_session');
        AppState.currentUser = null;
        AppState.isLoggedIn = false;
        window.location.href = 'index.html';
    }
}

// ===== TOAST =====
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };

    toast.innerHTML = `<i class="fas ${icons[type]}"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function showLoading(show) {
    document.getElementById('loadingOverlay').classList.toggle('active', show);
}

// ===== MAPS INIT =====
function initMaps() {
    // Callback para Google Maps API
    // Se llama automáticamente cuando el script carga
}

// ===== SIDEBAR INIT =====
function initSidebar() {
    // Marcar sección activa
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                toggleSidebar();
            }
        });
    });
}

// Cerrar dropdowns al hacer click fuera
document.addEventListener('click', (e) => {
    const userMenu = document.getElementById('userMenu');
    const notificationsPanel = document.getElementById('notificationsPanel');
    const alertaModal = document.getElementById('alertaModal');

    if (!userMenu.contains(e.target)) {
        document.getElementById('userDropdown').classList.remove('active');
    }

    if (!e.target.closest('.nav-icon-btn') && !notificationsPanel.contains(e.target)) {
        notificationsPanel.classList.remove('active');
    }

    if (e.target === alertaModal) {
        closeAlertaModal();
    }
});
