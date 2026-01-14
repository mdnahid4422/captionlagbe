// User Storage Management
// This file handles user registration and login data storage

class UserStorage {
    constructor() {
        this.storageKey = 'captionLagbe_users';
        this.currentUserKey = 'captionLagbe_currentUser';
        this.initializeStorage();
    }

    // Initialize storage with default users if empty
    initializeStorage() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify([]));
        }
    }

    // Get all users
    getAllUsers() {
        try {
            return JSON.parse(localStorage.getItem(this.storageKey)) || [];
        } catch (error) {
            console.error('Error retrieving users:', error);
            return [];
        }
    }

    // Register a new user
    registerUser(email, password) {
        const users = this.getAllUsers();
        
        // Check if user already exists
        if (users.some(user => user.email === email)) {
            return {
                success: false,
                message: 'এই ইমেইল ইতিমধ্যে রেজিস্ট্রেশন করা আছে।'
            };
        }

        // Validate password
        if (password.length < 6) {
            return {
                success: false,
                message: 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার দীর্ঘ হতে হবে।'
            };
        }

        // Create new user object
        const newUser = {
            id: Date.now(),
            email: email,
            password: this.hashPassword(password), // Simple hash for demo
            createdAt: new Date().toISOString(),
            lastLogin: null,
            profile: {
                name: '',
                avatar: '',
                bio: ''
            }
        };

        users.push(newUser);
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        return {
            success: true,
            message: 'অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে!',
            user: newUser
        };
    }

    // Login user
    loginUser(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return {
                success: false,
                message: 'ইমেইল বা পাসওয়ার্ড ভুল।'
            };
        }

        if (user.password !== this.hashPassword(password)) {
            return {
                success: false,
                message: 'ইমেইল বা পাসওয়ার্ড ভুল।'
            };
        }

        // Update last login
        user.lastLogin = new Date().toISOString();
        const userIndex = users.findIndex(u => u.id === user.id);
        users[userIndex] = user;
        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Set current user session
        this.setCurrentUser(user);

        return {
            success: true,
            message: 'সফলভাবে লগইন করা হয়েছে!',
            user: user
        };
    }

    // Set current logged-in user
    setCurrentUser(user) {
        const userCopy = { ...user };
        delete userCopy.password; // Don't store password in session
        localStorage.setItem(this.currentUserKey, JSON.stringify(userCopy));
    }

    // Get current logged-in user
    getCurrentUser() {
        try {
            return JSON.parse(localStorage.getItem(this.currentUserKey));
        } catch (error) {
            return null;
        }
    }

    // Logout user
    logoutUser() {
        localStorage.removeItem(this.currentUserKey);
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Update user profile
    updateUserProfile(userId, profileData) {
        const users = this.getAllUsers();
        const userIndex = users.findIndex(u => u.id === userId);

        if (userIndex === -1) {
            return {
                success: false,
                message: 'ব্যবহারকারী পাওয়া যায়নি।'
            };
        }

        users[userIndex].profile = {
            ...users[userIndex].profile,
            ...profileData
        };

        localStorage.setItem(this.storageKey, JSON.stringify(users));

        // Update current user if it's the same user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.setCurrentUser(users[userIndex]);
        }

        return {
            success: true,
            message: 'প্রোফাইল আপডেট করা হয়েছে।',
            user: users[userIndex]
        };
    }

    // Simple hash function (for demo purposes only)
    // In production, use bcrypt or similar
    hashPassword(password) {
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return 'hash_' + Math.abs(hash).toString(36);
    }

    // Delete user account
    deleteUserAccount(userId) {
        const users = this.getAllUsers();
        const filteredUsers = users.filter(u => u.id !== userId);
        localStorage.setItem(this.storageKey, JSON.stringify(filteredUsers));

        // Logout if current user
        const currentUser = this.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.logoutUser();
        }

        return {
            success: true,
            message: 'অ্যাকাউন্ট সফলভাবে ডিলিট করা হয়েছে।'
        };
    }

    // Get user statistics
    getUserStats(userId) {
        const users = this.getAllUsers();
        const user = users.find(u => u.id === userId);

        if (!user) {
            return null;
        }

        return {
            userId: user.id,
            email: user.email,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            profile: user.profile
        };
    }
}

// Create global instance
const userStorage = new UserStorage();
