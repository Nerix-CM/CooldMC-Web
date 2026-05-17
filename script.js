// script.js - все скрипты для сайта

// Управление эффектами
let currentEffect = null;
let snowEffect = null;
let leavesEffect = null;

function stopCurrentEffect() {
    if (currentEffect) {
        currentEffect.stop();
        currentEffect = null;
    }
}

function startSnowEffect() {
    stopCurrentEffect();
    if (!snowEffect) {
        snowEffect = new SnowEffect();
    }
    snowEffect.init();
    currentEffect = snowEffect;
}

function startLeavesEffect() {
    stopCurrentEffect();
    if (!leavesEffect) {
        leavesEffect = new LeavesEffect();
    }
    leavesEffect.init();
    currentEffect = leavesEffect;
}

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
    const roleOrder = { 
        gl_admin: 0,      // ГЛ.Администратор
        admin: 1,         // Администратор
        gl_moderator: 2,  // ГЛ.Модератор
        st_moderator: 3,  // СТ.Модератор
        moderator: 4,     // Модератор
        gl_helper: 5,     // ГЛ.Хелпер
        st_helper: 6,     // СТ.Хелпер
        helper: 7,        // Хелпер
        beta: 8           // Бета-тестер
    };
    
    return [...players].sort((a, b) => {
        const orderA = roleOrder[a.role] ?? 99;
        const orderB = roleOrder[b.role] ?? 99;
        if (orderA !== orderB) return orderA - orderB;
        const daysA = getDaysBetween(a.joinDate, today);
        const daysB = getDaysBetween(b.joinDate, today);
        return daysB - daysA;
    });
}

// Управление видимостью левой секции
function toggleLeftSectionMobile(showOnMobile) {
    const leftSection = document.querySelector('.left-section');
    if (leftSection) {
        if (window.innerWidth <= 768) {
            leftSection.style.display = showOnMobile ? 'flex' : 'none';
        } else {
            leftSection.style.display = 'flex';
        }
    }
}

// Прокрутка страницы вверх
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        rightSection.scrollTop = 0;
    }
}

// Отображение страниц
function renderHomePage() {
    toggleLeftSectionMobile(true);
    renderLatestNewsOnHome();
    scrollToTop();
}

function renderPlayersPage() {
    toggleLeftSectionMobile(false);
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        if (typeof playersData === 'undefined') {
            rightSection.innerHTML = '<div class="error-message">Ошибка загрузки данных игроков</div>';
            scrollToTop();
            return;
        }
        
        const today = new Date().toISOString().split('T')[0];
        const sortedPlayers = sortPlayersByRoleAndDays(playersData);
        
        // Функция для получения текста роли
        function getRoleText(role) {
            switch(role) {
                case 'gl_admin': return 'ГЛ.Администратор';
                case 'admin': return 'Администратор';
                case 'gl_moderator': return 'ГЛ.Модератор';
                case 'st_moderator': return 'СТ.Модератор';
                case 'moderator': return 'Модератор';
                case 'gl_helper': return 'ГЛ.Хелпер';
                case 'st_helper': return 'СТ.Хелпер';
                case 'helper': return 'Хелпер';
                case 'beta': return 'Бета-тестер';
                default: return null;
            }
        }
        
        // Функция для получения класса роли
        function getRoleClass(role) {
            switch(role) {
                case 'gl_admin': return 'role-gl_admin';
                case 'admin': return 'role-admin';
                case 'gl_moderator': return 'role-gl_moderator';
                case 'st_moderator': return 'role-st_moderator';
                case 'moderator': return 'role-moderator';
                case 'gl_helper': return 'role-gl_helper';
                case 'st_helper': return 'role-st_helper';
                case 'helper': return 'role-helper';
                case 'beta': return 'role-beta';
                default: return null;
            }
        }
        
        let html = '<div class="players-container">';
        sortedPlayers.forEach(player => {
            const daysOnServer = getDaysBetween(player.joinDate, today);
            const roleText = getRoleText(player.role);
            const roleClass = getRoleClass(player.role);
            
            html += `
                <div class="player-card">
                    <div class="player-info">
                        <div class="player-name">${player.name}</div>
                        ${roleText ? `<div class="player-role ${roleClass}">${roleText}</div>` : ''}
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

function renderSkinPage() {
    toggleLeftSectionMobile(false);
    const rightSection = document.querySelector('.right-section');
    if (rightSection) {
        rightSection.innerHTML = `
            <div class="skin-redirect">
                <div class="skin-icon-large">🎨</div>
                <div class="skin-title">Установка скина</div>
                <div class="skin-description">
                    Нажмите на кнопку ниже, чтобы перейти на сайт для загрузки скина.
                    После загрузки скина, введите команду <span class="skin-command">/skin <ваш_ник></span> на сервере.
                </div>
                <a href="https://skinsrestorer.net/upload" class="skin-button" target="_blank">
                    Перейти к установке скина →
                </a>
                <div class="skin-note">
                    💡 Поддерживаются скины Java Edition (64x64 или 128x128)
                </div>
            </div>
        `;
    }
    scrollToTop();
}

// Переключение страниц
function getPageFromURL() {
    const hash = window.location.hash.substring(1);
    const validPages = ['home', 'players', 'rules', 'functions', 'news', 'faq', 'map', 'skin'];
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
    
    if (pageId === 'skin') {
        window.open('https://skinsrestorer.net/upload', '_blank');
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
        if (pageId !== 'map' && pageId !== 'skin') {
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

function setupEffectSwitcher() {
    const buttons = document.querySelectorAll('.effect-option');
    const mobileButtons = document.querySelectorAll('.mobile-effect-option');
    
    function setActiveEffect(effectName) {
        buttons.forEach(btn => {
            if (btn.getAttribute('data-effect') === effectName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        mobileButtons.forEach(btn => {
            if (btn.getAttribute('data-effect') === effectName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        
        if (effectName === 'snow') {
            startSnowEffect();
        } else if (effectName === 'leaves') {
            startLeavesEffect();
        } else if (effectName === 'none') {
            stopCurrentEffect();
        }
    }
    
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.getAttribute('data-effect');
            setActiveEffect(effect);
        });
    });
    
    mobileButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const effect = btn.getAttribute('data-effect');
            setActiveEffect(effect);
        });
    });
    
    setActiveEffect('snow');
}

// Запуск при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    fetchServerStatus();
    setupMobileMenu();
    setupPageSwitching();
    setupEffectSwitcher();
    
    const initialPage = getPageFromURL();
    updateActivePage(initialPage);
    switch(initialPage) {
        case 'home': renderHomePage(); break;
        case 'players': renderPlayersPage(); break;
        case 'rules': renderRulesPage(); break;
        case 'functions': renderFunctionsPage(); break;
        case 'news': renderAllNewsPage(); break;
        case 'faq': renderFaqPage(); break;
        case 'skin': 
            window.open('https://skinsrestorer.net/upload', '_blank');
            window.location.hash = 'home';
            renderHomePage();
            break;
        default: renderHomePage();
    }
    
    window.addEventListener('resize', () => {
        const currentPage = getPageFromURL();
        if (currentPage === 'home') {
            toggleLeftSectionMobile(true);
        } else if (currentPage !== 'map' && currentPage !== 'skin') {
            toggleLeftSectionMobile(false);
        }
    });
    
    setInterval(fetchServerStatus, 30000);
});
