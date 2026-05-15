// leaves.js - эффект падающих листьев
class LeavesEffect {
    constructor() {
        this.container = null;
        this.leaves = [];
        this.animationId = null;
        this.isActive = false;
    }

    init() {
        this.container = document.createElement('div');
        this.container.style.position = 'fixed';
        this.container.style.top = '0';
        this.container.style.left = '0';
        this.container.style.width = '100%';
        this.container.style.height = '100%';
        this.container.style.pointerEvents = 'none';
        this.container.style.zIndex = '-1';
        this.container.style.overflow = 'hidden';
        document.body.appendChild(this.container);
        
        this.isActive = true;
        
        this.createLeaves(35); // 70
        
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }

    resize() {}

    createLeaves(count) {
        const leafEmojis = ['🍁', '🍂'];
        
        for (let i = 0; i < count; i++) {
            this.leaves.push({
                element: null,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 1.2 + 0.8,
                speedY: Math.random() * 0.4 + 0.2,
                speedX: (Math.random() - 0.5) * 0.4,
                opacity: Math.random() * 0.5 + 0.4,
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 2,
                swing: Math.random() * Math.PI * 2,
                swingSpeed: Math.random() * 0.02 + 0.01,
                emoji: leafEmojis[Math.floor(Math.random() * leafEmojis.length)]
            });
        }
        
        this.leaves.forEach(leaf => {
            this.createLeafElement(leaf);
        });
    }
    
    createLeafElement(leaf) {
        const div = document.createElement('div');
        div.innerHTML = leaf.emoji;
        div.style.position = 'absolute';
        div.style.left = `${leaf.x}%`;
        div.style.top = `${leaf.y}%`;
        div.style.fontSize = `${leaf.size}rem`;
        div.style.opacity = leaf.opacity;
        div.style.color = '#FF8C00';
        div.style.textShadow = '0 0 3px rgba(255,140,0,0.3)';
        div.style.transform = `rotate(${leaf.rotation}deg)`;
        div.style.willChange = 'transform, left, top';
        div.style.userSelect = 'none';
        div.style.pointerEvents = 'none';
        
        this.container.appendChild(div);
        leaf.element = div;
    }

    updateLeaf(leaf) {
        let newX = leaf.x + leaf.speedX + Math.sin(leaf.swing) * 0.15;
        let newY = leaf.y + leaf.speedY;
        let newRotation = leaf.rotation + leaf.rotationSpeed;
        
        leaf.swing += leaf.swingSpeed;
        
        if (newY > 110) {
            newY = -10;
            newX = Math.random() * 100;
            newRotation = Math.random() * 360;
        }
        
        if (newX < -10) {
            newX = 110;
        }
        if (newX > 110) {
            newX = -10;
        }
        
        leaf.x = newX;
        leaf.y = newY;
        leaf.rotation = newRotation;
        
        if (leaf.element) {
            leaf.element.style.left = `${leaf.x}%`;
            leaf.element.style.top = `${leaf.y}%`;
            leaf.element.style.transform = `rotate(${leaf.rotation}deg)`;
        }
    }

    animate() {
        if (!this.isActive) return;
        
        for (let i = 0; i < this.leaves.length; i++) {
            this.updateLeaf(this.leaves[i]);
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
        this.leaves = [];
    }
}