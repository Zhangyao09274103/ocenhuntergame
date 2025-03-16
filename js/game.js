class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'menu'; // menu, playing, gameOver
        this.score = 0;
        this.level = 1;
        this.keys = {};
        
        // Initialize game objects
        this.player = new Player(this.canvas.width/2, this.canvas.height/2, this.level);
        this.creatureManager = new CreatureManager();
        this.particleSystem = new ParticleSystem();
        this.soundManager = new SoundManager();
        
        // Initialize creatures for level 1
        this.creatureManager.spawnCreatures(this.level);
        
        // Background elements
        this.bubbles = [];
        this.seaweed = this.createSeaweed();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start the game loop
        this.lastTime = 0;
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
    
    createSeaweed() {
        const seaweed = [];
        for (let i = 0; i < 8; i++) {
            seaweed.push({
                x: Math.random() * this.canvas.width,
                segments: 8,
                height: 100 + Math.random() * 100,
                width: 20 + Math.random() * 10,
                phase: Math.random() * Math.PI * 2,
                speed: 0.02 + Math.random() * 0.02
            });
        }
        return seaweed;
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            if (e.code === 'Space') {
                if (this.gameState === 'menu') {
                    this.startGame();
                } else if (this.gameState === 'gameOver') {
                    this.resetGame();
                }
            } else if (e.code === 'KeyM') {
                this.soundManager.toggleMute();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Add mute button
        const muteButton = document.createElement('button');
        muteButton.textContent = '🔊';
        muteButton.style.position = 'absolute';
        muteButton.style.top = '10px';
        muteButton.style.right = '10px';
        muteButton.style.padding = '10px';
        muteButton.style.background = 'rgba(255, 255, 255, 0.2)';
        muteButton.style.border = 'none';
        muteButton.style.borderRadius = '5px';
        muteButton.style.color = 'white';
        muteButton.style.cursor = 'pointer';
        muteButton.onclick = () => {
            this.soundManager.toggleMute();
            muteButton.textContent = this.soundManager.isMuted ? '🔇' : '🔊';
        };
        document.getElementById('gameContainer').appendChild(muteButton);
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('startMenu').style.display = 'none';
        document.getElementById('tutorial').style.display = 'block';
        this.soundManager.startBackgroundMusic();
    }
    
    resetGame() {
        this.score = 0;
        this.level = 1;
        this.player = new Player(this.canvas.width/2, this.canvas.height/2, this.level);
        this.creatureManager.spawnCreatures(this.level);
        this.gameState = 'playing';
        document.getElementById('gameOverMenu').style.display = 'none';
        document.getElementById('tutorial').style.display = 'block';
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOverMenu').style.display = 'block';
        document.getElementById('tutorial').style.display = 'none';
        this.soundManager.playSound('hurt', 0.5);
    }
    
    checkCollisions() {
        // Check collisions with prey
        for (let i = this.creatureManager.prey.length - 1; i >= 0; i--) {
            const prey = this.creatureManager.prey[i];
            if (this.checkCollision(this.player.getBounds(), prey.getBounds())) {
                if (this.player.canEat(prey.size)) {
                    this.score += 10;
                    this.player.grow();
                    this.particleSystem.addEatEffect(prey.x, prey.y, '#FFFF00');
                    this.soundManager.playSound('eat', 0.4);
                    this.creatureManager.prey.splice(i, 1);
                }
            }
        }
        
        // Check collisions with predators
        for (let i = this.creatureManager.predators.length - 1; i >= 0; i--) {
            const predator = this.creatureManager.predators[i];
            if (this.checkCollision(this.player.getBounds(), predator.getBounds())) {
                if (this.player.canBeEaten(predator.size)) {
                    this.gameOver();
                    return;
                } else if (this.player.canEat(predator.size)) {
                    this.score += 50;
                    this.player.grow();
                    this.particleSystem.addEatEffect(predator.x, predator.y, '#FF0000');
                    this.soundManager.playSound('eat', 0.6);
                    this.creatureManager.predators.splice(i, 1);
                }
            }
        }
        
        // Check for level completion
        if (this.creatureManager.prey.length === 0) {
            if (this.level < 4) {
                this.level++;
                this.player = new Player(this.canvas.width/2, this.canvas.height/2, this.level);
                this.creatureManager.spawnCreatures(this.level);
                this.particleSystem.addLevelUpEffect(this.canvas.width/2, this.canvas.height/2);
                this.soundManager.playSound('levelUp', 0.5);
            }
        }
    }
    
    checkCollision(bounds1, bounds2) {
        return bounds1.x < bounds2.x + bounds2.width &&
               bounds1.x + bounds1.width > bounds2.x &&
               bounds1.y < bounds2.y + bounds2.height &&
               bounds1.y + bounds1.height > bounds2.y;
    }
    
    update(deltaTime) {
        if (this.gameState === 'playing') {
            // Update player
            this.player.move(this.keys);
            
            // Update creatures
            this.creatureManager.update({x: this.player.x, y: this.player.y});
            
            // Update particles
            this.particleSystem.update();
            
            // Update seaweed
            this.seaweed.forEach(plant => {
                plant.phase += plant.speed;
            });
            
            // Check collisions
            this.checkCollisions();
            
            // Add ambient bubbles
            if (Math.random() < 0.05) {
                const x = Math.random() * this.canvas.width;
                this.particleSystem.addBubbleEffect(x, this.canvas.height);
                if (Math.random() < 0.2) { // 20% chance to play bubble sound
                    this.soundManager.playSound('bubble', 0.1);
                }
            }
            
            // Update UI
            this.updateUI();
        }
    }
    
    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('levelDisplay').textContent = this.level;
        document.getElementById('sizeDisplay').textContent = this.player.size;
    }
    
    drawBackground() {
        // Create gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#001830');
        gradient.addColorStop(1, '#006994');
        
        // Fill background
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw seaweed
        this.seaweed.forEach(plant => {
            this.drawSeaweed(plant);
        });
    }
    
    drawSeaweed(plant) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#0D5B3C';
        this.ctx.lineWidth = plant.width;
        this.ctx.lineCap = 'round';
        
        const segmentHeight = plant.height / plant.segments;
        let lastX = plant.x;
        let lastY = this.canvas.height;
        
        for (let i = 0; i <= plant.segments; i++) {
            const y = this.canvas.height - i * segmentHeight;
            const waveOffset = Math.sin(plant.phase + i * 0.5) * 20;
            const x = plant.x + waveOffset;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.quadraticCurveTo(lastX, lastY, x, y);
            }
            
            lastX = x;
            lastY = y;
        }
        
        this.ctx.stroke();
    }
    
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.drawBackground();
        
        // Draw game objects
        this.creatureManager.draw(this.ctx);
        this.player.draw(this.ctx);
        this.particleSystem.draw(this.ctx);
        
        // Show appropriate menu
        if (this.gameState === 'menu') {
            document.getElementById('startMenu').style.display = 'block';
        }
    }
    
    gameLoop(currentTime) {
        // Calculate delta time
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update and draw
        this.update(deltaTime);
        this.draw();
        
        // Continue game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 