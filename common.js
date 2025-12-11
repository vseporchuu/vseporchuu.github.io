// common.js - общие функции для Youkai Studio в Telegram Web App

// ==================== TELEGRAM WEB APP ИНИЦИАЛИЗАЦИЯ ====================
let tg = null;
let currentUser = null;

function initTelegramWebApp() {
    if (window.Telegram && window.Telegram.WebApp) {
        tg = window.Telegram.WebApp;
        
        console.log('Telegram Web App инициализирован');
        
        // Основные настройки Web App
        tg.expand(); // Раскрываем на весь экран
        tg.enableClosingConfirmation(); // Запрашиваем подтверждение закрытия
        
        // Настройка основной кнопки
        if (tg.MainButton) {
            tg.MainButton.setText("Открыть в Youkai Studio");
            tg.MainButton.show();
        }
        
        // Обработчик основной кнопки
        tg.MainButton.onClick(function() {
            window.location.href = 'index.html';
        });
        
        // Настройка кнопки "Назад"
        tg.BackButton.onClick(function() {
            window.history.back();
        });
        
        // Показываем кнопку "Назад" если не на главной
        const currentPage = window.location.pathname.split('/').pop();
        if (currentPage !== 'index.html' && tg.BackButton) {
            tg.BackButton.show();
        }
        
        // Получаем данные пользователя
        const userData = tg.initDataUnsafe.user;
        if (userData) {
            currentUser = {
                id: userData.id,
                first_name: userData.first_name,
                last_name: userData.last_name || '',
                username: userData.username || '',
                photo_url: userData.photo_url || '',
                language_code: userData.language_code || 'ru',
                is_premium: userData.is_premium || false
            };
            
            // Сохраняем данные пользователя
            saveUserData(currentUser);
            
            // Обновляем интерфейс
            updateUserInterface();
        }
        
        // Адаптируем тему под Telegram
        adaptToTelegramTheme();
        
        // Добавляем класс для стилизации под Web App
        document.body.classList.add('telegram-webapp');
        
        return tg;
    } else {
        console.log('Telegram Web App не обнаружен, работаем в веб-режиме');
        // Загружаем демо-данные для разработки
        loadDemoUser();
        return null;
    }
}

// ==================== СОХРАНЕНИЕ ДАННЫХ ПОЛЬЗОВАТЕЛЯ ====================
function saveUserData(user) {
    try {
        localStorage.setItem('tg_user', JSON.stringify(user));
        localStorage.setItem('tg_user_id', user.id);
        
        // Сохраняем настройки приватности по умолчанию
        if (!localStorage.getItem(`privacy_${user.id}`)) {
            localStorage.setItem(`privacy_${user.id}`, 'enabled');
        }
        
        console.log('Данные пользователя сохранены:', user.first_name);
    } catch (e) {
        console.error('Ошибка сохранения данных:', e);
    }
}

// ==================== ЗАГРУЗКА ДЕМО-ПОЛЬЗОВАТЕЛЯ ====================
function loadDemoUser() {
    // Для разработки без Telegram
    const demoUser = {
        id: '123456789',
        first_name: 'Демо',
        last_name: 'Пользователь',
        username: 'demo_user',
        photo_url: '',
        language_code: 'ru',
        is_premium: false,
        is_demo: true
    };
    
    currentUser = demoUser;
    saveUserData(demoUser);
    updateUserInterface();
    
    // Показываем предупреждение о демо-режиме
    setTimeout(() => {
        showNotification('Работаем в демо-режиме', 'info');
    }, 1000);
}

