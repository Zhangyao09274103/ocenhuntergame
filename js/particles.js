class Particle {
    constructor(x, y, color, size, speed, type = 'circle') {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.speed = speed;
        this.type = type;
        this.alpha = 1;
        this.fadeSpeed = 0.02 + Math.random() * 0.02;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
        this.velocityX = (Math.random() - 0.5) * 4;
        this.velocityY = -speed + (Math.random() - 0.5) * 2;
        this.gravity = 0.05;
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.velocityY += this.gravity;
        this.angle += this.rotationSpeed;
        this.wobble += this.wobbleSpeed;
        this.alpha = Math.max(0, this.alpha - this.fadeSpeed);
        return this.alpha > 0;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = this.color;
        
        switch(this.type) {
            case 'bubble':
                this.drawBubble(ctx);
                break;
            case 'star':
                this.drawStar(ctx);
                break;
            case 'sparkle':
                this.drawSparkle(ctx);
                break;
            default:
                this.drawCircle(ctx);
        }
        
        ctx.restore();
    }

    drawBubble(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.5})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha})`;
        ctx.stroke();
        
        // Add shine effect
        const gradient = ctx.createLinearGradient(
            this.x - this.size, this.y - this.size,
            this.x + this.size, this.y + this.size
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${this.alpha * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, 0)`);
        
        ctx.beginPath();
        ctx.arc(
            this.x - this.size * 0.2,
            this.y - this.size * 0.2,
            this.size * 0.4,
            0, Math.PI * 2
        );
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    drawStar(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            ctx.lineTo(
                Math.cos(i * 4 * Math.PI / 5) * this.size,
                Math.sin(i * 4 * Math.PI / 5) * this.size
            );
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    drawSparkle(ctx) {
        const flickerAlpha = (Math.sin(this.wobble) + 1) * 0.5 * this.alpha;
        ctx.globalAlpha = flickerAlpha;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw cross shape
        ctx.beginPath();
        ctx.moveTo(-this.size, 0);
        ctx.lineTo(this.size, 0);
        ctx.moveTo(0, -this.size);
        ctx.lineTo(0, this.size);
        ctx.stroke();
        
        // Draw diagonal lines
        ctx.rotate(Math.PI / 4);
        ctx.beginPath();
        ctx.moveTo(-this.size * 0.7, 0);
        ctx.lineTo(this.size * 0.7, 0);
        ctx.moveTo(0, -this.size * 0.7);
        ctx.lineTo(0, this.size * 0.7);
        ctx.stroke();
        
        ctx.restore();
    }

    drawCircle(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

class ParticleSystem {
    constructor() {
        this.particles = [];
    }

    addParticles(x, y, color, count = 5, type = 'circle') {
        for (let i = 0; i < count; i++) {
            const size = 2 + Math.random() * 4;
            const speed = 1 + Math.random() * 2;
            this.particles.push(new Particle(x, y, color, size, speed, type));
        }
    }

    addEatEffect(x, y, color) {
        // Add sparkles
        this.addParticles(x, y, color, 3, 'sparkle');
        // Add stars
        this.addParticles(x, y, color, 2, 'star');
        // Add regular particles
        this.addParticles(x, y, color, 5, 'circle');
    }

    addBubbleEffect(x, y) {
        this.addParticles(x, y, '#FFFFFF', 1, 'bubble');
    }

    addLevelUpEffect(x, y) {
        const colors = ['#FFD700', '#FFA500', '#FF4500'];
        colors.forEach(color => {
            this.addParticles(x, y, color, 5, 'star');
            this.addParticles(x, y, color, 5, 'sparkle');
        });
    }

    update() {
        this.particles = this.particles.filter(p => p.update());
    }

    draw(ctx) {
        this.particles.forEach(p => p.draw(ctx));
    }
} 