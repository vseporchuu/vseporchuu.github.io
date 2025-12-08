// common.js - Общие функции для Youkai Studio

// Данные для примера
const popularAnime = [
    { title: "Атака Титанов: Финальный сезон", image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", year: "2023", rating: "9.8", genres: ["Экшен", "Драма", "Фэнтези"], episodes: "28" },
    { title: "Ван Пис: Фильм Red", image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", year: "2022", rating: "9.5", genres: ["Приключения", "Комедия"], episodes: "1" },
    { title: "Магическая битва 2", image: "https://images.unsplash.com/photo-1618331833071-1c0c6ee3d19e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", year: "2023", rating: "9.2", genres: ["Экшен", "Сверхъестественное"], episodes: "23" },
    { title: "Демон-убийца: Деревня кузнецов", image: "https://images.unsplash.com/photo-1639322537228-f710d846310a?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", year: "2023", rating: "9.3", genres: ["Экшен", "Драма"], episodes: "11" },
    { title: "О моём перерождении в слизь 3", image: "https://images.unsplash.com/photo-1541562232579-512a21360020?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80", year: "2023", rating: "9.0", genres: ["Фэнтези", "Приключения"], episodes: "12" }
];

// Состояние пользователя (Telegram)
let isTelegramUser = false;
let telegramUser = null;

// Проверяем, загружены ли данные из Telegram Web App
function checkTelegramAuth() {
    // В реальном приложении здесь будет проверка данных из Telegram Web App
    // Для демонстрации используем localStorage
    const savedUser = localStorage.getItem('telegram_user');
    
    if (savedUser) {
        telegramUser = JSON.parse(savedUser);
        isTelegramUser = true;
        updateUserInterface();
        return true;
    }
    
    // Симуляция данных Telegram (для демонстрации)
    if (window.location.hash.includes('#tg=')) {
        const hash = window.location.hash.substring(1);
        const params = new URLSearchParams(hash);
        
        telegramUser = {
            id: params.get('id') || '123456789',
            first_name: params.get('first_name') || 'Алексей',
            last_name: params.get('last_name') || 'Иванов',
            username: params.get('username') || 'alexeyivanov',
            photo_url: params.get('photo_url') || null
        };
        
        localStorage.setItem('telegram_user', JSON.stringify(telegramUser));
        isTelegramUser = true;
        updateUserInterface();
        return true;
    }
    
    return false;
}

// Обновление интерфейса в зависимости от состояния пользователя
function updateUserInterface() {
    const userAvatar = document.getElementById('userAvatar');
    const dropdownHeader = document.getElementById('dropdownHeader');
    const dropdownAvatar = document.getElementById('dropdownAvatar');
    const dropdownInfo = document.getElementById('dropdownInfo');
    const telegramLoginBtn = document.getElementById('telegramLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (isTelegramUser && telegramUser) {
        // Пользователь авторизован через Telegram
        if (userAvatar) {
            userAvatar.classList.remove('unauthorized');
            userAvatar.title = `${telegramUser.first_name} ${telegramUser.last_name || ''}`.trim();
            
            if (telegramUser.photo_url) {
                userAvatar.innerHTML = `<img src="${telegramUser.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
                if (dropdownAvatar) dropdownAvatar.innerHTML = `<img src="${telegramUser.photo_url}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;">`;
            } else {
                const initials = telegramUser.first_name.charAt(0) + (telegramUser.last_name ? telegramUser.last_name.charAt(0) : '');
                userAvatar.textContent = initials.toUpperCase();
                if (dropdownAvatar) dropdownAvatar.textContent = initials.toUpperCase();
            }
        }
        
        if (dropdownInfo) {
            dropdownInfo.innerHTML = `
                <h4>${telegramUser.first_name} ${telegramUser.last_name || ''}</h4>
                <p>@${telegramUser.username}</p>
            `;
        }
        
        if (telegramLoginBtn) telegramLoginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'block';
        
        updateActiveNavLink();
        
    } else {
        // Пользователь не авторизован
        if (userAvatar) {
            userAvatar.innerHTML = '<i class="fas fa-user"></i>';
            userAvatar.classList.add('unauthorized');
            userAvatar.title = "Меню пользователя";
        }
        
        if (dropdownAvatar) dropdownAvatar.innerHTML = '<i class="fas fa-user"></i>';
        if (dropdownInfo) {
            dropdownInfo.innerHTML = `
                <h4>Войдите через Telegram</h4>
                <p>Для доступа ко всем функциям</p>
            `;
        }
        
        if (telegramLoginBtn) telegramLoginBtn.style.display = 'flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
    }
}

// Функция для создания карточки аниме
function createAnimeCard(anime, isNewEpisode = false) {
    return `
        <div class="anime-card" onclick="window.location.href='anime-watch.html'">
            ${anime.isNew ? '<div class="new-badge">NEW</div>' : ''}
            <img src="${anime.image}" alt="${anime.title}" loading="lazy">
            <div class="anime-card-content">
                <h3>${anime.title}</h3>
                <div class="anime-meta">
                    <span>${anime.year}</span>
                    <span class="anime-rating"><i class="fas fa-star"></i> ${anime.rating}</span>
                </div>
                ${isNewEpisode ? `<div style="color: var(--primary-color); font-size: 14px; margin-bottom: 10px;"><i class="fas fa-play-circle"></i> ${anime.newEpisode}</div>` : ''}
                <div class="anime-genres">
                    ${anime.genres.map(genre => `<span class="genre-tag">${genre}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
}

// Функция показа уведомления
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : type === 'warning' ? 'fa-exclamation-triangle' : type === 'error' ? 'fa-times-circle' : 'fa-info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, duration);
    
    return notification;
}

// Обновление активной ссылки в навигации
function updateActiveNavLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.main-nav a, .mobile-nav a');
    
    navLinks.forEach(link => {
        const linkHref = link.getAttribute('href');
        if (linkHref === currentPage || 
            (currentPage === '' && linkHref === 'index.html') ||
            (currentPage === 'index.html' && linkHref === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Инициализация общих элементов
function initCommonElements() {
    // Проверяем авторизацию Telegram
    checkTelegramAuth();
    
    // Элементы управления
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavClose = document.getElementById('mobileNavClose');
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');
    const userMenu = document.getElementById('userMenu');
    const userDropdown = document.getElementById('userDropdown');
    const telegramLoginBtn = document.getElementById('telegramLoginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    
    // Мобильное меню
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.add('active');
            mobileNavOverlay.classList.add('active');
        });
    }
    
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
        });
    }
    
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', () => {
            mobileNav.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
        });
    }
    
    // Выпадающее меню пользователя
    if (userMenu) {
        userMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('active');
        });
    }
    
    // Закрытие выпадающего меню при клике вне его
    document.addEventListener('click', (e) => {
        if (userMenu && !userMenu.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Telegram авторизация
    if (telegramLoginBtn) {
        telegramLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            if (window.Telegram && window.Telegram.WebApp) {
                // Используем Telegram Web App
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand();
                
                const user = window.Telegram.WebApp.initDataUnsafe.user;
                if (user) {
                    telegramUser = {
                        id: user.id,
                        first_name: user.first_name,
                        last_name: user.last_name || '',
                        username: user.username,
                        photo_url: user.photo_url || null
                    };
                    
                    localStorage.setItem('telegram_user', JSON.stringify(telegramUser));
                    isTelegramUser = true;
                    updateUserInterface();
                    showNotification(`Добро пожаловать, ${user.first_name}!`, 'success');
                }
            } else {
                // Демо-режим
                telegramUser = {
                    id: '123456789',
                    first_name: 'Демо',
                    last_name: 'Пользователь',
                    username: 'demo_user',
                    photo_url: null
                };
                
                localStorage.setItem('telegram_user', JSON.stringify(telegramUser));
                isTelegramUser = true;
                updateUserInterface();
                showNotification('Вход выполнен в демо-режиме', 'success');
            }
            
            if (userDropdown) userDropdown.classList.remove('active');
        });
    }
    
    // Выход из аккаунта
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            localStorage.removeItem('telegram_user');
            isTelegramUser = false;
            telegramUser = null;
            updateUserInterface();
            showNotification('Вы вышли из аккаунта', 'info');
            if (userDropdown) userDropdown.classList.remove('active');
        });
    }
    
    // Мобильный поиск
    if (window.innerWidth <= 992) {
        if (mobileSearchBtn) {
            mobileSearchBtn.style.display = 'block';
            mobileSearchBtn.addEventListener('click', () => {
                searchBox.classList.toggle('active');
                if (searchBox.classList.contains('active')) {
                    searchInput.focus();
                }
            });
        }
        
        document.addEventListener('click', (e) => {
            if (searchBox && mobileSearchBtn) {
                if (!searchBox.contains(e.target) && !mobileSearchBtn.contains(e.target)) {
                    searchBox.classList.remove('active');
                }
            }
        });
    }
    
    // Обработка поиска
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.trim();
                if (query) {
                    window.location.href = `anime-catalog.html?search=${encodeURIComponent(query)}`;
                }
            }
        });
    }
    
    // Обновляем активную ссылку
    updateActiveNavLink();
    
    // Закрытие меню при переходе по ссылке (для мобильных)
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', () => {
            if (mobileNav) mobileNav.classList.remove('active');
            if (mobileNavOverlay) mobileNavOverlay.classList.remove('active');
        });
    });
}

// Обработка изменения размера окна
window.addEventListener('resize', function() {
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');
    const searchBox = document.getElementById('searchBox');
    
    if (window.innerWidth > 992) {
        if (searchBox) {
            searchBox.style.display = 'flex';
            searchBox.classList.remove('active');
        }
        if (mobileSearchBtn) mobileSearchBtn.style.display = 'none';
    } else {
        if (mobileSearchBtn) mobileSearchBtn.style.display = 'block';
        if (searchBox && !searchBox.classList.contains('active')) {
            searchBox.style.display = 'none';
        }
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', initCommonElements);
