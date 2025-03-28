/**
 * @typedef {Object} TTSVoice
 * @property {string} name - Nombre de la voz.
 * @property {string} [lang] - Código de idioma (opcional).
 * @property {boolean} [default] - Si es la voz por defecto (opcional).
 */

/**
 * @typedef {Object} TTSSpeakOptions
 * @property {string} [voiceName] - Nombre de la voz a usar.
 * @property {number} [rate] - Velocidad de habla (e.g., 1.0 es normal).
 * @property {number} [pitch] - Tono de habla (e.g., 1.0 es normal).
 * @property {number} [volume] - Volumen (0.0 a 1.0).
 */
const allstreamelementsVoices =  [
    "Filiz", "Astrid", "Tatyana", "Maxim", "Carmen", "Ines", "Cristiano", "Vitoria", 
    "Ricardo", "Maja", "Jan", "Jacek", "Ewa", "Ruben", "Lotte", "Liv", "Seoyeon", 
    "Takumi", "Mizuki", "Giorgio", "Carla", "Bianca", "Karl", "Dora", "Mathieu", 
    "Celine", "Chantal", "Penelope", "Miguel", "Mia", "Enrique", "Conchita", 
    "Geraint", "Salli", "Matthew", "Kimberly", "Kendra", "Justin", "Joey", 
    "Joanna", "Ivy", "Raveena", "Aditi", "Emma", "Brian", "Amy", "Russell", 
    "Nicole", "Vicki", "Marlene", "Hans", "Naja", "Mads", "Gwyneth", "Zhiyu", 
    "es-ES-Standard-A", "it-IT-Standard-A", "it-IT-Wavenet-A", "ja-JP-Standard-A", 
    "ja-JP-Wavenet-A", "ko-KR-Standard-A", "ko-KR-Wavenet-A", "pt-BR-Standard-A", 
    "tr-TR-Standard-A", "sv-SE-Standard-A", "nl-NL-Standard-A", "nl-NL-Wavenet-A", 
    "en-US-Wavenet-A", "en-US-Wavenet-B", "en-US-Wavenet-C", "en-US-Wavenet-D", 
    "en-US-Wavenet-E", "en-US-Wavenet-F", "en-GB-Standard-A", "en-GB-Standard-B", 
    "en-GB-Standard-C", "en-GB-Standard-D", "en-GB-Wavenet-A", "en-GB-Wavenet-B", 
    "en-GB-Wavenet-C", "en-GB-Wavenet-D", "en-US-Standard-B", "en-US-Standard-C", 
    "en-US-Standard-D", "en-US-Standard-E", "de-DE-Standard-A", "de-DE-Standard-B", 
    "de-DE-Wavenet-A", "de-DE-Wavenet-B", "de-DE-Wavenet-C", "de-DE-Wavenet-D", 
    "en-AU-Standard-A", "en-AU-Standard-B", "en-AU-Wavenet-A", "en-AU-Wavenet-B", 
    "en-AU-Wavenet-C", "en-AU-Wavenet-D", "en-AU-Standard-C", "en-AU-Standard-D", 
    "fr-CA-Standard-A", "fr-CA-Standard-B", "fr-CA-Standard-C", "fr-CA-Standard-D", 
    "fr-FR-Standard-C", "fr-FR-Standard-D", "fr-FR-Wavenet-A", "fr-FR-Wavenet-B", 
    "fr-FR-Wavenet-C", "fr-FR-Wavenet-D", "da-DK-Wavenet-A", "pl-PL-Wavenet-A", 
    "pl-PL-Wavenet-B", "pl-PL-Wavenet-C", "pl-PL-Wavenet-D", "pt-PT-Wavenet-A", 
    "pt-PT-Wavenet-B", "pt-PT-Wavenet-C", "pt-PT-Wavenet-D", "ru-RU-Wavenet-A", 
    "ru-RU-Wavenet-B", "ru-RU-Wavenet-C", "ru-RU-Wavenet-D", "sk-SK-Wavenet-A", 
    "tr-TR-Wavenet-A", "tr-TR-Wavenet-B", "tr-TR-Wavenet-C", "tr-TR-Wavenet-D", 
    "tr-TR-Wavenet-E", "uk-UA-Wavenet-A", "ar-XA-Wavenet-A", "ar-XA-Wavenet-B", 
    "ar-XA-Wavenet-C", "cs-CZ-Wavenet-A", "nl-NL-Wavenet-B", "nl-NL-Wavenet-C", 
    "nl-NL-Wavenet-D", "nl-NL-Wavenet-E", "en-IN-Wavenet-A", "en-IN-Wavenet-B", 
    "en-IN-Wavenet-C", "fil-PH-Wavenet-A", "fi-FI-Wavenet-A", "el-GR-Wavenet-A", 
    "hi-IN-Wavenet-A", "hi-IN-Wavenet-B", "hi-IN-Wavenet-C", "hu-HU-Wavenet-A", 
    "id-ID-Wavenet-A", "id-ID-Wavenet-B", "id-ID-Wavenet-C", "it-IT-Wavenet-B", 
    "it-IT-Wavenet-C", "it-IT-Wavenet-D", "ja-JP-Wavenet-B", "ja-JP-Wavenet-C", 
    "ja-JP-Wavenet-D", "cmn-CN-Wavenet-A", "cmn-CN-Wavenet-B", "cmn-CN-Wavenet-C", 
    "cmn-CN-Wavenet-D", "nb-no-Wavenet-E", "nb-no-Wavenet-A", "nb-no-Wavenet-B", 
    "nb-no-Wavenet-C", "nb-no-Wavenet-D", "vi-VN-Wavenet-A", "vi-VN-Wavenet-B", 
    "vi-VN-Wavenet-C", "vi-VN-Wavenet-D", "sr-rs-Standard-A", "lv-lv-Standard-A", 
    "is-is-Standard-A", "bg-bg-Standard-A", "af-ZA-Standard-A", "Tracy", "Danny", 
    "Huihui", "Yaoyao", "Kangkang", "HanHan", "Zhiwei", "Asaf", "An", "Stefanos", 
    "Filip", "Ivan", "Heidi", "Herena", "Kalpana", "Hemant", "Matej", "Andika", 
    "Rizwan", "Lado", "Valluvar", "Linda", "Heather", "Sean", "Michael", 
    "Karsten", "Guillaume", "Pattara", "Jakub", "Szabolcs", "Hoda", "Naayf"
];

