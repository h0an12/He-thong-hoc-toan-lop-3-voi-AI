class AuthManager {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
        this.setupEventListeners();
    }

    loadUserFromStorage() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.showApp();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('app').classList.add('hidden');
    }

    showApp() {
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('app').classList.remove('hidden');
        this.updateUserDisplay();
        
        // Initialize main app if it exists
        if (window.mathApp) {
            window.mathApp.currentUser = this.currentUser;
            window.mathApp.loadDashboard();
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout button
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Enter key support
        document.getElementById('loginPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleLogin();
            }
        });

        document.getElementById('regConfirmPassword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleRegister();
            }
        });
    }

    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!username || !password) {
            this.showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        const loginBtn = document.querySelector('#loginForm .btn-primary');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Đang đăng nhập...';
        loginBtn.disabled = true;

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                this.currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                this.showApp();
                this.showMessage('Đăng nhập thành công!', 'success');
                
                // Reset form
                document.getElementById('loginForm').reset();
            } else {
                this.showMessage(data.message || 'Đăng nhập thất bại!', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage('Lỗi kết nối! Vui lòng thử lại.', 'error');
        } finally {
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
        }
    }

    async handleRegister() {
        const username = document.getElementById('regUsername').value.trim();
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;
        const userType = document.getElementById('regUserType').value;

        if (!username || !password || !confirmPassword) {
            this.showMessage('Vui lòng điền đầy đủ thông tin!', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Mật khẩu xác nhận không khớp!', 'error');
            return;
        }

        if (password.length < 4) {
            this.showMessage('Mật khẩu phải có ít nhất 4 ký tự!', 'error');
            return;
        }

        if (username.length < 3) {
            this.showMessage('Tên đăng nhập phải có ít nhất 3 ký tự!', 'error');
            return;
        }

        const registerBtn = document.querySelector('#registerForm .btn-primary');
        const originalText = registerBtn.innerHTML;
        registerBtn.innerHTML = '<i class="fas fa-spinner loading"></i> Đang đăng ký...';
        registerBtn.disabled = true;

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password, user_type: userType })
            });

            const data = await response.json();

            if (data.success) {
                this.showMessage('Đăng ký thành công! Vui lòng đăng nhập.', 'success');
                openTab('loginTab');
                document.getElementById('registerForm').reset();
            } else {
                this.showMessage(data.message || 'Đăng ký thất bại!', 'error');
            }
        } catch (error) {
            console.error('Register error:', error);
            this.showMessage('Lỗi kết nối! Vui lòng thử lại.', 'error');
        } finally {
            registerBtn.innerHTML = originalText;
            registerBtn.disabled = false;
        }
    }

    handleLogout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showLogin();
        this.showMessage('Đã đăng xuất!', 'info');
    }

    updateUserDisplay() {
        if (this.currentUser) {
            document.getElementById('usernameDisplay').textContent = this.currentUser.username;
        }
    }

    showMessage(message, type = 'info') {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.message-toast');
        existingMessages.forEach(msg => msg.remove());

        const toast = document.createElement('div');
        toast.className = `message-toast message-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${this.getMessageIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        // Add styles
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${this.getMessageColor(type)};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
        `;

        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    getMessageIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    getMessageColor(type) {
        const colors = {
            success: '#51cf66',
            error: '#ff6b6b',
            warning: '#fcc419',
            info: '#4e54c8'
        };
        return colors[type] || '#4e54c8';
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }
}

// Tab switching function
function openTab(tabName) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected tab content
    document.getElementById(tabName).classList.add('active');

    // Activate selected tab button
    document.querySelector(`.tab-btn[onclick="openTab('${tabName}')"]`).classList.add('active');
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
});