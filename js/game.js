class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameState = 'loading'; // loading, menu, playing, paused, gameOver
        this.score = 0;
        this.level = 1;
        this.keys = {};
        
        // Initialize managers
        this.soundManager = new SoundManager();
        this.achievementManager = new AchievementManager(this);
        
        // Setup loading screen
        this.loadingProgress = 0;
        this.assetsToLoad = ['sounds', 'images'];
        this.loadedAssets = 0;
        
        // Load assets
        this.loadAssets().then(() => {
            // Initialize game objects
            this.player = new Player(this.canvas.width/2, this.canvas.height/2, this.level);
            this.creatureManager = new CreatureManager();
            this.particleSystem = new ParticleSystem();
            
            // Initialize creatures for level 1
            this.creatureManager.spawnCreatures(this.level);
            
            // Background elements
            this.bubbles = [];
            this.seaweed = this.createSeaweed();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Start the game loop
            this.lastTime = 0;
            this.deltaTime = 0;
            this.gameState = 'menu';
            requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
        });
    }
    
    async loadAssets() {
        const updateProgress = () => {
            this.loadedAssets++;
            this.loadingProgress = (this.loadedAssets / this.assetsToLoad.length) * 100;
            document.querySelector('.loading-progress').style.width = this.loadingProgress + '%';
        };

        // Show loading screen
        document.getElementById('loadingScreen').style.display = 'flex';
        
        // Load sounds
        await this.soundManager.loadSounds();
        updateProgress();
        
        // Load images (you would implement this based on your image loading system)
        // For now, we'll simulate image loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        updateProgress();
        
        // Hide loading screen
        document.getElementById('loadingScreen').style.display = 'none';
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
                document.getElementById('muteButton').textContent = 
                    this.soundManager.isMuted ? '🔇' : '🔊';
            } else if (e.code === 'KeyP') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });

        // Button controls
        document.getElementById('muteButton').onclick = () => {
            this.soundManager.toggleMute();
            document.getElementById('muteButton').textContent = 
                this.soundManager.isMuted ? '🔇' : '🔊';
        };

        document.getElementById('statsButton').onclick = () => {
            const statsPanel = document.getElementById('statsPanel');
            statsPanel.style.display = 
                statsPanel.style.display === 'none' ? 'block' : 'none';
        };

        document.getElementById('pauseButton').onclick = () => {
            this.togglePause();
        };
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseButton').textContent = '▶️';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseButton').textContent = '⏸️';
        }
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
        this.player = new Player(this.canvas.width/2, this.canvas.height/2, 1);
        this.player.speed = 5; // Reset speed to initial value
        
        // Clear and reinitialize creatures
        this.creatureManager.prey = [];
        this.creatureManager.predators = [];
        
        // Add initial creatures
        for (let i = 0; i < 5; i++) {
            this.addNewCreatures();
        }
        this.addNewPredator();
        
        this.achievementManager.reset();
        this.gameState = 'playing';
        document.getElementById('gameOverMenu').style.display = 'none';
        document.getElementById('tutorial').style.display = 'block';
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.achievementManager.updateHighScore();
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
                    this.achievementManager.onCreatureEaten();
                    this.creatureManager.prey.splice(i, 1);

                    // Add new creatures as player grows
                    if (this.creatureManager.prey.length < 5) {
                        this.addNewCreatures();
                    }
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
                    this.achievementManager.onCreatureEaten();
                    this.creatureManager.predators.splice(i, 1);

                    // Add new predator when one is eaten
                    this.addNewPredator();
                }
            }
        }
        
        // Check for progression
        if (this.score >= this.level * 100) {
            this.levelUp();
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
            
            // Update achievements and stats
            this.achievementManager.update(deltaTime);
            
            // Check collisions
            this.checkCollisions();
            
            // Add ambient bubbles
            if (Math.random() < 0.05) {
                const x = Math.random() * this.canvas.width;
                this.particleSystem.addBubbleEffect(x, this.canvas.height);
                if (Math.random() < 0.2) {
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
        
        // Draw pause overlay
        if (this.gameState === 'paused') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = 'white';
            this.ctx.font = '48px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('PAUSED', this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText('Press P to resume', this.canvas.width/2, this.canvas.height/2 + 40);
        }
        
        // Show appropriate menu
        if (this.gameState === 'menu') {
            document.getElementById('startMenu').style.display = 'block';
        }
    }
    
    gameLoop(currentTime) {
        // Calculate delta time
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update and draw
        if (this.gameState !== 'paused') {
            this.update(this.deltaTime);
        }
        this.draw();
        
        // Continue game loop
        requestAnimationFrame((timestamp) => this.gameLoop(timestamp));
    }

    addNewCreatures() {
        const minSize = Math.max(10, this.player.size * 0.5);
        const maxSize = this.player.size * 0.9;
        
        // Add 2-3 new prey
        const newPreyCount = 2 + Math.floor(Math.random() * 2);
        for (let i = 0; i < newPreyCount; i++) {
            const size = minSize + Math.random() * (maxSize - minSize);
            const position = this.creatureManager.getRandomPosition(false, 200, this.player.x, this.player.y);
            this.creatureManager.prey.push(new Creature(
                position.x,
                position.y,
                size,
                2 + Math.random() * 2,
                '#88FF88',
                false
            ));
        }
    }

    addNewPredator() {
        const minSize = this.player.size * 1.3;
        const maxSize = this.player.size * 1.8;
        const size = minSize + Math.random() * (maxSize - minSize);
        const position = this.creatureManager.getRandomPosition(true, 300, this.player.x, this.player.y);
        
        this.creatureManager.predators.push(new Creature(
            position.x,
            position.y,
            size,
            1.5 + Math.random() * 2,
            '#FF8888',
            true
        ));
    }

    levelUp() {
        this.level++;
        this.particleSystem.addLevelUpEffect(this.player.x, this.player.y);
        this.soundManager.playSound('levelUp', 0.5);
        
        // Increase player stats slightly
        this.player.speed += 0.2;
        
        // Add new creatures for variety
        this.addNewCreatures();
        
        // Add a new predator every few levels
        if (this.level % 2 === 0) {
            this.addNewPredator();
        }
        
        // Update UI
        document.getElementById('levelDisplay').textContent = this.level;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 