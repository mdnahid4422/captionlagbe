// Authentication Handler (FINAL FIXED VERSION)
// Email/Password -> localStorage (demo)
// Google Login -> Firebase Auth

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
        this.refreshLoginButton();
    }

    attachEventListeners() {
        // Login / Logout button
        this.loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentUser = userStorage.getCurrentUser();
            if (currentUser) {
                this.handleLogout();
            } else {
                this.openAuthModal();
            }
        });

        // Close modal
        this.closeModal.addEventListener('click', () => this.closeAuthModal());

        // Toggle login/signup
        this.toggleForm.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleAuthMode();
        });

        // Email/Password submit
        this.authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAuthSubmit();
        });

        // Close modal on backdrop click
        this.authModal.addEventListener('click', (e) => {
            if (e.target === this.authModal) this.closeAuthModal();
        });

        // 🔥 Google Login (Firebase)
        const googleBtn = document.querySelector('.google-btn');
        if (googleBtn) {
            googleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                console.log('🔥 Google login start');

                try {
                    const provider = new firebase.auth.GoogleAuthProvider();
                    const result = await firebase.auth().signInWithPopup(provider);

                    const user = result.user;

                    // Save minimal user to localStorage (for UI)
                    userStorage.setCurrentUser({
                        email: user.email,
                        provider: 'google'
                    });

                    console.log('✅ Google User:', user.email);
                    showToast?.('Google দিয়ে লগইন সফল ✅', 'success');

                    this.closeAuthModal();
                    this.refreshLoginButton();

                } catch (err) {
                    console.error('❌ Google login error:', err);
                    showToast?.(err.message, 'error');
                }
            });
        }
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

        if (!email || !password) {
            showToast?.('সব ফিল্ড পূরণ করুন।', 'error');
            return;
        }

        if (!this.isValidEmail(email)) {
            showToast?.('বৈধ ইমেইল দিন।', 'error');
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
            showToast?.(result.message, 'success');
            this.closeAuthModal();
            this.refreshLoginButton();
        } else {
            showToast?.(result.message, 'error');
        }
    }

    handleSignUp(email, password) {
        const result = userStorage.registerUser(email, password);

        if (result.success) {
            showToast?.(result.message, 'success');
            this.closeAuthModal();
            this.refreshLoginButton();
        } else {
            showToast?.(result.message, 'error');
        }
    }

    refreshLoginButton() {
        const currentUser = userStorage.getCurrentUser();

        if (currentUser) {
            this.loginBtn.innerHTML = `<i class="fas fa-user"></i> ${currentUser.email.split('@')[0]}`;
            this.loginBtn.classList.add('logged-in');
            this.loginBtn.title = 'ক্লিক করে লগআউট করুন';
        } else {
            this.loginBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> লগ-ইন';
            this.loginBtn.classList.remove('logged-in');
            this.loginBtn.title = '';
        }
    }

    handleLogout() {
        userStorage.logoutUser();
        showToast?.('সফলভাবে লগআউট করা হয়েছে!', 'success');
        this.refreshLoginButton();
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
}

// Init AuthHandler
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('auth-modal')) {
        window.authHandler = new AuthHandler();
    }
});
