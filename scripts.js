// ===== STATE =====
const AppState = {
    currentUser: null,
    isLoggedIn: false,
    setupMap: null,
    setupMarker: null,
    tempUser: null,
    verificationCode: null,
    // Datos reales de barrios por comuna según el documento
    barriosPorComuna: {
        '1': ['Santa Inés', 'Cándido Leguízamo', 'Las Mercedes', 'Las Ferias', 'Chícalá', 'Minuto de Dios Norte', 'La Inmaculada', 'Villa del Río', 'Rodrigo Lara Bonilla', 'Conjunto La Magdalena', 'Acrópolis', 'Los Elisios', 'California', 'Media Luna', 'San Nicolás', 'Los Andaquíes', 'Los Dujos', 'San Silvestre', 'Carlos Pizarro', 'El Triángulo', 'José Martí', 'Pigoanza', 'Madrigal', 'Conarvar', 'Colmenar', 'Villa Magdalena Norte', 'La Fortaleza', 'Bajo Chicalá', 'Mansiones del Norte', 'Ciudadela Carlos Pizarro', 'Ciudadela Comfamiliar', 'Torres de la Camila', 'Portal de San Felipe', 'Balcones de la Riviera', 'Riviera I', 'Riviera II', 'Portales de Varanta', 'Minuto de Dios', 'La Vorágine'],
        '2': ['Aeropuerto', 'Alvaro Sánchez Silva', 'Santa Lucía', 'Santa Clara', 'Los Cámbaros', 'Los Molinos', 'Las Granjas', 'Bosques de Tamarindo', 'Santa Mónica', 'El Prado', 'Los Pinos', 'Alamos Norte', 'El Cortijo', 'Municipal', 'Villa Cecilia', 'Los Andes', 'Villa Milena', 'Gualanday', 'Villa Aurora', 'Villa Urbe', 'Versalles', 'Santa Ana', 'Conjunto Camino Real', 'Conjunto Málaga', 'Portal de la Calleja', 'El Rosal', 'Las Villas', 'Villa del Prado', 'Villa Flor', 'Villa Esmeralda', 'Torres de Varegal', 'Cataluña', 'San Diego'],
        '3': ['El Lago', 'Caracolí', 'San Vicente de Paúl', 'La Cordialidad', 'Guillermo Plazas Alcid', 'Reinaldo Matiz Trujillo', 'Rojas Trujillo', 'Las Delicias', 'Sevilla', 'Las Ceibas', 'Quirinal', 'José Eustasio Rivera', 'Tenerife', 'Campo Núñez', 'La Torna', 'Chapinero', 'Santa Librada', 'Los Samanes', 'Villa Patricia', 'La Estrella', 'Las Ceibitas', 'Conjunto Brisas del Magdalena', 'Los Profesionales', 'Alcalá'],
        '4': ['Bonilla', 'Los Martires', 'El Centro', 'San Pedro', 'Los Almendros', 'El Estadio', 'Altico', 'Modelo', 'San José', 'Diego de Ospina', 'La Unión'],
        '5': ['Primero de Mayo', 'La Libertad', 'Loma de La Cruz', 'La Colina', 'Kennedy', 'Monserrate', 'Siete de Agosto', 'San Antonio', 'La Independencia', 'El Jardín', 'Buganviles', 'La Orquídea', 'Los Guaduales', 'Jordán', 'Faro', 'Veinte de Julio', 'Rosa', 'Independencia Baja', 'El Vergel', 'Brisas del Avichente', 'Los Laureles', 'Sector La Colina', 'Alto Llano', 'Villa Café', 'Altos de la Ferreira', 'Villa Regina', 'Alta Vista', 'Conjunto Altos de Tivoli', 'Conjunto Aragonés'],
        '6': ['Minuto de Dios', 'Miramar', 'Andalucía', 'Alto del Limonar', 'Emayá', 'Santa Isabel', 'La Esperanza', 'Bogotá', 'Buenos Aires', 'Sinaí', 'José Antonio Galán', 'Los Nazarenos', 'Pozo Azul', 'Loma Linda', 'Arismendi Mora', 'Timanco', 'Bella Vista', 'El Limonar', 'Villa Inés', 'Los Caobos', 'Manzanares', 'San Francisco de Asís', 'Tuquíla', 'Las Lajas', 'El Bosque', 'Sector Santa Isabel', 'Sector Galán', 'Sector Bogotá', 'Canaíma', 'Conjunto Multifamiliar Los Arrayanes'],
        '7': ['Las Brisas', 'Casa Loma', 'La Floresta', 'Ipanema', 'Casa de Campo', 'Altamíra', 'Prado Alto', 'Casa Blanca', 'La Gaitana', 'Calixto Leyva', 'Buena Vista', 'Jorge Eliécer Gaitán', 'Obrero', 'Ventilador', 'San Martín', 'la Juventud', 'Conjunto Punta del Este', 'Villa Milena', 'Santa Faula', 'Altos de Manzanillo', 'Gaitana Dos', 'Conjunto Portal del Campo', 'Paseo La Castellana', 'Conjunto Torres de Bizancio', 'Antigua', 'Santorini', 'Caminos de Oriente', 'Altos de la Pradera'],
        '8': ['La Isla', 'Las Américas', 'Alfonso López', 'Las Acacias', 'Nueva Granada', 'Los Parques', 'Guillermo Liévano', 'La Florida', 'Surorientales', 'Los Alpes', 'Rafael Azuero', 'Lachola', 'La Paz', 'Simón Bolívar', 'Los Arrayanes', 'Rafael Uribe Uribe', 'Panorama', 'San Carlos', 'Villa Amarilla', 'La Cristalina', 'Bajo Pedregal', 'El Peñón', 'El Caracol', 'El Porvenir', 'La Esperanza', 'Las Rocas', 'Divino Niño', 'Siete de Agosto', 'Peñón Redondo', 'Bajo Américas', 'El Dorado', 'La Cabuya', 'Buenos Aires', 'La Chamiza', 'La Provincia'],
        '9': ['Trínidad', 'Alberto Galindo', 'José María Carbonell', 'Luis Ignacio Andrade', 'Eduardo Santos', 'Villa Magdalena', 'La Riviera', 'Luis Eduardo Vanegas', 'Luis Carlos Galán', 'Santa Rosa', 'Carbonell 11', 'Los Libertadores', 'Minuto de Dios VI etapa', 'Vicente Araújo', 'Villa Nazaret', 'El Progreso', 'Virgilio Barco', 'Villa Marcela', 'Villa Esmeralda', 'Calamari', 'Villa Colombia', 'Alvaro Leyva Liévano', 'Sector Galindo'],
        '10': ['La Rioja', 'Once de Noviembre', 'Misael Pastrana Borrero', 'Los Comuneros', 'Triunfo', 'Las Camelias', 'Palmas I', 'Palmas II', 'Palmas III', 'El Pedregal', 'Santander', 'Enrique Olaya Herrera', 'Alberto Yepes', 'Katakandrú', 'Sector Barreiro', 'Nuevo Horizonte', 'Pablo Sexto', 'Victor Félix Díaz', 'Villa Nadia', 'San Bernardo del Viento', 'Oro Negro', 'La Victoria', 'Palmitas II', 'La Pradera', 'Granja San Bernardo', 'Villa Aranzazu', 'Folicarpo', 'Calle Real', 'El Paraíso', 'Los Machines', 'Los Rosales', 'Los Colores', 'El Oasis', 'Antonio Nariño', 'La Pradera']
    },
    // Horarios según datos oficiales de Recicla/Neiva
    horariosPorComuna: {
        '1': { dia: 'Lunes', horario: '7AM - 12PM', jornada: 'diurna', zona: 'Norte' },
        '2': { dia: 'Miércoles', horario: '7AM - 12PM', jornada: 'diurna', zona: 'Centro Occidente' },
        '3': { dia: 'Martes', horario: '7AM - 12PM', jornada: 'diurna', zona: 'Entre Ríos' },
        '4': { dia: 'Jueves', horario: '2PM - 6PM', jornada: 'diurna', zona: 'Central' },
        '5': { dia: 'Viernes', horario: '7AM - 12PM', jornada: 'diurna', zona: 'Oriental' },
        '6': { dia: 'Viernes', horario: '2PM - 6PM', jornada: 'diurna', zona: 'Sur' },
        '7': { dia: 'Sábado', horario: '7AM - 3PM', jornada: 'diurna', zona: 'Centro Oriente' },
        '8': { dia: 'Lunes', horario: '2PM - 6PM', jornada: 'diurna', zona: 'Sur Oriental' },
        '9': { dia: 'Martes', horario: '2PM - 6PM', jornada: 'diurna', zona: 'Norte' },
        '10': { dia: 'Miércoles', horario: '2PM - 6PM', jornada: 'diurna', zona: 'Oriente Alto' }
    },
    // Mapeo inverso: barrio -> comuna
    barrioAComuna: {}
};

