document.addEventListener('DOMContentLoaded', () => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    
    // Проверка прав администратора
    if (tg.initDataUnsafe?.user?.username !== 'vseporchuu') {
        window.location.href = 'index.html';
    }
    
    const form = document.getElementById('release-form');
    const genreSelect = document.getElementById('genre-select');
    const genreTags = document.getElementById('genre-tags');
    const addEpisodeBtn = document.getElementById('add-episode');
    const episodeInputs = document.getElementById('episode-inputs');
    
    const selectedGenres = [];
    
    // Добавление жанров
    genreSelect.addEventListener('change', () => {
        const genre = genreSelect.value;
        if (!selectedGenres.includes(genre)) {
            selectedGenres.push(genre);
            renderGenreTags();
        }
        genreSelect.value = '';
    });
    
    function renderGenreTags() {
        genreTags.innerHTML = selectedGenres.map(genre => `
            <span class="genre-tag">${genre} 
                <span onclick="removeGenre('${genre}')" style="cursor:pointer">×</span>
            </span>
        `).join('');
    }
    
    window.removeGenre = (genre) => {
        const index = selectedGenres.indexOf(genre);
        if (index !== -1) {
            selectedGenres.splice(index, 1);
            renderGenreTags();
        }
    };
    
    // Добавление серий
    addEpisodeBtn.addEventListener('click', () => {
        const episodeInput = document.createElement('div');
        episodeInput.className = 'episode-input';
        episodeInput.innerHTML = `
            <input type="text" placeholder="Название серии" class="episode-title">
            <input type="url" placeholder="Ссылка на серию" class="episode-url">
        `;
        episodeInputs.appendChild(episodeInput);
    });
    
    // Отправка формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value;
        const description = document.getElementById('description').value;
        const releaseDate = document.getElementById('release-date').value;
        const imageFile = document.getElementById('image').files[0];
        
        // Собираем данные о сериях
        const episodes = [];
        document.querySelectorAll('.episode-input').forEach(input => {
            const title = input.querySelector('.episode-title').value;
            const url = input.querySelector('.episode-url').value;
            if (title && url) {
                episodes.push({ title, url });
            }
        });
        
        // Здесь должна быть логика загрузки изображения и сохранения данных
        // Например, отправка на сервер или сохранение в localStorage для демо
        
        tg.showAlert('Релиз успешно создан!');
        form.reset();
        selectedGenres.length = 0;
        renderGenreTags();
        episodeInputs.innerHTML = `
            <div class="episode-input">
                <input type="text" placeholder="Название серии" class="episode-title">
                <input type="url" placeholder="Ссылка на серию" class="episode-url">
            </div>
        `;
    });
});