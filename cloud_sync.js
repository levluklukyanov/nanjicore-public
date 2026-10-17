// ===============================================================
// NANJICORE: CLOUD SYNC MODULE (FIRESTORE SDK + REST FALLBACK)
// Двухуровневая облачная синхронизация Firestore и REST Fallback
// Вынесен на Этапе 5.4 модуляризации
// ===============================================================

const firebaseConfig = {
  apiKey: "AIzaSyC4auA0UPRvYRKnq_5AfIIeznnbTdAv0-M",
  authDomain: "my-website-46efa.firebaseapp.com",
  projectId: "my-website-46efa",
  storageBucket: "my-website-46efa.firebasestorage.app",
  messagingSenderId: "807999420070",
  appId: "1:807999420070:web:a4801801d44e0011f0e667",
  measurementId: "G-1WHC6MQL28"
};

let cloudDb = null;

/**
 * Рекурсивная очистка объекта от undefined перед отправкой в Firestore
 * @param {*} obj - Исходный объект или значение
 * @returns {*} Очищенный объект без undefined
 */
function sanitizeForFirestore(obj) {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (typeof firebase !== 'undefined' && firebase.firestore && typeof firebase.firestore.FieldValue !== 'undefined' && obj instanceof firebase.firestore.FieldValue) {
    return obj;
  }
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore);
  const clean = {};
  for (const [key, val] of Object.entries(obj)) {
    if (val !== undefined) {
      clean[key] = sanitizeForFirestore(val);
    }
  }
  return clean;
}

// Инициализация Firebase SDK при наличии подключенной библиотеки
try {
  if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length === 0) {
    firebase.initializeApp(firebaseConfig);
    cloudDb = firebase.firestore();
  } else if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
    cloudDb = firebase.firestore();
  }

  // Автоматический слушатель Google Auth: тихая синхронизация при готовности сессии
  if (typeof firebase !== 'undefined' && firebase.auth) {
    firebase.auth().onAuthStateChanged((authUser) => {
      if (authUser) {
        pullLatestCloudDataForCurrentUser(true);
      }
    });
  }
} catch (e) {
  console.warn('Firebase init warning:', e);
}

/**
 * Парсинг типизированных полей документов Firestore REST API
 * @param {Object} f - Поле формата Firestore REST (stringValue, integerValue, mapValue, etc.)
 * @returns {*} Нативное JS значение
 */
function parseFirestoreRestField(f) {
  if (!f) return null;
  if ('stringValue' in f) return f.stringValue;
  if ('integerValue' in f) return parseInt(f.integerValue, 10);
  if ('doubleValue' in f) return parseFloat(f.doubleValue);
  if ('booleanValue' in f) return f.booleanValue;
  if ('nullValue' in f) return null;
  if ('mapValue' in f) {
    const res = {};
    for (const [k, v] of Object.entries(f.mapValue.fields || {})) {
      res[k] = parseFirestoreRestField(v);
    }
    return res;
  }
  if ('arrayValue' in f) {
    return (f.arrayValue.values || []).map(parseFirestoreRestField);
  }
  return null;
}

/**
 * Загрузка документа пользователя напрямую через HTTPS REST API Firestore
 * (гарантированный обход сбоев или блокировок SDK)
 * @param {string} docName - ID документа в коллекции nanj_users
 * @returns {Promise<Object|null>} Распарсенный объект пользователя или null
 */
