// Инициализация Мини Апп
const tg = window.Telegram.WebApp;
const bot = tg.initDataUnsafe.bot;

// Элементы интерфейса
const elements = {
    userName: document.getElementById('userName'),
    userAvatar: document.getElementById('userAvatar'),
    tankiRank: document.getElementById('tankiRank'),
    tankiNickname: document.getElementById('tankiNickname'),
    nicknameInput: document.getElementById('nicknameInput'),
    bindBtn: document.getElementById('bindBtn'),
    errorMessage: document.getElementById('errorMessage'),
    errorText: document.getElementById('errorText'),
    toast: document.getElementById('toast'),
    toastMessage: document.getElementById('toastMessage'),
    // статистика чата
    chatRank: document.getElementById('chatRank'),
    chatXP: document.getElementById('chatXP'),
    messagesCount: document.getElementById('messagesCount'),
    karmaPoints: document.getElementById('karmaPoints'),
    rankProgressBar: document.getElementById('rankProgressBar'),
    currentXP: document.getElementById('currentXP'),
    nextRankXP: document.getElementById('nextRankXP'),
    penaltyPoints: document.getElementById('penaltyPoints'),
    mutesCount: document.getElementById('mutesCount'),
    lastViolations: document.getElementById('lastViolations'),
    achievementsContainer: document.getElementById('achievementsContainer'),
    // настройки
    themeSwitch: document.getElementById('themeSwitch'),
    privacySwitch: document.getElementById('privacySwitch'),
    showGameAccount: document.getElementById('showGameAccount'),
    // реейтинг
    ratingNicknameInput: document.getElementById('ratingNicknameInput'),
    ratingSearchBtn: document.getElementById('ratingSearchBtn'),
    ratingErrorMessage: document.getElementById('ratingErrorMessage'),
    ratingErrorText: document.getElementById('ratingErrorText'),
    playerStats: document.getElementById('playerStats'),
    playerRatings: document.getElementById('playerRatings'),
    playerTops: document.getElementById('playerTops'),
    playerSupplies: document.getElementById('playerSupplies'),
    achievementsCard: document.getElementById('achievementsCard'),
    achievementsGrid: document.getElementById('achievementsGrid'),
    // загрузчик
    loader: document.getElementById('loader')
};

// Показываем уведомление
function showToast(message, type = 'info') {
    elements.toast.className = `toast ${type}`;
    elements.toastMessage.textContent = message;
    elements.toast.classList.add('show');
    
    setTimeout(() => {
        elements.toast.classList.remove('show');
    }, 3000);
}

// Показать/скрыть загрузчик
function showLoader() {
    elements.loader.style.display = 'flex';
}

function hideLoader() {
    elements.loader.style.display = 'none';
}

// Отправка запроса к API бота
async function sendApiRequest(data) {
    try {
        showLoader();

        // Отправляем данные через WebApp
        Telegram.WebApp.sendData(JSON.stringify(data));

        // Ждём ответ от бота
        return new Promise((resolve) => {
            const listener = (event) => {
                if (event.data && event.data.message) {
                    const message = event.data.message;
                    if (message.text && message.text.startsWith('{')) {
                        Telegram.WebApp.offEvent('messageReceived', listener);
                        resolve(JSON.parse(message.text));
                    }
                }
            };
            Telegram.WebApp.onEvent('messageReceived', listener);
        });
    } catch (error) {
        console.error('API Error:', error);
        showToast('Ошибка соединения с сервером', 'error');
        return { error: error.message };
    } finally {
        hideLoader();
    }
}

// Обновление шапки профиля
function updateProfileHeader(user) {
    if (user) {
        // Обновляем имя
        const userName = user.first_name || user.username || 'Пользователь';
        elements.userName.textContent = userName;
        
        // Обновляем аватар
        if (user.photo_url) {
            elements.userAvatar.innerHTML = '';
            const img = document.createElement('img');
            img.src = user.photo_url;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            elements.userAvatar.appendChild(img);
        }
    } else {
        elements.userName.textContent = 'Пользователь Telegram';
    }
}

// Обновление статистики чата
function updateChatStats(stats) {
    elements.chatXP.textContent = stats.experience;
    elements.messagesCount.textContent = stats.messages_count;
    elements.karmaPoints.textContent = stats.karma;
    elements.penaltyPoints.textContent = stats.karma;
    elements.mutesCount.textContent = stats.mutes;
    elements.chatRank.textContent = stats.rank;
    
    // Прогресс до следующего звания
    let nextRankXP;
    if (stats.experience < 100) {
        nextRankXP = 100;
    } else if (stats.experience < 300) {
        nextRankXP = 300;
    } else if (stats.experience < 600) {
        nextRankXP = 600;
    } else if (stats.experience < 1000) {
        nextRankXP = 1000;
    } else {
        nextRankXP = stats.experience * 1.5;
    }
    
    elements.currentXP.textContent = stats.experience;
    elements.nextRankXP.textContent = nextRankXP;
    
    const progress = Math.min(100, Math.round((stats.experience / nextRankXP) * 100));
    elements.rankProgressBar.style.width = `${progress}%`;
    
    // Достижения
    updateAchievements(stats.achievements);
    
    // Нарушения
    if (stats.mutes > 0) {
        const violations = [
            { reason: "Нецензурная лексика", date: new Date().toLocaleDateString() }
        ];
        
        elements.lastViolations.innerHTML = violations.map(v => `
            <div class="violation-item">
                <div class="violation-reason">${v.reason}</div>
                <div class="violation-date">${v.date}</div>
            </div>
        `).join('');
    }
}

