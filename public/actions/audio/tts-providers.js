const DEFAULT_TTS_CONFIG = {
    webSpeech: {
        enabled: true,
        defaultVoice: null, // Will use system default
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
const defaultStreamElementsConfig = {
    enabled: true,
    defaultVoice: "Mia",
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0
};
/**
 * Base TTS Provider class that defines the interface for all providers
 */
class TTSProvider {
    constructor(config = {}) {
        this.config = config;
    }

    /**
     * Initialize the provider
     * @returns {Promise<boolean>} True if initialization was successful
     */
    async initialize() {
        return true;
    }

    /**
     * Check if the provider is available
     * @returns {boolean} True if the provider is available
     */
    isAvailable() {
        return false;
    }

    /**
     * Get available voices for this provider
     * @returns {Array} Array of available voices
     */
    getVoices() {
        return [];
    }

    /**
     * Speak the provided text
     * @param {string} text - Text to speak
     * @param {Object} options - Options for speech
     * @returns {Promise<any>} Promise that resolves when speech starts or rejects on error
     */
    async speak(text, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Generate audio URL for the provided text
     * @param {string} text - Text to convert to audio
     * @param {Object} options - Options for audio generation
     * @returns {Promise<string>} Promise that resolves with audio URL
     */
    async generateAudioUrl(text, options = {}) {
        throw new Error('Method not implemented');
    }

    /**
     * Stop any ongoing speech
     */
    stop() {
        // Default implementation does nothing
    }
}
class StreamElementsProvider extends TTSProvider {
    constructor(config = {}) {
        super(config);
        this.endpoint = "https://api.streamelements.com/kappa/v2/speech?";
        this.audioMap = {};
        this.audioKeys = [];
        this.lastReadText = "";
    }

    async initialize() {
        return true; // StreamElements API is always available
    }

    isAvailable() {
        return true; // StreamElements API is always available
    }

    getVoices() {
        // StreamElements voices
        return [
            { name: "Brian" },
            { name: "Amy" },
            { name: "Emma" },
            { name: "Ivy" },
            { name: "Joanna" },
            { name: "Justin" },
            { name: "Kendra" },
            { name: "Kimberly" },
            { name: "Matthew" },
            { name: "Salli" },
            { name: "Joey" },
            { name: "Mizuki" }
        ];
    }

    async speak(text, options = {}) {
        const audioUrl = await this.generateAudioUrl(text, options);
        
        // Create and play audio element
        const audio = new Audio(audioUrl);
        audio.volume = options.volume !== undefined ? parseFloat(options.volume) : this.config.volume;
        audio.play();
        
        return audio;
    }

    async generateAudioUrl(text, options = {}) {
        try {
            if (text === this.lastReadText) {
                return this.audioMap[text];
            }

            this.lastReadText = text;

            if (this.audioMap[text]) {
                return this.audioMap[text];
            }

            // Determine voice to use
            const voice = options.voiceName || this.config.defaultVoice || "Brian";
            
            const params = new URLSearchParams({
                voice: voice,
                text: text
            });

            // Add rate if specified
            if (options.rate !== undefined) {
                // StreamElements API doesn't directly support rate, but we can add it for future compatibility
                params.append('rate', options.rate);
            }

            // Add any additional parameters from options
            Object.keys(options).forEach(key => {
                if (!['voiceName', 'voiceIndex', 'rate', 'pitch', 'volume'].includes(key)) {
                    params.append(key, options[key]);
                }
            });

            const resp = await fetch(this.endpoint + params.toString());
            if (resp.status !== 200) {
                throw new Error(`StreamElements API error: status code ${resp.status}`);
            }

            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);

            this.audioMap[text] = blobUrl;
            this.audioKeys.push(text);

            // Limit cache size
            if (this.audioKeys.length > 100) {
                const oldestKey = this.audioKeys.shift();
                URL.revokeObjectURL(this.audioMap[oldestKey]);
                delete this.audioMap[oldestKey];
            }

            return blobUrl;
        } catch (error) {
            console.error("Error generating audio URL with StreamElements:", error);
            throw error;
        }
    }

    stop() {
        // Nothing to stop for this provider
    }
}
/**
 * Web Speech API Provider
 */
class WebSpeechProvider extends TTSProvider {
    constructor(config = {}) {
        super(config);
        this.synth = window.speechSynthesis;
        this.voices = [];
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async initialize() {
        // Load voices
        this.voices = this.synth.getVoices();
        
        if (this.voices.length === 0) {
            // If voices aren't loaded yet, wait for them
            return new Promise((resolve) => {
                window.speechSynthesis.addEventListener('voiceschanged', () => {
                    this.voices = this.synth.getVoices();
                    resolve(true);
                }, { once: true });
            });
        }
        
        return true;
    }

    isAvailable() {
        return !!window.speechSynthesis;
    }

    getVoices() {
        return this.voices;
    }

    async speak(text, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('Web Speech API is not available');
        }

        // Create utterance
        const utterance = new SpeechSynthesisUtterance(text);
        
        // Set voice
        if (options.voiceIndex !== undefined && options.voiceIndex >= 0 && options.voiceIndex < this.voices.length) {
            utterance.voice = this.voices[options.voiceIndex];
        } else if (options.voiceName) {
            const voice = this.voices.find(v => v.name === options.voiceName);
            if (voice) utterance.voice = voice;
        } else if (this.config.defaultVoice) {
            const voice = this.voices.find(v => v.name === this.config.defaultVoice);
            if (voice) utterance.voice = voice;
        }
        
        // Set rate and pitch
        utterance.rate = options.rate !== undefined ? parseFloat(options.rate) : this.config.rate;
        utterance.pitch = options.pitch !== undefined ? parseFloat(options.pitch) : this.config.pitch;
        
        // Set volume if specified
        if (options.volume !== undefined) {
            utterance.volume = parseFloat(options.volume);
        } else if (this.config.volume !== undefined) {
            utterance.volume = parseFloat(this.config.volume);
        }
        
        // Play the speech
        this.synth.speak(utterance);
        
        // Return the utterance for potential further handling
        return utterance;
    }

    async generateAudioUrl(text, options = {}) {
        if (!window.AudioContext && !window.webkitAudioContext) {
            throw new Error('AudioContext not supported');
        }
        
        // Create and speak the utterance
        const utterance = await this.speak(text, options);
        
        // Return a promise that resolves with the audio URL
        return new Promise((resolve, reject) => {
            // Initialize audio context if not already done
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            }
            
            // Create a MediaStreamDestination to capture the audio
            const destination = this.audioContext.createMediaStreamDestination();
            
            // Create a gain node
            const gainNode = this.audioContext.createGain();
            gainNode.gain.value = 1.0;
            gainNode.connect(destination);
            
            // Set up MediaRecorder
            this.audioChunks = [];
            let recorderOptions = {};
            
            // Try different MIME types for better compatibility
            try {
                recorderOptions = { mimeType: 'audio/webm' };
                this.mediaRecorder = new MediaRecorder(destination.stream, recorderOptions);
            } catch (e) {
                try {
                    recorderOptions = { mimeType: 'audio/mp4' };
                    this.mediaRecorder = new MediaRecorder(destination.stream, recorderOptions);
                } catch (e2) {
                    try {
                        this.mediaRecorder = new MediaRecorder(destination.stream);
                    } catch (err) {
                        reject(new Error('MediaRecorder not supported'));
                        return;
                    }
                }
            }
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                if (this.audioChunks.length > 0) {
                    // Use the correct MIME type from the recorder
                    const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
                    const audioBlob = new Blob(this.audioChunks, { type: mimeType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    resolve(audioUrl);
                } else {
                    reject(new Error('No audio chunks recorded'));
                }
            };
            
            // Start recording
            this.mediaRecorder.start(100);
            
            // Set up utterance events
            utterance.onstart = () => {
                // Speech started
            };
            
            utterance.onend = () => {
                // Add a small delay before stopping to ensure we capture all audio
                setTimeout(() => {
                    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                        this.mediaRecorder.stop();
                    }
                }, 500);
            };
            
            utterance.onerror = (event) => {
                if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
                    this.mediaRecorder.stop();
                }
                reject(new Error(`Speech error: ${event}`));
            };
        });
    }

    stop() {
        if (this.isAvailable()) {
            this.synth.cancel();
        }
    }
}

