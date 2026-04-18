// snow.js - эффект падающих снежинок (эмодзи)
class SnowEffect {
    constructor() {
        this.container = null;
        this.snowflakes = [];
        this.animationId = null;
        this.isActive = false;
    }

    init() {
        // Создаём контейнер для снежинок
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '0';
        this.container.style.overflow = 'hidden';
        document.body.appendChild(this.container);
        
        this.isActive = true;
        
        this.createSnowflakes(70); // 80 снежинок (чуть меньше, чтобы не перегружать) деволт 80
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {
        // При изменении размера окна ничего не делаем с существующими снежинками
        // Они просто продолжат падать
    }

    createSnowflakes(count) {
        for (let i = 0; i < count; i++) {
            this.snowflakes.push({
                element: null,
                x: Math.random() * 100, // проценты от ширины экрана
                y: Math.random() * 100, // проценты от высоты экрана
                size: Math.random() * 1.2 + 0.8, // размер от 1 до 2.5 (em) деволт 1.5 1
                speedY: Math.random() * 0.4 + 0.2, // скорость падения вниз (процентов в секунду) деволт 0.5 0.3
                speedX: (Math.random() - 0.5) * 0.4, // горизонтальное смещение (процентов в секунду)
                opacity: Math.random() * 0.5 + 0.4, // прозрачность от 0.4 до 0.9
                rotation: Math.random() * 360, // начальный поворот
                rotationSpeed: (Math.random() - 0.5) * 2, // скорость вращения
                swing: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.02 + 0.01
            });
        }
        
        // Создаём DOM-элементы для каждой снежинки
        this.snowflakes.forEach(snowflake => {
            this.createSnowflakeElement(snowflake);
        });
    }
    
    createSnowflakeElement(snowflake) {
        const div = document.createElement('div');
        div.innerHTML = '❄'; // Эмодзи снежинки
        div.style.position = 'absolute';
        div.style.left = `${snowflake.x}%`;
        div.style.top = `${snowflake.y}%`;
        div.style.fontSize = `${snowflake.size}rem`;
        div.style.opacity = snowflake.opacity;
        div.style.color = 'white';
        div.style.textShadow = '0 0 5px rgba(255,255,255,0.5)';
        div.style.transform = `rotate(${snowflake.rotation}deg)`;
        div.style.willChange = 'transform, left, top';
        div.style.userSelect = 'none';
        div.style.pointerEvents = 'none';
        
        this.container.appendChild(div);
        snowflake.element = div;
    }

    updateSnowflake(snowflake) {
        // Обновляем позицию с учётом углов
        let newX = snowflake.x + snowflake.speedX + Math.sin(snowflake.swing) * 0.15;
        let newY = snowflake.y + snowflake.speedY;
        
        // Обновляем поворот
        let newRotation = snowflake.rotation + snowflake.rotationSpeed;
        
        snowflake.swing += snowflake.swingSpeed;
        
        // Если снежинка упала за пределы экрана, возвращаем её наверх
        if (newY > 110) {
            newY = -10;
            newX = Math.random() * 100;
            newRotation = Math.random() * 360;
        }
        
        // Если улетела влево или вправо за пределы
        if (newX < -10) {
            newX = 110;
        }
        if (newX > 110) {
            newX = -10;
        }
        
        snowflake.x = newX;
        snowflake.y = newY;
        snowflake.rotation = newRotation;
        
        // Применяем новые позиции к элементу
        if (snowflake.element) {
            snowflake.element.style.left = `${snowflake.x}%`;
            snowflake.element.style.top = `${snowflake.y}%`;
            snowflake.element.style.transform = `rotate(${snowflake.rotation}deg)`;
        }
    }

    animate() {
        if (!this.isActive) return;
        
        for (let i = 0; i < this.snowflakes.length; i++) {
            this.updateSnowflake(this.snowflakes[i]);
        }
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    stop() {
        this.isActive = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        if (this.container) {
            this.container.remove();
            this.container = null;
        }
        this.snowflakes = [];
    }
}

// Запускаем снег при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const snow = new SnowEffect();
    snow.init();
});