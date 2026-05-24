let currentUser = null;
let currentPage = 'inicio';
let leafletMap = null;
let chatHistory = [];

async function init() {
  try {
    const res = await fetch('/api/user', { credentials: 'include' });
    if (!res.ok) { window.location.href = '/'; return; }
    currentUser = await res.json();
    renderUserUI();
    document.getElementById('loading-screen').style.display = 'none';
    if (!currentUser.onboardingDone) showOnboarding();
    else goTo('inicio');
  } catch {
    window.location.href = '/';
  }
}

function renderUserUI() {
  const initials = (currentUser.name || 'TK').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const img = currentUser.image;

  const navAvatar = document.getElementById('nav-avatar');
  navAvatar.innerHTML = img ? `<img src="${img}" alt="">` : initials;

  document.getElementById('nav-name').textContent = (currentUser.name || '').split(' ')[0];

  const sbAvatar = document.getElementById('sidebar-avatar');
  sbAvatar.innerHTML = img ? `<img src="${img}" alt="">` : initials;

  document.getElementById('sidebar-name').textContent = currentUser.name || 'Usuario';
  document.getElementById('sidebar-meta').textContent = currentUser.location?.barrio || (currentUser.isReciclador ? 'Reciclador' : 'Ciudadano');
}

function goTo(page) {
  currentPage = page;
  document.querySelectorAll('.nav-item, .bnav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  closeSidebar();
  closeDropdowns();
  const container = document.getElementById('page-container');
  container.innerHTML = '';
  const pages = { inicio, horario, mapa, asistente, reportes, solicitud, alertas, cuenta };
  if (pages[page]) pages[page](container);
}

function inicio(el) {
  const u = currentUser;
  const loc = u.location;
  const horarioInfo = loc?.comuna ? BARRIOS_DATA[loc.comuna] : null;

  let countdown = '';
  if (horarioInfo) {
    const dmap = { lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6 };
    const firstDay = horarioInfo.dias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[\s,]+/).find(d => dmap[d]);
    if (firstDay) {
      const diff = ((dmap[firstDay] - new Date().getDay()) + 7) % 7;
      countdown = diff === 0 ? '🚛 ¡Hoy es día de recolección!' : diff === 1 ? 'Mañana pasa el camión' : `Faltan ${diff} días`;
    }
  }

  el.innerHTML = `<div class="page-content">
    <h1 class="page-title">Hola, <span class="gradient-text">${(u.name||'').split(' ')[0] || 'Usuario'}</span> 👋</h1>
    <p class="page-subtitle">${new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'long'})}</p>

    ${horarioInfo ? `
    <div class="card highlight-card" style="margin-bottom:20px">
      <div>
        <div class="highlight-tag">🚛 Próxima recolección</div>
        <div class="highlight-main">${horarioInfo.dias}</div>
        <div class="highlight-sub">${horarioInfo.horario} · Zona ${horarioInfo.zona} · ${horarioInfo.nombre}</div>
      </div>
      ${countdown ? `<div class="highlight-badge">${countdown}</div>` : ''}
    </div>` : `
    <div class="card" style="padding:24px;text-align:center;margin-bottom:20px">
      <div style="font-size:2rem;margin-bottom:10px">📍</div>
      <p style="color:var(--text-3);margin-bottom:14px;font-size:.9rem">Configura tu barrio para ver el horario de recolección</p>
      <button class="btn-primary" onclick="goTo('horario')">Configurar barrio</button>
    </div>`}

    <div class="stat-grid">
      <div class="card stat-card" id="stat-reportes"><div class="stat-icon">📍</div><div class="stat-num">—</div><div class="stat-label">Reportes</div></div>
      <div class="card stat-card" id="stat-solicitudes"><div class="stat-icon">🚛</div><div class="stat-num">—</div><div class="stat-label">Solicitudes</div></div>
      <div class="card stat-card"><div class="stat-icon">🏘️</div><div class="stat-num">${loc?.barrio ? '✓' : '—'}</div><div class="stat-label">${loc?.barrio || 'Sin barrio'}</div></div>
    </div>

    <div class="section-h3" style="margin-bottom:14px">Acciones rápidas</div>
    <div class="quick-grid">
      <div class="card quick-card" onclick="goTo('mapa')" style="background:rgba(108,217,123,.06);border-color:rgba(108,217,123,.18)"><div class="quick-icon">🗺️</div><div class="quick-label">Mapa de Rutas</div></div>
      <div class="card quick-card" onclick="goTo('asistente')" style="background:rgba(142,234,160,.05);border-color:rgba(142,234,160,.15)"><div class="quick-icon">🤖</div><div class="quick-label">Asistente IA</div></div>
      <div class="card quick-card" onclick="goTo('reportes')" style="background:rgba(201,168,76,.05);border-color:rgba(201,168,76,.15)"><div class="quick-icon">📍</div><div class="quick-label">Reportar</div></div>
      <div class="card quick-card" onclick="goTo('solicitud')" style="background:rgba(52,152,219,.05);border-color:rgba(52,152,219,.15)"><div class="quick-icon">🚛</div><div class="quick-label">Recolección Especial</div></div>
    </div>

    <div class="section-h3" style="margin-bottom:14px">Zonas de recolección</div>
    <div class="card" style="padding:18px">
      ${Object.entries(ZONA_INFO).map(([z, info]) => `
        <div style="display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:9px;margin-bottom:6px;background:rgba(255,255,255,.02);border:1px solid var(--border)">
          <div style="width:12px;height:12px;border-radius:3px;background:${info.fill};flex-shrink:0"></div>
          <div style="flex:1;min-width:0">
            <div style="font-family:var(--font-d);font-weight:700;font-size:.78rem;color:var(--text-1)">Zona ${z} · Comunas ${info.comunas.join(', ')}</div>
            <div style="font-size:.74rem;color:var(--text-3)">${info.label}</div>
          </div>
        </div>`).join('')}
      <button class="btn-ghost" style="width:100%;justify-content:center;margin-top:6px;color:var(--accent)" onclick="goTo('mapa')">Ver mapa completo →</button>
    </div>
  </div>`;

  fetch('/api/reports', { credentials: 'include' }).then(r => r.json()).then(d => {
    const el = document.getElementById('stat-reportes');
    if (el) el.querySelector('.stat-num').textContent = Array.isArray(d) ? d.length : 0;
  }).catch(() => {});
  fetch('/api/solicitudes', { credentials: 'include' }).then(r => r.json()).then(d => {
    const el = document.getElementById('stat-solicitudes');
    if (el) el.querySelector('.stat-num').textContent = Array.isArray(d) ? d.length : 0;
  }).catch(() => {});
}