async function fetchUserFromFirestoreRest(docName) {
  try {
    const url = `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents/nanj_users/${encodeURIComponent(docName)}?key=${firebaseConfig.apiKey}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json.fields) return null;
    const parsed = {};
    for (const [k, v] of Object.entries(json.fields)) {
      parsed[k] = parseFirestoreRestField(v);
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

/**
 * Прямой REST Fallback сохранения пользователя в Firestore
 * @param {string} cleanKey - Ключ/ID документа (обычно никнейм в нижнем регистре)
 * @param {Object} cloudPayload - Санитизированные данные пользователя
 */
async function syncUserToCloudRest(cleanKey, cloudPayload) {
  if (!cloudPayload || !cloudPayload.isGoogle) return;
  const authUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
  if (!authUser) return; // Без активного токена Firebase Auth запрос будет отклонен правилами (403 Forbidden)

  try {
    const headers = { 'Content-Type': 'application/json' };
    try {
      const idToken = await authUser.getIdToken();
      if (idToken) {
        headers['Authorization'] = 'Bearer ' + idToken;
      }
    } catch (_) {}

    const commitUrl = `https://firestore.googleapis.com/v1/projects/my-website-46efa/databases/(default)/documents:commit?key=${firebaseConfig.apiKey}`;
    const docPath = `projects/my-website-46efa/databases/(default)/documents/nanj_users/${encodeURIComponent(cleanKey)}`;
    const firestoreFields = {
      id: { stringValue: cloudPayload.id || '' },
      username: { stringValue: cloudPayload.username || '' },
      tag: { stringValue: cloudPayload.tag || '' },
      email: { stringValue: cloudPayload.email || '' },
      googleUid: { stringValue: cloudPayload.googleUid || '' },
      isGoogle: { booleanValue: !!cloudPayload.isGoogle },
      avatarType: { stringValue: cloudPayload.avatarType || 'color' },
      avatarColor: { stringValue: cloudPayload.avatarColor || '#6366f1' },
      avatarFrame: { stringValue: cloudPayload.avatarFrame || 'none' },
      bannerType: { stringValue: cloudPayload.bannerType || 'gradient' },
      bannerGradient: { stringValue: cloudPayload.bannerGradient || 'cyber' },
      bio: { stringValue: cloudPayload.bio || '' },
      moodStatus: { stringValue: cloudPayload.moodStatus || 'gaming' },
      favCharacter: { stringValue: cloudPayload.favCharacter || 'Танджиро Камадо' },
      playerTitle: { stringValue: cloudPayload.playerTitle || 'none' },
      telegramLink: { stringValue: cloudPayload.telegramLink || '' },
      cardStyle: { stringValue: cloudPayload.cardStyle || 'standard' },
      showcaseAch: { stringValue: cloudPayload.showcaseAch || 'universal' },
      createdAt: { integerValue: String(cloudPayload.createdAt || Date.now()) },
      updatedAt: { integerValue: String(cloudPayload.updatedAt || Date.now()) },
      stats: {
        mapValue: {
          fields: {
            achCount: { integerValue: String(cloudPayload.stats?.achCount || 0) },
            tanjiroClicks: { integerValue: String(cloudPayload.stats?.tanjiroClicks || 0) },
            wheelSpins: { integerValue: String(cloudPayload.stats?.wheelSpins || 0) },
            isVip: { booleanValue: !!cloudPayload.stats?.isVip }
          }
        }
      }
    };

    if (cloudPayload.avatarImage) {
      firestoreFields.avatarImage = { stringValue: cloudPayload.avatarImage };
    }
    if (cloudPayload.avatarPreset) {
      firestoreFields.avatarPreset = { stringValue: cloudPayload.avatarPreset };
    }
    if (cloudPayload.bannerImage) {
      firestoreFields.bannerImage = { stringValue: cloudPayload.bannerImage };
    }

    await fetch(commitUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        writes: [
          {
            update: {
              name: docPath,
              fields: firestoreFields
            },
            updateMask: {
              fieldPaths: Object.keys(firestoreFields)
            },
            updateTransforms: [
              {
                fieldPath: 'lastSync',
                setToServerValue: 'REQUEST_TIME'
              }
            ]
          }
        ]
      })
    });
  } catch(e) {
    console.warn('REST fallback sync error:', e);
  }
}

/**
 * Асинхронная синхронизация всех локальных аккаунтов в Firestore
 */
function syncAllLocalAccountsToCloud() {
  try {
    const getDbFn = typeof getAccountsDB === 'function' ? getAccountsDB : (typeof window !== 'undefined' ? window.getAccountsDB : null);
    if (!getDbFn) return;
    const db = getDbFn();
    Object.values(db).forEach(user => {
      if (user && user.username) {
        syncUserToCloud(user);
      }
    });
  } catch(e) {}
}

