// audio-manager.js
class AudioManager {
    constructor() {
        this.isSoundEnabled = true;
        this.isMusicEnabled = true;
        this.sounds = {};
        this.backgroundMusic = null;
        this.audioContext = null;
        this.init();
    }

    async init() {
        console.log('Initializing Audio Manager...');
        await this.loadSounds();
        this.setupBackgroundMusic();
        console.log('Audio Manager initialized successfully');
    }

    setupBackgroundMusic() {
        this.backgroundMusic = new Audio();
        this.backgroundMusic.src = 'sounds/background-music.mp3';
        this.backgroundMusic.loop = true;
        this.backgroundMusic.volume = 0.4;
        this.backgroundMusic.preload = 'auto';
        
        this.backgroundMusic.addEventListener('error', (e) => {
            console.warn('Background music not available, using fallback sounds only');
        });

        this.backgroundMusic.addEventListener('canplaythrough', () => {
            console.log('Background music ready to play');
        });
    }

    async loadSounds() {
        const soundFiles = {
            correct: 'sounds/correct.mp3',
            incorrect: 'sounds/incorrect.mp3',
            flip: 'sounds/flip.mp3',
            win: 'sounds/win.mp3',
            click: 'sounds/click.mp3',
            race: 'sounds/race.mp3',
            treasure: 'sounds/treasure.mp3',
            start: 'sounds/start.mp3',
            warning: 'sounds/warning.mp3',
            error: 'sounds/error.mp3'
        };

        for (const [name, url] of Object.entries(soundFiles)) {
            await this.loadSound(name, url);
        }
    }

    loadSound(name, url) {
        return new Promise((resolve) => {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = 0.7;
            
            audio.addEventListener('loadeddata', () => {
                console.log(`✓ Sound loaded: ${name}`);
                this.sounds[name] = audio;
                resolve(true);
            });

            audio.addEventListener('error', (e) => {
                console.warn(`✗ Error loading sound ${name}, using fallback`);
                this.sounds[name] = this.createFallbackSound(name);
                resolve(false);
            });

            audio.src = url;
            
            // Timeout để tránh treo
            setTimeout(() => {
                if (!this.sounds[name]) {
                    console.warn(`Timeout loading sound: ${name}, using fallback`);
                    this.sounds[name] = this.createFallbackSound(name);
                    resolve(false);
                }
            }, 1000);
        });
    }

    createFallbackSound(soundName) {
        console.log(`Creating fallback sound for: ${soundName}`);
        
        return () => {
            if (!this.isSoundEnabled) return;
            
            try {
                if (!this.audioContext) {
                    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                }

                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                const frequencies = {
                    correct: 800,
                    incorrect: 300,
                    flip: 600,
                    win: 1000,
                    click: 1200,
                    race: 400,
                    treasure: 500,
                    start: 800,
                    warning: 600,
                    error: 300
                };
                
                const freq = frequencies[soundName] || 440;
                oscillator.frequency.value = freq;
                oscillator.type = 'sine';
                
                const now = this.audioContext.currentTime;
                gainNode.gain.setValueAtTime(0, now);
                gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
                
                oscillator.start(now);
                oscillator.stop(now + 0.3);
                
            } catch (e) {
                console.log('Fallback sound failed, user may need to interact with page first');
            }
        };
    }

    playSound(soundName) {
        if (!this.isSoundEnabled) {
            return;
        }
        
        console.log(`Attempting to play sound: ${soundName}`);
        
        try {
            const sound = this.sounds[soundName];
            if (!sound) {
                console.warn(`Sound not found: ${soundName}`);
                return;
            }
            
            if (typeof sound === 'function') {
                sound();
            } else {
                const soundClone = sound.cloneNode();
                soundClone.volume = 0.7;
                
                const playPromise = soundClone.play();
                
                if (playPromise !== undefined) {
                    playPromise.catch(error => {
                        console.warn(`Could not play sound: ${soundName}`, error);
                        this.createFallbackSound(soundName)();
                    });
                }
            }
        } catch (error) {
            console.warn(`Error playing sound: ${soundName}`, error);
        }
    }

