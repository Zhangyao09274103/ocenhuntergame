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
        this.canvas = document.getElementById('gameCanvas');
    }

    spawnCreatures(level) {
        this.prey = [];
        this.predators = [];
        
        const safeRadius = 200; // Safe zone around player
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;

        // Spawn prey
        const preyCount = 5 + level * 2;
        for (let i = 0; i < preyCount; i++) {
            const size = 20 + Math.random() * 10;
            const position = this.getRandomPosition(false, safeRadius, centerX, centerY);
            this.prey.push(new Creature(
                position.x,
                position.y,
                size,
                '#88FF88'
            ));
        }

        // Spawn predators
        const predatorCount = 2 + level;
        for (let i = 0; i < predatorCount; i++) {
            const size = 50 + level * 10 + Math.random() * 20;
            const position = this.getRandomPosition(true, safeRadius, centerX, centerY);
            this.predators.push(new Creature(
                position.x,
                position.y,
                size,
                '#FF8888'
            ));
        }
    }

    getRandomPosition(isPredator, safeRadius, playerX, playerY) {
        let x, y;
        let isValidPosition = false;
        let attempts = 0;
        const maxAttempts = 50;

        while (!isValidPosition && attempts < maxAttempts) {
            if (isPredator) {
                // For predators, ensure they spawn far from the player
                const angle = Math.random() * Math.PI * 2;
                const minDistance = safeRadius * 1.5; // Minimum distance for predators
                const maxDistance = Math.min(this.canvas.width, this.canvas.height) * 0.4; // Maximum distance
                const distance = minDistance + Math.random() * (maxDistance - minDistance);
                
                x = playerX + Math.cos(angle) * distance;
                y = playerY + Math.sin(angle) * distance;
            } else {
                // For prey, spawn anywhere but maintain some minimum distance between creatures
                x = Math.random() * this.canvas.width;
                y = Math.random() * this.canvas.height;
            }

            // Keep creatures within canvas bounds with padding
            const padding = 50;
            x = Math.max(padding, Math.min(this.canvas.width - padding, x));
            y = Math.max(padding, Math.min(this.canvas.height - padding, y));

            // Check distance from player
            const distToPlayer = Math.sqrt(
                Math.pow(x - playerX, 2) + 
                Math.pow(y - playerY, 2)
            );

            if (isPredator) {
                isValidPosition = distToPlayer >= safeRadius * 1.5;
            } else {
                isValidPosition = distToPlayer >= 100; // Smaller safe radius for prey
            }

            // Check distance from other creatures
            const minCreatureDistance = 50;
            isValidPosition = isValidPosition && this.checkCreatureDistance(x, y, minCreatureDistance);

            attempts++;
        }

        // If we couldn't find a valid position, use the last attempted position
        return { x, y };
    }

    checkCreatureDistance(x, y, minDistance) {
        // Check distance from other prey
        for (const prey of this.prey) {
            const dist = Math.sqrt(
                Math.pow(x - prey.x, 2) + 
                Math.pow(y - prey.y, 2)
            );
            if (dist < minDistance) return false;
        }

        // Check distance from predators
        for (const predator of this.predators) {
            const dist = Math.sqrt(
                Math.pow(x - predator.x, 2) + 
                Math.pow(y - predator.y, 2)
            );
            if (dist < minDistance) return false;
        }

        return true;
    }

    update(playerPosition) {
        // Update prey movement
        this.prey.forEach(prey => {
            // Move away from player if too close
            const distToPlayer = Math.sqrt(
                Math.pow(prey.x - playerPosition.x, 2) + 
                Math.pow(prey.y - playerPosition.y, 2)
            );
            
            if (distToPlayer < 150) {
                // Calculate angle away from player
                const angle = Math.atan2(
                    prey.y - playerPosition.y,
                    prey.x - playerPosition.x
                );
                
                // Move away faster when player is closer
                const speed = (1 - distToPlayer / 150) * 3;
                prey.x += Math.cos(angle) * speed;
                prey.y += Math.sin(angle) * speed;
            }
            
            // Random movement
            prey.x += (Math.random() - 0.5) * 2;
            prey.y += (Math.random() - 0.5) * 2;
            
            // Keep within bounds
            prey.x = Math.max(0, Math.min(this.canvas.width, prey.x));
            prey.y = Math.max(0, Math.min(this.canvas.height, prey.y));
        });

        // Update predator movement
        this.predators.forEach(predator => {
            const distToPlayer = Math.sqrt(
                Math.pow(predator.x - playerPosition.x, 2) + 
                Math.pow(predator.y - playerPosition.y, 2)
            );
            
            // Only chase if within certain range
            if (distToPlayer < 300) {
                // Calculate angle to player
                const angle = Math.atan2(
                    playerPosition.y - predator.y,
                    playerPosition.x - predator.x
                );
                
                // Move towards player, faster when closer
                const speed = (1 - distToPlayer / 300) * 2;
                predator.x += Math.cos(angle) * speed;
                predator.y += Math.sin(angle) * speed;
            } else {
                // Random movement when not chasing
                predator.x += (Math.random() - 0.5);
                predator.y += (Math.random() - 0.5);
            }
            
            // Keep within bounds
            predator.x = Math.max(0, Math.min(this.canvas.width, predator.x));
            predator.y = Math.max(0, Math.min(this.canvas.height, predator.y));
        });
    }

    draw(ctx) {
        // Draw all creatures
        [...this.prey, ...this.predators].forEach(creature => {
            creature.draw(ctx);
        });
    }
} 