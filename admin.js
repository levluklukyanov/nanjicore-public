// ═══════════════════════════════════════════════════════════════
// ПАНЕЛЬ СОЗДАТЕЛЯ (ADMIN DASHBOARD) & УПРАВЛЕНИЕ ИГРОКАМИ
// Модуль: admin.js (вынесен из nanj.html, Этап 1 модуляризации)
// Зависимости: isCreatorAccount, getCurrentUser, showSiteToast,
//              escapeHtml, firebaseConfig, SITE_VERSION
// ═══════════════════════════════════════════════════════════════

let adminCachedPlayers = [];

function ensureAdminDashboardModal() {
  let modal = document.getElementById('adminDashboardModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'adminDashboardModal';
  modal.onclick = function(e) { if (e.target === this) closeAdminDashboardModal(); };
  modal.className = 'fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 modal-scroll-contain';
  modal.innerHTML = `
    <div id="adminDashboardModalContent" class="bg-gray-900 border border-purple-500/30 rounded-3xl w-full max-w-3xl shadow-2xl shadow-purple-900/40 text-white max-h-[92vh] flex flex-col overflow-hidden">
      <!-- Шапка Админки -->
      <div class="flex items-center justify-between p-4 sm:p-5 border-b border-gray-800 bg-gray-900/90">
        <div class="flex items-center gap-3">
          <div class="p-2.5 rounded-2xl bg-gradient-to-tr from-red-600 via-purple-600 to-amber-500 text-white shadow-lg shadow-purple-500/30">
            <svg class="w-5 h-5 text-amber-300 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="text-lg sm:text-xl font-black tracking-tight text-white" data-i18n="admin_title">Панель Создателя</h2>
              <span class="px-2 py-0.5 rounded-md bg-red-600/30 border border-red-500/40 text-[10px] font-black uppercase text-red-400" data-i18n="admin_badge">АДМИН</span>
              <span id="adminSiteVersionBadge" class="px-2 py-0.5 rounded-md bg-purple-500/20 border border-purple-400/40 text-[10px] font-mono font-bold text-purple-300 shadow-sm" data-i18n-title="admin_footer_version" title="Версия сайта">v2.5</span>
            </div>
            <p class="text-[11px] text-gray-400" data-i18n="admin_subtitle">Управление игроками, чит-панель и глобальные настройки</p>
          </div>
        </div>
        <button id="closeAdminDashboardBtn" onclick="closeAdminDashboardModal()" type="button" class="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-xl transition">
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>

      <!-- Вкладки Админки -->
      <div class="flex border-b border-gray-800 bg-gray-950/60 p-1.5 gap-1.5 flex-shrink-0">
        <button type="button" id="adminTabBtn_players" onclick="switchAdminTab('players')" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-purple-600 text-white shadow">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg><span data-i18n="admin_tab_players">Игроки</span>
        </button>
        
        <button type="button" id="adminTabBtn_announcement" onclick="switchAdminTab('announcement')" class="flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-gray-400 hover:text-white">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"/></svg><span data-i18n="admin_tab_announcement">Глобальный анонс</span>
        </button>
      </div>

      <!-- Содержимое Вкладок -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-4">
        <!-- ВКЛАДКА 1: ИГРОКИ -->
        <div id="adminTabContent_players" class="space-y-4">
          <div class="flex items-center gap-2">
            <div class="relative flex-1">
              <input id="adminPlayerSearchInput" type="text" placeholder="Поиск по никнейму или email..." data-i18n-placeholder="admin_search_ph" oninput="renderAdminPlayersList()" class="w-full pl-9 pr-4 py-2.5 bg-gray-800/80 border border-gray-700 rounded-2xl text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50">
              <svg class="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button id="adminRefreshPlayersBtn" onclick="fetchAndRenderAdminPlayers()" type="button" class="px-3.5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-2xl border border-gray-700 text-xs font-bold transition flex items-center gap-1.5 flex-shrink-0" data-i18n-title="admin_refresh_btn" title="Обновить список">
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
              <span class="hidden sm:inline" data-i18n="admin_refresh_btn">Обновить</span>
            </button>
          </div>

          <div id="adminPlayersListContainer" class="space-y-2.5">
            <div class="text-center py-8 text-xs text-gray-400" data-i18n="admin_loading_players">Загрузка игроков из базы данных...</div>
          </div>
        </div>

        <!-- ВКЛАДКА 3: ГЛОБАЛЬНЫЙ АНОНС -->
        <div id="adminTabContent_announcement" class="hidden space-y-4">
          <div class="p-4 rounded-2xl bg-gray-800/60 border border-gray-700 space-y-3">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-white" data-i18n="admin_show_announcement">Показывать анонс в шапке сайта:</label>
              <input type="checkbox" id="adminAnnouncementEnabled" class="w-4 h-4 accent-purple-600 rounded">
            </div>
            
            <div>
              <label class="block text-xs font-medium text-gray-300 mb-1" data-i18n="admin_announcement_text_label">Текст глобального объявления:</label>
              <input id="adminAnnouncementText" type="text" placeholder="Например: ⚡ Скоро открытие топов и таблиц лидеров!" data-i18n-placeholder="admin_announcement_ph" class="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-2xl text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500">
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-300 mb-1" data-i18n="admin_style_label">Стиль плашки:</label>
              <select id="adminAnnouncementStyle" class="w-full px-3.5 py-2.5 bg-gray-900 border border-gray-700 rounded-2xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="cyber" data-i18n="admin_style_cyber">Киберпанк (Неон и Фиолетовый)</option>
                <option value="gold" data-i18n="admin_style_gold">Королевское золото</option>
                <option value="alert" data-i18n="admin_style_alert">Важное предупреждение (Красный)</option>
                <option value="emerald" data-i18n="admin_style_emerald">Изумрудное событие</option>
              </select>
            </div>

            <button type="button" onclick="saveAdminAnnouncement()" class="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold text-xs shadow-lg hover:opacity-95 transition" data-i18n="admin_save_announcement">
              Сохранить и применить объявление
            </button>
          </div>
        </div>
      </div>

      <!-- Футер Админки с версией сайта -->
      <div class="flex items-center justify-between px-4 sm:px-6 py-2.5 border-t border-gray-800 bg-gray-950/80 text-[11px] text-gray-400 flex-shrink-0">
        <div class="flex items-center gap-1.5">
          <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Nanjicore Engine</span>
        </div>
        <div class="font-mono text-gray-400">
          <span data-i18n="admin_footer_version">Версия сайта:</span> <span id="adminSiteVersionFooter" class="text-purple-300 font-bold bg-purple-900/40 px-1.5 py-0.5 rounded border border-purple-500/30">v2.5</span>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.applyTranslations === 'function') {
    window.i18n.applyTranslations();
  }
  return modal;
}

function openAdminDashboardModal() {
  const user = getCurrentUser();
  if (!isCreatorAccount(user)) {
    const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
    const msg = typeof window.t === 'function' ? window.t('admin_access_denied', 'Доступ разрешён только Создателю!') : 'Доступ разрешён только Создателю!';
    if (toastFn) toastFn(msg, 'error', 'Отказ');
    return;
  }
  const modal = ensureAdminDashboardModal();
  modal.classList.remove('hidden');
  const versionBadge = document.getElementById('adminSiteVersionBadge');
  if (versionBadge) versionBadge.textContent = 'v' + (window.SITE_VERSION || SITE_VERSION || '2.5c');
  const versionFooter = document.getElementById('adminSiteVersionFooter');
  if (versionFooter) versionFooter.textContent = window.SITE_VERSION || SITE_VERSION || '2.5c';
  switchAdminTab('players');
  fetchAndRenderAdminPlayers();
  loadAdminAnnouncementUI();
  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.applyTranslations === 'function') {
    window.i18n.applyTranslations();
  }
}

function closeAdminDashboardModal() {
  const modal = document.getElementById('adminDashboardModal');
  if (modal) modal.remove();
}

function switchAdminTab(tabName) {
  const tabs = ['players', 'announcement'];
  tabs.forEach(t => {
    const btn = document.getElementById(`adminTabBtn_${t}`);
    const content = document.getElementById(`adminTabContent_${t}`);
    if (t === tabName) {
      if (btn) btn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 bg-purple-600 text-white shadow';
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) btn.className = 'flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 text-gray-400 hover:text-white';
      if (content) content.classList.add('hidden');
    }
  });
}

async function fetchAndRenderAdminPlayers() {
  const container = document.getElementById('adminPlayersListContainer');
  if (!container) return;
  const loadingMsg = typeof window.t === 'function' ? window.t('admin_loading_firestore', 'Загрузка игроков из Firestore...') : 'Загрузка игроков из Firestore...';
  container.innerHTML = `<div class="text-center py-8 text-xs text-gray-400">${loadingMsg}</div>`;

  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/nanj_users?key=${firebaseConfig.apiKey}&pageSize=100`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Ошибка базы: ${res.status}`);
    const data = await res.json();
    const docs = data.documents || [];
    
    adminCachedPlayers = docs.map(doc => {
      const f = doc.fields || {};
      const docId = doc.name.split('/').pop();
      return {
        docId,
        username: f.username?.stringValue || f.tag?.stringValue || 'Без имени',
        tag: f.tag?.stringValue || '@user',
        email: f.email?.stringValue || '',
        isGoogle: f.isGoogle?.booleanValue || false,
        playerTitle: f.playerTitle?.stringValue || 'none',
        moodStatus: f.moodStatus?.stringValue || 'gaming',
        hasImportedData: f.hasImportedData?.booleanValue || false,
        isVip: f.isVip?.booleanValue || false,
        clicks: Number(f.stats_tanjiroClicks?.integerValue || 0),
        achCount: Number(f.stats_achCount?.integerValue || 0),
        createdAt: f.createdAt?.integerValue ? Number(f.createdAt.integerValue) : 0,
        avatarColor: f.avatarColor?.stringValue || '#6366f1'
      };
    });

    // Исключаем служебные Google связки из списка отображения
    adminCachedPlayers = adminCachedPlayers.filter(p => !p.docId.startsWith('google_uid_') && !p.docId.startsWith('email_'));

    renderAdminPlayersList();
  } catch (err) {
    const errPrefix = typeof window.t === 'function' ? window.t('admin_err_load_players') : 'Не удалось загрузить игроков:';
    container.innerHTML = `<div class="text-center py-8 text-xs text-red-400">${errPrefix} ${escapeHtml(err.message)}</div>`;
  }
}

function renderAdminPlayersList() {
  const container = document.getElementById('adminPlayersListContainer');
  if (!container) return;

  const search = (document.getElementById('adminPlayerSearchInput')?.value || '').trim().toLowerCase();
  const filtered = adminCachedPlayers.filter(p => 
    p.username.toLowerCase().includes(search) || 
    p.tag.toLowerCase().includes(search) || 
    p.email.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    const noPlayersMsg = typeof window.t === 'function' ? window.t('admin_no_players', 'Игроки не найдены.') : 'Игроки не найдены.';
    container.innerHTML = `<div class="text-center py-8 text-xs text-gray-400">${noPlayersMsg}</div>`;
    return;
  }

  const isEn = typeof window.i18n !== 'undefined' && window.i18n.currentLang === 'en';
  const badgeCreator = typeof window.t === 'function' ? window.t('admin_badge_creator', 'СОЗДАТЕЛЬ') : 'СОЗДАТЕЛЬ';
  const badgeImport = typeof window.t === 'function' ? window.t('admin_badge_import', 'ИМПОРТ') : 'ИМПОРТ';
  const localLabel = typeof window.t === 'function' ? window.t('badge_local', 'Локальный') : 'Локальный';
  const regLabel = isEn ? 'Reg' : 'Рег';
  const dateLocale = isEn ? 'en-US' : 'ru-RU';

  const titleNone = typeof window.t === 'function' ? window.t('title_none', 'Без титула') : 'Без титула';
  const titleAdmin = typeof window.t === 'function' ? window.t('title_admin', 'Admin ⚡') : 'Admin ⚡';
  const titleLegend = typeof window.t === 'function' ? window.t('title_legend', 'Легенда') : 'Легенда';
  const titleDemon = typeof window.t === 'function' ? window.t('title_demon_slayer', 'Истребитель') : 'Истребитель';
  const titleWheel = typeof window.t === 'function' ? window.t('title_wheel_master', 'Мастер колеса') : 'Мастер колеса';

  const grantVipText = typeof window.t === 'function' ? window.t('admin_grant_vip', '+ VIP') : '+ VIP';
  const removeVipText = typeof window.t === 'function' ? window.t('admin_remove_vip', 'Снять VIP') : 'Снять VIP';
  const inTopText = typeof window.t === 'function' ? window.t('admin_in_top', 'В Топы') : 'В Топы';
  const outTopText = typeof window.t === 'function' ? window.t('admin_out_top', 'Вне Топов') : 'Вне Топов';

  container.innerHTML = filtered.map(p => {
    const isCreator = p.email === 'creator@example.com' || p.username.toLowerCase() === 'mrebardo';
    const initial = (p.username || 'U').charAt(0).toUpperCase();
    const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleDateString(dateLocale) : '—';
    const safeAvatarColor = /^#([0-9a-fA-F]{3,8})$/.test(p.avatarColor || '') ? p.avatarColor : '#6366f1';
    
    return `
      <div class="p-3 sm:p-4 rounded-2xl bg-gray-800/80 border border-gray-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-500/40 transition">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow flex-shrink-0" style="background-color: ${safeAvatarColor};">
            ${escapeHtml(initial)}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-xs text-white truncate">${escapeHtml(p.username)}</span>
              <span class="text-[10px] text-gray-400 font-mono">${escapeHtml(p.tag)}</span>
              ${isCreator ? `<span class="px-1.5 py-0.5 rounded bg-red-600/30 text-red-400 border border-red-500/40 text-[9px] font-black">${badgeCreator}</span>` : ''}
              ${p.isVip ? '<span class="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[9px] font-black">VIP</span>' : ''}
              ${p.hasImportedData ? `<span class="px-1.5 py-0.5 rounded bg-rose-600/30 text-rose-300 border border-rose-500/40 text-[9px] font-black">${badgeImport}</span>` : ''}
            </div>
            <div class="text-[10px] text-gray-400 flex items-center gap-2 mt-0.5">
              <span>Email: ${p.email ? escapeHtml(p.email) : localLabel}</span>
              <span>•</span>
              <span>${regLabel}: ${dateStr}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap flex-shrink-0">
          <!-- Смена титула -->
          <select data-doc-id="${escapeHtml(p.docId)}" onchange="adminChangePlayerTitle(this.dataset.docId, this.value)" class="px-2 py-1.5 bg-gray-900 border border-gray-700 rounded-xl text-[10px] text-gray-200 focus:outline-none focus:ring-1 focus:ring-purple-500">
            <option value="none" ${p.playerTitle === 'none' ? 'selected' : ''}>${titleNone}</option>
            <option value="admin" ${p.playerTitle === 'admin' ? 'selected' : ''}>${titleAdmin}</option>
            <option value="legend" ${p.playerTitle === 'legend' ? 'selected' : ''}>${titleLegend}</option>
            <option value="vip_pioneer" ${p.playerTitle === 'vip_pioneer' ? 'selected' : ''}>VIP</option>
            <option value="demon_slayer" ${p.playerTitle === 'demon_slayer' ? 'selected' : ''}>${titleDemon}</option>
            <option value="wheel_master" ${p.playerTitle === 'wheel_master' ? 'selected' : ''}>${titleWheel}</option>
          </select>

          <!-- Выдать/снять VIP -->
          <button type="button" data-doc-id="${escapeHtml(p.docId)}" onclick="adminTogglePlayerVip(this.dataset.docId, ${!p.isVip})" class="px-2 py-1.5 rounded-xl border text-[10px] font-bold transition ${p.isVip ? 'bg-amber-500/20 border-amber-500/40 text-amber-300' : 'bg-gray-700/60 border-gray-600 text-gray-300 hover:bg-amber-500/20'}">
            ${p.isVip ? removeVipText : grantVipText}
          </button>

          <!-- Метка импорта (исключение из топов) -->
          <button type="button" data-doc-id="${escapeHtml(p.docId)}" onclick="adminTogglePlayerImported(this.dataset.docId, ${!p.hasImportedData})" class="px-2 py-1.5 rounded-xl border text-[10px] font-bold transition ${p.hasImportedData ? 'bg-rose-600/20 border-rose-500/40 text-rose-300' : 'bg-gray-700/60 border-gray-600 text-gray-300 hover:bg-rose-600/20'}" title="Исключить / Вернуть в топы">
            ${p.hasImportedData ? inTopText : outTopText}
          </button>
        </div>
      </div>
    `;
  }).join('');
}

async function getAdminAuthHeaders() {
  const headers = { 'Content-Type': 'application/json' };
  const authUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
  if (authUser) {
    try {
      const idToken = await authUser.getIdToken();
      if (idToken) headers['Authorization'] = 'Bearer ' + idToken;
    } catch (_) {}
  }
  return headers;
}

async function adminChangePlayerTitle(docId, newTitle) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/nanj_users/${encodeURIComponent(docId)}?updateMask.fieldPaths=playerTitle&key=${firebaseConfig.apiKey}`;
    const body = { fields: { playerTitle: { stringValue: newTitle } } };
    const headers = await getAdminAuthHeaders();
    const res = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(body)
    });
    if (res.ok) {
      showSiteToast('Титул игрока обновлён в облаке!', 'success', 'Admin');
      const p = adminCachedPlayers.find(x => x.docId === docId);
      if (p) p.playerTitle = newTitle;
    }
  } catch (e) {
    showSiteToast('Ошибка смены титула: ' + e.message, 'error', 'Admin');
  }
}