/**
 * Синхронизация данных профиля и игровой статистики пользователя в Firestore
 * (сначала через SDK, при сбое — через REST Fallback)
 * @param {Object} user - Объект пользователя
 */
async function syncUserToCloud(user) {
  if (!user || !user.username) return;
  if (!user.isGoogle) return;

  // Проверка сессии Firebase Auth:
  // Правила Firestore требуют авторизации (request.auth != null).
  // Если пользователь ещё не вошёл через Google, пропускаем отправку во избежание 403 Forbidden.
  const authUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
  if (!authUser) return;

  // Защита от несовпадения учетных записей при записи в профиль
  if (user.email && authUser.email && user.email.trim().toLowerCase() !== authUser.email.trim().toLowerCase()) {
    return;
  }
  try {
    const cleanKey = user.username.trim().toLowerCase();
    const achUnlockedCount = (user.data?.achState?.unlocked) ? Object.keys(user.data.achState.unlocked).length : 0;
    const tanjiroClicks = user.data?.achState?.tanjiroClicks || 0;
    const wheelSpins = user.data?.achState?.wheelSpins || 0;
    const isVip = !!(user.data?.achState?.unlocked?.universal || user.data?.achState?.unlocked?.vip);
    const now = Date.now();

    const hasFieldValue = typeof firebase !== 'undefined' && firebase.firestore && typeof firebase.firestore.FieldValue !== 'undefined' && typeof firebase.firestore.FieldValue.serverTimestamp === 'function';

    const rawPayload = {
      id: user.id || ('user_' + now),
      username: user.username,
      tag: user.tag || '@' + user.username.toLowerCase(),
      email: (user.email || '').trim().toLowerCase(),
      googleUid: user.googleUid || '',
      isGoogle: !!(user.isGoogle || user.googleUid),
      avatarType: user.avatarType || 'color',
      avatarColor: user.avatarColor || '#6366f1',
      avatarImage: user.avatarImage || null,
      avatarPreset: user.avatarPreset || null,
      avatarFrame: user.avatarFrame || 'none',
      bannerType: user.bannerType || 'gradient',
      bannerGradient: user.bannerGradient || 'cyber',
      bannerImage: user.bannerImage || null,
      bio: user.bio || '',
      moodStatus: user.moodStatus || 'gaming',
      favCharacter: user.favCharacter || 'Танджиро Камадо',
      playerTitle: user.playerTitle || 'none',
      telegramLink: user.telegramLink || '',
      cardStyle: user.cardStyle || 'standard',
      showcaseAch: user.showcaseAch || 'universal',
      createdAt: user.createdAt || Date.now(),
      updatedAt: now,
      stats: {
        achCount: achUnlockedCount,
        tanjiroClicks: tanjiroClicks,
        wheelSpins: wheelSpins,
        isVip: isVip
      },
      data: user.data || null
    };

    if (hasFieldValue) {
      rawPayload.lastSync = firebase.firestore.FieldValue.serverTimestamp();
    }

    const cloudPayload = sanitizeForFirestore(rawPayload);

    // 1. Попытка через SDK (только если доступен FieldValue.serverTimestamp)
    const activeDb = (typeof cloudDb !== 'undefined' && cloudDb) ? cloudDb : (typeof window !== 'undefined' ? window.cloudDb : null);
    if (activeDb && hasFieldValue) {
      try {
        await activeDb.collection('nanj_users').doc(cleanKey).set(cloudPayload, { merge: true });
      } catch (err) {
        console.warn('SDK setDoc warning, using REST:', err);
        await syncUserToCloudRest(cleanKey, cloudPayload);
      }
    } else {
      // 2. Прямой REST Fallback с атомарным updateTransforms: REQUEST_TIME
      await syncUserToCloudRest(cleanKey, cloudPayload);
    }

    // Синхронизируем локальный updatedAt и связанные алиасы в localStorage
    const getDbFn = typeof getAccountsDB === 'function' ? getAccountsDB : (typeof window !== 'undefined' ? window.getAccountsDB : null);
    const saveDbFn = typeof saveAccountsDB === 'function' ? saveAccountsDB : (typeof window !== 'undefined' ? window.saveAccountsDB : null);
    if (getDbFn && saveDbFn) {
      const db = getDbFn();
      if (db[user.id]) {
        db[user.id].updatedAt = now;
      }
      for (const [k, acc] of Object.entries(db)) {
        if (k !== user.id && acc && (acc.linkedAccountId === user.id || (acc.username && acc.username.toLowerCase() === cleanKey))) {
          db[k].updatedAt = now;
        }
      }
      saveDbFn(db);
    }
  } catch (err) {
    console.warn('Cloud sync error:', err);
  }
}