function horario(el) {
  el.innerHTML = `<div class="page-content">
    <h1 class="page-title">📅 Mi <span class="gradient-text">Horario</span></h1>
    <p class="page-subtitle">Consulta los días de recolección de tu barrio</p>

    ${currentUser.location?.barrio ? `
    <div class="card" style="padding:16px 20px;background:rgba(108,217,123,.05);border-color:rgba(108,217,123,.2);margin-bottom:18px;display:flex;align-items:center;gap:10px">
      <span>📍</span>
      <div>
        <div style="font-family:var(--font-d);font-weight:700;font-size:.88rem;color:var(--text-1)">${currentUser.location.barrio} · Comuna ${currentUser.location.comuna}</div>
        <div style="font-size:.75rem;color:var(--accent)">${BARRIOS_DATA[currentUser.location.comuna]?.dias} · ${BARRIOS_DATA[currentUser.location.comuna]?.horario}</div>
      </div>
    </div>` : ''}

    <div class="card" style="padding:20px;margin-bottom:16px">
      <div class="form-label">Busca tu barrio</div>
      <div class="search-wrap">
        <svg class="search-prefix" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input class="form-input search-input" id="barrio-search" placeholder="Ej: El Centro, Kennedy, Las Acacias..." autocomplete="off">
        <div class="suggestions-box" id="barrio-suggestions"></div>
      </div>
    </div>

    <div id="horario-result"></div>
  </div>`;

  const input = document.getElementById('barrio-search');
  const sugs = document.getElementById('barrio-suggestions');

  input.addEventListener('input', () => {
    const val = input.value;
    const results = searchBarrios(val);
    if (!results.length) { sugs.classList.remove('open'); return; }
    sugs.innerHTML = results.map(b => `<div class="suggest-item" onclick="selectBarrio('${b.nombre.replace(/'/g,"\\'")}','${b.comuna}')">${b.nombre} <span style="color:var(--text-4);font-size:.75rem">· Com. ${b.comuna}</span></div>`).join('');
    sugs.classList.add('open');
  });

  document.addEventListener('click', e => { if (!e.target.closest('.search-wrap')) sugs.classList.remove('open'); }, { once: false });
}

