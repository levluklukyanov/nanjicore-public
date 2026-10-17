// ═══════════════════════════════════════════════════════════════
// NANJICORE I18N: МОДУЛЬ МУЛЬТИЯЗЫЧНОСТИ (RU / EN)
// Легковесный модуль интернационализации без внешних библиотек
// Поддержка: автоопределение языка, мгновенное переключение DOM,
//            словари интерфейса, колеса фортуны, модалок и ачивок
// ═══════════════════════════════════════════════════════════════

(function () {
  'use strict';

  const STORAGE_KEY = 'nanj_lang';

  const translations = {
    ru: {
      // Общие / Навбар / Шапка
      'app_name': 'Nanjicore',
      'app_tagline': 'Онлайн Рандомайзер, Колесо Фортуны и Мини-Игры',
      'app_loading': 'Загрузка игры...',
      'nav_profile': 'Профиль',
      'nav_achievements': 'Достижения',
      'nav_settings': 'Настройки',
      'badge_local': 'Локальный',
      'common_cancel': 'Отмена',
      'common_delete': 'Удалить',
      'common_close': 'Закрыть',

      // Сегментированные вкладки
      'tab_tanjiro': 'Танджиро',
      'tab_jenna': 'Дженна',
      'tab_custom': 'Кастом',

      // Режимы (Кнопка / Колесо)
      'mode_button': 'Кнопка',
      'mode_wheel': 'Колесо',

      // Вкладка: Танджиро
      'tanjiro_title': 'Танджиро натурал... или нет?',
      'tanjiro_title_hover': 'Танджиро... кто он?',
      'tanjiro_subtitle': 'Сейчас мы это и узнаем',
      'tanjiro_reveal_btn': 'Узнать',
      'tanjiro_spin_btn': 'Крутить колесо!',
      'tanjiro_auto_spin': 'Авто-спин',
      'tanjiro_stop_auto_spin': 'Остановить авто-спин',
      'tanjiro_clicks_label': 'Нажатий:',
      'tanjiro_ans_0': 'Натурал на 100%!',
      'tanjiro_ans_1': 'Не по девочкам...',
      'tanjiro_ans_2': 'Универсал!',
      'tanjiro_ans_3': 'Тайный матвейка!',
      'tanjiro_ans_4': 'Лесбиянка!',

      // Вкладка: Дженна
      'jenna_title': 'Мини-игры Дженны',
      'jenna_subtitle': 'Поиграем?',
      'jenna_card_who_title': 'Кто есть кто?',
      'jenna_card_who_desc': 'Узнай тайную роль друга в чате',
      'jenna_card_members_title': 'Участники Дженны',
      'jenna_card_members_desc': 'Задай статус и найди подходящего',
      'jenna_mode_prefix': 'Режим: ',

      // Модалка: Кто есть кто?
      'who_modal_title': 'Кто есть кто?',
      'who_modal_subtitle': 'Узнай скрытую роль человека',
      'who_input_placeholder': 'Введите имя...',
      'who_reveal_btn': 'Узнать роль',
      'who_spin_btn': 'Крутить колесо',
      'who_role_0': 'Изгой',
      'who_role_1': 'Никто',
      'who_role_2': 'Нн какой-то',
      'who_role_3': 'Легенда чата',
      'who_role_4': 'Владелец',
      'who_role_5': 'Помощник владельца',
      'who_role_6': 'Раб Эбардо',
      'who_enter_name_toast': 'Введите имя перед запуском!',
      'who_bad_word_toast': 'Никнейм не может состоять из матов!',

      // Модалка: Участники Дженны
      'members_modal_title': 'Участники Дженны',
      'members_modal_subtitle': 'Задай статус и найди подходящего человека',
      'members_input_placeholder': 'Введите статус (напр. Гей)...',
      'members_reveal_btn': 'Выбрать участника',
      'members_spin_btn': 'Крутить колесо',
      'members_enter_word_toast': 'Введите статус или слово перед запуском!',
      'members_bad_word_toast': 'Статус не может состоять из матов!',
      'members_result_prefix': 'Я уверен, что ',
      'members_result_is': ' — ',

      // Вкладка: Кастом
      'custom_default_title': 'Настрой своё собственное меню',
      'custom_default_desc': 'Задай список своих друзей и любые роли/прозвища для игры, либо выбери готовые паки!',
      'custom_manual_setup_btn': 'Настроить вручную',
      'custom_open_packs_btn': 'Открыть паки',
      'custom_active_title': 'Моё Меню',
      'custom_active_desc': 'Сейчас мы это и узнаем...',
      'custom_dual_drop': 'Двойной выбор (2 участника)',
      'custom_reveal_btn': 'Узнать',
      'custom_stage_1': 'Этап 1: Выбираем человека',
      'custom_stage_2': 'Этап 2: Выбираем действие/роль',
      'custom_wait_cooldown': 'Подождите ({sec}с)...',
      'custom_spin_btn': 'Крутить колесо!',

      // Модалка: Настройка кастома
      'custom_modal_title': 'Настройка меню',
      'custom_modal_subtitle': 'Создавай и редактируй списки для игры',
      'custom_notice_packs': 'Список имён и ролей сейчас формируется из активных паков. Изменить их можно в <b>Менеджере паков</b>.',
      'custom_name_label': 'Название меню:',
      'custom_name_ph': 'Кто из пати...',
      'custom_desc_label': 'Описание меню:',
      'custom_desc_ph': 'Сейчас мы это узнаем...',
      'custom_names_label': 'Имена друзей (через запятую):',
      'custom_names_ph': 'Эбардо, Танджиро, Алекс',
      'custom_roles_label': 'Роли / Действия (через запятую):',
      'custom_roles_ph': 'Повелитель багов, Главный кодер, Гений',
      'custom_save_btn': 'Сохранить и запустить',
      'custom_tab_names': 'Имена',
      'custom_tab_roles': 'Роли',
      'custom_tab_combo': 'Комбо',
      'custom_save_and_play': 'Сохранить и играть',

      // Модалка: Паки
      'packs_modal_title': 'Менеджер паков',
      'packs_modal_subtitle': 'Выбирайте готовые наборы или создавайте свои',
      'packs_create_btn': 'Создать новый пак',
      'packs_name_label': 'Название пака:',
      'packs_name_ph': 'Например: Пати в Дискорде',
      'packs_content_label': 'Тип содержимого:',
      'packs_opt_both': 'Всё вместе (Имена + Роли/Действия)',
      'packs_opt_names': 'Только Имена',
      'packs_opt_roles': 'Только Роли / Действия',
      'packs_names_label': 'Имена (через запятую):',
      'packs_names_ph': 'Эбардо, Танджиро, Матвей',
      'packs_roles_label': 'Роли / Действия (через запятую):',
      'packs_roles_ph': 'Главный кодер, Гений, Повелитель багов',
      'packs_save_btn': 'Сохранить пак',
      'packs_apply_btn': 'Применить выбранные',
      'packs_delete_title': 'Удалить пак?',
      'packs_delete_confirm': 'Вы уверены, что хотите удалить',

      // Модалка: Настройки сайта
      'settings_title': 'Настройки сайта',
      'settings_language_label': 'Язык интерфейса:',
      'settings_font_label': 'Шрифт интерфейса:',
      'settings_sound_label': 'Звуковой пак клика:',
      'sound_classic': 'Классика',
      'sound_arcade8bit': '8-Bit Ретро',
      'sound_katana': 'Катана',
      'sound_cyber': 'Cyberpunk',
      'sound_bubble': 'Bubble Pop',
      'settings_volume_label': 'Громкость звука:',
      'settings_theme_toggle': 'Сменить тему',
      'settings_photo_bg_site': 'Фон сайта (своё фото)',
      'settings_photo_bg_tabs': 'Фон вкладок (своё фото)',
      'settings_custom_algorithms': 'Алгоритмы Кастома',
      'settings_excl_names_title': 'Метод исключения (Имена)',
      'settings_excl_names_desc': 'Каждое имя выпадает строго 1 раз за цикл',
      'settings_excl_roles_title': 'Метод исключения (Роли)',
      'settings_excl_roles_desc': 'Каждое действие выпадает строго 1 раз за цикл',
      'settings_pity_title': 'Защита от повторов (5 ходов)',
      'settings_pity_desc': 'Выпавший человек/роль не повторится 5 ходов',
      'settings_close_btn': 'Закрыть',

      // Модалка: Достижения и Перки
      'ach_modal_title': 'Достижения и Перки',
      'ach_modal_subtitle': 'Выполняй задания и открывай уникальные фичи',
      'ach_filter_all': 'Все',
      'ach_filter_unlocked': 'Открытые',
      'ach_filter_locked': 'Закрытые',
      'ach_progress_prefix': 'Прогресс: ',
      'ach_progress_done': 'выполнено',
      'ach_status_completed': 'ВЫПОЛНЕНО',
      'ach_status_locked': 'ЗАБЛОКИРОВАНО',
      'ach_reward_prefix': 'Награда: ',
      'ach_perks_title': 'Разблокированные перки и эффекты',
      'ach_empty_category': 'В этой категории пока ничего нет.',

      // Перки
      'perk_stars': 'Звёздный фон',
      'perk_rgb': 'RGB-подсветка',
      'perk_cyberpunk': 'Киберпанк тема',
      'perk_shake': 'Тряска экрана',
      'perk_confetti': 'Конфетти при кликах',
      'perk_hotkeys': 'Горячие клавиши и жесты',
      'perk_fullscreen': 'Полный экран',
      'perk_turbo': 'Турбо-спин',
      'perk_dual': 'Двойной выбор',
      'perk_infinite': 'Авто-спин',

      // Определения достижений
      'ach_fanatic_unlocked_title': 'Фанатик',
      'ach_fanatic_unlocked_desc': 'Нажмите 1000 раз на кнопку во вкладке Танджиро!',
      'ach_fanatic_locked_desc': 'Будьте преданным фанатом создателя..',
      'ach_fanatic_reward': 'Возможность создавать бесконечное количество паков (до разблокировки максимум 5)',

      'ach_nickname_unlocked_title': 'Истинное прозвище',
      'ach_nickname_unlocked_desc': 'Напиши "Танджиро лох" на клавиатуре, введи в игре или нажми 7 раз на его имя!',
      'ach_nickname_locked_desc': 'Воспользуйтесь клавиатурой, чтобы оскорбить создателя..',
      'ach_nickname_reward': 'На ПК: клавиши 1, 2, 3 и стрелки ← / → для смены вкладок, Пробел — действие, Esc — закрыть окна. На телефоне: свайпы влево/вправо для быстрой смены вкладок!',

      'ach_stalker_unlocked_title': 'Сталкер',
      'ach_stalker_unlocked_desc': 'Нажмите на имя каждого создателя в футере!',
      'ach_stalker_locked_desc': 'Узнайте побольше о создателях..',
      'ach_stalker_reward': 'Полноэкранный режим для всех вкладок',

      'ach_ludoman_unlocked_title': 'Лудоман',
      'ach_ludoman_unlocked_desc': '100 раз прокрутите колесо фортуны!',
      'ach_ludoman_locked_desc': 'Вам не кажется что лайт слишком скучно?',
      'ach_ludoman_reward': 'Моментальная прокрутка колеса (переключатель "Турбо-спин")',

      'ach_designer_unlocked_title': 'Дизайнер от бога',
      'ach_designer_unlocked_desc': 'Попробуйте переключить все 12 доступных шрифтов интерфейса!',
      'ach_designer_locked_desc': 'Примерьте разные стили, пока не зарябит в глазах..',
      'ach_designer_reward': 'Режим "RGB-подсветка" (переливающиеся неоновые границы кнопок и карточки)',

      'ach_epileptic_unlocked_title': 'Эпилептик',
      'ach_epileptic_unlocked_desc': 'Переключите тему 15 раз за одну минуту!',
      'ach_epileptic_locked_desc': 'Пощёлкайте выключателем, пока лампочка не перегорит..',
      'ach_epileptic_reward': 'Сверхтёмная неоновая тема "Cyberpunk Neon"',

      'ach_dangerous_unlocked_title': 'Особо опасен',
      'ach_dangerous_unlocked_desc': 'Получите предупреждение о запрещённых словах 3 раза!',
      'ach_dangerous_locked_desc': 'Попытайтесь грязно выругаться, но система вас остановит..',
      'ach_dangerous_reward': 'Эффект тряски экрана при генерации ролей',

      'ach_chef_unlocked_title': 'Шеф-повар паков',
      'ach_chef_unlocked_desc': 'Скомбинируйте и запустите игру сразу из 3 или более паков одновременно!',
      'ach_chef_locked_desc': 'Соберите безумный микс из множества источников..',
      'ach_chef_reward': 'Режим "Двойной выбор" в Кастоме (выбирает сразу 2 участников)',

      'ach_insider_unlocked_title': 'Свой среди своих',
      'ach_insider_unlocked_desc': 'Установите собственное изображение и на фон сайта, и на фон карточек!',
      'ach_insider_locked_desc': 'Сделайте это место по-настоящему своим..',
      'ach_insider_reward': 'Анимированный эффект мерцающих звёздных частиц',

      'ach_hacker_unlocked_title': 'Взломщик реальности',
      'ach_hacker_unlocked_desc': 'Быстро кликните 10 раз по надписи «ООО "тмыв иишек"» в футере!',
      'ach_hacker_locked_desc': 'Постучите по вывеске корпорации..',
      'ach_hacker_reward': 'Взрыв конфетти при каждом действии',

      'ach_creator_blessing_unlocked_title': 'Архитектор Реальности',
      'ach_creator_blessing_unlocked_desc': 'Высший знак отличия: вы управляете правилами и кодом этого мира!',
      'ach_creator_blessing_locked_desc': 'Тайное благословение создателя вселенной Nanjicore..',
      'ach_creator_blessing_reward': 'Королевская аура создателя и доступ к высшим привилегиям',

      'ach_perpetual_unlocked_title': 'Вечный двигатель',
      'ach_perpetual_unlocked_desc': 'Нажмите 7 раз подряд на кнопку во время вращения колеса!',
      'ach_perpetual_locked_desc': 'Попробуйте разогнать вращение, не дожидаясь его остановки..',
      'ach_perpetual_reward': 'Возможность автоматического прокрута колеса (кнопка "Авто-спин")',

      'ach_universal_unlocked_title': 'Истинный универсал',
      'ach_universal_unlocked_desc': 'Сыграйте хотя бы по 5 раз в каждой из 3 вкладок!',
      'ach_universal_locked_desc': 'Попробуйте абсолютно всё, что здесь есть..',
      'ach_universal_reward': 'Золотая анимированная VIP-рамка профиля в окне достижений',

      // Тост ачивки
      'ach_toast_title': 'Выполнено достижение!',

      // Профиль игрока
      'profile_title': 'Профиль игрока',
      'profile_edit_btn': 'Настроить профиль',

      // Титулы
      'title_none': '',
      'title_demon_slayer': 'Истребитель демонов',
      'title_wheel_master': 'Повелитель колеса',
      'title_pack_master': 'Мастер паков',
      'title_click_god': 'Безумный кликер',
      'title_legend': 'Легенда игры',
      'title_vip_pioneer': 'Admin ⚡',
      'title_admin': 'Admin ⚡',

      // Настроения / Статусы
      'mood_gaming': 'В игре',
      'mood_coding': 'Кодит',
      'mood_farming': 'Фармлю крутки',
      'mood_music': 'Слушаю музыку',
      'mood_afk': 'AFK / Отдыхаю',
      'mood_berserk': 'Режим берсерка',
      'mood_party': 'Ищу пати',

      // Диалоги и тосты
      'dialog_warning': 'Внимание',
      'dialog_error': 'Ошибка',
      'dialog_success': 'Успешно',
      'dialog_info': 'Информация',
      'dialog_yes': 'Да',
      'dialog_no': 'Отмена',

      // Футер
      'footer_corp': 'Корпорация ООО "тмыв иишек"',
      'footer_worked_on': 'Над сайтом работали:',
      'footer_ideas': 'идеи',
      'footer_team_spirit': 'моральный дух',
      'footer_proto1': 'первый прототип',
      'footer_proto2': 'второй прототип',
      'footer_rights': 'Все права защищены.',
      'footer_shlyapa_title': 'Шляпа Эбардо',
      'footer_tail_title': 'Кошачий хвост Танджиро',
      'footer_creator_ebardo': '<span class="relative inline-block"><svg class="ebardo-hat absolute -top-2 -left-1 w-4 h-3.5 pointer-events-none select-none transition-all duration-300 transform -rotate-12 group-hover:-rotate-3 group-hover:-translate-y-1 group-hover:scale-110 drop-shadow-sm" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" title="Шляпа Эбардо"><path d="M7 13C7 7.5 9 5 12 5C15 5 17 7.5 17 13Z" fill="#FDE047" stroke="#CA8A04" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="12" cy="14" rx="10.5" ry="3.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/><path d="M7.5 13C8.2 11.8 9.8 11.2 12 11.2C14.2 11.2 15.8 11.8 16.5 13C15.8 14 14.2 14.6 12 14.6C9.8 14.6 8.2 14 7.5 13Z" fill="#10B981"/><path d="M16 13L18.5 16M16.5 13.5L17.8 17" stroke="#059669" stroke-width="1.2" stroke-linecap="round"/></svg>Э</span>бардо',
      'footer_creator_tanjiro': 'Танджир<span class="relative inline-block">о<svg class="tanjiro-tail absolute -top-[7px] -right-[13px] w-4 h-5 pointer-events-none select-none drop-shadow-sm" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" title="Кошачий хвост Танджиро"><path d="M 1.5 17 C 6 17, 11.5 14, 12.5 8 C 13.2 4, 10.5 2, 8.8 2.8" stroke="#0284C7" stroke-width="4.2" stroke-linecap="round" fill="none"/><path d="M 1.5 17 C 6 17, 11.5 14, 12.5 8 C 13.2 4, 10.5 2, 8.8 2.8" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M 6.5 16.2 C 8 15.5, 9.5 14.5, 10.5 13" stroke="#FFFFFF" stroke-width="3" stroke-linecap="butt" fill="none"/><path d="M 12 9 C 12.3 7.5, 12.2 6.2, 11.8 5.2" stroke="#FFFFFF" stroke-width="3" stroke-linecap="butt" fill="none"/><path d="M 10 3.2 C 9.5 2.8, 9 2.7, 8.8 2.8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/></svg></span>',
      'profile_stat_tanjiro_clicks': 'Клики Танджиро',
      'edit_profile_fav_char': 'Любимый герой:',
      'char_ebardo': 'Эбардо',
      'char_tanjiro': 'Танджиро',
      'auth_reg_user_ph': 'Например: Великий Эбардо',

      // Toast награды за ачивку
      'ach_toast_reward_header': 'Получена награда:',
      'ach_toast_reward_sub': 'Награда уже доступна в меню!',

      // Профиль игрока: Обзор
      'profile_modal_title': 'Профиль игрока',
      'profile_modal_subtitle': 'Персональная карточка, витрина и статистика',
      'profile_badge_local': 'Локальный',
      'profile_btn_customize': 'Настроить профиль',
      'profile_badge_imported': 'Импортирован',
      'profile_imported_title': 'Профиль импортирован',
      'profile_imported_desc': 'Ваш профиль был импортирован из файла бэкапа. Этот аккаунт не будет показан в топах лидеров.',
      'profile_showcase_badge': 'Главное достижение витрины',
      'profile_showcase_default_title': 'Универсальный счастливчик',
      'profile_showcase_default_desc': 'Разблокирован VIP статус',
      'profile_showcase_empty': 'Витрина пуста',
      'profile_showcase_empty_desc': 'Выполняйте достижения в игре, чтобы выставить их сюда!',
      'profile_stat_achievements': 'Достижения',
      'profile_stat_vip': 'VIP-статус',
      'profile_stat_spins': 'Вращения колеса',
      'profile_vip_active': 'VIP (Активен)',
      'profile_vip_inactive': 'Не активен',
      'profile_label_favorite': 'Фаворит:',
      'profile_label_telegram': 'Telegram:',
      'profile_label_since': 'В игре с:',
      'profile_default_bio': '«Добро пожаловать в мой профиль!»',
      'profile_tg_not_set': 'Не указан',
      'profile_google_linked_title': 'Google аккаунт привязан',
      'profile_google_linked_badge': 'Привязан',
      'profile_google_link_btn': 'Привязать Google Аккаунт',
      'profile_google_link_action': 'Привязать',
      'profile_btn_export': 'Экспорт',
      'profile_btn_import': 'Импорт',
      'profile_btn_switch': 'Сменить',
      'profile_btn_logout': 'Выйти',
      'profile_btn_delete_account': 'Удалить этот аккаунт со всеми данными',
      'profile_btn_creator_panel': 'Панель Создателя',

      // Профиль игрока: Редактор
      'profile_btn_back': 'Назад к профилю',
      'profile_edit_title': 'Настройка профиля',
      'profile_live_preview_label': 'Живой предпросмотр карточки:',
      'profile_tab_appearance': 'Внешность',
      'profile_tab_identity': 'О себе',
      'profile_tab_theme': 'Тема',
      'profile_tab_security': 'Безопасность',
      'profile_label_avatar': 'Аватарка профиля:',
      'profile_btn_upload_photo': 'Загрузить своё фото',
      'profile_btn_reset_avatar': 'Сбросить',
      'profile_label_avatar_color': 'Цвет фона буквы:',
      'profile_label_avatar_frame': 'Рамка аватара:',
      'frame_none': 'Обычная',
      'frame_neon': 'Неон Cyan',
      'frame_gold': 'Золото VIP',
      'frame_flame': 'Огонь',
      'frame_void': 'Магия',
      'frame_emerald': 'Изумруд',
      'frame_rainbow': 'Радужный RGB',
      'profile_label_banner': 'Баннер профиля:',
      'profile_btn_upload_banner': 'Загрузить своё фото',
      'banner_cyber': 'Киберпанк',
      'banner_emerald': 'Изумруд',
      'banner_sunset': 'Закат',
      'banner_void': 'Космос',
      'banner_gold': 'Золото VIP',
      'banner_flame': 'Огонь',
      'profile_label_username': 'Никнейм:',
      'profile_ph_username': 'Ваш никнейм',
      'profile_label_tag': 'Тег профиля (@tag):',
      'profile_ph_tag': '@ebardo_gamer',
      'profile_label_bio': 'О себе / Девиз (до 200 символов):',
      'profile_ph_bio': 'Расскажите о себе или напишите любимую цитату...',
      'profile_label_mood': 'Статус активности:',
      'mood_coding_opt': 'Кодит... 🛠️ (Admin)',
      'mood_gaming_opt': 'В игре',
      'mood_farming_opt': 'Фармлю крутки',
      'mood_music_opt': 'Слушаю музыку',
      'mood_afk_opt': 'AFK / Отдыхаю',
      'mood_berserk_opt': 'Режим берсерка',
      'mood_party_opt': 'Ищу пати',
      'mood_none_opt': 'Без статуса',
      'profile_label_title': 'Титул игрока:',
      'title_none': 'Без титула',
      'title_demon_slayer': 'Истребитель демонов',
      'title_wheel_master': 'Повелитель колеса',
      'title_pack_master': 'Мастер паков',
      'title_click_god': 'Безумный кликер',
      'title_legend': 'Легенда игры',
      'title_admin': 'Admin ⚡ (Создатель)',
      'profile_label_contact': 'Telegram / Контакт:',
      'profile_ph_contact': '@Ebardo_Velikiy',
      'profile_label_card_style': 'Стиль карточки профиля:',
      'card_style_standard': 'Стандарт',
      'card_style_glass': 'Glassmorphism',
      'card_style_neon': 'Neon Glow',
      'card_style_metal': 'Dark Metal',
      'profile_label_showcase_ach': 'Главное достижение на витрине:',
      'profile_label_privacy': 'Настройки отображения и приватности:',
      'profile_privacy_hide_stats': 'Скрыть статистику кликов и вращений',
      'profile_privacy_hide_date': 'Скрыть дату создания аккаунта',
      'profile_label_change_password': 'Смена пароля:',
      'profile_label_old_password': 'Текущий пароль:',
      'profile_ph_old_pwd': 'Введите текущий пароль',
      'profile_label_new_password': 'Новый пароль:',
      'profile_ph_new_pwd': 'Мин. 6 символов (буквы + цифры)',
      'profile_label_confirm_password': 'Повторите новый пароль:',
      'profile_ph_confirm_pwd': 'Повторите новый пароль',
      'profile_label_account_data': 'Данные аккаунта:',
      'profile_btn_import_json': 'Импорт профиля (JSON)',
      'profile_btn_reset_progress': 'Сбросить прогресс',
      'profile_btn_delete_profile': 'Удалить этот профиль навсегда',
      'profile_btn_save_changes': 'Сохранить изменения',
      'profile_no_unlocked_ach': 'Нет открытых достижений (выполните хотя бы одно)',
      'profile_saved_success': 'Профиль успешно сохранён!',
      'profile_reset_success': 'Прогресс аккаунта сброшен!',
      'profile_reset_toast': 'Прогресс достижений и кликов успешно сброшен!',
      'profile_reset_toast_title': 'Сброс выполнен',
      'profile_reset_confirm_title': 'Сбросить прогресс?',
      'profile_reset_confirm_msg': 'Вы уверены, что хотите сбросить весь прогресс достижений и кликов для профиля «{username}»?',
      'confirm_cancel': 'Отмена',
      'profile_fallback_user': 'Пользователь',

      // Админ-панель
      'admin_title': 'Панель Создателя',
      'admin_badge': 'АДМИН',
      'admin_subtitle': 'Управление игроками, чит-панель и глобальные настройки',
      'admin_tab_players': 'Игроки',
      'admin_tab_announcement': 'Глобальный анонс',
      'admin_search_ph': 'Поиск по никнейму или email...',
      'admin_refresh_btn': 'Обновить',
      'admin_loading_players': 'Загрузка игроков из базы данных...',
      'admin_loading_firestore': 'Загрузка игроков из Firestore...',
      'admin_no_players': 'Игроки не найдены.',
      'admin_badge_creator': 'СОЗДАТЕЛЬ',
      'admin_badge_import': 'ИМПОРТ',
      'admin_grant_vip': '+ VIP',
      'admin_remove_vip': 'Снять VIP',
      'admin_in_top': 'В Топы',
      'admin_out_top': 'Вне Топов',
      'admin_show_announcement': 'Показывать анонс в шапке сайта:',
      'admin_announcement_text_label': 'Текст глобального объявления:',
      'admin_announcement_ph': 'Например: ⚡ Скоро открытие топов и таблиц лидеров!',
      'admin_style_label': 'Стиль плашки:',
      'admin_style_cyber': 'Киберпанк (Неон и Фиолетовый)',
      'admin_style_gold': 'Королевское золото',
      'admin_style_alert': 'Важное предупреждение (Красный)',
      'admin_style_emerald': 'Изумрудное событие',
      'admin_save_announcement': 'Сохранить и применить объявление',
      'admin_footer_version': 'Версия сайта:',

      'guest_modal_title': 'Локальный профиль',
      'guest_modal_badge': 'Локальный',
      'guest_modal_subtitle': 'Игра без привязки почты и пароля',
      'guest_nickname_label': 'Никнейм в игре:',
      'guest_nickname_placeholder': 'Например: Игрок 777',
      'guest_nickname_hint': 'Оставьте пустым, чтобы сгенерировать случайное имя игрока.',
      'guest_feature_local_title': 'Данные только в этом браузере:',
      'guest_feature_local_desc': 'Все достижения, клики и настройки сохраняются в локальной памяти вашего устройства.',
      'guest_feature_no_top_title': 'Без участия в онлайн-топе:',
      'guest_feature_no_top_desc': 'Локальные аккаунты не публикуются в глобальной онлайн-таблице лидеров.',
      'guest_feature_save_anytime_title': 'Сохранение в любой момент:',
      'guest_feature_save_anytime_desc': 'В любой момент в карточке профиля можно привязать Google, или установить пароль для синхронизации с облаком.',
      'guest_btn_cancel': 'Вернуться',
      'guest_btn_start': 'Начать играть',
      'google_setup_title': 'Настройка аккаунта',
      'google_setup_username_label': 'Никнейм / Название аккаунта:',
      'google_setup_username_placeholder': 'Ваш игровой никнейм',
      'google_setup_username_hint': 'Отображается в профиле и таблице лидеров',
      'google_setup_password_label': 'Пароль для входа:',
      'google_setup_password_placeholder': 'Минимум 6 символов',
      'google_setup_confirm_label': 'Повторите пароль:',
      'google_setup_confirm_placeholder': 'Повторите пароль',
      'google_setup_btn_cancel': 'Отмена',
      'google_setup_btn_create': 'Создать аккаунт',
      'backup_export_title': 'Защита файла бэкапа',
      'backup_export_desc': 'Установите пароль для шифрования файла данных, чтобы посторонние не могли импортировать ваш прогресс:',
      'backup_export_password_label': 'Пароль для файла:',
      'backup_export_password_placeholder': 'Придумайте пароль',
      'backup_export_confirm_label': 'Повторите пароль:',
      'backup_export_confirm_placeholder': 'Повторите пароль',
      'backup_export_btn_cancel': 'Отмена',
      'backup_export_btn_submit': 'Зашифровать и скачать',
      'backup_import_title': 'Ввод пароля от бэкапа',
      'backup_import_desc_prefix': 'Файл аккаунта «',
      'backup_import_desc_suffix': '» защищён. Введите пароль для расшифровки:',
      'backup_import_password_label': 'Пароль от файла:',
      'backup_import_password_placeholder': 'Введите пароль',
      'backup_import_btn_cancel': 'Отмена',
      'backup_import_btn_submit': 'Расшифровать и применить',
      'verify_title': 'Подтверждение почты',
      'verify_subtitle': 'Мы отправили 6-значный проверочный код на',
      'verify_spam_notice_html': 'Не видите письмо? Обязательно проверьте папку <b>«Спам»</b> или <b>«Вся почта»</b> в вашем почтовом клиенте.',
      'verify_btn_submit': 'Подтвердить и войти',
      'verify_btn_back': '← Назад',
      'verify_resend_countdown': 'Отправить повторно через {sec}с',
      'verify_resend_btn': 'Отправить код ещё раз',
      'verify_err_6_digits': 'Пожалуйста, введите все 6 цифр кода!',
      'verify_err_invalid': 'Неверный проверочный код. Проверьте почту и попробуйте снова.',
      'verify_toast_sent': 'Код отправлен на {email}. Обязательно проверьте входящие и «Спам»!',
      'verify_toast_new_sent': 'Новый проверочный код отправлен на {email}',
      'verify_toast_expired': 'Сессия регистрации истекла. Заполните форму снова.',
      'lb_modal_title': 'Зал славы игроков',
      'lb_badge_online': 'Онлайн Облако',
      'lb_modal_subtitle': 'Глобальный рейтинг игроков в реальном времени',
      'lb_tab_achievements': 'Достижения',
      'lb_tab_clicks': 'Клики',
      'lb_tab_wheel': 'Колесо',
      'lb_loading': 'Загрузка рейтинга из облака Firebase...',
      'lb_auto_updates': 'Обновляется автоматически',
      'lb_btn_refresh': 'Обновить',
      'lb_stat_clicks': 'кликов',
      'lb_stat_spins': 'спинов',
      'lb_stat_achievements': 'достижений',
      'lb_empty': 'В облачной базе пока нет игроков. Будьте первыми!',
      'lb_badge_you': 'ВЫ',
      'profile_legend_badge': 'Легенда',
      'profile_default_username': 'Пользователь',
      'profile_mood_in_game': 'В игре',
      'profile_mood_welcome': '«Добро пожаловать в мой профиль!»',
      'profile_mood_dot_title': 'Статус',
      'profile_fav_char_title': 'Любимый персонаж',
      'profile_tg_title': 'Telegram',
      'profile_tg_none': 'Не указан',
      'profile_stat_vip_inactive': 'Не активен',
      'profile_stat_vip_active': 'VIP Активен',
      'profile_edit_reset_btn': 'Сбросить',
      'profile_edit_reset_progress': 'Сброс прогресса',
      'profile_edit_strength_weak': 'Надёжность: Слабый',
      'profile_edit_strength_fair': 'Надёжность: Средний',
      'profile_edit_strength_good': 'Надёжность: Надёжный',
      'profile_edit_password_hint': 'Мин. 6 симв, буквы + цифры',
      'profile_imported_tooltip': 'Нажмите, чтобы прочитать подробности',
      'profile_imported_notice_html': 'Ваш профиль был импортирован из файла бэкапа. Этот аккаунт не отображается в онлайн-рейтингах лидеров.',
      'profile_opt_universal': 'Универсальный счастливчик (VIP)',
      'profile_opt_universal_desc': 'Разблокирован VIP статус',
      'profile_opt_first_click': 'Первый клик',
      'profile_opt_speed_demon': 'Демон скорости',
      'profile_opt_wheel_master': 'Мастер колеса',
      'profile_opt_collector': 'Коллекционер паков',
      'btn_fullscreen': 'Полноэкранный режим',
      'custom_btn_menu': 'Настройки меню',
      'custom_btn_select_packs': 'Выбрать другие паки',
      'custom_btn_reset_packs': 'Сбросить / отключить все паки',
      'music_mute_title': 'Выключить звук (0%)',
      'music_volume_title': 'Регулировка громкости (0% - 200%)',
      'music_max_title': 'Максимальная громкость (200%)',
      'common_confirm': 'Подтвердить',
      'common_confirm_title': 'Подтверждение',
      'custom_btn_create_pack': 'Создать новый пак',
      'custom_btn_hide_form': 'Скрыть форму',
      'custom_btn_save_pack': 'Сохранить пак',
      'custom_btn_save_changes': 'Сохранить изменения',
      'custom_empty_packs': 'Паков пока нет. Создайте свой первый пак выше!',
      'members_result_format': 'Я уверен, что {member} — {word}!',
      'auth_login_username_placeholder': 'name@example.com или никнейм',
      'auth_login_password_placeholder': 'Введите пароль',
      'auth_reg_password_placeholder': 'Минимум 6 символов, буквы + цифры',
      'auth_reg_confirm_placeholder': 'Повторите придуманный пароль',
      'tanjiro_auto_spin': 'Авто-спин',
      'tanjiro_stop_auto_spin': 'Остановить авто-спин',
      'tanjiro_auto_spin_active': 'Авто-спин активен',

      'auth_label_login': 'Email или Никнейм:',
      'auth_label_password': 'Пароль:',
      'auth_btn_login': 'Войти',
      'auth_label_username': 'Никнейм:',
      'auth_label_email': 'Электронная почта:',
      'auth_label_reg_password': 'Придумайте пароль:',
      'auth_label_confirm_password': 'Повторите пароль:',
      'auth_reg_strength_hint': 'Мин. 6 символов, без 1234',
      'auth_btn_register': 'Зарегистрироваться',
      'profile_edit_preview_title': 'Титул',
      'profile_edit_preview_name': 'Никнейм',

      // Batch 3 UI & Module Keys
      'seo_h1': 'Nanjicore — Онлайн Рандомайзер, Колесо Фортуны и Мини-Игры',
      'toast_default_title': 'Фанатик',
      'toast_default_desc': 'Нажмите 1000 раз на кнопку!',
      'mode_indicator_button': 'Режим: Кнопка',
      'mode_indicator_wheel': 'Режим: Колесо',
      'ach_progress_initial': 'Прогресс: 0 / 11 выполнено',
      'delete_pack_confirm_prefix': 'Вы уверены, что хотите удалить',
      'delete_pack_confirm_suffix': '?',
      'common_confirm_message': 'Вы действительно хотите выполнить это действие?',
      'bg_site_title': 'Фон сайта',
      'bg_site_desc': 'Загрузите изображение для фона всего экрана',
      'bg_card_title': 'Фон содержимого',
      'bg_card_desc': 'Загрузите общее фото для фона карточек',
      'bg_btn_choose': 'Выбрать файл',
      'bg_btn_remove': 'Удалить фото',
      'auth_modal_title': 'Вход в аккаунт',
      'auth_modal_desc': 'Авторизуйтесь, чтобы все ваши достижения, паки и VIP-статус сохранялись в аккаунте',
      'auth_tab_login': 'Вход',
      'auth_tab_register': 'Регистрация',
      'auth_or_provider': 'или через аккаунт',
      'auth_btn_google': 'Продолжить с Google',
      'auth_btn_guest': 'Играть без регистрации (Локально)',
      'auth_saved_profiles': 'Сохранённые профили:',
      'auth_modal_register_title': 'Создание аккаунта',
      'auth_modal_register_desc': 'Зарегистрируйтесь, чтобы сохранять свои паки, достижения и VIP-статус',
      'auth_status_selected': 'Выбран',
      'auth_google_connecting': 'Подключение к Google...',
      'toast_type_warning': 'Внимание',
      'toast_type_error': 'Ошибка',
      'toast_type_success': 'Успешно',
      'toast_type_info': 'Информация',
      'custom_result_format': '{n1} и {n2} — {role}!',
      'custom_btn_editing_pack': 'Редактирование: {title}',
      'backup_err_pwd_short': 'Пароль для защиты файла должен содержать минимум 4 символа!',
      'backup_err_pwd_mismatch': 'Пароли не совпадают!',
      'backup_status_encrypting': 'Шифрование...',
      'backup_err_crypto': 'Ошибка шифрования: ',
      'backup_err_enter_pwd': 'Введите пароль от файла бэкапа!',
      'backup_status_decrypting': 'Расшифровка...',
      'backup_err_wrong_pwd': 'Неверный пароль от файла бэкапа! Проверьте введённый пароль.',
      'admin_err_load_players': 'Не удалось загрузить игроков:',
      'verify_toast_sent_title': 'Код отправлен',
      'verify_toast_new_title': 'Код обновлён',
      'verify_err_send': 'Не удалось доставить письмо. Проверьте правильность почты или повторите попытку позже.',

      // Auth Error & Language Name Keys
      'lang_name_ru': 'Русский (RU)',
      'lang_name_en': 'English (EN)',
      'auth_err_fields_login': 'Введите почту/никнейм и пароль!',
      'auth_err_fields_reg': 'Заполните никнейм, почту и оба поля пароля!',
      'auth_err_nick_len': 'Никнейм должен содержать минимум 2 символа!',
      'auth_err_invalid_email': 'Введите корректный адрес электронной почты!',
      'auth_err_pwd_len': 'Пароль должен содержать минимум 6 символов!',
      'auth_err_pwd_mismatch': 'Пароли не совпадают!',
      'auth_err_nick_exists': 'Пользователь с таким никнеймом уже существует!',
      'auth_err_email_exists': 'Аккаунт с такой почтой уже зарегистрирован! Войдите в него.',
    },

    en: {
      // General / Navbar / Header
      'app_name': 'Nanjicore',
      'app_tagline': 'Online Randomizer, Fortune Wheel & Mini-Games',
      'app_loading': 'Loading game...',
      'nav_profile': 'Profile',
      'nav_achievements': 'Achievements',
      'nav_settings': 'Settings',
      'badge_local': 'Local',
      'common_cancel': 'Cancel',
      'common_delete': 'Delete',
      'common_close': 'Close',

      // Segmented Tabs
      'tab_tanjiro': 'Tanjiro',
      'tab_jenna': 'Jenna',
      'tab_custom': 'Custom',

      // Modes (Button / Wheel)
      'mode_button': 'Button',
      'mode_wheel': 'Wheel',

      // Tab: Tanjiro
      'tanjiro_title': 'Is Tanjiro straight... or not?',
      'tanjiro_title_hover': 'Tanjiro... who is he?',
      'tanjiro_subtitle': 'Let us find out right now',
      'tanjiro_reveal_btn': 'Find Out',
      'tanjiro_spin_btn': 'Spin the Wheel!',
      'tanjiro_auto_spin': 'Auto-Spin',
      'tanjiro_stop_auto_spin': 'Stop Auto-Spin',
      'tanjiro_clicks_label': 'Clicks:',
      'tanjiro_ans_0': '100% Straight!',
      'tanjiro_ans_1': 'Not into girls...',
      'tanjiro_ans_2': 'Universal!',
      'tanjiro_ans_3': 'Secret Matveyka!',
      'tanjiro_ans_4': 'Lesbian!',

      // Tab: Jenna
      'jenna_title': 'Jenna\'s Mini-Games',
      'jenna_subtitle': 'Shall we play?',
      'jenna_card_who_title': 'Who is Who?',
      'jenna_card_who_desc': 'Discover your friend\'s secret chat role',
      'jenna_card_members_title': 'Jenna Members',
      'jenna_card_members_desc': 'Set a status and find the match',
      'jenna_mode_prefix': 'Mode: ',

      // Modal: Who is Who?
      'who_modal_title': 'Who is Who?',
      'who_modal_subtitle': 'Discover someone\'s hidden role',
      'who_input_placeholder': 'Enter name...',
      'who_reveal_btn': 'Reveal Role',
      'who_spin_btn': 'Spin Wheel',
      'who_role_0': 'Outcast',
      'who_role_1': 'Nobody',
      'who_role_2': 'Total Random',
      'who_role_3': 'Chat Legend',
      'who_role_4': 'Owner',
      'who_role_5': 'Assistant Owner',
      'who_role_6': 'Ebardo\'s Slave',
      'who_enter_name_toast': 'Please enter a name before starting!',
      'who_bad_word_toast': 'Nickname cannot contain inappropriate words!',

      // Modal: Jenna Members
      'members_modal_title': 'Jenna Members',
      'members_modal_subtitle': 'Set a status and find the matching person',
      'members_input_placeholder': 'Enter status (e.g. Gamer)...',
      'members_reveal_btn': 'Pick Member',
      'members_spin_btn': 'Spin Wheel',
      'members_enter_word_toast': 'Please enter a status or word before starting!',
      'members_bad_word_toast': 'Status cannot contain inappropriate words!',
      'members_result_prefix': 'I am sure that ',
      'members_result_is': ' is ',

      // Tab: Custom
      'custom_default_title': 'Customize Your Own Menu',
      'custom_default_desc': 'Add your friends and any roles or nicknames, or pick ready-made packs!',
      'custom_manual_setup_btn': 'Custom Setup',
      'custom_open_packs_btn': 'Open Packs',
      'custom_active_title': 'My Menu',
      'custom_active_desc': 'Let\'s find out right now...',
      'custom_dual_drop': 'Dual Choice (2 participants)',
      'custom_reveal_btn': 'Find Out',
      'custom_stage_1': 'Stage 1: Choose person',
      'custom_stage_2': 'Stage 2: Choose action/role',
      'custom_wait_cooldown': 'Please wait ({sec}s)...',
      'custom_spin_btn': 'Spin the Wheel!',

      // Modal: Custom Setup
      'custom_modal_title': 'Menu Setup',
      'custom_modal_subtitle': 'Create and edit your custom game lists',
      'custom_notice_packs': 'Names and roles list is currently populated from active packs. You can change them in the <b>Pack Manager</b>.',
      'custom_name_label': 'Menu Name:',
      'custom_name_ph': 'Who in the party...',
      'custom_desc_label': 'Menu Description:',
      'custom_desc_ph': 'Let us find out right now...',
      'custom_names_label': 'Friend Names (comma separated):',
      'custom_names_ph': 'Ebardo, Tanjiro, Alex',
      'custom_roles_label': 'Roles / Actions (comma separated):',
      'custom_roles_ph': 'Bug Master, Lead Coder, Genius',
      'custom_save_btn': 'Save and Launch',
      'custom_tab_names': 'Names',
      'custom_tab_roles': 'Roles',
      'custom_tab_combo': 'Combo',
      'custom_save_and_play': 'Save & Play',

      // Modal: Packs
      'packs_modal_title': 'Pack Manager',
      'packs_modal_subtitle': 'Choose preset sets or create your own',
      'packs_create_btn': 'Create New Pack',
      'packs_name_label': 'Pack Name:',
      'packs_name_ph': 'e.g. Discord Party',
      'packs_content_label': 'Content Type:',
      'packs_opt_both': 'All together (Names + Roles/Actions)',
      'packs_opt_names': 'Names Only',
      'packs_opt_roles': 'Roles / Actions Only',
      'packs_names_label': 'Names (comma separated):',
      'packs_names_ph': 'Ebardo, Tanjiro, Alex',
      'packs_roles_label': 'Roles / Actions (comma separated):',
      'packs_roles_ph': 'Lead Coder, Genius, Bug Master',
      'packs_save_btn': 'Save Pack',
      'packs_apply_btn': 'Apply Selected',
      'packs_delete_title': 'Delete pack?',
      'packs_delete_confirm': 'Are you sure you want to delete',

      // Modal: Site Settings
      'settings_title': 'Site Settings',
      'settings_language_label': 'Interface Language:',
      'settings_font_label': 'Interface Font:',
      'settings_sound_label': 'Click Sound Pack:',
      'sound_classic': 'Classic',
      'sound_arcade8bit': '8-Bit Retro',
      'sound_katana': 'Katana',
      'sound_cyber': 'Cyberpunk',
      'sound_bubble': 'Bubble Pop',
      'settings_volume_label': 'Sound Volume:',
      'settings_theme_toggle': 'Toggle Theme',
      'settings_photo_bg_site': 'Site Background (Custom Photo)',
      'settings_photo_bg_tabs': 'Tabs Background (Custom Photo)',
      'settings_custom_algorithms': 'Custom Algorithms',
      'settings_excl_names_title': 'Exclusion Method (Names)',
      'settings_excl_names_desc': 'Each name appears strictly once per cycle',
      'settings_excl_roles_title': 'Exclusion Method (Roles)',
      'settings_excl_roles_desc': 'Each action appears strictly once per cycle',
      'settings_pity_title': 'Duplicate Protection (5 turns)',
      'settings_pity_desc': 'Picked person/role will not repeat for 5 turns',
      'settings_close_btn': 'Close',

      // Modal: Achievements & Perks
      'ach_modal_title': 'Achievements & Perks',
      'ach_modal_subtitle': 'Complete quests and unlock unique perks',
      'ach_filter_all': 'All',
      'ach_filter_unlocked': 'Unlocked',
      'ach_filter_locked': 'Locked',
      'ach_progress_prefix': 'Progress: ',
      'ach_progress_done': 'completed',
      'ach_status_completed': 'COMPLETED',
      'ach_status_locked': 'LOCKED',
      'ach_reward_prefix': 'Reward: ',
      'ach_perks_title': 'Unlocked Perks & Effects',
      'ach_empty_category': 'Nothing in this category yet.',

      // Perks
      'perk_stars': 'Starry Background',
      'perk_rgb': 'RGB Glow',
      'perk_cyberpunk': 'Cyberpunk Theme',
      'perk_shake': 'Screen Shake',
      'perk_confetti': 'Click Confetti',
      'perk_hotkeys': 'Hotkeys & Gestures',
      'perk_fullscreen': 'Fullscreen',
      'perk_turbo': 'Turbo Spin',
      'perk_dual': 'Dual Choice',
      'perk_infinite': 'Auto Spin',

      // Achievements Definitions
      'ach_fanatic_unlocked_title': 'Fanatic',
      'ach_fanatic_unlocked_desc': 'Click the button 1000 times in the Tanjiro tab!',
      'ach_fanatic_locked_desc': 'Be a devoted fan of the creator..',
      'ach_fanatic_reward': 'Ability to create unlimited packs (max 5 before unlock)',

      'ach_nickname_unlocked_title': 'True Nickname',
      'ach_nickname_unlocked_desc': 'Type "Tanjiro sucks" on keyboard, in game or tap his name 7 times!',
      'ach_nickname_locked_desc': 'Use the keyboard to insult the creator..',
      'ach_nickname_reward': 'On PC: keys 1, 2, 3 and ← / → arrows to switch tabs, Space — action, Esc — close modals. On phone: swipe left/right to switch tabs!',

      'ach_stalker_unlocked_title': 'Stalker',
      'ach_stalker_unlocked_desc': 'Click on every creator\'s name in the footer!',
      'ach_stalker_locked_desc': 'Learn more about the creators..',
      'ach_stalker_reward': 'Fullscreen mode for all tabs',

      'ach_ludoman_unlocked_title': 'Gambler',
      'ach_ludoman_unlocked_desc': 'Spin the fortune wheel 100 times!',
      'ach_ludoman_locked_desc': 'Don\'t you think playing safe is too boring?',
      'ach_ludoman_reward': 'Instant wheel spin ("Turbo Spin" toggle)',

      'ach_designer_unlocked_title': 'Master Designer',
      'ach_designer_unlocked_desc': 'Try switching between all 12 available interface fonts!',
      'ach_designer_locked_desc': 'Try different styles until your eyes get dizzy..',
      'ach_designer_reward': '"RGB Glow" mode (rainbow neon borders for buttons and card)',

      'ach_epileptic_unlocked_title': 'Epileptic',
      'ach_epileptic_unlocked_desc': 'Toggle theme 15 times within one minute!',
      'ach_epileptic_locked_desc': 'Flick the switch until the bulb burns out..',
      'ach_epileptic_reward': 'Ultra-dark neon theme "Cyberpunk Neon"',

      'ach_dangerous_unlocked_title': 'Wanted',
      'ach_dangerous_unlocked_desc': 'Get a prohibited words warning 3 times!',
      'ach_dangerous_locked_desc': 'Try using dirty language, but the system stops you..',
      'ach_dangerous_reward': 'Screen shake effect during role generation',

      'ach_chef_unlocked_title': 'Pack Chef',
      'ach_chef_unlocked_desc': 'Combine and launch the game with 3 or more packs simultaneously!',
      'ach_chef_locked_desc': 'Assemble a crazy mix from multiple sources..',
      'ach_chef_reward': '"Dual Choice" mode in Custom (picks 2 members at once)',

      'ach_insider_unlocked_title': 'One of Us',
      'ach_insider_unlocked_desc': 'Set custom images for both the site background and tab card background!',
      'ach_insider_locked_desc': 'Make this place truly feel like home..',
      'ach_insider_reward': 'Animated sparkling star particles effect',

      'ach_hacker_unlocked_title': 'Reality Breaker',
      'ach_hacker_unlocked_desc': 'Rapidly click 10 times on LLC "AI Laundering" in the footer!',
      'ach_hacker_locked_desc': 'Knock on the corporation signboard..',
      'ach_hacker_reward': 'Confetti burst on every action',

      'ach_creator_blessing_unlocked_title': 'Reality Architect',
      'ach_creator_blessing_unlocked_desc': 'Supreme distinction: you control the rules and code of this world!',
      'ach_creator_blessing_locked_desc': 'Secret blessing from the creator of the Nanjicore universe..',
      'ach_creator_blessing_reward': 'Royal aura of the creator and access to supreme privileges',

      'ach_perpetual_unlocked_title': 'Perpetual Motion',
      'ach_perpetual_unlocked_desc': 'Click 7 times in a row while the wheel is spinning!',
      'ach_perpetual_locked_desc': 'Try accelerating the spin without waiting for it to stop..',
      'ach_perpetual_reward': 'Automatic wheel spin ability ("Auto-Spin" button)',

      'ach_universal_unlocked_title': 'True All-Rounder',
      'ach_universal_unlocked_desc': 'Play at least 5 times in each of the 3 tabs!',
      'ach_universal_locked_desc': 'Try absolutely everything available here..',
      'ach_universal_reward': 'Golden animated VIP profile frame in achievements modal',

      // Achievement Toast
      'ach_toast_title': 'Achievement Unlocked!',

      // Player Profile
      'profile_title': 'Player Profile',
      'profile_edit_btn': 'Edit Profile',

      // Titles
      'title_none': '',
      'title_demon_slayer': 'Demon Slayer',
      'title_wheel_master': 'Wheel Master',
      'title_pack_master': 'Pack Master',
      'title_click_god': 'Crazy Clicker',
      'title_legend': 'Game Legend',
      'title_vip_pioneer': 'Admin ⚡',
      'title_admin': 'Admin ⚡',

      // Moods / Statuses
      'mood_gaming': 'In Game',
      'mood_coding': 'Coding',
      'mood_farming': 'Farming rolls',
      'mood_music': 'Listening to music',
      'mood_afk': 'AFK / Chilling',
      'mood_berserk': 'Berserk Mode',
      'mood_party': 'Looking for party',

      // Dialogs and Toasts
      'dialog_warning': 'Warning',
      'dialog_error': 'Error',
      'dialog_success': 'Success',
      'dialog_info': 'Information',
      'dialog_yes': 'Yes',
      'dialog_no': 'Cancel',

      // Footer
      'footer_corp': 'Corporation LLC "AI Laundering"',
      'footer_worked_on': 'Worked on the project:',
      'footer_ideas': 'ideas',
      'footer_team_spirit': 'team spirit',
      'footer_proto1': 'first prototype',
      'footer_proto2': 'second prototype',
      'footer_rights': 'All rights reserved.',
      'footer_shlyapa_title': 'Ebardo\'s Hat',
      'footer_tail_title': 'Tanjiro\'s Cat Tail',
      'footer_creator_ebardo': '<span class="relative inline-block"><svg class="ebardo-hat absolute -top-2 -left-1 w-4 h-3.5 pointer-events-none select-none transition-all duration-300 transform -rotate-12 group-hover:-rotate-3 group-hover:-translate-y-1 group-hover:scale-110 drop-shadow-sm" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg" title="Ebardo\'s Hat"><path d="M7 13C7 7.5 9 5 12 5C15 5 17 7.5 17 13Z" fill="#FDE047" stroke="#CA8A04" stroke-width="1.2" stroke-linejoin="round"/><ellipse cx="12" cy="14" rx="10.5" ry="3.2" fill="#FEF08A" stroke="#CA8A04" stroke-width="1.2"/><path d="M7.5 13C8.2 11.8 9.8 11.2 12 11.2C14.2 11.2 15.8 11.8 16.5 13C15.8 14 14.2 14.6 12 14.6C9.8 14.6 8.2 14 7.5 13Z" fill="#10B981"/><path d="M16 13L18.5 16M16.5 13.5L17.8 17" stroke="#059669" stroke-width="1.2" stroke-linecap="round"/></svg>E</span>bardo',
      'footer_creator_tanjiro': 'Tanjir<span class="relative inline-block">o<svg class="tanjiro-tail absolute -top-[7px] -right-[13px] w-4 h-5 pointer-events-none select-none drop-shadow-sm" viewBox="0 0 16 20" fill="none" xmlns="http://www.w3.org/2000/svg" title="Tanjiro\'s Cat Tail"><path d="M 1.5 17 C 6 17, 11.5 14, 12.5 8 C 13.2 4, 10.5 2, 8.8 2.8" stroke="#0284C7" stroke-width="4.2" stroke-linecap="round" fill="none"/><path d="M 1.5 17 C 6 17, 11.5 14, 12.5 8 C 13.2 4, 10.5 2, 8.8 2.8" stroke="#38BDF8" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M 6.5 16.2 C 8 15.5, 9.5 14.5, 10.5 13" stroke="#FFFFFF" stroke-width="3" stroke-linecap="butt" fill="none"/><path d="M 12 9 C 12.3 7.5, 12.2 6.2, 11.8 5.2" stroke="#FFFFFF" stroke-width="3" stroke-linecap="butt" fill="none"/><path d="M 10 3.2 C 9.5 2.8, 9 2.7, 8.8 2.8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none"/></svg></span>',
      'profile_stat_tanjiro_clicks': 'Tanjiro Clicks',
      'edit_profile_fav_char': 'Favorite Hero:',
      'char_ebardo': 'Ebardo',
      'char_tanjiro': 'Tanjiro',
      'auth_reg_user_ph': 'e.g. Great Ebardo',

      // Toast reward
      'ach_toast_reward_header': 'Reward Unlocked:',
      'ach_toast_reward_sub': 'Reward is now available in the menu!',

      // User Profile: Overview
      'profile_modal_title': 'Player Profile',
      'profile_modal_subtitle': 'Personal card, showcase and statistics',
      'profile_badge_local': 'Local',
      'profile_btn_customize': 'Edit Profile',
      'profile_badge_imported': 'Imported',
      'profile_imported_title': 'Profile Imported',
      'profile_imported_desc': 'Your profile was imported from a backup file. This account will not appear on leaderboards.',
      'profile_showcase_badge': 'Featured Showcase Achievement',
      'profile_showcase_default_title': 'Universal Lucky (VIP)',
      'profile_showcase_default_desc': 'VIP status unlocked',
      'profile_showcase_empty': 'Showcase is Empty',
      'profile_showcase_empty_desc': 'Unlock achievements in game to display them here!',
      'profile_stat_achievements': 'Achievements',
      'profile_stat_vip': 'VIP Status',
      'profile_stat_spins': 'Wheel Spins',
      'profile_vip_active': 'VIP (Active)',
      'profile_vip_inactive': 'Inactive',
      'profile_label_favorite': 'Favorite:',
      'profile_label_telegram': 'Telegram:',
      'profile_label_since': 'Playing since:',
      'profile_default_bio': '«Welcome to my profile!»',
      'profile_tg_not_set': 'Not specified',
      'profile_google_linked_title': 'Google Account Linked',
      'profile_google_linked_badge': 'Linked',
      'profile_google_link_btn': 'Link Google Account',
      'profile_google_link_action': 'Link',
      'profile_btn_export': 'Export',
      'profile_btn_import': 'Import',
      'profile_btn_switch': 'Switch',
      'profile_btn_logout': 'Logout',
      'profile_btn_delete_account': 'Delete this account and all data',
      'profile_btn_creator_panel': 'Creator Panel',

      // User Profile: Editor
      'profile_btn_back': 'Back to Profile',
      'profile_edit_title': 'Profile Settings',
      'profile_live_preview_label': 'Live Card Preview:',
      'profile_tab_appearance': 'Appearance',
      'profile_tab_identity': 'Identity',
      'profile_tab_theme': 'Theme',
      'profile_tab_security': 'Security',
      'profile_label_avatar': 'Profile Avatar:',
      'profile_btn_upload_photo': 'Upload Photo',
      'profile_btn_reset_avatar': 'Reset',
      'profile_label_avatar_color': 'Letter Background Color:',
      'profile_label_avatar_frame': 'Avatar Frame:',
      'frame_none': 'Default',
      'frame_neon': 'Neon Cyan',
      'frame_gold': 'VIP Gold',
      'frame_flame': 'Flame',
      'frame_void': 'Magic Void',
      'frame_emerald': 'Emerald',
      'frame_rainbow': 'RGB Rainbow',
      'profile_label_banner': 'Profile Banner:',
      'profile_btn_upload_banner': 'Upload Photo',
      'banner_cyber': 'Cyberpunk',
      'banner_emerald': 'Emerald',
      'banner_sunset': 'Sunset',
      'banner_void': 'Cosmos',
      'banner_gold': 'VIP Gold',
      'banner_flame': 'Flame',
      'profile_label_username': 'Username:',
      'profile_ph_username': 'Your username',
      'profile_label_tag': 'Profile Tag (@tag):',
      'profile_ph_tag': '@ebardo_gamer',
      'profile_label_bio': 'About Me / Motto (up to 200 chars):',
      'profile_ph_bio': 'Tell about yourself or share your favorite quote...',
      'profile_label_mood': 'Activity Status:',
      'mood_coding_opt': 'Coding... 🛠️ (Admin)',
      'mood_gaming_opt': 'In Game',
      'mood_farming_opt': 'Farming rolls',
      'mood_music_opt': 'Listening to music',
      'mood_afk_opt': 'AFK / Resting',
      'mood_berserk_opt': 'Berserk mode',
      'mood_party_opt': 'Looking for party',
      'mood_none_opt': 'No status',
      'profile_label_title': 'Player Title:',
      'title_none': 'No Title',
      'title_demon_slayer': 'Demon Slayer',
      'title_wheel_master': 'Wheel Master',
      'title_pack_master': 'Pack Master',
      'title_click_god': 'Click God',
      'title_legend': 'Game Legend',
      'title_admin': 'Admin ⚡ (Creator)',
      'profile_label_contact': 'Telegram / Contact:',
      'profile_ph_contact': '@Ebardo_Velikiy',
      'profile_label_card_style': 'Profile Card Style:',
      'card_style_standard': 'Standard',
      'card_style_glass': 'Glassmorphism',
      'card_style_neon': 'Neon Glow',
      'card_style_metal': 'Dark Metal',
      'profile_label_showcase_ach': 'Featured Showcase Achievement:',
      'profile_label_privacy': 'Display and Privacy Settings:',
      'profile_privacy_hide_stats': 'Hide click and spin stats',
      'profile_privacy_hide_date': 'Hide registration date',
      'profile_label_change_password': 'Change Password:',
      'profile_label_old_password': 'Current Password:',
      'profile_ph_old_pwd': 'Enter current password',
      'profile_label_new_password': 'New Password:',
      'profile_ph_new_pwd': 'Min. 6 characters (letters + numbers)',
      'profile_label_confirm_password': 'Confirm New Password:',
      'profile_ph_confirm_pwd': 'Confirm new password',
      'profile_label_account_data': 'Account Data:',
      'profile_btn_import_json': 'Import Profile (JSON)',
      'profile_btn_reset_progress': 'Reset Progress',
      'profile_btn_delete_profile': 'Delete This Profile Forever',
      'profile_btn_save_changes': 'Save Changes',
      'profile_no_unlocked_ach': 'No unlocked achievements (complete at least one)',
      'profile_saved_success': 'Profile saved successfully!',
      'profile_reset_success': 'Account progress reset!',
      'profile_reset_toast': 'Achievements and clicks progress successfully reset!',
      'profile_reset_toast_title': 'Reset Complete',
      'profile_reset_confirm_title': 'Reset Progress?',
      'profile_reset_confirm_msg': 'Are you sure you want to reset all achievement and click progress for profile "{username}"?',
      'confirm_cancel': 'Cancel',
      'profile_fallback_user': 'Player',

      // Admin Dashboard
      'admin_title': 'Creator Dashboard',
      'admin_badge': 'ADMIN',
      'admin_subtitle': 'Player management, cheat controls and global settings',
      'admin_tab_players': 'Players',
      'admin_tab_announcement': 'Global Announcement',
      'admin_search_ph': 'Search by username or email...',
      'admin_refresh_btn': 'Refresh',
      'admin_loading_players': 'Loading players from database...',
      'admin_loading_firestore': 'Loading players from Firestore...',
      'admin_no_players': 'No players found.',
      'admin_badge_creator': 'CREATOR',
      'admin_badge_import': 'IMPORTED',
      'admin_grant_vip': '+ VIP',
      'admin_remove_vip': 'Remove VIP',
      'admin_in_top': 'To Tops',
      'admin_out_top': 'Off Tops',
      'admin_show_announcement': 'Show announcement on site banner:',
      'admin_announcement_text_label': 'Global Announcement Text:',
      'admin_announcement_ph': 'e.g. ⚡ Leaderboards and top ranks opening soon!',
      'admin_style_label': 'Banner Style:',
      'admin_style_cyber': 'Cyberpunk (Neon Purple)',
      'admin_style_gold': 'Royal Gold',
      'admin_style_alert': 'Important Alert (Red)',
      'admin_style_emerald': 'Emerald Event',
      'admin_save_announcement': 'Save & Apply Announcement',
      'admin_footer_version': 'Site Version:',

      'guest_modal_title': 'Local Profile',
      'guest_modal_badge': 'Local',
      'guest_modal_subtitle': 'Play without linking email or password',
      'guest_nickname_label': 'In-game nickname:',
      'guest_nickname_placeholder': 'e.g. Player 777',
      'guest_nickname_hint': 'Leave blank to generate a random player name.',
      'guest_feature_local_title': 'Data stored only in this browser:',
      'guest_feature_local_desc': 'All achievements, clicks, and settings are saved in your device\'s local storage.',
      'guest_feature_no_top_title': 'No online leaderboard ranking:',
      'guest_feature_no_top_desc': 'Local accounts are not published to the global online leaderboards.',
      'guest_feature_save_anytime_title': 'Save anytime:',
      'guest_feature_save_anytime_desc': 'At any time in your profile card you can link Google, or set a password to sync data to the cloud.',
      'guest_btn_cancel': 'Go Back',
      'guest_btn_start': 'Start Playing',
      'google_setup_title': 'Account Setup',
      'google_setup_username_label': 'Nickname / Account Name:',
      'google_setup_username_placeholder': 'Your in-game nickname',
      'google_setup_username_hint': 'Displayed in profile and leaderboard',
      'google_setup_password_label': 'Login password:',
      'google_setup_password_placeholder': 'Minimum 6 characters',
      'google_setup_confirm_label': 'Confirm password:',
      'google_setup_confirm_placeholder': 'Repeat password',
      'google_setup_btn_cancel': 'Cancel',
      'google_setup_btn_create': 'Create Account',
      'backup_export_title': 'Backup File Protection',
      'backup_export_desc': 'Set a password to encrypt your data file so others cannot import your progress:',
      'backup_export_password_label': 'File password:',
      'backup_export_password_placeholder': 'Create a password',
      'backup_export_confirm_label': 'Confirm password:',
      'backup_export_confirm_placeholder': 'Repeat password',
      'backup_export_btn_cancel': 'Cancel',
      'backup_export_btn_submit': 'Encrypt and Download',
      'backup_import_title': 'Enter Backup Password',
      'backup_import_desc_prefix': 'Account file "',
      'backup_import_desc_suffix': '" is protected. Enter password to decrypt:',
      'backup_import_password_label': 'File password:',
      'backup_import_password_placeholder': 'Enter password',
      'backup_import_btn_cancel': 'Cancel',
      'backup_import_btn_submit': 'Decrypt and Apply',
      'verify_title': 'Email Verification',
      'verify_subtitle': 'We sent a 6-digit verification code to',
      'verify_spam_notice_html': 'Can\'t find the email? Check your <b>Spam</b> or <b>All Mail</b> folders.',
      'verify_btn_submit': 'Verify & Log In',
      'verify_btn_back': '← Back',
      'verify_resend_countdown': 'Resend code in {sec}s',
      'verify_resend_btn': 'Resend code again',
      'verify_err_6_digits': 'Please enter all 6 digits of the code!',
      'verify_err_invalid': 'Invalid verification code. Check your inbox and try again.',
      'verify_toast_sent': 'Code sent to {email}. Be sure to check Inbox and Spam!',
      'verify_toast_new_sent': 'New code sent to {email}',
      'verify_toast_expired': 'Registration session expired. Please fill out the form again.',
      'lb_modal_title': 'Hall of Fame',
      'lb_badge_online': 'Online Cloud',
      'lb_modal_subtitle': 'Real-time global player rankings',
      'lb_tab_achievements': 'Achievements',
      'lb_tab_clicks': 'Clicks',
      'lb_tab_wheel': 'Wheel',
      'lb_loading': 'Loading rankings from Firebase cloud...',
      'lb_auto_updates': 'Updates automatically',
      'lb_btn_refresh': 'Refresh',
      'lb_stat_clicks': 'clicks',
      'lb_stat_spins': 'spins',
      'lb_stat_achievements': 'achievements',
      'lb_empty': 'No players in cloud database yet. Be the first!',
      'lb_badge_you': 'YOU',
      'profile_legend_badge': 'Legend',
      'profile_default_username': 'Player',
      'profile_mood_in_game': 'In game',
      'profile_mood_welcome': '"Welcome to my profile!"',
      'profile_mood_dot_title': 'Status',
      'profile_fav_char_title': 'Favorite character',
      'profile_tg_title': 'Telegram',
      'profile_tg_none': 'Not specified',
      'profile_stat_vip_inactive': 'Inactive',
      'profile_stat_vip_active': 'VIP Active',
      'profile_edit_reset_btn': 'Reset',
      'profile_edit_reset_progress': 'Reset Progress',
      'profile_edit_strength_weak': 'Security: Weak',
      'profile_edit_strength_fair': 'Security: Fair',
      'profile_edit_strength_good': 'Security: Strong',
      'profile_edit_password_hint': 'Min 6 chars, letters + digits',
      'profile_imported_tooltip': 'Click to read details',
      'profile_imported_notice_html': 'Your profile was imported from a backup file. This account will not appear on online leaderboards.',
      'profile_opt_universal': 'Universal Lucky (VIP)',
      'profile_opt_universal_desc': 'Unlocked VIP status',
      'profile_opt_first_click': 'First Click',
      'profile_opt_speed_demon': 'Speed Demon',
      'profile_opt_wheel_master': 'Wheel Master',
      'profile_opt_collector': 'Pack Collector',
      'btn_fullscreen': 'Fullscreen Mode',
      'custom_btn_menu': 'Menu Settings',
      'custom_btn_select_packs': 'Select Other Packs',
      'custom_btn_reset_packs': 'Reset / Disable All Packs',
      'music_mute_title': 'Mute Sound (0%)',
      'music_volume_title': 'Volume Control (0% - 200%)',
      'music_max_title': 'Maximum Volume (200%)',
      'common_confirm': 'Confirm',
      'common_confirm_title': 'Confirmation',
      'custom_btn_create_pack': 'Create New Pack',
      'custom_btn_hide_form': 'Hide Form',
      'custom_btn_save_pack': 'Save Pack',
      'custom_btn_save_changes': 'Save Changes',
      'custom_empty_packs': 'No packs yet. Create your first pack above!',
      'members_result_format': 'I am sure that {member} is {word}!',
      'auth_login_username_placeholder': 'name@example.com or nickname',
      'auth_login_password_placeholder': 'Enter password',
      'auth_reg_password_placeholder': 'Minimum 6 chars, letters + numbers',
      'auth_reg_confirm_placeholder': 'Repeat password',
      'tanjiro_auto_spin': 'Auto-spin',
      'tanjiro_stop_auto_spin': 'Stop auto-spin',
      'tanjiro_auto_spin_active': 'Auto-spin active',

      'auth_label_login': 'Email or Nickname:',
      'auth_label_password': 'Password:',
      'auth_btn_login': 'Log In',
      'auth_label_username': 'Nickname:',
      'auth_label_email': 'Email:',
      'auth_label_reg_password': 'Create password:',
      'auth_label_confirm_password': 'Confirm password:',
      'auth_reg_strength_hint': 'Min 6 chars, no 1234',
      'auth_btn_register': 'Register',
      'profile_edit_preview_title': 'Title',
      'profile_edit_preview_name': 'Nickname',

      // Batch 3 UI & Module Keys
      'seo_h1': 'Nanjicore — Online Randomizer, Wheel of Fortune & Mini Games',
      'toast_default_title': 'Fanatic',
      'toast_default_desc': 'Click the button 1000 times!',
      'mode_indicator_button': 'Mode: Button',
      'mode_indicator_wheel': 'Mode: Wheel',
      'ach_progress_initial': 'Progress: 0 / 11 completed',
      'delete_pack_confirm_prefix': 'Are you sure you want to delete',
      'delete_pack_confirm_suffix': '?',
      'common_confirm_message': 'Are you sure you want to perform this action?',
      'bg_site_title': 'Website Background',
      'bg_site_desc': 'Upload an image for full-screen background',
      'bg_card_title': 'Content Background',
      'bg_card_desc': 'Upload an image for cards background',
      'bg_btn_choose': 'Choose File',
      'bg_btn_remove': 'Remove Photo',
      'auth_modal_title': 'Account Login',
      'auth_modal_desc': 'Log in so all your achievements, packs, and VIP status are saved to your account',
      'auth_tab_login': 'Log In',
      'auth_tab_register': 'Register',
      'auth_or_provider': 'or via account',
      'auth_btn_google': 'Continue with Google',
      'auth_btn_guest': 'Play without registration (Locally)',
      'auth_saved_profiles': 'Saved profiles:',
      'auth_modal_register_title': 'Create Account',
      'auth_modal_register_desc': 'Register to save your packs, achievements, and VIP status',
      'auth_status_selected': 'Selected',
      'auth_google_connecting': 'Connecting to Google...',
      'toast_type_warning': 'Warning',
      'toast_type_error': 'Error',
      'toast_type_success': 'Success',
      'toast_type_info': 'Information',
      'custom_result_format': '{n1} and {n2} — {role}!',
      'custom_btn_editing_pack': 'Editing: {title}',
      'backup_err_pwd_short': 'Password for file protection must contain at least 4 characters!',
      'backup_err_pwd_mismatch': 'Passwords do not match!',
      'backup_status_encrypting': 'Encrypting...',
      'backup_err_crypto': 'Encryption error: ',
      'backup_err_enter_pwd': 'Enter the backup file password!',
      'backup_status_decrypting': 'Decrypting...',
      'backup_err_wrong_pwd': 'Incorrect backup file password! Check your password.',
      'admin_err_load_players': 'Failed to load players:',
      'verify_toast_sent_title': 'Code sent',
      'verify_toast_new_title': 'Code updated',
      'verify_err_send': 'Failed to deliver email. Check your email address or try again later.',

      // Auth Error & Language Name Keys
      'lang_name_ru': 'Russian (RU)',
      'lang_name_en': 'English (EN)',
      'auth_err_fields_login': 'Enter email/nickname and password!',
      'auth_err_fields_reg': 'Fill in nickname, email, and both password fields!',
      'auth_err_nick_len': 'Nickname must be at least 2 characters long!',
      'auth_err_invalid_email': 'Enter a valid email address!',
      'auth_err_pwd_len': 'Password must contain at least 6 characters!',
      'auth_err_pwd_mismatch': 'Passwords do not match!',
      'auth_err_nick_exists': 'A user with this nickname already exists!',
      'auth_err_email_exists': 'An account with this email is already registered! Please log in.',
    }
  };

  /**
   * Определение начального языка
   * 1. localStorage ('ru' | 'en')
   * 2. navigator.language (ru, be, uk, kk -> 'ru', иначе 'en')
   */
  function detectLanguage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'ru' || saved === 'en') {
        return saved;
      }
      const navLang = (navigator.language || navigator.userLanguage || 'ru').toLowerCase();
      if (navLang.startsWith('ru') || navLang.startsWith('be') || navLang.startsWith('uk') || navLang.startsWith('kk')) {
        return 'ru';
      }
      return 'en';
    } catch (e) {
      return 'ru';
    }
  }

  let currentLang = detectLanguage();

  /**
   * Получение перевода по ключу
   * @param {string} key - Ключ перевода
   * @param {string} [fallback] - Запасное значение, если ключ не найден
   * @returns {string}
   */
  function t(key, paramsOrFallback, maybeFallback) {
    const langDict = translations[currentLang] || translations.ru;
    let str;
    let params = null;
    let fallback = undefined;

    if (paramsOrFallback !== null && typeof paramsOrFallback === 'object') {
      params = paramsOrFallback;
      fallback = maybeFallback;
    } else {
      fallback = paramsOrFallback;
    }

    if (langDict && key in langDict) {
      str = langDict[key];
    } else if (translations.ru && key in translations.ru) {
      str = translations.ru[key];
    } else {
      str = fallback !== undefined ? fallback : key;
    }

    if (params && typeof str === 'string') {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(new RegExp(`\{${k}\}`, 'g'), String(v));
      }
    }

    return str;
  }

  /**
   * Получение массива ответов колеса Танджиро на текущем языке
   */
  function getAnswers() {
    return [
      t('tanjiro_ans_0', 'Натурал на 100%!'),
      t('tanjiro_ans_1', 'Не по девочкам...'),
      t('tanjiro_ans_2', 'Универсал!'),
      t('tanjiro_ans_3', 'Тайный матвейка!'),
      t('tanjiro_ans_4', 'Лесбиянка!')
    ];
  }

  /**
   * Получение массива ролей модалки "Кто есть кто?" на текущем языке
   */
  function getWhoRoles() {
    return [
      t('who_role_0', 'Изгой'),
      t('who_role_1', 'Никто'),
      t('who_role_2', 'Нн какой-то'),
      t('who_role_3', 'Легенда чата'),
      t('who_role_4', 'Владелец'),
      t('who_role_5', 'Помощник владельца'),
      t('who_role_6', 'Раб Эбардо')
    ];
  }

  /**
   * Обновление визуального состояния переключателя RU / EN
   */
  function updateSwitcherUI() {
    const btnRu = document.getElementById('langBtn_ru');
    const btnEn = document.getElementById('langBtn_en');
    const badge = document.getElementById('currentLangBadge');

    if (badge) {
      badge.textContent = currentLang.toUpperCase();
    }

    if (!btnRu || !btnEn) return;

    if (currentLang === 'ru') {
      btnRu.className = 'lang-switch-btn px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm';
      btnEn.className = 'lang-switch-btn px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
    } else {
      btnEn.className = 'lang-switch-btn px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 bg-white dark:bg-gray-800 border-indigo-500 text-indigo-600 dark:text-indigo-400 shadow-sm';
      btnRu.className = 'lang-switch-btn px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 bg-white/60 dark:bg-gray-800/60 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700';
    }
  }

  let isApplying = false;

  /**
   * Применение переводов ко всем элементам с data-i18n
   */
  function applyTranslations() {
    if (isApplying) return;
    isApplying = true;
    try {
      document.documentElement.lang = currentLang;

      // 1. Текстовое содержимое data-i18n
      document.querySelectorAll('[data-i18n]').forEach((el) => {
        if (el.id === 'userTopName') return; // Защита: никнейм игрока управляется исключительно профилем
        const key = el.getAttribute('data-i18n');
        const val = t(key);
        if (val !== undefined) {
          el.textContent = val;
        }
      });

      // 2. HTML содержимое data-i18n-html
      document.querySelectorAll('[data-i18n-html]').forEach((el) => {
        const key = el.getAttribute('data-i18n-html');
        const val = t(key);
        if (val !== undefined) {
          el.innerHTML = val;
        }
      });

      // 3. Плейсхолдеры инпутов data-i18n-placeholder
      document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        const key = el.getAttribute('data-i18n-placeholder');
        const val = t(key);
        if (val !== undefined) {
          el.setAttribute('placeholder', val);
        }
      });

      // 4. Тултипы / title data-i18n-title
      document.querySelectorAll('[data-i18n-title]').forEach((el) => {
        const key = el.getAttribute('data-i18n-title');
        const val = t(key);
        if (val !== undefined) {
          el.setAttribute('title', val);
          if (el.hasAttribute('aria-label')) {
            el.setAttribute('aria-label', val);
          }
        }
      });

      // 5. Обновление переключателя
      updateSwitcherUI();

      // 6. Уведомление других модулей через кастомное событие
      window.dispatchEvent(new CustomEvent('languageChanged', {
        detail: { lang: currentLang }
      }));

      // 7. Повторная синхронизация имени и рамки в шапке
      const profileUiFn = typeof updateUserProfileUI === 'function' ? updateUserProfileUI : (typeof window !== 'undefined' ? window.updateUserProfileUI : null);
      if (profileUiFn) profileUiFn();
    } finally {
      isApplying = false;
    }
  }

  /**
   * Смена языка
   * @param {'ru'|'en'} lang - Язык для переключения
   */
  function setLanguage(lang) {
    if (lang !== 'ru' && lang !== 'en') return;
    currentLang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) {}
    applyTranslations();
  }

  /**
   * Глобальный объект i18n
   */
  const i18n = {
    get currentLang() { return currentLang; },
    getLanguage: () => currentLang,
    setLanguage: setLanguage,
    t: t,
    getAnswers: getAnswers,
    getWhoRoles: getWhoRoles,
    applyTranslations: applyTranslations,
    translations: translations
  };

  // Экспорт в глобальное пространство
  window.i18n = i18n;
  window.t = t;
  window.switchLanguage = setLanguage;

  // Инициализация при готовности DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      applyTranslations();
    });
  } else {
    applyTranslations();
  }
})();