/**
 * Дебаунс-синхронизация пользователя с облаком Firestore
 * Предотвращает множественные спам-запросы при частых локальных сохранениях (ползунки, клики)
 * @param {Object} user 
 * @param {number} delayMs 
 */
let _cloudSyncDebounceTimer = null;
function debouncedSyncUserToCloud(user, delayMs = 600) {
  if (!user || !user.username || !user.isGoogle) return;
  if (_cloudSyncDebounceTimer) clearTimeout(_cloudSyncDebounceTimer);
  _cloudSyncDebounceTimer = setTimeout(() => {
    syncUserToCloud(user);
  }, delayMs);
}

// ═══════════════════════════════════════════════════════════════
// ДВУХСТОРОННЯЯ LIVE-СИНХРОНИЗАЦИЯ ПРОФИЛЯ, КЛИКОВ И АВАТАРОК
// ═══════════════════════════════════════════════════════════════

let isPullingCloudData = false;
let cloudRealtimeUnsubscribe = null;

/**
 * Подтягивание актуальных данных текущего пользователя из облака Firestore
 * @param {boolean} isBackground - Флаг фонового выполнения
 */
async function pullLatestCloudDataForCurrentUser(isBackground = false) {
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
  const user = getUserFn ? getUserFn() : null;
  if (!user || !user.username || !user.isGoogle || isPullingCloudData) return;
  isPullingCloudData = true;

  try {
    const cleanKey = user.username.trim().toLowerCase();
    let cloudData = null;

    // 1. Проверяем через SDK
    const activeDb = (typeof cloudDb !== 'undefined' && cloudDb) ? cloudDb : (typeof window !== 'undefined' ? window.cloudDb : null);
    if (activeDb) {
      try {
        const docSnap = await activeDb.collection('nanj_users').doc(cleanKey).get();
        if (docSnap.exists) {
          cloudData = docSnap.data();
        } else if (user.email) {
          const emailSnap = await activeDb.collection('nanj_users').doc('email_' + encodeURIComponent(user.email.toLowerCase())).get();
          if (emailSnap.exists) cloudData = emailSnap.data();
        }
      } catch(e) {}
    }

    // 2. REST Fallback
    if (!cloudData) {
      cloudData = await fetchUserFromFirestoreRest(cleanKey);
      if (!cloudData && user.email) {
        cloudData = await fetchUserFromFirestoreRest('email_' + encodeURIComponent(user.email.toLowerCase()));
      }
    }

    if (cloudData) {
      const getDbFn = typeof getAccountsDB === 'function' ? getAccountsDB : (typeof window !== 'undefined' ? window.getAccountsDB : null);
      const saveDbFn = typeof saveAccountsDB === 'function' ? saveAccountsDB : (typeof window !== 'undefined' ? window.saveAccountsDB : null);
      const db = getDbFn ? getDbFn() : {};
      const localUser = db[user.id] || user;
      const localUpdatedAt = localUser.updatedAt || 0;
      const cloudUpdatedAt = cloudData.updatedAt || 0;

      const localClicks = localUser.data?.achState?.tanjiroClicks || 0;
      const cloudClicks = cloudData.stats?.tanjiroClicks || cloudData.data?.achState?.tanjiroClicks || 0;
      const localSpins = localUser.data?.achState?.wheelSpins || 0;
      const cloudSpins = cloudData.stats?.wheelSpins || cloudData.data?.achState?.wheelSpins || 0;

      // 1. Если локальные данные новее или равны облачным -> НЕ затираем локальные данные!
      if (localUpdatedAt >= cloudUpdatedAt) {
        if (localUpdatedAt > cloudUpdatedAt) {
          const authUser = (typeof firebase !== 'undefined' && firebase.auth) ? firebase.auth().currentUser : null;
          if (authUser && user.isGoogle) {
            console.log('[Sync] Local data is newer than cloud. Pushing local to cloud...');
            syncUserToCloud(localUser);
          }
        }
        return;
      }

      // 2. Если облачные данные строго новее локальных (изменения с другого устройства):
      const cloudAchState = cloudData.data?.achState || {};
      const localAchState = localUser.data?.achState || {};

      // Неразрушающее слияние настроек: локальные настройки сохраняются, если они заданы
      const mergedData = {
        ...(cloudData.data || {}),
        ...(localUser.data || {}),
        achState: {
          ...cloudAchState,
          ...localAchState,
          tanjiroClicks: Math.max(localClicks, cloudClicks),
          wheelSpins: Math.max(localSpins, cloudSpins),
          unlocked: {
            ...(cloudAchState.unlocked || {}),
            ...(localAchState.unlocked || {})
          }
        }
      };

      // Сохраняем локальный уровень громкости, если он был задан
      if (typeof localUser.data?.app_volume_percent === 'number') {
        mergedData.app_volume_percent = localUser.data.app_volume_percent;
      } else if (typeof cloudData.data?.app_volume_percent === 'number') {
        mergedData.app_volume_percent = cloudData.data.app_volume_percent;
      }

      localUser.data = mergedData;
      if (cloudData.avatarImage !== undefined && !localUser.avatarImage) localUser.avatarImage = cloudData.avatarImage;
      if (cloudData.avatarColor && !localUser.avatarColor) localUser.avatarColor = cloudData.avatarColor;
      if (cloudData.avatarPreset !== undefined && !localUser.avatarPreset) localUser.avatarPreset = cloudData.avatarPreset;
      if (cloudData.avatarFrame && (!localUser.avatarFrame || localUser.avatarFrame === 'none')) localUser.avatarFrame = cloudData.avatarFrame;
      if (cloudData.bannerGradient && !localUser.bannerGradient) localUser.bannerGradient = cloudData.bannerGradient;
      if (cloudData.bannerImage !== undefined && !localUser.bannerImage) localUser.bannerImage = cloudData.bannerImage;
      if (cloudData.bio !== undefined && !localUser.bio) localUser.bio = cloudData.bio;
      if (cloudData.moodStatus !== undefined && !localUser.moodStatus) localUser.moodStatus = cloudData.moodStatus;
      if (cloudData.favCharacter !== undefined && !localUser.favCharacter) localUser.favCharacter = cloudData.favCharacter;
      if (cloudData.playerTitle !== undefined && (!localUser.playerTitle || localUser.playerTitle === 'none')) localUser.playerTitle = cloudData.playerTitle;
      if (cloudData.telegramLink !== undefined && !localUser.telegramLink) localUser.telegramLink = cloudData.telegramLink;
      if (cloudData.cardStyle !== undefined && (!localUser.cardStyle || localUser.cardStyle === 'standard')) localUser.cardStyle = cloudData.cardStyle;
      if (cloudData.showcaseAch !== undefined && !localUser.showcaseAch) localUser.showcaseAch = cloudData.showcaseAch;
      localUser.updatedAt = Math.max(localUpdatedAt, cloudUpdatedAt, Date.now());

      db[user.id] = localUser;
      for (const [k, acc] of Object.entries(db)) {
        if (k !== user.id && acc && (acc.linkedAccountId === user.id || (acc.username && user.username && acc.username.toLowerCase() === user.username.toLowerCase()))) {
          db[k] = { ...acc, ...localUser };
        }
      }
      if (saveDbFn) saveDbFn(db);
      if (typeof loadUserData === 'function') loadUserData(user.id);
      else if (typeof window !== 'undefined' && typeof window.loadUserData === 'function') window.loadUserData(user.id);

      if (typeof updateUserProfileUI === 'function') updateUserProfileUI();
      else if (typeof window !== 'undefined' && typeof window.updateUserProfileUI === 'function') window.updateUserProfileUI();

      if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
      else if (typeof window !== 'undefined' && typeof window.updateAchievementsUI === 'function') window.updateAchievementsUI();

      if (typeof renderPacksList === 'function') renderPacksList();
      else if (typeof window !== 'undefined' && typeof window.renderPacksList === 'function') window.renderPacksList();
    }
  } catch(err) {
    console.warn('Auto-sync error:', err);
  } finally {
    isPullingCloudData = false;
  }
}