function selectBarrio(barrio, comuna) {
  document.getElementById('barrio-search').value = barrio;
  document.getElementById('barrio-suggestions').classList.remove('open');
  const info = BARRIOS_DATA[comuna];
  const today = new Date().getDay();
  const dmap = { lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6, domingo: 0 };
  const weekLabels = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const collectionDays = info.dias.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(/[\s,·\/]+/).filter(d => dmap[d] !== undefined).map(d => dmap[d]);
  const isAllWeek = info.dias.toLowerCase().includes('lunes a');

  const weekHTML = weekLabels.map((label, i) => {
    const isCollect = isAllWeek ? i >= 1 && i <= 6 : collectionDays.includes(i);
    const isToday = i === today;
    return `<div class="week-day${isToday ? ' today' : ''}">
      <div class="week-day-label">${label}</div>
      <div class="week-day-dot${isCollect ? ' collection' : ''}">${isCollect ? '🚛' : ''}</div>
    </div>`;
  }).join('');

  let diff = -1;
  const allCollect = isAllWeek ? [1,2,3,4,5,6] : collectionDays;
  if (allCollect.length) {
    const diffs = allCollect.map(d => ((d - today) + 7) % 7);
    diff = Math.min(...diffs);
  }
  const badge = diff === 0 ? '🚛 ¡Hoy es día de recolección!' : diff === 1 ? 'Mañana pasa el camión' : diff > 1 ? `Faltan ${diff} días` : '';

  const isCurrentBarrio = currentUser.location?.barrio === barrio;

  document.getElementById('horario-result').innerHTML = `
    <div class="card horario-result show" style="margin-bottom:16px">
      <div style="font-family:var(--font-d);font-weight:700;font-size:.72rem;color:var(--accent);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">${barrio} · Zona ${info.zona}</div>
      <div style="font-family:var(--font-d);font-weight:800;font-size:clamp(1.3rem,3vw,1.7rem);color:var(--text-1);margin-bottom:4px">${info.dias}</div>
      <div style="color:var(--accent-bright);font-size:.9rem;margin-bottom:8px">⏰ ${info.horario} · ${info.nombre}</div>
      ${badge ? `<div style="display:inline-block;padding:7px 16px;border-radius:var(--r-full);background:rgba(108,217,123,.15);border:1px solid rgba(108,217,123,.3);color:var(--accent-bright);font-family:var(--font-d);font-weight:700;font-size:.85rem;margin-bottom:14px">${badge}</div>` : ''}
      <div class="week-grid">${weekHTML}</div>
    </div>

    <div class="card" style="padding:18px 20px;margin-bottom:16px">
      <div class="section-h3" style="margin-bottom:12px">💡 Consejos</div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${[['⏰','Saca las bolsas 30 min antes del horario'],['♻️','Separa aprovechables del resto'],['🌿','Orgánicos en bolsa cerrada, separados'],['🔋','Pilas y electrónicos en punto de acopio']].map(([ic,tx])=>`<div style="display:flex;gap:10px;font-size:.84rem;color:var(--text-3)"><span>${ic}</span>${tx}</div>`).join('')}
      </div>
    </div>

    ${!isCurrentBarrio ? `<button class="btn-primary" style="width:100%;padding:14px" onclick="saveBarrio('${barrio.replace(/'/g,"\\'")}','${comuna}')">💾 Guardar como mi barrio</button>` : `<div style="text-align:center;padding:10px;color:var(--accent);font-size:.85rem">✓ Este es tu barrio actual</div>`}
  `;
}

async function saveBarrio(barrio, comuna) {
  try {
    const res = await fetch('/api/user', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: { barrio, comuna }, onboardingDone: true })
    });
    if (!res.ok) throw new Error();
    currentUser = await res.json();
    renderUserUI();
    toast('Barrio guardado correctamente', 'success');
    goTo('horario');
  } catch { toast('Error al guardar', 'error'); }
}

function mapa(el) {
  el.innerHTML = `<div class="page-content">
    <h1 class="page-title">🗺️ Mapa de <span class="gradient-text">Rutas y Acopio</span></h1>
    <p class="page-subtitle">Zonas de recolección y puntos de acopio en Neiva</p>

    <div class="card" style="padding:10px 14px;margin-bottom:12px;display:flex;gap:8px;align-items:center">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="form-input" id="map-search" style="flex:1;background:transparent;border:none;padding:4px 0;font-size:.9rem;box-shadow:none" placeholder="Buscar dirección o barrio..." onkeydown="if(event.key==='Enter')mapSearch()">
      <button class="btn-primary" style="padding:7px 14px;font-size:.8rem" onclick="mapSearch()">Buscar</button>
      <button class="btn-ghost" style="padding:7px;border-radius:8px" onclick="geolocate()" title="Mi ubicación">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4"/></svg>
      </button>
    </div>

    <div style="display:flex;gap:14px;flex-wrap:wrap">
      <div style="flex:1;min-width:280px">
        <div class="map-wrap"><div id="map"></div></div>
      </div>
      <div style="flex:0 0 230px;display:flex;flex-direction:column;gap:10px">
        <div class="card" style="padding:14px">
          <div class="section-h3" style="margin-bottom:10px">Zonas de Recolección</div>
          ${Object.entries(ZONA_INFO).map(([z, info]) => `
            <div style="display:flex;align-items:flex-start;gap:9px;padding:8px 9px;border-radius:9px;cursor:pointer;transition:background .15s;margin-bottom:4px" onclick="zoomZona('${z}')" onmouseover="this.style.background='rgba(108,217,123,.06)'" onmouseout="this.style.background='transparent'">
              <div style="width:13px;height:13px;border-radius:3px;background:${info.fill};border:2px solid ${info.border};flex-shrink:0;margin-top:2px"></div>
              <div>
                <div style="font-family:var(--font-d);font-weight:700;font-size:.78rem;color:var(--text-1)">Zona ${z} · Com. ${info.comunas.join(',')}</div>
                <div style="font-size:.71rem;color:var(--text-3);margin-top:1px">${info.label}</div>
              </div>
            </div>`).join('')}
        </div>
        <div class="card" style="padding:14px">
          <div class="section-h3" style="margin-bottom:10px">Puntos de Acopio ♻️</div>
          ${PUNTOS_ACOPIO.map(p => `
            <div style="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-bottom:1px solid var(--border);cursor:pointer" onclick="flyToPunto(${p.lat},${p.lng},'${p.nombre}')">
              <span style="font-size:1.1rem">♻️</span>
              <div>
                <div style="font-family:var(--font-d);font-weight:700;font-size:.8rem;color:var(--text-1)">${p.nombre}</div>
                <div style="font-size:.72rem;color:var(--text-3)">${p.tipos.join(', ')}</div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;

  setTimeout(() => initMap(), 100);
}

function initMap() {
  if (leafletMap) { leafletMap.remove(); leafletMap = null; }
  leafletMap = L.map('map', { center: [2.9376, -75.2818], zoom: 13 });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(leafletMap);

  Object.entries(ZONA_POLYGONS).forEach(([zona, coords]) => {
    const info = ZONA_INFO[zona];
    const poly = L.polygon(coords, { color: info.border, fillColor: info.fill, fillOpacity: .22, weight: 1.5 }).addTo(leafletMap);
    const center = poly.getBounds().getCenter();
    L.marker(center, { icon: L.divIcon({ html: `<div style="background:rgba(6,14,7,.88);border:1px solid ${info.border};color:#e8f5e9;padding:3px 7px;border-radius:5px;font-size:10px;font-weight:700;white-space:nowrap">Zona ${zona}</div>`, className: '', iconAnchor: [28, 10] }) }).addTo(leafletMap);
    poly.on('mouseover', function() { this.setStyle({ fillOpacity: .38 }); });
    poly.on('mouseout', function() { this.setStyle({ fillOpacity: .22 }); });
    poly.bindPopup(`<strong>Zona ${zona}</strong><br><span style="color:var(--accent);font-size:.8rem">${info.label}</span><br><small style="color:#a5c8a8">Comunas ${info.comunas.join(', ')}</small>`);
  });

  const ecoIcon = L.divIcon({ html: `<div style="width:30px;height:30px;background:linear-gradient(135deg,#6cd97b,#44874d);border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid rgba(142,234,160,.7);box-shadow:0 0 12px rgba(108,217,123,.5);font-size:14px">♻️</div>`, className: '', iconSize: [30, 30], iconAnchor: [15, 15] });

  PUNTOS_ACOPIO.forEach(p => {
    L.marker([p.lat, p.lng], { icon: ecoIcon }).addTo(leafletMap)
      .bindPopup(`<strong style="color:#e8f5e9">${p.nombre}</strong><br><span style="color:#a5c8a8;font-size:.8rem">${p.direccion}</span><br><small style="color:var(--accent)">${p.tipos.join(', ')}</small>`);
  });

  if (currentUser?.location?.lat && currentUser.location.lng) {
    const userIcon = L.divIcon({ html: `<div style="width:20px;height:20px;background:#6cd97b;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 4px rgba(108,217,123,.3)"></div>`, className: '', iconSize: [20, 20], iconAnchor: [10, 10] });
    L.marker([currentUser.location.lat, currentUser.location.lng], { icon: userIcon }).addTo(leafletMap).bindPopup(`Tu ubicación`);
  }
}

function zoomZona(zona) {
  if (!leafletMap) return;
  const coords = ZONA_POLYGONS[zona];
  if (!coords) return;
  const bounds = L.latLngBounds(coords);
  leafletMap.fitBounds(bounds, { padding: [30, 30] });
}

function flyToPunto(lat, lng, nombre) {
  if (!leafletMap) return;
  leafletMap.flyTo([lat, lng], 17, { duration: 1 });
}

function mapSearch() {
  const q = document.getElementById('map-search')?.value?.trim();
  if (!q) return;
  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ', Neiva, Huila, Colombia')}&limit=1`)
    .then(r => r.json())
    .then(data => {
      if (data.length && leafletMap) leafletMap.setView([parseFloat(data[0].lat), parseFloat(data[0].lon)], 16);
    }).catch(() => {});
}

function geolocate() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(pos => {
    if (leafletMap) leafletMap.setView([pos.coords.latitude, pos.coords.longitude], 16);
  });
}

function asistente(el) {
  chatHistory = [{ role: 'assistant', content: '¡Hola! Soy el asistente de Trankas 🌿 Puedo clasificar residuos, darte consejos de reciclaje y orientarte sobre horarios de recolección en Neiva. ¿En qué te ayudo?' }];
  el.innerHTML = `<div class="page-content" style="display:flex;flex-direction:column;height:calc(100dvh - 90px)">
    <h1 class="page-title">🤖 Asistente <span class="gradient-text">IA</span></h1>
    <p class="page-subtitle" style="margin-bottom:12px">Powered by Groq · Llama 3.3</p>

    <div class="card" style="flex:1;min-height:0;display:flex;flex-direction:column;padding:16px;overflow:hidden">
      <div class="chat-messages" id="chat-msgs">
        <div class="chat-msg">
          <div class="chat-avatar ai">🤖</div>
          <div class="bubble-ai">¡Hola! Soy el asistente de Trankas 🌿 Puedo clasificar residuos, darte consejos de reciclaje y orientarte sobre horarios de recolección en Neiva. ¿En qué te ayudo?</div>
        </div>
      </div>
      <div class="suggestions-chips" id="chat-chips">
        ${['¿Qué hago con pilas usadas?','¿Cómo reciclo plástico PET?','¿Dónde llevo chatarra?','¿El aceite se puede reciclar?'].map(s => `<div class="chip" onclick="sendChat('${s}')">${s}</div>`).join('')}
      </div>
      <div class="chat-input-wrap">
        <textarea id="chat-input" placeholder="Pregunta sobre cualquier residuo..." rows="1" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();sendChat()}" oninput="this.style.height='auto';this.style.height=Math.min(this.scrollHeight,110)+'px'"></textarea>
        <button class="chat-send-btn" id="chat-send" onclick="sendChat()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </div>
    </div>
  </div>`;
}

