// Можно скопировать этот код в wheel.js, заменив функцию createWheel

function createWheel() {
    const wheel = document.getElementById('fortune-wheel');
    wheel.innerHTML = '';
    
    const sectionCount = gifts.length;
    const sectionAngle = 360 / sectionCount;
    
    // Константная ширина секции в градусах 
    const SECTION_WIDTH = sectionAngle;
    
    for (let i = 0; i < sectionCount; i++) {
        // Каждая секция - это div с фиксированным углом поворота
        const section = document.createElement('div');
        section.className = 'wheel-section';
        section.style.backgroundColor = gifts[i].color;
        
        // Угол поворота - это номер секции * ширина секции
        const rotateAngle = i * SECTION_WIDTH;
        section.style.transform = `rotate(${rotateAngle}deg)`;
        
        // Для каждой секции - эмодзи внутри
        const emoji = document.createElement('span');
        emoji.className = 'emoji-icon';
        emoji.textContent = gifts[i].image;
        
        // Добавляем эмодзи внутрь секции и секцию в колесо
        section.appendChild(emoji);
        wheel.appendChild(section);
    }
    
    console.log(`Создано колесо: ${sectionCount} секций по ${sectionAngle}°`);
}
