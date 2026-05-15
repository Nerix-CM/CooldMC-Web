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

// Форматирование даты для новостей
function formatNewsDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const day = date.getDate();
    const month = date.getMonth() + 1;
    
    let timeAgo = '';
    if (diffDays > 0) {
        timeAgo = `${diffDays} ${getDaysWord(diffDays)} назад`;
    } else if (diffHours > 0) {
        timeAgo = `${diffHours} ${getHoursWord(diffHours)} назад`;
    } else if (diffMinutes > 0) {
        timeAgo = `${diffMinutes} ${getMinutesWord(diffMinutes)} назад`;
    } else {
        timeAgo = 'только что';
    }
    
    return {
        dateFormatted: `${day}.${month} ${hours}:${minutes}`,
        timeAgo: timeAgo
    };
}

function getDaysWord(days) {
    if (days % 10 === 1 && days % 100 !== 11) return 'день';
    if ([2, 3, 4].includes(days % 10) && ![12, 13, 14].includes(days % 100)) return 'дня';
    return 'дней';
}

function getHoursWord(hours) {
    if (hours % 10 === 1 && hours % 100 !== 11) return 'час';
    if ([2, 3, 4].includes(hours % 10) && ![12, 13, 14].includes(hours % 100)) return 'часа';
    return 'часов';
}

function getMinutesWord(minutes) {
    if (minutes % 10 === 1 && minutes % 100 !== 11) return 'минуту';
    if ([2, 3, 4].includes(minutes % 10) && ![12, 13, 14].includes(minutes % 100)) return 'минуты';
    return 'минут';
}

// Форматирование даты для игроков
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

// Функции для игроков
function getDaysBetween(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24));
}

function sortPlayersByRoleAndDays(players) {
    const today = new Date().toISOString().split('T')[0];
    const roleOrder = { admin: 0, moderator: 1, beta: 2 };
    
    return [...players].sort((a, b) => {
        const orderA = roleOrder[a.role] ?? 99;
        const orderB = roleOrder[b.role] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const daysA = getDaysBetween(a.joinDate, today);
        const daysB = getDaysBetween(b.joinDate, today);
        return daysB - daysA;
    });
}

// Управление видимостью левой секции (только на телефоне, только на не-главных страницах)
function toggleLeftSectionMobile(showOnMobile) {
    const leftSection = document.querySelector('.left-section');
    if (leftSection) {
        if (window.innerWidth <= 768) {
            // На телефоне: скрываем на всех вкладках, кроме главной
            leftSection.style.display = showOnMobile ? 'flex' : 'none';
        } else {
            // На ПК: всегда показываем
            leftSection.style.display = 'flex';
        }
    }
}

// Прокрутка страницы вверх
function scrollToTop() {
    // Прокручиваем основное окно
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    // Прокручиваем контейнер с контентом
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        rightSection.scrollTop = 0;
    }
}

// Отображение страниц
function renderHomePage() {
    toggleLeftSectionMobile(true); // На телефоне показываем блок
    renderLatestNewsOnHome();
    scrollToTop();
}

