class Creature {
    constructor(x, y, size, speed, color, isPredator = false) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.isPredator = isPredator;
        this.direction = {
            x: Math.random() * 2 - 1,
            y: Math.random() * 2 - 1
        };
        this.normalizeDirection();
        this.facingRight = this.direction.x > 0;
    }

    normalizeDirection() {
        const length = Math.sqrt(this.direction.x * this.direction.x + this.direction.y * this.direction.y);
        if (length !== 0) {
            this.direction.x /= length;
            this.direction.y /= length;
        }
    }

    update(playerPos = null) {
        if (this.isPredator && playerPos) {
            // Calculate direction to player
            const dx = playerPos.x - this.x;
            const dy = playerPos.y - this.y;
            const distanceToPlayer = Math.sqrt(dx * dx + dy * dy);

            // Chase player if within range
            if (distanceToPlayer < 300) {
                this.direction.x = dx / distanceToPlayer;
                this.direction.y = dy / distanceToPlayer;
            }
        } else if (Math.random() < 0.02) { // 2% chance to change direction
            this.direction.x = Math.random() * 2 - 1;
            this.direction.y = Math.random() * 2 - 1;
            this.normalizeDirection();
        }

        // Update facing direction
        if (this.direction.x !== 0) {
            this.facingRight = this.direction.x > 0;
        }

        // Update position
        this.x += this.direction.x * this.speed;
        this.y += this.direction.y * this.speed;

        // Wrap around screen edges
        if (this.x < -this.size) this.x = 1024 + this.size;
        if (this.x > 1024 + this.size) this.x = -this.size;
        if (this.y < -this.size) this.y = 768 + this.size;
        if (this.y > 768 + this.size) this.y = -this.size;
    }

    draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;

        // Draw the creature body
        ctx.beginPath();
        if (this.isPredator) {
            // Predator shape (more aggressive)
            if (this.facingRight) {
                ctx.moveTo(this.x - this.size/2, this.y - this.size/3);
                ctx.lineTo(this.x + this.size/2, this.y);
                ctx.lineTo(this.x - this.size/2, this.y + this.size/3);
                ctx.lineTo(this.x - this.size/4, this.y);
            } else {
                ctx.moveTo(this.x + this.size/2, this.y - this.size/3);
                ctx.lineTo(this.x - this.size/2, this.y);
                ctx.lineTo(this.x + this.size/2, this.y + this.size/3);
                ctx.lineTo(this.x + this.size/4, this.y);
            }
        } else {
            // Prey shape (rounder)
            if (this.facingRight) {
                ctx.ellipse(this.x, this.y, this.size/2, this.size/3, 0, 0, Math.PI * 2);
            } else {
                ctx.ellipse(this.x, this.y, this.size/2, this.size/3, 0, 0, Math.PI * 2);
            }
        }
        ctx.closePath();
        ctx.fill();

        // Draw eye
        ctx.fillStyle = 'white';
        const eyeX = this.facingRight ? this.x + this.size/4 : this.x - this.size/4;
        ctx.beginPath();
        ctx.arc(eyeX, this.y - this.size/8, this.size/8, 0, Math.PI * 2);
        ctx.fill();

        // Draw pupil
        ctx.fillStyle = 'black';
        const pupilX = this.facingRight ? eyeX + this.size/16 : eyeX - this.size/16;
        ctx.beginPath();
        ctx.arc(pupilX, this.y - this.size/8, this.size/16, 0, Math.PI * 2);
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

class CreatureManager {
    constructor() {
        this.prey = [];
        this.predators = [];
    }

    spawnCreatures(level) {
        this.prey = [];
        this.predators = [];

        if (level === 1) {  // Small Fish World
            // Spawn plankton (tiny prey)
            for (let i = 0; i < 15; i++) {
                this.spawnPrey(10, 2, '#00FF00');
            }
            // Spawn small fish (prey)
            for (let i = 0; i < 10; i++) {
                this.spawnPrey(15, 3, '#00FFFF');
            }
            // Spawn medium fish (predators)
            for (let i = 0; i < 5; i++) {
                this.spawnPredator(40, 4, '#FF0000');
            }
        } else if (level === 2) {  // Crab's Domain
            // Spawn small fish and shrimp
            for (let i = 0; i < 12; i++) {
                this.spawnPrey(20, 3, '#FFC0CB');
            }
            // Spawn octopus and large crabs
            for (let i = 0; i < 6; i++) {
                this.spawnPredator(45, 3.5, '#800080');
            }
        } else if (level === 3) {  // Sea Snake Adventure
            // Spawn medium fish
            for (let i = 0; i < 8; i++) {
                this.spawnPrey(25, 4, '#FFD700');
            }
            // Spawn sharks and moray eels
            for (let i = 0; i < 4; i++) {
                this.spawnPredator(50, 4.5, '#8B4513');
            }
        } else if (level === 4) {  // Shark Territory
            // Spawn large fish and sea snakes
            for (let i = 0; i < 6; i++) {
                this.spawnPrey(30, 4.5, '#4682B4');
            }
            // Spawn killer whales
            for (let i = 0; i < 3; i++) {
                this.spawnPredator(60, 5, '#000000');
            }
        }
    }

    spawnPrey(size, speed, color) {
        const x = Math.random() * 1024;
        const y = Math.random() * 768;
        this.prey.push(new Creature(x, y, size, speed, color, false));
    }

    spawnPredator(size, speed, color) {
        const x = Math.random() * 1024;
        const y = Math.random() * 768;
        this.predators.push(new Creature(x, y, size, speed, color, true));
    }

    update(playerPos) {
        this.prey.forEach(creature => creature.update());
        this.predators.forEach(creature => creature.update(playerPos));
    }

    draw(ctx) {
        [...this.prey, ...this.predators].forEach(creature => creature.draw(ctx));
    }
} 