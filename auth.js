/**
 * ═══════════════════════════════════════════════════════════════════════════
 * NANJICORE AUTH ENGINE — АВТОРИЗАЦИЯ, СЕССИИ И УПРАВЛЕНИЕ АККАУНТАМИ
 * Модуль: auth.js (Этап 5.6 архитектурной модуляризации)
 * ═══════════════════════════════════════════════════════════════════════════
 * Содержит:
 *  - Константы версии системы и права Создателя (MrEbardo)
 *  - Валидацию никнеймов и безопасность доступа
 *  - Локальную базу аккаунтов (LocalStorage DB)
 *  - Управление активной сессией игрока (текущий пользователь)
 *  - Сохранение и загрузку состояния профиля (прогресс, паки, настройки)
 *  - Регистрацию, вход и удаление аккаунтов
 *  - Настоящую авторизацию через Google OAuth (Firebase Auth)
 *  - Привязку Google к существующим локальным профилям
 *  - Модальные окна входа/регистрации и настройку аккаунта Google
 * ═══════════════════════════════════════════════════════════════════════════
 */

// === NANJICORE SYSTEM VERSION ===
const SITE_VERSION = '2.5a';
if (typeof window !== 'undefined') {
  window.SITE_VERSION = SITE_VERSION;
}

/**
 * Проверка прав Создателя игры (MrEbardo)
 * @param {Object|null} user - Объект пользователя
 * @returns {boolean}
 */
function isCreatorAccount(user) {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const isGoogle = !!(user.isGoogle || user.googleUid);
  return email === 'creator@example.com' && isGoogle;
}

/**
 * Безопасное экранирование строк для предотвращения XSS инъекций
 * (делегирует в dialogs.js или выполняет базовое экранирование)
 * @param {*} str - Входящая строка
 * @returns {string}
 */
function escapeHtml(str) {
  if (typeof window !== 'undefined' && window.escapeHtml && window.escapeHtml !== escapeHtml) {
    return window.escapeHtml(str);
  }
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Валидация доступности и формата никнейма
 * @param {string} username - Проверяемый никнейм
 * @param {string} userEmail - Почта пользователя
 * @param {string|null} currentUserId - ID текущего пользователя
 * @returns {{ok: boolean, error?: string}}
 */
function checkNicknameAvailability(username, userEmail = '', currentUserId = null) {
  const clean = (username || '').trim();
  const cleanLower = clean.toLowerCase();

  if (clean.length < 2) {
    return { ok: false, error: 'Никнейм должен быть не менее 2 символов!' };
  }
  if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(clean)) {
    return { ok: false, error: 'Никнейм может содержать только буквы, цифры, дефис и подчёркивание!' };
  }

  // Защита имени MrEbardo
  if (cleanLower === 'mrebardo') {
    const email = (userEmail || '').trim().toLowerCase();
    if (email !== 'creator@example.com') {
      return { ok: false, error: 'Никнейм «MrEbardo» зарезервирован исключительно для Создателя игры!' };
    }
  }

  // Проверка уникальности в локальной базе
  const db = getAccountsDB();
  for (const [id, acc] of Object.entries(db)) {
    if (currentUserId && id === currentUserId) continue;
    if ((acc.username || '').trim().toLowerCase() === cleanLower) {
      return { ok: false, error: `Никнейм «${clean}» уже занят другим игроком! Выберите другое имя.` };
    }
  }

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// ЛОКАЛЬНАЯ БАЗА АККАУНТОВ И ТЕКУЩАЯ СЕССИЯ
// ═══════════════════════════════════════════════════════════════

const ACCOUNTS_DB_KEY = 'nanj_accounts_db';
const CURRENT_USER_KEY = 'nanj_current_user_id';

/**
 * Безопасный парсинг JSON из LocalStorage
 * @param {string} key 
 * @param {*} fallback 
 * @returns {*}
 */
function safeAccountsJsonParse(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return fallback;
    const parsed = JSON.parse(item);
    return parsed !== null ? parsed : fallback;
  } catch (e) {
    return fallback;
  }
}

/**
 * Получить полную базу локальных аккаунтов
 * @returns {Object.<string, Object>}
 */
function getAccountsDB() {
  return safeAccountsJsonParse(ACCOUNTS_DB_KEY, {});
}

/**
 * Сохранить базу аккаунтов
 * @param {Object.<string, Object>} db 
 */
function saveAccountsDB(db) {
  localStorage.setItem(ACCOUNTS_DB_KEY, JSON.stringify(db));
}

/**
 * Получить ID активного пользователя
 * @returns {string|null}
 */
function getCurrentUserId() {
  return localStorage.getItem(CURRENT_USER_KEY);
}

/**
 * Установить активного пользователя в сессии
 * @param {string|null} id 
 */