// ==================== ОБНОВЛЕНИЕ ИНТЕРФЕЙСА ====================
function updateUserInterface() {
    if (!currentUser) return;
    
    // Обновляем аватарку пользователя
    const userAvatar = document.getElementById('userAvatar');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownInfo = document.getElementById('dropdownInfo');
    const telegramLoginBtn = document.getElementById('telegramLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (userAvatar) {
        userAvatar.title = `${currentUser.first_name} ${currentUser.last_name}`.trim();
        
        if (currentUser.photo_url) {
            userAvatar.innerHTML = `<img src="${currentUser.photo_url}" alt="${currentUser.first_name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
        } else {
            const initials = (currentUser.first_name.charAt(0) + (currentUser.last_name ? currentUser.last_name.charAt(0) : '')).toUpperCase();
            userAvatar.textContent = initials;
            userAvatar.style.fontSize = '18px';
            userAvatar.style.fontWeight = 'bold';
        }
        
        // Убираем класс "неавторизован"
        userAvatar.classList.remove('unauthorized');
    }
    
    if (dropdownAvatar && currentUser.photo_url) {
        dropdownAvatar.innerHTML = `<img src="${currentUser.photo_url}" alt="${currentUser.first_name}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
    }
    
    if (dropdownInfo) {
        dropdownInfo.innerHTML = `
            <h4>${currentUser.first_name} ${currentUser.last_name}</h4>
            <p>@${currentUser.username || 'пользователь'}</p>
        `;
    }
    
    // Скрываем кнопку входа через Telegram
    if (telegramLoginBtn) {
        telegramLoginBtn.style.display = 'none';
    }
    
    // Показываем кнопку выхода
    if (logoutBtn) {
        logoutBtn.style.display = 'block';
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Обновляем имя в меню
    const userNameElements = document.querySelectorAll('.user-name-display');
    userNameElements.forEach(el => {
        el.textContent = currentUser.first_name;
    });
    
    // Добавляем обработчики для кнопок "Написать в Telegram"
    setupTelegramChatButtons();
}

// ==================== ОТКРЫТИЕ ЧАТА В TELEGRAM ====================
function openTelegramChat(userId, username) {
    if (!userId) {
        showNotification('ID пользователя не указан', 'error');
        return;
    }
    
    // Проверяем настройки приватности
    const privacySetting = localStorage.getItem(`privacy_${userId}`);
    if (privacySetting === 'disabled') {
        showNotification('Пользователь запретил личные сообщения', 'warning');
        return;
    }
    
    if (tg && tg.openTelegramLink) {
        // Открываем чат через Telegram Web App
        tg.openTelegramLink(`tg://user?id=${userId}`);
        showNotification('Открываем чат в Telegram...', 'info');
    } else if (username) {
        // Веб-версия
        window.open(`https://t.me/${username}`, '_blank');
    } else {
        // Fallback
        showNotification('Для общения добавьте пользователя в контакты Telegram', 'info');
    }
}

// ==================== НАСТРОЙКА КНОПОК ДЛЯ ЧАТА ====================
function setupTelegramChatButtons() {
    // Убираем старые обработчики
    document.querySelectorAll('.telegram-chat-btn').forEach(btn => {
        btn.replaceWith(btn.cloneNode(true));
    });
    
    // Добавляем новые обработчики
    document.querySelectorAll('.telegram-chat-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const card = this.closest('[data-user-id]');
            if (card) {
                const userId = card.dataset.userId;
                const username = card.dataset.username;
                openTelegramChat(userId, username);
            }
        });
    });
    
    // Обработчики для кнопок "Обсудить в Telegram"
    document.querySelectorAll('.telegram-discuss-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const animeTitle = this.dataset.animeTitle || 'аниме';
            const discussionLink = `https://t.me/youkaistudio_discussion?text=Обсуждение: ${encodeURIComponent(animeTitle)}`;
            
            if (tg && tg.openTelegramLink) {
                tg.openTelegramLink(discussionLink);
            } else {
                window.open(discussionLink, '_blank');
            }
        });
    });
}

// ==================== НАСТРОЙКИ ПРИВАТНОСТИ ====================
function initPrivacySettings() {
    const allowMessagesCheckbox = document.getElementById('allowMessages');
    if (!allowMessagesCheckbox || !currentUser) return;
    
    // Загружаем текущие настройки
    const privacySetting = localStorage.getItem(`privacy_${currentUser.id}`);
    allowMessagesCheckbox.checked = privacySetting !== 'disabled';
    
    // Сохраняем изменения
    allowMessagesCheckbox.addEventListener('change', function() {
        localStorage.setItem(`privacy_${currentUser.id}`, this.checked ? 'enabled' : 'disabled');
        showNotification(
            this.checked ? 
            'Личные сообщения разрешены' : 
            'Личные сообщения запрещены',
            'success'
        );
    });
}

