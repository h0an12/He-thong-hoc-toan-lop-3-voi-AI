// mocktest.js - Mock Test Manager
class MockTestManager {
    constructor() {
        this.currentTest = null;
        this.userAnswers = {};
        this.timer = null;
        this.timeLeft = 0;
        this.currentQuestionIndex = 0;
        this.testStartTime = null;
        this.isTestActive = false;
        this.testHistory = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadTestHistory();
        console.log('✅ Mock Test Manager initialized');
    }

    setupEventListeners() {
        // Start mock test
        document.getElementById('startMockTest')?.addEventListener('click', () => {
            this.startMockTest();
        });

        // Navigation
        document.getElementById('prevQuestion')?.addEventListener('click', () => {
            this.previousQuestion();
        });

        document.getElementById('nextQuestion')?.addEventListener('click', () => {
            this.nextQuestion();
        });

        document.getElementById('submitTest')?.addEventListener('click', () => {
            this.submitTest();
        });

        // Nộp bài sớm
        document.getElementById('submitEarly')?.addEventListener('click', () => {
            this.submitEarly();
        });

        // Retry test
        document.getElementById('retryMockTest')?.addEventListener('click', () => {
            this.showTestSetup();
        });

        // View history
        document.getElementById('viewTestHistory')?.addEventListener('click', () => {
            this.showTestHistory();
        });

        // Back from history
        document.getElementById('backFromHistory')?.addEventListener('click', () => {
            this.showTestSetup();
        });

        // Quick start buttons
        document.querySelectorAll('.quick-test-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const type = e.target.closest('.quick-test-btn').dataset.testType;
                this.startQuickTest(type);
            });
        });

        // Enter key support for test options
        document.addEventListener('keydown', (e) => {
            if (this.isTestActive && e.key >= '1' && e.key <= '4') {
                const index = parseInt(e.key) - 1;
                this.selectOptionByIndex(index);
            }
        });

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isTestActive) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    e.preventDefault();
                    this.previousQuestion();
                    break;
                case 'ArrowRight':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case 'Enter':
                    e.preventDefault();
                    if (this.currentQuestionIndex === this.currentTest.questions.length - 1) {
                        this.submitTest();
                    } else {
                        this.nextQuestion();
                    }
                    break;
            }
        });
    }

    // === TEST SETUP METHODS ===
    async startMockTest() {
        try {
            const questionCount = document.getElementById('questionCount').value;
            const difficulty = document.getElementById('testDifficulty').value;
            const selectedTopics = Array.from(document.getElementById('testTopics').selectedOptions)
                .map(option => option.value);

            console.log('Starting test with:', { questionCount, difficulty, selectedTopics });

            this.showMessage('🤖 AI đang tạo đề thi...', 'info');

            // Try to get AI-generated test
            const test = await this.generateAITest(parseInt(questionCount), difficulty, selectedTopics);
            
            if (test) {
                this.currentTest = test;
                this.startTest();
            } else {
                // Fallback to sample test
                this.useSampleTest(parseInt(questionCount), difficulty, selectedTopics);
            }

        } catch (error) {
            console.error('Error starting mock test:', error);
            this.showMessage('Lỗi tạo đề thi! Sử dụng đề mẫu.', 'error');
            this.useSampleTest(10, 'medium', ['numbers', 'word_problems']);
        }
    }

    async generateAITest(questionCount, difficulty, topics) {
        try {
            const response = await fetch('/api/ai/mock-test/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_count: questionCount,
                    difficulty: difficulty,
                    topics: topics,
                    student_level: 'medium'
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success && data.test) {
                    return data.test;
                }
            }
            return null;
        } catch (error) {
            console.error('Error generating AI test:', error);
            return null;
        }
    }

    useSampleTest(questionCount, difficulty, topics) {
        const sampleQuestions = this.generateSampleQuestions(questionCount, difficulty, topics);
        
        this.currentTest = {
            id: 'sample-test-' + Date.now(),
            title: `Đề thi mẫu Toán lớp 3 - ${questionCount} câu`,
            description: 'Kiểm tra kiến thức cơ bản - Đề mẫu',
            time_limit: questionCount * 60, // 1 phút mỗi câu
            questions: sampleQuestions
        };
        
        this.startTest();
    }

    generateSampleQuestions(count, difficulty, topics) {
        const questions = [];
        const questionTemplates = this.getQuestionTemplates();
        
        for (let i = 0; i < count; i++) {
            const topic = topics[Math.floor(Math.random() * topics.length)];
            const template = questionTemplates[topic] || questionTemplates.numbers;
            const question = template[Math.floor(Math.random() * template.length)];
            
            questions.push({
                ...question,
                id: i + 1,
                points: this.calculatePoints(difficulty),
                topic: topic,
                difficulty: difficulty,
                time_recommended: this.calculateTimeRecommended(difficulty)
            });
        }
        
        return questions;
    }

    getQuestionTemplates() {
        return {
            numbers: [
                {
                    question: "15 + 27 = ?",
                    options: ["42", "32", "52", "37"],
                    correct_answer: "42",
                    explanation: "15 + 27 = 42"
                },
                {
                    question: "48 : 6 = ?",
                    options: ["8", "6", "7", "9"],
                    correct_answer: "8", 
                    explanation: "6 × 8 = 48, nên 48 : 6 = 8"
                },
                {
                    question: "7 × 8 = ?",
                    options: ["56", "54", "58", "60"],
                    correct_answer: "56",
                    explanation: "7 × 8 = 56"
                }
            ],
            word_problems: [
                {
                    question: "Lan có 15 cái kẹo, Hoa có ít hơn Lan 4 cái kẹo. Hỏi Hoa có bao nhiêu cái kẹo?",
                    options: ["11", "12", "13", "14"],
                    correct_answer: "11",
                    explanation: "Hoa có số kẹo là: 15 - 4 = 11 (cái kẹo)"
                },
                {
                    question: "Một cửa hàng có 36 quả cam, đã bán 1/4 số cam. Hỏi cửa hàng còn lại bao nhiêu quả cam?",
                    options: ["27", "28", "29", "30"],
                    correct_answer: "27",
                    explanation: "Số cam đã bán: 36 ÷ 4 = 9 quả. Số cam còn lại: 36 - 9 = 27 quả"
                }
            ],
            geometry: [
                {
                    question: "Hình vuông có bao nhiêu cạnh bằng nhau?",
                    options: ["4 cạnh", "3 cạnh", "2 cạnh", "1 cạnh"],
                    correct_answer: "4 cạnh",
                    explanation: "Hình vuông có 4 cạnh bằng nhau"
                },
                {
                    question: "Chu vi hình vuông có cạnh 5cm là bao nhiêu?",
                    options: ["20cm", "25cm", "15cm", "10cm"],
                    correct_answer: "20cm",
                    explanation: "Chu vi = 4 × cạnh = 4 × 5 = 20cm"
                }
            ],
            measurement: [
                {
                    question: "2 giờ = ... phút?",
                    options: ["120", "130", "140", "150"],
                    correct_answer: "120",
                    explanation: "1 giờ = 60 phút, vậy 2 giờ = 2 × 60 = 120 phút"
                },
                {
                    question: "3km = ... m?",
                    options: ["3000", "300", "30", "30000"],
                    correct_answer: "3000",
                    explanation: "1km = 1000m, vậy 3km = 3 × 1000 = 3000m"
                }
            ]
        };
    }

    calculatePoints(difficulty) {
        const points = {
            'easy': 10,
            'medium': 15,
            'hard': 20
        };
        return points[difficulty] || 10;
    }

    calculateTimeRecommended(difficulty) {
        const times = {
            'easy': 30,
            'medium': 45,
            'hard': 60
        };
        return times[difficulty] || 30;
    }

    startQuickTest(type) {
        const testConfigs = {
            'quick_5': { questions: 5, time: 300, title: 'Thi nhanh 5 câu' },
            'standard_10': { questions: 10, time: 600, title: 'Thi tiêu chuẩn 10 câu' },
            'full_20': { questions: 20, time: 1200, title: 'Thi đầy đủ 20 câu' },
            'challenge_15': { questions: 15, time: 900, title: 'Thử thách 15 câu' }
        };

        const config = testConfigs[type];
        if (config) {
            document.getElementById('questionCount').value = config.questions;
            this.showMessage(`Bắt đầu ${config.title}...`, 'info');
            
            // Use sample test for quick start
            this.useSampleTest(config.questions, 'medium', ['numbers', 'word_problems', 'geometry', 'measurement']);
        }
    }

    // === TEST EXECUTION METHODS ===
    startTest() {
        this.userAnswers = {};
        this.currentQuestionIndex = 0;
        this.timeLeft = this.currentTest.time_limit;
        this.testStartTime = new Date();
        this.isTestActive = true;

        this.showTestInterface();
        this.startTimer();
        this.displayCurrentQuestion();

        this.showMessage('Bài thi đã bắt đầu! Chúc bạn làm bài tốt! 🎯', 'success');
        this.playSound('start');
    }

    showTestInterface() {
        this.hideAllSections();
        document.getElementById('mockTestInterface').classList.remove('hidden');
    }

    showTestSetup() {
        this.hideAllSections();
        document.getElementById('mockTestSetup').classList.remove('hidden');
        
        // Reset state
        this.currentTest = null;
        this.userAnswers = {};
        this.isTestActive = false;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    showTestHistory() {
        this.hideAllSections();
        document.getElementById('testHistory').classList.remove('hidden');
        this.renderTestHistory();
    }

    showTestResults() {
        this.hideAllSections();
        document.getElementById('testResult').classList.remove('hidden');
    }

    hideAllSections() {
        const sections = ['mockTestSetup', 'mockTestInterface', 'testResult', 'testHistory'];
        sections.forEach(section => {
            document.getElementById(section).classList.add('hidden');
        });
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.timeUp();
            } else if (this.timeLeft === 300) {
                this.showMessage('⚠️ Còn 5 phút nữa!', 'warning');
                this.playSound('warning');
            } else if (this.timeLeft === 60) {
                this.showMessage('🚨 Còn 1 phút nữa!', 'error');
                this.playSound('urgent');
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('testTimer');
        if (timerElement) {
            timerElement.textContent = this.formatTime(this.timeLeft);
            
            // Change color when time is running out
            if (this.timeLeft < 300) {
                timerElement.style.color = '#ff6b6b';
                timerElement.style.fontWeight = 'bold';
            } else {
                timerElement.style.color = '';
                timerElement.style.fontWeight = '';
            }
        }
    }

    timeUp() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.showMessage('⏰ Hết giờ làm bài! Tự động nộp bài...', 'error');
        this.playSound('timeup');
        
        setTimeout(() => {
            this.submitTest();
        }, 2000);
    }

    // === QUESTION NAVIGATION ===
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayCurrentQuestion();
            this.playSound('click');
        }
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.currentTest.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
            this.playSound('click');
        }
    }

    goToQuestion(index) {
        if (index >= 0 && index < this.currentTest.questions.length) {
            this.currentQuestionIndex = index;
            this.displayCurrentQuestion();
        }
    }

    displayCurrentQuestion() {
        if (!this.currentTest || !this.currentTest.questions) return;

        const question = this.currentTest.questions[this.currentQuestionIndex];
        
        // Update test info
        document.getElementById('testTitle').textContent = this.currentTest.title;
        document.getElementById('testDescription').textContent = this.currentTest.description;

        // Update question info
        document.getElementById('currentQuestionNumber').textContent = this.currentQuestionIndex + 1;
        document.getElementById('totalQuestions').textContent = this.currentTest.questions.length;
        document.getElementById('testTopic').textContent = this.getTopicName(question.topic);
        document.getElementById('testDifficultyBadge').textContent = this.getDifficultyName(question.difficulty);
        document.getElementById('testDifficultyBadge').className = `difficulty-badge ${question.difficulty}`;

        // Display question
        document.getElementById('testQuestion').innerHTML = `
            <div class="question-text">${question.question}</div>
            <div class="question-meta">
                <span class="points">${question.points} điểm</span>
                <span class="time-rec">⏱ ${question.time_recommended}s</span>
                <span class="question-topic">${this.getTopicName(question.topic)}</span>
            </div>
        `;

        // Display options
        const optionsContainer = document.getElementById('testOptions');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionElement = document.createElement('div');
            optionElement.className = `test-option ${this.userAnswers[question.id] === option ? 'selected' : ''}`;
            optionElement.innerHTML = `
                <div class="option-letter">${String.fromCharCode(65 + index)}</div>
                <div class="option-text">${option}</div>
                <div class="option-shortcut">${index + 1}</div>
            `;
            optionElement.addEventListener('click', () => this.selectAnswer(question.id, option));
            optionsContainer.appendChild(optionElement);
        });

        this.updateNavigationButtons();
        this.updateProgress();
    }

    selectAnswer(questionId, answer) {
        this.userAnswers[questionId] = answer;
        this.displayCurrentQuestion();
        this.playSound('select');
    }

    selectOptionByIndex(index) {
        const question = this.currentTest.questions[this.currentQuestionIndex];
        if (question && question.options[index]) {
            this.selectAnswer(question.id, question.options[index]);
        }
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevQuestion');
        const nextBtn = document.getElementById('nextQuestion');
        const submitBtn = document.getElementById('submitTest');
        const submitEarlyBtn = document.getElementById('submitEarly');

        // Previous button
        prevBtn.disabled = this.currentQuestionIndex === 0;

        // Next button
        if (this.currentQuestionIndex < this.currentTest.questions.length - 1) {
            nextBtn.style.display = 'block';
            submitBtn.style.display = 'none';
        } else {
            nextBtn.style.display = 'none';
            submitBtn.style.display = 'block';
        }

        // Always show early submit button
        submitEarlyBtn.style.display = 'block';
    }

    updateProgress() {
        const progress = (Object.keys(this.userAnswers).length / this.currentTest.questions.length) * 100;
        const progressBar = document.getElementById('testProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        if (progressText) {
            progressText.textContent = 
                `${Object.keys(this.userAnswers).length}/${this.currentTest.questions.length} câu`;
        }
    }

    // === TEST SUBMISSION ===
    async submitEarly() {
        const timeSpent = this.currentTest.time_limit - this.timeLeft;
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentTest.questions.length;
        const remainingTime = this.formatTime(this.timeLeft);

        const confirmationMessage = 
            `🎯 BẠN MUỐN NỘP BÀI NGAY?\n\n` +
            `📊 Tiến độ: ${answeredCount}/${totalQuestions} câu đã trả lời\n` +
            `⏱ Thời gian đã làm: ${this.formatTime(timeSpent)}\n` +
            `⏰ Thời gian còn lại: ${remainingTime}\n` +
            `📝 Câu chưa làm: ${totalQuestions - answeredCount} câu\n\n` +
            `Bạn có chắc chắn muốn nộp bài ngay bây giờ?`;

        if (!confirm(confirmationMessage)) {
            this.playSound('click');
            return;
        }

        await this.processTestSubmission(timeSpent);
    }

    async submitTest() {
        const timeSpent = this.currentTest.time_limit - this.timeLeft;
        const answeredCount = Object.keys(this.userAnswers).length;
        const totalQuestions = this.currentTest.questions.length;

        const timeFormatted = this.formatTime(timeSpent);
        const confirmationMessage = answeredCount < totalQuestions ? 
            `Bạn mới trả lời ${answeredCount}/${totalQuestions} câu.\nThời gian: ${timeFormatted}\nBạn có chắc chắn muốn nộp bài không?` :
            `🎉 CHÚC MỪNG! Bạn đã hoàn thành tất cả ${totalQuestions} câu!\nThời gian: ${timeFormatted}\nBạn có chắc chắn muốn nộp bài không?`;

        if (!confirm(confirmationMessage)) {
            return;
        }

        await this.processTestSubmission(timeSpent);
    }

    async processTestSubmission(timeSpent) {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }

        this.showMessage('📊 AI đang chấm điểm và phân tích chi tiết...', 'info');

        try {
            // Evaluate test
            const evaluation = await this.evaluateTest();
            
            // Get AI analysis
            const analysis = await this.getAIAnalysis(evaluation);

            this.displayResults(evaluation, analysis, timeSpent);
            await this.saveTestResult(evaluation, timeSpent);
            
            this.showMessage('✅ Đã hoàn thành bài thi! Xem kết quả chi tiết bên dưới.', 'success');
            this.playSound('win');
        } catch (error) {
            console.error('Error submitting test:', error);
            this.showMessage('Lỗi chấm bài! Vui lòng thử lại.', 'error');
            this.playSound('error');
        }
    }

    async evaluateTest() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        let correctCount = 0;
        let totalScore = 0;
        const topicPerformance = {};
        const questionAnalysis = [];

        this.currentTest.questions.forEach(question => {
            const userAnswer = this.userAnswers[question.id];
            const isCorrect = userAnswer === question.correct_answer;
            
            if (isCorrect) {
                correctCount++;
                totalScore += question.points;
            }

            // Track topic performance
            if (!topicPerformance[question.topic]) {
                topicPerformance[question.topic] = { correct: 0, total: 0 };
            }
            topicPerformance[question.topic].total++;
            if (isCorrect) {
                topicPerformance[question.topic].correct++;
            }

            questionAnalysis.push({
                question: question.question,
                userAnswer: userAnswer,
                correctAnswer: question.correct_answer,
                isCorrect: isCorrect,
                explanation: question.explanation,
                topic: question.topic,
                difficulty: question.difficulty
            });
        });

        const accuracy = (correctCount / this.currentTest.questions.length) * 100;

        return {
            score: totalScore,
            correctCount: correctCount,
            totalQuestions: this.currentTest.questions.length,
            accuracy: Math.round(accuracy),
            topicPerformance: topicPerformance,
            questionAnalysis: questionAnalysis,
            strengths: this.identifyStrengths(topicPerformance),
            weaknesses: this.identifyWeaknesses(topicPerformance),
            recommendations: this.generateRecommendations(topicPerformance, accuracy)
        };
    }

    async getAIAnalysis(evaluation) {
        try {
            // Simulate AI analysis
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            return `Dựa trên kết quả bài thi, bạn đã thể hiện ${
                evaluation.accuracy >= 80 ? 'rất tốt' : 
                evaluation.accuracy >= 60 ? 'khá tốt' : 
                'cần cải thiện'
            } về kiến thức Toán lớp 3. ${
                evaluation.accuracy >= 80 ? 
                'Hãy tiếp tục duy trì phong độ này!' :
                'Đừng nản chí, luyện tập thêm sẽ giúp bạn tiến bộ!'
            }`;
        } catch (error) {
            return "Phân tích chi tiết từ AI hiện không khả dụng.";
        }
    }

    identifyStrengths(topicPerformance) {
        const strengths = [];
        Object.entries(topicPerformance).forEach(([topic, perf]) => {
            const accuracy = (perf.correct / perf.total) * 100;
            if (accuracy >= 80) {
                strengths.push(this.getTopicName(topic));
            }
        });
        return strengths.length > 0 ? strengths : ['Khả năng tập trung'];
    }

    identifyWeaknesses(topicPerformance) {
        const weaknesses = [];
        Object.entries(topicPerformance).forEach(([topic, perf]) => {
            const accuracy = (perf.correct / perf.total) * 100;
            if (accuracy < 60) {
                weaknesses.push(this.getTopicName(topic));
            }
        });
        return weaknesses.length > 0 ? weaknesses : ['Cần thực hành thêm các dạng bài tập'];
    }

    generateRecommendations(topicPerformance, overallAccuracy) {
        const recommendations = [];
        
        if (overallAccuracy < 60) {
            recommendations.push("Ôn tập lại các kiến thức cơ bản");
            recommendations.push("Làm thêm bài tập trong phần Học tập");
        }
        
        Object.entries(topicPerformance).forEach(([topic, perf]) => {
            const accuracy = (perf.correct / perf.total) * 100;
            if (accuracy < 70) {
                recommendations.push(`Luyện tập thêm chủ đề: ${this.getTopicName(topic)}`);
            }
        });

        if (recommendations.length === 0) {
            recommendations.push("Tiếp tục duy trì thói quen học tập");
            recommendations.push("Thử sức với các bài tập nâng cao");
        }

        return recommendations;
    }

    // === RESULTS DISPLAY ===
    displayResults(evaluation, analysis, timeSpent) {
        this.showTestResults();

        // Update basic stats
        document.getElementById('testScore').textContent = evaluation.score;
        document.getElementById('correctAnswers').textContent = 
            `${evaluation.correctCount}/${evaluation.totalQuestions}`;
        document.getElementById('testAccuracy').textContent = 
            `${evaluation.accuracy}%`;
        document.getElementById('testTimeSpent').textContent = this.formatTime(timeSpent);

        // Update performance level
        const performanceLevel = this.calculatePerformanceLevel(evaluation.accuracy);
        document.getElementById('performanceLevel').textContent = performanceLevel;

        // Update detailed analysis
        this.updateDetailedAnalysis(evaluation, analysis);
    }

    calculatePerformanceLevel(accuracy) {
        if (accuracy >= 90) return '🏆 Xuất sắc';
        if (accuracy >= 80) return '🎯 Rất tốt';
        if (accuracy >= 70) return '👍 Tốt';
        if (accuracy >= 60) return '📈 Khá';
        if (accuracy >= 50) return '💪 Trung bình';
        return '📚 Cần cố gắng';
    }

    updateDetailedAnalysis(evaluation, analysis) {
        // Strengths
        const strengthsList = document.getElementById('strengthsList');
        strengthsList.innerHTML = evaluation.strengths.map(strength => 
            `<li>✅ ${strength}</li>`
        ).join('');

        // Weaknesses
        const weaknessesList = document.getElementById('weaknessesList');
        weaknessesList.innerHTML = evaluation.weaknesses.map(weakness => 
            `<li>📝 ${weakness}</li>`
        ).join('');

        // Recommendations
        const recommendationsList = document.getElementById('recommendationsList');
        recommendationsList.innerHTML = evaluation.recommendations.map(rec => 
            `<li>💡 ${rec}</li>`
        ).join('');

        // Time evaluation
        const timeEvaluation = document.getElementById('timeEvaluation');
        const avgTimePerQuestion = (this.currentTest.time_limit - this.timeLeft) / this.currentTest.questions.length;
        timeEvaluation.textContent = `Trung bình ${Math.round(avgTimePerQuestion)} giây/câu - ${
            avgTimePerQuestion < 45 ? 'Quản lý thời gian tốt' :
            avgTimePerQuestion < 60 ? 'Quản lý thời gian khá' :
            'Cần cải thiện tốc độ làm bài'
        }`;

        // Topic breakdown
        const topicBreakdown = document.getElementById('topicBreakdown');
        topicBreakdown.innerHTML = Object.entries(evaluation.topicPerformance).map(([topic, perf]) => {
            const accuracy = Math.round((perf.correct / perf.total) * 100);
            return `
                <div class="topic-score">
                    <span>${this.getTopicName(topic)}</span>
                    <div class="score-bar">
                        <div class="score-fill" style="width: ${accuracy}%"></div>
                        <span>${accuracy}%</span>
                    </div>
                </div>
            `;
        }).join('');

        // Detailed analysis
        const detailedAnalysis = document.getElementById('detailedAnalysis');
        detailedAnalysis.innerHTML = `<div class="ai-analysis-text">${analysis}</div>`;
    }

    // === HISTORY MANAGEMENT ===
    async saveTestResult(evaluation, timeSpent) {
        try {
            const result = {
                test_id: this.currentTest.id,
                test_title: this.currentTest.title,
                score: evaluation.score,
                accuracy: evaluation.accuracy,
                time_spent: timeSpent,
                total_questions: this.currentTest.questions.length,
                correct_answers: evaluation.correctCount,
                completed_at: new Date().toISOString(),
                evaluation: evaluation
            };

            this.testHistory.unshift(result);
            localStorage.setItem('mathMaster_testHistory', JSON.stringify(this.testHistory));

            console.log('Test result saved:', result);
        } catch (error) {
            console.error('Error saving test result:', error);
        }
    }

    loadTestHistory() {
        try {
            const saved = localStorage.getItem('mathMaster_testHistory');
            this.testHistory = saved ? JSON.parse(saved) : [];
            console.log('Loaded test history:', this.testHistory.length, 'tests');
        } catch (error) {
            console.error('Error loading test history:', error);
            this.testHistory = [];
        }
    }

    renderTestHistory() {
        const container = document.getElementById('testHistoryContent');
        
        if (this.testHistory.length === 0) {
            container.innerHTML = `
                <div class="no-history">
                    <i class="fas fa-history" style="font-size: 3rem; color: #666; margin-bottom: 1rem;"></i>
                    <h3>Chưa có lịch sử bài thi</h3>
                    <p>Hãy làm bài thi đầu tiên để xem kết quả tại đây!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.testHistory.map((test, index) => `
            <div class="history-item ${index === 0 ? 'latest' : ''}">
                <div class="history-header">
                    <h4>${test.test_title}</h4>
                    <span class="history-date">${new Date(test.completed_at).toLocaleDateString('vi-VN')}</span>
                </div>
                <div class="history-stats">
                    <div class="history-stat">
                        <span class="stat-label">Điểm số</span>
                        <span class="stat-value">${test.score}</span>
                    </div>
                    <div class="history-stat">
                        <span class="stat-label">Độ chính xác</span>
                        <span class="stat-value">${test.accuracy}%</span>
                    </div>
                    <div class="history-stat">
                        <span class="stat-label">Thời gian</span>
                        <span class="stat-value">${this.formatTime(test.time_spent)}</span>
                    </div>
                    <div class="history-stat">
                        <span class="stat-label">Số câu</span>
                        <span class="stat-value">${test.correct_answers}/${test.total_questions}</span>
                    </div>
                </div>
                ${index === 0 ? '<div class="latest-badge">Mới nhất</div>' : ''}
            </div>
        `).join('');
    }

    // === UTILITY METHODS ===
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    getTopicName(topicId) {
        const topics = {
            'numbers': 'Số học',
            'word_problems': 'Giải toán có lời văn', 
            'geometry': 'Hình học',
            'measurement': 'Đo lường'
        };
        return topics[topicId] || topicId;
    }

    getDifficultyName(difficulty) {
        const difficulties = {
            'easy': 'Dễ',
            'medium': 'Trung bình',
            'hard': 'Khó'
        };
        return difficulties[difficulty] || difficulty;
    }

    showMessage(message, type) {
        if (window.authManager && window.authManager.showMessage) {
            window.authManager.showMessage(message, type);
        } else {
            // Fallback
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 1rem 1.5rem;
                background: ${type === 'error' ? '#ff6b6b' : type === 'warning' ? '#ffd43b' : '#51cf66'};
                color: white;
                border-radius: 8px;
                z-index: 1000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            `;
            messageDiv.textContent = message;
            document.body.appendChild(messageDiv);
            
            setTimeout(() => {
                messageDiv.remove();
            }, 3000);
        }
    }

    playSound(type) {
        // Basic sound implementation - can be enhanced with Web Audio API
        console.log('Play sound:', type);
        
        // You can add actual sound files here
        const sounds = {
            'click': () => console.log('click sound'),
            'select': () => console.log('select sound'),
            'start': () => console.log('start sound'),
            'warning': () => console.log('warning sound'),
            'urgent': () => console.log('urgent sound'),
            'timeup': () => console.log('timeup sound'),
            'win': () => console.log('win sound'),
            'error': () => console.log('error sound')
        };
        
        if (sounds[type]) {
            sounds[type]();
        }
    }

    // === CLEANUP ===
    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isTestActive = false;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mockTestManager = new MockTestManager();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockTestManager;
}