// Construir mapeo barrio -> comuna
Object.keys(AppState.barriosPorComuna).forEach(comuna => {
    AppState.barriosPorComuna[comuna].forEach(barrio => {
        AppState.barrioAComuna[barrio.toLowerCase().trim()] = comuna;
    });
});

// ===== THEME MANAGEMENT =====
function initTheme() {
    const savedTheme = localStorage.getItem('trankas_theme') || 'auto';
    document.getElementById('themeSelector').value = savedTheme;
    applyTheme(savedTheme);
}

function changeTheme(theme) {
    localStorage.setItem('trankas_theme', theme);
    applyTheme(theme);
}

function applyTheme(theme) {
    const root = document.documentElement;
    root.removeAttribute('data-theme');
    
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
        root.setAttribute('data-theme', 'light');
    }
    // 'auto' no pone atributo, usa media query del CSS
}

// ===== INIT =====
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initParticles();
    initNavbarScroll();
    initVerificationInputs();
    initBarriosDatalist();
    checkSession();
});

// ===== BARRIOS DATALIST =====
function initBarriosDatalist() {
    const datalist = document.getElementById('barriosList');
    if (!datalist) return;
    
    const allBarrios = [];
    Object.keys(AppState.barriosPorComuna).forEach(comuna => {
        AppState.barriosPorComuna[comuna].forEach(barrio => {
            allBarrios.push(barrio);
        });
    });
    
    allBarrios.sort().forEach(barrio => {
        const option = document.createElement('option');
        option.value = barrio;
        datalist.appendChild(option);
    });
}

