// Инициализация Telegram WebApp и переменных для хранения данных
let tg;
try {
    tg = window.Telegram.WebApp;
    if (tg) {
        tg.expand();
        console.log("Telegram WebApp инициализирован");
        
        // Проверяем доступность initData
        if (!tg.initData || tg.initData.length < 10) {
            console.warn("Отсутствует initData или он недействителен");
        } else {
            console.log("initData доступен, длина:", tg.initData.length);
        }
    } else {
        console.error("Telegram WebApp недоступен");
    }
} catch (e) {
    console.error("Ошибка при инициализации Telegram WebApp:", e);
    tg = null;
}

// Переменные для хранения данных пользователя
let userData = {
    id: null,
    name: "Гость",
    username: "NoUsername",
    balance: 0,
    prizes: []
};

// Инициализация приложения
document.addEventListener("DOMContentLoaded", function() {
    // Создаем колесо
    createWheel();
    
    // Настраиваем обработчики вкладок
    setupTabs();
    
    // Настраиваем кнопку вращения
    const spinButton = document.getElementById('spin-btn');
    if (spinButton) {
        spinButton.addEventListener('click', spinWheel);
    } else {
        console.error("Кнопка вращения не найдена в DOM");
    }
    
    // Получаем данные пользователя
    getUserDataFromTelegram();
    
    // Пробуем получить данные через API только если работаем в Telegram
    if (tg && tg.initData && tg.initData.length > 10) {
        tryToGetProfileFromBotAPI();
    } else {
        console.log("Режим тестирования, не вызываем API профиля");
        // В тестовом режиме можем задать тестовые данные
        if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const user = tg.initDataUnsafe.user;
            userData.id = user.id;
            userData.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
            userData.username = user.username || "NoUsername";
            
            // Добавляем тестовые призы
            userData.prizes = [
                {giftId: 1, giftName: "Мишка", value: 10, date: new Date().toISOString()},
                {giftId: 2, giftName: "Сердечко", value: 5, date: new Date().toISOString()}
            ];
            
            // Обновляем UI
            updateProfileUI();
        }
    }
});

// Функция для настройки переключения вкладок
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    if (!tabButtons.length || !tabContents.length) {
        console.error("Не найдены элементы вкладок в DOM");
        return;
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Убираем класс active у всех кнопок и контента
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Добавляем класс active нужным элементам
            this.classList.add('active');
            document.getElementById(tabName + '-tab').classList.add('active');
            
            // Обновляем профиль при переключении на его вкладку
            if (tabName === 'profile') {
                updateProfileUI();
            }
        });
    });
}

