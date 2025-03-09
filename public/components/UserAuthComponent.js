/**
 * UserAuthComponent.js
 * 
 * A component to handle user authentication state in the header.
 * Provides methods to:
 * - Check if user is logged in
 * - Display login or logout button based on authentication state
 * - Set and get user profile picture URL
 * - Save and retrieve user data from localStorage
 */

class UserAuthComponent {
    constructor(options = {}) {
        // Default configuration
        this.config = {
            avatarElementId: options.avatarElementId || 'user-avatar',
            usernameElementId: options.usernameElementId || 'username',
            authContainerId: options.authContainerId || 'auth-container',
            loginButtonText: options.loginButtonText || 'Iniciar sesión',
            logoutButtonText: options.logoutButtonText || 'Cerrar sesión',
            loginUrl: options.loginUrl || '/auth/login',
            logoutUrl: options.logoutUrl || '/auth/logout',
            defaultAvatarUrl: options.defaultAvatarUrl || 'https://via.placeholder.com/40',
            onLogin: options.onLogin || null,
            onLogout: options.onLogout || null
        };

        // User state
        this.userData = {
            isLoggedIn: false,
            username: '',
            avatarUrl: this.config.defaultAvatarUrl,
            accessToken: null
        };

        // Initialize component
        this.init();
    }

    /**
     * Initialize the component
     */
    init() {
        // Load user data from localStorage
        this.loadUserData();
        
        // Check if access token exists in localStorage
        const accessToken = window.localStorage.getItem('accessToken');
        if (accessToken) {
            this.userData.accessToken = accessToken;
            this.userData.isLoggedIn = true;
        }

        // Render the component
        this.render();
    }

    /**
     * Load user data from localStorage
     */
    loadUserData() {
        try {
            const savedData = window.localStorage.getItem('userData');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                this.userData = { ...this.userData, ...parsedData };
            }
        } catch (error) {
            console.error('Error loading user data from localStorage:', error);
        }
    }

    /**
     * Save user data to localStorage
     */
    saveUserData() {
        try {
            window.localStorage.setItem('userData', JSON.stringify(this.userData));
        } catch (error) {
            console.error('Error saving user data to localStorage:', error);
        }
    }

    /**
     * Set user profile data
     * @param {Object} data - User profile data
     */
    setUserProfile(data) {
        if (!data) return;

        this.userData.username = data.username || this.userData.username;
        this.userData.avatarUrl = data.avatarUrl || this.userData.avatarUrl;
        this.userData.isLoggedIn = true;
        
        // Save updated data to localStorage
        this.saveUserData();
        
        // Update UI
        this.render();
    }

    /**
     * Set user avatar URL
     * @param {string} url - Avatar URL
     */
    setUserAvatarUrl(url) {
        if (!url) return;
        
        this.userData.avatarUrl = url;
        this.saveUserData();
        
        // Update avatar in UI
        const avatarElement = document.getElementById(this.config.avatarElementId);
        if (avatarElement) {
            avatarElement.style.backgroundImage = `url(${url})`;
        }
    }

    /**
     * Get user avatar URL
     * @returns {string} Avatar URL
     */
    getUserAvatarUrl() {
        return this.userData.avatarUrl || this.config.defaultAvatarUrl;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return this.userData.isLoggedIn && !!this.userData.accessToken;
    }

    /**
     * Handle login action
     */
    login() {
        window.location.href = this.config.loginUrl;
    }

    /**
     * Handle logout action
     */
    logout() {
        // Clear user data
        this.userData = {
            isLoggedIn: false,
            username: '',
            avatarUrl: this.config.defaultAvatarUrl,
            accessToken: null
        };
        
        // Remove tokens from localStorage
        window.localStorage.removeItem('accessToken');
        window.localStorage.removeItem('userData');
        
        // Redirect to logout URL
        window.location.href = this.config.logoutUrl;
        
        // Call logout callback if provided
        if (typeof this.config.onLogout === 'function') {
            this.config.onLogout();
        }
    }

    /**
     * Render the component
     */
    render() {
        // Update username display
        const usernameElement = document.getElementById(this.config.usernameElementId);
        if (usernameElement) {
            usernameElement.textContent = this.userData.isLoggedIn ? 
                this.userData.username : 'Invitado';
        }
        
        // Update avatar display
        const avatarElement = document.getElementById(this.config.avatarElementId);
        if (avatarElement) {
            avatarElement.style.backgroundImage = `url(${this.getUserAvatarUrl()})`;
        }
        
        // Update auth container (login/logout button)
        const authContainer = document.getElementById(this.config.authContainerId);
        if (authContainer) {
            if (this.isLoggedIn()) {
                // Show user info and logout button
                authContainer.innerHTML = `
                    <div class="user-info">
                        <div class="avatar" id="${this.config.avatarElementId}" style="background-image: url(${this.getUserAvatarUrl()}); background-size: cover;"></div>
                        <span id="${this.config.usernameElementId}">${this.userData.username}</span>
                        <button class="logout-btn" id="logout-button">${this.config.logoutButtonText}</button>
                    </div>
                `;
                
                // Add event listener to logout button
                const logoutButton = document.getElementById('logout-button');
                if (logoutButton) {
                    logoutButton.addEventListener('click', () => this.logout());
                }
            } else {
                // Show login button
                authContainer.innerHTML = `
                    <button class="login-btn" id="login-button">${this.config.loginButtonText}</button>
                `;
                
                // Add event listener to login button
                const loginButton = document.getElementById('login-button');
                if (loginButton) {
                    loginButton.addEventListener('click', () => this.login());
                }
            }
        }
    }

    /**
     * Update user data from API response
     * @param {Object} apiResponse - API response with user data
     */
    updateFromApiResponse(apiResponse) {
        if (!apiResponse) return;
        
        const userData = {
            username: apiResponse.username || apiResponse.name || '',
            avatarUrl: apiResponse.avatar_url || apiResponse.profile_image_url || ''
        };
        
        this.setUserProfile(userData);
    }
}

// Export the component
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserAuthComponent;
} else {
    window.UserAuthComponent = UserAuthComponent;
}