// ═══════════════════════════════════════════════════════════════
// ОНЛАЙН-ТАБЛИЦА ЛИДЕРОВ (LEADERBOARD)
// Модуль: leaderboard.js (вынесен из accounts.js / nanj.html, Этап 2 модуляризации)
// Зависимости: cloudDb, firebaseConfig, getCurrentUser, isValidAvatarImage,
//              escapeHtml, syncBodyScrollLock
// ═══════════════════════════════════════════════════════════════

let activeLeaderboardCategory = 'ach';

async function fetchAndRenderLeaderboard(category = 'ach') {
  activeLeaderboardCategory = category;
  window.activeLeaderboardCategory = category;
  const container = document.getElementById('leaderboardListContainer');
  if (!container) return;

  const loadingText = typeof window.t === 'function' ? window.t('lb_loading') : 'Синхронизация с облаком...';
  container.innerHTML = `<div class="text-center py-10 text-gray-400 text-sm animate-pulse">${loadingText}</div>`;

  let usersList = [];

  // 1. Пробуем через Firebase SDK
  const db = (typeof cloudDb !== 'undefined' && cloudDb) ? cloudDb : (window.cloudDb || null);
  if (db) {
    try {
      const snapshot = await db.collection('nanj_users').limit(50).get();
      snapshot.forEach(doc => {
        const d = doc.data();
        if (d) usersList.push(d);
      });
    } catch (e) {}
  }

  // 2. Если SDK не вернул данные, запрашиваем через прямой HTTPS REST
  const fbCfg = (typeof firebaseConfig !== 'undefined' && firebaseConfig) ? firebaseConfig : (window.firebaseConfig || null);
  if (usersList.length === 0 && fbCfg && fbCfg.apiKey) {
    try {
      const projId = fbCfg.projectId || 'my-website-46efa';
      const res = await fetch(`https://firestore.googleapis.com/v1/projects/${projId}/databases/(default)/documents/nanj_users?key=${fbCfg.apiKey}`);
      if (res.ok) {
        const json = await res.json();
        if (json.documents) {
          json.documents.forEach(d => {
            const f = d.fields || {};
            usersList.push({
              username: f.username?.stringValue || '',
              tag: f.tag?.stringValue || '',
              avatarColor: f.avatarColor?.stringValue || '#6366f1',
              avatarImage: f.avatarImage?.stringValue || null,
              avatarFrame: f.avatarFrame?.stringValue || 'none',
              hasImportedData: !!f.hasImportedData?.booleanValue,
              stats: {
                achCount: parseInt(f.stats_achCount?.integerValue || 0, 10),
                tanjiroClicks: parseInt(f.stats_tanjiroClicks?.integerValue || 0, 10),
                wheelSpins: parseInt(f.stats_wheelSpins?.integerValue || 0, 10),
                isVip: !!f.stats_isVip?.booleanValue
              }
            });
          });
        }
      }
    } catch (e) {}
  }

  // Исключаем системные Google-связки и импортированные профили
  usersList = usersList.filter(u => u && u.username && !u.hasImportedData && !u.username.startsWith('google_uid_') && !u.username.startsWith('email_'));

  if (usersList.length === 0) {
    const emptyText = typeof window.t === 'function' ? window.t('lb_empty') : 'В облачной базе пока нет игроков. Будьте первыми!';
    container.innerHTML = `<div class="text-center py-8 text-gray-400 text-xs">${emptyText}</div>`;
    return;
  }

  // Сортировка по выбранной категории
  if (category === 'clicks') {
    usersList.sort((a, b) => (b.stats?.tanjiroClicks || 0) - (a.stats?.tanjiroClicks || 0));
  } else if (category === 'spins') {
    usersList.sort((a, b) => (b.stats?.wheelSpins || 0) - (a.stats?.wheelSpins || 0));
  } else {
    usersList.sort((a, b) => (b.stats?.achCount || 0) - (a.stats?.achCount || 0));
  }

  const escapeFn = typeof escapeHtml === 'function' ? escapeHtml : (window.escapeHtml || (str => String(str).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]))));
  const isAvatarImgValid = typeof isValidAvatarImage === 'function' ? isValidAvatarImage : (window.isValidAvatarImage || (() => false));
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (window.getCurrentUser || (() => null));
  const currentUser = getUserFn();

  let htmlMarkup = '';

  usersList.forEach((u, idx) => {
    const rank = idx + 1;
    const isTop1 = rank === 1;
    const isTop2 = rank === 2;
    const isTop3 = rank === 3;
    const rankBadgeColor = isTop1 ? 'bg-amber-400 text-black font-black shadow-amber-400/40 shadow-md' :
                           isTop2 ? 'bg-slate-300 text-black font-black' :
                           isTop3 ? 'bg-amber-700 text-white font-black' : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold';

    const isMe = (currentUser && currentUser.username && currentUser.username.toLowerCase() === u.username.toLowerCase());
    const ALLOWED_FRAMES = new Set(['none', 'neon', 'gold', 'flame', 'void', 'emerald', 'rainbow']);
    const safeFrame = ALLOWED_FRAMES.has(u.avatarFrame) ? u.avatarFrame : 'none';
    const frameClass = safeFrame !== 'none' ? `mini-frame-${safeFrame}` : 'mini-frame-none';
    let avatarInner = '';
    if (u.avatarImage && isAvatarImgValid(u.avatarImage)) {
      avatarInner = `<div class="w-full h-full rounded-full bg-cover bg-center" style="background-image: url('${escapeFn(u.avatarImage)}')"></div>`;
    } else {
      const safeAvatarBg = /^#([0-9a-fA-F]{3,8})$/.test(u.avatarColor || '') ? u.avatarColor : '#6366f1';
      avatarInner = `<div class="w-full h-full rounded-full flex items-center justify-center text-white text-xs font-black" style="background-color: ${safeAvatarBg}">${escapeFn((u.username || 'U').charAt(0).toUpperCase())}</div>`;
    }

    let statValue = '';
    if (category === 'clicks') {
      const unit = typeof window.t === 'function' ? window.t('lb_stat_clicks') : 'кликов';
      statValue = `${(u.stats?.tanjiroClicks || 0).toLocaleString()} ${unit}`;
    } else if (category === 'spins') {
      const unit = typeof window.t === 'function' ? window.t('lb_stat_spins') : 'спинов';
      statValue = `${(u.stats?.wheelSpins || 0).toLocaleString()} ${unit}`;
    } else {
      const unit = typeof window.t === 'function' ? window.t('lb_stat_achievements') : 'достижений';
      statValue = `${u.stats?.achCount || 0} / 11 ${unit}`;
    }

    const rowBg = isMe ? 'bg-indigo-50/60 dark:bg-indigo-950/30 border-indigo-300 dark:border-indigo-700' : 'bg-gray-50/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80';

    htmlMarkup += `
      <div class="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border ${rowBg} shadow-sm transition hover:scale-[1.01]">
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${rankBadgeColor}">${rank}</span>
          <div class="${frameClass} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
            ${avatarInner}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-black text-xs sm:text-sm text-gray-900 dark:text-white truncate">${escapeFn(u.username)}</span>
              ${isMe ? `<span class="px-1.5 py-0.2 text-[8px] font-extrabold bg-indigo-500 text-white rounded-md uppercase">${typeof window.t === 'function' ? window.t('lb_badge_you') : 'ВЫ'}</span>` : ''}
              ${u.stats?.isVip ? '<span class="px-1.5 py-0.2 text-[8px] font-black bg-amber-400 text-black rounded-md uppercase">VIP</span>' : ''}
            </div>
            <div class="text-[10px] text-gray-400 truncate">${escapeFn(u.tag || '@' + u.username)}</div>
          </div>
        </div>
        <div class="text-right flex-shrink-0 pl-2">
          <div class="font-black text-xs sm:text-sm text-amber-500">${statValue}</div>
        </div>
      </div>
    `;
  });

  container.innerHTML = htmlMarkup;
}

