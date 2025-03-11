// Определение подарков для колеса с эмодзи
const gifts = [
    { id: 1, name: "Мишка", image: "🧸", value: 10, color: "#FFD700", chance: 10 },
    { id: 2, name: "Сердечко", image: "💝", value: 5, color: "#FF6B6B", chance: 15 },
    { id: 3, name: "Подарок", image: "🎁", value: 20, color: "#4CAF50", chance: 8 },
    { id: 4, name: "Роза", image: "🌹", value: 15, color: "#E91E63", chance: 10 },
    { id: 5, name: "Цветы", image: "💐", value: 25, color: "#9C27B0", chance: 7 },
    { id: 6, name: "Шампанское", image: "🍾", value: 30, color: "#00BCD4", chance: 5 },
    { id: 7, name: "Ракета", image: "🚀", value: 50, color: "#3F51B5", chance: 2 },
    { id: 8, name: "Кубок", image: "🏆", value: 40, color: "#FFC107", chance: 3 },
    { id: 9, name: "Алмаз", image: "💎", value: 100, color: "#2196F3", chance: 1 },
    { id: 10, name: "Кольцо", image: "💍", value: 75, color: "#607D8B", chance: 2 }
];

// Полностью переработанная функция создания колеса с равными секциями
function createWheel() {
    const wheel = document.getElementById('fortune-wheel');
    wheel.innerHTML = ''; // Очищаем содержимое
    
    const numberOfSections = gifts.length;
    const anglePerSection = 360 / numberOfSections; // Угол для каждой секции
    
    for (let i = 0; i < numberOfSections; i++) {
        const gift = gifts[i];
        
        // Создаем секцию
        const section = document.createElement('div');
        section.className = 'wheel-section';
        
        // Маскируем секцию, чтобы был виден только сегмент
        // Используем clip-path для создания сектора круга
        const startAngle = i * anglePerSection;
        const endAngle = (i + 1) * anglePerSection;
        
        // Применяем клиновидную форму и цвет
        section.style.clipPath = `conic-gradient(from ${startAngle}deg to ${endAngle}deg, ${gift.color} 0%, ${gift.color} 100%, transparent 100%)`;
        section.style.backgroundColor = gift.color;
        
        // Создаем контейнер для содержимого (эмодзи)
        const content = document.createElement('div');
        content.className = 'section-content';
        
        // Поворачиваем контейнер, чтобы эмодзи были правильно ориентированы
        content.style.transform = `rotate(${startAngle + anglePerSection/2}deg)`;
        
        // Создаем эмодзи
        const emojiSpan = document.createElement('span');
        emojiSpan.className = 'emoji-icon';
        emojiSpan.textContent = gift.image;
        
        // Добавляем все в DOM
        content.appendChild(emojiSpan);
        section.appendChild(content);
        wheel.appendChild(section);
    }
    
    console.log(`Создано колесо с ${numberOfSections} секциями по ${anglePerSection}°`);
}

// Функция для вращения колеса
function spinWheel() {
    const wheel = document.getElementById('fortune-wheel');
    const spinButton = document.getElementById('spin-btn');
    
    // Деактивируем кнопку на время вращения
    spinButton.disabled = true;
    spinButton.textContent = 'Крутится...';
    
    // Выбираем случайный подарок с учетом вероятностей
    const selectedGift = selectRandomGift();
    
    // Вычисляем угол для вращения
    const sectionAngle = 360 / gifts.length;
    const giftIndex = gifts.findIndex(gift => gift.id === selectedGift.id);
    
    // Гарантируем полный прокрут колеса - минимум 5 полных оборотов + позиция
    const minRotations = 5; // Минимальное число полных оборотов
    const maxExtraRotations = 3; // Максимальное дополнительное число оборотов для разнообразия
    const extraRotations = Math.random() * maxExtraRotations;
    const totalRotations = minRotations + extraRotations;
    
    // Целевой угол: полные обороты + позиция нужного сегмента
    const targetAngle = totalRotations * 360 + (giftIndex * sectionAngle);
    
    // Добавляем небольшое случайное смещение в пределах сегмента для реалистичности
    const randomOffset = Math.random() * (sectionAngle * 0.7);
    const finalAngle = targetAngle + randomOffset;
    
    // Применяем вращение
    wheel.style.transition = 'transform 5s cubic-bezier(0.17, 0.67, 0.24, 0.99)';
    wheel.style.transform = `rotate(${finalAngle}deg)`;
    
    // После окончания вращения показываем результат
    setTimeout(() => {
        showResult(selectedGift);
        spinButton.disabled = false;
        spinButton.textContent = 'Крутить колесо';
    }, 5000);
    
    // Отправляем результат на сервер
    sendResult(selectedGift);
}

