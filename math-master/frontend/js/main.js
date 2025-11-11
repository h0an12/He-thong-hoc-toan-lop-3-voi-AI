// Main application initialization and utilities
class MainApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupGlobalEventListeners();
        this.initializeAnimations();
        this.checkFirstTimeVisit();
        console.log('Math Master App initialized successfully!');
    }

    setupGlobalEventListeners() {
        // Global error handler
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
            this.showGlobalError('Có lỗi xảy ra! Vui lòng tải lại trang.');
        });

        // Online/offline detection
        window.addEventListener('online', () => {
            this.showGlobalMessage('Kết nối đã được khôi phục!', 'success');
        });

        window.addEventListener('offline', () => {
            this.showGlobalMessage('Mất kết nối internet!', 'warning');
        });
    }

    initializeAnimations() {
        // Add CSS for animations
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .animate-fade-in-up {
                animation: fadeInUp 0.6s ease-out;
            }

            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        // Add animation classes to elements
        this.animateOnScroll();
    }

    animateOnScroll() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in-up');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        // Observe elements for animation
        document.querySelectorAll('.stat-card, .action-card, .topic-card, .game-card').forEach(el => {
            observer.observe(el);
        });
    }

    checkFirstTimeVisit() {
        const firstTime = !localStorage.getItem('mathMaster_visited');
        if (firstTime) {
            localStorage.setItem('mathMaster_visited', 'true');
            this.showWelcomeTour();
        }
    }

    showWelcomeTour() {
        setTimeout(() => {
            if (window.authManager) {
                window.authManager.showMessage(
                    'Chào mừng đến với Math Master! 🎉 Hãy khám phá các tính năng học Toán thú vị!',
                    'info'
                );
            }
        }, 2000);
    }

    showGlobalError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #ff6b6b;
            color: white;
            padding: 1rem;
            text-align: center;
            z-index: 10000;
            font-weight: 500;
        `;
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    }

    showGlobalMessage(message, type = 'info') {
        if (window.authManager) {
            window.authManager.showMessage(message, type);
        }
    }

    // Utility methods
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    calculatePercentage(part, total) {
        return total > 0 ? Math.round((part / total) * 100) : 0;
    }
}

// Global utility functions
const MathMasterUtils = {
    // Math-related utilities
    generateRandomMathProblem(type, difficulty) {
        const problems = {
            easy: {
                addition: () => {
                    const a = Math.floor(Math.random() * 50) + 1;
                    const b = Math.floor(Math.random() * 50) + 1;
                    return { question: `${a} + ${b} = ?`, answer: a + b };
                },
                subtraction: () => {
                    const a = Math.floor(Math.random() * 50) + 20;
                    const b = Math.floor(Math.random() * 20) + 1;
                    return { question: `${a} - ${b} = ?`, answer: a - b };
                }
            },
            medium: {
                multiplication: () => {
                    const a = Math.floor(Math.random() * 10) + 1;
                    const b = Math.floor(Math.random() * 10) + 1;
                    return { question: `${a} × ${b} = ?`, answer: a * b };
                },
                division: () => {
                    const b = Math.floor(Math.random() * 9) + 2;
                    const a = b * (Math.floor(Math.random() * 9) + 2);
                    return { question: `${a} ÷ ${b} = ?`, answer: a / b };
                }
            }
        };

        const problemGenerator = problems[difficulty]?.[type];
        return problemGenerator ? problemGenerator() : null;
    },

    // Date utilities
    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    getTimeAgo(date) {
        const now = new Date();
        const diffMs = now - new Date(date);
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Vừa xong';
        if (diffMins < 60) return `${diffMins} phút trước`;
        if (diffHours < 24) return `${diffHours} giờ trước`;
        if (diffDays < 7) return `${diffDays} ngày trước`;
        return this.formatDate(date);
    }
};

// Initialize main app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mainApp = new MainApp();
    window.MathMasterUtils = MathMasterUtils;
    
    // Add loaded class to body for CSS transitions
    document.body.classList.add('loaded');
});