function openLeaderboardModal() {
  const modal = document.getElementById('modalLeaderboard');
  const content = document.getElementById('modalLeaderboardContent');
  if (!modal || !content) return;
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  requestAnimationFrame(() => {
    content.classList.remove('opacity-0', 'invisible');
    content.classList.add('opacity-100', 'visible', 'animate-fade-in-scale');
  });
  updateLbTabsUI(activeLeaderboardCategory);
  fetchAndRenderLeaderboard(activeLeaderboardCategory);
}

function closeLeaderboardModal() {
  const modal = document.getElementById('modalLeaderboard');
  const content = document.getElementById('modalLeaderboardContent');
  if (!modal || !content) return;
  content.classList.remove('animate-fade-in-scale', 'opacity-100', 'visible');
  content.classList.add('opacity-0', 'invisible');
  setTimeout(() => {
    modal.classList.add('hidden');
    if (typeof syncBodyScrollLock === 'function') {
      syncBodyScrollLock();
    } else if (typeof window.syncBodyScrollLock === 'function') {
      window.syncBodyScrollLock();
    } else {
      document.body.classList.remove('modal-open');
    }
  }, 180);
}

function updateLbTabsUI(activeTab) {
  const lbTabAch = document.getElementById('lbTabAch');
  const lbTabClicks = document.getElementById('lbTabClicks');
  const lbTabSpins = document.getElementById('lbTabSpins');

  [lbTabAch, lbTabClicks, lbTabSpins].forEach(btn => {
    if (!btn) return;
    btn.className = 'flex-1 py-2 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-1.5';
  });
  if (activeTab === 'ach' && lbTabAch) {
    lbTabAch.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 shadow-sm transition flex items-center justify-center gap-1.5';
  } else if (activeTab === 'clicks' && lbTabClicks) {
    lbTabClicks.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm transition flex items-center justify-center gap-1.5';
  } else if (activeTab === 'spins' && lbTabSpins) {
    lbTabSpins.className = 'flex-1 py-2 rounded-xl bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 shadow-sm transition flex items-center justify-center gap-1.5';
  }
}

