/**
 * Client-side Token Refresh Example
 * 
 * This file demonstrates how to implement token refresh functionality
 * in a frontend application using the KickAPI class.
 */

// Example of how to use the KickAPI class with token refresh
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the API with the token from localStorage or from the server
    initializeAPI();
    
    // Add event listeners for API actions
    setupEventListeners();
});

// Global API instance
let api = null;

/**
 * Initialize the KickAPI instance
 */
async function initializeAPI() {
    try {
        // First, try to get a fresh token from the server
        const token = await getInitialToken();
        
        if (token) {
            // Create the API instance with the token
            api = new KickAPI(token);
            console.log('API initialized successfully');
            
            // Update UI to show token is valid
            updateTokenStatus('valid');
        } else {
            // If no token is available, redirect to login
            window.location.href = '/auth/login';
        }
    } catch (error) {
        console.error('Failed to initialize API:', error);
        window.location.href = '/auth/login';
    }
}

/**
 * Get the initial access token from the server
 * @returns {Promise<string|null>} The access token or null if not available
 */
async function getInitialToken() {
    try {
        // Check if we have a token in localStorage first
        const storedToken = window.localStorage.getItem('accessToken');
        if (storedToken) {
            return storedToken;
        }
        
        // If no token in localStorage, request one from the server
        const response = await fetch('/api/token', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            return null;
        }
        
        const data = await response.json();
        if (data && data.accessToken) {
            // Store the token in localStorage
            window.localStorage.setItem('accessToken', data.accessToken);
            return data.accessToken;
        }
        
        return null;
    } catch (error) {
        console.error('Error getting initial token:', error);
        return null;
    }
}

/**
 * Set up event listeners for API actions
 */
function setupEventListeners() {
    // Example: Add event listener for a button that makes an API call
    const apiCallButton = document.getElementById('api-call-button');
    if (apiCallButton) {
        apiCallButton.addEventListener('click', handleApiCall);
    }
    
    // Example: Add event listener for manual token refresh
    const refreshTokenButton = document.getElementById('refresh-token-button');
    if (refreshTokenButton) {
        refreshTokenButton.addEventListener('click', handleManualTokenRefresh);
    }
}

/**
 * Handle API call button click
 */
async function handleApiCall() {
    try {
        if (!api) {
            console.error('API not initialized');
            return;
        }
        
        // Example API call
        const result = await api.getChannels();
        console.log('API call result:', result);
        
        // Update UI with the result
        const resultContainer = document.getElementById('api-result');
        if (resultContainer) {
            resultContainer.textContent = JSON.stringify(result, null, 2);
        }
    } catch (error) {
        console.error('API call failed:', error);
        
        // Check if the error is due to an unauthorized request
        if (error.name === 'UnauthorizedError') {
            // The token refresh should be handled automatically by the KickAPI class
            // But we can also handle it manually here if needed
            const refreshed = await api.refreshToken();
            if (refreshed) {
                console.log('Token refreshed manually after error');
                // Retry the API call
                handleApiCall();
            } else {
                console.error('Failed to refresh token after error');
                window.location.href = '/auth/login';
            }
        }
    }
}

/**
 * Handle manual token refresh button click
 */
async function handleManualTokenRefresh() {
    try {
        if (!api) {
            console.error('API not initialized');
            return;
        }
        
        const refreshed = await api.refreshToken();
        if (refreshed) {
            console.log('Token refreshed manually');
            updateTokenStatus('valid');
        } else {
            console.error('Failed to refresh token manually');
            updateTokenStatus('expired');
        }
    } catch (error) {
        console.error('Manual token refresh failed:', error);
        updateTokenStatus('expired');
    }
}

/**
 * Update the token status in the UI
 * @param {string} status - The token status ('valid' or 'expired')
 */
function updateTokenStatus(status) {
    const tokenStatus = document.getElementById('token-status');
    if (!tokenStatus) return;
    
    if (status === 'valid') {
        tokenStatus.textContent = 'Token: Valid';
        tokenStatus.className = 'status-valid';
    } else {
        tokenStatus.textContent = 'Token: Expired';
        tokenStatus.className = 'status-expired';
    }
}

/**
 * Start periodic token check
 * This helps ensure the token is always valid before it expires
 */
function startTokenCheck() {
    // Check token every 5 minutes (adjust as needed)
    setInterval(async () => {
        try {
            // Proactively refresh the token before it expires
            const refreshed = await api.refreshToken();
            if (refreshed) {
                console.log('Token refreshed proactively');
                updateTokenStatus('valid');
            } else {
                console.warn('Proactive token refresh failed');
                updateTokenStatus('expired');
            }
        } catch (error) {
            console.error('Error during proactive token refresh:', error);
        }
    }, 5 * 60 * 1000); // 5 minutes
}