    playBackgroundMusic() {
        if (!this.isMusicEnabled || !this.backgroundMusic) {
            return;
        }
        
        console.log('Playing background music');
        
        this.backgroundMusic.currentTime = 0;
        this.backgroundMusic.volume = 0.4;
        
        const playPromise = this.backgroundMusic.play();
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.warn('Could not play background music:', error);
            });
        }
    }

    stopBackgroundMusic() {
        if (this.backgroundMusic) {
            this.backgroundMusic.pause();
            this.backgroundMusic.currentTime = 0;
        }
    }

    toggleSound() {
        this.isSoundEnabled = !this.isSoundEnabled;
        console.log('Sound enabled:', this.isSoundEnabled);
        return this.isSoundEnabled;
    }

    toggleMusic() {
        this.isMusicEnabled = !this.isMusicEnabled;
        console.log('Music enabled:', this.isMusicEnabled);
        
        if (this.isMusicEnabled) {
            this.playBackgroundMusic();
        } else {
            this.stopBackgroundMusic();
        }
        
        return this.isMusicEnabled;
    }

    getSoundState() {
        return this.isSoundEnabled;
    }

    getMusicState() {
        return this.isMusicEnabled;
    }

    testAllSounds() {
        console.log('Testing all sounds...');
        const soundNames = ['click', 'correct', 'incorrect', 'flip', 'win', 'race', 'treasure', 'start', 'warning', 'error'];
        
        soundNames.forEach((soundName, index) => {
            setTimeout(() => {
                console.log(`Testing: ${soundName}`);
                this.playSound(soundName);
            }, index * 800);
        });
    }

    // Enhanced sound methods for Mock Test
    playStartSound() {
        if (!this.isSoundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(1200, this.audioContext.currentTime + 0.3);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.3);
            
        } catch (e) {
            console.log('Start sound failed, using fallback');
            this.playSound('click');
        }
    }

    playWinSound() {
        if (!this.isSoundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const times = [0, 0.1, 0.2, 0.3, 0.4];
            const frequencies = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C, E, G, C, E
            
            times.forEach((time, index) => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(frequencies[index], this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + time);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + time + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + 0.3);
                
                oscillator.start(this.audioContext.currentTime + time);
                oscillator.stop(this.audioContext.currentTime + time + 0.3);
            });
            
        } catch (e) {
            console.log('Win sound failed, using fallback');
            this.playSound('correct');
        }
    }

    playWarningSound() {
        if (!this.isSoundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Tạo 3 tiếng beep liên tiếp
            [0, 0.3, 0.6].forEach(time => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.type = 'sine';
                oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime + time);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + time + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + 0.2);
                
                oscillator.start(this.audioContext.currentTime + time);
                oscillator.stop(this.audioContext.currentTime + time + 0.2);
            });
            
        } catch (e) {
            console.log('Warning sound failed, using fallback');
            this.playSound('click');
        }
    }

    playFlipSound() {
        if (!this.isSoundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(300, this.audioContext.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.1);
            
        } catch (e) {
            console.log('Flip sound failed, using fallback');
            this.playSound('click');
        }
    }

    playBeep(frequency, duration) {
        if (!this.isSoundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            const now = this.audioContext.currentTime;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
            
            oscillator.start(now);
            oscillator.stop(now + duration);
            
        } catch (e) {
            console.log('Beep sound failed');
        }
    }

    playErrorSound() {
        if (!this.isSoundEnabled) return;
        
        try {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }

            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Tạo âm thanh lỗi với tần số thấp
            oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
            
            oscillator.start();
            oscillator.stop(this.audioContext.currentTime + 0.5);
            
        } catch (e) {
            console.log('Error sound failed, using fallback');
            this.playSound('incorrect');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        window.audioManager = new AudioManager();
        
        // Thêm hàm test sounds toàn cục
        window.testSounds = () => {
            if (window.audioManager) {
                window.audioManager.testAllSounds();
            }
        };
        
        // Resume audio context khi user tương tác với page
        document.addEventListener('click', () => {
            if (window.audioManager && window.audioManager.audioContext) {
                if (window.audioManager.audioContext.state === 'suspended') {
                    window.audioManager.audioContext.resume();
                }
            }
        });
        
        // Thêm controls cho audio (có thể thêm vào UI sau)
        window.toggleSound = () => window.audioManager?.toggleSound();
        window.toggleMusic = () => window.audioManager?.toggleMusic();
        
    } catch (error) {
        console.error('Failed to initialize Audio Manager:', error);
    }
});