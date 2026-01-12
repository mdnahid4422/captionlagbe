// Authentication Handler
// This file manages authentication UI and logic

class AuthHandler {
    constructor() {
        this.authModal = document.getElementById('auth-modal');
        this.loginBtn = document.getElementById('login-btn');
        this.closeModal = document.getElementById('close-modal');
        this.authForm = document.getElementById('auth-form');
        this.toggleForm = document.getElementById('toggle-form');
        this.modalTitle = document.getElementById('modal-title');
        this.submitAuth = document.getElementById('submit-auth');
        this.isLoginMode = true;
        this.init();
    }

    init() {
        this.attachEventListeners();
        this.updateUIForLoggedInUser();
    }

    attachEventListeners() {
        // Open login modal
        this.loginBtn.addEventListener('click', () => {
            this.openAuthModal();
        });

        // Close modal
        this.closeModal.addEventListener('click', () => {
            this.closeAuthModal();
        });

        // Toggle between login and signup
        this.toggleForm.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });

        // Form submission
        this.authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        // Close modal when clicking outside
        this.authModal.addEventListener('click', (e) => {
            if (e.target === this.authModal) {
                this.closeAuthModal();
            }
        });

        // Social login buttons
        document.querySelectorAll('.social-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                showToast('সোশাল লগইন ফিচারটি শীঘ্রই আসছে!', 'success');
            });
        });
    }

    openAuthModal() {
        this.authModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        this.isLoginMode = true;
        this.updateAuthUI();
    }

    closeAuthModal() {
        this.authModal.classList.remove('active');
        document.body.style.overflow = 'auto';
        this.authForm.reset();
    }

    toggleAuthMode() {
        this.isLoginMode = !this.isLoginMode;
        this.updateAuthUI();
    }

    updateAuthUI() {
        if (this.isLoginMode) {
            this.modalTitle.textContent = 'লগইন করুন';
            this.submitAuth.textContent = 'লগইন করুন';
            this.toggleForm.innerHTML = 'অ্যাকাউন্ট নেই? <a href="#">সাইন আপ করুন</a>';
        } else {
            this.modalTitle.textContent = 'নতুন অ্যাকাউন্ট তৈরি করুন';
            this.submitAuth.textContent = 'সাইন আপ করুন';
            this.toggleForm.innerHTML = 'ইতিমধ্যে অ্যাকাউন্ট আছে? <a href="#">লগইন করুন</a>';
        }
    }

    handleAuthSubmit() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Validate inputs
        if (!email || !password) {
            showToast('সব ফিল্ড পূরণ করুন।', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            showToast('বৈধ ইমেইল দিন।', 'error');
            return;
        }

        if (this.isLoginMode) {
            this.handleLogin(email, password);
        } else {
            this.handleSignUp(email, password);
        }
    }

    handleLogin(email, password) {
        const result = userStorage.loginUser(email, password);

        if (result.success) {
            showToast(result.message, 'success');
            this.closeAuthModal();
            this.updateUIForLoggedInUser();
        } else {
            showToast(result.message, 'error');
        }
    }

    handleSignUp(email, password) {
        const result = userStorage.registerUser(email, password);

        if (result.success) {
            showToast(result.message, 'success');
            // Auto-login after signup
            this.isLoginMode = true;
            this.authForm.reset();
            // Close modal and show login
            setTimeout(() => {
                this.closeAuthModal();
                this.updateUIForLoggedInUser();
            }, 1000);
        } else {
            showToast(result.message, 'error');
        }
    }

    updateUIForLoggedInUser() {
        const currentUser = userStorage.getCurrentUser();
        
        if (currentUser) {
            // User is logged in
            this.loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email.split('@')[0]}`;
            this.loginBtn.addEventListener('click', (e) => {
                if (this.loginBtn.classList.contains('logout-btn')) {
                    e.preventDefault();
                    this.handleLogout();
                }
            });
            this.loginBtn.classList.add('logged-in');
            this.loginBtn.title = 'ক্লিক করে লগআউট করুন';
        }
    }

    handleLogout() {
        userStorage.logoutUser();
        showToast('সফলভাবে লগআউট করা হয়েছে!', 'success');
        this.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> লগইন';
        this.loginBtn.classList.remove('logged-in');
        this.loginBtn.title = '';
        this.loginBtn.addEventListener('click', () => {
            this.openAuthModal();
        });
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize auth handler when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('auth-modal')) {
        window.authHandler = new AuthHandler();
    }
});
