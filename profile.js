// ===============================================================
// NANJICORE: PROFILE MODULE
// Модуль профиля, кастомизации, аватаров, баннеров и живого превью
// Вынесен на Этапе 5.5 модуляризации
// ===============================================================

/**
 * Проверка, является ли аккаунт аккаунтом Создателя игры
 * @param {Object} user - Пользователь
 * @returns {boolean}
 */
function isCreatorAccount(user) {
  if (!user) return false;
  const email = (user.email || '').trim().toLowerCase();
  const isGoogle = !!(user.isGoogle || user.googleUid);
  return email === 'creator@example.com' && isGoogle;
}

/**
 * Палитра дефолтных цветов для аватарок
 */
const AVATAR_COLORS = [
  '#6366f1', '#10b981', '#ec4899', '#f59e0b',
  '#8b5cf6', '#06b6d4', '#ef4444', '#3b82f6',
  '#14b8a6', '#334155'
];

/**
 * Получение случайного цвета из палитры аватарок
 * @returns {string} HEX цвет
 */
function getRandomColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)] || '#6366f1';
}

/**
 * Валидация URL изображения аватарки (защита от XSS и опасных протоколов)
 * @param {string} url - URL или base64 data URI
 * @returns {boolean}
 */
function isValidAvatarImage(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!clean) return false;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(clean)) {
    return true;
  }
  try {
    const parsed = new URL(clean);
    const host = parsed.hostname.toLowerCase();
    const isGoogle = host === 'lh3.googleusercontent.com' || host === 'googleusercontent.com' || host.endsWith('.googleusercontent.com');
    const isHttps = parsed.protocol === 'https:';
    return isGoogle && isHttps;
  } catch (e) {
    return false;
  }
}

/**
 * Словари градиентов для баннеров
 */
const BANNER_GRADIENTS = {
  cyber: 'linear-gradient(135deg, #4f46e5, #9333ea, #ec4899)',
  emerald: 'linear-gradient(135deg, #065f46, #059669, #10b981)',
  sunset: 'linear-gradient(135deg, #ea580c, #db2777, #7c3aed)',
  void: 'linear-gradient(135deg, #0f172a, #312e81, #1e1b4b)',
  gold: 'linear-gradient(135deg, #78350f, #d97706, #fbbf24)',
  flame: 'linear-gradient(135deg, #7f1d1d, #dc2626, #f97316)'
};

/**
 * Конфигурация статусов активности/настроения
 */
const MOOD_CONFIG = {
  gaming: { label: 'В игре', color: 'text-emerald-500 dark:text-emerald-400', dot: 'bg-emerald-500' },
  coding: { 
    label: 'Кодит<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span> <svg class="tools-wiggle w-3.5 h-3.5 inline ml-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>', 
    color: 'text-indigo-400 dark:text-indigo-300 font-bold', 
    dot: 'bg-indigo-500 shadow-lg shadow-indigo-500/50' 
  },
  farming: { label: 'Фармлю крутки', color: 'text-purple-500 dark:text-purple-400', dot: 'bg-purple-500' },
  music: { label: 'Слушаю музыку', color: 'text-blue-500 dark:text-blue-400', dot: 'bg-blue-500' },
  afk: { label: 'AFK / Отдыхаю', color: 'text-amber-500 dark:text-amber-400', dot: 'bg-amber-500' },
  berserk: { label: 'Режим берсерка', color: 'text-red-500 dark:text-red-400', dot: 'bg-red-500' },
  party: { label: 'Ищу пати', color: 'text-cyan-500 dark:text-cyan-400', dot: 'bg-cyan-500' },
  none: { label: '', color: 'text-gray-400', dot: 'hidden' }
};

/**
 * Конфигурация отображения титулов
 */
const TITLE_CONFIG = {
  none: '',
  demon_slayer: 'Истребитель демонов',
  wheel_master: 'Повелитель колеса',
  pack_master: 'Мастер паков',
  click_god: 'Безумный кликер',
  legend: 'Легенда игры',
  vip_pioneer: 'Admin ⚡',
  admin: 'Admin ⚡'
};

/**
 * Пресеты текстовых аватарок героев
 */
const AVATAR_PRESETS = {
  tanjiro: { text: 'ТК', color: '#047857', name: 'Танджиро' },
  ebardo: { text: 'ЭБ', color: '#0d9488', name: 'Эбардо' },
  jenna: { text: 'ДЖ', color: '#0f172a', name: 'Дженна' },
  nezuko: { text: 'НЗ', color: '#db2777', name: 'Незуко' },
  zenitsu: { text: 'ЗН', color: '#d97706', name: 'Зеницу' },
  inosuke: { text: 'ИН', color: '#0284c7', name: 'Иноске' }
};

/**
 * Текущее состояние формы редактирования профиля
 */
let editState = {
  avatarColor: '#6366f1',
  avatarPreset: null,
  avatarImage: null,
  avatarFrame: 'none',
  bannerGradient: 'cyber',
  bannerImage: null,
  cardStyle: 'standard'
};

/**
 * Обновление интерфейса профиля (кнопка в шапке и карточка профиля)
 */