class TTSProvider {
    /**
     * @param {Object} [config={}] - Configuración inicial para la instancia del proveedor.
     */
    constructor(config = {}) {
        this.config = config;
        this.activeAudioElement = null; // Para rastrear el audio reproducido por speak()
    }

    /**
     * Inicializa el proveedor. Puede ser usado para cargar recursos o verificar APIs.
     * @returns {Promise<boolean>} True si la inicialización fue exitosa, false en caso contrario.
     */
    async initialize() {
        console.log(`Initializing ${this.constructor.name}`);
        // La implementación por defecto asume éxito inmediato.
        return true;
    }

    /**
     * Verifica si el proveedor está disponible y listo para usar.
     * @returns {boolean} True si el proveedor está disponible.
     */
    isAvailable() {
        // La implementación por defecto asume no disponible. Las subclases deben sobrescribir.
        return false;
    }

    /**
     * Obtiene la lista de voces disponibles para este proveedor.
     * @returns {Promise<TTSVoice[]> | TTSVoice[]} Array (o promesa de array) de voces disponibles.
     */
    getVoices() {
        // La implementación por defecto no retorna voces. Las subclases deben sobrescribir.
        return [];
    }

    /**
     * Reproduce el texto proporcionado usando las opciones especificadas.
     * Inserta y reproduce un elemento de audio.
     * @param {string} text - El texto a convertir en habla.
     * @param {TTSSpeakOptions} [options={}] - Opciones para la síntesis de voz (voz, velocidad, tono, volumen). Sobrescriben la configuración de la instancia.
     * @returns {Promise<void>} Promesa que se resuelve cuando el habla termina, o se rechaza si ocurre un error.
     */
    async speak(text, options = {}) {
    console.log(text, options, "voice debug", this.config)
        // Las subclases deben implementar la lógica de reproducción.
        throw new Error(`Method 'speak' not implemented in ${this.constructor.name}`);
    }

    /**
     * Genera la URL (o Blob URL) del audio para el texto proporcionado.
     * No reproduce el audio.
     * @param {string} text - El texto a convertir en audio.
     * @param {TTSSpeakOptions} [options={}] - Opciones para la generación de audio (voz, etc.). Sobrescriben la configuración de la instancia.
     * @returns {Promise<string>} Promesa que se resuelve con la URL del audio (puede ser una Blob URL).
     */
    async generateAudioUrl(text, options = {}) {
        // Las subclases deben implementar la lógica de generación de URL.
        throw new Error(`Method 'generateAudioUrl' not implemented in ${this.constructor.name}`);
    }

    /**
     * Detiene cualquier reproducción de audio en curso iniciada por este proveedor.
     */
    stop() {
        if (this.activeAudioElement) {
            console.log(`Stopping audio for ${this.constructor.name}`);
            this.activeAudioElement.pause();
            // Limpiar listeners para evitar ejecuciones post-stop (importante si se reutiliza el elemento)
            this.activeAudioElement.oncanplaythrough = null;
            this.activeAudioElement.onended = null;
            this.activeAudioElement.onerror = null;
            // Liberar recursos si es posible (especialmente si la URL es Blob URL gestionada aquí)
            // En este diseño, la URL es de generateAudioUrl, que gestiona su propio ciclo de vida/caché.
            // Si speak creara su propia Blob URL, aquí iría el revokeObjectURL.
            this.activeAudioElement.src = ''; // Detiene descarga y decodificación
            this.activeAudioElement = null;
        }
    }
}

