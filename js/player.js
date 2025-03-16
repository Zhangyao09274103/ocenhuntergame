class Player {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.size = 30;
        this.speed = 5;
        this.direction = { x: 0, y: 0 };
        this.facingRight = true;
        this.color = this.getLevelColor();
    }

    getLevelColor() {
        const colors = {
            1: '#FFA500', // Orange for small fish
            2: '#FF6B6B', // Red for crab
            3: '#4CAF50', // Green for sea snake
            4: '#2196F3'  // Blue for shark
        };
        return colors[this.level] || colors[1];
    }

    move(keys) {
        // Reset direction
        this.direction.x = 0;
        this.direction.y = 0;

        // Update direction based on key presses
        if (keys.ArrowLeft || keys.KeyA) {
            this.direction.x = -1;
            this.facingRight = false;
        }
        if (keys.ArrowRight || keys.KeyD) {
            this.direction.x = 1;
            this.facingRight = true;
        }
        if (keys.ArrowUp || keys.KeyW) {
            this.direction.y = -1;
        }
        if (keys.ArrowDown || keys.KeyS) {
            this.direction.y = 1;
        }

        // Normalize diagonal movement
        if (this.direction.x !== 0 && this.direction.y !== 0) {
            const length = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
            this.direction.x /= length;
            this.direction.y /= length;
        }

        // Update position
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // Keep player on screen
        this.x = Math.max(this.size/2, Math.min(this.x, 1024 - this.size/2));
        this.y = Math.max(this.size/2, Math.min(this.y, 768 - this.size/2));
    }

    grow() {
        this.size += 2;
        document.getElementById('sizeDisplay').textContent = this.size;
    }

    canEat(otherSize) {
        return this.size > otherSize * 1.2;
    }

    canBeEaten(otherSize) {
        return otherSize > this.size * 1.2;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        
        // Draw the main body
        ctx.beginPath();
        if (this.facingRight) {
            // Draw facing right
            ctx.moveTo(this.x - this.size/2, this.y);
            ctx.lineTo(this.x + this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x + this.size/2, this.y + this.size/3);
        } else {
            // Draw facing left
            ctx.moveTo(this.x + this.size/2, this.y);
            ctx.lineTo(this.x - this.size/2, this.y - this.size/3);
            ctx.lineTo(this.x - this.size/2, this.y + this.size/3);
        }
        ctx.closePath();
        ctx.fill();

        // Draw eye
        ctx.fillStyle = 'white';
        const eyeX = this.facingRight ? this.x + this.size/4 : this.x - this.size/4;
        ctx.beginPath();
        ctx.arc(eyeX, this.y - this.size/6, this.size/10, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw pupil
        ctx.fillStyle = 'black';
        const pupilX = this.facingRight ? eyeX + this.size/20 : eyeX - this.size/20;
        ctx.beginPath();
        ctx.arc(pupilX, this.y - this.size/6, this.size/20, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
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