function updateUserProfileUI() {
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
  const user = getUserFn ? getUserFn() : null;

  const userTopName = document.getElementById('userTopName');
  const userAvatarIcon = document.getElementById('userAvatarIcon');
  const userTopVipBadge = document.getElementById('userTopVipBadge');
  const userProfileBtn = document.getElementById('userProfileBtn');

  if (userProfileBtn) {
    userProfileBtn.classList.remove(
      'btn-frame-none', 'btn-frame-neon', 'btn-frame-gold',
      'btn-frame-flame', 'btn-frame-void', 'btn-frame-emerald', 'btn-frame-rainbow'
    );
  }

  if (!user) {
    if (userTopName) {
      userTopName.textContent = typeof window.t === 'function' ? window.t('auth_tab_login', 'Вход') : 'Вход';
      userTopName.setAttribute('data-i18n', 'auth_tab_login');
    }
    if (userAvatarIcon) {
      userAvatarIcon.textContent = '?';
      userAvatarIcon.style.backgroundImage = '';
      userAvatarIcon.style.backgroundColor = '#6366f1';
    }
    if (userTopVipBadge) userTopVipBadge.classList.add('hidden');
    if (userProfileBtn) userProfileBtn.classList.add('btn-frame-none');
    return;
  }

  const isVip = !!(typeof achState !== 'undefined' && achState?.unlocked?.universal);
  const initial = (user.username || 'U').charAt(0).toUpperCase();

  // 1. Шапка сайта и кнопка профиля
  if (userTopName) {
    userTopName.textContent = user.username;
    userTopName.removeAttribute('data-i18n');
  }
  if (userAvatarIcon) {
    if (user.avatarImage) {
      userAvatarIcon.textContent = '';
      userAvatarIcon.style.backgroundImage = `url(${user.avatarImage})`;
      userAvatarIcon.style.backgroundSize = 'cover';
      userAvatarIcon.style.backgroundPosition = 'center';
    } else if (user.avatarPreset && AVATAR_PRESETS[user.avatarPreset]) {
      userAvatarIcon.textContent = AVATAR_PRESETS[user.avatarPreset].text;
      userAvatarIcon.style.backgroundImage = '';
      userAvatarIcon.style.backgroundColor = AVATAR_PRESETS[user.avatarPreset].color;
    } else {
      userAvatarIcon.textContent = initial;
      userAvatarIcon.style.backgroundImage = '';
      userAvatarIcon.style.backgroundColor = user.avatarColor || '#6366f1';
    }
  }
  if (userProfileBtn) {
    const frame = user.avatarFrame || (isVip ? 'gold' : 'none');
    userProfileBtn.classList.add(`btn-frame-${frame}`);
  }

  const profileGoToEditBtn = document.getElementById('profileGoToEditBtn');
  if (profileGoToEditBtn) {
    profileGoToEditBtn.classList.remove(
      'btn-frame-none', 'btn-frame-neon', 'btn-frame-gold',
      'btn-frame-flame', 'btn-frame-void', 'btn-frame-emerald', 'btn-frame-rainbow'
    );
  }

  // 2. Карточка в модальном окне «Мой профиль»
  const profileNameDisplay = document.getElementById('profileNameDisplay');
  const profileTagDisplay = document.getElementById('profileTagDisplay');
  const profileBigAvatar = document.getElementById('profileBigAvatar');
  const profileOverviewAvatarFrame = document.getElementById('profileOverviewAvatarFrame');
  const profileOverviewBanner = document.getElementById('profileOverviewBanner');
  const profileOverviewTitleBadge = document.getElementById('profileOverviewTitleBadge');
  const profileMoodDot = document.getElementById('profileMoodDot');
  const profileMoodDisplay = document.getElementById('profileMoodDisplay');
  const profileBioDisplay = document.getElementById('profileBioDisplay');
  const profileFavCharDisplay = document.getElementById('profileFavCharDisplay');
  const profileTgDisplay = document.getElementById('profileTgDisplay');
  const profileDateDisplay = document.getElementById('profileDateDisplay');
  const profileDateContainer = document.getElementById('profileDateContainer');
  
  const profileVipBadge = document.getElementById('profileVipBadge');
  const profileImportedBadge = document.getElementById('profileImportedBadge');
  if (profileImportedBadge) {
    if (user.hasImportedData) {
      profileImportedBadge.classList.remove('hidden');
      profileImportedBadge.classList.add('inline-flex');
    } else {
      profileImportedBadge.classList.add('hidden');
      profileImportedBadge.classList.remove('inline-flex');
    }
  }
  const profileTypeDisplayBadge = document.getElementById('profileTypeDisplayBadge');
  const profileOverviewCard = document.getElementById('profileOverviewCard');

  if (profileNameDisplay) profileNameDisplay.textContent = user.username;
  if (profileTagDisplay) profileTagDisplay.textContent = user.tag || `@${user.username.toLowerCase().replace(/\s+/g, '_')}`;
  if (profileVipBadge) profileVipBadge.classList.toggle('hidden', !isVip);

  // Бейдж типа аккаунта и блок почты / Google
  const hasEmailOrGoogle = !!(user.email || user.isGoogle || user.googleUid);

  if (profileTypeDisplayBadge) {
    if (hasEmailOrGoogle) {
      profileTypeDisplayBadge.textContent = 'Google';
      profileTypeDisplayBadge.className = 'absolute top-3 -left-1 z-20 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#4285F4]/65 via-[#EA4335]/65 via-[#FBBC05]/65 to-[#34A853]/65 backdrop-blur-md text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider shadow-md whitespace-nowrap border border-white/20 pointer-events-none drop-shadow-sm';
    } else {
      profileTypeDisplayBadge.textContent = 'Локальный';
      profileTypeDisplayBadge.className = 'absolute top-5 -left-1 z-20 px-2 py-0.5 rounded-full bg-black/45 backdrop-blur-md text-[8px] sm:text-[9px] font-black text-white uppercase tracking-wider shadow-md whitespace-nowrap border border-white/10 pointer-events-none';
    }
  }

  const profileGoogleLinkedCard = document.getElementById('profileGoogleLinkedCard');
  const profileGoogleLinkedEmail = document.getElementById('profileGoogleLinkedEmail');
  const profileLinkGoogleBtn = document.getElementById('profileLinkGoogleBtn');

  if (profileLinkGoogleBtn) {
    profileLinkGoogleBtn.style.display = hasEmailOrGoogle ? 'none' : 'flex';
    if (hasEmailOrGoogle) {
      profileLinkGoogleBtn.classList.add('hidden');
    } else {
      profileLinkGoogleBtn.classList.remove('hidden');
    }
  }
  if (profileGoogleLinkedCard) {
    profileGoogleLinkedCard.style.display = hasEmailOrGoogle ? 'flex' : 'none';
    if (hasEmailOrGoogle) {
      profileGoogleLinkedCard.classList.remove('hidden');
      if (profileGoogleLinkedEmail) {
        profileGoogleLinkedEmail.textContent = user.email || 'Google Аккаунт привязан';
      }
    } else {
      profileGoogleLinkedCard.classList.add('hidden');
    }
  }

  // Аватар
  if (profileBigAvatar) {
    if (user.avatarImage) {
      profileBigAvatar.textContent = '';
      profileBigAvatar.style.backgroundImage = `url(${user.avatarImage})`;
      profileBigAvatar.style.backgroundSize = 'cover';
      profileBigAvatar.style.backgroundPosition = 'center';
    } else if (user.avatarPreset && AVATAR_PRESETS[user.avatarPreset]) {
      profileBigAvatar.textContent = AVATAR_PRESETS[user.avatarPreset].text;
      profileBigAvatar.style.backgroundImage = '';
      profileBigAvatar.style.backgroundColor = AVATAR_PRESETS[user.avatarPreset].color;
    } else {
      profileBigAvatar.textContent = initial;
      profileBigAvatar.style.backgroundImage = '';
      profileBigAvatar.style.backgroundColor = user.avatarColor || '#6366f1';
    }
  }

  // Рамка аватара
  if (profileOverviewAvatarFrame) {
    const frame = user.avatarFrame || (isVip ? 'gold' : 'none');
    profileOverviewAvatarFrame.className = `profile-frame-${frame} p-[2px] rounded-full inline-flex items-center justify-center transition-all flex-shrink-0`;
  }

  // Баннер
  if (profileOverviewBanner) {
    if (user.bannerImage) {
      profileOverviewBanner.style.backgroundImage = `url(${user.bannerImage})`;
      profileOverviewBanner.style.background = '';
      profileOverviewBanner.style.backgroundSize = 'cover';
      profileOverviewBanner.style.backgroundPosition = 'center';
    } else {
      const gradKey = user.bannerGradient || 'cyber';
      profileOverviewBanner.style.background = BANNER_GRADIENTS[gradKey] || BANNER_GRADIENTS.cyber;
    }
  }

  // Титул (с ультра-дизайном для Admin)
  const isUserAdmin = isCreatorAccount(user) || user.playerTitle === 'admin' || user.playerTitle === 'vip_pioneer';
  const titleKey = 'title_' + (user.playerTitle || 'none');
  const titleText = isUserAdmin ? 'ADMIN' : ((typeof window.t === 'function') ? window.t(titleKey, TITLE_CONFIG[user.playerTitle] || '') : (TITLE_CONFIG[user.playerTitle] || ''));

  if (profileOverviewTitleBadge) {
    if (titleText) {
      if (isUserAdmin) {
        profileOverviewTitleBadge.innerHTML = `<svg class="w-3.5 h-3.5 text-amber-300 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg><span>ADMIN</span><svg class="w-3.5 h-3.5 text-amber-300 animate-pulse flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
        profileOverviewTitleBadge.className = 'px-3 py-1 rounded-xl title-badge-admin shadow-lg border text-[11px] font-black uppercase tracking-wider transition-all inline-flex items-center gap-1.5';
      } else {
        profileOverviewTitleBadge.textContent = titleText;
        profileOverviewTitleBadge.className = 'px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[10px] font-black uppercase tracking-wider shadow-lg shadow-amber-500/30 border border-amber-300';
      }
      profileOverviewTitleBadge.classList.remove('hidden');
    } else {
      profileOverviewTitleBadge.classList.add('hidden');
    }
  }

  // Защита аккаунта Создателя: скрываем кнопку удаления
  const profileDeleteAccountBtn = document.getElementById('profileDeleteAccountBtn');
  const btnDeleteProfileAccount = document.getElementById('btnDeleteProfileAccount');
  const isProtectedAdmin = isCreatorAccount(user);

  if (profileDeleteAccountBtn) {
    profileDeleteAccountBtn.style.display = isProtectedAdmin ? 'none' : '';
  }
  if (btnDeleteProfileAccount) {
    btnDeleteProfileAccount.style.display = isProtectedAdmin ? 'none' : '';
  }

  const btnAdminContainer = document.getElementById('adminDashboardBtnContainer');
  if (btnAdminContainer) {
    if (isProtectedAdmin) {
      if (!document.getElementById('btnOpenAdminDashboard')) {
        const creatorPanelText = typeof window.t === 'function' ? window.t('profile_btn_creator_panel', 'Панель Создателя') : 'Панель Создателя';
        btnAdminContainer.innerHTML = `
          <button id="btnOpenAdminDashboard" onclick="if(typeof openAdminDashboardModal==='function')openAdminDashboardModal()" type="button" class="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-purple-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.01] active:scale-[0.99] transition flex items-center justify-center gap-2 border border-white/20">
            <svg class="w-4 h-4 text-amber-300 animate-pulse" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span data-i18n="profile_btn_creator_panel">${creatorPanelText}</span>
          </button>
        `;
      }
    } else {
      btnAdminContainer.innerHTML = '';
    }
  }

  // Статус активности
  const moodCfg = MOOD_CONFIG[user.moodStatus || 'gaming'] || MOOD_CONFIG.gaming;
  if (profileMoodDot) {
    profileMoodDot.className = `absolute bottom-1 right-1 w-5 h-5 rounded-full ${moodCfg.dot} border-2 border-white dark:border-gray-800 shadow`;
  }
  if (profileMoodDisplay) {
    if (user.moodStatus && user.moodStatus !== 'none') {
      let moodText = moodCfg.label;
      if (typeof window.t === 'function') {
        if (user.moodStatus === 'coding') {
          moodText = window.t('mood_coding', 'Кодит') + '<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span> <svg class="tools-wiggle w-3.5 h-3.5 inline ml-1 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>';
        } else {
          moodText = window.t('mood_' + user.moodStatus, moodCfg.label);
        }
      }
      profileMoodDisplay.innerHTML = `<span class="inline-block w-2 h-2 rounded-full ${moodCfg.dot} mr-1"></span><span>${moodText}</span>`;
      profileMoodDisplay.className = `text-xs font-semibold ${moodCfg.color} flex items-center pt-0.5`;
    } else {
      profileMoodDisplay.innerHTML = '';
    }
  }

  // О себе / Био
  if (profileBioDisplay) {
    const defaultBio = typeof window.t === 'function' ? window.t('profile_default_bio', '«Добро пожаловать в мой профиль!»') : '«Добро пожаловать в мой профиль!»';
    profileBioDisplay.textContent = user.bio ? `«${user.bio}»` : defaultBio;
  }

  // Фаворит и Telegram
  if (profileFavCharDisplay) {
    const rawChar = user.favCharacter || 'Танджиро';
    if (typeof window.t === 'function') {
      if (rawChar === 'Эбардо') {
        profileFavCharDisplay.textContent = window.t('char_ebardo', 'Эбардо');
      } else if (rawChar === 'Танджиро' || rawChar === 'Танджиро Камадо') {
        profileFavCharDisplay.textContent = window.t('char_tanjiro', 'Танджиро');
      } else {
        profileFavCharDisplay.textContent = rawChar;
      }
    } else {
      profileFavCharDisplay.textContent = rawChar;
    }
  }
  if (profileTgDisplay) {
    if (user.telegramLink) {
      profileTgDisplay.textContent = user.telegramLink;
      profileTgDisplay.className = 'font-bold text-indigo-600 dark:text-indigo-400 truncate mt-0.5 cursor-pointer hover:underline';
      profileTgDisplay.onclick = () => {
        const clean = user.telegramLink.replace('@', '');
        window.open(`https://t.me/${clean}`, '_blank', 'noopener,noreferrer');
      };
    } else {
      profileTgDisplay.textContent = typeof window.t === 'function' ? window.t('profile_tg_not_set', 'Не указан') : 'Не указан';
      profileTgDisplay.className = 'font-bold text-gray-400 truncate mt-0.5';
      profileTgDisplay.onclick = null;
    }
  }

  // Дата регистрации и приватность
  if (profileDateContainer) {
    profileDateContainer.classList.toggle('hidden', !!user.privacyHideDate);
  }
  if (profileDateDisplay && user.createdAt) {
    const locale = (typeof window !== 'undefined' && window.i18n && window.i18n.currentLang === 'en') ? 'en-US' : 'ru-RU';
    profileDateDisplay.textContent = new Date(user.createdAt).toLocaleDateString(locale);
  }

  // Стиль карточки
  if (profileOverviewCard) {
    const cardStyle = user.cardStyle || 'standard';
    profileOverviewCard.classList.remove('profile-card-standard', 'profile-card-glass', 'profile-card-neon', 'profile-card-metal');
    profileOverviewCard.classList.add(`profile-card-${cardStyle}`);
  }

  // Витрина достижений
  const profileShowcaseTitle = document.getElementById('profileShowcaseTitle');
  const profileShowcaseDesc = document.getElementById('profileShowcaseDesc');
  const showcaseAchKey = user.showcaseAch;
  if (profileShowcaseTitle && typeof achievementsData !== 'undefined') {
    const isKeyUnlocked = typeof achState !== 'undefined' && achState.unlocked && achState.unlocked[showcaseAchKey];
    let ach = isKeyUnlocked ? achievementsData.find(a => a.id === showcaseAchKey) : null;

    if (!ach && typeof achState !== 'undefined' && achState.unlocked) {
      const firstUnlockedId = Object.keys(achState.unlocked).find(k => achState.unlocked[k]);
      if (firstUnlockedId) {
        ach = achievementsData.find(a => a.id === firstUnlockedId);
      }
    }

    if (ach) {
      const achTitle = (typeof window.t === 'function') ? window.t('ach_' + ach.id + '_unlocked_title', ach.unlockedTitle || 'Главное достижение') : (ach.unlockedTitle || 'Главное достижение');
      const achDesc = (typeof window.t === 'function') ? window.t('ach_' + ach.id + '_reward', ach.unlockedDesc || ach.reward || '') : (ach.unlockedDesc || ach.reward || '');
      profileShowcaseTitle.textContent = achTitle;
      if (profileShowcaseDesc) profileShowcaseDesc.textContent = achDesc;
    } else {
      const emptyTitle = (typeof window.t === 'function') ? window.t('profile_showcase_empty', 'Витрина пуста') : 'Витрина пуста';
      const emptyDesc = (typeof window.t === 'function') ? window.t('profile_showcase_empty_desc', 'Выполните достижение в игре, чтобы выставить его сюда!') : 'Выполните достижение в игре, чтобы выставить его сюда!';
      profileShowcaseTitle.textContent = emptyTitle;
      if (profileShowcaseDesc) profileShowcaseDesc.textContent = emptyDesc;
    }
  }

  // Статистика игрока и приватность
  const statsContainer = document.getElementById('profileStatsContainer');
  if (statsContainer) {
    statsContainer.classList.toggle('hidden', !!user.privacyHideStats);
  }

  const statAchCount = document.getElementById('statAchCount');
  const statVipStatus = document.getElementById('statVipStatus');
  const statTanjiroClicks = document.getElementById('statTanjiroClicks');
  const statWheelSpins = document.getElementById('statWheelSpins');

  if (typeof achievementsData !== 'undefined' && typeof achState !== 'undefined') {
    const totalUnlocked = Object.values(achState?.unlocked || {}).filter(Boolean).length;
    if (statAchCount) statAchCount.textContent = `${totalUnlocked} / ${achievementsData.length}`;
  }
  if (statVipStatus) {
    const activeText = (typeof window.t === 'function') ? window.t('profile_vip_active', 'VIP (Активен)') : 'VIP (Активен)';
    const inactiveText = (typeof window.t === 'function') ? window.t('profile_vip_inactive', 'Не активен') : 'Не активен';
    statVipStatus.textContent = isVip ? activeText : inactiveText;
    statVipStatus.className = isVip ? 'text-xs font-extrabold text-amber-500 mt-1.5' : 'text-xs font-bold text-gray-500 dark:text-gray-400 mt-1.5';
  }
  if (statTanjiroClicks) statTanjiroClicks.textContent = String(typeof achState !== 'undefined' ? (achState?.tanjiroClicks || 0) : 0);
  if (statWheelSpins) statWheelSpins.textContent = String(typeof achState !== 'undefined' ? (achState?.wheelSpins || 0) : 0);

  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.applyTranslations === 'function') {
    window.i18n.applyTranslations();
  }
}