async function adminTogglePlayerVip(docId, nextVipState) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/nanj_users/${encodeURIComponent(docId)}?updateMask.fieldPaths=isVip&key=${firebaseConfig.apiKey}`;
    const body = { fields: { isVip: { booleanValue: nextVipState } } };
    const headers = await getAdminAuthHeaders();
    const res = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(body)
    });
    if (res.ok) {
      showSiteToast(nextVipState ? 'VIP-статус выдан!' : 'VIP-статус снят!', 'success', 'Admin');
      const p = adminCachedPlayers.find(x => x.docId === docId);
      if (p) p.isVip = nextVipState;
      renderAdminPlayersList();
    }
  } catch (e) {
    showSiteToast('Ошибка изменения VIP: ' + e.message, 'error', 'Admin');
  }
}

async function adminTogglePlayerImported(docId, nextImportedState) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/nanj_users/${encodeURIComponent(docId)}?updateMask.fieldPaths=hasImportedData&key=${firebaseConfig.apiKey}`;
    const body = { fields: { hasImportedData: { booleanValue: nextImportedState } } };
    const headers = await getAdminAuthHeaders();
    const res = await fetch(url, {
      method: 'PATCH',
      headers: headers,
      body: JSON.stringify(body)
    });
    if (res.ok) {
      showSiteToast(nextImportedState ? 'Игрок помечен как импортированный (вне топов)' : 'Метка импорта снята (включен в топы)', 'success', 'Admin');
      const p = adminCachedPlayers.find(x => x.docId === docId);
      if (p) p.hasImportedData = nextImportedState;
      renderAdminPlayersList();
    }
  } catch (e) {
    showSiteToast('Ошибка: ' + e.message, 'error', 'Admin');
  }
}