/**
 * Подключение Realtime-слушателя обновлений документа пользователя в Firestore
 * @param {Object} user - Пользователь
 */
function setupRealtimeCloudListener(user) {
  const activeDb = (typeof cloudDb !== 'undefined' && cloudDb) ? cloudDb : (typeof window !== 'undefined' ? window.cloudDb : null);
  if (!activeDb || !user || !user.username || !user.isGoogle) return;
  if (cloudRealtimeUnsubscribe) {
    cloudRealtimeUnsubscribe();
    cloudRealtimeUnsubscribe = null;
  }
  try {
    const cleanKey = user.username.trim().toLowerCase();
    cloudRealtimeUnsubscribe = activeDb.collection('nanj_users').doc(cleanKey).onSnapshot(docSnap => {
      if (docSnap && docSnap.exists && !isPullingCloudData) {
        pullLatestCloudDataForCurrentUser(true);
      }
    }, err => {});
  } catch(e) {}
}

/**
 * Принудительная выгрузка текущих несохранённых изменений в облако при закрытии/скрытии страницы
 */
function flushPendingCloudSync() {
  try {
    const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
    const user = getUserFn ? getUserFn() : null;
    if (user && user.isGoogle) {
      syncUserToCloud(user);
    }
  } catch (e) {
    console.warn('Flush pending cloud sync error:', e);
  }
}