/**
 * Сохранение полного набора настроек и данных профиля
 * @param {Object} payload - Поля формы редактирования
 * @returns {{success: boolean, error?: string, user?: Object}}
 */
function saveFullProfileChanges(payload) {
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
  const user = getUserFn ? getUserFn() : null;
  if (!user) return { success: false, error: 'Пользователь не авторизован!' };

  const getDbFn = typeof getAccountsDB === 'function' ? getAccountsDB : (typeof window !== 'undefined' ? window.getAccountsDB : null);
  const saveDbFn = typeof saveAccountsDB === 'function' ? saveAccountsDB : (typeof window !== 'undefined' ? window.saveAccountsDB : null);
  const db = getDbFn ? getDbFn() : {};
  const cleanUser = payload.username ? payload.username.trim() : user.username;

  if (!cleanUser || cleanUser.length < 2) {
    return { success: false, error: 'Никнейм должен содержать минимум 2 символа!' };
  }

  if (cleanUser.toLowerCase() !== user.username.toLowerCase()) {
    const nameTaken = Object.values(db).some(acc => acc.id !== user.id && acc.username.toLowerCase() === cleanUser.toLowerCase());
    if (nameTaken) return { success: false, error: 'Пользователь с таким никнеймом уже существует!' };
  }

  // Смена пароля если запрошена
  if (payload.newPassword || payload.oldPassword) {
    if (!payload.oldPassword) return { success: false, error: 'Для смены пароля введите текущий пароль!' };
    if (user.password !== payload.oldPassword) return { success: false, error: 'Текущий пароль указан неверно!' };
    if (!payload.newPassword) return { success: false, error: 'Введите новый пароль!' };
    if (payload.newPassword !== payload.newPasswordConfirm) return { success: false, error: 'Новые пароли не совпадают!' };

    const evalFn = typeof evaluatePasswordStrength === 'function' ? evaluatePasswordStrength : (typeof window !== 'undefined' ? window.evaluatePasswordStrength : null);
    if (evalFn) {
      const strength = evalFn(payload.newPassword);
      if (!strength.valid) {
        return { success: false, error: strength.reason || 'Новый пароль слишком простой! Придумайте более надёжный пароль (минимум 6 символов).' };
      }
    }
    db[user.id].password = payload.newPassword;
  }

  // Сохранение всех полей
  db[user.id].username = cleanUser;
  const cleanRawTag = (payload.tag || '').trim().replace(/^@+/, '').replace(/\s+/g, '_').replace(/[^a-zа-яё0-9_]/gi, '');
  db[user.id].tag = cleanRawTag ? ('@' + cleanRawTag) : ('@' + cleanUser.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zа-яё0-9_]/gi, ''));
  db[user.id].bio = payload.bio || '';
  db[user.id].moodStatus = payload.moodStatus || 'gaming';
  db[user.id].favCharacter = (payload.favCharacter === 'Эбардо' || payload.favCharacter === 'Танджиро') ? payload.favCharacter : 'Эбардо';
  db[user.id].playerTitle = payload.playerTitle || 'none';
  db[user.id].telegramLink = payload.telegramLink || '';
  db[user.id].avatarColor = payload.avatarColor || user.avatarColor || '#6366f1';
  db[user.id].avatarPreset = payload.avatarPreset || null;
  if (payload.avatarImage !== undefined) {
    if (payload.avatarImage === null || isValidAvatarImage(payload.avatarImage)) {
      db[user.id].avatarImage = payload.avatarImage;
    }
  } else {
    db[user.id].avatarImage = user.avatarImage;
  }
  db[user.id].avatarFrame = payload.avatarFrame || 'none';
  db[user.id].bannerGradient = payload.bannerGradient || 'cyber';
  if (payload.bannerImage !== undefined) {
    if (payload.bannerImage === null || isValidAvatarImage(payload.bannerImage)) {
      db[user.id].bannerImage = payload.bannerImage;
    }
  } else {
    db[user.id].bannerImage = user.bannerImage;
  }
  db[user.id].cardStyle = payload.cardStyle || 'standard';
  db[user.id].showcaseAch = payload.showcaseAch || 'universal';
  db[user.id].privacyHideStats = !!payload.privacyHideStats;
  db[user.id].privacyHideDate = !!payload.privacyHideDate;
  db[user.id].updatedAt = Date.now();

  if (saveDbFn) saveDbFn(db);
  updateUserProfileUI();

  const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);
  if (syncFn) syncFn(db[user.id]);

  return { success: true, user: db[user.id] };
}