async function sendChat(text) {
  const input = document.getElementById('chat-input');
  const msg = (text || input?.value || '').trim();
  if (!msg) return;
  if (input) { input.value = ''; input.style.height = 'auto'; }
  document.getElementById('chat-chips')?.remove();

  const msgs = document.getElementById('chat-msgs');
  msgs.innerHTML += `<div class="chat-msg user"><div class="chat-avatar me">👤</div><div class="bubble-user">${msg}</div></div>`;

  const typingId = 'typing-' + Date.now();
  msgs.innerHTML += `<div class="chat-msg" id="${typingId}"><div class="chat-avatar ai">🤖</div><div class="bubble-ai"><div class="chat-typing">${[0,1,2].map(i=>`<div class="typing-dot" style="animation-delay:${i*.2}s"></div>`).join('')}</div></div></div>`;
  msgs.scrollTop = msgs.scrollHeight;

  chatHistory.push({ role: 'user', content: msg });
  document.getElementById('chat-send').disabled = true;

  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: msg, history: chatHistory.slice(-10) })
    });
    const data = await res.json();
    const reply = data.response || 'Error al responder.';
    chatHistory.push({ role: 'assistant', content: reply });
    document.getElementById(typingId)?.remove();
    msgs.innerHTML += `<div class="chat-msg"><div class="chat-avatar ai">🤖</div><div class="bubble-ai">${reply}</div></div>`;
  } catch {
    document.getElementById(typingId)?.remove();
    msgs.innerHTML += `<div class="chat-msg"><div class="chat-avatar ai">🤖</div><div class="bubble-ai">Error de conexión. Intenta de nuevo.</div></div>`;
  }
  document.getElementById('chat-send').disabled = false;
  msgs.scrollTop = msgs.scrollHeight;
}

function reportes(el) {
  el.innerHTML = `<div class="page-content">
    <h1 class="page-title">📍 Reportar <span class="gradient-text">Problema</span></h1>
    <p class="page-subtitle">Reporta acumulaciones, basureros o fallas</p>
    <div class="tabs">
      <button class="tab active" onclick="reportTab(this,'tab-nuevo')">➕ Nuevo Reporte</button>
      <button class="tab" onclick="reportTab(this,'tab-historial')">📋 Mis Reportes</button>
    </div>
    <div id="tab-nuevo">${reporteNuevoHTML()}</div>
    <div id="tab-historial" style="display:none"><div style="text-align:center;padding:20px"><div class="loading-spinner" style="margin:0 auto"></div></div></div>
  </div>`;
  loadReportes();
}

function reportTab(btn, tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-nuevo','tab-historial'].forEach(id => document.getElementById(id).style.display = id === tabId ? 'block' : 'none');
  if (tabId === 'tab-historial') loadReportes();
}

function reporteNuevoHTML() {
  const tipos = [
    { v: 'acumulacion', l: 'Acumulación', ic: '🗑️', d: 'Basura acumulada' },
    { v: 'basurero', l: 'Basurero clandestino', ic: '⚠️', d: 'Sitio ilegal de basura' },
    { v: 'escombros', l: 'Escombros', ic: '🧱', d: 'Materiales de construcción' },
    { v: 'bloqueo', l: 'Bloqueo de vía', ic: '🚧', d: 'Vía bloqueada' },
    { v: 'taponamiento', l: 'Taponamiento', ic: '🌊', d: 'Alcantarilla tapada' },
    { v: 'otro', l: 'Otro', ic: '📌', d: 'Otro tipo de problema' },
  ];
  return `
    <div id="report-error" class="modal-error"></div>
    <div id="report-success" style="display:none;text-align:center;padding:24px;background:rgba(108,217,123,.08);border:1px solid rgba(108,217,123,.25);border-radius:var(--r-lg);margin-bottom:16px">
      <div style="font-size:2.5rem;margin-bottom:10px">✅</div>
      <p style="color:var(--accent-bright);font-family:var(--font-d);font-weight:700">¡Reporte enviado!</p>
    </div>
    <div class="form-label">Tipo de problema *</div>
    <div class="report-types" id="report-tipos">
      ${tipos.map(t => `<button class="type-btn" data-tipo="${t.v}" onclick="selectTipo(this,'${t.v}')"><span class="type-btn-icon">${t.ic}</span><div><div class="type-btn-label">${t.l}</div><div class="type-btn-desc">${t.d}</div></div></button>`).join('')}
    </div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-input" id="r-desc" rows="3" placeholder="Describe la situación brevemente..."></textarea></div>
    <div class="form-label">Foto (opcional)</div>
    <div class="photo-drop" id="photo-drop" onclick="document.getElementById('r-foto').click()">
      <div id="photo-placeholder"><div style="font-size:2rem;margin-bottom:8px">📷</div><div style="color:var(--text-3);font-size:.88rem">Toca para subir foto</div></div>
      <img id="photo-preview-img" class="photo-preview" style="display:none">
    </div>
    <input type="file" id="r-foto" accept="image/*" capture="environment" style="display:none" onchange="previewPhoto(this)">
    <div class="form-group"><label class="form-label">Ubicación</label><input class="form-input" id="r-ubicacion" placeholder="Dirección o descripción del lugar"></div>
    <div class="map-wrap" style="height:200px;margin-bottom:16px"><div id="report-map" style="width:100%;height:100%"></div></div>
    <button class="btn-primary" style="width:100%;padding:14px;font-size:.93rem" onclick="submitReporte()" id="report-btn">Enviar Reporte</button>`;
}

let selectedTipo = '';
let reportPhotoB64 = '';
let reportMapInst = null;
let reportMarker = null;

function selectTipo(btn, tipo) {
  document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedTipo = tipo;
}

function previewPhoto(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    reportPhotoB64 = e.target.result;
    document.getElementById('photo-placeholder').style.display = 'none';
    const img = document.getElementById('photo-preview-img');
    img.src = e.target.result;
    img.style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function submitReporte() {
  if (!selectedTipo) { showReportError('Selecciona un tipo de problema'); return; }
  const ubicacion = document.getElementById('r-ubicacion').value.trim();
  const descripcion = document.getElementById('r-desc').value.trim();
  const btn = document.getElementById('report-btn');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try {
    const res = await fetch('/api/reports', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: selectedTipo, descripcion, ubicacion, imagen: reportPhotoB64 })
    });
    if (!res.ok) throw new Error();
    document.getElementById('report-success').style.display = 'block';
    selectedTipo = ''; reportPhotoB64 = '';
    document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('selected'));
    document.getElementById('r-desc').value = '';
    document.getElementById('r-ubicacion').value = '';
    document.getElementById('photo-placeholder').style.display = 'block';
    document.getElementById('photo-preview-img').style.display = 'none';
    setTimeout(() => document.getElementById('report-success').style.display = 'none', 2500);
  } catch { showReportError('Error al enviar el reporte'); }
  btn.disabled = false; btn.textContent = 'Enviar Reporte';
  setTimeout(initReportMap, 100);
}