/**
 * responsiveVoice Provider
 */
class responsiveVoiceProvider extends TTSProvider {
    constructor(config = {}) {
        super(config);
        this.voices = [];
    }

    async initialize() {
        if (this.isAvailable() && window.responsiveVoice.getVoices) {
            this.voices = window.responsiveVoice.getVoices();
            return true;
        }
        return false;
    }

    isAvailable() {
        return !!window.responsiveVoice;
    }

    getVoices() {
        return this.voices;
    }

    async speak(text, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('responsiveVoice is not available', options);
        }

        // Determine voice name
        let voiceName = this.config.defaultVoice || "UK English Female";
        
        if (options.voiceName) {
            voiceName = options.voiceName;
        } else if (options.voiceIndex !== undefined && 
                  options.voiceIndex >= 0 && 
                  options.voiceIndex < this.voices.length) {
            voiceName = this.voices[options.voiceIndex].name;
        }
        
        // Set parameters
        const params = {
            rate: options.rate !== undefined ? parseFloat(options.rate) : this.config.rate,
            pitch: options.pitch !== undefined ? parseFloat(options.pitch) : this.config.pitch,
            onend: options.onend || (() => {})
        };
        
        // Set volume if specified
        if (options.volume !== undefined) {
            params.volume = parseFloat(options.volume);
        } else if (this.config.volume !== undefined) {
            params.volume = parseFloat(this.config.volume);
        }
        
