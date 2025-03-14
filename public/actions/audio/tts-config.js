/**
 * TTS Configuration Module
 * 
 * This module provides configuration utilities for the TTS system.
 * It allows loading and saving configuration from localStorage.
 */

// Default configuration key in localStorage
const DEFAULT_CONFIG_KEY = 'tts_config';

/**
 * Get TTS configuration from localStorage or use defaults
 * @param {string} key - The localStorage key to use
 * @returns {Object} The configuration object
 */
function getTTSconfig(key = DEFAULT_CONFIG_KEY) {
    try {
        // Try to get config from localStorage
        const storedConfig = localStorage.getItem(key);
        if (storedConfig) {
            return JSON.parse(storedConfig);
        }
    } catch (error) {
        console.error('Error loading TTS config from localStorage:', error);
    }
    
    // Return default configuration if nothing in localStorage or error occurred
    return {
        webSpeech: {
            enabled: true,
            defaultVoice: null,
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0
        },
        responsiveVoice: {
            enabled: true,
            defaultVoice: "UK English Female",
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0
        },
        customApi: {
            enabled: false,
            endpoint: "",
            defaultVoice: "Conchita",
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0
        },
        streamElements: {
            enabled: true,
            defaultVoice: "Brian",
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0
        }
    };
}

/**
 * Save TTS configuration to localStorage
 * @param {Object} config - The configuration to save
 * @param {string} key - The localStorage key to use
 * @returns {boolean} True if saved successfully
 */
function saveTTSconfig(config, key = DEFAULT_CONFIG_KEY) {
    try {
        localStorage.setItem(key, JSON.stringify(config));
        return true;
    } catch (error) {
        console.error('Error saving TTS config to localStorage:', error);
        return false;
    }
}

/**
 * Update specific provider configuration
 * @param {string} provider - The provider to update (webSpeech, responsiveVoice, customApi)
 * @param {Object} providerConfig - The new provider configuration
 * @param {string} key - The localStorage key to use
 * @returns {Object} The updated full configuration
 */
function updateProviderConfig(provider, providerConfig, key = DEFAULT_CONFIG_KEY) {
    const config = getTTSconfig(key);
    
    if (config[provider]) {
        config[provider] = { ...config[provider], ...providerConfig };
        saveTTSconfig(config, key);
    }
    
    return config;
}

/**
 * Enable or disable a specific provider
 * @param {string} provider - The provider to update
 * @param {boolean} enabled - Whether to enable or disable the provider
 * @param {string} key - The localStorage key to use
 * @returns {Object} The updated full configuration
 */
function setProviderEnabled(provider, enabled, key = DEFAULT_CONFIG_KEY) {
    return updateProviderConfig(provider, { enabled }, key);
}

/**
 * Set the API endpoint for the custom API provider
 * @param {string} endpoint - The API endpoint URL
 * @param {string} key - The localStorage key to use
 * @returns {Object} The updated full configuration
 */
function setCustomApiEndpoint(endpoint, key = DEFAULT_CONFIG_KEY) {
    return updateProviderConfig('customApi', { 
        endpoint, 
        enabled: !!endpoint // Enable if endpoint is provided
    }, key);
}

export { 
    getTTSconfig, 
    saveTTSconfig, 
    updateProviderConfig, 
    setProviderEnabled, 
    setCustomApiEndpoint,
    DEFAULT_CONFIG_KEY
};