// Слушатели фокуса и сворачивания страницы
if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => {
    pullLatestCloudDataForCurrentUser(true);
  });

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      pullLatestCloudDataForCurrentUser(true);
    } else {
      flushPendingCloudSync();
    }
  });

  window.addEventListener('pagehide', () => flushPendingCloudSync());
  window.addEventListener('beforeunload', () => flushPendingCloudSync());
}

// Экспорт в глобальную область window
if (typeof window !== 'undefined') {
  window.firebaseConfig = firebaseConfig;
  window.sanitizeForFirestore = sanitizeForFirestore;
  window.parseFirestoreRestField = parseFirestoreRestField;
  window.fetchUserFromFirestoreRest = fetchUserFromFirestoreRest;
  window.syncUserToCloudRest = syncUserToCloudRest;
  window.syncUserToCloud = syncUserToCloud;
  window.debouncedSyncUserToCloud = debouncedSyncUserToCloud;
  window.syncAllLocalAccountsToCloud = syncAllLocalAccountsToCloud;
  window.pullLatestCloudDataForCurrentUser = pullLatestCloudDataForCurrentUser;
  window.setupRealtimeCloudListener = setupRealtimeCloudListener;
  window.flushPendingCloudSync = flushPendingCloudSync;

  Object.defineProperty(window, 'cloudDb', {
    get: () => cloudDb,
    set: (val) => { cloudDb = val; },
    configurable: true
  });
  Object.defineProperty(window, 'isPullingCloudData', {
    get: () => isPullingCloudData,
    set: (val) => { isPullingCloudData = val; },
    configurable: true
  });
  Object.defineProperty(window, 'cloudRealtimeUnsubscribe', {
    get: () => cloudRealtimeUnsubscribe,
    set: (val) => { cloudRealtimeUnsubscribe = val; },
    configurable: true
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    firebaseConfig,
    sanitizeForFirestore,
    parseFirestoreRestField,
    fetchUserFromFirestoreRest,
    syncUserToCloudRest,
    syncUserToCloud,
    syncAllLocalAccountsToCloud,
    pullLatestCloudDataForCurrentUser,
    setupRealtimeCloudListener,
    flushPendingCloudSync
  };
}