/**
 * Вывод алерта в форме редактирования профиля
 * @param {string} msg - Текст сообщения
 * @param {boolean} isSuccess - Флаг успеха
 */
function showProfileEditAlert(msg, isSuccess = false) {
  const alertEl = document.getElementById('editProfileAlert');
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
 * Открытие модального окна профиля
 */
function openUserProfileModal() {
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
  const user = getUserFn ? getUserFn() : null;
  if (!user) {
    const openAuthFn = typeof openAuthModal === 'function' ? openAuthModal : (typeof window !== 'undefined' ? window.openAuthModal : null);
    if (openAuthFn) openAuthFn();
    return;
  }
  updateUserProfileUI();
  showProfileSection('overview');

  const userProfileModal = document.getElementById('userProfileModal');
  const userProfileModalContent = document.getElementById('userProfileModalContent');
  if (userProfileModal && userProfileModalContent) {
    userProfileModal.classList.remove('hidden', 'animate-modal-backdrop-out');
    userProfileModal.classList.add('animate-modal-backdrop-in');
    userProfileModalContent.classList.remove('animate-fade-out-scale', 'opacity-0', 'invisible');
    userProfileModalContent.classList.add('animate-fade-in-scale');
    if (typeof syncBodyScrollLock === 'function') syncBodyScrollLock();
  }
  if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.applyTranslations === 'function') {
    window.i18n.applyTranslations();
  }
}

/**
 * Закрытие модального окна профиля
 */
function closeUserProfileModal() {
  const userProfileModal = document.getElementById('userProfileModal');
  const userProfileModalContent = document.getElementById('userProfileModalContent');
  if (userProfileModal && userProfileModalContent) {
    userProfileModal.classList.remove('animate-modal-backdrop-in');
    userProfileModal.classList.add('animate-modal-backdrop-out');
    userProfileModalContent.classList.remove('animate-fade-in-scale');
    userProfileModalContent.classList.add('animate-fade-out-scale');
    setTimeout(() => {
      userProfileModal.classList.add('hidden');
      userProfileModal.classList.remove('animate-modal-backdrop-out');
      userProfileModalContent.classList.remove('animate-fade-out-scale');
      userProfileModalContent.classList.add('opacity-0', 'invisible');
      if (typeof syncBodyScrollLock === 'function') syncBodyScrollLock();
    }, 180);
  }
}

/**
 * Переключение вкладок в редакторе профиля
 * @param {string} tabName - 'appearance' | 'identity' | 'theme' | 'security'
 */
function switchEditTab(tabName) {
  const tabs = ['appearance', 'identity', 'theme', 'security'];
  tabs.forEach(t => {
    const btn = document.getElementById(`editTabBtn_${t}`);
    const content = document.getElementById(`editTabContent_${t}`);
    if (t === tabName) {
      if (btn) btn.className = 'flex-1 py-2.5 rounded-xl bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-300 shadow-sm transition flex items-center justify-center gap-1.5';
      if (content) content.classList.remove('hidden');
    } else {
      if (btn) btn.className = 'flex-1 py-2.5 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-1.5';
      if (content) content.classList.add('hidden');
    }
  });
}

/**
 * Обновление живого превью карточки при вводе в редакторе
 */
function updateEditLivePreview() {
  const nameInp = document.getElementById('editProfileUsername');
  const tagInp = document.getElementById('editProfileTag');
  const moodSelect = document.getElementById('editProfileMood');
  const titleSelect = document.getElementById('editProfileTitle');

  const previewName = document.getElementById('editLivePreviewName');
  const previewTag = document.getElementById('editLivePreviewTag');
  const previewMood = document.getElementById('editLivePreviewMood');
  const previewTitle = document.getElementById('editLivePreviewTitle');
  const previewAvatar = document.getElementById('editLivePreviewAvatar');
  const previewFrame = document.getElementById('editLivePreviewFrame');
  const previewBanner = document.getElementById('editLivePreviewBanner');
  const previewCard = document.getElementById('editLivePreviewCard');

  const fallbackName = typeof window.t === 'function' ? window.t('profile_fallback_user', 'Пользователь') : 'Пользователь';
  const username = nameInp?.value.trim() || fallbackName;
  const tag = tagInp?.value.trim() || ('@' + username.toLowerCase().replace(/\s+/g, '_'));

  if (previewName) previewName.textContent = username;
  if (previewTag) previewTag.textContent = tag;

  // Титул
  const titleVal = titleSelect?.value || 'none';
  const titleKey = 'title_' + titleVal;
  const titleText = typeof window.t === 'function' ? window.t(titleKey, TITLE_CONFIG[titleVal] || '') : (TITLE_CONFIG[titleVal] || '');
  if (previewTitle) {
    if (titleText) {
      previewTitle.textContent = titleText;
      previewTitle.classList.remove('hidden');
    } else {
      previewTitle.classList.add('hidden');
    }
  }

  // Настроение
  const moodVal = moodSelect?.value || 'gaming';
  const moodCfg = MOOD_CONFIG[moodVal] || MOOD_CONFIG.gaming;
  if (previewMood) {
    let mText = moodCfg.label;
    if (typeof window.t === 'function') {
      if (moodVal === 'coding') {
        mText = window.t('mood_coding', 'Кодит...');
      } else if (moodVal !== 'none') {
        mText = window.t('mood_' + moodVal, moodCfg.label);
      } else {
        mText = '';
      }
    }
    previewMood.textContent = (mText || '').replace(/<[^>]*>?/gm, '');
    previewMood.className = `text-[10px] font-semibold ${moodCfg.color} truncate`;
  }

  // Аватар
  if (previewAvatar) {
    if (editState.avatarImage) {
      previewAvatar.textContent = '';
      previewAvatar.style.backgroundImage = `url(${editState.avatarImage})`;
      previewAvatar.style.backgroundSize = 'cover';
      previewAvatar.style.backgroundPosition = 'center';
    } else if (editState.avatarPreset && typeof AVATAR_PRESETS !== 'undefined' && AVATAR_PRESETS[editState.avatarPreset]) {
      previewAvatar.textContent = AVATAR_PRESETS[editState.avatarPreset].text;
      previewAvatar.style.backgroundImage = '';
      previewAvatar.style.backgroundColor = AVATAR_PRESETS[editState.avatarPreset].color;
    } else {
      previewAvatar.textContent = (username || 'U').charAt(0).toUpperCase();
      previewAvatar.style.backgroundImage = '';
      previewAvatar.style.backgroundColor = editState.avatarColor || '#6366f1';
    }
  }

  // Видимость блока выбора цвета для буквы (скрываем при загруженном фото)
  const avatarColorBox = document.getElementById('editAvatarColorBox');
  if (avatarColorBox) {
    avatarColorBox.classList.toggle('hidden', !!editState.avatarImage);
  }

  // Рамка
  if (previewFrame) {
    previewFrame.className = `profile-frame-${editState.avatarFrame || 'none'} p-[2px] rounded-full inline-flex items-center justify-center transition-all flex-shrink-0`;
  }

  // Баннер
  if (previewBanner) {
    if (editState.bannerImage) {
      previewBanner.style.backgroundImage = `url(${editState.bannerImage})`;
      previewBanner.style.background = '';
      previewBanner.style.backgroundSize = 'cover';
      previewBanner.style.backgroundPosition = 'center';
    } else {
      previewBanner.style.background = BANNER_GRADIENTS[editState.bannerGradient] || BANNER_GRADIENTS.cyber;
    }
  }

  // Стиль карточки
  if (previewCard) {
    const cardStyle = editState.cardStyle || 'standard';
    previewCard.classList.remove('profile-card-standard', 'profile-card-glass', 'profile-card-neon', 'profile-card-metal');
    previewCard.classList.add(`profile-card-${cardStyle}`);
  }
}

/**
 * Переключение секции модалки профиля ('overview' или 'edit')
 * @param {string} section - 'overview' | 'edit'
 */
