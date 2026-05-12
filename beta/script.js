// script.js - все скрипты для сайта

// Функция получения статуса сервера
async function fetchServerStatus() {
    const statusDot = document.getElementById('status-dot');
    const statusText = document.getElementById('status-text');
    
    try {
        const response = await fetch('https://api.mcsrvstat.us/2/188.127.241.222:25601');
        const data = await response.json();
        
        if (data.online) {
            statusDot.className = 'status-dot online';
            statusText.innerHTML = `Онлайн: <span class="online-count">${data.players.online}</span> / ${data.players.max}`;
        } else {
            statusDot.className = 'status-dot offline';
            statusText.textContent = 'Сервер выключен';
        }
    } catch (error) {
        statusDot.className = 'status-dot offline';
        statusText.textContent = 'Ошибка подключения';
        console.error('Ошибка:', error);
    }
}

// Настройка мобильного меню
function setupMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const menuIcon = document.getElementById('menuIcon');
    
    if (!sidebar || !menuIcon) return;
    
    menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
    });
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!sidebar.contains(e.target)) {
                sidebar.classList.remove('mobile-open');
            }
        }
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchServerStatus();
    setupMobileMenu();
    
    // Обновляем статус каждые 30 секунд
    setInterval(fetchServerStatus, 30000);
});