function showReportError(msg) {
  const el = document.getElementById('report-error');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

async function loadReportes() {
  const el = document.getElementById('tab-historial');
  if (!el) return;
  try {
    const res = await fetch('/api/reports', { credentials: 'include' });
    const data = await res.json();
    if (!data.length) { el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-3)"><div style="font-size:2.5rem;margin-bottom:12px">📋</div>No has enviado reportes todavía</div>`; return; }
    const TIPO_ICONS = { acumulacion:'🗑️', basurero:'⚠️', escombros:'🧱', bloqueo:'🚧', taponamiento:'🌊', otro:'📌' };
    el.innerHTML = data.map(r => `
      <div class="card lista-item" style="margin-bottom:10px">
        <div class="lista-icon">${TIPO_ICONS[r.tipo]||'📌'}</div>
        <div class="lista-content">
          <div class="lista-title">${r.tipo.charAt(0).toUpperCase()+r.tipo.slice(1)}</div>
          <div class="lista-meta">${r.descripcion||''} ${r.ubicacion?'· 📍'+r.ubicacion:''}<br>${new Date(r.fecha).toLocaleString('es-CO')}</div>
        </div>
        <span class="status-badge ${r.status==='resuelto'?'status-ok':'status-pending'}">${r.status==='resuelto'?'✓ Resuelto':'⏳ Pendiente'}</span>
      </div>`).join('');
  } catch { el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-3)">Error cargando reportes</div>`; }
}

function initReportMap() {
  if (reportMapInst) { reportMapInst.remove(); reportMapInst = null; }
  const el = document.getElementById('report-map');
  if (!el) return;
  reportMapInst = L.map('report-map', { center: [2.9376, -75.2818], zoom: 14 });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '© CARTO', subdomains: 'abcd' }).addTo(reportMapInst);
  const pinIcon = L.divIcon({ html: `<div style="width:24px;height:24px;background:#ff6b35;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.5)"></div>`, className: '', iconSize: [24, 24], iconAnchor: [12, 24] });
  reportMarker = L.marker([2.9376, -75.2818], { icon: pinIcon, draggable: true }).addTo(reportMapInst);
  reportMarker.on('dragend', e => {
    const { lat, lng } = e.target.getLatLng();
    const inp = document.getElementById('r-ubicacion');
    if (inp && !inp.value) inp.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  });
  reportMapInst.on('click', e => {
    const { lat, lng } = e.latlng;
    reportMarker.setLatLng([lat, lng]);
    const inp = document.getElementById('r-ubicacion');
    if (inp) inp.value = `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  });
}

function solicitud(el) {
  el.innerHTML = `<div class="page-content">
    <h1 class="page-title">🚛 Recolección <span class="gradient-text">Especial</span></h1>
    <p class="page-subtitle">Solicita recogida de escombros, muebles o residuos especiales</p>
    <div class="tabs">
      <button class="tab active" onclick="solTab(this,'tab-sol-nuevo')">➕ Nueva Solicitud</button>
      <button class="tab" onclick="solTab(this,'tab-sol-lista')">📋 Mis Solicitudes</button>
    </div>
    <div id="tab-sol-nuevo">${solicitudNuevoHTML()}</div>
    <div id="tab-sol-lista" style="display:none"><div style="text-align:center;padding:20px"><div class="loading-spinner" style="margin:0 auto"></div></div></div>
  </div>`;
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
  const dateInput = document.getElementById('sol-fecha');
  if (dateInput) { dateInput.value = tomorrow.toISOString().split('T')[0]; dateInput.min = new Date().toISOString().split('T')[0]; }
  if (currentUser?.location?.direccion) { const d = document.getElementById('sol-dir'); if (d) d.value = currentUser.location.direccion; }
}

function solTab(btn, tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-sol-nuevo','tab-sol-lista'].forEach(id => document.getElementById(id).style.display = id === tabId ? 'block' : 'none');
  if (tabId === 'tab-sol-lista') loadSolicitudes();
}

function solicitudNuevoHTML() {
  const tipos = [
    { v:'escombros', l:'Escombros', ic:'🧱', d:'Tierra, cemento, ladrillos' },
    { v:'muebles', l:'Muebles', ic:'🛋️', d:'Sofás, colchones, mesas' },
    { v:'electronicos', l:'Electrónicos', ic:'📺', d:'TVs, computadores' },
    { v:'podas', l:'Podas', ic:'🌿', d:'Ramas, hojas, césped' },
    { v:'voluminoso', l:'Voluminoso', ic:'📦', d:'Cajas grandes' },
    { v:'otro', l:'Otro', ic:'🔄', d:'Especificar abajo' },
  ];
  const vols = ['1–2 bolsas','3–5 bolsas','Carga de camioneta','Carga de camión'];
  return `
    <div id="sol-error" class="modal-error"></div>
    <div id="sol-success" style="display:none;text-align:center;padding:24px;background:rgba(108,217,123,.08);border:1px solid rgba(108,217,123,.25);border-radius:var(--r-lg);margin-bottom:16px">
      <div style="font-size:2.5rem;margin-bottom:10px">🎉</div>
      <p style="color:var(--accent-bright);font-family:var(--font-d);font-weight:700">¡Solicitud enviada!</p>
    </div>
    <div class="form-label">Tipo de residuo *</div>
    <div class="report-types" id="sol-tipos">
      ${tipos.map(t=>`<button class="type-btn" data-sol="${t.v}" onclick="selectSolTipo(this,'${t.v}')"><span class="type-btn-icon">${t.ic}</span><div><div class="type-btn-label">${t.l}</div><div class="type-btn-desc">${t.d}</div></div></button>`).join('')}
    </div>
    <div class="form-label">Volumen *</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:16px" id="sol-vols">
      ${vols.map(v=>`<button style="padding:7px 14px;border-radius:20px;border:1px solid var(--border);background:transparent;color:var(--text-3);font-size:.8rem;font-weight:600;cursor:pointer;transition:all .2s" onclick="selectVol(this,'${v}')">${v}</button>`).join('')}
    </div>
    <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-input" id="sol-desc" rows="2" placeholder="Detalles adicionales..."></textarea></div>
    <div class="form-group"><label class="form-label">Dirección *</label><input class="form-input" id="sol-dir" placeholder="Calle 10 # 5-20, Barrio Kennedy"></div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      <div class="form-group" style="margin-bottom:0"><label class="form-label">Fecha preferida *</label><input class="form-input" id="sol-fecha" type="date"></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label">Hora preferida</label><input class="form-input" id="sol-hora" type="time" value="08:00"></div>
    </div>
    <div style="padding:13px 15px;border-radius:var(--r-md);background:rgba(52,152,219,.07);border:1px solid rgba(52,152,219,.18);font-size:.82rem;color:var(--text-3);margin-bottom:16px">
      ℹ️ Un reciclador independiente será asignado. El costo se acuerda directamente con él según volumen y tipo.
    </div>
    <button class="btn-primary" style="width:100%;padding:14px;font-size:.93rem" onclick="submitSolicitud()" id="sol-btn">🚛 Solicitar Recolección</button>`;
}

let selectedSolTipo = '';
let selectedVol = '';

function selectSolTipo(btn, tipo) {
  document.querySelectorAll('[data-sol]').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected'); selectedSolTipo = tipo;
}

function selectVol(btn, vol) {
  document.querySelectorAll('#sol-vols button').forEach(b => { b.style.background='transparent'; b.style.borderColor='var(--border)'; b.style.color='var(--text-3)'; });
  btn.style.background='rgba(108,217,123,.14)'; btn.style.borderColor='rgba(108,217,123,.35)'; btn.style.color='var(--accent-bright)';
  selectedVol = vol;
}

async function submitSolicitud() {
  if (!selectedSolTipo) { showSolError('Selecciona un tipo de residuo'); return; }
  if (!selectedVol) { showSolError('Selecciona el volumen'); return; }
  const direccion = document.getElementById('sol-dir').value.trim();
  if (!direccion) { showSolError('Ingresa la dirección'); return; }
  const btn = document.getElementById('sol-btn');
  btn.disabled = true; btn.textContent = 'Enviando...';
  try {
    const res = await fetch('/api/solicitudes', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo: selectedSolTipo, volumen: selectedVol, descripcion: document.getElementById('sol-desc').value.trim(), direccion, fecha: document.getElementById('sol-fecha').value, hora: document.getElementById('sol-hora').value })
    });
    if (!res.ok) throw new Error();
    document.getElementById('sol-success').style.display = 'block';
    setTimeout(() => { document.getElementById('sol-success').style.display = 'none'; }, 2500);
    selectedSolTipo = ''; selectedVol = '';
  } catch { showSolError('Error al enviar la solicitud'); }
  btn.disabled = false; btn.textContent = '🚛 Solicitar Recolección';
}

function showSolError(msg) {
  const el = document.getElementById('sol-error');
  if (!el) return;
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

async function loadSolicitudes() {
  const el = document.getElementById('tab-sol-lista');
  if (!el) return;
  try {
    const res = await fetch('/api/solicitudes', { credentials: 'include' });
    const data = await res.json();
    if (!data.length) { el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-3)"><div style="font-size:2.5rem;margin-bottom:12px">🚛</div>No tienes solicitudes todavía</div>`; return; }
    const TIPO_IC = { escombros:'🧱', muebles:'🛋️', electronicos:'📺', podas:'🌿', voluminoso:'📦', otro:'🔄' };
    const STATUS = { 'buscando-reciclador':['status-search','🔍 Buscando reciclador'], 'reciclador-asignado':['status-search','👷 Asignado'], 'en-camino':['status-ok','🚛 En camino'], 'completado':['status-ok','✓ Completado'], 'cancelado':['status-pending','❌ Cancelado'] };
    el.innerHTML = data.map(s => {
      const st = STATUS[s.status] || STATUS['buscando-reciclador'];
      return `<div class="card lista-item" style="margin-bottom:10px">
        <div class="lista-icon">${TIPO_IC[s.tipo]||'🔄'}</div>
        <div class="lista-content">
          <div class="lista-title">${s.tipo.charAt(0).toUpperCase()+s.tipo.slice(1)} · ${s.volumen}</div>
          <div class="lista-meta">📍 ${s.direccion}<br>📅 ${s.fecha} ${s.hora?'· '+s.hora:''}</div>
        </div>
        <span class="status-badge ${st[0]}">${st[1]}</span>
      </div>`;
    }).join('');
  } catch { el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-3)">Error cargando solicitudes</div>`; }
}