function renderPlayersPage() {
    toggleLeftSectionMobile(false); // На телефоне скрываем блок
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof playersData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки данных игроков</div>';
            scrollToTop();
            return;
        }
        
        const sortedPlayers = sortPlayersByRoleAndDays(playersData);
        
        let html = '<div class="players-container">';
        sortedPlayers.forEach(player => {
            const daysOnServer = getDaysBetween(player.joinDate, new Date().toISOString().split('T')[0]);
            let roleClass = '';
            let roleHtml = '';
            if (player.role === 'admin') {
                roleClass = 'role-admin';
                roleHtml = `<span class="player-role ${roleClass}">${player.roleText}</span>`;
            } else if (player.role === 'moderator') {
                roleClass = 'role-moderator';
                roleHtml = `<span class="player-role ${roleClass}">${player.roleText}</span>`;
            } else if (player.role === 'beta') {
                roleClass = 'role-beta';
                roleHtml = `<span class="player-role ${roleClass}">${player.roleText}</span>`;
            }
            
            html += `
                <div class="player-card">
                    <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        ${roleHtml}
                    </div>
                    <div class="player-stats">
                        <div class="player-join-date">📅 ${formatDate(player.joinDate)}</div>
                        <div class="player-days">⏱ ${daysOnServer} дн.</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        rightSection.innerHTML = html;
    }
    scrollToTop();
}

function renderRulesPage() {
    toggleLeftSectionMobile(false);
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof rulesData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки правил</div>';
            scrollToTop();
            return;
        }
        
        let html = '<div class="rules-container">';
        rulesData.forEach(section => {
            html += `<div class="rules-section"><div class="rules-title">${section.number}. ${section.title}</div>`;
            section.subRules.forEach(sub => {
                html += `<div class="rules-subrule">• ${sub.text} ${sub.punishment ? `<span class="rules-punishment">[${sub.punishment}]</span>` : ''}</div>`;
                if (sub.subSub) {
                    sub.subSub.forEach(subsub => {
                        html += `<div class="rules-subsubrule">◦ ${subsub.text} ${subsub.punishment ? `<span class="rules-punishment">[${subsub.punishment}]</span>` : ''}</div>`;
                    });
                }
            });
            html += `</div>`;
        });
        html += '</div>';
        rightSection.innerHTML = html;
    }
    scrollToTop();
}

function renderFunctionsPage() {
    toggleLeftSectionMobile(false);
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof functionsData === 'undefined' || typeof modsData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки функций</div>';
            scrollToTop();
            return;
        }
        
        let html = '<div class="functions-container">';
        html += '<div class="functions-list">';
        functionsData.forEach(func => {
            let processedText = func.text;
            const modNames = ['Armor Poser', 'Simple Voice Chat', 'Voice Messages', 'PatPat', 'V-CooldMC-2.4'];
            modNames.forEach(modName => {
                const regex = new RegExp(`(${modName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'g');
                processedText = processedText.replace(regex, '<span class="mod-name-bold">$1</span>');
            });
            processedText = processedText.replace(/«([^»]+)»/g, '<span class="bold-quote">«$1</span>');
            processedText = processedText.replace(/\(([^)]+)\)/g, '<span class="note-gray">($1)</span>');
            html += `<div class="function-item">• ${processedText}</div>`;
        });
        html += '</div>';
        
        html += '<div class="mods-title">Моды и ресурс паки:</div>';
        html += '<div class="mods-list">';
        modsData.forEach(mod => {
            html += `
                <div class="mod-card">
                    <div class="mod-info">
                        <div class="mod-type">${mod.type}</div>
                        <div class="mod-name">${mod.name}</div>
                    </div>
                    <a href="${mod.link}" class="download-btn" target="_blank">Скачать</a>
                </div>
            `;
        });
        html += '</div></div>';
        rightSection.innerHTML = html;
    }
    scrollToTop();
}