// Функция для получения данных пользователя из Telegram
function getUserDataFromTelegram() {
    console.log("Получение данных пользователя из Telegram...");
    
    if (!tg || !tg.initDataUnsafe || !tg.initDataUnsafe.user) {
        console.warn("Данные пользователя из Telegram недоступны");
        return;
    }
    
    const user = tg.initDataUnsafe.user;
    
    userData.id = user.id;
    userData.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
    userData.username = user.username || "NoUsername";
    
    // Обновляем интерфейс
    updateProfileUI();
    
    // Если у пользователя есть ID, запрашиваем дополнительные данные с сервера
    if (userData.id) {
        // Запрашиваем данные с сервера
        fetch(`/api/user-data?userId=${userData.id}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP Error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Получены данные пользователя с сервера:", data);
                
                // Обновляем баланс и призы
                userData.balance = data.balance;
                userData.prizes = data.prizes;
                
                // Обновляем интерфейс
                updateProfileUI();
            })
            .catch(error => {
                console.error("Ошибка при получении данных пользователя:", error);
            });
    }
}

// Функция для попытки получения профиля через API бота
function tryToGetProfileFromBotAPI() {
    console.log("Попытка получения профиля через API бота...");
    console.log("tg доступен:", !!tg);
    console.log("initData доступен:", !!tg.initData);
    console.log("initData содержит:", tg.initData ? tg.initData.substring(0, 50) + "..." : "пусто");
    
    // Если нет доступа к Telegram WebApp, не делаем запрос
    if (!tg) {
        console.error("Telegram WebApp не доступен");
        return;
    }
    
    // ИСПРАВЛЕНИЕ: Проверяем не только наличие tg.initData, но и что оно не пустое
    if (!tg.initData || tg.initData.length < 10) {
        console.error("initData недоступен или пуст");
        console.error("Возможно, вы открыли приложение не через Telegram");
        return;
    }
    
    console.log("Отправка запроса на получение профиля с initData");
    
    fetch('/api/telegram/get-profile', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            init_data: tg.initData
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ошибка: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Данные профиля от API бота:", data);
        
        // Обновляем данные пользователя
        if (data.telegram) {
            if (data.telegram.id) {
                userData.id = data.telegram.id;
            }
            
            if (data.telegram.first_name) {
                userData.name = data.telegram.first_name + 
                    (data.telegram.last_name ? ' ' + data.telegram.last_name : '');
            }
            
            if (data.telegram.username) {
                userData.username = data.telegram.username;
            }
            
            if (data.telegram.photo_url) {
                const avatar = document.getElementById('user-avatar');
                if (avatar) {
                    avatar.src = data.telegram.photo_url;
                    console.log("Установлен аватар из API бота:", data.telegram.photo_url);
                }
            }
            
            // Обновляем UI
            updateProfileUI();
        }
        
        // Если пришли данные приложения, обновляем баланс и призы
        if (data.app_data) {
            userData.balance = data.app_data.balance;
            
            if (Array.isArray(data.app_data.prizes)) {
                userData.prizes = data.app_data.prizes;
            }
            
            // Обновляем UI
            updateProfileUI();
        }
    })
    .catch(error => {
        console.error("Ошибка при получении профиля через API бота:", error);
        // Показываем сообщение пользователю для отладки
        if (tg.showAlert) {
            tg.showAlert("Ошибка получения данных: " + error.message + 
                         "\n\nПроверьте консоль для деталей.");
        }
    });
}

// Функция для отдельного запроса аватара - улучшенная версия
function tryGetAvatarSeparately() {
    const tg = window.Telegram.WebApp;
    
    if (!tg || !tg.initData) {
        console.warn("Невозможно получить аватар: initData недоступен");
        return;
    }
    
    console.log("Пытаемся получить аватар отдельным запросом...");
    
    fetch('/api/telegram/get-avatar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            init_data: tg.initData
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Ответ API аватара:", data);
        
        if (data.photo_url) {
            const avatarElement = document.getElementById('user-avatar');
            if (avatarElement) {
                avatarElement.src = data.photo_url;
                avatarElement.onerror = function() {
                    console.warn("Ошибка загрузки аватара, создаем placeholder");
                    createInitialsAvatar(document.querySelector('.avatar-container'));
                };
                console.log("Установлен аватар из отдельного запроса:", data.photo_url);
            }
        } else {
            // Если нет аватара, создаем placeholder
            createInitialsAvatar(document.querySelector('.avatar-container'));
        }
    })
    .catch(error => {
        console.error("Ошибка при получении аватара:", error);
        createInitialsAvatar(document.querySelector('.avatar-container'));
    });
}

// Обновленная функция обновления UI профиля
function updateProfileUI() {
    console.log("Обновление UI профиля...");
    
    // Обновляем имя пользователя
    const nameElement = document.getElementById('user-name');
    if (nameElement) {
        nameElement.textContent = userData.name;
    } else {
        console.error("Элемент user-name не найден в DOM");
    }
    
    // Обновляем username
    const usernameElement = document.getElementById('user-username');
    if (usernameElement) {
        usernameElement.textContent = userData.username ? '@' + userData.username : '';
    }
    
    // Обновляем баланс
    const balanceElement = document.getElementById('user-stars');
    if (balanceElement) {
        balanceElement.textContent = userData.balance;
    } else {
        console.error("Элемент user-stars не найден в DOM");
    }
    
    // Обновляем аватар
    updateAvatar();
    
    // Обновляем историю призов
    updatePrizesHistory();
}

// Функция для обновления аватара
function updateAvatar() {
    const avatarElement = document.getElementById('user-avatar');
    if (!avatarElement) {
        console.error("Элемент user-avatar не найден в DOM");
        return;
    }
    
    // Если есть аватар в данных пользователя
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user && tg.initDataUnsafe.user.photo_url) {
        avatarElement.src = tg.initDataUnsafe.user.photo_url;
        console.log("Установлен аватар из данных Telegram");
    } else {
        // Если аватара нет, используем заглушку
        avatarElement.src = "images/default-avatar.png";
        console.log("Установлен аватар по умолчанию");
    }
    
    // Обработчик ошибки загрузки аватара
    avatarElement.onerror = function() {
        this.src = "images/default-avatar.png";
        console.warn("Ошибка загрузки аватара, используем заглушку");
    };
}

// Функция для обновления истории призов
function updatePrizesHistory() {
    const prizesList = document.getElementById('prizes-list');
    if (!prizesList) {
        console.error("Элемент prizes-list не найден в DOM");
        return;
    }
    
    // Очищаем список
    prizesList.innerHTML = '';
    
    // Если нет призов, показываем сообщение
    if (!userData.prizes || userData.prizes.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'У вас пока нет выигрышей';
        prizesList.appendChild(emptyItem);
        return;
    }
    
    // Добавляем призы в список
    userData.prizes.forEach(prize => {
        const item = document.createElement('li');
        
        // Находим информацию о подарке в списке gifts
        const giftInfo = gifts.find(g => g.id === prize.giftId) || 
                        { image: "🎁", color: "#ccc" };
        
        // Создаем содержимое элемента списка
        item.innerHTML = `
            <span class="prize-list-emoji" style="color: ${giftInfo.color}">
                ${giftInfo.image}
            </span>
            <div class="prize-info">
                <div>${prize.giftName}</div>
                <div class="prize-date">${formatDate(prize.date)}</div>
            </div>
            <div class="prize-stars">+${prize.value}</div>
        `;
        
        prizesList.appendChild(item);
    });
}

// Функция для форматирования даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
        day: '2-digit', 
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