        // Add any additional parameters from options
        Object.keys(options).forEach(key => {
            if (!['voiceName', 'voiceIndex', 'rate', 'pitch', 'volume', 'onend'].includes(key)) {
                params[key] = options[key];
            }
        });
        
        // Play with responsiveVoice
        window.responsiveVoice.speak(text, voiceName, params);
        
        return { voiceName, params };
    }

    async generateAudioUrl(text, options = {}) {
        // responsiveVoice doesn't provide a direct way to get audio URLs
        // This is a placeholder for future implementation
        throw new Error('responsiveVoice does not support direct audio URL generation');
    }

    stop() {
        if (this.isAvailable()) {
            window.responsiveVoice.cancel();
        }
    }
}

/**
 * Custom API Provider using fetchAudio
 */
class CustomApiProvider extends TTSProvider {
    constructor(config = {}) {
        super(config);
        this.endpoint = config.endpoint || "";
        this.audioMap = {};
        this.audioKeys = [];
        this.lastReadText = "";
    }

    async initialize() {
        return !!this.endpoint;
    }

    isAvailable() {
        return !!this.endpoint;
    }

    getVoices() {
        // This would ideally fetch available voices from the API
        // For now, return a simple array with the default voice
        return [{ name: this.config.defaultVoice || "Conchita" }];
    }

    async speak(text, options = {}) {
        const audioUrl = await this.generateAudioUrl(text, options);
        
        // Create and play audio element
        const audio = new Audio(audioUrl);
        audio.volume = options.volume !== undefined ? parseFloat(options.volume) : this.config.volume;
        audio.play();
        
        return audio;
    }

    async generateAudioUrl(text, options = {}) {
        if (!this.isAvailable()) {
            throw new Error('Custom API is not configured');
        }
        
        try {
            if (text === this.lastReadText) {
                return this.audioMap[text];
            }

            this.lastReadText = text;

            if (this.audioMap[text]) {
                return this.audioMap[text];
            }

            // Determine voice to use
            const voice = options.voiceName || this.config.defaultVoice || "Conchita";
            
            const params = new URLSearchParams({
                voice: voice,
                text: text
            });

            // Add any additional parameters from options
            Object.keys(options).forEach(key => {
                if (!['voiceName', 'voiceIndex', 'rate', 'pitch', 'volume'].includes(key)) {
                    params.append(key, options[key]);
                }
            });

            const resp = await fetch(this.endpoint + params.toString());
            if (resp.status !== 200) {
                throw new Error(`API error: status code ${resp.status}`);
            }

            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);

            this.audioMap[text] = blobUrl;
            this.audioKeys.push(text);

            // Limit cache size
            if (this.audioKeys.length > 100) {
                const oldestKey = this.audioKeys.shift();
                URL.revokeObjectURL(this.audioMap[oldestKey]);
                delete this.audioMap[oldestKey];
            }

            return blobUrl;
        } catch (error) {
            console.error("Error generating audio URL:", error);
            throw error;
        }
    }

    stop() {
        // Nothing to stop for this provider
    }
}

/**
 * StreamElements TTS Provider
 */
