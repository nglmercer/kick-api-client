import { Queue, AudioPlayer, Controlmedia } from './audio/audio.js';
import { getTTSAPI } from './audio/tts-api.js';

class TTSPlayer {
    constructor(audioPlayerId) {
        // Initialize audio element
        this.audioElement = document.getElementById(audioPlayerId);
        this.audioElement.style.display = 'block';
        
        // Initialize AudioPlayer and ControlMedia
        this.audioPlayer = new AudioPlayer(audioPlayerId, 
            () => this.controlMedia.playPreviousAudio(),
            () => this.controlMedia.nextaudio());
        this.controlMedia = new Controlmedia(this.audioPlayer);
        
        // Initialize TTS API
        this.ttsAPI = getTTSAPI();
        this.voices = [];
        this.responsiveVoices = [];
        this.streamElementsVoices = [];
        
        // Initialize UI elements
        this.initUI();
        
        // Load available voices
        this.loadVoices();
    }
    
    initUI() {
        // Get UI elements
        this.textInput = document.getElementById('tts-text');
        this.voiceSelect = document.getElementById('voice-select');
        this.responsiveVoiceSelect = document.getElementById('responsive-voice-select');
        this.streamElementsVoiceSelect = document.getElementById('stream-elements-voice-select');
        this.rateInput = document.getElementById('rate-input');
        this.rateValue = document.getElementById('rate-value');
        this.pitchInput = document.getElementById('pitch-input');
        this.pitchValue = document.getElementById('pitch-value');
        this.webSpeechBtn = document.getElementById('play-web-speech');
        this.responsiveVoiceBtn = document.getElementById('play-responsive-voice');
        this.streamElementsBtn = document.getElementById('play-stream-elements');
        this.saveAudioBtn = document.getElementById('save-audio');
        this.autoPlayCheckbox = document.getElementById('auto-play-checkbox');
        
        // Add event listeners
        this.rateInput.addEventListener('input', () => {
            this.rateValue.textContent = this.rateInput.value;
        });
        
        this.pitchInput.addEventListener('input', () => {
            this.pitchValue.textContent = this.pitchInput.value;
        });
        
        this.webSpeechBtn.addEventListener('click', () => this.playWithWebSpeech());
        this.responsiveVoiceBtn.addEventListener('click', () => this.playWithResponsiveVoice());
        this.streamElementsBtn.addEventListener('click', () => this.playWithStreamElements());
        this.saveAudioBtn.addEventListener('click', () => this.saveAudio());
    }
    
    async loadVoices() {
        // Wait for TTS API to initialize
        await this.ttsAPI.initialize();
        
        // Get all voices from TTS API
        const allVoices = this.ttsAPI.getAllVoices();
        
        // Set Web Speech voices
        if (allVoices.webSpeech) {
            this.voices = allVoices.webSpeech;
            this.populateVoiceList();
        }
        
        // Set ResponsiveVoice voices
        if (allVoices.responsiveVoice) {
            this.responsiveVoices = allVoices.responsiveVoice;
            this.populateResponsiveVoiceList();
        }
        
        // Set StreamElements voices
        if (allVoices.streamElements) {
            this.streamElementsVoices = allVoices.streamElements;
            this.populateStreamElementsVoiceList();
        }
    }
    
