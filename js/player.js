class Player {
    constructor(x, y, level) {
        this.x = x;
        this.y = y;
        this.level = level;
        this.size = 30 + (level - 1) * 10;
        this.speed = 5;
        this.color = '#4FC3F7';
        this.facingRight = true;
        
        // Animation properties
        this.tailAngle = 0;
        this.tailSpeed = 0.1;
        this.finAngle = 0;
        this.finSpeed = 0.05;
        this.bubbleTime = 0;
        this.isMoving = false;
    }

    move(keys) {
        let dx = 0;
        let dy = 0;

        // Handle movement
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

        // Update animation state
        this.isMoving = dx !== 0 || dy !== 0;
        if (this.isMoving) {
            this.tailAngle += this.tailSpeed;
            this.finAngle += this.finSpeed;
        } else {
            // Gentle idle animation
            this.tailAngle += this.tailSpeed * 0.5;
            this.finAngle += this.finSpeed * 0.5;
        }

        // Keep within bounds
        this.x = Math.max(this.size/2, Math.min(1024 - this.size/2, this.x));
        this.y = Math.max(this.size/2, Math.min(768 - this.size/2, this.y));
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Flip if facing left
        if (!this.facingRight) {
            ctx.scale(-1, 1);
        }

        // Draw fish body
        this.drawFishBody(ctx);
        
        // Draw fins and tail with animation
        this.drawFinsAndTail(ctx);
        
        // Draw eyes
        this.drawEyes(ctx);
        
        // Draw gills
        this.drawGills(ctx);
        
        // Draw scales
        this.drawScales(ctx);

        ctx.restore();
    }

    drawFishBody(ctx) {
        // Main body
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.moveTo(-this.size/2, 0);
        
        // Top curve
        ctx.bezierCurveTo(
            -this.size/3, -this.size/3,
            this.size/3, -this.size/3,
            this.size/2, 0
        );
        
        // Bottom curve
        ctx.bezierCurveTo(
            this.size/3, this.size/3,
            -this.size/3, this.size/3,
            -this.size/2, 0
        );
        
        ctx.fill();
        
        // Body gradient
        const gradient = ctx.createLinearGradient(-this.size/2, 0, this.size/2, 0);
        gradient.addColorStop(0, this.color);
        gradient.addColorStop(0.5, this.getLighterColor(this.color));
        gradient.addColorStop(1, this.color);
        ctx.fillStyle = gradient;
        ctx.fill();
    }

    drawFinsAndTail(ctx) {
        // Tail
        ctx.beginPath();
        ctx.fillStyle = this.color;
        const tailWave = Math.sin(this.tailAngle) * (this.isMoving ? 0.3 : 0.15);
        
        ctx.moveTo(-this.size/2, 0);
        ctx.quadraticCurveTo(
            -this.size * 0.8, -this.size/3,
            -this.size * 0.9, -this.size/2 + (tailWave * this.size)
        );
        ctx.quadraticCurveTo(
            -this.size * 0.7, 0,
            -this.size * 0.9, this.size/2 + (tailWave * this.size)
        );
        ctx.quadraticCurveTo(
            -this.size * 0.8, this.size/3,
            -this.size/2, 0
        );
        ctx.fill();

        // Top fin
        ctx.beginPath();
        const finWave = Math.sin(this.finAngle) * 0.1;
        ctx.moveTo(0, -this.size/3);
        ctx.quadraticCurveTo(
            -this.size/6, -this.size/2 - finWave * this.size,
            -this.size/3, -this.size/3
        );
        ctx.fill();

        // Bottom fin
        ctx.beginPath();
        ctx.moveTo(-this.size/6, this.size/3);
        ctx.quadraticCurveTo(
            -this.size/4, this.size/2 + finWave * this.size,
            -this.size/3, this.size/3
        );
        ctx.fill();

        // Side fin
        ctx.beginPath();
        const sideFinWave = Math.cos(this.finAngle) * 0.1;
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(
            -this.size/4, this.size/4 + sideFinWave * this.size,
            -this.size/3, this.size/3
        );
        ctx.fill();
    }

    drawEyes(ctx) {
        // Eye white
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.size/4, -this.size/6, this.size/8, 0, Math.PI * 2);
        ctx.fill();

        // Pupil
        ctx.beginPath();
        ctx.fillStyle = 'black';
        ctx.arc(this.size/4 + this.size/16, -this.size/6, this.size/16, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.beginPath();
        ctx.fillStyle = 'white';
        ctx.arc(this.size/4 + this.size/16, -this.size/6 - this.size/32, this.size/32, 0, Math.PI * 2);
        ctx.fill();
    }

    drawGills(ctx) {
        ctx.strokeStyle = this.getDarkerColor(this.color);
        ctx.lineWidth = 2;
        
        // Draw three gill lines
        for (let i = 0; i < 3; i++) {
            ctx.beginPath();
            ctx.moveTo(-this.size/6 + (i * this.size/12), -this.size/4);
            ctx.quadraticCurveTo(
                -this.size/6 + (i * this.size/12) - this.size/12,
                0,
                -this.size/6 + (i * this.size/12),
                this.size/4
            );
            ctx.stroke();
        }
    }

    drawScales(ctx) {
        ctx.strokeStyle = this.getDarkerColor(this.color);
        ctx.lineWidth = 1;
        
        // Draw scale pattern
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 4; col++) {
                ctx.beginPath();
                const x = -this.size/3 + (col * this.size/6);
                const y = -this.size/4 + (row * this.size/6);
                ctx.arc(x, y, this.size/12, 0, Math.PI);
                ctx.stroke();
            }
        }
    }

    getLighterColor(color) {
        const r = parseInt(color.substr(1,2), 16);
        const g = parseInt(color.substr(3,2), 16);
        const b = parseInt(color.substr(5,2), 16);
        
        return `rgba(${r + 40}, ${g + 40}, ${b + 40}, 0.8)`;
    }

    getDarkerColor(color) {
        const r = parseInt(color.substr(1,2), 16);
        const g = parseInt(color.substr(3,2), 16);
        const b = parseInt(color.substr(5,2), 16);
        
        return `rgb(${Math.max(0, r - 40)}, ${Math.max(0, g - 40)}, ${Math.max(0, b - 40)})`;
    }

    grow() {
        this.size += 5;
    }

    canEat(otherSize) {
        return this.size > otherSize * 1.2;
    }

    canBeEaten(otherSize) {
        return otherSize > this.size * 1.2;
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