const defaultStreamElementsConfig = {
    defaultVoice: "Brian", // Voz por defecto si no se especifica otra
    rate: 1.0,             // Velocidad por defecto
    pitch: 1.0,            // Tono por defecto (aplicado en cliente)
    volume: 0.8,           // Volumen por defecto
    cacheSize: 50          // Número máximo de audios en caché
};
const defaultResponsiveVoiceConfig = {
    defaultVoice: "UK English Female", // Voz por defecto común en RV
    rate: 1.0,                        // Velocidad (0-1.5)
    pitch: 1.0,                       // Tono (0-2)
    volume: 1.0,                      // Volumen (0-1)
    // No hay caché aplicable aquí
};
class StreamElementsProvider extends TTSProvider {
    // Usamos una propiedad estática para las opciones por defecto del proveedor
    static defaultStreamElementsConfig = defaultStreamElementsConfig;

    /**
     * @param {Object} [config={}] - Configuración específica para StreamElements. Se fusionará con defaultStreamElementsConfig.
     */
    constructor(config = {}) {
        // Fusiona la configuración pasada con los defaults específicos del proveedor
        const mergedConfig = { ...StreamElementsProvider.defaultStreamElementsConfig, ...config };
        super(mergedConfig); // Pasa la configuración fusionada al constructor base
        this.endpoint = "https://api.streamelements.com/kappa/v2/speech";
        // Caché para URLs de audio generadas (Blob URLs)
        this.audioCache = new Map(); // Usamos Map para facilitar la gestión de la caché
        this.audioCacheKeys = [];    // Para mantener el orden de inserción y aplicar LRU (Least Recently Used)
        console.log(`StreamElementsProvider initialized with config:`, this.config);
    }

    // StreamElements no requiere inicialización asíncrona
    async initialize() {
        return super.initialize(); // Llama al log de la clase base
    }

    // La API web de StreamElements siempre se considera disponible
    isAvailable() {
        return true;
    }

    /**
     * Obtiene las voces soportadas por StreamElements.
     * @returns {TTSVoice[]} Array de voces disponibles.
     */
    getVoices() {
        // Lista estática basada en la documentación/uso común
        // Podría expandirse con idiomas si se conocen
        return allstreamelementsVoices.map(name => ({ name: name }));
        // Añadir { lang: 'xx-XX' } si se conoce el idioma
    }

    /**
     * Fusiona las opciones para una operación TTS específica.
     * Prioridad: Opciones del método > Configuración de instancia > Defaults del proveedor.
     * @param {TTSSpeakOptions} [methodOptions={}] - Opciones pasadas al método (speak/generate).
     * @returns {Required<TTSSpeakOptions> & { cacheSize: number }} Opciones finales completas.
     * @private
     */
    _getFinalOptions(methodOptions = {}) {
        // Devuelve un objeto con todas las propiedades definidas
        return {
            voiceName: methodOptions.voiceName ?? this.config.defaultVoice,
            rate: methodOptions.rate ?? this.config.rate,
            pitch: methodOptions.pitch ?? this.config.pitch,
            volume: methodOptions.volume ?? this.config.volume,
            // Incluimos cacheSize aquí aunque no sea una opción de TTS estándar,
            // pero es parte de la config de la instancia que podríamos necesitar.
            cacheSize: this.config.cacheSize
        };
    }


    /**
     * Genera y cachea la URL del audio para el texto dado.
     * @param {string} text - El texto a convertir.
     * @param {TTSSpeakOptions} [options={}] - Opciones para la generación (principalmente 'voiceName').
     * @returns {Promise<string>} Promesa con la Blob URL del audio.
     */
    async generateAudioUrl(text, options = {}) {
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
             return Promise.reject(new Error("Text cannot be empty"));
        }

        const finalOptions = this._getFinalOptions(options);
        // La clave de caché debe incluir la voz, ya que afecta al audio generado.
        const cacheKey = `${finalOptions.voiceName}|${text}`;

        // 1. Revisar caché
        if (this.audioCache.has(cacheKey)) {
            console.log(`Cache hit for: ${cacheKey}`);
            // Mover la clave al final para marcarla como recientemente usada (LRU)
            const index = this.audioCacheKeys.indexOf(cacheKey);
            if (index > -1) {
                this.audioCacheKeys.splice(index, 1);
            }
            this.audioCacheKeys.push(cacheKey);
            return this.audioCache.get(cacheKey); // Devuelve la URL cacheada (Blob URL)
        }

        console.log(`Cache miss for: ${cacheKey}. Fetching...`);