function showProfileSection(section) {
  const overview = document.getElementById('profileOverviewSection');
  const edit = document.getElementById('profileEditSection');
  const alertEl = document.getElementById('editProfileAlert');
  if (alertEl) alertEl.classList.add('hidden');

  if (section === 'edit') {
    if (overview) overview.classList.add('hidden');
    if (edit) edit.classList.remove('hidden');

    const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
    const user = getUserFn ? getUserFn() : null;
    if (user) {
      editState = {
        avatarColor: user.avatarColor || '#6366f1',
        avatarPreset: user.avatarPreset || null,
        avatarImage: user.avatarImage || null,
        avatarFrame: user.avatarFrame || 'none',
        bannerGradient: user.bannerGradient || 'cyber',
        bannerImage: user.bannerImage || null,
        cardStyle: user.cardStyle || 'standard'
      };

      const usernameInput = document.getElementById('editProfileUsername');
      const tagInput = document.getElementById('editProfileTag');
      const bioInput = document.getElementById('editProfileBio');
      const moodSelect = document.getElementById('editProfileMood');
      const titleSelect = document.getElementById('editProfileTitle');
      const favCharSelect = document.getElementById('editProfileFavChar');
      const tgInput = document.getElementById('editProfileTelegram');
      const oldPwdInput = document.getElementById('editProfileOldPassword');
      const newPwdInput = document.getElementById('editProfileNewPassword');
      const newConfirmPwdInput = document.getElementById('editProfileNewPasswordConfirm');
      const showcaseAchSelect = document.getElementById('editProfileShowcaseAch');
      const privacyHideStats = document.getElementById('editPrivacyHideStats');
      const privacyHideDate = document.getElementById('editPrivacyHideDate');

      if (usernameInput) usernameInput.value = user.username || '';
      if (tagInput) tagInput.value = user.tag || `@${user.username.toLowerCase().replace(/\s+/g, '_')}`;
      if (bioInput) bioInput.value = user.bio || '';
      
      const isCreator = isCreatorAccount(user);
      if (moodSelect) {
        const codingOpt = moodSelect.querySelector('option[value="coding"]');
        if (codingOpt) {
          codingOpt.style.display = isCreator ? '' : 'none';
          codingOpt.disabled = !isCreator;
        }
        const effectiveMood = (!isCreator && user.moodStatus === 'coding') ? 'gaming' : (user.moodStatus || 'gaming');
        moodSelect.value = effectiveMood;
      }

      if (titleSelect) {
        const adminOpt = titleSelect.querySelector('option[value="admin"]');
        if (adminOpt) {
          adminOpt.style.display = isCreator ? '' : 'none';
          adminOpt.disabled = !isCreator;
        }
        const effectiveTitle = (!isCreator && (user.playerTitle === 'admin' || user.playerTitle === 'vip_pioneer')) ? 'none' : (user.playerTitle || 'none');
        titleSelect.value = effectiveTitle;
      }
      if (favCharSelect) favCharSelect.value = user.favCharacter || 'Танджиро Камадо';
      if (tgInput) tgInput.value = user.telegramLink || '';
      if (oldPwdInput) oldPwdInput.value = '';
      if (newPwdInput) newPwdInput.value = '';
      if (newConfirmPwdInput) newConfirmPwdInput.value = '';
      if (showcaseAchSelect && typeof achievementsData !== 'undefined') {
        showcaseAchSelect.innerHTML = '';
        const unlockedList = (typeof achState !== 'undefined' && achState.unlocked)
          ? achievementsData.filter(ach => !!achState.unlocked[ach.id])
          : [];

        if (unlockedList.length === 0) {
          const opt = document.createElement('option');
          opt.value = '';
          opt.textContent = typeof window.t === 'function' ? window.t('profile_no_unlocked_ach', 'Нет открытых достижений (выполните хотя бы одно)') : 'Нет открытых достижений (выполните хотя бы одно)';
          opt.disabled = true;
          opt.selected = true;
          showcaseAchSelect.appendChild(opt);
          showcaseAchSelect.disabled = true;
        } else {
          showcaseAchSelect.disabled = false;
          unlockedList.forEach(ach => {
            const opt = document.createElement('option');
            opt.value = ach.id;
            const aTitle = typeof window.t === 'function' ? window.t('ach_' + ach.id + '_unlocked_title', ach.unlockedTitle) : ach.unlockedTitle;
            const aRew = typeof window.t === 'function' ? window.t('ach_' + ach.id + '_reward', ach.reward) : ach.reward;
            opt.textContent = `${aTitle} — ${aRew}`;
            showcaseAchSelect.appendChild(opt);
          });

          if (user.showcaseAch && achState.unlocked[user.showcaseAch]) {
            showcaseAchSelect.value = user.showcaseAch;
          } else {
            showcaseAchSelect.value = unlockedList[0].id;
          }
        }
      }
      if (privacyHideStats) privacyHideStats.checked = !!user.privacyHideStats;
      if (privacyHideDate) privacyHideDate.checked = !!user.privacyHideDate;

      highlightSelectedColor(editState.avatarColor);
      highlightSelectedFrame(editState.avatarFrame);
      highlightSelectedBanner(editState.bannerGradient);
      highlightSelectedCardStyle(editState.cardStyle);

      switchEditTab('appearance');
      const updateMeterFn = typeof updateStrengthMeterUI === 'function' ? updateStrengthMeterUI : (typeof window !== 'undefined' ? window.updateStrengthMeterUI : null);
      if (updateMeterFn) {
        updateMeterFn('editStrengthContainer', 'editStrBar', 'editStrengthLabel', '');
      }
      updateEditLivePreview();

      if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.applyTranslations === 'function') {
        window.i18n.applyTranslations();
      }
    }
  } else {
    if (edit) edit.classList.add('hidden');
    if (overview) overview.classList.remove('hidden');
    if (typeof window !== 'undefined' && window.i18n && typeof window.i18n.applyTranslations === 'function') {
      window.i18n.applyTranslations();
    }
  }
}

function highlightSelectedColor(color) {
  document.querySelectorAll('.avatar-color-btn').forEach(btn => {
    const btnColor = btn.getAttribute('data-avatar-color');
    if (btnColor && btnColor.toLowerCase() === (color || '').toLowerCase()) {
      btn.classList.add('ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-800', 'scale-110');
      btn.classList.remove('ring-transparent');
    } else {
      btn.classList.remove('ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-800', 'scale-110');
      btn.classList.add('ring-transparent');
    }
  });
}

function highlightSelectedFrame(frame) {
  document.querySelectorAll('.avatar-frame-btn').forEach(btn => {
    const btnFrame = btn.getAttribute('data-avatar-frame');
    if (btnFrame === frame) {
      btn.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/40');
    } else {
      btn.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/40');
    }
  });
}

function highlightSelectedBanner(grad) {
  document.querySelectorAll('.banner-gradient-btn').forEach(btn => {
    const btnGrad = btn.getAttribute('data-banner-gradient');
    if (btnGrad === grad) {
      btn.classList.add('ring-4', 'ring-indigo-500', 'scale-105');
    } else {
      btn.classList.remove('ring-4', 'ring-indigo-500', 'scale-105');
    }
  });
}

function highlightSelectedCardStyle(style) {
  document.querySelectorAll('.card-style-btn').forEach(btn => {
    const btnStyle = btn.getAttribute('data-card-style');
    if (btnStyle === style) {
      btn.classList.add('ring-2', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/40');
    } else {
      btn.classList.remove('ring-2', 'ring-indigo-500', 'bg-indigo-50', 'dark:bg-indigo-950/40');
    }
  });
}

/**
 * Экспорт профиля пользователя (с защитой паролем)
 */
async function exportProfileJson() {
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
  const user = getUserFn ? getUserFn() : null;
  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);

  if (!user) {
    if (toastFn) toastFn('Сначала войдите в аккаунт для экспорта данных!', 'error', 'Ошибка');
    return;
  }
  const saveUserFn = typeof saveCurrentUserData === 'function' ? saveCurrentUserData : (typeof window !== 'undefined' ? window.saveCurrentUserData : null);
  if (saveUserFn) saveUserFn();

  const exportData = {
    format: "nanj_profile_backup",
    version: 2,
    exportDate: new Date().toISOString(),
    username: user.username,
    avatarType: user.avatarType,
    avatarColor: user.avatarColor,
    avatarImage: user.avatarImage,
    avatarPreset: user.avatarPreset,
    avatarFrame: user.avatarFrame,
    bannerType: user.bannerType,
    bannerGradient: user.bannerGradient,
    bannerImage: user.bannerImage,
    bio: user.bio,
    moodStatus: user.moodStatus,
    favCharacter: user.favCharacter,
    playerTitle: user.playerTitle,
    telegramLink: user.telegramLink,
    cardStyle: user.cardStyle,
    showcaseAch: user.showcaseAch,
    privacyHideStats: user.privacyHideStats,
    privacyHideDate: user.privacyHideDate,
    data: user.data || {}
  };

  const openExportFn = typeof openExportPasswordModal === 'function' ? openExportPasswordModal : (typeof window !== 'undefined' ? window.openExportPasswordModal : null);
  if (openExportFn) {
    openExportFn(exportData);
  }
}

/**
 * Универсальная функция применения JSON данных (из файла или текста)
 * @param {string} rawString - JSON-строка
 * @param {string} sourceDescription - Описание источника
 * @returns {boolean}
 */