function buscarBarrio(valor) {
    const comunaInput = document.getElementById('setupComuna');
    const scheduleInfo = document.getElementById('scheduleInfo');
    
    if (!valor) {
        comunaInput.value = '';
        scheduleInfo.innerHTML = '<p>Selecciona tu barrio para ver el horario</p>';
        return;
    }
    
    // Buscar comuna por barrio
    const barrioLower = valor.toLowerCase().trim();
    let comunaFound = null;
    
    // Búsqueda exacta primero
    if (AppState.barrioAComuna[barrioLower]) {
        comunaFound = AppState.barrioAComuna[barrioLower];
    } else {
        // Búsqueda parcial
        for (const [barrio, comuna] of Object.entries(AppState.barrioAComuna)) {
            if (barrio.includes(barrioLower) || barrioLower.includes(barrio)) {
                comunaFound = comuna;
                break;
            }
        }
    }
    
    if (comunaFound) {
        comunaInput.value = `Comuna ${comunaFound} - ${AppState.horariosPorComuna[comunaFound].zona}`;
        mostrarHorario(comunaFound);
    } else {
        comunaInput.value = '';
        scheduleInfo.innerHTML = '<p>Barrio no encontrado. Verifica la ortografía o selecciona de la lista.</p>';
    }
}

function mostrarHorario(comuna) {
    const horario = AppState.horariosPorComuna[comuna];
    const scheduleInfo = document.getElementById('scheduleInfo');
    
    if (horario) {
        scheduleInfo.innerHTML = `
            <div class="schedule-highlight">
                <i class="fas fa-truck"></i>
                <div>
                    <div class="day">${horario.dia}</div>
                    <div class="time">${horario.horario}</div>
                    <div style="color:var(--text-muted);font-size:0.85rem;">Zona: ${horario.zona} | Jornada: ${horario.jornada}</div>
                </div>
            </div>
        `;
    }
}