function setCurrentUserId(id) {
  if (id) {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

/**
 * Получить данные текущего активного пользователя
 * @returns {Object|null}
 */
function getCurrentUser() {
  const id = getCurrentUserId();
  if (!id) return null;
  const db = getAccountsDB();
  return db[id] || null;
}

/**
 * Дефолтный чистый набор данных для нового аккаунта
 * @returns {Object}
 */
function getFreshAccountDefaultData() {
  return {
    achState: {
      tanjiroClicks: 0,
      wheelSpins: 0,
      stalkerVisited: [],
      testedFonts: [],
      badWordCount: 0,
      tabPlays: { tanjiro: 0, jenna: 0, custom: 0 },
      unlocked: {}
    },
    packs: [
      { id: 'pack_default_1', title: 'Участники и друзья', type: 'names', names: ['Эбардо', 'Танджиро', 'Алекс', 'Матвей', 'Костя', 'Винзли'], roles: [], active: true },
      { id: 'pack_default_2', title: 'Геймерские роли', type: 'roles', names: [], roles: ['Главный кодер', 'Повелитель багов', 'Спит в войсе', 'Тащит катку', 'АФК игрок', 'Легенда сервера'], active: true },
      { id: 'pack_default_3', title: 'Мемная пати (Комбо)', type: 'both', names: ['Саня', 'Игорь', 'Дед', 'Лерка'], roles: ['Танцует брейк', 'Поёт опенинги', 'Донатит миллионы', 'Забыл микрофон'], active: false }
    ],
    achEffects: {
      stars: false,
      rgb: false,
      cyberpunk: false,
      shake: true,
      confetti: true,
      hotkeys: true,
      fullscreen: true,
      turbo: true,
      dual: true,
      infinite: true
    },
    siteSelectedFont: 'font-default',
    click_sound_pack: 'classic',
    app_volume_percent: (typeof soundManager !== 'undefined' && soundManager) ? soundManager.volumePercent : (parseInt(localStorage.getItem('app_volume_percent'), 10) || 50),
    theme: 'dark',
    sitePhotoBg: null,
    tabCustomPhoto: null,
    tabModes: { tanjiro: 'wheel', jenna: 'button', custom: 'wheel' },
    customExclusion: { names: false, roles: false },
    customPity: false
  };
}

// ═══════════════════════════════════════════════════════════════
// СОХРАНЕНИЕ И ЗАГРУЗКА ДАННЫХ ПОЛЬЗОВАТЕЛЯ
// ═══════════════════════════════════════════════════════════════

/**
 * Сохранить все игровые и визуальные настройки активного пользователя в базу
 */
function saveCurrentUserData() {
  const user = getCurrentUser();
  if (!user) return;

  const db = getAccountsDB();
  if (!db[user.id]) db[user.id] = user;

  const now = Date.now();
  db[user.id].data = {
    achState: typeof achState !== 'undefined' ? achState : null,
    packs: typeof userPacks !== 'undefined' ? userPacks : null,
    achEffects: typeof achEffects !== 'undefined' ? achEffects : null,
    siteSelectedFont: localStorage.getItem('siteSelectedFont') || 'font-default',
    click_sound_pack: (typeof soundManager !== 'undefined' && soundManager.soundPack) ? soundManager.soundPack : (localStorage.getItem('click_sound_pack') || 'classic'),
    app_volume_percent: typeof soundManager !== 'undefined' && soundManager ? soundManager.volumePercent : 50,
    theme: localStorage.getItem('theme') || 'dark',
    sitePhotoBg: localStorage.getItem('sitePhotoBg') || null,
    tabCustomPhoto: localStorage.getItem('tabCustomPhoto') || null,
    tabModes: typeof tabModes !== 'undefined' ? tabModes : { tanjiro: 'wheel', jenna: 'button', custom: 'wheel' },
    customExclusion: {
      names: localStorage.getItem('custom_exclusion_names') === 'true',
      roles: localStorage.getItem('custom_exclusion_roles') === 'true'
    },
    customPity: localStorage.getItem('custom_pity_protection') === 'true'
  };

  db[user.id].updatedAt = now;

  // Синхронизируем связанные алиасы аккаунта в локальной базе
  for (const [k, acc] of Object.entries(db)) {
    if (k !== user.id && acc && (acc.linkedAccountId === user.id || (acc.username && user.username && acc.username.toLowerCase() === user.username.toLowerCase()))) {
      db[k].data = db[user.id].data;
      db[k].updatedAt = now;
    }
  }

  saveAccountsDB(db);

  // Автоматическая дебаунс-синхронизация с Firestore для привязанных к Google аккаунтов
  if (user.isGoogle) {
    const debouncedSyncFn = typeof debouncedSyncUserToCloud === 'function' 
      ? debouncedSyncUserToCloud 
      : (typeof window !== 'undefined' ? window.debouncedSyncUserToCloud : null);
    if (debouncedSyncFn) {
      debouncedSyncFn(db[user.id]);
    }
  }
}

/**
 * Загрузить данные выбранного пользователя в активное окружение сайта
 * @param {string} userId - ID пользователя
 * @returns {boolean}
 */
function loadUserData(userId) {
  const db = getAccountsDB();
  const user = db[userId];
  if (!user) return false;

  setCurrentUserId(userId);
  const defaults = getFreshAccountDefaultData();
  const uData = user.data || defaults;

  // 1. Достижения: строго изолированные данные этого профиля
  const targetAch = uData.achState || defaults.achState;
  achState = {
    tanjiroClicks: typeof targetAch.tanjiroClicks === 'number' ? targetAch.tanjiroClicks : 0,
    wheelSpins: typeof targetAch.wheelSpins === 'number' ? targetAch.wheelSpins : 0,
    stalkerVisited: Array.isArray(targetAch.stalkerVisited) ? [...targetAch.stalkerVisited] : [],
    testedFonts: Array.isArray(targetAch.testedFonts) ? [...targetAch.testedFonts] : [],
    badWordCount: typeof targetAch.badWordCount === 'number' ? targetAch.badWordCount : 0,
    tabPlays: {
      tanjiro: targetAch.tabPlays?.tanjiro || 0,
      jenna: targetAch.tabPlays?.jenna || 0,
      custom: targetAch.tabPlays?.custom || 0
    },
    unlocked: { ...(targetAch.unlocked || {}) }
  };
  localStorage.setItem('user_achievements_state', JSON.stringify(achState));

  // 2. Паки
  if (Array.isArray(uData.packs)) {
    userPacks = JSON.parse(JSON.stringify(uData.packs));
  } else {
    userPacks = JSON.parse(JSON.stringify(defaults.packs));
  }
  localStorage.setItem('custom_saved_packs', JSON.stringify(userPacks));

  // 3. Эффекты
  if (uData.achEffects) {
    achEffects = { ...defaults.achEffects, ...uData.achEffects };
  } else {
    achEffects = { ...defaults.achEffects };
  }
  localStorage.setItem('ach_effects_settings', JSON.stringify(achEffects));

  // 4. Шрифт и звук
  const fontToApply = uData.siteSelectedFont || 'font-default';
  if (typeof applySiteFont === 'function') {
    applySiteFont(fontToApply);
  }
  localStorage.setItem('siteSelectedFont', fontToApply);

  const localStoredVol = parseInt(localStorage.getItem('app_volume_percent'), 10);
  const vol = (typeof uData.app_volume_percent === 'number')
    ? uData.app_volume_percent
    : (!isNaN(localStoredVol) ? localStoredVol : 50);
  uData.app_volume_percent = vol;

  const packToApply = uData.click_sound_pack || localStorage.getItem('click_sound_pack') || 'classic';
  if (typeof soundManager !== 'undefined' && soundManager) {
    soundManager.setVolume(vol);
    soundManager.setSoundPack(packToApply);
  }
  if (typeof updateSoundPackUI === 'function') {
    updateSoundPackUI();
  }
  if (typeof updateVolumeUI === 'function') {
    updateVolumeUI();
  }

  // 5. Режимы вкладок
  const modes = uData.tabModes || defaults.tabModes;
  if (typeof tabModes !== 'undefined') {
    Object.assign(tabModes, modes);
    if (typeof updateTabModeUI === 'function') {
      updateTabModeUI('tanjiro', tabModes.tanjiro);
      updateTabModeUI('jenna', tabModes.jenna);
      updateTabModeUI('custom', tabModes.custom);
    }
  }

  // 6. Фото фона
  if (uData.sitePhotoBg) {
    document.body.style.backgroundImage = `url(${uData.sitePhotoBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
    localStorage.setItem('sitePhotoBg', uData.sitePhotoBg);
  } else {
    document.body.style.backgroundImage = '';
    localStorage.removeItem('sitePhotoBg');
  }

  if (uData.tabCustomPhoto && typeof applyTabPhoto === 'function') {
    applyTabPhoto(uData.tabCustomPhoto);
    localStorage.setItem('tabCustomPhoto', uData.tabCustomPhoto);
  } else {
    document.querySelectorAll('.tab-content').forEach(c => c.style.backgroundImage = '');
    localStorage.removeItem('tabCustomPhoto');
  }

  // 7. Алгоритмы кастома
  const exNames = uData.customExclusion?.names || false;
  const exRoles = uData.customExclusion?.roles || false;
  localStorage.setItem('custom_exclusion_names', exNames ? 'true' : 'false');
  localStorage.setItem('custom_exclusion_roles', exRoles ? 'true' : 'false');
  const exNamesEl = document.getElementById('customExclusionNamesToggle');
  const exRolesEl = document.getElementById('customExclusionRolesToggle');
  if (exNamesEl) exNamesEl.checked = exNames;
  if (exRolesEl) exRolesEl.checked = exRoles;

  const pity = uData.customPity || false;
  localStorage.setItem('custom_pity_protection', pity ? 'true' : 'false');
  const pityToggle = document.getElementById('customPityToggle');
  if (pityToggle) pityToggle.checked = pity;

  // 8. Обновление UI
  if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
  if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
  if (typeof applyAllActiveEffects === 'function') applyAllActiveEffects();
  if (typeof renderPacksList === 'function') renderPacksList();
  if (typeof initCustomDataFromActivePacks === 'function') initCustomDataFromActivePacks();
  if (typeof renderCustomExclusionChips === 'function') renderCustomExclusionChips();

  // Синхронизация счетчиков кликов Танджиро
  const currentClicks = (typeof achState !== 'undefined' && typeof achState.tanjiroClicks === 'number') ? achState.tanjiroClicks : 0;
  if (typeof window !== 'undefined') {
    if (typeof window.updateTanjiroClickCounter === 'function') {
      window.updateTanjiroClickCounter(currentClicks);
    } else {
      const clickCounter = document.getElementById('clickCounter');
      if (clickCounter) {
        let digits = document.getElementById('clickCounterDigits');
        if (!digits) {
          clickCounter.innerHTML = `<span class="mr-1.5 opacity-90">Нажатий:</span><span id="clickCounterDigits" class="odometer-reel-container font-bold">${currentClicks}</span>`;
        } else {
          digits.textContent = String(currentClicks);
        }
      }
    }
    if ('clickCount' in window) {
      window.clickCount = currentClicks;
    }
  }

  return true;
}

// ═══════════════════════════════════════════════════════════════
// РЕГИСТРАЦИЯ, ВХОД И УДАЛЕНИЕ АККАУНТА
// ═══════════════════════════════════════════════════════════════

/**
 * Создать новый локальный аккаунт
 * @param {string} username 
 * @param {string} password 
 * @param {string} email 
 * @returns {{success: boolean, error?: string, user?: Object}}
 */
function createAccount(username, password, email = '') {
  username = (username || '').trim();
  password = (password || '').trim();
  email = (email || '').trim().toLowerCase();

  if (!username || !password) {
    return { success: false, error: 'Заполните все обязательные поля!' };
  }
  if (username.length < 2) {
    return { success: false, error: 'Никнейм должен быть не менее 2 символов!' };
  }
  if (!/^[a-zA-Zа-яА-Я0-9_-]+$/.test(username)) {
    return { success: false, error: 'Никнейм может содержать только буквы, цифры, дефис и подчёркивание!' };
  }
  if (password.length < 6) {
    return { success: false, error: 'Пароль должен содержать минимум 6 символов!' };
  }
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Введите корректный адрес электронной почты!' };
  }

  const db = getAccountsDB();
  const lowerUser = username.toLowerCase();

  // Проверка уникальности никнейма и почты локально
  for (const acc of Object.values(db)) {
    if (acc.username.toLowerCase() === lowerUser) {
      return { success: false, error: 'Пользователь с таким никнеймом уже зарегистрирован!' };
    }
    if (email && acc.email && acc.email.toLowerCase() === email) {
      return { success: false, error: 'Аккаунт с такой почтой уже существует! Войдите в него.' };
    }
  }

  const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const defaults = getFreshAccountDefaultData();
  const randomColorFn = typeof getRandomColor === 'function' ? getRandomColor : (typeof window !== 'undefined' ? window.getRandomColor : () => '#6366f1');

  const newUser = {
    id: userId,
    username: username,
    tag: '@' + (username.toLowerCase().replace(/\s+/g, '_').substring(0, 15) || 'user'),
    password: password,
    email: email,
    isGoogle: false,
    googleUid: null,
    avatarType: 'color',
    avatarColor: randomColorFn ? randomColorFn() : '#6366f1',
    avatarImage: null,
    avatarPreset: null,
    avatarFrame: 'none',
    bannerType: 'gradient',
    bannerGradient: 'cyber',
    bannerImage: null,
    bio: '',
    moodStatus: 'gaming',
    favCharacter: 'Танджиро Камадо',
    playerTitle: 'none',
    telegramLink: '',
    cardStyle: 'standard',
    showcaseAch: 'universal',
    privacyHideStats: false,
    privacyHideDate: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: defaults
  };

  db[userId] = newUser;
  saveAccountsDB(db);
  loadUserData(userId);

  const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
  if (syncFn) syncFn(newUser);

  return { success: true, user: newUser };
}

/**
 * Создать локальный профиль без регистрации (Гостевой режим)
 * @param {string} [rawNickname] - Никнейм
 * @returns {{success: boolean, error?: string, user?: Object}}
 */
function createGuestAccount(rawNickname = '') {
  let cleanName = (rawNickname || '').trim();
  
  if (!cleanName) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    cleanName = `Игрок_${randomSuffix}`;
  }

  // Защита от спецсимволов
  cleanName = cleanName.replace(/[^a-zA-Zа-яА-Я0-9_\-\s]/g, '').trim().slice(0, 20);
  if (cleanName.length < 2) {
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    cleanName = `Игрок_${randomSuffix}`;
  }

  // Защита зарезервированного имени MrEbardo
  if (cleanName.toLowerCase() === 'mrebardo') {
    return { success: false, error: 'Никнейм «MrEbardo» зарезервирован исключительно для Создателя игры!' };
  }

  const db = getAccountsDB();
  const lowerName = cleanName.toLowerCase();

  // Если имя уже есть в локальной базе — добавляем уникальный суффикс
  for (const acc of Object.values(db)) {
    if ((acc.username || '').toLowerCase() === lowerName) {
      cleanName = `${cleanName}_${Math.floor(10 + Math.random() * 90)}`;
      break;
    }
  }

  const userId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const defaults = getFreshAccountDefaultData();
  const randomColorFn = typeof getRandomColor === 'function' ? getRandomColor : (typeof window !== 'undefined' ? window.getRandomColor : () => '#6366f1');

  const newUser = {
    id: userId,
    username: cleanName,
    tag: '@' + (cleanName.toLowerCase().replace(/\s+/g, '_').substring(0, 15) || 'local'),
    password: '',
    email: '',
    isGoogle: false,
    googleUid: null,
    isGuest: true,
    avatarType: 'color',
    avatarColor: randomColorFn ? randomColorFn() : '#6366f1',
    avatarImage: null,
    avatarPreset: null,
    avatarFrame: 'none',
    bannerType: 'gradient',
    bannerGradient: 'cyber',
    bannerImage: null,
    bio: 'Локальный профиль',
    moodStatus: 'gaming',
    favCharacter: 'Танджиро Камадо',
    playerTitle: 'none',
    telegramLink: '',
    cardStyle: 'standard',
    showcaseAch: 'universal',
    privacyHideStats: false,
    privacyHideDate: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: defaults
  };

  db[userId] = newUser;
  saveAccountsDB(db);
  loadUserData(userId);

  return { success: true, user: newUser };
}

/**
 * Открыть модальное окно предупреждения перед пропуском регистрации
 */
function openGuestWarningModal() {
  const modal = document.getElementById('guestWarningModal');
  const input = document.getElementById('guestNicknameInput');
  const alertEl = document.getElementById('guestWarningAlert');
  if (alertEl) alertEl.classList.add('hidden');
  if (input) input.value = '';

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (input) setTimeout(() => input.focus(), 150);
  }
}

/**
 * Закрыть модальное окно предупреждения перед пропуском регистрации
 */
function closeGuestWarningModal() {
  const modal = document.getElementById('guestWarningModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/**
 * Подтвердить создание локального профиля и начать игру
 */
function handleConfirmGuest() {
  const input = document.getElementById('guestNicknameInput');
  const alertEl = document.getElementById('guestWarningAlert');
  const rawName = (input?.value || '').trim();

  const res = createGuestAccount(rawName);
  if (!res.success) {
    if (alertEl) {
      alertEl.textContent = res.error || 'Ошибка создания локального профиля!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  closeGuestWarningModal();
  closeAuthModal();

  if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
  if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
  if (typeof renderPacksList === 'function') renderPacksList();

  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
  if (toastFn) {
    toastFn(`Добро пожаловать, ${res.user.username}! Вы играете в локальном режиме.`, 'info', 'Локальный режим');
  }
}


/**
 * Удалить аккаунт пользователя
 * @param {string} userId - ID удаляемого аккаунта
 */
function deleteAccount(userId) {
  const db = getAccountsDB();
  const targetId = userId || getCurrentUserId();
  const userToDelete = db[targetId];
  if (!userToDelete) return;

  const confirmFn = typeof window !== 'undefined' && window.showConfirmDialog ? window.showConfirmDialog : null;
  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);

  const performDelete = () => {
    delete db[targetId];
    saveAccountsDB(db);

    const remaining = Object.values(db);
    if (remaining.length > 0) {
      loadUserData(remaining[0].id);
      if (typeof closeUserProfileModal === 'function') closeUserProfileModal();
      if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
      if (toastFn) toastFn(`Аккаунт «${userToDelete.username}» успешно удалён. Вы переключены на профиль «${remaining[0].username}».`, 'info', 'Удаление аккаунта');
    } else {
      setCurrentUserId(null);
      localStorage.removeItem('user_achievements_state');
      localStorage.removeItem('custom_saved_packs');
      localStorage.removeItem('ach_effects_settings');
      localStorage.removeItem('sitePhotoBg');
      localStorage.removeItem('tabCustomPhoto');

      const defaults = getFreshAccountDefaultData();
      if (typeof achState !== 'undefined') achState = JSON.parse(JSON.stringify(defaults.achState));
      if (typeof userPacks !== 'undefined') userPacks = JSON.parse(JSON.stringify(defaults.packs));
      if (typeof achEffects !== 'undefined') achEffects = JSON.parse(JSON.stringify(defaults.achEffects));

      if (typeof closeUserProfileModal === 'function') closeUserProfileModal();
      if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
      openAuthModal();
      if (toastFn) toastFn(`Аккаунт «${userToDelete.username}» удалён. В базе больше нет сохранённых аккаунтов.`, 'info', 'Удаление аккаунта');
    }
  };

  if (confirmFn) {
    confirmFn({
      title: 'Удалить аккаунт?',
      message: `Вы действительно хотите навсегда удалить аккаунт «${userToDelete.username}» со всеми достижениями, паками и настройками? Это действие необратимо.`,
      confirmText: 'Удалить навсегда',
      cancelText: 'Отмена',
      isDanger: true,
      onConfirm: performDelete
    });
  } else {
    if (confirm(`Вы действительно хотите навсегда удалить аккаунт «${userToDelete.username}»?`)) {
      performDelete();
    }
  }
}

/**
 * Вход в аккаунт с поддержкой локального поиска и облака Firestore (включая REST fallback)
 * @param {string} loginIdentifier - Почта или никнейм
 * @param {string} password - Пароль
 * @returns {Promise<{success: boolean, error?: string, user?: Object}>}
 */
async function loginAccountCloudAsync(loginIdentifier, password) {
  loginIdentifier = (loginIdentifier || '').trim();
  password = (password || '').trim();

  if (!loginIdentifier || !password) {
    return { success: false, error: 'Введите почту/никнейм и пароль!' };
  }

  const isEmail = loginIdentifier.includes('@');
  const lowerId = loginIdentifier.toLowerCase();
  const db = getAccountsDB();

  // 1. Поиск в локальной базе
  let localUser = null;
  for (const acc of Object.values(db)) {
    if (isEmail && acc.email && acc.email.toLowerCase() === lowerId) {
      localUser = acc;
      break;
    } else if (!isEmail && acc.username.toLowerCase() === lowerId) {
      localUser = acc;
      break;
    }
  }

  // 2. Поиск в облаке Firestore
  let cloudUser = null;
  const cDb = (typeof cloudDb !== 'undefined' && cloudDb) ? cloudDb : (typeof window !== 'undefined' ? window.cloudDb : null);
  if (cDb) {
    try {
      if (isEmail) {
        const emailSnap = await cDb.collection('nanj_users').doc('email_' + encodeURIComponent(lowerId)).get();
        if (emailSnap.exists) cloudUser = emailSnap.data();
        if (!cloudUser) {
          const qSnap = await cDb.collection('nanj_users').where('email', '==', lowerId).limit(1).get();
          if (!qSnap.empty) cloudUser = qSnap.docs[0].data();
        }
      } else {
        const docSnap = await cDb.collection('nanj_users').doc(lowerId).get();
        if (docSnap.exists) cloudUser = docSnap.data();
      }
    } catch (e) {
      console.warn('SDK login search note:', e);
    }
  }

  // REST fallback для облака
  const restFetchFn = typeof fetchUserFromFirestoreRest === 'function' ? fetchUserFromFirestoreRest : (typeof window !== 'undefined' ? window.fetchUserFromFirestoreRest : null);
  if (!cloudUser && restFetchFn) {
    if (isEmail) {
      cloudUser = await restFetchFn('email_' + encodeURIComponent(lowerId));
    } else {
      cloudUser = await restFetchFn(lowerId);
    }
  }

  const target = cloudUser || localUser;
  if (!target) {
    return { success: false, error: 'Аккаунт с такой почтой или никнеймом не найден!' };
  }

  // Защита от Account Takeover: если аккаунт привязан к Google — требуем вход через Google
  if (target.isGoogle || target.googleUid) {
    return { success: false, error: 'Этот аккаунт использует вход через Google. Пожалуйста, войдите через Google!' };
  }

  const cloudPwd = cloudUser ? (cloudUser.password || '') : '';
  const localPwd = localUser ? (localUser.password || '') : '';
  const effectivePassword = (cloudPwd || localPwd);

  if (!effectivePassword) {
    return { success: false, error: 'Пароль для этого аккаунта не найден на данном устройстве. Войдите через Google или восстановите профиль из бэкапа.' };
  }

  if (effectivePassword !== password) {
    return { success: false, error: 'Неверный пароль!' };
  }

  const targetId = target.id || localUser?.id || ('user_' + Date.now());
  const defaults = getFreshAccountDefaultData();
  const existingData = target.data || defaults;

  const finalUser = {
    ...defaults,
    ...target,
    id: targetId,
    password: effectivePassword,
    data: {
      ...defaults,
      ...existingData,
      achState: existingData.achState || defaults.achState,
      packs: existingData.packs || defaults.packs,
      achEffects: existingData.achEffects || defaults.achEffects
    }
  };

  db[targetId] = finalUser;
  saveAccountsDB(db);
  loadUserData(targetId);

  const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
  if (syncFn) syncFn(finalUser);

  return { success: true, user: finalUser };
}

// ═══════════════════════════════════════════════════════════════
// UI ХЕЛПЕРЫ И МОДАЛКИ АВТОРИЗАЦИИ
// ═══════════════════════════════════════════════════════════════

/**
 * Отрисовка списка сохранённых на устройстве аккаунтов
 */
function renderSavedAccountsList() {
  const db = getAccountsDB();
  const list = document.getElementById('savedAccountsList');
  const section = document.getElementById('savedAccountsSection');
  if (!list || !section) return;

  const accounts = Object.values(db);
  if (accounts.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  list.innerHTML = '';
  const currentId = getCurrentUserId();

  accounts.forEach(acc => {
    const isCurrent = acc.id === currentId;
    const item = document.createElement('div');
    item.className = `w-full flex items-center justify-between p-2.5 rounded-xl border transition ${
      isCurrent 
        ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-700 text-indigo-900 dark:text-indigo-200 font-bold shadow-sm' 
        : 'bg-gray-50 dark:bg-gray-700/40 border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
    }`;
    
    const isVip = !!acc.data?.achState?.unlocked?.universal;
    const initial = (acc.username || 'U').charAt(0).toUpperCase();
    const escapeFn = typeof escapeHtml === 'function' ? escapeHtml : (str) => String(str).replace(/[&<>'"]/g, match => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[match]));
    const escapedName = escapeFn(acc.username);
    const escapedTag = escapeFn(acc.tag || (typeof window.t === 'function' ? window.t('guest_modal_badge') : 'Локальный'));
    const frame = acc.avatarFrame || 'none';
    
    let innerAvatarStyle = '';
    let innerAvatarText = '';
    
    const isValidAvatarFn = typeof isValidAvatarImage === 'function' ? isValidAvatarImage : (typeof window !== 'undefined' ? window.isValidAvatarImage : null);
    const avatarPresetsDict = typeof AVATAR_PRESETS !== 'undefined' ? AVATAR_PRESETS : (typeof window !== 'undefined' ? window.AVATAR_PRESETS : null);

    if (acc.avatarImage && isValidAvatarFn && isValidAvatarFn(acc.avatarImage)) {
      innerAvatarStyle = `background-image: url('${escapeFn(acc.avatarImage)}');`;
    } else if (acc.avatarPreset && avatarPresetsDict && avatarPresetsDict[acc.avatarPreset]) {
      const preset = avatarPresetsDict[acc.avatarPreset];
      const safePresetColor = /^#([0-9a-fA-F]{3,8})$/.test(preset.color || '') ? preset.color : '#6366f1';
      innerAvatarStyle = `background-color: ${safePresetColor};`;
      innerAvatarText = escapeFn(preset.text);
    } else {
      const safeColor = /^#([0-9a-fA-F]{3,8})$/.test(acc.avatarColor || '') ? acc.avatarColor : '#6366f1';
      innerAvatarStyle = `background-color: ${safeColor};`;
      innerAvatarText = escapeFn(initial);
    }
    const ALLOWED_FRAMES = new Set(['none', 'neon', 'gold', 'flame', 'void', 'emerald', 'rainbow']);
    const safeFrame = ALLOWED_FRAMES.has(frame) ? frame : 'none';
    const miniFrameClass = `mini-frame-${safeFrame}`;
    const avatarHtml = `
      <div class="${miniFrameClass} w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
        <div class="w-full h-full rounded-lg overflow-hidden bg-cover bg-center flex items-center justify-center text-white text-xs font-black shadow-inner" style="${innerAvatarStyle}">
          ${innerAvatarText}
        </div>
      </div>
    `;

    item.innerHTML = `
      <div class="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer select-none" data-action="switch">
        ${avatarHtml}
        <div class="min-w-0">
          <div class="text-xs truncate font-bold flex items-center gap-1.5">
            <span>${escapedName}</span>
            ${isVip ? '<span class="px-1 py-0.2 text-[8px] bg-amber-500 text-black rounded font-extrabold">VIP</span>' : ''}
            ${isCurrent ? '<span class="px-1.5 py-0.5 text-[9px] bg-indigo-600 text-white rounded-md font-semibold">Активен</span>' : ''}
          </div>
          <div class="text-[10px] text-gray-400 dark:text-gray-400 truncate">
            ${escapedTag}
          </div>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <button type="button" class="px-2 py-1 text-xs font-bold rounded-lg transition ${isCurrent ? 'text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-600'}" data-action="switch">
          ${isCurrent ? (typeof window.t === 'function' ? window.t('auth_status_selected') : 'Выбран') : (typeof window.t === 'function' ? window.t('auth_tab_login') : 'Войти')}
        </button>
        ${!isCurrent ? `
          <button type="button" class="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition" title="Удалить из сохранённых" data-action="delete">
            <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        ` : ''}
      </div>
    `;

    item.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action]');
      const action = btn ? btn.getAttribute('data-action') : 'switch';
      if (action === 'delete') {
        e.stopPropagation();
        deleteAccount(acc.id);
      } else {
        saveCurrentUserData();
        loadUserData(acc.id);
        closeAuthModal();
        if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
        const pullFn = typeof pullLatestCloudDataForCurrentUser === 'function' 
          ? pullLatestCloudDataForCurrentUser 
          : (typeof window !== 'undefined' ? window.pullLatestCloudDataForCurrentUser : null);
        if (pullFn) pullFn(true);
      }
    });

    list.appendChild(item);
  });
}

/**
 * Вывод алерта в модальном окне авторизации
 * @param {string} type - 'login' | 'register'
 * @param {string} msg - Сообщение
 * @param {boolean} isSuccess - Флаг успеха
 */
function showAuthAlert(type, msg, isSuccess = false) {
  let alertId = 'loginAlert';
  if (type === 'register') alertId = 'regAlert';
  else if (type === 'edit') alertId = 'editProfileAlert';

  const alertEl = document.getElementById(alertId);
  if (!alertEl) return;
  alertEl.textContent = msg;
  alertEl.className = `text-xs p-3 rounded-xl font-medium transition-all ${
    isSuccess 
      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' 
      : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
  }`;
  alertEl.classList.remove('hidden');
}

/**
 * Переключение вкладок Вход / Регистрация
 * @param {string} tab - 'login' | 'register'
 */
function switchAuthTab(tab) {
  const formLogin = document.getElementById('authLoginForm');
  const title = document.getElementById('authModalHeaderTitle');
  const desc = document.getElementById('authModalHeaderDesc');

  if (formLogin) formLogin.classList.remove('hidden');
  if (title) title.textContent = typeof window.t === 'function' ? window.t('auth_modal_title') : 'Вход в аккаунт';
  if (desc) desc.textContent = typeof window.t === 'function' ? window.t('auth_modal_desc') : 'Авторизуйтесь, чтобы продолжить играть и сохранять прогресс';
}

/**
 * Открытие модального окна авторизации
 */
function openAuthModal() {
  const authModal = document.getElementById('authModal');
  const authModalContent = authModal?.querySelector('div');
  if (authModal) {
    renderSavedAccountsList();
    authModal.classList.remove('hidden', 'animate-modal-backdrop-out');
    authModal.classList.add('animate-modal-backdrop-in');
    if (authModalContent) {
      authModalContent.classList.remove('animate-fade-out-scale');
      authModalContent.classList.add('animate-fade-in-scale');
    }
    if (typeof syncBodyScrollLock === 'function') syncBodyScrollLock();
  }
}

/**
 * Закрытие модального окна авторизации
 */
function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  const authModalContent = authModal?.querySelector('div');
  if (authModal) {
    authModal.classList.remove('animate-modal-backdrop-in');
    authModal.classList.add('animate-modal-backdrop-out');
    if (authModalContent) {
      authModalContent.classList.remove('animate-fade-in-scale');
      authModalContent.classList.add('animate-fade-out-scale');
    }
    setTimeout(() => {
      authModal.classList.add('hidden');
      authModal.classList.remove('animate-modal-backdrop-out');
      if (authModalContent) {
        authModalContent.classList.remove('animate-fade-out-scale');
      }
      if (typeof syncBodyScrollLock === 'function') syncBodyScrollLock();
    }, 180);
  }
}

// ═══════════════════════════════════════════════════════════════
// МОДАЛЬНОЕ ОКНО НАСТРОЙКИ НОВОГО GOOGLE АККАУНТА
// ═══════════════════════════════════════════════════════════════

let pendingGoogleSetupData = null;

/**
 * Открыть модалку первичной настройки аккаунта Google (выбор ника и пароля)
 * @param {Object} data 
 */
function openGoogleSetupModal(data) {
  pendingGoogleSetupData = data;
  const modal = document.getElementById('googleSetupModal');
  const emailSpan = document.getElementById('googleSetupEmail');
  const usernameInput = document.getElementById('googleSetupUsername');
  const pwdInput = document.getElementById('googleSetupPassword');
  const pwdConfirm = document.getElementById('googleSetupPasswordConfirm');
  const alertEl = document.getElementById('googleSetupAlert');

  if (emailSpan) emailSpan.textContent = data.gEmail;
  if (usernameInput) usernameInput.value = (data.gName || data.gEmail.split('@')[0] || (typeof window.t === 'function' ? window.t('profile_default_username') : 'Игрок')).trim();
  if (pwdInput) pwdInput.value = '';
  if (pwdConfirm) pwdConfirm.value = '';
  if (alertEl) alertEl.classList.add('hidden');

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (usernameInput) setTimeout(() => usernameInput.focus(), 150);
  }
}

/**
 * Закрыть модалку настройки Google аккаунта
 */
function closeGoogleSetupModal() {
  const modal = document.getElementById('googleSetupModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  pendingGoogleSetupData = null;
}

/**
 * Подтверждение регистрации нового Google аккаунта
 */
async function handleGoogleSetupSubmit() {
  if (!pendingGoogleSetupData) return;

  const usernameInput = document.getElementById('googleSetupUsername');
  const pwdInput = document.getElementById('googleSetupPassword');
  const pwdConfirm = document.getElementById('googleSetupPasswordConfirm');
  const alertEl = document.getElementById('googleSetupAlert');

  const username = (usernameInput?.value || '').trim();
  const pwd = (pwdInput?.value || '').trim();
  const confirm = (pwdConfirm?.value || '').trim();

  if (!username || username.length < 2) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('auth_err_nick_len') : 'Никнейм должен содержать минимум 2 символа!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  const { uid, gEmail, photoURL, defaults } = pendingGoogleSetupData;
  const targetId = 'google_' + uid;

  const db = getAccountsDB();
  const nickCheck = checkNicknameAvailability(username, gEmail, targetId);
  if (!nickCheck.ok) {
    if (alertEl) {
      alertEl.textContent = nickCheck.error;
      alertEl.classList.remove('hidden');
    }
    return;
  }

  const nameTaken = Object.values(db).some(acc => acc.username.toLowerCase() === username.toLowerCase());
  if (nameTaken) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('auth_err_nick_exists') : 'Пользователь с таким никнеймом уже существует! Выберите другое имя.';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  if (!pwd || pwd.length < 6) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('auth_err_pwd_len') : 'Пароль должен содержать минимум 6 символов!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  if (pwd !== confirm) {
    if (alertEl) {
      alertEl.textContent = typeof window.t === 'function' ? window.t('auth_err_pwd_mismatch') : 'Пароли не совпадают!';
      alertEl.classList.remove('hidden');
    }
    return;
  }

  const finalAccount = {
    id: targetId,
    googleUid: uid,
    username: username,
    tag: '@' + (username.toLowerCase().replace(/\s+/g, '_').substring(0, 15) || 'google'),
    password: pwd,
    email: gEmail,
    isGoogle: true,
    avatarType: photoURL ? 'image' : 'color',
    avatarColor: '#4285F4',
    avatarImage: photoURL,
    avatarPreset: null,
    avatarFrame: 'none',
    bannerType: 'gradient',
    bannerGradient: 'cyber',
    bannerImage: null,
    bio: 'Профиль привязан к Google Аккаунту',
    moodStatus: 'gaming',
    favCharacter: 'Эбардо',
    playerTitle: 'none',
    telegramLink: '',
    cardStyle: 'standard',
    showcaseAch: 'universal',
    privacyHideStats: false,
    privacyHideDate: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    data: defaults
  };

  db[targetId] = finalAccount;
  saveAccountsDB(db);
  loadUserData(targetId);

  const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
  if (syncFn) syncFn(finalAccount);

  closeGoogleSetupModal();
  if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
  if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
  if (typeof renderPacksList === 'function') renderPacksList();

  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
  if (toastFn) toastFn(`Добро пожаловать, ${username}! Аккаунт успешно создан через Google.`, 'success', 'Регистрация завершена');
}

// ═══════════════════════════════════════════════════════════════
// GOOGLE AUTH & СВЯЗЫВАНИЕ АККАУНТОВ (FIREBASE AUTH)
// ═══════════════════════════════════════════════════════════════

/**
 * Авторизация через Google (Firebase Auth Popup)
 */
async function handleGoogleAuth() {
  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);

  if (typeof firebase === 'undefined' || !firebase.auth) {
    if (toastFn) toastFn('Модуль Firebase Auth не загружен. Проверьте интернет-соединение или VPN!', 'error', 'Ошибка Google Auth');
    return;
  }

  const googleAuthBtn = document.getElementById('googleAuthBtn');
  const googleAuthBtnText = document.getElementById('googleAuthBtnText');
  const origText = googleAuthBtnText ? googleAuthBtnText.textContent : (typeof window.t === 'function' ? window.t('auth_btn_google') : 'Продолжить с Google');
  if (googleAuthBtnText) googleAuthBtnText.textContent = typeof window.t === 'function' ? window.t('auth_google_connecting') : 'Подключение к Google...';
  if (googleAuthBtn) googleAuthBtn.disabled = true;

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const result = await firebase.auth().signInWithPopup(provider);
    const gUser = result.user;
    if (!gUser) {
      throw new Error('Не удалось получить данные Google профиля');
    }

    const uid = gUser.uid;
    const gEmail = (gUser.email || '').trim().toLowerCase();
    const gName = (gUser.displayName || '').trim();
    const photoURL = gUser.photoURL || null;
    const db = getAccountsDB();
    const defaults = getFreshAccountDefaultData();

    // 1. Ищем существующий аккаунт в локальной базе по email или googleUid
    let matchedLocalUser = null;
    for (const [id, acc] of Object.entries(db)) {
      const accEmail = (acc.email || '').trim().toLowerCase();
      if (acc.googleUid === uid || (gEmail && accEmail === gEmail)) {
        matchedLocalUser = acc;
        break;
      }
    }

    // 2. Ищем существующий аккаунт в облаке Firestore
    let matchedCloudUser = null;
    const cDb = (typeof cloudDb !== 'undefined' && cloudDb) ? cloudDb : (typeof window !== 'undefined' ? window.cloudDb : null);
    if (cDb) {
      try {
        if (gEmail) {
          const emailDoc = await cDb.collection('nanj_users').doc('email_' + encodeURIComponent(gEmail)).get();
          if (emailDoc.exists) matchedCloudUser = emailDoc.data();
        }
        if (!matchedCloudUser && uid) {
          const uidDoc = await cDb.collection('nanj_users').doc('google_uid_' + encodeURIComponent(uid)).get();
          if (uidDoc.exists) matchedCloudUser = uidDoc.data();
        }
        if (!matchedCloudUser && gEmail) {
          const qSnap = await cDb.collection('nanj_users').where('email', '==', gEmail).limit(1).get();
          if (!qSnap.empty) matchedCloudUser = qSnap.docs[0].data();
        }
        if (!matchedCloudUser && uid) {
          const qSnap2 = await cDb.collection('nanj_users').where('googleUid', '==', uid).limit(1).get();
          if (!qSnap2.empty) matchedCloudUser = qSnap2.docs[0].data();
        }
      } catch (e) {
        console.warn('Firestore SDK search warning:', e);
      }
    }

    // REST Fallback
    const restFetchFn = typeof fetchUserFromFirestoreRest === 'function' ? fetchUserFromFirestoreRest : (typeof window !== 'undefined' ? window.fetchUserFromFirestoreRest : null);
    if (!matchedCloudUser && gEmail && restFetchFn) {
      matchedCloudUser = await restFetchFn('email_' + encodeURIComponent(gEmail));
    }
    if (!matchedCloudUser && uid && restFetchFn) {
      matchedCloudUser = await restFetchFn('google_uid_' + encodeURIComponent(uid));
    }

    // 3. Выбираем целевой аккаунт
    const existing = matchedCloudUser || matchedLocalUser;
    let finalAccount = null;

    if (existing) {
      const targetId = existing.id || matchedLocalUser?.id || ('user_' + Date.now());
      const existingData = existing.data || matchedLocalUser?.data || defaults;
      
      finalAccount = {
        ...defaults,
        ...existing,
        ...(matchedLocalUser || {}),
        id: targetId,
        googleUid: uid,
        email: gEmail,
        isGoogle: true,
        username: existing.username || matchedLocalUser?.username || gName || 'Игрок',
        data: {
          ...defaults,
          ...existingData,
          achState: existingData.achState || defaults.achState,
          packs: existingData.packs || defaults.packs,
          achEffects: existingData.achEffects || defaults.achEffects
        }
      };

      if (!finalAccount.avatarImage && !finalAccount.avatarPreset && photoURL) {
        finalAccount.avatarImage = photoURL;
        finalAccount.avatarType = 'image';
      }

      db[targetId] = finalAccount;
      saveAccountsDB(db);
      loadUserData(targetId);

      const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
      if (syncFn) syncFn(finalAccount);

      closeAuthModal();
      if (toastFn) toastFn(`С возвращением, ${finalAccount.username}! Вход выполнен через Google (${gEmail}).`, 'success', 'Google Авторизация');
    } else {
      closeAuthModal();
      openGoogleSetupModal({
        uid,
        gEmail,
        gName,
        photoURL,
        defaults
      });
      return;
    }

    if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
    if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
    if (typeof renderPacksList === 'function') renderPacksList();

  } catch (err) {
    console.error('Google Auth Error:', err);
    let msg = err?.message || 'Неизвестная ошибка';
    if (err?.code === 'auth/popup-closed-by-user') {
      msg = 'Окно авторизации Google было закрыто';
    } else if (err?.code === 'auth/unauthorized-domain') {
      msg = 'Домен не добавлен в список разрешённых в Firebase Console';
    } else if (err?.code === 'auth/configuration-not-found') {
      msg = 'Включите провайдер Google в Firebase Authentication';
    }
    if (toastFn) toastFn(msg, 'error', 'Ошибка входа Google');
  } finally {
    if (googleAuthBtnText) googleAuthBtnText.textContent = origText;
    if (googleAuthBtn) googleAuthBtn.disabled = false;
  }
}

/**
 * Привязка Google аккаунта к текущему активному профилю
 */
async function handleLinkGoogleToCurrentAccount() {
  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
  const currentUser = getCurrentUser();
  if (!currentUser) {
    if (toastFn) toastFn('Сначала войдите в профиль!', 'error', 'Ошибка');
    return;
  }

  if (typeof firebase === 'undefined' || !firebase.auth) {
    if (toastFn) toastFn('Модуль Firebase Auth не загружен. Проверьте интернет или VPN!', 'error', 'Ошибка');
    return;
  }

  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.addScope('profile');
    provider.addScope('email');

    const result = await firebase.auth().signInWithPopup(provider);
    const gUser = result.user;
    if (!gUser) throw new Error('Не удалось получить данные Google');

    const uid = gUser.uid;
    const email = gUser.email || '';
    const photoURL = gUser.photoURL || null;

    currentUser.isGoogle = true;
    currentUser.googleUid = uid;
    if (email) currentUser.email = email;

    const db = getAccountsDB();
    db[currentUser.id] = currentUser;

    const googleAlias = {
      ...currentUser,
      id: 'google_' + uid,
      linkedAccountId: currentUser.id
    };
    db['google_' + uid] = googleAlias;

    saveAccountsDB(db);

    const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
    if (syncFn) {
      syncFn(currentUser);
      syncFn(googleAlias);
    }

    if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
    if (toastFn) toastFn(`Google аккаунт (${email || 'Google'}) успешно привязан к «${currentUser.username}»!`, 'success', 'Привязка выполнена');
  } catch (err) {
    console.error('Link Google Error:', err);
    let msg = err?.message || 'Не удалось привязать Google';
    if (err?.code === 'auth/popup-closed-by-user') {
      msg = 'Окно авторизации Google закрыто';
    }
    if (toastFn) toastFn(msg, 'error', 'Ошибка привязки');
  }
}

// ═══════════════════════════════════════════════════════════════
// ИНИЦИАЛИЗАЦИЯ СЛУШАТЕЛЕЙ АВТОРИЗАЦИИ
// ═══════════════════════════════════════════════════════════════

let authListenersInitialized = false;

/**
 * Инициализация всех событий авторизации, переключения вкладок и кнопок
 */
function initAuthListeners() {
  if (authListenersInitialized) return;
  authListenersInitialized = true;

  const loginSubmitBtn = document.getElementById('loginSubmitBtn');
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');
  const profileSwitchAccountBtn = document.getElementById('profileSwitchAccountBtn');
  const googleAuthBtn = document.getElementById('googleAuthBtn');
  const profileLinkGoogleBtn = document.getElementById('profileLinkGoogleBtn');

  // Переключение видимости паролей
  function setupPasswordToggle(btnId, inputId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    if (!btn || !input) return;
    btn.addEventListener('click', () => {
      const isPwd = input.type === 'password';
      input.type = isPwd ? 'text' : 'password';
      const eyeOpen = btn.querySelector('.pwdEyeOpen');
      const eyeClosed = btn.querySelector('.pwdEyeClosed');
      if (eyeOpen) eyeOpen.classList.toggle('hidden', isPwd);
      if (eyeClosed) eyeClosed.classList.toggle('hidden', !isPwd);
    });
  }

  setupPasswordToggle('loginTogglePwdBtn', 'loginPassword');

  // Кнопка "Войти"
  if (loginSubmitBtn) {
    loginSubmitBtn.addEventListener('click', async () => {
      const loginId = document.getElementById('loginUsername')?.value.trim();
      const password = document.getElementById('loginPassword')?.value;

      if (!loginId || !password) {
        showAuthAlert('login', typeof window.t === 'function' ? window.t('auth_err_fields_login') : 'Введите почту/никнейм и пароль!');
        return;
      }
      const res = await loginAccountCloudAsync(loginId, password);
      if (res.success) {
        showAuthAlert('login', `Добро пожаловать, ${res.user.username}!`, true);
        setTimeout(() => {
          closeAuthModal();
          if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
        }, 350);
      } else {
        showAuthAlert('login', res.error);
      }
    });
  }

  // Обработка нажатия Enter в форме входа
  ['loginUsername', 'loginPassword'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') loginSubmitBtn?.click();
    });
  });

  // Кнопка выхода из профиля
  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', async () => {
      const user = getCurrentUser();
      if (user) {
        saveCurrentUserData();
        const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
        if (syncFn) syncFn(user);

        const db = getAccountsDB();
        delete db[user.id];
        
        if (user.googleUid) {
          delete db['google_' + user.googleUid];
        }
        for (const [id, acc] of Object.entries(db)) {
          if (acc.username === user.username || (user.email && acc.email && acc.email.toLowerCase() === user.email.toLowerCase())) {
            delete db[id];
          }
        }
        saveAccountsDB(db);

        if (typeof firebase !== 'undefined' && firebase.auth) {
          try { await firebase.auth().signOut(); } catch (e) {}
        }

        setCurrentUserId(null);

        const defaults = getFreshAccountDefaultData();
        if (typeof achState !== 'undefined') achState = { ...defaults.achState };
        localStorage.setItem('user_achievements_state', JSON.stringify(defaults.achState));

        if (typeof closeUserProfileModal === 'function') closeUserProfileModal();
        if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
        renderSavedAccountsList();
        openAuthModal();

        const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
        if (toastFn) toastFn(`Вы вышли из профиля «${user.username}». Данные надёжно сохранены в облаке!`, 'info', 'Выход выполнен');
      }
    });
  }

  // Кнопка смены аккаунта
  if (profileSwitchAccountBtn) {
    profileSwitchAccountBtn.addEventListener('click', () => {
      saveCurrentUserData();
      if (typeof closeUserProfileModal === 'function') closeUserProfileModal();
      openAuthModal();
    });
  }

  // Кнопки Google Auth
  if (googleAuthBtn) googleAuthBtn.addEventListener('click', handleGoogleAuth);
  if (profileLinkGoogleBtn) profileLinkGoogleBtn.addEventListener('click', handleLinkGoogleToCurrentAccount);

  // Слушатели Google Setup Modal
  const googleSetupSubmitBtn = document.getElementById('googleSetupSubmitBtn');
  const googleSetupCancelBtn = document.getElementById('googleSetupCancelBtn');
  const closeGoogleSetupModalX = document.getElementById('closeGoogleSetupModalX');

  if (googleSetupSubmitBtn) googleSetupSubmitBtn.addEventListener('click', handleGoogleSetupSubmit);
  if (googleSetupCancelBtn) googleSetupCancelBtn.addEventListener('click', closeGoogleSetupModal);
  if (closeGoogleSetupModalX) closeGoogleSetupModalX.addEventListener('click', closeGoogleSetupModal);

  // Переключение видимости паролей в форме Google Setup
  setupPasswordToggle('googleSetupTogglePwdBtn', 'googleSetupPassword');
  setupPasswordToggle('googleSetupToggleConfirmPwdBtn', 'googleSetupPasswordConfirm');

  // Слушатели пропуска регистрации (Локальный профиль)
  const authSkipBtn = document.getElementById('authSkipBtn');
  const confirmGuestBtn = document.getElementById('confirmGuestBtn');
  const cancelGuestBtn = document.getElementById('cancelGuestBtn');
  const closeGuestWarningModalX = document.getElementById('closeGuestWarningModalX');
  const guestNicknameInput = document.getElementById('guestNicknameInput');

  if (authSkipBtn) {
    authSkipBtn.addEventListener('click', () => {
      closeAuthModal();
      openGuestWarningModal();
    });
  }
  if (confirmGuestBtn) confirmGuestBtn.addEventListener('click', handleConfirmGuest);
  if (cancelGuestBtn) {
    cancelGuestBtn.addEventListener('click', () => {
      closeGuestWarningModal();
      openAuthModal();
    });
  }
  if (closeGuestWarningModalX) {
    closeGuestWarningModalX.addEventListener('click', () => {
      closeGuestWarningModal();
      openAuthModal();
    });
  }
  if (guestNicknameInput) {
    guestNicknameInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleConfirmGuest();
    });
  }

  // Инициализация связанных модулей
  if (typeof initVerificationInputs === 'function') initVerificationInputs();
  if (typeof initProfileListeners === 'function') initProfileListeners();
}

// Алиас для обратной совместимости вызовов из монолита
const initAccountsEvents = initAuthListeners;

// ═══════════════════════════════════════════════════════════════
// ЭКСПОРТ В WINDOW И MODULE.EXPORTS
// ═══════════════════════════════════════════════════════════════

if (typeof window !== 'undefined') {
  window.SITE_VERSION = SITE_VERSION;
  window.ACCOUNTS_DB_KEY = ACCOUNTS_DB_KEY;
  window.CURRENT_USER_KEY = CURRENT_USER_KEY;
  window.isCreatorAccount = isCreatorAccount;
  window.escapeHtml = escapeHtml;
  window.checkNicknameAvailability = checkNicknameAvailability;
  window.getAccountsDB = getAccountsDB;
  window.saveAccountsDB = saveAccountsDB;
  window.getCurrentUserId = getCurrentUserId;
  window.setCurrentUserId = setCurrentUserId;
  window.getCurrentUser = getCurrentUser;
  window.getFreshAccountDefaultData = getFreshAccountDefaultData;
  window.saveCurrentUserData = saveCurrentUserData;
  window.loadUserData = loadUserData;
  window.createAccount = createAccount;
  window.deleteAccount = deleteAccount;
  window.loginAccountCloudAsync = loginAccountCloudAsync;
  window.renderSavedAccountsList = renderSavedAccountsList;
  window.showAuthAlert = showAuthAlert;
  window.switchAuthTab = switchAuthTab;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.openGoogleSetupModal = openGoogleSetupModal;
  window.closeGoogleSetupModal = closeGoogleSetupModal;
  window.handleGoogleSetupSubmit = handleGoogleSetupSubmit;
  window.handleGoogleAuth = handleGoogleAuth;
  window.createGuestAccount = createGuestAccount;
  window.openGuestWarningModal = openGuestWarningModal;
  window.closeGuestWarningModal = closeGuestWarningModal;
  window.handleConfirmGuest = handleConfirmGuest;
  window.initAuthListeners = initAuthListeners;
  window.initAccountsEvents = initAccountsEvents;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SITE_VERSION,
    ACCOUNTS_DB_KEY,
    CURRENT_USER_KEY,
    isCreatorAccount,
    escapeHtml,
    checkNicknameAvailability,
    getAccountsDB,
    saveAccountsDB,
    getCurrentUserId,
    setCurrentUserId,
    getCurrentUser,
    getFreshAccountDefaultData,
    saveCurrentUserData,
    loadUserData,
    createAccount,
    createGuestAccount,
    openGuestWarningModal,
    closeGuestWarningModal,
    handleConfirmGuest,
    deleteAccount,
    loginAccountCloudAsync,
    renderSavedAccountsList,
    showAuthAlert,
    switchAuthTab,
    openAuthModal,
    closeAuthModal,
    openGoogleSetupModal,
    closeGoogleSetupModal,
    handleGoogleSetupSubmit,
    handleGoogleAuth,
    handleLinkGoogleToCurrentAccount,
    initAuthListeners,
    initAccountsEvents
  };
}