function applyImportedJsonString(rawString, sourceDescription = 'файл') {
  const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
  const rawContent = (rawString || '').toString().trim().replace(/^﻿/, '');
  if (!rawContent) {
    if (toastFn) toastFn('Текст бэкапа пуст!', 'error', 'Ошибка импорта');
    return false;
  }

  let imported = null;
  try {
    imported = JSON.parse(rawContent);
  } catch (err) {
    if (toastFn) toastFn('Ошибка при парсинге JSON: ' + (err?.message || err), 'error', 'Неверный формат');
    return false;
  }

  if (!imported || typeof imported !== 'object') {
    if (toastFn) toastFn('Данные не содержат корректный объект JSON!', 'error', 'Ошибка импорта');
    return false;
  }

  const getDbFn = typeof getAccountsDB === 'function' ? getAccountsDB : (typeof window !== 'undefined' ? window.getAccountsDB : null);
  const saveDbFn = typeof saveAccountsDB === 'function' ? saveAccountsDB : (typeof window !== 'undefined' ? window.saveAccountsDB : null);
  const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
  const getDefaultsFn = typeof getFreshAccountDefaultData === 'function' ? getFreshAccountDefaultData : (typeof window !== 'undefined' ? window.getFreshAccountDefaultData : null);

  const db = getDbFn ? getDbFn() : {};
  const currentUser = getUserFn ? getUserFn() : null;
  const defaults = getDefaultsFn ? getDefaultsFn() : {
    achState: { tanjiroClicks: 0, wheelSpins: 0, unlocked: {} },
    packs: [],
    achEffects: {}
  };

  const importedData = imported.data || imported;

  // Нормализация паков
  const rawPacks = Array.isArray(importedData.packs) ? importedData.packs : (Array.isArray(imported.packs) ? imported.packs : defaults.packs);
  const sanitizedPacks = (rawPacks || []).map(p => ({
    id: p.id || ('pack_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6)),
    title: p.title || p.name || 'Пользовательский пак',
    type: p.type || 'both',
    names: Array.isArray(p.names) ? p.names : (Array.isArray(p.items) ? p.items : []),
    roles: Array.isArray(p.roles) ? p.roles : [],
    active: !!p.active
  }));

  const finalData = {
    ...defaults,
    ...importedData,
    achState: importedData.achState || imported.achState || defaults.achState,
    packs: sanitizedPacks,
    achEffects: importedData.achEffects || imported.achEffects || defaults.achEffects,
    siteSelectedFont: importedData.siteSelectedFont || imported.siteSelectedFont || defaults.siteSelectedFont,
    app_volume_percent: importedData.app_volume_percent !== undefined ? importedData.app_volume_percent : defaults.app_volume_percent,
    theme: importedData.theme || imported.theme || defaults.theme,
    sitePhotoBg: importedData.sitePhotoBg !== undefined ? importedData.sitePhotoBg : defaults.sitePhotoBg,
    tabCustomPhoto: importedData.tabCustomPhoto !== undefined ? importedData.tabCustomPhoto : defaults.tabCustomPhoto,
    tabModes: importedData.tabModes || defaults.tabModes,
    customExclusion: importedData.customExclusion || defaults.customExclusion,
    customPity: importedData.customPity !== undefined ? importedData.customPity : defaults.customPity
  };

  const loadUserFn = typeof loadUserData === 'function' ? loadUserData : (typeof window !== 'undefined' ? window.loadUserData : null);
  const syncFn = typeof syncUserToCloud === 'function' ? syncUserToCloud : (typeof window !== 'undefined' ? window.syncUserToCloud : null);

  if (currentUser) {
    currentUser.data = finalData;
    currentUser.hasImportedData = true;
    currentUser.dataImportedAt = new Date().toISOString();
    currentUser.updatedAt = Date.now();

    if (imported.avatarType) currentUser.avatarType = imported.avatarType;
    if (imported.avatarColor) {
      currentUser.avatarColor = /^#([0-9a-fA-F]{3,8})$/.test(imported.avatarColor) ? imported.avatarColor : '#6366f1';
    }
    if (imported.avatarImage !== undefined) {
      currentUser.avatarImage = (imported.avatarImage && isValidAvatarImage(imported.avatarImage)) ? imported.avatarImage.trim() : null;
    }
    if (imported.avatarPreset !== undefined) currentUser.avatarPreset = imported.avatarPreset;
    if (imported.avatarFrame) currentUser.avatarFrame = imported.avatarFrame;
    if (imported.bannerType) currentUser.bannerType = imported.bannerType;
    if (imported.bannerGradient) currentUser.bannerGradient = imported.bannerGradient;
    if (imported.bannerImage !== undefined) {
      currentUser.bannerImage = (imported.bannerImage && isValidAvatarImage(imported.bannerImage)) ? imported.bannerImage.trim() : null;
    }
    if (imported.bio !== undefined) currentUser.bio = imported.bio;
    if (imported.moodStatus !== undefined) currentUser.moodStatus = imported.moodStatus;
    if (imported.favCharacter !== undefined) currentUser.favCharacter = imported.favCharacter;
    if (imported.playerTitle !== undefined) currentUser.playerTitle = imported.playerTitle;
    if (imported.telegramLink !== undefined) currentUser.telegramLink = imported.telegramLink;
    if (imported.cardStyle !== undefined) currentUser.cardStyle = imported.cardStyle;
    if (imported.showcaseAch !== undefined) currentUser.showcaseAch = imported.showcaseAch;

    db[currentUser.id] = currentUser;
    if (saveDbFn) saveDbFn(db);
    if (loadUserFn) loadUserFn(currentUser.id);
    if (syncFn) syncFn(currentUser);
    updateUserProfileUI();

    try { if (typeof updateAchievementsUI === 'function') updateAchievementsUI(); } catch(e) {}
    try { if (typeof renderPacksList === 'function') renderPacksList(); } catch(e) {}
    
    showProfileSection('overview');
    if (toastFn) toastFn(`Все данные успешно перенесены в ваш аккаунт «${currentUser.username}»!`, 'success', 'Импорт завершён');
    return true;
  } else {
    const targetId = imported.id || ('user_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7));
    const rawUsername = (imported.username || 'Игрок').trim();
    const username = (/^[a-zA-Zа-яА-Я0-9_-]+$/.test(rawUsername)) ? rawUsername : (rawUsername.replace(/[^a-zA-Zа-яА-Я0-9_-]/g, '') || 'Игрок');
    const safeAvatarCol = /^#([0-9a-fA-F]{3,8})$/.test(imported.avatarColor || '') ? imported.avatarColor : '#6366f1';
    const safeAvatarImg = (imported.avatarImage && isValidAvatarImage(imported.avatarImage)) ? imported.avatarImage.trim() : null;
    const safeBannerImg = (imported.bannerImage && isValidAvatarImage(imported.bannerImage)) ? imported.bannerImage.trim() : null;

    const newAcc = {
      id: targetId,
      username: username,
      tag: imported.tag || ('@' + username.toLowerCase().replace(/\s+/g, '_')),
      password: imported.password || '123456_pass',
      avatarType: imported.avatarType || 'color',
      avatarColor: safeAvatarCol,
      avatarImage: safeAvatarImg,
      avatarPreset: imported.avatarPreset || null,
      avatarFrame: imported.avatarFrame || 'none',
      bannerType: imported.bannerType || 'gradient',
      bannerGradient: imported.bannerGradient || 'cyber',
      bannerImage: safeBannerImg,
      bio: imported.bio || 'Импортированный профиль',
      moodStatus: imported.moodStatus || 'gaming',
      favCharacter: imported.favCharacter || 'Эбардо',
      playerTitle: imported.playerTitle || 'none',
      telegramLink: imported.telegramLink || '',
      cardStyle: imported.cardStyle || 'standard',
      showcaseAch: imported.showcaseAch || 'universal',
      privacyHideStats: !!imported.privacyHideStats,
      privacyHideDate: !!imported.privacyHideDate,
      createdAt: imported.createdAt || Date.now(),
      updatedAt: Date.now(),
      hasImportedData: true,
      dataImportedAt: new Date().toISOString(),
      data: finalData
    };

    db[targetId] = newAcc;
    if (saveDbFn) saveDbFn(db);
    if (loadUserFn) loadUserFn(targetId);
    if (syncFn) syncFn(newAcc);
    updateUserProfileUI();

    try { if (typeof updateAchievementsUI === 'function') updateAchievementsUI(); } catch(e) {}
    try { if (typeof renderPacksList === 'function') renderPacksList(); } catch(e) {}

    showProfileSection('overview');
    if (toastFn) toastFn(`Профиль «${username}» успешно импортирован!`, 'success', 'Импорт завершён');
    return true;
  }
}

/**
 * Обработка импорта профиля из выбранного файла
 * @param {File} file - Загруженный файл
 */
function handleProfileImport(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    const rawContent = ev.target.result;
    try {
      const parsed = JSON.parse(rawContent);
      if (parsed && parsed.format === 'nanj_secure_backup_v1' && parsed.data && parsed.salt && parsed.iv) {
        const openImportModalFn = typeof openImportPasswordModal === 'function' ? openImportPasswordModal : (typeof window !== 'undefined' ? window.openImportPasswordModal : null);
        if (openImportModalFn) {
          openImportModalFn(parsed, file.name || 'бэкап');
          return;
        }
      }
    } catch(e) {}
    applyImportedJsonString(rawContent, file.name || 'файл');
  };
  reader.readAsText(file);
}

let profileListenersInitialized = false;

/**
 * Инициализация всех слушателей событий профиля и кастомизации
 */
function initProfileListeners() {
  if (profileListenersInitialized) return;
  profileListenersInitialized = true;

  // Бейдж импортированного профиля
  const impBadge = document.getElementById('profileImportedBadge');
  const impTooltip = document.getElementById('profileImportedTooltip');
  if (impBadge && impTooltip) {
    impBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      impTooltip.classList.toggle('hidden');
    });

    document.addEventListener('click', (e) => {
      if (!impBadge.contains(e.target) && !impTooltip.contains(e.target)) {
        impTooltip.classList.add('hidden');
      }
    });
  }

  // Модалка профиля
  const userProfileBtn = document.getElementById('userProfileBtn');
  const userProfileModal = document.getElementById('userProfileModal');
  const closeUserProfileModalX = document.getElementById('closeUserProfileModalX');

  if (userProfileBtn) userProfileBtn.addEventListener('click', openUserProfileModal);
  if (closeUserProfileModalX) closeUserProfileModalX.addEventListener('click', closeUserProfileModal);
  if (userProfileModal) {
    userProfileModal.addEventListener('click', (e) => {
      if (e.target === userProfileModal) closeUserProfileModal();
    });
  }

  // Навигация между секциями (обзор / редактирование)
  const profileGoToEditBtn = document.getElementById('profileGoToEditBtn');
  const profileBackToOverviewBtn = document.getElementById('profileBackToOverviewBtn');
  const cancelEditProfileBtn = document.getElementById('cancelEditProfileBtn');

  if (profileGoToEditBtn) profileGoToEditBtn.addEventListener('click', () => showProfileSection('edit'));
  if (profileBackToOverviewBtn) profileBackToOverviewBtn.addEventListener('click', () => showProfileSection('overview'));
  if (cancelEditProfileBtn) cancelEditProfileBtn.addEventListener('click', () => showProfileSection('overview'));

  // Вкладки редактора
  ['appearance', 'identity', 'theme', 'security'].forEach(tab => {
    document.getElementById(`editTabBtn_${tab}`)?.addEventListener('click', () => switchEditTab(tab));
  });

  // Живой предпросмотр
  ['editProfileUsername', 'editProfileTag', 'editProfileBio', 'editProfileMood', 'editProfileTitle'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', updateEditLivePreview);
    document.getElementById(id)?.addEventListener('change', updateEditLivePreview);
  });

  // Выбор цвета
  document.querySelectorAll('.avatar-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const color = btn.getAttribute('data-avatar-color');
      if (color) {
        editState.avatarColor = color;
        editState.avatarPreset = null;
        editState.avatarImage = null;
        highlightSelectedColor(color);
        updateEditLivePreview();
      }
    });
  });

  // Пресеты
  document.querySelectorAll('.avatar-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const preset = btn.getAttribute('data-avatar-preset');
      if (preset && AVATAR_PRESETS[preset]) {
        editState.avatarPreset = preset;
        editState.avatarImage = null;
        updateEditLivePreview();
      }
    });
  });

  // Загрузка фото аватара
  const editAvatarUploadBtn = document.getElementById('editAvatarUploadBtn');
  const editAvatarFileInput = document.getElementById('editAvatarFileInput');
  const editAvatarRemoveBtn = document.getElementById('editAvatarRemoveBtn');

  if (editAvatarUploadBtn && editAvatarFileInput) {
    editAvatarUploadBtn.addEventListener('click', () => editAvatarFileInput.click());
    editAvatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        if (!ALLOWED_TYPES.includes(file.type)) {
          const toast = typeof showSiteToast === 'function' ? showSiteToast : window.showSiteToast;
          if (toast) toast('Поддерживаются только изображения PNG, JPEG, WEBP и GIF (SVG запрещён)!', 'error', 'Ошибка файла');
          editAvatarFileInput.value = '';
          return;
        }
        if (file.size > 2 * 1024 * 1024) {
          const toast = typeof showSiteToast === 'function' ? showSiteToast : window.showSiteToast;
          if (toast) toast('Размер изображения не должен превышать 2 МБ!', 'error', 'Слишком большой файл');
          editAvatarFileInput.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          editState.avatarImage = ev.target.result;
          editState.avatarPreset = null;
          updateEditLivePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (editAvatarRemoveBtn) {
    editAvatarRemoveBtn.addEventListener('click', () => {
      editState.avatarImage = null;
      editState.avatarPreset = null;
      updateEditLivePreview();
    });
  }

  // Рамки аватара
  document.querySelectorAll('.avatar-frame-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const frame = btn.getAttribute('data-avatar-frame') || 'none';
      editState.avatarFrame = frame;
      highlightSelectedFrame(frame);
      updateEditLivePreview();
    });
  });

  // Градиенты баннера
  document.querySelectorAll('.banner-gradient-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const grad = btn.getAttribute('data-banner-gradient') || 'cyber';
      editState.bannerGradient = grad;
      editState.bannerImage = null;
      highlightSelectedBanner(grad);
      updateEditLivePreview();
    });
  });

  // Загрузка фото баннера
  const editBannerUploadBtn = document.getElementById('editBannerUploadBtn');
  const editBannerFileInput = document.getElementById('editBannerFileInput');

  if (editBannerUploadBtn && editBannerFileInput) {
    editBannerUploadBtn.addEventListener('click', () => editBannerFileInput.click());
    editBannerFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
        if (!ALLOWED_TYPES.includes(file.type)) {
          const toast = typeof showSiteToast === 'function' ? showSiteToast : window.showSiteToast;
          if (toast) toast('Поддерживаются только изображения PNG, JPEG, WEBP и GIF (SVG запрещён)!', 'error', 'Ошибка файла');
          editBannerFileInput.value = '';
          return;
        }
        if (file.size > 3 * 1024 * 1024) {
          const toast = typeof showSiteToast === 'function' ? showSiteToast : window.showSiteToast;
          if (toast) toast('Размер баннера не должен превышать 3 МБ!', 'error', 'Слишком большой файл');
          editBannerFileInput.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (ev) => {
          editState.bannerImage = ev.target.result;
          updateEditLivePreview();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // Стили карточки
  document.querySelectorAll('.card-style-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const style = btn.getAttribute('data-card-style') || 'standard';
      editState.cardStyle = style;
      highlightSelectedCardStyle(style);
      updateEditLivePreview();
    });
  });

  // Кнопка сохранения изменений
  const saveProfileChangesBtn = document.getElementById('saveProfileChangesBtn');
  if (saveProfileChangesBtn) {
    saveProfileChangesBtn.addEventListener('click', () => {
      const payload = {
        username: document.getElementById('editProfileUsername')?.value.trim(),
        tag: document.getElementById('editProfileTag')?.value.trim(),
        bio: document.getElementById('editProfileBio')?.value.trim(),
        moodStatus: document.getElementById('editProfileMood')?.value || 'gaming',
        playerTitle: document.getElementById('editProfileTitle')?.value || 'none',
        favCharacter: document.getElementById('editProfileFavChar')?.value || 'Танджиро Камадо',
        telegramLink: document.getElementById('editProfileTelegram')?.value.trim(),
        avatarColor: editState.avatarColor,
        avatarPreset: editState.avatarPreset,
        avatarImage: editState.avatarImage,
        avatarFrame: editState.avatarFrame,
        bannerGradient: editState.bannerGradient,
        bannerImage: editState.bannerImage,
        cardStyle: editState.cardStyle,
        showcaseAch: document.getElementById('editProfileShowcaseAch')?.value || 'universal',
        privacyHideStats: document.getElementById('editPrivacyHideStats')?.checked,
        privacyHideDate: document.getElementById('editPrivacyHideDate')?.checked,
        oldPassword: document.getElementById('editProfileOldPassword')?.value,
        newPassword: document.getElementById('editProfileNewPassword')?.value,
        newPasswordConfirm: document.getElementById('editProfileNewPasswordConfirm')?.value
      };

      const res = saveFullProfileChanges(payload);

      if (res.success) {
        showProfileEditAlert(typeof window.t === 'function' ? window.t('profile_saved_success', 'Профиль успешно сохранён!') : 'Профиль успешно сохранён!', true);
        setTimeout(() => {
          showProfileSection('overview');
          updateUserProfileUI();
        }, 500);
      } else {
        showProfileEditAlert(res.error, false);
      }
    });
  }

  // Экспорт
  const profileExportDataBtn = document.getElementById('profileExportDataBtn');
  if (profileExportDataBtn) profileExportDataBtn.addEventListener('click', exportProfileJson);

  // Импорт
  const profileImportDataBtn = document.getElementById('profileImportDataBtn');
  const profileImportFileInput = document.getElementById('profileImportFileInput');
  if (profileImportDataBtn && profileImportFileInput) {
    profileImportDataBtn.addEventListener('click', () => {
      profileImportFileInput.value = '';
      profileImportFileInput.click();
    });
    profileImportFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleProfileImport(e.target.files[0]);
      }
    });
  }

  const btnImportProfileJson = document.getElementById('btnImportProfileJson');
  const fileImportProfileJson = document.getElementById('fileImportProfileJson');
  if (btnImportProfileJson && fileImportProfileJson) {
    btnImportProfileJson.addEventListener('click', () => {
      fileImportProfileJson.value = '';
      fileImportProfileJson.click();
    });
    fileImportProfileJson.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleProfileImport(e.target.files[0]);
      }
    });
  }

  // Сброс прогресса
  const btnResetProfileProgress = document.getElementById('btnResetProfileProgress');
  if (btnResetProfileProgress) {
    btnResetProfileProgress.addEventListener('click', () => {
      const getUserFn = typeof getCurrentUser === 'function' ? getCurrentUser : (typeof window !== 'undefined' ? window.getCurrentUser : null);
      const user = getUserFn ? getUserFn() : null;
      if (!user) return;

      const confirmFn = typeof window !== 'undefined' ? window.showConfirmDialog : null;
      if (!confirmFn) return;

      const confTitle = typeof window.t === 'function' ? window.t('profile_reset_confirm_title', 'Сбросить прогресс?') : 'Сбросить прогресс?';
      const confMsgTpl = typeof window.t === 'function' 
        ? window.t('profile_reset_confirm_msg', `Вы уверены, что хотите сбросить весь прогресс достижений и кликов для профиля «{username}»?`)
        : `Вы уверены, что хотите сбросить весь прогресс достижений и кликов для профиля «{username}»?`;
      const confMsg = confMsgTpl.replace('{username}', user.username || '');
      const confConfirm = typeof window.t === 'function' ? window.t('profile_btn_reset_progress', 'Сбросить прогресс') : 'Сбросить прогресс';
      const confCancel = typeof window.t === 'function' ? window.t('confirm_cancel', 'Отмена') : 'Отмена';

      confirmFn({
        title: confTitle,
        message: confMsg,
        confirmText: confConfirm,
        cancelText: confCancel,
        isDanger: true,
        onConfirm: () => {
          const getDefaultsFn = typeof getFreshAccountDefaultData === 'function' ? getFreshAccountDefaultData : (typeof window !== 'undefined' ? window.getFreshAccountDefaultData : null);
          const defaults = getDefaultsFn ? getDefaultsFn() : { achState: { tanjiroClicks: 0, wheelSpins: 0, unlocked: {} } };

          if (typeof achState !== 'undefined') {
            achState = JSON.parse(JSON.stringify(defaults.achState));
          }
          localStorage.setItem('user_achievements_state', JSON.stringify(defaults.achState));

          const saveUserFn = typeof saveCurrentUserData === 'function' ? saveCurrentUserData : (typeof window !== 'undefined' ? window.saveCurrentUserData : null);
          if (saveUserFn) saveUserFn();

          if (typeof updateAchievementsUI === 'function') updateAchievementsUI();
          updateUserProfileUI();
          if (typeof window !== 'undefined' && typeof window.updateTanjiroClickCounter === 'function') {
            window.updateTanjiroClickCounter(0);
          }
          showProfileEditAlert(typeof window.t === 'function' ? window.t('profile_reset_success', 'Прогресс аккаунта сброшен!') : 'Прогресс аккаунта сброшен!', true);

          const toastFn = typeof showSiteToast === 'function' ? showSiteToast : (typeof window !== 'undefined' ? window.showSiteToast : null);
          if (toastFn) toastFn(
            typeof window.t === 'function' ? window.t('profile_reset_toast', 'Прогресс достижений и кликов успешно сброшен!') : 'Прогресс достижений и кликов успешно сброшен!',
            'success',
            typeof window.t === 'function' ? window.t('profile_reset_toast_title', 'Сброс выполнен') : 'Сброс выполнен'
          );
        }
      });
    });
  }

  // Удаление аккаунта из модалки профиля
  const profileDeleteAccountBtn = document.getElementById('profileDeleteAccountBtn');
  if (profileDeleteAccountBtn) {
    profileDeleteAccountBtn.addEventListener('click', () => {
      const getUserIdFn = typeof getCurrentUserId === 'function' ? getCurrentUserId : (typeof window !== 'undefined' ? window.getCurrentUserId : null);
      const currentId = getUserIdFn ? getUserIdFn() : null;
      const delFn = typeof deleteAccount === 'function' ? deleteAccount : (typeof window !== 'undefined' ? window.deleteAccount : null);
      if (currentId && delFn) delFn(currentId);
    });
  }

  const btnDeleteProfileAccount = document.getElementById('btnDeleteProfileAccount');
  if (btnDeleteProfileAccount) {
    btnDeleteProfileAccount.addEventListener('click', () => {
      const getUserIdFn = typeof getCurrentUserId === 'function' ? getCurrentUserId : (typeof window !== 'undefined' ? window.getCurrentUserId : null);
      const currentId = getUserIdFn ? getUserIdFn() : null;
      const delFn = typeof deleteAccount === 'function' ? deleteAccount : (typeof window !== 'undefined' ? window.deleteAccount : null);
      if (currentId && delFn) delFn(currentId);
    });
  }

  // Drag & Drop бэкапов
  if (userProfileModal) {
    ['dragenter', 'dragover'].forEach(eventName => {
      userProfileModal.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        userProfileModal.classList.add('ring-4', 'ring-indigo-500/50');
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      userProfileModal.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        userProfileModal.classList.remove('ring-4', 'ring-indigo-500/50');
      }, false);
    });

    userProfileModal.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files[0]) {
        handleProfileImport(dt.files[0]);
      }
    }, false);
  }

  // Закрытие по Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (userProfileModal && !userProfileModal.classList.contains('hidden')) {
        closeUserProfileModal();
      }
    }
  });

  // Переключение видимости паролей в форме смены пароля
  function setupLocalPasswordToggle(btnId, inputId) {
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

  setupLocalPasswordToggle('editToggleOldPwdBtn', 'editProfileOldPassword');
  setupLocalPasswordToggle('editToggleNewPwdBtn', 'editProfileNewPassword');
  setupLocalPasswordToggle('editToggleNewConfirmPwdBtn', 'editProfileNewPasswordConfirm');

  // Динамическая оценка сложности нового пароля в профиле
  const editProfileNewPassword = document.getElementById('editProfileNewPassword');
  if (editProfileNewPassword) {
    editProfileNewPassword.addEventListener('input', (e) => {
      const updateMeterFn = typeof updateStrengthMeterUI === 'function' ? updateStrengthMeterUI : (typeof window !== 'undefined' ? window.updateStrengthMeterUI : null);
      if (updateMeterFn) {
        updateMeterFn('editStrengthContainer', 'editStrBar', 'editStrengthLabel', e.target.value);
      }
    });
  }
}

