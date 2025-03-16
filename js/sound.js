class SoundManager {
    constructor() {
        this.sounds = {};
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.isMuted = false;
        this.backgroundMusic = null;
        this.loadSounds();
    }

    async loadSounds() {
        const soundFiles = {
            eat: 'sounds/eat.mp3',
            hurt: 'sounds/hurt.mp3',
            levelUp: 'sounds/level_up.mp3',
            bubble: 'sounds/bubble.mp3',
            background: 'sounds/background.mp3'
        };

        for (const [name, path] of Object.entries(soundFiles)) {
            try {
                const response = await fetch(path);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sounds[name] = audioBuffer;

                if (name === 'background') {
                    this.setupBackgroundMusic(audioBuffer);
                }
            } catch (error) {
                console.log(`Could not load sound: ${path}`);
            }
        }
    }

    setupBackgroundMusic(buffer) {
        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = buffer;
        source.loop = true;
        gainNode.gain.value = 0.3; // Lower volume for background music
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        this.backgroundMusic = {
            source,
            gainNode
        };
    }

    playSound(name, volume = 1.0) {
        if (this.isMuted || !this.sounds[name]) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds[name];
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        source.start(0);
    }

    startBackgroundMusic() {
        if (this.backgroundMusic && !this.isMuted) {
            this.backgroundMusic.source.start(0);
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            try {
                this.backgroundMusic.source.stop();
            } catch (e) {
                // Ignore if already stopped
            }
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.backgroundMusic) {
            this.backgroundMusic.gainNode.gain.value = this.isMuted ? 0 : 0.3;
        }
    }
} 