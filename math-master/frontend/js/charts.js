class ChartManager {
    constructor() {
        this.progressChart = null;
        this.topicChart = null;
        this.init();
    }

    init() {
        // Charts will be initialized when needed
    }

    initializeProgressCharts(progressData) {
        this.destroyCharts();
        
        this.createProgressChart(progressData);
        this.createTopicChart(progressData);
    }

    createProgressChart(progressData) {
        const ctx = document.getElementById('progressChart');
        if (!ctx) return;
        
        // Process progress data for the last 7 days
        const last7Days = this.getLast7Days();
        const dailyScores = this.calculateDailyScores(progressData, last7Days);

        this.progressChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(day => this.formatDay(day)),
                datasets: [{
                    label: 'Điểm số hàng ngày',
                    data: dailyScores,
                    borderColor: '#4e54c8',
                    backgroundColor: 'rgba(78, 84, 200, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4e54c8',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: '#343a40',
                            font: {
                                size: 12,
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#343a40',
                        bodyColor: '#343a40',
                        borderColor: '#4e54c8',
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return `Điểm: ${context.parsed.y}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666'
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            color: '#666',
                            stepSize: 10
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                animations: {
                    tension: {
                        duration: 1000,
                        easing: 'linear'
                    }
                }
            }
        });
    }

    createTopicChart(progressData) {
        const ctx = document.getElementById('topicChart');
        if (!ctx) return;
        
        const topicScores = this.calculateTopicScores(progressData);

        this.topicChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(topicScores),
                datasets: [{
                    data: Object.values(topicScores),
                    backgroundColor: [
                        '#4e54c8',
                        '#8f94fb',
                        '#ff6b6b',
                        '#51cf66',
                        '#fcc419',
                        '#20c997',
                        '#e64980',
                        '#7950f2'
                    ],
                    borderColor: '#ffffff',
                    borderWidth: 3,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#343a40',
                            font: {
                                size: 11,
                                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
                            },
                            padding: 15,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#343a40',
                        bodyColor: '#343a40',
                        borderColor: '#4e54c8',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((context.parsed / total) * 100);
                                return `${context.label}: ${context.parsed} điểm (${percentage}%)`;
                            }
                        }
                    }
                },
                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });
    }

    getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }
        return days;
    }

    calculateDailyScores(progressData, days) {
        const dailyScores = days.map(day => {
            const dayExercises = progressData.completed_exercises.filter(item => {
                const itemDate = new Date(item.completed_at).toISOString().split('T')[0];
                return itemDate === day;
            });
            
            const dayGames = progressData.game_sessions.filter(item => {
                const itemDate = new Date(item.completed_at).toISOString().split('T')[0];
                return itemDate === day;
            });

            const exerciseScore = dayExercises.reduce((sum, item) => sum + item.score, 0);
            const gameScore = dayGames.reduce((sum, item) => sum + item.score, 0);
            
            return exerciseScore + gameScore;
        });
        return dailyScores;
    }

    calculateTopicScores(progressData) {
        const topicScores = {};

        // Process exercises
        progressData.completed_exercises.forEach(item => {
            const topic = this.getTopicName(item.topic);
            if (!topicScores[topic]) {
                topicScores[topic] = 0;
            }
            topicScores[topic] += item.score;
        });

        // Process games
        if (progressData.game_sessions && progressData.game_sessions.length > 0) {
            topicScores['Trò chơi'] = progressData.game_sessions.reduce((sum, game) => sum + game.score, 0);
        }

        // Remove topics with 0 score
        Object.keys(topicScores).forEach(topic => {
            if (topicScores[topic] === 0) {
                delete topicScores[topic];
            }
        });

        return topicScores;
    }

    getTopicName(topicId) {
        const topicNames = {
            'numbers': 'Số học',
            'geometry': 'Hình học',
            'measurement': 'Đo lường',
            'word_problems': 'Giải toán'
        };
        return topicNames[topicId] || topicId;
    }

    formatDay(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Hôm nay';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Hôm qua';
        } else {
            return date.toLocaleDateString('vi-VN', { 
                weekday: 'short',
                day: 'numeric',
                month: 'numeric'
            });
        }
    }

    destroyCharts() {
        if (this.progressChart) {
            this.progressChart.destroy();
            this.progressChart = null;
        }
        if (this.topicChart) {
            this.topicChart.destroy();
            this.topicChart = null;
        }
    }

    updateCharts(progressData) {
        this.initializeProgressCharts(progressData);
    }
}

// Initialize chart manager
document.addEventListener('DOMContentLoaded', () => {
    window.chartManager = new ChartManager();
});