function alertas(el) {
  el.innerHTML = `<div class="page-content">
    <div class="section-header">
      <div><h1 class="page-title">🔔 Alertas <span class="gradient-text">Comunitarias</span></h1><p class="page-subtitle">Reportes de la comunidad de Neiva</p></div>
      <button class="btn-primary" onclick="toggleNewAlerta()">+ Nueva alerta</button>
    </div>
    <div id="new-alerta-form" style="display:none" class="card" style="padding:20px;margin-bottom:16px">
      <div class="modal-body" style="padding:0">
        <div class="modal-title" style="font-size:1rem;margin-bottom:14px">Nueva alerta</div>
        <div class="form-group"><label class="form-label">Categoría *</label>
          <select class="form-input" id="alt-cat">
            <option value="">Selecciona...</option>
            <option value="acumulacion">🗑️ Acumulación</option>
            <option value="basurero">⚠️ Basurero clandestino</option>
            <option value="escombros">🧱 Escombros</option>
            <option value="bloqueo">🚧 Bloqueo de vía</option>
            <option value="taponamiento">🌊 Taponamiento</option>
            <option value="otro">📌 Otro</option>
          </select>
        </div>
        <div class="form-group"><label class="form-label">Descripción</label><textarea class="form-input" id="alt-desc" rows="2" placeholder="Describe brevemente..."></textarea></div>
        <div class="form-group"><label class="form-label">Ubicación *</label><input class="form-input" id="alt-ubic" placeholder="Calle o dirección aproximada"></div>
        <button class="btn-primary" style="width:100%" onclick="submitAlerta()">📤 Enviar alerta</button>
      </div>
    </div>
    <div class="tabs">
      <button class="tab active" onclick="altTab(this,'tab-alt-act')">Activas</button>
      <button class="tab" onclick="altTab(this,'tab-alt-res')">Resueltas</button>
    </div>
    <div id="tab-alt-act"><div style="text-align:center;padding:20px"><div class="loading-spinner" style="margin:0 auto"></div></div></div>
    <div id="tab-alt-res" style="display:none"></div>
  </div>`;
  loadAlertas(false);
}

function altTab(btn, tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-alt-act','tab-alt-res'].forEach(id => document.getElementById(id).style.display = id === tabId ? 'block' : 'none');
  if (tabId === 'tab-alt-res') loadAlertas(true);
}

function toggleNewAlerta() {
  const f = document.getElementById('new-alerta-form');
  f.style.display = f.style.display === 'none' ? 'block' : 'none';
}

async function submitAlerta() {
  const categoria = document.getElementById('alt-cat').value;
  const descripcion = document.getElementById('alt-desc').value.trim();
  const ubicacion = document.getElementById('alt-ubic').value.trim();
  if (!categoria || !ubicacion) { toast('Categoría y ubicación son requeridas', 'error'); return; }
  try {
    const res = await fetch('/api/alertas', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ categoria, descripcion, ubicacion })
    });
    if (!res.ok) throw new Error();
    toggleNewAlerta();
    toast('Alerta enviada', 'success');
    loadAlertas(false);
  } catch { toast('Error al enviar', 'error'); }
}