function initLeaderboardListeners() {
  const leaderboardBtn = document.getElementById('leaderboardBtn');
  const closeLeaderboardModalBtn = document.getElementById('closeLeaderboardModalBtn');
  const refreshLeaderboardBtn = document.getElementById('refreshLeaderboardBtn');
  const lbTabAch = document.getElementById('lbTabAch');
  const lbTabClicks = document.getElementById('lbTabClicks');
  const lbTabSpins = document.getElementById('lbTabSpins');

  if (leaderboardBtn) {
    leaderboardBtn.removeEventListener('click', openLeaderboardModal);
    leaderboardBtn.addEventListener('click', openLeaderboardModal);
  }
  if (closeLeaderboardModalBtn) {
    closeLeaderboardModalBtn.removeEventListener('click', closeLeaderboardModal);
    closeLeaderboardModalBtn.addEventListener('click', closeLeaderboardModal);
  }
  if (refreshLeaderboardBtn) {
    refreshLeaderboardBtn.addEventListener('click', () => fetchAndRenderLeaderboard(activeLeaderboardCategory));
  }

  if (lbTabAch) {
    lbTabAch.addEventListener('click', () => {
      updateLbTabsUI('ach');
      fetchAndRenderLeaderboard('ach');
    });
  }
  if (lbTabClicks) {
    lbTabClicks.addEventListener('click', () => {
      updateLbTabsUI('clicks');
      fetchAndRenderLeaderboard('clicks');
    });
  }
  if (lbTabSpins) {
    lbTabSpins.addEventListener('click', () => {
      updateLbTabsUI('spins');
      fetchAndRenderLeaderboard('spins');
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLeaderboardListeners);
} else {
  initLeaderboardListeners();
}

// ─── ГЛОБАЛЬНЫЙ ЭКСПОРТ ДЛЯ ИНЛАЙН-ОБРАБОТЧИКОВ И ДРУГИХ МОДУЛЕЙ ───
window.activeLeaderboardCategory = activeLeaderboardCategory;
window.fetchAndRenderLeaderboard = fetchAndRenderLeaderboard;
window.openLeaderboardModal = openLeaderboardModal;
window.closeLeaderboardModal = closeLeaderboardModal;
window.updateLbTabsUI = updateLbTabsUI;
window.initLeaderboardListeners = initLeaderboardListeners;