// Автоинициализация при загрузке документа
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProfileListeners);
  } else {
    initProfileListeners();
  }
}

// Экспорт в глобальную область window
if (typeof window !== 'undefined') {
  window.AVATAR_COLORS = AVATAR_COLORS;
  window.getRandomColor = getRandomColor;
  window.isValidAvatarImage = isValidAvatarImage;
  window.BANNER_GRADIENTS = BANNER_GRADIENTS;
  window.MOOD_CONFIG = MOOD_CONFIG;
  window.TITLE_CONFIG = TITLE_CONFIG;
  window.AVATAR_PRESETS = AVATAR_PRESETS;
  window.isCreatorAccount = isCreatorAccount;
  window.updateUserProfileUI = updateUserProfileUI;
  window.saveFullProfileChanges = saveFullProfileChanges;
  window.showProfileEditAlert = showProfileEditAlert;
  window.openUserProfileModal = openUserProfileModal;
  window.closeUserProfileModal = closeUserProfileModal;
  window.switchEditTab = switchEditTab;
  window.updateEditLivePreview = updateEditLivePreview;
  window.showProfileSection = showProfileSection;
  window.highlightSelectedColor = highlightSelectedColor;
  window.highlightSelectedFrame = highlightSelectedFrame;
  window.highlightSelectedBanner = highlightSelectedBanner;
  window.highlightSelectedCardStyle = highlightSelectedCardStyle;
  window.exportProfileJson = exportProfileJson;
  window.applyImportedJsonString = applyImportedJsonString;
  window.handleProfileImport = handleProfileImport;
  window.initProfileListeners = initProfileListeners;

  Object.defineProperty(window, 'editState', {
    get: () => editState,
    set: (val) => { editState = val; },
    configurable: true
  });

  window.addEventListener('languageChanged', () => {
    if (typeof updateUserProfileUI === 'function') {
      updateUserProfileUI();
    }
    const modal = document.getElementById('userProfileModal');
    if (modal && !modal.classList.contains('hidden') && typeof getCurrentUser === 'function') {
      const u = getCurrentUser();
      if (u) {
        const editSec = document.getElementById('profileEditSection');
        if (editSec && !editSec.classList.contains('hidden')) {
          updateEditLivePreview();
        }
      }
    }
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AVATAR_COLORS,
    getRandomColor,
    isValidAvatarImage,
    BANNER_GRADIENTS,
    MOOD_CONFIG,
    TITLE_CONFIG,
    AVATAR_PRESETS,
    isCreatorAccount,
    updateUserProfileUI,
    saveFullProfileChanges,
    openUserProfileModal,
    closeUserProfileModal,
    switchEditTab,
    updateEditLivePreview,
    showProfileSection,
    exportProfileJson,
    applyImportedJsonString,
    handleProfileImport,
    initProfileListeners
  };
}
