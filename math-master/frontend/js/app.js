// app.js
class MathMasterApp {
    constructor() {
        this.currentUser = null;
        this.currentTopic = null;
        this.exercises = [];
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadDashboard();
    }

    checkAuth() {
        if (window.authManager && window.authManager.isLoggedIn()) {
            this.currentUser = window.authManager.getCurrentUser();
            this.showApp();
        }
    }

    showApp() {
        // App is already shown by auth manager
        this.loadDashboard();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchTab(link.dataset.tab);
            });
        });

        // Quick actions
        document.querySelectorAll('.action-card').forEach(card => {
            card.addEventListener('click', () => {
                this.switchTab(card.dataset.tab);
            });
        });

        // Logout is handled by auth manager

        // Back to topics
        document.getElementById('backToTopics').addEventListener('click', () => {
            this.showTopicSelection();
        });

        // Exercise controls
        document.getElementById('generateAIExercise').addEventListener('click', () => {
            this.generateAIExercise();
        });

        document.getElementById('shuffleExercises').addEventListener('click', () => {
            this.shuffleExercises();
        });

        // Refresh analysis
        document.getElementById('refreshAnalysis').addEventListener('click', () => {
            this.loadProgress();
        });
    }

    switchTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.tab-pane').forEach(tab => {
            tab.classList.remove('active');
        });

        // Remove active class from all nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Show selected tab
        document.getElementById(tabName).classList.add('active');
        
        // Activate corresponding nav link
        const navLink = document.querySelector(`[data-tab="${tabName}"]`);
        if (navLink) {
            navLink.classList.add('active');
        }

        // Load tab content
        this.loadTabContent(tabName);
    }

    async loadTabContent(tabName) {
        switch(tabName) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'learn':
                await this.loadCurriculum();
                break;
            case 'games':
                await this.loadGames();
                break;
            case 'progress':
                await this.loadProgress();
                break;
            case 'leaderboard':
                await this.loadLeaderboard();
                break;
            case 'mocktest':
                // Mock test tab is handled by MockTestManager
                if (window.mockTestManager) {
                    window.mockTestManager.showTestSetup();
                }
                break;
        }
    }

    async loadDashboard() {
        if (!this.currentUser) return;

        try {
            // Load user progress
            const response = await fetch(`/api/progress/${this.currentUser.username}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                const progress = data.progress;
                
                // Calculate statistics
                const totalExercises = progress.completed_exercises.length;
                const totalScore = progress.get_total_score ? progress.get_total_score() : 
                    (progress.completed_exercises.reduce((sum, item) => sum + item.score, 0) + 
                     progress.game_sessions.reduce((sum, item) => sum + item.score, 0));
                const gamesPlayed = progress.game_sessions.length;
                const mockTestsTaken = progress.mock_tests ? progress.mock_tests.length : 0;

                // Update dashboard
                document.getElementById('totalExercises').textContent = totalExercises;
                document.getElementById('totalScore').textContent = totalScore;
                document.getElementById('gamesPlayed').textContent = gamesPlayed;
                document.getElementById('mockTestsTaken').textContent = mockTestsTaken;

                // Simple rank calculation
                const rank = totalScore > 100 ? 'Top 10' : totalScore > 50 ? 'Top 20' : 'Mới bắt đầu';
                document.getElementById('currentRank').textContent = rank;
            }

        } catch (error) {
            console.error('Error loading dashboard:', error);
            // Set default values
            document.getElementById('totalExercises').textContent = '0';
            document.getElementById('totalScore').textContent = '0';
            document.getElementById('gamesPlayed').textContent = '0';
            document.getElementById('mockTestsTaken').textContent = '0';
            document.getElementById('currentRank').textContent = 'Mới bắt đầu';
        }
    }

    async loadCurriculum() {
        try {
            const response = await fetch('/api/curriculum');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                const container = document.getElementById('curriculumContainer');
                container.innerHTML = '';

                data.curriculum.forEach(topic => {
                    const topicCard = this.createTopicCard(topic);
                    container.appendChild(topicCard);
                });

                this.showTopicSelection();
            }
        } catch (error) {
            console.error('Error loading curriculum:', error);
            this.showMessage('Lỗi tải chương trình học!', 'error');
            this.loadSampleCurriculum();
        }
    }

    loadSampleCurriculum() {
        const sampleCurriculum = [
            {
                'id': 'numbers',
                'name': 'Số học và Phép tính',
                'description': 'Học về số có 4-5 chữ số, cộng trừ nhân chia trong phạm vi 100000',
                'icon': 'fa-calculator',
                'exercise_count': 45
            },
            {
                'id': 'word_problems',
                'name': 'Giải toán có lời văn',
                'description': 'Bài toán hơn kém, gấp giảm số lần, rút về đơn vị, hai bước tính',
                'icon': 'fa-file-alt',
                'exercise_count': 35
            },
            {
                'id': 'geometry',
                'name': 'Hình học',
                'description': 'Nhận biết điểm, đoạn thẳng, góc, hình vuông, chữ nhật, tam giác, tứ giác',
                'icon': 'fa-shapes',
                'exercise_count': 25
            },
            {
                'id': 'measurement',
                'name': 'Đại lượng và Đo lường',
                'description': 'Độ dài, diện tích, thời gian, tiền Việt Nam',
                'icon': 'fa-ruler-combined',
                'exercise_count': 30
            }
        ];

        const container = document.getElementById('curriculumContainer');
        container.innerHTML = '';

        sampleCurriculum.forEach(topic => {
            const topicCard = this.createTopicCard(topic);
            container.appendChild(topicCard);
        });

        this.showTopicSelection();
    }

    createTopicCard(topic) {
        const card = document.createElement('div');
        card.className = 'topic-card';
        card.innerHTML = `
            <i class="fas ${topic.icon}"></i>
            <h3>${topic.name}</h3>
            <p>${topic.description}</p>
            <div class="progress-bar">
                <div class="progress" style="width: 0%"></div>
            </div>
            <small>${topic.exercise_count} bài tập</small>
        `;

        card.addEventListener('click', () => {
            this.loadExercises(topic.id);
        });

        return card;
    }

    async loadExercises(topicId) {
        try {
            this.currentTopic = topicId;
            const response = await fetch(`/api/exercises/${topicId}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success === false) {
                throw new Error(data.error);
            }

            this.exercises = data.exercises || [];
            this.showExerciseSection(topicId);
        } catch (error) {
            console.error('Error loading exercises:', error);
            this.showMessage('Lỗi tải bài tập! Sử dụng bài tập mẫu.', 'error');
            this.exercises = this.getSampleExercises(topicId);
            this.showExerciseSection(topicId);
        }
    }

    getSampleExercises(topicId) {
        const samples = {
            'numbers': [
                {
                    id: 1,
                    question: "15 + 27 = ?",
                    options: ["42", "32", "52", "37"],
                    correct_answer: "42",
                    explanation: "15 + 27 = 42",
                    points: 10
                },
                {
                    id: 2,
                    question: "48 : 6 = ?",
                    options: ["8", "6", "7", "9"],
                    correct_answer: "8",
                    explanation: "6 × 8 = 48, nên 48 : 6 = 8",
                    points: 10
                }
            ],
            'word_problems': [
                {
                    id: 3,
                    question: "Lan có 15 cái kẹo, Hoa có ít hơn Lan 4 cái kẹo. Hỏi Hoa có bao nhiêu cái kẹo?",
                    options: ["11", "12", "13", "14"],
                    correct_answer: "11",
                    explanation: "Hoa có số kẹo là: 15 - 4 = 11 (cái kẹo)",
                    points: 15
                }
            ],
            'geometry': [
                {
                    id: 4,
                    question: "Hình vuông có bao nhiêu cạnh bằng nhau?",
                    options: ["4 cạnh", "3 cạnh", "2 cạnh", "1 cạnh"],
                    correct_answer: "4 cạnh",
                    explanation: "Hình vuông có 4 cạnh bằng nhau",
                    points: 10
                }
            ],
            'measurement': [
                {
                    id: 5,
                    question: "2 giờ = ... phút?",
                    options: ["120", "130", "140", "150"],
                    correct_answer: "120",
                    explanation: "1 giờ = 60 phút, vậy 2 giờ = 2 × 60 = 120 phút",
                    points: 10
                }
            ]
        };
        return samples[topicId] || [];
    }

    showTopicSelection() {
        document.getElementById('curriculumContainer').classList.remove('hidden');
        document.getElementById('exerciseSection').classList.add('hidden');
    }

    showExerciseSection(topicId) {
        document.getElementById('curriculumContainer').classList.add('hidden');
        document.getElementById('exerciseSection').classList.remove('hidden');

        // Update topic info
        const topicNames = {
            'numbers': 'Số học và Phép tính',
            'word_problems': 'Giải toán có lời văn',
            'geometry': 'Hình học',
            'measurement': 'Đại lượng và Đo lường'
        };

        document.getElementById('exerciseTopic').textContent = topicNames[topicId] || topicId;
        document.getElementById('exerciseDescription').textContent = 'Làm bài tập và nhận giải thích từ AI';

        this.renderExercises();
    }

    renderExercises() {
        const container = document.getElementById('exerciseContainer');
        container.innerHTML = '';

        if (this.exercises.length === 0) {
            container.innerHTML = `
                <div class="no-exercises">
                    <i class="fas fa-book-open" style="font-size: 3rem; color: #666; margin-bottom: 1rem;"></i>
                    <h3>Chưa có bài tập nào</h3>
                    <p>Hãy thử tạo bài tập với AI hoặc chọn chủ đề khác.</p>
                </div>
            `;
            return;
        }

        this.exercises.forEach((exercise, index) => {
            const exerciseElement = this.createExerciseElement(exercise, index);
            container.appendChild(exerciseElement);
        });
    }

    createExerciseElement(exercise, index) {
        const div = document.createElement('div');
        div.className = 'exercise-item';
        
        // Thêm class đặc biệt cho bài tập AI
        if (exercise.isAI) {
            div.classList.add('ai-exercise');
        }
        
        div.innerHTML = `
            <div class="exercise-question">
                ${index + 1}. ${exercise.question}
                ${exercise.isAI ? '<span class="ai-badge">🤖 AI</span>' : ''}
            </div>
            <div class="exercise-options">
                ${exercise.options.map(option => `
                    <button class="option-btn" data-value="${option}">${option}</button>
                `).join('')}
            </div>
            <div class="exercise-feedback"></div>
        `;

        // Add event listeners to option buttons
        div.querySelectorAll('.option-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.checkAnswer(exercise, btn.dataset.value, div);
            });
        });

        return div;
    }

    async checkAnswer(exercise, userAnswer, exerciseElement) {
        const feedback = exerciseElement.querySelector('.exercise-feedback');
        const isCorrect = userAnswer === exercise.correct_answer;

        // Update UI
        exerciseElement.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
            btn.disabled = true;
            
            if (btn.dataset.value === userAnswer) {
                btn.classList.add('selected');
            }
            if (btn.dataset.value === exercise.correct_answer) {
                btn.style.background = '#51cf66';
                btn.style.color = 'white';
            }
        });

        // Show basic feedback
        if (isCorrect) {
            feedback.innerHTML = `
                <div class="correct">
                    <strong>✅ Chính xác!</strong>
                    <p>${exercise.explanation}</p>
                </div>
            `;
        } else {
            feedback.innerHTML = `
                <div class="incorrect">
                    <strong>❌ Chưa đúng!</strong>
                    <p>Đáp án đúng: ${exercise.correct_answer}</p>
                    <p>${exercise.explanation}</p>
                </div>
            `;
        }

        feedback.classList.add('show');

        // Get AI explanation if available
        if (window.aiChat) {
            try {
                const aiExplanation = await window.aiChat.enhanceExerciseWithAI(exercise, userAnswer);
                if (aiExplanation && aiExplanation !== exercise.explanation) {
                    const aiSection = document.createElement('div');
                    aiSection.className = 'ai-explanation';
                    aiSection.innerHTML = aiExplanation;
                    feedback.appendChild(aiSection);
                }
            } catch (error) {
                console.error('Error getting AI explanation:', error);
            }
        }

        // Save progress
        if (this.currentUser) {
            await this.saveProgress(exercise.id, isCorrect ? exercise.points : 0, exercise.topic || this.currentTopic);
        }

        // Scroll to show full feedback
        feedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    async saveProgress(exerciseId, score, topic) {
        try {
            await fetch('/api/progress', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.currentUser.username,
                    exercise_id: exerciseId,
                    score: score,
                    time_spent: 60,
                    topic: topic
                })
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }

    async generateAIExercise() {
        if (!this.currentUser) {
            this.showMessage('Vui lòng đăng nhập để sử dụng AI!', 'error');
            return;
        }

        this.showMessage('🤖 AI đang tạo bài tập cá nhân hóa...', 'info');

        try {
            // Lấy tiến độ học tập để phân tích
            const progressResponse = await fetch(`/api/progress/${this.currentUser.username}`);
            if (!progressResponse.ok) {
                throw new Error('Không thể lấy dữ liệu tiến độ');
            }
            
            const progressData = await progressResponse.json();
            let weakTopics = ['numbers']; // mặc định
            let studentLevel = 'trung bình';

            if (progressData.success) {
                weakTopics = this.analyzeWeakTopics(progressData.progress);
                studentLevel = this.determineStudentLevel(progressData.progress);
            }

            console.log(`🎯 Tạo bài tập AI: Level=${studentLevel}, WeakTopics=`, weakTopics);

            // Gọi API AI thực tế
            const aiResponse = await fetch('/api/ai/adaptive-exercise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_level: studentLevel,
                    weak_topics: weakTopics,
                    progress_data: progressData.progress || {},
                    topic: this.currentTopic
                })
            });

            if (aiResponse.ok) {
                const aiData = await aiResponse.json();
                console.log('📦 AI Response:', aiData);
                
                if (aiData.success && aiData.exercise) {
                    // Thêm bài tập AI vào danh sách
                    const aiExercise = {
                        ...aiData.exercise,
                        id: 'ai-' + Date.now(),
                        topic: this.currentTopic,
                        isAI: true // đánh dấu bài tập AI
                    };

                    this.exercises.unshift(aiExercise);
                    this.renderExercises();
                    
                    this.showMessage('✅ AI đã tạo bài tập phù hợp với trình độ của bạn!', 'success');
                    
                    // Cuộn đến bài tập AI mới
                    const firstExercise = document.querySelector('.exercise-item');
                    if (firstExercise) {
                        firstExercise.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                    return;
                }
            }

            // Fallback: tạo bài tập đơn giản
            console.log('🔄 Sử dụng fallback exercise');
            this._createFallbackAIExercise(studentLevel, weakTopics);
            
        } catch (error) {
            console.error('❌ Lỗi tạo bài tập AI:', error);
            this._createFallbackAIExercise('trung bình', ['numbers']);
            this.showMessage('⚠️ Sử dụng bài tập mẫu - AI đang bận', 'info');
        }
    }

    _createFallbackAIExercise(studentLevel, weakTopics) {
        const levels = {
            'dễ': { 
                operations: [
                    { type: '+', num1: 10, num2: 5 },
                    { type: '+', num1: 15, num2: 7 },
                    { type: '-', num1: 20, num2: 8 }
                ]
            },
            'trung bình': { 
                operations: [
                    { type: '+', num1: 25, num2: 13 },
                    { type: '×', num1: 6, num2: 7 },
                    { type: '-', num1: 45, num2: 18 }
                ]
            },
            'khó': { 
                operations: [
                    { type: '×', num1: 8, num2: 9 },
                    { type: '÷', num1: 72, num2: 8 },
                    { type: '+', num1: 128, num2: 57 }
                ]
            }
        };

        const levelConfig = levels[studentLevel] || levels['trung bình'];
        const operation = levelConfig.operations[Math.floor(Math.random() * levelConfig.operations.length)];
        
        let question, correctAnswer, explanation;

        switch(operation.type) {
            case '+':
                correctAnswer = operation.num1 + operation.num2;
                question = `${operation.num1} + ${operation.num2} = ?`;
                explanation = `Giải: ${operation.num1} + ${operation.num2} = ${correctAnswer}`;
                break;
            case '-':
                correctAnswer = operation.num1 - operation.num2;
                question = `${operation.num1} - ${operation.num2} = ?`;
                explanation = `Giải: ${operation.num1} - ${operation.num2} = ${correctAnswer}`;
                break;
            case '×':
                correctAnswer = operation.num1 * operation.num2;
                question = `${operation.num1} × ${operation.num2} = ?`;
                explanation = `Giải: ${operation.num1} × ${operation.num2} = ${correctAnswer}`;
                break;
            case '÷':
                correctAnswer = operation.num1 / operation.num2;
                question = `${operation.num1} ÷ ${operation.num2} = ?`;
                explanation = `Giải: ${operation.num1} ÷ ${operation.num2} = ${correctAnswer}`;
                break;
        }

        const options = this._generateAIOptions(correctAnswer);

        const aiExercise = {
            id: 'ai-' + Date.now(),
            question: `🧠 ${question} (Bài tập AI - Trình độ ${studentLevel})`,
            options: options,
            correct_answer: correctAnswer.toString(),
            explanation: `🤖 **GIẢI THÍCH AI:**\n\n${explanation}\n\n💡 *Bài tập được AI tạo riêng cho trình độ ${studentLevel} của bạn!*`,
            topic: this.currentTopic,
            points: 15,
            isAI: true,
            difficulty: studentLevel
        };

        this.exercises.unshift(aiExercise);
        this.renderExercises();
    }

    _generateAIOptions(correctAnswer) {
        const correctNum = parseInt(correctAnswer);
        const options = new Set([correctNum]);
        
        // Tạo các lựa chọn sai có tính phân loại
        while (options.size < 4) {
            let variation;
            if (correctNum < 20) {
                variation = correctNum + Math.floor(Math.random() * 10) - 5;
            } else {
                variation = correctNum + Math.floor(Math.random() * 20) - 10;
            }
            
            if (variation > 0 && variation !== correctNum && !options.has(variation)) {
                options.add(variation);
            }
            
            // Tránh vòng lặp vô hạn
            if (options.size >= 4) break;
        }
        
        return Array.from(options).sort(() => Math.random() - 0.5).map(num => num.toString());
    }

    shuffleExercises() {
        if (this.exercises.length > 0) {
            // Fisher-Yates shuffle
            for (let i = this.exercises.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [this.exercises[i], this.exercises[j]] = [this.exercises[j], this.exercises[i]];
            }
            this.renderExercises();
            this.showMessage('Đã trộn bài tập!', 'info');
        }
    }

    analyzeWeakTopics(progress) {
        // Simple analysis
        const topicScores = {};
        const topicCounts = {};
        
        progress.completed_exercises.forEach(item => {
            if (item.topic && item.topic !== 'general') {
                if (!topicScores[item.topic]) {
                    topicScores[item.topic] = 0;
                    topicCounts[item.topic] = 0;
                }
                topicScores[item.topic] += item.score;
                topicCounts[item.topic] += 1;
            }
        });

        const weakTopics = [];
        for (const [topic, totalScore] of Object.entries(topicScores)) {
            const avgScore = totalScore / topicCounts[topic];
            if (avgScore < 5) {
                weakTopics.push(topic);
            }
        }

        return weakTopics.length > 0 ? weakTopics : ['numbers'];
    }

    determineStudentLevel(progress) {
        const totalScore = progress.completed_exercises.reduce((sum, item) => sum + item.score, 0);
        const avgScore = progress.completed_exercises.length > 0 ? 
            totalScore / progress.completed_exercises.length : 0;

        if (avgScore >= 8) return 'khó';
        if (avgScore >= 5) return 'trung bình';
        return 'dễ';
    }

    async loadGames() {
        // Games are loaded when selected in games.js
        document.getElementById('gamesGrid').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
    }

    async loadProgress() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(`/api/progress/${this.currentUser.username}`);
            if (!response.ok) return;
            
            const data = await response.json();

            if (data.success) {
                this.updateProgressStats(data.progress);
                this.initializeProgressCharts(data.progress);

                // Load AI analysis
                if (window.aiChat && window.aiChat.aiService) {
                    try {
                        const analysis = await window.aiChat.aiService.analyzeStudentProfile(data.progress);
                        this.displayAIAnalysis(analysis);
                    } catch (error) {
                        console.error('Error loading AI analysis:', error);
                        this.displayAIAnalysis(null);
                    }
                }
            }

        } catch (error) {
            console.error('Error loading progress:', error);
        }
    }

    updateProgressStats(progress) {
        const totalExercises = progress.completed_exercises.length;
        const totalScore = progress.get_total_score ? progress.get_total_score() : 
            (progress.completed_exercises.reduce((sum, item) => sum + item.score, 0) + 
             progress.game_sessions.reduce((sum, item) => sum + item.score, 0));
        const accuracy = totalExercises > 0 ? 
            (progress.completed_exercises.filter(item => item.score >= 5).length / totalExercises * 100) : 0;
        const totalTime = (progress.completed_exercises.reduce((sum, item) => sum + item.time_spent, 0) + 
                         progress.game_sessions.reduce((sum, item) => sum + item.time_spent, 0)) / 60;

        document.getElementById('progressTotalScore').textContent = totalScore;
        document.getElementById('progressTotalExercises').textContent = totalExercises;
        document.getElementById('progressAccuracy').textContent = accuracy.toFixed(1) + '%';
        document.getElementById('progressStudyTime').textContent = Math.round(totalTime) + ' phút';
    }

    initializeProgressCharts(progress) {
        // This would be implemented in charts.js
        if (window.chartManager) {
            window.chartManager.initializeProgressCharts(progress);
        }
    }

    displayAIAnalysis(analysis) {
        const container = document.getElementById('aiAnalysisContent');
        
        if (!analysis) {
            container.innerHTML = `
                <p>Hãy hoàn thành một số bài tập để nhận phân tích từ AI!</p>
            `;
            return;
        }

        let html = '';

        if (analysis.strengths && analysis.strengths.length > 0) {
            html += `
                <div class="analysis-section">
                    <h4>📈 Điểm mạnh</h4>
                    ${analysis.strengths.map(strength => `
                        <div class="strength-item">
                            <i class="fas fa-check-circle"></i>
                            <span>${strength}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (analysis.weaknesses && analysis.weaknesses.length > 0) {
            html += `
                <div class="analysis-section">
                    <h4>📉 Điểm cần cải thiện</h4>
                    ${analysis.weaknesses.map(weakness => `
                        <div class="weakness-item">
                            <i class="fas fa-exclamation-circle"></i>
                            <span>${weakness}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        if (analysis.recommendations && analysis.recommendations.length > 0) {
            html += `
                <div class="analysis-section">
                    <h4>💡 Đề xuất học tập</h4>
                    ${analysis.recommendations.map(rec => `
                        <div class="recommendation-item">
                            <i class="fas fa-lightbulb"></i>
                            <span>${rec}</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        container.innerHTML = html || '<p>Chưa có dữ liệu phân tích đủ điều kiện.</p>';
    }

    async loadLeaderboard() {
        try {
            const response = await fetch('/api/leaderboard');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();

            if (data.success) {
                const tbody = document.getElementById('leaderboardBody');
                tbody.innerHTML = '';

                if (data.leaderboard.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" style="text-align: center; padding: 2rem; color: #666;">
                                <i class="fas fa-trophy" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>
                                <p>Chưa có dữ liệu xếp hạng</p>
                                <small>Hãy là người đầu tiên lên bảng xếp hạng!</small>
                            </td>
                        </tr>
                    `;
                    return;
                }

                data.leaderboard.forEach((user, index) => {
                    const row = document.createElement('tr');
                    
                    // Add crown for top 3
                    let rankIcon = '';
                    if (index === 0) rankIcon = '👑';
                    else if (index === 1) rankIcon = '🥈';
                    else if (index === 2) rankIcon = '🥉';

                    // Determine achievement
                    let achievement = '⭐ Mới bắt đầu';
                    if (user.total_score >= 100) achievement = '🏆 Xuất sắc';
                    else if (user.total_score >= 50) achievement = '🎯 Tiến bộ';
                    else if (user.total_score >= 20) achievement = '🚀 Nỗ lực';

                    row.innerHTML = `
                        <td>${index + 1} ${rankIcon}</td>
                        <td>${user.username}</td>
                        <td>${user.total_score}</td>
                        <td>${user.games_played}</td>
                        <td>${achievement}</td>
                    `;

                    // Highlight current user
                    if (this.currentUser && user.username === this.currentUser.username) {
                        row.style.background = 'linear-gradient(135deg, #667eea, #764ba2)';
                        row.style.color = 'white';
                        row.style.fontWeight = 'bold';
                    }

                    tbody.appendChild(row);
                });
            }
        } catch (error) {
            console.error('Error loading leaderboard:', error);
            this.showMessage('Lỗi tải bảng xếp hạng!', 'error');
        }
    }

    showMessage(message, type = 'info') {
        if (window.authManager) {
            window.authManager.showMessage(message, type);
        } else {
            // Fallback message display
            console.log(`${type}: ${message}`);
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mathApp = new MathMasterApp();
});