// Обновление списка достижений
function updateAchievements(achievements) {
    const achievementIcons = {
        "Первое сообщение": "fas fa-comment",
        "Активный участник": "fas fa-star",
        "Ветеран чата": "fas fa-crown",
        "Репортер": "fas fa-flag"
    };
    
    elements.achievementsContainer.innerHTML = achievements.map(achievement => `
        <div class="achievement-item">
            <div class="achievement-badge">
                <i class="${achievementIcons[achievement] || 'fas fa-medal'}"></i>
            </div>
            <div class="achievement-name">${achievement}</div>
        </div>
    `).join('');
}

// Обновление статистики Tanki Online
function updateTankiStats(stats) {
    // Основная статистика
    elements.battlesStat.textContent = stats.battles.toLocaleString();
    elements.winsStat.textContent = stats.wins.toLocaleString();
    elements.winrateStat.textContent = `${stats.winrate}%`;
    elements.destroyedStat.textContent = stats.kills.toLocaleString();
    elements.experienceStat.textContent = stats.experience.toLocaleString();
    
    // Топы
    updateTopItems('topGunsContainer', stats.turrets, 'fas fa-gun');
    updateTopItems('topHullsContainer', stats.hulls, 'fas fa-shield-alt');
    updateTopItems('topPaintsContainer', stats.paints, 'fas fa-paint-roller');
    
    // Припасы
    if (stats.supplies) {
        elements.repairKit.textContent = stats.supplies.repairKit || 0;
        elements.armor.textContent = stats.supplies.armor || 0;
        elements.doubleDamage.textContent = stats.supplies.doubleDamage || 0;
        elements.speedBoost.textContent = stats.supplies.speedBoost || 0;
        elements.mine.textContent = stats.supplies.mine || 0;
        elements.grenade.textContent = stats.supplies.grenade || 0;
        elements.goldBox.textContent = stats.supplies.goldBox || 0;
        elements.overdrive.textContent = stats.supplies.overdrive || 0;
    }
    
    // Обновляем никнейм в профиле
    elements.tankiNickname.textContent = stats.player_name;
    elements.tankiRank.textContent = stats.rank;
}

// Обновление топовых предметов
function updateTopItems(containerId, items, iconClass) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map((item, index) => `
        <div class="top-item">
            <div class="top-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="top-info">
                <div class="top-name">${item[0]}</div>
                <div class="top-value">${item[1]} ч</div>
            </div>
        </div>
    `).join('');
}

// Функция для переключения вкладок
function setupTabNavigation() {
    const tabItems = document.querySelectorAll('.tab-item');
    
    tabItems.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // Убираем активный класс со всех вкладок
            tabItems.forEach(item => item.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Добавляем активный класс текущей вкладке
            this.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Добавляем анимацию при переключении
            document.getElementById(tabId).classList.add('animate');
            setTimeout(() => {
                document.getElementById(tabId).classList.remove('animate');
            }, 400);
        });
    });
}

// Переключение темы
function setupThemeSwitcher() {
    elements.themeSwitch.addEventListener('change', function() {
        if (this.checked) {
            document.body.classList.add('dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.remove('dark-theme');
            localStorage.setItem('theme', 'light');
        }
    });
    
    // Загрузка сохраненной темы
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        elements.themeSwitch.checked = true;
        document.body.classList.add('dark-theme');
    }
}

// Обработчик привязки аккаунта ТО
async function handleBindAccount() {
    const nickname = elements.nicknameInput.value.trim();
    if (!nickname) {
        showToast('Введите никнейм', 'error');
        return;
    }

    // Валидация никнейма
    if (!/^[a-zA-Z0-9_]{3,16}$/.test(nickname)) {
        showToast('Никнейм может содержать только буквы, цифры и _ (3-16 символов)', 'error');
        return;
    }

    const response = await sendApiRequest({
        action: "bind_nickname",
        user_id: tg.initDataUnsafe.user.id,
        nickname: nickname
    });

    if (response && response.status === "success") {
        showToast('Никнейм привязан!', 'success');
        loadTankiStats(nickname);
    } else {
        showToast(response?.error || 'Ошибка привязки никнейма', 'error');
    }
}

// Загрузка статистики ТО
async function loadTankiStats(nickname) {
    const data = await sendApiRequest({
        action: "get_tanki_stats",
        nickname: nickname
    });

    if (data && data.success) {
        updateTankiStats(data);
    } else {
        showToast(data?.error || 'Ошибка загрузки данных', 'error');
    }
}