        // 2. Construir URL de la API
        const params = new URLSearchParams({
            voice: finalOptions.voiceName,
            text: text.trim() // Asegurarse de quitar espacios extra
        });
        const requestUrl = `${this.endpoint}?${params.toString()}`;

        try {
            // 3. Realizar petición a la API
            const response = await fetch(requestUrl);
            if (!response.ok) {
                throw new Error(`StreamElements API error: ${response.status} ${response.statusText}`);
            }

            // 4. Obtener Blob y crear URL
            const blob = await response.blob();
            if (blob.type !== 'audio/mpeg') {
                 console.warn(`Unexpected audio format: ${blob.type}. Expected audio/mpeg.`);
                 // Podría lanzar un error si solo se espera mp3.
            }
            const blobUrl = URL.createObjectURL(blob);

            // 5. Gestionar caché (LRU)
            if (this.audioCacheKeys.length >= finalOptions.cacheSize) {
                const oldestKey = this.audioCacheKeys.shift(); // Quita la clave más antigua
                const oldestUrl = this.audioCache.get(oldestKey);
                console.log(`Cache full. Revoking oldest URL for key: ${oldestKey}`);
                URL.revokeObjectURL(oldestUrl); // ¡Importante liberar memoria!
                this.audioCache.delete(oldestKey);    // Quita del Map
            }

            // 6. Añadir a caché
            this.audioCache.set(cacheKey, blobUrl);
            this.audioCacheKeys.push(cacheKey);

            return blobUrl;

        } catch (error) {
            console.error("Error generating StreamElements audio URL:", error);
            // Propagar el error para que el llamador pueda manejarlo
            throw error;
        }
    }

    /**
     * Reproduce el texto usando StreamElements.
     * @param {string} text - El texto a hablar.
     * @param {TTSSpeakOptions} [options={}] - Opciones de voz (voz, velocidad, tono, volumen).
     * @returns {Promise<void>} Promesa que resuelve al finalizar el audio o rechaza en error.
     */
    async speak(text, options = {}) {
    console.log(text, options, "voice debug", this.config)
        // Detener cualquier audio anterior de esta instancia
        this.stop();

        const finalOptions = this._getFinalOptions(options);

        try {
            const audioUrl = await this.generateAudioUrl(text, finalOptions);

            const audio = new Audio(audioUrl);
            this.activeAudioElement = audio; // Guardar referencia para poder detenerlo

            // Aplicar opciones de reproducción al elemento Audio
            audio.volume = Math.max(0, Math.min(1, finalOptions.volume)); // Asegurar 0-1
            audio.playbackRate = Math.max(0.5, Math.min(4, finalOptions.rate)); // Rango razonable para playbackRate
            // Pitch: playbackRate afecta el tono. preservesPitch intenta desacoplarlo.
            // Si pitch es 1.0, intentamos mantener el tono original al cambiar rate.
            // Si pitch es != 1.0, dejamos que playbackRate cambie el tono (comportamiento por defecto).
            // Nota: El control fino de pitch no es estándar/fiable con HTMLAudioElement.
             audio.preservesPitch = finalOptions.pitch === 1.0 && finalOptions.rate !== 1.0;


            console.log(`Playing audio: "${text}" with options:`, {
                src: audioUrl.substring(0, 50) + '...', // Acortar blob url para log
                volume: audio.volume,
                rate: audio.playbackRate,
                preservesPitch: audio.preservesPitch
             });

            return new Promise((resolve, reject) => {
                // Empezar a reproducir cuando esté listo
                audio.oncanplaythrough = () => {
                    audio.play().catch(reject); // Capturar error de play()
                };

                // Resolver la promesa cuando termine
                audio.onended = () => {
                    console.log(`Audio finished: "${text}"`);
                    this.activeAudioElement = null; // Limpiar referencia
                    // ¡No revocar audioUrl aquí! Pertenece a la caché gestionada por generateAudioUrl.
                    resolve();
                };

                // Rechazar la promesa en caso de error
                audio.onerror = (e) => {
                    console.error(`Error playing audio for text "${text}":`, e);
                    this.activeAudioElement = null; // Limpiar referencia
                     // No revocar audioUrl aquí tampoco.
                    reject(new Error(`Error playing audio: ${e.message || 'Unknown error'}`));
                };

                 // Manejar caso donde la URL es inválida inmediatamente (poco probable con blob)
                 // audio.load() es llamado implícitamente al asignar src, pero podemos ser explícitos.
                 // audio.load(); // No estrictamente necesario con new Audio(src)
            });

        } catch (error) {
            console.error(`Error in speak method for text "${text}":`, error);
            this.stop(); // Asegurarse de limpiar si algo falló antes de reproducir
            // Rechazar la promesa externa si generateAudioUrl falló
            return Promise.reject(error);
        }
    }

    // El método stop() de la clase base ya funciona con this.activeAudioElement
}
class ResponsiveVoiceProvider extends TTSProvider {
    // Usamos una propiedad estática para las opciones por defecto del proveedor
    static defaultResponsiveVoiceConfig = defaultResponsiveVoiceConfig;