// Функция для выбора случайного подарка с учетом шансов
function selectRandomGift() {
    // Вычисляем суммарную вероятность
    const totalChance = gifts.reduce((sum, gift) => sum + gift.chance, 0);
    
    // Генерируем случайное число от 0 до суммарной вероятности
    let random = Math.random() * totalChance;
    
    // Находим выбранный подарок
    for (const gift of gifts) {
        if (random < gift.chance) {
            return gift;
        }
        random -= gift.chance;
    }
    
    // Если что-то пошло не так, возвращаем первый подарок
    return gifts[0];
}

// Функция для показа результата с эмодзи
function showResult(gift) {
    const resultContainer = document.getElementById('result-container');
    const prizeImage = document.getElementById('prize-image');
    const prizeName = document.getElementById('prize-name');
    const starsValue = document.getElementById('stars-value');
    
    // Если используем эмодзи, показываем его в большом размере
    if (prizeImage.tagName === 'IMG') {
        // Заменяем элемент img на span с эмодзи
        const parent = prizeImage.parentNode;
        const emojiSpan = document.createElement('span');
        emojiSpan.id = 'prize-image';
        emojiSpan.classList.add('large-emoji');
        emojiSpan.textContent = gift.image;
        parent.replaceChild(emojiSpan, prizeImage);
    } else {
        // Если элемент уже span, просто обновляем его содержимое
        prizeImage.textContent = gift.image;
    }
    
    prizeName.textContent = gift.name;
    starsValue.textContent = gift.value;
    
    resultContainer.style.display = 'flex';
    
    // Обработчик для кнопки "Продолжить"
    document.getElementById('continue-btn').onclick = () => {
        resultContainer.style.display = 'none';
        updateUserData();
    };
}

// Функция для отправки результата на сервер и обновления баланса
function sendResult(gift) {
    // Получаем данные пользователя из Telegram
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    
    if (!user) {
        console.error('Не удалось получить данные пользователя Telegram');
        
        // Даже если не удалось отправить на сервер, обновляем локальный баланс
        userData.balance += gift.value;
        userData.prizes.unshift({
            giftId: gift.id,
            giftName: gift.name,
            value: gift.value,
            date: new Date().toISOString()
        });
        
        // Обновляем UI
        updateProfileUI();
        return;
    }
    
    console.log('Отправка результата на сервер для пользователя:', user.id);
    console.log('Выбранный подарок:', gift);
    
    try {
        fetch('/api/save-result', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId: user.id,
                giftId: gift.id,
                giftValue: gift.value,
                giftName: gift.name
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка HTTP: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Результат успешно сохранен:', data);
            
            // Обновляем локальные данные
            userData.balance += gift.value;
            userData.prizes.unshift({
                giftId: gift.id,
                giftName: gift.name,
                value: gift.value,
                date: new Date().toISOString()
            });
            
            // Обновляем интерфейс после успешного сохранения
            updateProfileUI();
        })
        .catch(error => {
            console.error('Ошибка при сохранении результата:', error);
            
            // При ошибке все равно обновляем локальные данные
            userData.balance += gift.value;
            userData.prizes.unshift({
                giftId: gift.id,
                giftName: gift.name,
                value: gift.value,
                date: new Date().toISOString()
            });
            
            // Обновляем интерфейс
            updateProfileUI();
        });
    } catch (e) {
        console.error('Общая ошибка при отправке результата:', e);
        
        // При ошибке все равно обновляем локальные данные
        userData.balance += gift.value;
        userData.prizes.unshift({
            giftId: gift.id,
            giftName: gift.name,
            value: gift.value,
            date: new Date().toISOString()
        });
        
        // Обновляем интерфейс
        updateProfileUI();
    }
}