class StreamElementsProvider extends TTSProvider {
    constructor(config = {}) {
        super(config);
        this.endpoint = "https://api.streamelements.com/kappa/v2/speech?";
        this.audioMap = {};
        this.audioKeys = [];
        this.lastReadText = "";
    }

    async initialize() {
        return true; // StreamElements API is always available
    }

    isAvailable() {
        return true; // StreamElements API is always available
    }

    getVoices() {
        // StreamElements voices
        return [
            { name: "Brian" },
            { name: "Amy" },
            { name: "Emma" },
            { name: "Ivy" },
            { name: "Joanna" },
            { name: "Justin" },
            { name: "Kendra" },
            { name: "Kimberly" },
            { name: "Matthew" },
            { name: "Salli" },
            { name: "Joey" },
            { name: "Mizuki" }
        ];
    }

    async speak(text, options = {}) {
        const audioUrl = await this.generateAudioUrl(text, options);
        
        // Create and play audio element
        const audio = new Audio(audioUrl);
        audio.volume = options.volume !== undefined ? parseFloat(options.volume) : this.config.volume;
        audio.play();
        
        return audio;
    }

    async generateAudioUrl(text, options = {}) {
        try {
            if (text === this.lastReadText) {
                return this.audioMap[text];
            }

            this.lastReadText = text;

            if (this.audioMap[text]) {
                return this.audioMap[text];
            }

            // Determine voice to use
            const voice = options.voiceName || this.config.defaultVoice || "Brian";
            
            const params = new URLSearchParams({
                voice: voice,
                text: text
            });

            // Add rate if specified
            if (options.rate !== undefined) {
                // StreamElements API doesn't directly support rate, but we can add it for future compatibility
                params.append('rate', options.rate);
            }

            // Add any additional parameters from options
            Object.keys(options).forEach(key => {
                if (!['voiceName', 'voiceIndex', 'rate', 'pitch', 'volume'].includes(key)) {
                    params.append(key, options[key]);
                }
            });

            const resp = await fetch(this.endpoint + params.toString());
            if (resp.status !== 200) {
                throw new Error(`StreamElements API error: status code ${resp.status}`);
            }

            const blob = await resp.blob();
            const blobUrl = URL.createObjectURL(blob);

            this.audioMap[text] = blobUrl;
            this.audioKeys.push(text);

            // Limit cache size
            if (this.audioKeys.length > 100) {
                const oldestKey = this.audioKeys.shift();
                URL.revokeObjectURL(this.audioMap[oldestKey]);
                delete this.audioMap[oldestKey];
            }

            return blobUrl;
        } catch (error) {
            console.error("Error generating audio URL with StreamElements:", error);
            throw error;
        }
    }

    stop() {
        // Nothing to stop for this provider
    }
}

/**
 * TTS Manager - Main class that manages all TTS providers
 */
class TTSManager {
    constructor(config = {}) {
        // Merge provided config with defaults
        this.config = this._mergeConfig(DEFAULT_TTS_CONFIG, config);
        
        // Initialize providers
        this.providers = {
            webSpeech: new WebSpeechProvider(this.config.webSpeech),
            responsiveVoice: new responsiveVoiceProvider(this.config.responsiveVoice),
            customApi: new CustomApiProvider(this.config.customApi),
            streamElements: new StreamElementsProvider(this.config.streamElements)
        };
        
        // Track available providers
        this.availableProviders = [];
    }
    
    /**
     * Initialize all providers
     */
    async initialize() {
        const initPromises = [];
        
        // Initialize Web Speech API provider
        if (this.config.webSpeech.enabled) {
            initPromises.push(
                this.providers.webSpeech.initialize()
                    .then(available => {
                        if (available) this.availableProviders.push('webSpeech');
                        return available;
                    })
                    .catch(err => {
                        console.warn('Failed to initialize Web Speech API:', err);
                        return false;
                    })
            );
        }
        
        // Initialize responsiveVoice provider
        if (this.config.responsiveVoice.enabled) {
            console.log("this.config.responsiveVoice.enabled",this.config.responsiveVoice.enabled);
            initPromises.push(
                this.providers.responsiveVoice.initialize()
                    .then(available => {
                        if (available) this.availableProviders.push('responsiveVoice');
                        return available;
                    })
                    .catch(err => {
                        console.warn('Failed to initialize responsiveVoice:', err);
                        return false;
                    })
            );
        }
        
        // Initialize Custom API provider
        if (this.config.customApi.enabled && this.config.customApi.endpoint) {
            initPromises.push(
                this.providers.customApi.initialize()
                    .then(available => {
                        if (available) this.availableProviders.push('customApi');
                        return available;
                    })
                    .catch(err => {
                        console.warn('Failed to initialize Custom API:', err);
                        return false;
                    })
            );
        }
        
        // Initialize StreamElements provider
        if (this.config.streamElements.enabled) {
            initPromises.push(
                this.providers.streamElements.initialize()
                    .then(available => {
                        if (available) this.availableProviders.push('streamElements');
                        return available;
                    })
                    .catch(err => {
                        console.warn('Failed to initialize StreamElements API:', err);
                        return false;
                    })
            );
        }
        
        // Wait for all providers to initialize
        await Promise.all(initPromises);
        
        return this.availableProviders.length > 0;
    }
    