    /**
     * @param {Object} [config={}] - Configuración específica para ResponsiveVoice. Se fusionará con defaultResponsiveVoiceConfig.
     */
    constructor(config = {}) {
        // Fusiona la configuración pasada con los defaults específicos del proveedor
        const mergedConfig = { ...ResponsiveVoiceProvider.defaultResponsiveVoiceConfig, ...config };
        super(mergedConfig); // Pasa la configuración fusionada al constructor base
        /** @type {TTSVoice[]} */
        this.voices = []; // Almacenará las voces después de inicializar
        this.isInitialized = false; // Bandera para saber si ya se inicializó
        console.log(`ResponsiveVoiceProvider initialized with config:`, this.config);
    }

    /**
     * Inicializa el proveedor obteniendo las voces si están disponibles.
     * @returns {Promise<boolean>} True si ResponsiveVoice está disponible y se pudieron obtener las voces.
     */
    async initialize() {
        await super.initialize(); // Llama al log de la clase base
        if (this.isAvailable()) {
            try {
                // Esperar un breve momento puede ayudar si RV inicializa de forma asíncrona sus voces
                await new Promise(resolve => setTimeout(resolve, 100)); // Pequeña demora opcional

                if (window.responsiveVoice.getVoices) {
                    const rvVoices = window.responsiveVoice.getVoices();
                    // Mapear al formato TTSVoice estándar
                    this.voices = rvVoices.map(v => ({ name: v.name }));
                    this.isInitialized = true;
                    console.log(`ResponsiveVoice initialized successfully. Found ${this.voices.length} voices.`);
                    return true;
                } else {
                    console.warn("responsiveVoice está disponible, pero getVoices no existe aún. Puede que necesite cargar completamente.");
                    return false; // O intentar de nuevo más tarde
                }
            } catch (error) {
                console.error("Error during ResponsiveVoice initialization:", error);
                return false;
            }
        } else {
            console.warn("ResponsiveVoice library (window.responsiveVoice) not found.");
            return false;
        }
    }

    /**
     * Verifica si la librería ResponsiveVoice está cargada.
     * @returns {boolean} True si está disponible.
     */
    isAvailable() {
        return typeof window !== 'undefined' && !!window.responsiveVoice;
    }

    /**
     * Obtiene las voces disponibles de ResponsiveVoice (si se inicializó correctamente).
     * @returns {TTSVoice[]} Array de voces disponibles.
     */
    getVoices() {
        if (!this.isInitialized) {
            console.warn("Attempted to get voices before ResponsiveVoiceProvider was successfully initialized.");
        }
        return this.voices;
    }

    /**
     * Fusiona las opciones para una operación TTS específica.
     * @param {TTSSpeakOptions} [methodOptions={}] - Opciones pasadas al método (speak/generate).
     * @returns {Required<TTSSpeakOptions>} Opciones finales completas.
     * @private
     */
    _getFinalOptions(methodOptions = {}) {
         // Devuelve un objeto con todas las propiedades definidas
         // ResponsiveVoice usa 'name' para la voz, no 'voiceName'
        return {
            voiceName: methodOptions.voiceName ?? this.config.defaultVoice,
            rate: methodOptions.rate ?? this.config.rate,
            pitch: methodOptions.pitch ?? this.config.pitch,
            volume: methodOptions.volume ?? this.config.volume,
        };
        // Nota: No incluimos 'cacheSize' aquí ya que no aplica a RV.
    }