// ─── ГЛОБАЛЬНЫЙ АНОНС ───
function saveAdminAnnouncement() {
  const enabled = document.getElementById('adminAnnouncementEnabled')?.checked || false;
  const text = (document.getElementById('adminAnnouncementText')?.value || '').trim();
  const style = document.getElementById('adminAnnouncementStyle')?.value || 'cyber';

  const payload = { enabled, text, style, timestamp: Date.now() };
  localStorage.setItem('site_global_announcement', JSON.stringify(payload));
  renderGlobalAnnouncement();
  showSiteToast('Глобальное объявление сохранено!', 'success', 'Анонс');
}

function loadAdminAnnouncementUI() {
  try {
    const raw = localStorage.getItem('site_global_announcement');
    if (raw) {
      const data = JSON.parse(raw);
      const en = document.getElementById('adminAnnouncementEnabled');
      const tx = document.getElementById('adminAnnouncementText');
      const st = document.getElementById('adminAnnouncementStyle');
      if (en) en.checked = !!data.enabled;
      if (tx) tx.value = data.text || '';
      if (st) st.value = data.style || 'cyber';
    }
  } catch (e) {}
}

function renderGlobalAnnouncement() {
  const bar = document.getElementById('siteGlobalAnnouncementBar');
  const textEl = document.getElementById('siteAnnouncementText');
  const iconEl = document.getElementById('siteAnnouncementIcon');
  if (!bar || !textEl) return;

  try {
    const raw = localStorage.getItem('site_global_announcement');
    if (!raw) {
      bar.classList.add('hidden');
      return;
    }
    const data = JSON.parse(raw);
    if (!data.enabled || !data.text) {
      bar.classList.add('hidden');
      return;
    }

    textEl.textContent = data.text;
    bar.classList.remove('hidden', 'bg-gradient-to-r', 'from-purple-900', 'from-red-900', 'from-amber-900', 'from-emerald-900');

    if (data.style === 'gold') {
      bar.className = 'w-full py-2 px-4 text-center text-xs font-black tracking-wide relative z-40 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black shadow-lg shadow-amber-500/20';
      if (iconEl) iconEl.textContent = '👑';
    } else if (data.style === 'alert') {
      bar.className = 'w-full py-2 px-4 text-center text-xs font-black tracking-wide relative z-40 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white shadow-lg shadow-red-500/20';
      if (iconEl) iconEl.textContent = '⚠️';
    } else if (data.style === 'emerald') {
      bar.className = 'w-full py-2 px-4 text-center text-xs font-black tracking-wide relative z-40 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 text-white shadow-lg shadow-emerald-500/20';
      if (iconEl) iconEl.textContent = '🟢';
    } else {
      // cyber
      bar.className = 'w-full py-2 px-4 text-center text-xs font-black tracking-wide relative z-40 bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-800 text-white border-b border-purple-500/30 shadow-lg';
      if (iconEl) iconEl.textContent = '🟣';
    }
  } catch (e) {
    bar.classList.add('hidden');
  }
}

// ─── ГЛОБАЛЬНЫЙ ЭКСПОРТ ДЛЯ ИНЛАЙН-ОБРАБОТЧИКОВ (HTML onclick) ───
window.openAdminDashboardModal = openAdminDashboardModal;
window.closeAdminDashboardModal = closeAdminDashboardModal;
window.switchAdminTab = switchAdminTab;
window.fetchAndRenderAdminPlayers = fetchAndRenderAdminPlayers;
window.renderAdminPlayersList = renderAdminPlayersList;
window.adminChangePlayerTitle = adminChangePlayerTitle;
window.adminTogglePlayerVip = adminTogglePlayerVip;
window.adminTogglePlayerImported = adminTogglePlayerImported;
window.saveAdminAnnouncement = saveAdminAnnouncement;
window.loadAdminAnnouncementUI = loadAdminAnnouncementUI;
window.renderGlobalAnnouncement = renderGlobalAnnouncement;

if (typeof window !== 'undefined') {
  window.addEventListener('languageChanged', () => {
    const modal = document.getElementById('adminDashboardModal');
    if (modal && !modal.classList.contains('hidden')) {
      renderAdminPlayersList();
    }
  });
}
