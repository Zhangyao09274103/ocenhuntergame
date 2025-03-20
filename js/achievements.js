class AchievementManager {
    constructor(game) {
        this.game = game;
        this.achievements = {
            firstCatch: { earned: false, title: "First Catch!", description: "Catch your first prey" },
            speedster: { earned: false, title: "Speedster", description: "Travel 1000 units in a single game" },
            bigEater: { earned: false, title: "Big Eater", description: "Eat 10 creatures in a single game" },
            survivor: { earned: false, title: "Survivor", description: "Reach level 3" },
            masterHunter: { earned: false, title: "Master Hunter", description: "Score 1000 points" }
        };
        
        this.stats = {
            creaturesEaten: 0,
            distanceTraveled: 0,
            timePlayed: 0,
            highScore: localStorage.getItem('highScore') || 0
        };
        
        this.lastPosition = { x: 0, y: 0 };
    }
    
    update(deltaTime) {
        // Update time played
        this.stats.timePlayed += deltaTime;
        
        // Update distance traveled
        const dx = this.game.player.x - this.lastPosition.x;
        const dy = this.game.player.y - this.lastPosition.y;
        this.stats.distanceTraveled += Math.sqrt(dx * dx + dy * dy);
        
        this.lastPosition = { x: this.game.player.x, y: this.game.player.y };
        
        // Check achievements
        this.checkAchievements();
        
        // Update UI
        this.updateUI();
    }
    
    onCreatureEaten() {
        this.stats.creaturesEaten++;
        
        if (!this.achievements.firstCatch.earned) {
            this.unlockAchievement('firstCatch');
        }
        
        if (this.stats.creaturesEaten >= 10 && !this.achievements.bigEater.earned) {
            this.unlockAchievement('bigEater');
        }
    }
    
    checkAchievements() {
        if (this.stats.distanceTraveled >= 1000 && !this.achievements.speedster.earned) {
            this.unlockAchievement('speedster');
        }
        
        if (this.game.level >= 3 && !this.achievements.survivor.earned) {
            this.unlockAchievement('survivor');
        }
        
        if (this.game.score >= 1000 && !this.achievements.masterHunter.earned) {
            this.unlockAchievement('masterHunter');
        }
    }
    
    unlockAchievement(id) {
        if (!this.achievements[id].earned) {
            this.achievements[id].earned = true;
            this.showAchievementNotification(this.achievements[id].title);
            this.game.soundManager.playSound('levelUp', 0.3);
        }
    }
    
    showAchievementNotification(title) {
        const achievement = document.getElementById('achievement');
        achievement.textContent = `🏆 Achievement Unlocked: ${title}`;
        achievement.style.display = 'block';
        
        setTimeout(() => {
            achievement.style.display = 'none';
        }, 3000);
    }
    
    updateUI() {
        document.getElementById('creaturesEaten').textContent = this.stats.creaturesEaten;
        document.getElementById('timePlayed').textContent = this.formatTime(this.stats.timePlayed);
        document.getElementById('distanceTraveled').textContent = Math.round(this.stats.distanceTraveled);
    }
    
    formatTime(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    updateHighScore() {
        const currentScore = this.game.score;
        if (currentScore > this.stats.highScore) {
            this.stats.highScore = currentScore;
            localStorage.setItem('highScore', currentScore);
        }
        document.getElementById('highScore').textContent = this.stats.highScore;
        document.getElementById('finalHighScore').textContent = this.stats.highScore;
    }
    
    reset() {
        this.stats.creaturesEaten = 0;
        this.stats.distanceTraveled = 0;
        this.stats.timePlayed = 0;
        this.lastPosition = { x: this.game.player.x, y: this.game.player.y };
        Object.keys(this.achievements).forEach(key => {
            this.achievements[key].earned = false;
        });
    }
} 