    /**
     * Reproduce el texto usando ResponsiveVoice.
     * @param {string} text - El texto a hablar.
     * @param {TTSSpeakOptions} [options={}] - Opciones de voz (voz, velocidad, tono, volumen).
     * @returns {Promise<void>} Promesa que resuelve al finalizar el audio o rechaza en error.
     */
    async speak(text, options = {}) {
    console.log(text, options, "voice debug", this.config)
        if (!this.isAvailable()) {
             return Promise.reject(new Error('ResponsiveVoice library is not available.'));
         }
         if (!this.isInitialized) {
             return Promise.reject(new Error('ResponsiveVoiceProvider is not initialized. Call initialize() first.'));
         }
         if (!text || typeof text !== 'string' || text.trim().length === 0) {
            return Promise.reject(new Error("Text cannot be empty"));
         }

        const finalOptions = this._getFinalOptions(options);

        // Detener cualquier habla anterior de ResponsiveVoice (es global)
        this.stop();

        console.log(`Speaking with ResponsiveVoice: "${text}" with options:`, finalOptions);

        return new Promise((resolve, reject) => {
            const params = {
                // Asegurar que los valores estén dentro de los rangos de RV si se conocen
                rate: Math.max(0, Math.min(1.5, finalOptions.rate)),
                pitch: Math.max(0, Math.min(2, finalOptions.pitch)),
                volume: Math.max(0, Math.min(1, finalOptions.volume)),
                onstart: () => {
                    console.log("ResponsiveVoice started speaking.");
                    // No hay un elemento de audio específico que rastrear aquí
                },
                onend: () => {
                    console.log(`ResponsiveVoice finished speaking: "${text}"`);
                    resolve(); // Resuelve la promesa cuando termina
                },
                onerror: (err) => {
                    console.error(`ResponsiveVoice error for text "${text}":`, err);
                    // Intentar cancelar por si acaso
                    try {
                         window.responsiveVoice.cancel();
                    } catch (cancelError) {
                         console.warn("Error trying to cancel ResponsiveVoice after an error:", cancelError);
                    }
                    reject(new Error(`ResponsiveVoice error: ${err?.message || 'Unknown error'}`)); // Rechaza en error
                }
            };

            try {
                // Llamar a la función speak de ResponsiveVoice
                window.responsiveVoice.speak(text.trim(), finalOptions.voiceName, params);
            } catch (error) {
                 console.error("Error calling responsiveVoice.speak:", error);
                 reject(error); // Rechazar si la llamada inicial falla
            }
        });
    }

    /**
     * Genera la URL del audio. NO SOPORTADO por ResponsiveVoice.
     * @param {string} text - El texto.
     * @param {TTSSpeakOptions} [options={}] - Opciones.
     * @returns {Promise<string>} Rechaza la promesa indicando no soportado.
     */
    async generateAudioUrl(text, options = {}) {
        console.warn("ResponsiveVoice does not support generating audio URLs directly.");
        return Promise.reject(new Error('ResponsiveVoice does not support direct audio URL generation.'));
    }

    /**
     * Detiene cualquier reproducción de audio en curso de ResponsiveVoice.
     */
    stop() {
        // No necesitamos chequear activeAudioElement aquí, RV tiene su propio control global
        if (this.isAvailable() && window.responsiveVoice.isPlaying()) {
            console.log(`Stopping ResponsiveVoice audio.`);
            try {
                window.responsiveVoice.cancel();
            } catch (error) {
                 console.error("Error calling responsiveVoice.cancel():", error);
            }
        }
         // Llamamos a super.stop() por si acaso, aunque no debería hacer nada
         // si no usamos activeAudioElement en esta subclase.
         // super.stop(); // Opcional, probablemente innecesario aquí.
    }
}
class WebSpeechProvider extends TTSProvider {
    constructor(config = {}) {
        // Valores por defecto razonables para WebSpeech
        const defaultConfig = {
            rate: 1.0,
            pitch: 1.0,
            volume: 1.0,
            defaultVoice: null // Puede ser un nombre de voz preferido
        };
        super({ ...defaultConfig, ...config });

        this.synth = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null; // Para rastrear la utterance actual

        // Para generateAudioUrl (con sus limitaciones)
        this.audioContext = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
    }

    async initialize() {
        if (!this.isAvailable()) {
            console.warn('Web Speech API not available.');
            return false;
        }
        console.log(`Initializing ${this.constructor.name}`);
        return new Promise((resolve) => {
            const loadVoices = () => {
                this.voices = this.synth.getVoices().map(v => ({ // Mapear a una estructura consistente si es necesario
                    name: v.name,
                    lang: v.lang,
                    default: v.default,
                    voiceURI: v.voiceURI,
                    localService: v.localService,
                    _nativeVoice: v // Guardar referencia al objeto nativo
                }));
                console.log(`Loaded ${this.voices.length} voices.`);
                resolve(true); // Resuelve incluso si no hay voces, la API está ahí.
            };

            this.voices = this.synth.getVoices();
            if (this.voices.length > 0) {
                 // Mapear inmediatamente si ya están disponibles
                 this.voices = this.voices.map(v => ({
                    name: v.name,
                    lang: v.lang,
                    default: v.default,
                    voiceURI: v.voiceURI,
                    localService: v.localService,
                    _nativeVoice: v
                 }));
                console.log(`${this.voices.length} voices available immediately.`);
                resolve(true);
            } else {
                // Esperar al evento si no están listas
                console.log('Voices not immediately available, waiting for voiceschanged event...');
                this.synth.addEventListener('voiceschanged', loadVoices, { once: true });
                // Fallback por si el evento no dispara en algunos navegadores al inicio
                setTimeout(() => {
                    if (this.voices.length === 0) {
                        console.warn("voiceschanged event didn't fire after timeout, trying getVoices() again.");
                        loadVoices(); // Intenta cargar de nuevo
                    }
                }, 1000); // Espera 1 segundo
            }
        });
    }