async function loadAlertas(resueltas) {
  const tabId = resueltas ? 'tab-alt-res' : 'tab-alt-act';
  const el = document.getElementById(tabId);
  if (!el) return;
  try {
    const res = await fetch('/api/alertas', { credentials: 'include' });
    const data = await res.json();
    const filtered = data.filter(a => !!a.resuelta === resueltas);
    if (!filtered.length) { el.innerHTML = `<div style="text-align:center;padding:40px;color:var(--text-3)"><div style="font-size:2.5rem;margin-bottom:12px">🔕</div>No hay alertas ${resueltas?'resueltas':'activas'}</div>`; return; }
    const TIPO_IC = { acumulacion:'🗑️', basurero:'⚠️', escombros:'🧱', bloqueo:'🚧', taponamiento:'🌊', otro:'📌' };
    const TIPO_COL = { acumulacion:'#f39c12', basurero:'#e74c3c', escombros:'#95a5a6', bloqueo:'#e67e22', taponamiento:'#3498db', otro:'#9b59b6' };
    const timeAgo = d => { const s=(Date.now()-new Date(d))/1000; return s<3600?`Hace ${Math.round(s/60)}min`:s<86400?`Hace ${Math.round(s/3600)}h`:`Hace ${Math.round(s/86400)}d`; };
    el.innerHTML = filtered.map(a => {
      const total = a.votosSi + a.votosNo;
      const pct = total > 0 ? Math.round(a.votosSi / total * 100) : 100;
      const myVote = a.votantes?.[currentUser?.id];
      return `<div class="card alerta-item" style="margin-bottom:10px">
        <div class="alerta-header">
          <div class="alerta-tipo-icon" style="background:${TIPO_COL[a.categoria]||'#9b59b6'}22;border:1px solid ${TIPO_COL[a.categoria]||'#9b59b6'}44">${TIPO_IC[a.categoria]||'📌'}</div>
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:3px">
              <span style="font-family:var(--font-d);font-weight:700;font-size:.88rem;color:var(--text-1)">${a.categoria.charAt(0).toUpperCase()+a.categoria.slice(1)}</span>
              ${a.resuelta?`<span class="status-badge status-ok">✓ Resuelto</span>`:''}
            </div>
            ${a.descripcion?`<div style="font-size:.82rem;color:var(--text-2);margin-bottom:3px">${a.descripcion}</div>`:''}
            <div style="font-size:.75rem;color:var(--text-3)">📍 ${a.ubicacion} · ${timeAgo(a.fecha)}</div>
          </div>
        </div>
        <div class="alerta-vote-bar"><div class="alerta-vote-fill" style="width:${pct}%"></div></div>
        <div class="alerta-actions">
          <span class="vote-count">${a.votosSi} confirmaron</span>
          ${!a.resuelta?`
            <button class="vote-btn ${myVote==='si'?'voted-si':''}" onclick="voteAlerta('${a.id}','si')">👍 Confirmar</button>
            <button class="vote-btn ${myVote==='no'?'voted-no':''}" onclick="voteAlerta('${a.id}','no')">👎</button>`:''}
        </div>
      </div>`;
    }).join('');
  } catch { el.innerHTML = `<div style="text-align:center;padding:20px;color:var(--text-3)">Error cargando alertas</div>`; }
}

async function voteAlerta(id, vote) {
  try {
    await fetch(`/api/alertas/${id}/vote`, {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote })
    });
    const isResueltas = document.getElementById('tab-alt-res')?.style.display !== 'none';
    loadAlertas(isResueltas);
  } catch {}
}

function cuenta(el) {
  const u = currentUser;
  el.innerHTML = `<div class="page-content">
    <h1 class="page-title">👤 Mi <span class="gradient-text">Cuenta</span></h1>
    <div class="card" style="padding:24px;display:flex;align-items:center;gap:18px;margin-bottom:20px;flex-wrap:wrap">
      <div style="width:70px;height:70px;border-radius:50%;background:linear-gradient(135deg,var(--accent),#44874d);display:flex;align-items:center;justify-content:center;font-family:var(--font-d);font-weight:800;font-size:1.5rem;color:#fff;border:3px solid var(--border-bright);box-shadow:0 0 24px rgba(108,217,123,.3);flex-shrink:0;overflow:hidden">
        ${u.image?`<img src="${u.image}" style="width:100%;height:100%;object-fit:cover">`:(u.name||'TK').split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-family:var(--font-d);font-weight:800;font-size:1.15rem;color:var(--text-1)">${u.name||'Usuario'}</div>
        <div style="color:var(--text-3);font-size:.85rem">${u.email}</div>
        <div style="color:var(--text-4);font-size:.75rem;margin-top:3px">${u.isReciclador?'Reciclador':'Ciudadano'} · Desde ${new Date(u.createdAt||Date.now()).toLocaleDateString('es-CO')}</div>
      </div>
    </div>

    <div class="tabs">
      <button class="tab active" onclick="cuentaTab(this,'tab-ct-perfil')">Perfil</button>
      <button class="tab" onclick="cuentaTab(this,'tab-ct-ubicacion')">Ubicación</button>
    </div>

    <div id="tab-ct-perfil">
      <div id="ct-error" class="modal-error"></div>
      <div class="form-group"><label class="form-label">Nombre completo</label><input class="form-input" id="ct-name" value="${u.name||''}" placeholder="Tu nombre"></div>
      <div class="form-group"><label class="form-label">Correo electrónico</label><input class="form-input" value="${u.email||''}" disabled style="opacity:.6"></div>
      <div class="form-group"><label class="form-label">Teléfono</label><input class="form-input" id="ct-phone" value="${u.phone||''}" placeholder="300 123 4567" type="tel"></div>
      <button class="btn-primary" style="width:100%;padding:13px" onclick="saveProfile()" id="ct-btn">💾 Guardar cambios</button>
    </div>

    <div id="tab-ct-ubicacion" style="display:none">
      ${u.location?.barrio?`
      <div class="card" style="padding:18px;margin-bottom:16px;background:rgba(108,217,123,.05);border-color:rgba(108,217,123,.2)">
        ${[['🏘️','Barrio',u.location.barrio],['🏙️','Comuna',u.location.comuna+' — '+(BARRIOS_DATA[u.location.comuna]?.nombre||'')],['📅','Días de recolección',BARRIOS_DATA[u.location.comuna]?.dias||'—'],['⏰','Horario',BARRIOS_DATA[u.location.comuna]?.horario||'—']].map(([ic,lb,vl])=>`
          <div style="display:flex;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)">
            <span>${ic}</span><div><div style="font-size:.7rem;color:var(--text-4);text-transform:uppercase;letter-spacing:.8px;margin-bottom:2px">${lb}</div><div style="font-size:.88rem;color:var(--text-1)">${vl}</div></div>
          </div>`).join('')}
      </div>
      <button class="btn-outline" style="width:100%;justify-content:center" onclick="goTo('horario')">✏️ Cambiar barrio</button>`:`
      <div style="text-align:center;padding:32px;color:var(--text-3)">
        <div style="font-size:2.5rem;margin-bottom:10px">📍</div>
        <p style="margin-bottom:14px">No has configurado tu ubicación</p>
        <button class="btn-primary" onclick="goTo('horario')">Configurar barrio</button>
      </div>`}
    </div>
  </div>`;
}