// ==================== ВЫХОД ИЗ АККАУНТА ====================
function handleLogout(e) {
    e.preventDefault();
    
    if (confirm('Вы уверены, что хотите выйти?')) {
        // Очищаем данные
        localStorage.removeItem('tg_user');
        localStorage.removeItem('tg_user_id');
        
        // Показываем уведомление
        showNotification('Вы вышли из аккаунта', 'info');
        
        // Перезагружаем страницу
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
}

// ==================== АДАПТАЦИЯ ТЕМЫ ====================
function adaptToTelegramTheme() {
    if (!tg) return;
    
    const theme = tg.colorScheme; // 'light' или 'dark'
    const themeParams = tg.themeParams;
    
    // Устанавливаем тему
    document.body.classList.add(`theme-${theme}`);
    
    // Используем цвета из Telegram если доступны
    if (themeParams.bg_color) {
        document.documentElement.style.setProperty('--dark-color', themeParams.bg_color);
    }
    
    if (themeParams.text_color) {
        document.documentElement.style.setProperty('--text-primary', themeParams.text_color);
    }
    
    if (themeParams.button_color) {
        document.documentElement.style.setProperty('--primary-color', themeParams.button_color);
    }
    
    if (themeParams.button_text_color) {
        document.documentElement.style.setProperty('--button-text-color', themeParams.button_text_color);
    }
}

// ==================== УВЕДОМЛЕНИЯ ====================
function showNotification(message, type = 'info', duration = 3000) {
    // Создаем стили если их нет
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .tg-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                left: 20px;
                background: var(--card-bg);
                color: var(--text-primary);
                padding: 15px 20px;
                border-radius: 12px;
                z-index: 9999;
                animation: slideInTop 0.3s ease;
                box-shadow: var(--shadow);
                border-left: 4px solid var(--primary-color);
                max-width: 400px;
                margin: 0 auto;
                backdrop-filter: blur(10px);
            }
            
            .tg-notification.success {
                border-left-color: var(--success-color);
                background: rgba(107, 255, 184, 0.1);
            }
            
            .tg-notification.warning {
                border-left-color: var(--warning-color);
                background: rgba(255, 209, 102, 0.1);
            }
            
            .tg-notification.error {
                border-left-color: #ff4444;
                background: rgba(255, 68, 68, 0.1);
            }
            
            .tg-notification.info {
                border-left-color: var(--info-color);
                background: rgba(123, 180, 255, 0.1);
            }
            
            @keyframes slideInTop {
                from { transform: translateY(-100%); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @media (max-width: 768px) {
                .tg-notification {
                    top: 70px;
                    left: 10px;
                    right: 10px;
                    max-width: none;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Создаем уведомление
    const notification = document.createElement('div');
    notification.className = `tg-notification ${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Добавляем на страницу
    document.body.appendChild(notification);
    
    // Автоматически скрываем
    setTimeout(() => {
        notification.style.animation = 'slideInTop 0.3s ease reverse';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    return notification;
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'warning': return 'fa-exclamation-triangle';
        case 'error': return 'fa-times-circle';
        case 'info': return 'fa-info-circle';
        default: return 'fa-info-circle';
    }
}

// ==================== ОПТИМИЗАЦИЯ ДЛЯ МОБИЛЬНЫХ ====================
function optimizeForMobile() {
    // Предотвращаем масштабирование при фокусе (iOS)
    document.addEventListener('touchstart', function() {}, {passive: true});
    
    // Улучшаем отзывчивость тапов
    document.documentElement.style.setProperty('--tap-highlight', 'rgba(255, 255, 255, 0.1)');
    
    // Добавляем touch-оптимизации
    if ('ontouchstart' in window) {
        // Увеличиваем области для тапов
        document.querySelectorAll('button, .btn, .anime-card, .episode-card').forEach(el => {
            el.style.minHeight = '44px';
        });
        
        // Уменьшаем анимации для производительности
        document.documentElement.style.setProperty('--transition-speed', '0.2s');
    }
    
    // Ленивая загрузка изображений
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
}

// ==================== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ====================
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

function getCurrentUser() {
    return currentUser;
}

function getTelegramWebApp() {
    return tg;
}

// ==================== ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Инициализация Youkai Studio...');
    
    // Инициализируем Telegram Web App
    initTelegramWebApp();
    
    // Оптимизируем для мобильных
    optimizeForMobile();
    
    // Инициализируем настройки приватности
    initPrivacySettings();
    
    // Обновляем активные ссылки в навигации
    updateActiveNavLinks();
    
    // Добавляем обработчик для мобильного меню
    setupMobileMenu();
    
    console.log('Инициализация завершена');
});

// Обновление активных ссылок в навигации
function updateActiveNavLinks() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a, .user-dropdown-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === '/' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Настройка мобильного меню
function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    
    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
            if (mobileNavOverlay) mobileNavOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
    // Закрываем меню при клике на ссылку
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

// Экспортируем функции для использования в других скриптах
window.YoukaiStudio = {
    initTelegramWebApp,
    getCurrentUser,
    getTelegramWebApp,
    openTelegramChat,
    showNotification,
    isMobileDevice
};