    isAvailable() {
        return typeof window !== 'undefined' && !!window.speechSynthesis;
    }

    /**
     * @returns {TTSVoice[]}
     */
    getVoices() {
        // Devuelve las voces mapeadas
        return this.voices;
    }

    /**
     * Crea y configura un SpeechSynthesisUtterance.
     * @private
     * @param {string} text
     * @param {TTSSpeakOptions} options
     * @returns {SpeechSynthesisUtterance | null}
     */
    _createUtterance(text, options = {}) {
        if (!this.isAvailable()) {
            console.error('Web Speech API is not available');
            return null;
        }

        const utterance = new SpeechSynthesisUtterance(text);
        const mergedOptions = { ...this.config, ...options };

        // Seleccionar voz
        let selectedVoice = null;
        if (options.voiceIndex !== undefined && options.voiceIndex >= 0 && options.voiceIndex < this.voices.length) {
            selectedVoice = this.voices[options.voiceIndex]?._nativeVoice;
        } else if (options.voiceName) {
            selectedVoice = this.voices.find(v => v.name === options.voiceName)?._nativeVoice;
        } else if (mergedOptions.defaultVoice) { // Usar defaultVoice de la config
            selectedVoice = this.voices.find(v => v.name === mergedOptions.defaultVoice)?._nativeVoice;
        }
        // Si no se encuentra ninguna y hay voces disponibles, se usará la predeterminada del navegador.
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else if (this.voices.length > 0) {
            console.warn("Specified voice not found, browser default will be used.");
        }

        // Aplicar otras opciones
        utterance.rate = parseFloat(mergedOptions.rate ?? 1.0);
        utterance.pitch = parseFloat(mergedOptions.pitch ?? 1.0);
        utterance.volume = parseFloat(mergedOptions.volume ?? 1.0);

        // Validar rangos (importante para evitar errores)
        utterance.rate = Math.max(0.1, Math.min(10, utterance.rate));
        utterance.pitch = Math.max(0, Math.min(2, utterance.pitch));
        utterance.volume = Math.max(0, Math.min(1, utterance.volume));

        return utterance;
    }

    async speak(text, options = {}) {
    console.log(text, options, "voice debug", this.config)
        if (this.synth.speaking) {
             console.warn("Speech synthesis already in progress. Cancelling previous utterance.");
             this.synth.cancel(); // Cancelar habla anterior antes de empezar nueva
        }

        const utterance = this._createUtterance(text, options);
        if (!utterance) {
            return Promise.reject(new Error('Failed to create utterance or API not available.'));
        }

        return new Promise((resolve, reject) => {
            this.currentUtterance = utterance; // Guardar referencia

            utterance.onend = () => {
                console.log("Speech finished.");
                this.currentUtterance = null;
                resolve();
            };

            utterance.onerror = (event) => {
                console.error("Speech synthesis error:", event);
                this.currentUtterance = null;
                reject(new Error(`Speech error: ${event.error}`));
            };

            // Boundary y otros eventos pueden ser útiles para feedback
            // utterance.onboundary = (event) => { console.log('Boundary:', event); };
            // utterance.onstart = () => { console.log("Speech started."); };

            this.synth.speak(utterance);
        });
    }