// ===== PARTICLES =====
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (15 + Math.random() * 15) + 's';
        particle.style.width = (2 + Math.random() * 3) + 'px';
        particle.style.height = particle.style.width;
        container.appendChild(particle);
    }
}

// ===== NAVBAR =====
function initNavbarScroll() {
    const navbar = document.getElementById('navbarLanding');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('active');
}

function scrollToSection(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// ===== AUTH MODALS =====
function showAuth(type) {
    const overlay = document.getElementById('authOverlay');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');
    const verifyForm = document.getElementById('verifyForm');
    
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    [loginForm, registerForm, forgotForm, verifyForm].forEach(f => f.classList.add('hidden'));
    
    if (type === 'login') loginForm.classList.remove('hidden');
    else if (type === 'register') registerForm.classList.remove('hidden');
    else if (type === 'forgot') forgotForm.classList.remove('hidden');
    else if (type === 'verify') verifyForm.classList.remove('hidden');
}

function closeAuth() {
    const overlay = document.getElementById('authOverlay');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

function switchAuth(type) {
    showAuth(type);
}

// ===== PASSWORD TOGGLE =====
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.parentElement.querySelector('.toggle-password i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ===== LOGIN =====
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    showLoading(true);
    
    setTimeout(() => {
        const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            AppState.currentUser = user;
            AppState.isLoggedIn = true;
            localStorage.setItem('trankas_session', JSON.stringify(user));
            showToast('¡Bienvenido de vuelta, ' + getFirstName(user.name) + '!', 'success');
            closeAuth();
            redirectToDashboard();
        } else {
            showToast('Correo o contraseña incorrectos', 'error');
        }
        showLoading(false);
    }, 1000);
}

// ===== REGISTER =====
function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone').value;
    const gender = document.getElementById('regGender').value;
    
    const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
    if (users.find(u => u.email === email)) {
        showToast('Este correo ya está registrado', 'error');
        return;
    }
    
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    AppState.verificationCode = code;
    AppState.tempUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        phone: phone || null,
        gender: gender || null,
        authProvider: 'email',
        createdAt: new Date().toISOString(),
        isReciclador: false,
        location: null
    };
    
    // Simular envío de correo (en producción usar backend)
    console.log('Código de verificación para ' + email + ': ' + code);
    
    showAuth('verify');
    document.getElementById('verifyEmail').textContent = email;
    showToast('Código de verificación enviado a ' + email, 'info');
    
    // Mostrar código en desarrollo
    setTimeout(() => {
        showToast('Código de desarrollo: ' + code, 'warning');
    }, 500);
}

// ===== EMAIL VERIFICATION =====
function sendVerificationEmail(email, name, code) {
    // En producción, esto iría al backend
    // Por ahora, usamos localStorage para simular
    console.log('Código de verificación para ' + email + ': ' + code);
}

function initVerificationInputs() {
    const inputs = document.querySelectorAll('.code-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                inputs[index - 1].focus();
            }
        });
        
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasteData = e.clipboardData.getData('text').slice(0, 6);
            pasteData.split('').forEach((char, i) => {
                if (inputs[i]) inputs[i].value = char;
            });
            if (inputs[pasteData.length - 1]) {
                inputs[pasteData.length - 1].focus();
            }
        });
    });
}

function handleVerification() {
    const inputs = document.querySelectorAll('.code-input');
    const enteredCode = Array.from(inputs).map(i => i.value).join('');
    
    if (enteredCode === AppState.verificationCode) {
        const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
        users.push(AppState.tempUser);
        localStorage.setItem('trankas_users', JSON.stringify(users));
        
        AppState.currentUser = AppState.tempUser;
        AppState.isLoggedIn = true;
        localStorage.setItem('trankas_session', JSON.stringify(AppState.tempUser));
        
        showToast('¡Cuenta verificada correctamente!', 'success');
        closeAuth();
        showSetupLocation();
    } else {
        showToast('Código incorrecto. Inténtalo de nuevo.', 'error');
    }
}

function resendCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    AppState.verificationCode = code;
    sendVerificationEmail(AppState.tempUser.email, AppState.tempUser.name, code);
    showToast('Nuevo código enviado', 'info');
    setTimeout(() => {
        showToast('Código de desarrollo: ' + code, 'warning');
    }, 500);
}

