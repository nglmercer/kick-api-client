// tts_config.js
// provider getVoices() = function() { return []; }
const voicesSelect = {
    "streamElements": parseVoices(new StreamElementsProvider().getVoices()),
    "responsiveVoice":  parseVoices(new ResponsiveVoiceProvider().getVoices()),
    "webSpeech":  parseVoices(new WebSpeechProvider().getVoices())
}
function parseVoices(voices) {
    if (!voices) return [];
    const mapedVoices = voices.map(v => ({ name: v.name, label: v.name, value: v.name }));
    console.log("voices", voices, mapedVoices);
    return mapedVoices;
}

const TTSConfigManager = {
    // Default configurations matching the providers' static defaults
    defaults: {
        streamElements: {
            defaultVoice: "Brian", rate: 1.0, pitch: 1.0, volume: 0.8, cacheSize: 50
        },
        responsiveVoice: {
            defaultVoice: "UK English Female", rate: 1.0, pitch: 1.0, volume: 1.0
        },
        webSpeech: {
            defaultVoice: "", // Empty string means use browser default initially
             rate: 1.0, pitch: 1.0, volume: 1.0
        }
    },

    // Field configurations for ObjectEditForm
    fieldConfigs: {
        streamElements: {
            defaultVoice: { label: 'Default Voice', type: 'select', required: true, title: 'Enter exact StreamElements voice name (e.g., Brian, Mizuki)', options: voicesSelect.streamElements },
            rate: { label: 'Rate', type: 'number', min: 0.5, max: 4, step: 0.1, required: true },
            pitch: { label: 'Pitch', type: 'number', min: 0.5, max: 2, step: 0.1, required: true, title: 'Affects client-side playback pitch' },
            volume: { label: 'Volume', type: 'number', min: 0, max: 1, step: 0.05, required: true },
            cacheSize: { label: 'Audio Cache Size', type: 'number', min: 0, max: 500, step: 1, required: true, title: 'Max generated audio URLs to keep in memory' }
        },
        responsiveVoice: {
            defaultVoice: { label: 'Default Voice', type: 'select', required: true, title: 'Enter exact ResponsiveVoice name (e.g., UK English Female)', options: voicesSelect.responsiveVoice },
            rate: { label: 'Rate', type: 'number', min: 0, max: 1.5, step: 0.1, required: true },
            pitch: { label: 'Pitch', type: 'number', min: 0, max: 2, step: 0.1, required: true },
            volume: { label: 'Volume', type: 'number', min: 0, max: 1, step: 0.05, required: true }
        },
        webSpeech: {
            defaultVoice: { label: 'Default Voice', type: 'select', required: false, title: 'Enter exact browser voice name (leave empty for browser default)', options: voicesSelect.webSpeech },
            rate: { label: 'Rate', type: 'number', min: 0.1, max: 10, step: 0.1, required: true },
            pitch: { label: 'Pitch', type: 'number', min: 0, max: 2, step: 0.1, required: true },
            volume: { label: 'Volume', type: 'number', min: 0, max: 1, step: 0.05, required: true }
        }
    },

    // Generates the localStorage key
    _getStorageKey(providerName) {
        return `ttsConfig_${providerName}`;
    },

    // Loads configuration for a provider
    loadConfig(providerName) {
        const key = this._getStorageKey(providerName);
        const defaultConfig = this.defaults[providerName] || {};
        let loadedConfig = {};

        try {
            const storedValue = localStorage.getItem(key);
            if (storedValue) {
                loadedConfig = JSON.parse(storedValue);
            }
        } catch (error) {
            console.error(`Error loading/parsing config for ${providerName} from localStorage:`, error);
            // Fallback to default if parsing fails
            loadedConfig = {};
        }

        // Merge loaded config with defaults to ensure all keys exist and are valid types
        const finalConfig = { ...defaultConfig };
        for (const configKey in defaultConfig) {
            if (Object.hasOwnProperty.call(defaultConfig, configKey)) {
                 // Check if loaded config has the key and if its type matches the default's type
                 if (Object.hasOwnProperty.call(loadedConfig, configKey) && typeof loadedConfig[configKey] === typeof defaultConfig[configKey]) {
                    finalConfig[configKey] = loadedConfig[configKey];
                 }
                 // Special handling if default is number and loaded is string that can be parsed
                 else if (typeof defaultConfig[configKey] === 'number' && typeof loadedConfig[configKey] === 'string') {
                     const parsedNum = parseFloat(loadedConfig[configKey]);
                     if (!isNaN(parsedNum)) {
                         finalConfig[configKey] = parsedNum;
                     }
                 }
                 // Add more type checks/conversions if needed
            }
        }


        console.log(`Loaded config for ${providerName}:`, finalConfig);
        return finalConfig;
    },

    // Saves configuration for a provider
    saveConfig(providerName, configToSave) {
        const key = this._getStorageKey(providerName);
        try {
            // Basic validation: Ensure we are saving an object
            if (typeof configToSave !== 'object' || configToSave === null) {
                 throw new Error("Invalid config type provided to saveConfig.");
            }
             // Optional: Validate against default keys/types before saving?
            const configString = JSON.stringify(configToSave);
            localStorage.setItem(key, configString);
            console.log(`Saved config for ${providerName}:`, configToSave);
            return true;
        } catch (error) {
            console.error(`Error saving config for ${providerName} to localStorage:`, error);
            return false;
        }
    },

    // Gets the field configurations for the form
    getFieldConfigs(providerName) {
        return this.fieldConfigs[providerName] || {};
    }
};

// Make it globally accessible or export it if using modules
// window.TTSConfigManager = TTSConfigManager;
// export default TTSConfigManager; // If using ES modules