// Функция для отображения всех новостей
function renderAllNewsPage() {
    toggleLeftSectionMobile(false);
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof newsData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки новостей</div>';
            scrollToTop();
            return;
        }
        
        const sortedNews = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
        
        let html = '<div class="news-container">';
        
        sortedNews.forEach(news => {
            const dateInfo = formatNewsDate(news.date);
            const imageHtml = news.image && news.image !== null ? 
                `<div class="news-image"><img src="photos/${news.image}" alt="${news.title}"></div>` : '';
            
            html += `
                <div class="news-card">
                    <div class="news-title">${news.title}</div>
                    <div class="news-divider"></div>
                    ${imageHtml}
                    <div class="news-description">${news.description}</div>
                    <div class="news-date">
                        <span class="news-date-icon">📅</span>
                        <span>${dateInfo.dateFormatted}</span>
                        <span class="news-timeago">• ${dateInfo.timeAgo}</span>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        rightSection.innerHTML = html;
    }
    scrollToTop();
}

// Функция для отображения последней новости на главной
function renderLatestNewsOnHome() {
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof newsData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки новостей</div>';
            return;
        }
        
        const sortedNews = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
        const latestNews = sortedNews[0];
        
        if (latestNews) {
            const dateInfo = formatNewsDate(latestNews.date);
            const imageHtml = latestNews.image && latestNews.image !== null ? 
                `<div class="latest-news-image"><img src="photos/${latestNews.image}" alt="${latestNews.title}"></div>` : '';
            
            let html = `
                <div class="latest-news-section">
                    <div class="latest-news-header">
                        <span class="latest-news-icon">📰</span>
                        <span class="latest-news-title">Последняя новость</span>
                    </div>
                    <div class="news-card latest">
                        <div class="news-title">${latestNews.title}</div>
                        <div class="news-divider"></div>
                        ${imageHtml}
                        <div class="news-description">${latestNews.description.substring(0, 150)}${latestNews.description.length > 150 ? '...' : ''}</div>
                        <div class="news-date">
                            <span class="news-date-icon">📅</span>
                            <span>${dateInfo.dateFormatted}</span>
                            <span class="news-timeago">• ${dateInfo.timeAgo}</span>
                        </div>
                    </div>
                    <div class="all-news-link">
                        <a href="#" class="all-news-btn" data-page="news">Все новости →</a>
                    </div>
                </div>
            `;
            
            rightSection.innerHTML = html;
            
            const allNewsBtn = rightSection.querySelector('.all-news-btn');
            if (allNewsBtn) {
                allNewsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    switchPage('news');
                });
            }
        } else {
            rightSection.innerHTML = '<div class="right-placeholder">Новостей пока нет</div>';
        }
    }
}

function renderFaqPage() {
    toggleLeftSectionMobile(false);
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof faqData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки FAQ</div>';
            scrollToTop();
            return;
        }
        
        let html = '<div class="faq-container">';
        faqData.forEach((item, index) => {
            let processedQuestion = item.question;
            processedQuestion = processedQuestion.replace(/«([^»]+)»/g, '<span class="bold-quote">«$1»</span>');
            processedQuestion = processedQuestion.replace(/@(Nerix_CM)/g, '<span class="admin-name">@$1</span>');
            
            let processedAnswer = item.answer;
            processedAnswer = processedAnswer.replace(/«([^»]+)»/g, '<span class="bold-quote">«$1»</span>');
            processedAnswer = processedAnswer.replace(/@(Nerix_CM)/g, '<span class="admin-name">@$1</span>');
            processedAnswer = processedAnswer.replace(/«Модератор»/g, '"<span class="role-moderator">Модератор</span>"');
            processedAnswer = processedAnswer.replace(/«Бета-тестер»/g, '"<span class="role-beta">Бета-тестер</span>"');
            
            html += `
                <div class="faq-item">
                    <div class="faq-question" data-index="${index}">
                        <div class="faq-question-text">${processedQuestion}</div>
                        <div class="faq-toggle">▼ Показать ответ</div>
                    </div>
                    <div class="faq-answer" id="faq-answer-${index}" style="display: none;">
                        <div class="faq-answer-text">${processedAnswer}</div>
                        <div class="faq-hide-toggle">▲ Скрыть ответ</div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        rightSection.innerHTML = html;
        
        document.querySelectorAll('.faq-question').forEach(question => {
            const index = question.getAttribute('data-index');
            const answer = document.getElementById(`faq-answer-${index}`);
            const toggle = question.querySelector('.faq-toggle');
            const hideToggle = answer ? answer.querySelector('.faq-hide-toggle') : null;
            
            if (hideToggle) {
                hideToggle.addEventListener('click', (e) => {
                    e.stopPropagation();
                    answer.style.display = 'none';
                    if (toggle) toggle.style.display = 'inline-block';
                });
            }
            
            question.addEventListener('click', (e) => {
                if (e.target === hideToggle || (hideToggle && hideToggle.contains(e.target))) return;
                if (answer.style.display === 'none') {
                    if (toggle) toggle.style.display = 'none';
                    answer.style.display = 'block';
                }
            });
        });
    }
    scrollToTop();
}

