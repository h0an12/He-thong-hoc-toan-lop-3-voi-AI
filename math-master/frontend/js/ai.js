class AIServices {
    constructor() {
        this.chatHistory = [];
        this.isInitialized = false;
        this.studentProfile = this.loadStudentProfile();
        this.init();
    }

    loadStudentProfile() {
        return JSON.parse(localStorage.getItem('studentProfile')) || {
            interests: ['khám phá', 'động vật', 'thể thao'],
            learning_style: 'visual',
            favorite_topics: ['numbers'],
            performance_level: 'trung bình'
        };
    }

    saveStudentProfile() {
        localStorage.setItem('studentProfile', JSON.stringify(this.studentProfile));
    }

    init() {
        this.isInitialized = true;
        console.log('AI Services initialized');
    }

    async getAIExplanation(question, userAnswer, correctAnswer, topic) {
        try {
            const response = await fetch('/api/ai/explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    user_answer: userAnswer,
                    correct_answer: correctAnswer,
                    topic: topic
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.success ? data.explanation : null;
        } catch (error) {
            console.error('AI Explanation error:', error);
            return null;
        }
    }

    async getSmartExplanation(question, userAnswer, correctAnswer, topic, studentLevel) {
        try {
            const response = await fetch('/api/ai/smart-explain', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: question,
                    user_answer: userAnswer,
                    correct_answer: correctAnswer,
                    topic: topic,
                    student_level: studentLevel || this.studentProfile.performance_level
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.success ? data.explanation : null;
        } catch (error) {
            console.error('Smart Explanation error:', error);
            return null;
        }
    }

    async generatePersonalizedExercise(studentLevel, weakTopics, topic) {
        try {
            const response = await fetch('/api/ai/generate-exercise', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    student_level: studentLevel,
                    weak_topics: weakTopics,
                    topic: topic
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.success ? data.exercise : null;
        } catch (error) {
            console.error('AI Generate Exercise error:', error);
            return null;
        }
    }

    async analyzeStudentProfile(progressData) {
        try {
            const response = await fetch('/api/ai/analyze-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    progress_data: progressData
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.success ? data.analysis : null;
        } catch (error) {
            console.error('AI Analysis error:', error);
            return null;
        }
    }

    async chatWithAITutor(message, context = {}) {
        try {
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: context
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.chatHistory.push({
                    role: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                });
                this.chatHistory.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });

                if (this.chatHistory.length > 20) {
                    this.chatHistory = this.chatHistory.slice(-20);
                }
            }

            return data.success ? data.response : 'Xin lỗi, tôi không thể trả lời ngay bây giờ.';
        } catch (error) {
            console.error('AI Chat error:', error);
            return 'Kết nối có vấn đề. Hãy thử lại sau!';
        }
    }

    async smartChatWithTutor(message, context = {}) {
        try {
            const response = await fetch('/api/ai/smart-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    context: {
                        ...context,
                        student_profile: this.studentProfile
                    }
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.success) {
                this.chatHistory.push({
                    role: 'user',
                    content: message,
                    timestamp: new Date().toISOString()
                });
                this.chatHistory.push({
                    role: 'assistant',
                    content: data.response,
                    timestamp: new Date().toISOString()
                });

                if (this.chatHistory.length > 20) {
                    this.chatHistory = this.chatHistory.slice(-20);
                }
            }

            return data.success ? data.response : 'Xin lỗi, tôi không thể trả lời ngay bây giờ.';
        } catch (error) {
            console.error('Smart Chat error:', error);
            return await this.chatWithAITutor(message, context);
        }
    }

    async enhanceExerciseWithAI(exercise, userAnswer) {
        const explanation = await this.getSmartExplanation(
            exercise.question,
            userAnswer,
            exercise.correct_answer,
            exercise.topic,
            this.studentProfile.performance_level
        );

        return explanation || exercise.explanation;
    }

    getChatHistory() {
        return this.chatHistory;
    }

    clearChatHistory() {
        this.chatHistory = [];
    }
}

class AIChatInterface {
    constructor() {
        this.aiService = new AIServices();
        this.isOpen = false;
        this.isMinimized = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        console.log('AI Chat Interface initialized');
    }

    setupEventListeners() {
        // Open/close chat
        document.getElementById('openChat').addEventListener('click', () => this.toggleChat());
        document.getElementById('closeChat').addEventListener('click', () => this.closeChat());
        document.getElementById('minimizeChat').addEventListener('click', () => this.minimizeChat());

        // Send message
        document.getElementById('sendMessage').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        // Quick questions
        document.querySelectorAll('.quick-question').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.closest('.quick-question').dataset.question;
                document.getElementById('chatInput').value = question;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        const chatWidget = document.getElementById('aiChatWidget');
        this.isOpen = !this.isOpen;
        
        if (this.isOpen) {
            chatWidget.classList.add('open');
            document.getElementById('chatInput').focus();
            this.hideNotification();
        } else {
            chatWidget.classList.remove('open');
        }
    }

    closeChat() {
        document.getElementById('aiChatWidget').classList.remove('open');
        this.isOpen = false;
    }

    minimizeChat() {
        const chatWidget = document.getElementById('aiChatWidget');
        this.isMinimized = !this.isMinimized;
        chatWidget.classList.toggle('minimized');
    }

    async sendMessage() {
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Prepare context
            const context = {
                username: window.authManager?.getCurrentUser()?.username || 'Học sinh',
                current_topic: this.getCurrentTopic(),
                level: this.aiService.studentProfile.performance_level
            };

            // Get AI response
            const response = await this.aiService.smartChatWithTutor(message, context);
            
            // Remove typing indicator and add AI response
            this.hideTypingIndicator();
            this.addMessage('assistant', response);

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!');
        }
    }

    addMessage(role, content) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;
        
        const avatar = role === 'user' ? 
            '<div class="message-avatar"><i class="fas fa-user"></i></div>' :
            '<div class="message-avatar"><i class="fas fa-robot"></i></div>';
        
        messageDiv.innerHTML = `
            ${avatar}
            <div class="message-content">
                <div class="message-text">${this.formatMessage(content)}</div>
                <div class="message-time">${new Date().toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    formatMessage(content) {
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message ai-message typing';
        typingDiv.id = 'typingIndicator';
        
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="typing-text">AI Tutor đang suy nghĩ...</div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    showNotification() {
        const notificationDot = document.querySelector('.notification-dot');
        const chatButton = document.getElementById('openChat');
        
        if (notificationDot && chatButton) {
            notificationDot.style.display = 'block';
            chatButton.classList.add('pulse');
        }
    }

    hideNotification() {
        const notificationDot = document.querySelector('.notification-dot');
        const chatButton = document.getElementById('openChat');
        
        if (notificationDot && chatButton) {
            notificationDot.style.display = 'none';
            chatButton.classList.remove('pulse');
        }
    }

    getCurrentTopic() {
        return window.mathApp?.currentTopic || 'Toán tổng hợp';
    }

    async enhanceExerciseWithAI(exercise, userAnswer) {
        return await this.aiService.enhanceExerciseWithAI(exercise, userAnswer);
    }
}

// Initialize AI Chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiChat = new AIChatInterface();
    window.aiServices = window.aiChat.aiService;
});