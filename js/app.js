document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // Проверка админа
    const isAdmin = tg.initDataUnsafe?.user?.username === 'vseporchuu';
    if (isAdmin) {
        addAdminButton();
    }
    
    // Загрузка данных
    fetch('data/releases.json')
        .then(response => response.json())
        .then(data => renderContent(data));
    
    // Навигация
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            if (btn.dataset.page === 'profile') {
                showProfile();
            }
        });
    });
    
    // Плеер
    document.querySelectorAll('.watch-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.getElementById('player-frame').src = 'https://example.com/player';
            document.querySelector('.modal').style.display = 'block';
        });
    });
    
    document.querySelector('.close-modal').addEventListener('click', () => {
        document.getElementById('player-frame').src = '';
        document.querySelector('.modal').style.display = 'none';
    });
    
    function renderContent(data) {
        // Рендерим сегодняшние релизы
        const todayReleases = data.filter(release => release.isToday);
        const todayContainer = document.querySelector('.horizontal-scroll');
        
        todayReleases.forEach(release => {
            todayContainer.innerHTML += `
                <div class="release-card today" data-id="${release.id}">
                    <img src="${release.image}" alt="${release.title}">
                    <div class="release-info">
                        <span class="rating">${release.rating} ★</span>
                        <span class="status">${release.status}</span>
                        <h3>${release.title}</h3>
                    </div>
                </div>
            `;
        });
        
        // Рендерим основной список
        const listContainer = document.querySelector('.anime-list');
        
        data.forEach(release => {
            listContainer.innerHTML += `
                <div class="anime-card" data-id="${release.id}">
                    <img src="${release.image}" alt="${release.title}">
                    <div class="anime-info">
                        <h3>${release.title}</h3>
                        <div class="genres">${release.genres.join(', ')}</div>
                        <p class="description">${release.description}</p>
                        <button class="watch-btn">Смотреть</button>
                    </div>
                </div>
            `;
        });
    }
    
    function showProfile() {
        const user = tg.initDataUnsafe?.user;
        tg.showPopup({
            title: 'Профиль',
            message: `Привет, ${user?.first_name || 'пользователь'}!`,
            buttons: [
                {type: isAdmin ? 'default' : 'ok', text: isAdmin ? 'Панель админа' : 'OK'},
                {type: 'cancel'}
            ]
        }, (btnId) => {
            if (isAdmin && btnId === 'default') {
                window.location.href = 'admin.html';
            }
        });
    }
    
    function addAdminButton() {
        const adminBtn = document.createElement('button');
        adminBtn.className = 'admin-btn';
        adminBtn.textContent = 'Админ';
        adminBtn.addEventListener('click', () => {
            window.location.href = 'admin.html';
        });
        document.body.appendChild(adminBtn);
    }
});