// Обработчик поиска игрока в рейтинге
async function handlePlayerSearch() {
    const nickname = elements.ratingNicknameInput.value.trim();
    if (!nickname) {
        showToast('Введите никнейм игрока', 'error');
        return;
    }
    
    const data = await sendApiRequest({
        action: "get_tanki_stats",
        nickname: nickname
    });
    
    if (data.success) {
        updatePlayerStats(data);
        showToast(`Данные для ${nickname} загружены`, 'success');
    } else {
        showToast(data.error || 'Ошибка загрузки данных', 'error');
    }
}

// Обновление статистики игрока в рейтинге
function updatePlayerStats(stats) {
    // Основная статистика
    elements.playerBattles.textContent = stats.battles.toLocaleString();
    elements.playerWins.textContent = stats.wins.toLocaleString();
    elements.playerWinrate.textContent = `${stats.winrate}%`;
    elements.playerDestroyed.textContent = stats.kills.toLocaleString();
    elements.playerExperience.textContent = stats.experience.toLocaleString();
    
    // Топы
    updatePlayerTopItems('playerTopGuns', stats.turrets, 'fas fa-gun');
    updatePlayerTopItems('playerTopHulls', stats.hulls, 'fas fa-shield-alt');
    updatePlayerTopItems('playerTopPaints', stats.paints, 'fas fa-paint-roller');
    
    // Припасы
    elements.playerRepairKit.textContent = stats.supplies.repairKit;
    elements.playerArmor.textContent = stats.supplies.armor;
    elements.playerDoubleDamage.textContent = stats.supplies.doubleDamage;
    elements.playerSpeedBoost.textContent = stats.supplies.speedBoost;
    
    // Показываем все разделы
    elements.playerStats.style.display = 'block';
    elements.playerRatings.style.display = 'block';
    elements.playerTops.style.display = 'block';
    elements.playerSupplies.style.display = 'block';
}

// Обновление топовых предметов игрока
function updatePlayerTopItems(containerId, items, iconClass) {
    const container = document.getElementById(containerId);
    container.innerHTML = items.map((item, index) => `
        <div class="top-item">
            <div class="top-icon">
                ${index + 1}
            </div>
            <div class="top-info">
                <div class="top-name">${item[0]}</div>
                <div class="top-value">${item[1]} ч</div>
            </div>
        </div>
    `).join('');
}

// Инициализация приложения
async function initApp() {
    // Настройка телеграм мини апп
    if (tg.platform !== 'unknown') {
        tg.expand();
        tg.enableClosingConfirmation();
        tg.setHeaderColor('#00897B');
        tg.setBackgroundColor('#F5F7FA');
    }
    
    // Получаем данные пользователя
    const user = tg.initDataUnsafe.user;
    updateProfileHeader(user);
    
    // Загружаем статистику чата
    const chatStats = await sendApiRequest({
        action: "get_chat_stats",
        user_id: user.id
    });
    
    if (chatStats && !chatStats.error) {
        updateChatStats(chatStats);
    }
    
    // Настройка интерфейса
    setupTabNavigation();
    setupThemeSwitcher();
    
    // Обработчики событий
    elements.bindBtn.addEventListener('click', handleBindAccount);
    elements.ratingSearchBtn.addEventListener('click', handlePlayerSearch);
    
    // Загрузка сохраненных настроек приватности
    const privacySetting = localStorage.getItem('privacy');
    if (privacySetting === 'hidden') {
        elements.privacySwitch.checked = true;
    }
    
    const showGameSetting = localStorage.getItem('showGameAccount');
    if (showGameSetting === 'false') {
        elements.showGameAccount.checked = false;
    }
    
    // Обработчики для настроек
    elements.privacySwitch.addEventListener('change', async function() {
        const response = await sendApiRequest({
            action: "update_settings",
            privacy: this.checked
        });

        if (response && response.success) {
            localStorage.setItem('privacy', this.checked ? 'hidden' : 'visible');
            showToast(this.checked ? 'Профиль скрыт' : 'Профиль виден всем', 'success');
        }
    });

    elements.showGameAccount.addEventListener('change', async function() {
        const response = await sendApiRequest({
            action: "update_settings",
            showGameAccount: this.checked
        });

        if (response && response.success) {
            localStorage.setItem('showGameAccount', this.checked);
            showToast(this.checked ? 'Игровой аккаунт виден' : 'Игровой аккаунт скрыт', 'success');
        }
    });
        
    elements.themeSwitch.addEventListener('change', async function() {
        const theme = this.checked ? 'dark' : 'light';
        const response = await sendApiRequest({
            action: "update_settings",
            theme: theme
        });
        
        if (response && response.success) {
            localStorage.setItem('theme', theme);
        }
    });
    
    // Обработчик поиска пользователей
    elements.userSearchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            showToast(`Поиск пользователя: ${this.value}`, 'info');
        }
    });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