// ===== FORGOT PASSWORD =====
function showForgotPassword() {
    showAuth('forgot');
}

function handleForgotPassword(e) {
    e.preventDefault();
    const email = document.getElementById('forgotEmail').value;
    
    const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
    const user = users.find(u => u.email === email);
    
    if (user) {
        const resetToken = Math.random().toString(36).substring(2, 15);
        user.resetToken = resetToken;
        user.resetExpires = Date.now() + 3600000;
        localStorage.setItem('trankas_users', JSON.stringify(users));
        
        showToast('Instrucciones enviadas a ' + email, 'success');
        switchAuth('login');
    } else {
        showToast('No existe una cuenta con ese correo', 'error');
    }
}

// ===== SOCIAL LOGIN =====
function handleSocialLogin(provider, isRegister = false) {
    showLoading(true);
    
    setTimeout(() => {
        const mockEmail = provider === 'google' ? 'usuario@gmail.com' : 'usuario@icloud.com';
        const mockName = provider === 'google' ? 'Usuario Google' : 'Usuario Apple';
        
        let user = {
            id: Date.now().toString(),
            name: mockName,
            email: mockEmail,
            password: null,
            phone: null,
            gender: null,
            authProvider: provider,
            createdAt: new Date().toISOString(),
            isReciclador: false,
            location: null
        };
        
        const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
        const existingUser = users.find(u => u.email === mockEmail);
        
        if (existingUser) {
            user = existingUser;
        } else {
            users.push(user);
            localStorage.setItem('trankas_users', JSON.stringify(users));
        }
        
        AppState.currentUser = user;
        AppState.isLoggedIn = true;
        localStorage.setItem('trankas_session', JSON.stringify(user));
        
        showToast('Ingresaste con ' + provider, 'success');
        closeAuth();
        
        if (!user.location) {
            showSetupLocation();
        } else {
            redirectToDashboard();
        }
        
        showLoading(false);
    }, 1500);
}

// ===== SETUP LOCATION =====
function showSetupLocation() {
    const overlay = document.getElementById('setupOverlay');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    setTimeout(() => {
        initSetupMap();
    }, 100);
}

function initSetupMap() {
    // Coordenadas de Neiva, Huila
    const neiva = [2.9376, -75.2720];
    
    const mapDiv = document.getElementById('setupMap');
    if (!mapDiv || typeof L === 'undefined') {
        mapDiv.innerHTML = `
            <div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;background:var(--bg-secondary);flex-direction:column;gap:12px;">
                <i class="fas fa-map-marked-alt" style="font-size:3rem;color:var(--primary);"></i>
                <p style="color:var(--text-muted);">Mapa de Neiva</p>
                <button class="btn btn-primary" onclick="getCurrentLocation()">
                    <i class="fas fa-crosshairs"></i> Usar mi ubicación
                </button>
            </div>
        `;
        return;
    }
    
    AppState.setupMap = L.map('setupMap').setView(neiva, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(AppState.setupMap);
    
    // Marcador personalizado verde
    const greenIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background:#2d7a46;width:30px;height:30px;border-radius:50%;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><i class="fas fa-map-marker-alt" style="color:#fff;font-size:14px;"></i></div>',
        iconSize: [30, 30],
        iconAnchor: [15, 30]
    });
    
    AppState.setupMarker = L.marker(neiva, {
        draggable: true,
        icon: greenIcon
    }).addTo(AppState.setupMap);
    
    AppState.setupMarker.on('dragend', () => {
        const pos = AppState.setupMarker.getLatLng();
        reverseGeocode(pos.lat, pos.lng);
    });
    
    AppState.setupMap.on('click', (e) => {
        AppState.setupMarker.setLatLng(e.latlng);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
    });
}

function reverseGeocode(lat, lng) {
    // Usar Nominatim (OpenStreetMap) para geocodificación inversa
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
        .then(response => response.json())
        .then(data => {
            if (data.display_name) {
                document.getElementById('setupDireccion').value = data.display_name;
            }
        })
        .catch(() => {
            // Fallback
            document.getElementById('setupDireccion').value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
        });
}