    populateVoiceList() {
        // Clear existing options
        this.voiceSelect.innerHTML = '';
        
        // Add available voices to select element
        this.voices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.textContent = `${voice.name} (${voice.lang})`;
            option.setAttribute('data-lang', voice.lang);
            option.setAttribute('data-name', voice.name);
            option.value = index;
            this.voiceSelect.appendChild(option);
        });
    }
    
    populateResponsiveVoiceList() {
        // Clear existing options
        this.responsiveVoiceSelect.innerHTML = '';
        
        // Add available ResponsiveVoice voices to select element
        this.responsiveVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.textContent = voice.name;
            option.setAttribute('data-name', voice.name);
            option.value = index;
            this.responsiveVoiceSelect.appendChild(option);
        });
    }
    
    populateStreamElementsVoiceList() {
        // Clear existing options
        this.streamElementsVoiceSelect.innerHTML = '';
        
        // Add available StreamElements voices to select element
        this.streamElementsVoices.forEach((voice, index) => {
            const option = document.createElement('option');
            option.textContent = voice.name;
            option.setAttribute('data-name', voice.name);
            option.value = index;
            this.streamElementsVoiceSelect.appendChild(option);
        });
    }
    
    playWithWebSpeech() {
        const text = this.textInput.value.trim();
        if (!text) return;
        
        // Use the new helper method for consistency
        this.playTextWithWebSpeech(text);
    }
    
    playWithResponsiveVoice() {
        const text = this.textInput.value.trim();
        if (!text) return;
        
        // Use the new helper method for consistency
        this.playTextWithResponsiveVoice(text);
    }
    
    playWithStreamElements() {
        const text = this.textInput.value.trim();
        if (!text) return;
        
        // Use the new helper method for consistency
        this.playTextWithStreamElements(text);
    }
    
    // New method to play text with options
    playText(text, options = {}) {
        if (!text || typeof text !== 'string') {
            console.error('Text is required and must be a string');
            return;
        }
        
        // Determine which TTS engine to use (default to Web Speech)
        const engine = options.engine?.toLowerCase() || 'webspeech';
        
        if (engine === 'responsivevoice') {
            this.playTextWithResponsiveVoice(text, options);
        } else if (engine === 'customapi') {
            this.playTextWithCustomApi(text, options);
        } else if (engine === 'streamelements') {
            this.playTextWithStreamElements(text, options);
        } else {
            this.playTextWithWebSpeech(text, options);
        }
    }
    
    async playTextWithWebSpeech(text, options = {}) {
        // Set options based on UI values
        const ttsOptions = {
            provider: 'webSpeech',
            rate: options.rate !== undefined ? parseFloat(options.rate) : parseFloat(this.rateInput.value),
            pitch: options.pitch !== undefined ? parseFloat(options.pitch) : parseFloat(this.pitchInput.value),
            volume: options.volume !== undefined ? parseFloat(options.volume) : 1.0
        };
        
        // Set voice if specified, otherwise use selected voice
        if (options.voiceIndex !== undefined && options.voiceIndex >= 0 && options.voiceIndex < this.voices.length) {
            ttsOptions.voiceIndex = options.voiceIndex;
        } else if (options.voiceName) {
            ttsOptions.voiceName = options.voiceName;
        } else if (this.voiceSelect.selectedIndex !== -1) {
            ttsOptions.voiceIndex = this.voiceSelect.selectedIndex;
        }
        
        // Speak the text
        await this.ttsAPI.speak(text, ttsOptions);
        
        // Add to queue if auto-play is enabled and not explicitly disabled
        if (options.addToQueue !== false && this.autoPlayCheckbox.checked) {
            // Create title for the queue item
            const title = options.title || `Web Speech: ${text.substring(0, 30)}...`;
            
            // Add to queue
            await this.ttsAPI.addToQueue(text, {
                ...ttsOptions,
                title: title
            }, this);
        }
    }
    
    async playTextWithResponsiveVoice(text, options = {}) {
        // Set options based on UI values
        const ttsOptions = {
            provider: 'responsiveVoice',
            rate: options.rate !== undefined ? parseFloat(options.rate) : parseFloat(this.rateInput.value),
            pitch: options.pitch !== undefined ? parseFloat(options.pitch) : parseFloat(this.pitchInput.value),
            volume: options.volume !== undefined ? parseFloat(options.volume) : 1.0
        };
        
        // Determine voice name
        if (options.voiceName) {
            ttsOptions.voiceName = options.voiceName;
        } else if (options.voiceIndex !== undefined && 
                  options.voiceIndex >= 0 && 
                  options.voiceIndex < this.responsiveVoices.length) {
            ttsOptions.voiceIndex = options.voiceIndex;
        } else if (this.responsiveVoiceSelect.selectedIndex !== -1) {
            ttsOptions.voiceIndex = this.responsiveVoiceSelect.selectedIndex;
        }
        
        // Speak the text
        await this.ttsAPI.speak(text, ttsOptions);
        
        // Add to queue if auto-play is enabled and not explicitly disabled
        if (options.addToQueue !== false && this.autoPlayCheckbox.checked) {
            // Create title for the queue item
            const title = options.title || `ResponsiveVoice: ${text.substring(0, 30)}...`;
            
            // Add to queue
            await this.ttsAPI.addToQueue(text, {
                ...ttsOptions,
                title: title
            }, this);
        }
    }
    
    async playTextWithStreamElements(text, options = {}) {
        // Set options based on UI values
        const ttsOptions = {
            provider: 'streamElements',
            rate: options.rate !== undefined ? parseFloat(options.rate) : parseFloat(this.rateInput.value),
            pitch: options.pitch !== undefined ? parseFloat(options.pitch) : parseFloat(this.pitchInput.value),
            volume: options.volume !== undefined ? parseFloat(options.volume) : 1.0
        };
        
        // Determine voice name
        if (options.voiceName) {
            ttsOptions.voiceName = options.voiceName;
        } else if (options.voiceIndex !== undefined && 
                  options.voiceIndex >= 0 && 
                  options.voiceIndex < this.streamElementsVoices.length) {
            ttsOptions.voiceName = this.streamElementsVoices[options.voiceIndex].name;
        } else if (this.streamElementsVoiceSelect.selectedIndex !== -1) {
            const selectedIndex = this.streamElementsVoiceSelect.selectedIndex;
            ttsOptions.voiceName = this.streamElementsVoices[selectedIndex].name;
        }
        
        // Speak the text
        await this.ttsAPI.speak(text, ttsOptions);
        
        // Add to queue if auto-play is enabled and not explicitly disabled
        if (options.addToQueue !== false && this.autoPlayCheckbox.checked) {
            // Create title for the queue item
            const title = options.title || `StreamElements: ${text.substring(0, 30)}...`;
            
            // Add to queue
            await this.ttsAPI.addToQueue(text, {
                ...ttsOptions,
                title: title
            }, this);
        }
    }
    
    async playTextWithCustomApi(text, options = {}) {
        // Set options based on UI values
        const ttsOptions = {
            provider: 'customApi',
            rate: options.rate !== undefined ? parseFloat(options.rate) : parseFloat(this.rateInput.value),
            pitch: options.pitch !== undefined ? parseFloat(options.pitch) : parseFloat(this.pitchInput.value),
            volume: options.volume !== undefined ? parseFloat(options.volume) : 1.0
        };
        
        // Set voice if specified
        if (options.voiceName) {
            ttsOptions.voiceName = options.voiceName;
        }
        
        // Speak the text
        await this.ttsAPI.speak(text, ttsOptions);
        
        // Add to queue if auto-play is enabled and not explicitly disabled
        if (options.addToQueue !== false && this.autoPlayCheckbox.checked) {
            // Create title for the queue item
            const title = options.title || `Custom API: ${text.substring(0, 30)}...`;
            
            // Add to queue
            await this.ttsAPI.addToQueue(text, {
                ...ttsOptions,
                title: title
            }, this);
        }
    }
    
    saveAudio() {
        alert('Audio recording functionality is currently disabled and will be implemented in the future.');
    }
    
    // API methods for external use
    
    /**
     * Set the endpoint for the custom API provider
     * @param {string} endpoint - The API endpoint URL
     */
    setCustomApiEndpoint(endpoint) {
        this.ttsAPI.setCustomApiEndpoint(endpoint);
    }
    
    /**
     * Update configuration for a specific provider
     * @param {string} provider - Provider name (webSpeech, responsiveVoice, customApi, streamElements)
     * @param {Object} config - Provider configuration
     */
    updateProviderConfig(provider, config) {
        return this.ttsAPI.updateProviderConfig(provider, config);
    }
    
    /**
     * Save current configuration to localStorage
     */
    saveConfig() {
        return this.ttsAPI.saveConfig();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const ttsPlayer = new TTSPlayer('audio-player');
    
    // Make ttsPlayer available globally for direct API access
    window.ttsPlayer = ttsPlayer;
});
export { TTSPlayer };