// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;
tg.expand();

// Добавим отладочную информацию
console.log("Инициализация WebApp...");
console.log("WebApp данные:", tg.initDataUnsafe);

// Переменные для хранения данных пользователя
let userData = {
    id: null,
    name: "Гость",
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
    document.getElementById('spin-btn').addEventListener('click', spinWheel);
    
    // Получаем данные пользователя
    getUserData();
});

// Функция для настройки вкладок
function setupTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    const contents = document.querySelectorAll('.tab-content');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Удаляем активный класс со всех вкладок и контента
            tabs.forEach(t => t.classList.remove('active'));
            contents.forEach(c => c.classList.remove('active'));
            
            // Добавляем активный класс на выбранную вкладку и соответствующий контент
            tab.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
            
            // Если открываем профиль, обновляем данные
            if (tabName === 'profile') {
                updateUserData();
            }
        });
    });
}

// Функция для получения данных пользователя
function getUserData() {
    console.log("Получение данных пользователя...");
    
    // Получение данных из Telegram WebApp
    const user = tg.initDataUnsafe.user;
    console.log("Данные пользователя из Telegram:", user);
    
    if (user) {
        // Обновляем имя пользователя из Telegram
        userData.id = user.id;
        userData.name = user.first_name + (user.last_name ? ' ' + user.last_name : '');
        console.log("Имя пользователя:", userData.name);
        
        // Для тестирования без сервера
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log("Локальный режим, используем тестовые данные");
            // Если мы в режиме тестирования, используем локальные данные
            updateProfileUI();
            return;
        }
        
        try {
            // Получаем баланс и историю из БД
            fetch(`/api/user-data?userId=${user.id}`)
                .then(response => response.json())
                .then(data => {
                    console.log("Данные с сервера:", data);
                    userData.balance = data.balance;
                    userData.prizes = data.prizes;
                    updateProfileUI();
                })
                .catch(error => {
                    console.error('Error fetching user data:', error);
                    // При ошибке все равно пытаемся отобразить интерфейс
                    updateProfileUI();
                });
        } catch (e) {
            console.error("Ошибка при запросе к серверу:", e);
            updateProfileUI();
        }
    } else {
        console.log("Данные о пользователе не получены, используем значения по умолчанию");
        updateProfileUI();
    }
}

// Функция для обновления UI профиля
function updateProfileUI() {
    console.log("Обновление интерфейса профиля...");
    
    // Обновляем имя пользователя
    const nameElement = document.getElementById('user-name');
    nameElement.textContent = userData.name || "Гость";
    
    // Обновляем баланс
    document.getElementById('user-stars').textContent = userData.balance;
    
    // Получаем данные пользователя из Telegram
    const user = tg.initDataUnsafe.user;
    console.log("Данные пользователя при обновлении UI:", user);
    
    // Обновляем аватар
    const avatarContainer = document.querySelector('.avatar-container');
    
    if (user && user.photo_url) {
        console.log("Аватар URL:", user.photo_url);
        
        // Если photo_url существует, используем его
        const avatarImg = document.getElementById('user-avatar');
        
        // Создаем новый элемент изображения с обработчиками ошибок
        const newAvatar = new Image();
        newAvatar.id = 'user-avatar';
        newAvatar.onload = function() {
            // Если изображение загрузилось успешно, заменяем им текущее
            avatarImg.src = newAvatar.src;
        };
        
        newAvatar.onerror = function() {
            console.log("Ошибка загрузки аватара, используем первую букву имени");
            // Если изображение не загрузилось, создаем блок с первой буквой имени
            createInitialsAvatar(avatarContainer);
        };
        
        // Начинаем загрузку изображения
        newAvatar.src = user.photo_url;
    } else {
        console.log("Photo_url не найден, используем заглушку");
        // Если photo_url отсутствует, показываем первую букву имени
        createInitialsAvatar(avatarContainer);
    }
    
    // Обновляем историю выигрышей
    updatePrizesHistory();
}