function cuentaTab(btn, tabId) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  ['tab-ct-perfil','tab-ct-ubicacion'].forEach(id => document.getElementById(id).style.display = id === tabId ? 'block' : 'none');
}

async function saveProfile() {
  const name = document.getElementById('ct-name')?.value?.trim();
  const phone = document.getElementById('ct-phone')?.value?.trim();
  if (!name) { document.getElementById('ct-error').textContent='El nombre es requerido'; document.getElementById('ct-error').classList.add('show'); return; }
  const btn = document.getElementById('ct-btn');
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const res = await fetch('/api/user', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone })
    });
    if (!res.ok) throw new Error();
    currentUser = await res.json();
    renderUserUI();
    toast('Perfil actualizado', 'success');
  } catch { toast('Error al guardar', 'error'); }
  btn.disabled = false; btn.textContent = '💾 Guardar cambios';
}

function showOnboarding() {
  const el = document.getElementById('onboard-body');
  el.innerHTML = `
    <div style="text-align:center;margin-bottom:22px">
      <div style="font-size:2.8rem;margin-bottom:12px">🏘️</div>
      <div style="font-family:var(--font-d);font-weight:800;font-size:1.4rem;color:var(--text-1);margin-bottom:8px">¿En qué barrio vives?</div>
      <div style="color:var(--text-3);font-size:.88rem;line-height:1.6">Esto nos permite mostrarte el horario exacto de recolección de basuras en tu sector.</div>
    </div>
    <div class="search-wrap" style="margin-bottom:14px">
      <svg class="search-prefix" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input class="form-input search-input" id="ob-search" placeholder="Busca tu barrio..." autocomplete="off">
      <div class="suggestions-box" id="ob-suggestions"></div>
    </div>
    <div id="ob-result" style="display:none;padding:14px;border-radius:var(--r-md);background:rgba(108,217,123,.08);border:1px solid rgba(108,217,123,.25);margin-bottom:16px"></div>
    <button class="btn-primary" style="width:100%;padding:14px;opacity:.5" id="ob-btn" onclick="saveOnboardBarrio()" disabled>Confirmar mi barrio →</button>
    <button style="display:block;width:100%;margin-top:10px;padding:10px;background:none;border:none;color:var(--text-4);font-size:.82rem;cursor:pointer;text-decoration:underline" onclick="skipOnboarding()">Omitir por ahora</button>
  `;
  document.getElementById('onboard-backdrop').classList.add('open');

  const input = document.getElementById('ob-search');
  const sugs = document.getElementById('ob-suggestions');
  let obSelected = null;

  input.addEventListener('input', () => {
    const results = searchBarrios(input.value);
    if (!results.length) { sugs.classList.remove('open'); return; }
    sugs.innerHTML = results.map(b => `<div class="suggest-item" onclick="obSelect('${b.nombre.replace(/'/g,"\\'")}','${b.comuna}')">${b.nombre} <span style="color:var(--text-4);font-size:.75rem">Com. ${b.comuna}</span></div>`).join('');
    sugs.classList.add('open');
  });
}

window.obSelect = function(barrio, comuna) {
  document.getElementById('ob-search').value = barrio;
  document.getElementById('ob-suggestions').classList.remove('open');
  const info = BARRIOS_DATA[comuna];
  document.getElementById('ob-result').style.display = 'block';
  document.getElementById('ob-result').innerHTML = `<div style="display:flex;align-items:center;gap:8px;margin-bottom:5px;font-family:var(--font-d);font-weight:700;color:var(--text-1)"><span>🚛</span>${barrio}</div><div style="font-size:.82rem;color:var(--accent)">📅 ${info.dias}</div><div style="font-size:.82rem;color:var(--text-3)">⏰ ${info.horario} · ${info.nombre}</div>`;
  const btn = document.getElementById('ob-btn');
  btn.style.opacity = '1'; btn.disabled = false;
  btn.dataset.barrio = barrio; btn.dataset.comuna = comuna;
};

window.saveOnboardBarrio = async function() {
  const btn = document.getElementById('ob-btn');
  const barrio = btn.dataset.barrio; const comuna = btn.dataset.comuna;
  if (!barrio) return;
  btn.disabled = true; btn.textContent = 'Guardando...';
  try {
    const res = await fetch('/api/user', {
      method: 'PATCH', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ location: { barrio, comuna }, onboardingDone: true })
    });
    if (!res.ok) throw new Error();
    currentUser = await res.json();
    renderUserUI();
    document.getElementById('onboard-backdrop').classList.remove('open');
    toast('¡Barrio configurado! 🎉', 'success');
    goTo('inicio');
  } catch { btn.disabled = false; btn.textContent = 'Confirmar mi barrio →'; toast('Error al guardar', 'error'); }
};

window.skipOnboarding = async function() {
  await fetch('/api/user', { method: 'PATCH', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ onboardingDone: true }) }).catch(() => {});
  document.getElementById('onboard-backdrop').classList.remove('open');
  goTo('inicio');
};

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
  document.getElementById('sidebar-overlay').classList.toggle('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

function closeDropdowns() {
  document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('open'));
}

function toggleNotif() {
  const d = document.getElementById('notif-dropdown');
  document.getElementById('user-dropdown').classList.remove('open');
  d.classList.toggle('open');
}

function toggleUserMenu() {
  const d = document.getElementById('user-dropdown');
  document.getElementById('notif-dropdown').classList.remove('open');
  d.classList.toggle('open');
}

let fabOpen = false;
function toggleFab() {
  fabOpen = !fabOpen;
  document.getElementById('fab-actions').classList.toggle('open', fabOpen);
  document.getElementById('fab-btn').classList.toggle('open', fabOpen);
}

function closeFab() { fabOpen = false; document.getElementById('fab-actions').classList.remove('open'); document.getElementById('fab-btn').classList.remove('open'); }

document.addEventListener('click', e => {
  if (!e.target.closest('#notif-dropdown') && !e.target.closest('.notif-btn')) document.getElementById('notif-dropdown').classList.remove('open');
  if (!e.target.closest('#user-dropdown') && !e.target.closest('#user-btn')) document.getElementById('user-dropdown').classList.remove('open');
  if (!e.target.closest('.fab')) closeFab();
});

async function doLogout() {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
  window.location.href = '/';
}

function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.textContent = msg;
  document.getElementById('toasts').appendChild(t);
  setTimeout(() => t.remove(), 4000);
}

setTimeout(() => initReportMap(), 500);
init();