// Переключение страниц
function getPageFromURL() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'players', 'rules', 'functions', 'news', 'faq', 'map'];
    return validPages.includes(hash) ? hash : 'home';
}

function updateActivePage(pageId) {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
    
    mobileNavLinks.forEach(link => {
        if (link.getAttribute('data-page') === pageId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

function switchPage(pageId) {
    if (pageId === 'map') {
        window.open('http://188.127.241.222:25729', '_blank');
        return;
    }
    
    window.location.hash = pageId;
    updateActivePage(pageId);
    
    switch(pageId) {
        case 'home':
            renderHomePage();
            break;
        case 'players':
            renderPlayersPage();
            break;
        case 'rules':
            renderRulesPage();
            break;
        case 'functions':
            renderFunctionsPage();
            break;
        case 'news':
            renderAllNewsPage();
            break;
        case 'faq':
            renderFaqPage();
            break;
        default:
            renderHomePage();
    }
}

function setupPageSwitching() {
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            switchPage(pageId);
            
            const mobileMenu = document.getElementById('mobileMenuOverlay');
            if (mobileMenu && mobileMenu.classList.contains('open')) {
                mobileMenu.classList.remove('open');
            }
        });
    });
    
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = link.getAttribute('data-page');
            switchPage(pageId);
            
            const mobileMenu = document.getElementById('mobileMenuOverlay');
            if (mobileMenu) {
                mobileMenu.classList.remove('open');
            }
        });
    });
    
    window.addEventListener('hashchange', () => {
        const pageId = getPageFromURL();
        if (pageId !== 'map') {
            updateActivePage(pageId);
            switch(pageId) {
                case 'home': renderHomePage(); break;
                case 'players': renderPlayersPage(); break;
                case 'rules': renderRulesPage(); break;
                case 'functions': renderFunctionsPage(); break;
                case 'news': renderAllNewsPage(); break;
                case 'faq': renderFaqPage(); break;
                default: renderHomePage();
            }
        }
    });
}

function setupMobileMenu() {
    const menuIcon = document.getElementById('menuIcon');
    const mobileMenu = document.getElementById('mobileMenuOverlay');
    const closeBtn = document.getElementById('mobileCloseBtn');
    
    if (!menuIcon || !mobileMenu) return;
    
    menuIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.add('open');
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            mobileMenu.classList.remove('open');
        });
    }
    
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (mobileMenu.classList.contains('open')) {
                if (!mobileMenu.contains(e.target) && !menuIcon.contains(e.target)) {
                    mobileMenu.classList.remove('open');
                }
            }
        }
    });
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchServerStatus();
    setupMobileMenu();
    setupPageSwitching();
    
    const initialPage = getPageFromURL();
    updateActivePage(initialPage);
    switch(initialPage) {
        case 'home': renderHomePage(); break;
        case 'players': renderPlayersPage(); break;
        case 'rules': renderRulesPage(); break;
        case 'functions': renderFunctionsPage(); break;
        case 'news': renderAllNewsPage(); break;
        case 'faq': renderFaqPage(); break;
        default: renderHomePage();
    }
    
    // При изменении размера окна обновляем видимость блока
    window.addEventListener('resize', () => {
        const currentPage = getPageFromURL();
        if (currentPage === 'home') {
            toggleLeftSectionMobile(true);
        } else {
            toggleLeftSectionMobile(false);
        }
    });
    
    setInterval(fetchServerStatus, 30000);
});