// Функция для создания аватара из инициалов
function createInitialsAvatar(container) {
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем элемент с первой буквой имени
    const initialsDiv = document.createElement('div');
    initialsDiv.classList.add('avatar-placeholder');
    
    // Получаем первую букву имени или используем '?'
    const firstLetter = userData.name ? userData.name.charAt(0).toUpperCase() : '?';
    initialsDiv.textContent = firstLetter;
    
    // Добавляем в контейнер
    container.appendChild(initialsDiv);
}

// Функция для обновления истории выигрышей
function updatePrizesHistory() {
    const prizesList = document.getElementById('prizes-list');
    prizesList.innerHTML = ''; // Очищаем список
    
    if (userData.prizes.length === 0) {
        const emptyItem = document.createElement('li');
        emptyItem.textContent = 'Вы еще не выиграли ни одного подарка';
        prizesList.appendChild(emptyItem);
        return;
    }
    
    // Сортируем по дате (сначала новые)
    userData.prizes.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Создаем элементы для каждого выигрыша
    userData.prizes.forEach(prize => {
        const li = document.createElement('li');
        
        const prizeIcon = document.createElement('img');
        prizeIcon.classList.add('prize-icon');
        
        // Ищем соответствующий подарок в списке gifts
        const giftData = gifts.find(g => g.id === prize.giftId) || { 
            image: "images/gifts/default.png", 
            name: prize.name || "Подарок" 
        };
        
        prizeIcon.src = giftData.image;
        prizeIcon.alt = giftData.name;
        // При ошибке загрузки заменяем на стандартную иконку
        prizeIcon.onerror = function() {
            this.src = "images/gifts/default.png";
        };
        
        const prizeInfo = document.createElement('div');
        prizeInfo.classList.add('prize-info');
        
        const prizeName = document.createElement('div');
        prizeName.textContent = giftData.name;
        
        const prizeDate = document.createElement('div');
        prizeDate.classList.add('prize-date');
        prizeDate.textContent = new Date(prize.date).toLocaleDateString();
        
        prizeInfo.appendChild(prizeName);
        prizeInfo.appendChild(prizeDate);
        
        const prizeValue = document.createElement('div');
        prizeValue.classList.add('prize-stars');
        prizeValue.textContent = `+${prize.value}`;
        
        li.appendChild(prizeIcon);
        li.appendChild(prizeInfo);
        li.appendChild(prizeValue);
        
        prizesList.appendChild(li);
    });
}

// Функция для обновления данных пользователя
function updateUserData() {
    getUserData();
}

// Функция для отправки данных на сервер
async function fetchData(url, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    if (data) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        // Показываем уведомление об ошибке
        tg.showAlert('Произошла ошибка при обращении к серверу. Пожалуйста, попробуйте позже.');
        return null;
    }
}

// При ошибке загрузки изображения использовать запасное
function handleImageError(img, defaultSrc) {
    img.onerror = null; // Предотвращаем бесконечную рекурсию
    img.src = defaultSrc;
}

// Добавляем обработчики для изображений
document.querySelectorAll('img').forEach(img => {
    img.onerror = () => handleImageError(img, 'images/default.png');
});

// Обработка ошибок загрузки изображений
document.querySelectorAll('img').forEach(img => {
    img.onerror = function() {
        if (img.src.includes('gifts/')) {
            this.src = "images/gifts/default.png";
        } else if (img.id === 'user-avatar') {
            this.src = "images/default-avatar.png";
        }
    };
});

// Инициируем загрузку изображений заранее
function preloadImages() {
    gifts.forEach(gift => {
        const img = new Image();
        img.src = gift.image;
    });
    
    // Загружаем стандартные изображения
    const defaultImages = ["images/gifts/default.png", "images/default-avatar.png", "images/star.png"];
    defaultImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Вызываем предзагрузку изображений
preloadImages();

// Отправляем данные в Telegram при закрытии приложения
window.addEventListener('beforeunload', () => {
    tg.sendData(JSON.stringify({action: 'close'}));
});

// Настройка основной кнопки Telegram если она доступна
if (tg.MainButton) {
    tg.MainButton.setParams({
        text: 'Закрыть',
        color: '#2196F3'
    });
    
    tg.MainButton.onClick(() => {
        tg.close();
    });
}
