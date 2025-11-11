// games.js
class GameManager {
    constructor() {
        this.currentGame = null;
        this.gameState = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const gameType = e.currentTarget.dataset.game;
                this.startGame(gameType);
            });
        });
    }

    async startGame(gameType) {
        if (!window.authManager || !window.authManager.isLoggedIn()) {
            window.authManager.showMessage('Vui lòng đăng nhập để chơi game!', 'error');
            return;
        }

        try {
            document.getElementById('gamesGrid').classList.add('hidden');
            const gameContainer = document.getElementById('gameContainer');
            gameContainer.classList.remove('hidden');
            gameContainer.innerHTML = `
                <div class="game-loading">
                    <div class="loading" style="width: 50px; height: 50px;"></div>
                    <h3>Đang tải game...</h3>
                </div>
            `;

            // Play loading sound
            this.playSound('click');

            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const gameData = this.getGameData(gameType);
            this.currentGame = gameType;
            this.renderGame(gameType, gameData);

        } catch (error) {
            console.error('Error loading game:', error);
            this.showGameError('Lỗi tải game! Vui lòng thử lại.');
        }
    }

    getGameData(gameType) {
        const gameData = {
            number_race: {
                time_limit: 120,
                questions: [
                    { question: "15 + 27 = ?", options: ["42", "32", "52", "37"], answer: 42 },
                    { question: "48 ÷ 6 = ?", options: ["8", "6", "7", "9"], answer: 8 },
                    { question: "9 × 7 = ?", options: ["63", "56", "72", "54"], answer: 63 },
                    { question: "100 - 45 = ?", options: ["55", "65", "45", "35"], answer: 55 },
                    { question: "25 × 4 = ?", options: ["100", "80", "120", "90"], answer: 100 }
                ],
                image: 'images/games/number-race.jpg'
            },
            math_puzzle: {
                puzzles: [
                    {
                        question: "Tìm số thích hợp: 2, 4, 8, 16, ?",
                        options: [20, 24, 32, 30],
                        answer: 32
                    },
                    {
                        question: "Số nào là số chẵn lớn nhất có 2 chữ số?",
                        options: [98, 96, 100, 99],
                        answer: 98
                    },
                    {
                        question: "5 × 6 + 10 = ?",
                        options: [40, 35, 45, 50],
                        answer: 40
                    }
                ],
                image: 'images/games/math-puzzle.jpg'
            },
            treasure_hunt: {
                puzzles: [
                    { 
                        question: "An có 5 viên kẹo, mẹ cho thêm 3 viên. Hỏi An có bao nhiêu viên kẹo?", 
                        answer: "8",
                        reward: "🍬 Kẹo ngọt"
                    },
                    { 
                        question: "Một tuần có 7 ngày. Hỏi 2 tuần có bao nhiêu ngày?", 
                        answer: "14",
                        reward: "📅 Lịch vàng"
                    },
                    { 
                        question: "12 × 3 - 10 = ?", 
                        answer: "26",
                        reward: "💎 Kim cương"
                    }
                ],
                image: 'images/games/treasure-hunt.jpg'
            },
            memory_math: {
                cards: [
                    { id: 1, value: "5 + 3", match: "8" },
                    { id: 2, value: "8", match: "5 + 3" },
                    { id: 3, value: "12 ÷ 4", match: "3" },
                    { id: 4, value: "3", match: "12 ÷ 4" },
                    { id: 5, value: "7 × 6", match: "42" },
                    { id: 6, value: "42", match: "7 × 6" },
                    { id: 7, value: "9 × 9", match: "81" },
                    { id: 8, value: "81", match: "9 × 9" }
                ],
                image: 'images/games/memory-math.jpg'
            }
        };

        return gameData[gameType];
    }

    renderGame(gameType, gameData) {
        const gameContainer = document.getElementById('gameContainer');
        
        switch (gameType) {
            case 'number_race':
                this.renderNumberRace(gameData, gameContainer);
                break;
            case 'math_puzzle':
                this.renderMathPuzzle(gameData, gameContainer);
                break;
            case 'treasure_hunt':
                this.renderTreasureHunt(gameData, gameContainer);
                break;
            case 'memory_math':
                this.renderMemoryMath(gameData, gameContainer);
                break;
            default:
                this.showGameError('Game không tồn tại!');
        }
    }

    renderNumberRace(gameData, container) {
        this.gameState = {
            currentQuestion: 0,
            score: 0,
            timeLeft: gameData.time_limit,
            questions: gameData.questions,
            timer: null,
            characterPosition: 0
        };

        container.innerHTML = `
            <div class="game-header">
                <button class="btn-secondary" onclick="window.gameManager.exitGame()">
                    <i class="fas fa-arrow-left"></i> Thoát game
                </button>
                <div class="game-info">
                    <h3><i class="fas fa-flag-checkered"></i> Đua Toán Học</h3>
                    <div class="game-stats">
                        <span class="stat">⏱️ Thời gian: <span id="gameTime">${this.gameState.timeLeft}</span>s</span>
                        <span class="stat">📊 Điểm: <span id="gameScore">0</span></span>
                        <span class="stat">❓ Câu: <span id="gameQuestion">1/${this.gameState.questions.length}</span></span>
                    </div>
                </div>
                <div class="sound-controls">
                    <button class="sound-btn ${window.audioManager && window.audioManager.getSoundState() ? '' : 'muted'}" 
                            id="soundToggle" onclick="window.gameManager.toggleSound()">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="music-btn ${window.audioManager && window.audioManager.getMusicState() ? '' : 'muted'}" 
                            id="musicToggle" onclick="window.gameManager.toggleMusic()">
                        <i class="fas fa-music"></i>
                    </button>
                </div>
            </div>
            
            <div class="game-content">
                <div class="game-image-banner">
                    <img src="${gameData.image}" alt="Đua Toán Học" class="game-banner-image">
                </div>
                <div class="race-track">
                    <div class="track"></div>
                    <div class="race-character" id="raceCharacter">🏎️</div>
                    <div class="finish-line"></div>
                </div>
                
                <div class="question-container">
                    <div class="question" id="currentQuestion"></div>
                    <div class="options-grid" id="optionsGrid"></div>
                </div>
                <div class="game-feedback" id="gameFeedback"></div>
            </div>
        `;

        this.startNumberRaceTimer();
        this.showNumberRaceQuestion();
        this.playSound('race');
        this.startBackgroundMusic();
    }

    startNumberRaceTimer() {
        this.playSound('click');
        
        this.gameState.timer = setInterval(() => {
            this.gameState.timeLeft--;
            document.getElementById('gameTime').textContent = this.gameState.timeLeft;

            if (this.gameState.timeLeft === 10) {
                this.playSound('click');
            }

            if (this.gameState.timeLeft <= 0) {
                this.playSound('incorrect');
                this.endNumberRace();
            }
        }, 1000);
    }

    showNumberRaceQuestion() {
        if (this.gameState.currentQuestion >= this.gameState.questions.length) {
            this.endNumberRace();
            return;
        }

        const question = this.gameState.questions[this.gameState.currentQuestion];
        const questionElement = document.getElementById('currentQuestion');
        const optionsGrid = document.getElementById('optionsGrid');

        questionElement.textContent = question.question;
        optionsGrid.innerHTML = '';

        question.options.forEach((option, index) => {
            const button = document.createElement('button');
            button.className = 'game-option-btn';
            button.innerHTML = `
                <span class="option-text">${option}</span>
            `;
            button.addEventListener('click', () => this.checkNumberRaceAnswer(option, question.answer));
            optionsGrid.appendChild(button);
        });

        document.getElementById('gameQuestion').textContent = 
            `${this.gameState.currentQuestion + 1}/${this.gameState.questions.length}`;
    }

    checkNumberRaceAnswer(selectedAnswer, correctAnswer) {
        this.playSound('click');
        const isCorrect = parseInt(selectedAnswer) === correctAnswer;
        const feedback = document.getElementById('gameFeedback');

        if (isCorrect) {
            this.gameState.score += 10;
            this.gameState.characterPosition += (100 / this.gameState.questions.length);
            document.getElementById('raceCharacter').style.left = this.gameState.characterPosition + '%';
            
            feedback.innerHTML = `
                <div class="correct">
                    <i class="fas fa-check-circle"></i>
                    <strong>Chính xác! +10 điểm</strong>
                </div>
            `;
            this.playSound('correct');
        } else {
            feedback.innerHTML = `
                <div class="incorrect">
                    <i class="fas fa-times-circle"></i>
                    <strong>Sai! Đáp án: ${correctAnswer}</strong>
                </div>
            `;
            this.playSound('incorrect');
        }

        document.getElementById('gameScore').textContent = this.gameState.score;

        setTimeout(() => {
            this.gameState.currentQuestion++;
            this.showNumberRaceQuestion();
            feedback.innerHTML = '';
        }, 1500);
    }

    endNumberRace() {
        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
        
        const container = document.getElementById('gameContainer');
        const accuracy = (this.gameState.score / (this.gameState.questions.length * 10)) * 100;

        if (accuracy >= 70) {
            this.playSound('win');
        } else {
            this.playSound('incorrect');
        }

        container.innerHTML = `
            <div class="game-completed">
                <div class="completion-header">
                    <i class="fas fa-trophy" style="font-size: 4rem; color: #FFD700; margin-bottom: 1rem;"></i>
                    <h2>Hoàn thành Đua Toán Học! 🏁</h2>
                </div>
                
                <div class="completion-stats">
                    <div class="completion-stat">
                        <i class="fas fa-star"></i>
                        <span>Điểm số: ${this.gameState.score}</span>
                    </div>
                    <div class="completion-stat">
                        <i class="fas fa-bullseye"></i>
                        <span>Độ chính xác: ${accuracy.toFixed(1)}%</span>
                    </div>
                    <div class="completion-stat">
                        <i class="fas fa-clock"></i>
                        <span>Thời gian còn: ${this.gameState.timeLeft}s</span>
                    </div>
                </div>

                <div class="completion-message">
                    <p>${this.getCompletionMessage(accuracy)}</p>
                </div>

                <div class="completion-actions">
                    <button class="btn-primary" onclick="window.gameManager.restartGame()">
                        <i class="fas fa-redo"></i>
                        Chơi lại
                    </button>
                    <button class="btn-secondary" onclick="window.gameManager.exitGame()">
                        <i class="fas fa-home"></i>
                        Về trang chủ
                    </button>
                </div>
            </div>
        `;

        this.saveGameProgress(this.gameState.score);
    }

    renderMathPuzzle(gameData, container) {
        this.gameState = {
            currentPuzzle: 0,
            puzzles: gameData.puzzles,
            score: 0
        };

        container.innerHTML = `
            <div class="game-header">
                <button class="btn-secondary" onclick="window.gameManager.exitGame()">
                    <i class="fas fa-arrow-left"></i> Thoát game
                </button>
                <div class="game-info">
                    <h3><i class="fas fa-puzzle-piece"></i> Ghép Số Thần Kỳ</h3>
                    <div class="game-stats">
                        <span class="stat">🎯 Câu đố: <span id="puzzleCount">1/${this.gameState.puzzles.length}</span></span>
                        <span class="stat">📊 Điểm: <span id="puzzleScore">0</span></span>
                    </div>
                </div>
                <div class="sound-controls">
                    <button class="sound-btn ${window.audioManager && window.audioManager.getSoundState() ? '' : 'muted'}" 
                            id="soundToggle" onclick="window.gameManager.toggleSound()">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="music-btn ${window.audioManager && window.audioManager.getMusicState() ? '' : 'muted'}" 
                        id="musicToggle" onclick="window.gameManager.toggleMusic()">
                        <i class="fas fa-music"></i>
                    </button>
                </div>
            </div>
            
            <div class="puzzle-container">
                <div class="game-image-banner">
                    <img src="${gameData.image}" alt="Ghép Số Thần Kỳ" class="game-banner-image">
                </div>
                <div class="puzzle-question">${this.gameState.puzzles[0].question}</div>
                <div class="puzzle-options" id="puzzleOptions"></div>
                <div class="puzzle-feedback" id="puzzleFeedback"></div>
            </div>
        `;

        this.showPuzzleOptions();
        this.startBackgroundMusic();
    }

    showPuzzleOptions() {
        const puzzle = this.gameState.puzzles[this.gameState.currentPuzzle];
        const optionsContainer = document.getElementById('puzzleOptions');
        
        optionsContainer.innerHTML = puzzle.options.map(option => `
            <button class="puzzle-option" onclick="window.gameManager.checkPuzzleAnswer(${option}, ${puzzle.answer})">
                ${option}
            </button>
        `).join('');
        
        document.getElementById('puzzleCount').textContent = 
            `${this.gameState.currentPuzzle + 1}/${this.gameState.puzzles.length}`;
    }

    checkPuzzleAnswer(selectedAnswer, correctAnswer) {
        this.playSound('click');
        const feedback = document.getElementById('puzzleFeedback');
        const isCorrect = selectedAnswer === correctAnswer;

        if (isCorrect) {
            this.gameState.score += 20;
            document.getElementById('puzzleScore').textContent = this.gameState.score;
            
            feedback.innerHTML = `
                <div class="correct">
                    <i class="fas fa-check-circle"></i>
                    <div>
                        <h4>🎉 Chính xác!</h4>
                        <p>Bạn đã giải đố thành công! +20 điểm</p>
                    </div>
                </div>
            `;
            this.playSound('correct');

            setTimeout(() => {
                this.gameState.currentPuzzle++;
                if (this.gameState.currentPuzzle < this.gameState.puzzles.length) {
                    this.showNextPuzzle();
                } else {
                    this.completePuzzleGame();
                }
            }, 2000);
        } else {
            feedback.innerHTML = `
                <div class="incorrect">
                    <i class="fas fa-times-circle"></i>
                    <div>
                        <h4>❌ Chưa đúng!</h4>
                        <p>Hãy thử lại hoặc suy nghĩ kỹ hơn!</p>
                    </div>
                </div>
            `;
            this.playSound('incorrect');
        }
    }

    showNextPuzzle() {
        const puzzle = this.gameState.puzzles[this.gameState.currentPuzzle];
        const puzzleQuestion = document.querySelector('.puzzle-question');
        
        puzzleQuestion.textContent = puzzle.question;
        document.getElementById('puzzleFeedback').innerHTML = '';
        
        this.showPuzzleOptions();
    }

    completePuzzleGame() {
        this.playSound('win');
        this.saveGameProgress(this.gameState.score);
        this.showGameCompleted(
            'Ghép Số Thần Kỳ', 
            this.gameState.score, 
            '🎉 Bạn đã giải tất cả câu đố thành công!'
        );
    }

    renderTreasureHunt(gameData, container) {
        this.gameState = {
            currentPuzzle: 0,
            puzzles: gameData.puzzles,
            foundTreasures: []
        };

        container.innerHTML = `
            <div class="game-header">
                <button class="btn-secondary" onclick="window.gameManager.exitGame()">
                    <i class="fas fa-arrow-left"></i> Thoát game
                </button>
                <div class="game-info">
                    <h3><i class="fas fa-treasure-chest"></i> Săn Kho Báu</h3>
                    <div class="game-stats">
                        <span class="stat">🗺️ Kho báu: <span id="treasureCount">0/${this.gameState.puzzles.length}</span></span>
                    </div>
                </div>
                <div class="sound-controls">
                    <button class="sound-btn ${window.audioManager && window.audioManager.getSoundState() ? '' : 'muted'}" 
                            id="soundToggle" onclick="window.gameManager.toggleSound()">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="music-btn ${window.audioManager && window.audioManager.getMusicState() ? '' : 'muted'}" 
                            id="musicToggle" onclick="window.gameManager.toggleMusic()">
                        <i class="fas fa-music"></i>
                    </button>
                </div>
            </div>
            
            <div class="treasure-hunt-container">
                <div class="game-image-banner">
                    <img src="${gameData.image}" alt="Săn Kho Báu" class="game-banner-image">
                </div>
                <div class="treasure-map">
                    <h4>🗺️ Bản đồ kho báu:</h4>
                    <div class="map-grid">
                        <div class="map-row">
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                        </div>
                        <div class="map-row">
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">💎</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🏆</div>
                            <div class="map-cell">🌴</div>
                        </div>
                        <div class="map-row">
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                        </div>
                        <div class="map-row">
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">💎</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">💎</div>
                            <div class="map-cell">🌴</div>
                        </div>
                        <div class="map-row">
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                            <div class="map-cell">🌴</div>
                        </div>
                    </div>
                </div>
                
                <div class="puzzle-section">
                    <div class="puzzle-question" id="treasurePuzzle"></div>
                    <div class="answer-input">
                        <input type="text" id="treasureAnswer" placeholder="Nhập câu trả lời...">
                        <button class="btn-primary" onclick="window.gameManager.checkTreasureAnswer()">
                            <i class="fas fa-search"></i>
                            Giải đố
                        </button>
                    </div>
                    <div class="puzzle-feedback" id="treasureFeedback"></div>
                </div>
            </div>
        `;

        this.showTreasurePuzzle();
        this.playSound('treasure');
        this.startBackgroundMusic();
    }

    showTreasurePuzzle() {
        if (this.gameState.currentPuzzle >= this.gameState.puzzles.length) {
            this.completeTreasureHunt();
            return;
        }

        const puzzle = this.gameState.puzzles[this.gameState.currentPuzzle];
        document.getElementById('treasurePuzzle').textContent = puzzle.question;
        document.getElementById('treasureAnswer').value = '';
        document.getElementById('treasureFeedback').innerHTML = '';
    }

    checkTreasureAnswer() {
        this.playSound('click');
        const userAnswer = document.getElementById('treasureAnswer').value.trim();
        const puzzle = this.gameState.puzzles[this.gameState.currentPuzzle];
        const feedback = document.getElementById('treasureFeedback');

        if (userAnswer === puzzle.answer) {
            this.gameState.foundTreasures.push(puzzle.reward);
            document.getElementById('treasureCount').textContent = 
                `${this.gameState.foundTreasures.length}/${this.gameState.puzzles.length}`;
                
            feedback.innerHTML = `
                <div class="correct">
                    <i class="fas fa-gem"></i>
                    <div>
                        <h4>🎉 Tìm thấy ${puzzle.reward}!</h4>
                        <p>Bạn đã giải đố thành công!</p>
                    </div>
                </div>
            `;
            this.playSound('correct');

            setTimeout(() => {
                this.gameState.currentPuzzle++;
                this.showTreasurePuzzle();
            }, 2000);
        } else {
            feedback.innerHTML = `
                <div class="incorrect">
                    <i class="fas fa-times"></i>
                    <div>
                        <h4>❌ Sai rồi!</h4>
                        <p>Hãy thử lại!</p>
                    </div>
                </div>
            `;
            this.playSound('incorrect');
        }
    }

    completeTreasureHunt() {
        const score = this.gameState.foundTreasures.length * 25;
        const treasures = this.gameState.foundTreasures.join(', ');
        
        this.playSound('win');
        this.saveGameProgress(score);
        this.showGameCompleted(
            'Săn Kho Báu', 
            score, 
            `🎉 Bạn đã tìm thấy: ${treasures}`
        );
    }

    renderMemoryMath(gameData, container) {
        const shuffledCards = [...gameData.cards].sort(() => Math.random() - 0.5);
        
        this.gameState = {
            cards: shuffledCards,
            flippedCards: [],
            matchedPairs: 0,
            moves: 0
        };

        container.innerHTML = `
            <div class="game-header">
                <button class="btn-secondary" onclick="window.gameManager.exitGame()">
                    <i class="fas fa-arrow-left"></i> Thoát game
                </button>
                <div class="game-info">
                    <h3><i class="fas fa-brain"></i> Trí nhớ Toán học</h3>
                    <div class="game-stats">
                        <span class="stat">🃏 Cặp đã ghép: <span id="matchedPairs">0</span>/4</span>
                        <span class="stat">↻ Số lượt: <span id="moves">0</span></span>
                    </div>
                </div>
                <div class="sound-controls">
                    <button class="sound-btn ${window.audioManager && window.audioManager.getSoundState() ? '' : 'muted'}" 
                            id="soundToggle" onclick="window.gameManager.toggleSound()">
                        <i class="fas fa-volume-up"></i>
                    </button>
                    <button class="music-btn ${window.audioManager && window.audioManager.getMusicState() ? '' : 'muted'}" 
                            id="musicToggle" onclick="window.gameManager.toggleMusic()">
                        <i class="fas fa-music"></i>
                    </button>
                </div>
            </div>
            
            <div class="memory-game-container">
                <div class="game-image-banner">
                    <img src="${gameData.image}" alt="Trí nhớ Toán học" class="game-banner-image">
                </div>
                <div class="memory-grid">
                    ${this.gameState.cards.map((card, index) => `
                        <div class="memory-card" data-id="${card.id}" data-index="${index}">
                            <div class="card-front">
                                <div class="card-back-content">?</div>
                            </div>
                            <div class="card-back">
                                <div class="card-value">${card.value}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="game-feedback" id="memoryFeedback"></div>
            </div>
        `;

        this.setupMemoryGame();
        this.startBackgroundMusic();
    }

    setupMemoryGame() {
        document.querySelectorAll('.memory-card').forEach(card => {
            card.addEventListener('click', () => this.flipMemoryCard(card));
        });
    }

    flipMemoryCard(card) {
        if (card.classList.contains('flipped') || card.classList.contains('matched')) {
            return;
        }

        if (this.gameState.flippedCards.length >= 2) {
            return;
        }

        card.classList.add('flipped');
        this.gameState.flippedCards.push(card);
        this.playSound('flip');

        if (this.gameState.flippedCards.length === 2) {
            this.gameState.moves++;
            document.getElementById('moves').textContent = this.gameState.moves;
            setTimeout(() => this.checkMemoryMatch(), 500);
        }
    }

    checkMemoryMatch() {
        const [card1, card2] = this.gameState.flippedCards;
        const value1 = card1.querySelector('.card-value').textContent;
        const value2 = card2.querySelector('.card-value').textContent;

        const card1Data = this.gameState.cards[parseInt(card1.dataset.index)];
        const card2Data = this.gameState.cards[parseInt(card2.dataset.index)];

        const isMatch = card1Data.match === value2 && card2Data.match === value1;

        if (isMatch) {
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.gameState.matchedPairs++;
            document.getElementById('matchedPairs').textContent = this.gameState.matchedPairs;
            this.playSound('correct');

            if (this.gameState.matchedPairs === 4) {
                this.playSound('win');
                setTimeout(() => this.completeMemoryGame(), 500);
            }
        } else {
            this.playSound('incorrect');
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
            }, 1000);
        }

        this.gameState.flippedCards = [];
    }

    completeMemoryGame() {
        const score = Math.max(100 - this.gameState.moves * 5, 20);
        this.saveGameProgress(score);
        
        this.showGameCompleted(
            'Trí nhớ Toán học',
            score,
            `🎉 Hoàn thành với ${this.gameState.moves} lượt!`
        );
    }

    showGameCompleted(gameName, score, message) {
        const container = document.getElementById('gameContainer');
        container.innerHTML = `
            <div class="game-completed">
                <div class="completion-header">
                    <i class="fas fa-trophy" style="font-size: 4rem; color: #FFD700; margin-bottom: 1rem;"></i>
                    <h2>Hoàn thành ${gameName}! 🎉</h2>
                </div>
                
                <div class="completion-stats">
                    <div class="completion-stat">
                        <i class="fas fa-star"></i>
                        <span>Điểm số: ${score}</span>
                    </div>
                </div>

                <div class="completion-message">
                    <p>${message}</p>
                </div>

                <div class="completion-actions">
                    <button class="btn-primary" onclick="window.gameManager.restartGame()">
                        <i class="fas fa-redo"></i>
                        Chơi lại
                    </button>
                    <button class="btn-secondary" onclick="window.gameManager.exitGame()">
                        <i class="fas fa-home"></i>
                        Về trang chủ
                    </button>
                </div>
            </div>
        `;
    }

    getCompletionMessage(accuracy) {
        if (accuracy >= 90) return '🎉 Xuất sắc! Bạn là siêu sao toán học!';
        if (accuracy >= 70) return '👍 Rất tốt! Tiếp tục phát huy nhé!';
        if (accuracy >= 50) return '💪 Khá lắm! Hãy luyện tập thêm!';
        return '📚 Cố gắng hơn nữa nhé! Mỗi lần chơi là một lần học!';
    }

    async saveGameProgress(score) {
        if (!window.authManager || !window.authManager.isLoggedIn()) return;

        try {
            await new Promise(resolve => setTimeout(resolve, 500));
            console.log('Game progress saved:', score);
            
            if (window.mathApp) {
                window.mathApp.loadDashboard();
            }
        } catch (error) {
            console.error('Error saving game progress:', error);
        }
    }

    startBackgroundMusic() {
        if (window.audioManager) {
            setTimeout(() => {
                window.audioManager.playBackgroundMusic();
            }, 500);
        }
    }

    playSound(soundName) {
        if (window.audioManager) {
            console.log(`Playing sound: ${soundName}`);
            window.audioManager.playSound(soundName);
        } else {
            console.warn('Audio manager not available');
        }
    }

    toggleSound() {
        if (window.audioManager) {
            const isEnabled = window.audioManager.toggleSound();
            const soundBtn = document.getElementById('soundToggle');
            if (soundBtn) {
                soundBtn.innerHTML = isEnabled ? '<i class="fas fa-volume-up"></i>' : '<i class="fas fa-volume-mute"></i>';
                soundBtn.classList.toggle('muted', !isEnabled);
            }
        }
    }

    toggleMusic() {
        if (window.audioManager) {
            const isEnabled = window.audioManager.toggleMusic();
            const musicBtn = document.getElementById('musicToggle');
            if (musicBtn) {
                musicBtn.innerHTML = isEnabled ? '<i class="fas fa-music"></i>' : '<i class="fas fa-music muted"></i>';
                musicBtn.classList.toggle('muted', !isEnabled);
            }
        }
    }

    restartGame() {
        this.playSound('click');
        if (this.currentGame) {
            this.startGame(this.currentGame);
        }
    }

    exitGame() {
        this.playSound('click');
        if (window.audioManager) {
            window.audioManager.stopBackgroundMusic();
        }

        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('gamesGrid').classList.remove('hidden');
        this.currentGame = null;
        this.gameState = {};

        if (this.gameState.timer) {
            clearInterval(this.gameState.timer);
        }
    }

    showGameError(message) {
        const container = document.getElementById('gameContainer');
        container.innerHTML = `
            <div class="game-error">
                <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ff6b6b; margin-bottom: 1rem;"></i>
                <h3>Lỗi</h3>
                <p>${message}</p>
                <button class="btn-primary" onclick="window.gameManager.exitGame()">
                    <i class="fas fa-home"></i>
                    Quay lại
                </button>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.gameManager = new GameManager();
});