    /**
     * Genera la URL de audio usando la técnica de grabación.
     * ADVERTENCIA: Este método REPRODUCIRÁ el audio audiblemente durante la generación
     * debido a limitaciones de la Web Speech API estándar.
     * @param {string} text
     * @param {TTSSpeakOptions} options
     * @returns {Promise<string>}
     */
    async generateAudioUrl(text, options = {}) {
        console.warn("generateAudioUrl using WebSpeechProvider will play audio aloud during generation.");

        if (this.synth.speaking) {
             console.warn("Speech synthesis already in progress. Cannot generate URL now.");
             return Promise.reject(new Error("Cannot generate audio URL while speaking."));
        }
        if (!window.AudioContext && !window.webkitAudioContext) {
            return Promise.reject(new Error('AudioContext not supported, cannot generate audio URL.'));
        }
        if (!window.MediaRecorder) {
             return Promise.reject(new Error('MediaRecorder not supported, cannot generate audio URL.'));
        }

        const utterance = this._createUtterance(text, options);
        if (!utterance) {
            return Promise.reject(new Error('Failed to create utterance or API not available.'));
        }

        // Inicializar AudioContext si es necesario
        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            } catch (e) {
                 return Promise.reject(new Error('Failed to create AudioContext.'));
            }
        }
        // Asegurarse de que el context no esté suspendido (interacción del usuario podría ser necesaria)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }


        return new Promise((resolve, reject) => {
            let destination;
            try {
                 destination = this.audioContext.createMediaStreamDestination();
            } catch (e) {
                return reject(new Error('Failed to create MediaStreamDestination.'));
            }
            // Nota: No podemos conectar directamente la salida de 'utterance' a 'destination'.
            // MediaRecorder grabará lo que sea que 'destination.stream' reciba.
            // En una configuración simple, esto no captura la síntesis.
            // La única forma en que esto *podría* funcionar es si el navegador enruta
            // la salida de Web Speech a través del AudioContext por defecto,
            // o si usamos trucos más complejos (como un loopback virtual o capturar la salida del tag <audio> si *pudiéramos* rutear allí).
            // Por simplicidad, procederemos asumiendo que puede capturar *algo*, pero con las advertencias dadas.
            // Una implementación más robusta necesitaría una API diferente o un enfoque del lado del servidor.

            this.audioChunks = [];
            let recorderOptions = { mimeType: 'audio/webm' }; // Intentar webm primero
            try {
                this.mediaRecorder = new MediaRecorder(destination.stream, recorderOptions);
            } catch (e1) {
                console.warn("Failed to create MediaRecorder with audio/webm, trying audio/ogg...");
                recorderOptions = { mimeType: 'audio/ogg; codecs=opus' };
                try {
                     this.mediaRecorder = new MediaRecorder(destination.stream, recorderOptions);
                } catch (e2) {
                     console.warn("Failed to create MediaRecorder with audio/ogg, trying default...");
                     try {
                        this.mediaRecorder = new MediaRecorder(destination.stream); // Sin opciones específicas
                        recorderOptions.mimeType = this.mediaRecorder.mimeType || 'audio/webm'; // Leer el mimeType usado
                     } catch (e3) {
                        this.mediaRecorder = null;
                        return reject(new Error(`MediaRecorder creation failed: ${e3.message}`));
                     }
                }
            }
            console.log(`Using MediaRecorder with mimeType: ${recorderOptions.mimeType}`);


            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.audioChunks.push(event.data);
                }
            };

            this.mediaRecorder.onstop = () => {
                if (this.audioChunks.length > 0) {
                    const audioBlob = new Blob(this.audioChunks, { type: recorderOptions.mimeType });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    console.log(`Generated Blob URL: ${audioUrl} (type: ${recorderOptions.mimeType})`);
                    resolve(audioUrl);
                } else {
                    // Esto puede pasar si la grabación no capturó nada.
                    reject(new Error('No audio chunks recorded. Synthesis might not be routed to capture.'));
                }
                // Limpiar para la próxima vez
                this.audioChunks = [];
                this.mediaRecorder = null;
                 // No cerramos el AudioContext aquí, podría reutilizarse.
            };

             this.mediaRecorder.onerror = (event) => {
                 console.error("MediaRecorder error:", event);
                 reject(new Error(`MediaRecorder error: ${event.error.message}`));
                 this.mediaRecorder = null;
                 this.audioChunks = [];
             };

            // Configurar listeners de utterance *antes* de hablar
             utterance.onend = () => {
                console.log("Speech finished (for generateAudioUrl). Stopping recorder soon.");
                // Pequeña demora para asegurar que todo el audio se procese
                setTimeout(() => {
                    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                        this.mediaRecorder.stop();
                    }
                }, 300); // Ajustar si es necesario
                this.currentUtterance = null;
            };

            utterance.onerror = (event) => {
                console.error("Speech synthesis error (for generateAudioUrl):", event);
                if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                    this.mediaRecorder.stop(); // Detener grabación en error
                }
                reject(new Error(`Speech error: ${event.error}`));
                this.currentUtterance = null;
            };

             utterance.onstart = () => {
                console.log("Speech started (for generateAudioUrl).");
             };

            // Iniciar grabación y luego hablar
             try {
                 this.mediaRecorder.start();
                 console.log("MediaRecorder started.");
                 this.currentUtterance = utterance; // Guardar referencia
                 this.synth.speak(utterance); // ¡Esto reproducirá el audio!
             } catch (err) {
                reject(new Error(`Failed to start recording or speaking: ${err.message}`));
                this.mediaRecorder = null;
                this.currentUtterance = null;
             }
        });
    }

    stop() {
        // Sobrescribe el stop base para usar el método específico de Web Speech.
        // No interactúa con this.activeAudioElement.
        if (this.isAvailable()) {
            if (this.synth.speaking || this.synth.pending) {
                 console.log(`Stopping Web Speech synthesis for ${this.constructor.name}`);
                 this.synth.cancel(); // Cancela utterances en cola y la actual
            }
             // Si estábamos grabando para generateAudioUrl, también detener eso.
             if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                 console.log("Stopping associated MediaRecorder due to stop() call.");
                 this.mediaRecorder.stop(); // Esto disparará onstop eventualmente
             }
             this.currentUtterance = null; // Limpiar referencia
        }
    }
}