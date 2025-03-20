class Player {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.size = 20 + (level - 1) * 5;
        this.speed = 5;
        this.level = level;
        this.facingRight = true;
        
        // Animation properties
        this.tailAngle = 0;
        this.tailSpeed = 0.1;
        this.finAngle = 0;
        this.finSpeed = 0.05;
        this.scaleGlow = 0;
        this.glowDirection = 1;
        
        // Color properties
        this.baseColor = this.getRandomFishColor();
        this.finColor = this.getLighterColor(this.baseColor, 30);
        this.tailColor = this.getDarkerColor(this.baseColor, 20);
    }

    getRandomFishColor() {
        const fishColors = [
            '#FF6B6B',  // Coral red
            '#4ECDC4',  // Turquoise
            '#45B7D1',  // Ocean blue
            '#96CEB4',  // Seafoam
            '#FFEEAD',  // Pale yellow
            '#FFD93D',  // Golden
            '#6C5B7B'   // Purple
        ];
        return fishColors[Math.floor(Math.random() * fishColors.length)];
    }

    getLighterColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, ((num >> 16) + amt));
        const G = Math.min(255, (((num >> 8) & 0x00FF) + amt));
        const B = Math.min(255, ((num & 0x0000FF) + amt));
        return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }

    getDarkerColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, ((num >> 16) - amt));
        const G = Math.max(0, (((num >> 8) & 0x00FF) - amt));
        const B = Math.max(0, ((num & 0x0000FF) - amt));
        return '#' + (0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }

    move(keys) {
        let dx = 0;
        let dy = 0;

        if (keys['ArrowLeft'] || keys['KeyA']) dx -= this.speed;
        if (keys['ArrowRight'] || keys['KeyD']) dx += this.speed;
        if (keys['ArrowUp'] || keys['KeyW']) dy -= this.speed;
        if (keys['ArrowDown'] || keys['KeyS']) dy += this.speed;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707; // 1/√2
            dy *= 0.707;
        }

        this.x += dx;
        this.y += dy;

        // Update facing direction
        if (dx !== 0) {
            this.facingRight = dx > 0;
        }

        // Constrain to canvas
        this.x = Math.max(this.size/2, Math.min(1024 - this.size/2, this.x));
        this.y = Math.max(this.size/2, Math.min(768 - this.size/2, this.y));

        // Animate tail and fins based on movement
        const moving = dx !== 0 || dy !== 0;
        const speedMultiplier = moving ? 1 : 0.5;

        this.tailAngle += this.tailSpeed * speedMultiplier;
        this.finAngle += this.finSpeed * speedMultiplier;

        // Update scale glow effect
        this.scaleGlow += 0.02 * this.glowDirection;
        if (this.scaleGlow > 1 || this.scaleGlow < 0) {
            this.glowDirection *= -1;
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Draw body shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(2, 2, this.size/2, this.size/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw tail
        const tailWag = Math.sin(this.tailAngle) * this.size/4;
        ctx.fillStyle = this.tailColor;
        ctx.beginPath();
        ctx.moveTo(-this.size/2, 0);
        ctx.quadraticCurveTo(
            -this.size * 0.8, tailWag,
            -this.size, tailWag
        );
        ctx.quadraticCurveTo(
            -this.size * 0.8, -tailWag,
            -this.size/2, 0
        );
        ctx.fill();

        // Draw body
        const gradient = ctx.createLinearGradient(-this.size/2, -this.size/2, this.size/2, this.size/2);
        gradient.addColorStop(0, this.baseColor);
        gradient.addColorStop(1, this.getDarkerColor(this.baseColor, 20));
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, this.size/2, this.size/3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw scales
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 + this.scaleGlow * 0.1})`;
        for (let i = -2; i <= 2; i++) {
            for (let j = -1; j <= 1; j++) {
                const scaleX = i * this.size/5;
                const scaleY = j * this.size/4;
                const scaleSize = this.size/8;
                
                ctx.beginPath();
                ctx.arc(scaleX, scaleY, scaleSize, 0, Math.PI);
                ctx.fill();
            }
        }

        // Draw dorsal fin
        const dorsalWave = Math.sin(this.finAngle) * this.size/16;
        ctx.fillStyle = this.finColor;
        ctx.beginPath();
        ctx.moveTo(-this.size/4, -this.size/3);
        ctx.quadraticCurveTo(
            0, -this.size/2 - dorsalWave,
            this.size/4, -this.size/3
        );
        ctx.lineTo(-this.size/4, -this.size/3);
        ctx.fill();

        // Draw pectoral fin
        const pectoralWave = Math.cos(this.finAngle) * this.size/8;
        ctx.fillStyle = this.finColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            this.size/4, this.size/3 + pectoralWave,
            0, this.size/2
        );
        ctx.lineTo(0, 0);
        ctx.fill();

        // Draw eye
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.size/4, -this.size/8, this.size/8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.size/4, -this.size/8, this.size/16, 0, Math.PI * 2);
        ctx.fill();

        // Draw gills
        ctx.strokeStyle = this.getDarkerColor(this.baseColor, 30);
        ctx.lineWidth = 2;
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.arc(
                -this.size/4,
                -this.size/6 + i * this.size/8,
                this.size/8,
                -Math.PI/2,
                Math.PI/2
            );
            ctx.stroke();
        }

        ctx.restore();
    }

    grow() {
        this.size += 2;
        // Update colors slightly for variety
        this.baseColor = this.getLighterColor(this.baseColor, 5);
        this.finColor = this.getLighterColor(this.baseColor, 30);
        this.tailColor = this.getDarkerColor(this.baseColor, 20);
    }

    canEat(otherSize) {
        return this.size >= otherSize * 1.2;
    }

    canBeEaten(otherSize) {
        return otherSize >= this.size * 1.2;
    }

    getBounds() {
        return {
            x: this.x - this.size/2,
            y: this.y - this.size/2,
            width: this.size,
            height: this.size
        };
    }
} 