function getCurrentLocation() {
    if (navigator.geolocation) {
        showLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                if (AppState.setupMap) {
                    AppState.setupMap.setView([pos.lat, pos.lng], 15);
                    AppState.setupMarker.setLatLng([pos.lat, pos.lng]);
                    reverseGeocode(pos.lat, pos.lng);
                } else {
                    document.getElementById('setupDireccion').value = 
                        `Lat: ${pos.lat.toFixed(6)}, Lng: ${pos.lng.toFixed(6)}`;
                    showToast('Ubicación obtenida', 'success');
                }
                showLoading(false);
            },
            (error) => {
                showToast('No se pudo obtener la ubicación. Por favor ingrésala manualmente.', 'warning');
                showLoading(false);
            }
        );
    } else {
        showToast('Tu navegador no soporta geolocalización', 'error');
    }
}

function searchAddress() {
    const address = document.getElementById('setupDireccion').value;
    if (!address) {
        showToast('Ingresa una dirección primero', 'warning');
        return;
    }
    
    showLoading(true);
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', Neiva, Huila, Colombia')}&limit=1`)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const location = data[0];
                const lat = parseFloat(location.lat);
                const lon = parseFloat(location.lon);
                
                if (AppState.setupMap) {
                    AppState.setupMap.setView([lat, lon], 16);
                    AppState.setupMarker.setLatLng([lat, lon]);
                }
                document.getElementById('setupDireccion').value = location.display_name;
                showToast('Dirección encontrada', 'success');
            } else {
                showToast('No se encontró la dirección', 'error');
            }
            showLoading(false);
        })
        .catch(() => {
            showToast('Error buscando dirección', 'error');
            showLoading(false);
        });
}

function handleSetupLocation(e) {
    e.preventDefault();
    const barrio = document.getElementById('setupBarrio').value;
    const comuna = document.getElementById('setupComuna').value;
    const direccion = document.getElementById('setupDireccion').value;
    
    if (!barrio || !direccion) {
        showToast('Completa todos los campos obligatorios', 'error');
        return;
    }
    
    // Extraer número de comuna
    let comunaNum = '';
    if (comuna) {
        const match = comuna.match(/Comuna (\\d+)/);
        if (match) comunaNum = match[1];
    }
    
    // Si no se detectó comuna, buscar por barrio
    if (!comunaNum) {
        const barrioLower = barrio.toLowerCase().trim();
        for (const [b, c] of Object.entries(AppState.barrioAComuna)) {
            if (b.includes(barrioLower) || barrioLower.includes(b)) {
                comunaNum = c;
                break;
            }
        }
    }
    
    const location = {
        barrio,
        comuna: comunaNum,
        direccion,
        lat: AppState.setupMarker?.getLatLng()?.lat || null,
        lng: AppState.setupMarker?.getLatLng()?.lng || null
    };
    
    AppState.currentUser.location = location;
    
    const users = JSON.parse(localStorage.getItem('trankas_users') || '[]');
    const idx = users.findIndex(u => u.id === AppState.currentUser.id);
    if (idx >= 0) {
        users[idx].location = location;
        localStorage.setItem('trankas_users', JSON.stringify(users));
    }
    localStorage.setItem('trankas_session', JSON.stringify(AppState.currentUser));
    
    showToast('¡Ubicación guardada! Redirigiendo...', 'success');
    
    setTimeout(() => {
        document.getElementById('setupOverlay').classList.remove('active');
        document.body.style.overflow = '';
        redirectToDashboard();
    }, 1000);
}

// ===== HELPERS =====
function getFirstName(fullName) {
    return fullName?.split(' ')[0] || 'Usuario';
}

function getEmailPrefix(email) {
    return email?.split('@')[0] || 'usuario';
}

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

function checkSession() {
    const session = localStorage.getItem('trankas_session');
    if (session) {
        AppState.currentUser = JSON.parse(session);
        AppState.isLoggedIn = true;
    }
}

function redirectToDashboard() {
    window.location.href = 'usuario.html';
}

// Cerrar modales al hacer click fuera
document.addEventListener('click', (e) => {
    const authOverlay = document.getElementById('authOverlay');
    if (e.target === authOverlay) {
        closeAuth();
    }
});