    /**
     * Get all available voices from all providers
     */
    getAllVoices() {
        const voices = {};
        
        this.availableProviders.forEach(providerName => {
            voices[providerName] = this.providers[providerName].getVoices();
        });
        
        return voices;
    }
    
    /**
     * Speak text using the specified provider
     * @param {string} text - Text to speak
     * @param {Object} options - Options for speech
     * @returns {Promise<any>} Promise that resolves when speech starts
     */
    async speak(text, options = {}) {
        const providerName = options.provider || this.availableProviders[0];
        
/*         if (!providerName || !this.availableProviders.includes(providerName)) {
            throw new Error(`Provider ${providerName} is not available`);
        } */
        
        return this.providers[providerName].speak(text, options);
    }
    
    /**
     * Generate audio URL for the provided text
     * @param {string} text - Text to convert to audio
     * @param {Object} options - Options for audio generation
     * @returns {Promise<string>} Promise that resolves with audio URL
     */
    async generateAudioUrl(text, options = {}) {
        const providerName = options.provider || this.availableProviders[0];
        
        if (!providerName || !this.availableProviders.includes(providerName)) {
            throw new Error(`Provider ${providerName} is not available`);
        }
        
        return this.providers[providerName].generateAudioUrl(text, options);
    }
    
    /**
     * Stop any ongoing speech from all providers
     */
    stopAll() {
        this.availableProviders.forEach(providerName => {
            this.providers[providerName].stop();
        });
    }
    
    /**
     * Helper method to merge configs
     */
    _mergeConfig(defaultConfig, userConfig) {
        const result = JSON.parse(JSON.stringify(defaultConfig));
        
        // If user provided a config, merge it with defaults
        if (userConfig) {
            Object.keys(userConfig).forEach(key => {
                if (typeof userConfig[key] === 'object' && userConfig[key] !== null) {
                    result[key] = { ...result[key], ...userConfig[key] };
                } else {
                    result[key] = userConfig[key];
                }
            });
        }
        
        return result;
    }
    
    /**
     * Load configuration from localStorage
     */
    static loadConfigFromLocalStorage(key = 'tts_config') {
        try {
            const storedConfig = localStorage.getItem(key);
            return storedConfig ? JSON.parse(storedConfig) : null;
        } catch (error) {
            console.error('Error loading TTS config from localStorage:', error);
            return null;
        }
    }
    
    /**
     * Save configuration to localStorage
     */
    saveConfigToLocalStorage(key = 'tts_config') {
        try {
            localStorage.setItem(key, JSON.stringify(this.config));
            return true;
        } catch (error) {
            console.error('Error saving TTS config to localStorage:', error);
            return false;
        }
    }
}

// Pasamos un objeto vacío como argumento inicial
export { TTSProvider, WebSpeechProvider, responsiveVoiceProvider, CustomApiProvider, StreamElementsProvider, TTSManager, DEFAULT_TTS_CONFIG };
/*(function(obj = {}) {
    // Aquí puedes modificar/añadir propiedades a obj si lo necesitas
    // Por ejemplo:
    obj.saludar = () => console.log('Hola');
    obj.numero = 42;

    // Export para CommonJS
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = obj;
    }
    
    // Export para ES Modules (corrección de sintaxis)
    if (typeof import.meta !== 'undefined') {
        // Opción 1: Export default
        export default obj;
        
        // O Opción 2: Named export
         export { obj };
    }
})({}); */