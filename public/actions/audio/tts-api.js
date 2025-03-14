/**
 * TTS API Module
 * 
 * This module provides a unified API for text-to-speech functionality.
 * It integrates all TTS providers and configuration management.
 */

import { TTSManager } from './tts-providers.js';
import { getTTSconfig, saveTTSconfig, setCustomApiEndpoint } from './tts-config.js';

/**
 * TTS API class - Main entry point for the TTS functionality
 */
class TTSAPI {
    constructor(options = {}) {
        // Get configuration from localStorage or use defaults
        const config = options.config || getTTSconfig(options.configKey);
        
        // Create TTS Manager
        this.ttsManager = new TTSManager(config);
        this.configKey = options.configKey;
        
        // Initialize providers
        this.initialize();
    }
    
    /**
     * Initialize the TTS API
     */
    async initialize() {
        try {
            await this.ttsManager.initialize();
            return true;
        } catch (error) {
            console.error('Failed to initialize TTS API:', error);
            return false;
        }
    }
    
    /**
     * Get all available voices from all providers
     */
    getAllVoices() {
        return this.ttsManager.getAllVoices();
    }
    
    /**
     * Speak text using the specified provider
     * @param {string} text - Text to speak
     * @param {Object} options - Options for speech
     * @returns {Promise<any>} Promise that resolves when speech starts
     */
    async speak(text, options = {}) {
        return this.ttsManager.speak(text, options);
    }
    
    /**
     * Generate audio URL for the provided text
     * @param {string} text - Text to convert to audio
     * @param {Object} options - Options for audio generation
     * @returns {Promise<string>} Promise that resolves with audio URL
     */
    async generateAudioUrl(text, options = {}) {
        return this.ttsManager.generateAudioUrl(text, options);
    }
    
    /**
     * Stop any ongoing speech from all providers
     */
    stopAll() {
        this.ttsManager.stopAll();
    }
    
    /**
     * Save current configuration to localStorage
     */
    saveConfig() {
        return this.ttsManager.saveConfigToLocalStorage(this.configKey);
    }
    
    /**
     * Update configuration for a specific provider
     * @param {string} provider - Provider name (webSpeech, responsiveVoice, customApi)
     * @param {Object} config - Provider configuration
     */
    updateProviderConfig(provider, config) {
        if (this.ttsManager.config[provider]) {
            this.ttsManager.config[provider] = { ...this.ttsManager.config[provider], ...config };
            this.saveConfig();
            return true;
        }
        return false;
    }
    
    /**
     * Set the API endpoint for the custom API provider
     * @param {string} endpoint - The API endpoint URL
     */
    setCustomApiEndpoint(endpoint) {
        this.updateProviderConfig('customApi', { 
            endpoint, 
            enabled: !!endpoint // Enable if endpoint is provided
        });
        
        // Reinitialize the custom API provider
        this.ttsManager.providers.customApi.endpoint = endpoint;
        this.ttsManager.providers.customApi.initialize()
            .then(available => {
                if (available && !this.ttsManager.availableProviders.includes('customApi')) {
                    this.ttsManager.availableProviders.push('customApi');
                }
            });
    }
    
    /**
     * Update StreamElements provider configuration
     * @param {Object} config - StreamElements provider configuration
     */
    updateStreamElementsConfig(config) {
        return this.updateProviderConfig('streamElements', config);
    }
    
    /**
     * Add audio to the player queue
     * @param {string} text - Text to convert to audio
     * @param {Object} options - Options for audio generation
     * @param {Object} audioPlayer - Audio player instance to add the audio to
     */
    async addToQueue(text, options = {}, audioPlayer) {
        if (!audioPlayer || !audioPlayer.controlMedia) {
            throw new Error('Invalid audio player instance');
        }
        
        try {
            const audioUrl = await this.generateAudioUrl(text, options);
            
            // Create title for the queue item
            const title = options.title || 
                `${options.provider || 'TTS'}: ${text.substring(0, 30)}${text.length > 30 ? '...' : ''}`;
            
            // Add to queue
            audioPlayer.controlMedia.addSong({
                url: audioUrl,
                title: title
            });
            
            return true;
        } catch (error) {
            console.error('Failed to add to queue:', error);
            return false;
        }
    }
}

// Create a singleton instance for global use
let ttsApiInstance = null;

/**
 * Get the TTS API instance
 * @param {Object} options - Options for the TTS API
 * @returns {TTSAPI} The TTS API instance
 */
function getTTSAPI(options = {}) {
    if (!ttsApiInstance) {
        ttsApiInstance = new TTSAPI(options);
    }
    return ttsApiInstance;
}

export { TTSAPI, getTTSAPI };