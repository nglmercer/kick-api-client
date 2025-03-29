/**
 * @fileoverview Sistema de clasificación de comentarios con lectura por voz
 * 
 * Este módulo proporciona funcionalidad para clasificar comentarios usando IA
 * y leerlos en voz alta utilizando los proveedores TTS disponibles.
 * 
 * @requires ./tts-provider.js
 */

/**
 * @typedef {Object} CommentClassification
 * @property {string} category - Categoría asignada al comentario (ej: "positivo", "negativo", "pregunta", "spam")
 * @property {number} confidence - Nivel de confianza de la clasificación (0-1)
 * @property {string[]} [tags] - Etiquetas adicionales identificadas (opcional)
 * @property {string} [sentiment] - Análisis de sentimiento si está disponible (opcional)
 */

/**
 * @typedef {Object} ClassifiedComment
 * @property {string} id - Identificador único del comentario
 * @property {string} text - Texto del comentario
 * @property {string} author - Autor del comentario
 * @property {Date} timestamp - Fecha y hora del comentario
 * @property {CommentClassification} classification - Resultado de la clasificación
 */

/**
 * @typedef {Object} TTSPreferences
 * @property {string} provider - Nombre del proveedor TTS a utilizar ("streamElements", "responsiveVoice", "webSpeech")
 * @property {string} [voiceName] - Nombre de la voz a utilizar
 * @property {number} [rate=1.0] - Velocidad de habla (0.5-2.0)
 * @property {number} [pitch=1.0] - Tono de voz (0.5-2.0)
 * @property {number} [volume=1.0] - Volumen (0-1)
 */

// Mapa de categorías a configuraciones de voz (personalizable)
const CATEGORY_VOICE_MAP = {
    positivo: { voiceName: "Brian", rate: 1.1, pitch: 1.1, volume: 0.9 },
    negativo: { voiceName: "Russell", rate: 0.9, pitch: 0.9, volume: 0.8 },
    pregunta: { voiceName: "Amy", rate: 1.0, pitch: 1.2, volume: 0.9 },
    spam: { voiceName: "Matthew", rate: 1.3, pitch: 0.8, volume: 0.7 },
    default: { voiceName: "Brian", rate: 1.0, pitch: 1.0, volume: 0.8 }
};

class CommentClassifier {
    /**
     * Crea una instancia del clasificador de comentarios con TTS.
     * 
     * @param {Object} config - Configuración del clasificador
     * @param {string} config.aiEndpoint - URL del endpoint de la API de IA para clasificación
     * @param {string} [config.apiKey] - Clave API para el servicio de IA (si es necesario)
     * @param {TTSPreferences} [config.ttsPreferences] - Preferencias para la síntesis de voz
     * @param {Object} [config.categoryVoiceMap] - Mapa personalizado de categorías a configuraciones de voz
     */
    constructor(config) {
        this.aiEndpoint = config.aiEndpoint;
        this.apiKey = config.apiKey;
        this.ttsPreferences = config.ttsPreferences || { provider: "streamElements" };
        this.categoryVoiceMap = config.categoryVoiceMap || CATEGORY_VOICE_MAP;
        
        // Inicializar proveedores TTS
        this.ttsProviders = {};
        this.initializeTTSProviders();
        
        // Estado actual
        this.isReading = false;
        this.commentQueue = [];
        this.currentProvider = null;
    }

    /**
     * Inicializa los proveedores TTS disponibles.
     * @private
     */
    async initializeTTSProviders() {
        // Crear instancias de los proveedores
        this.ttsProviders = {
            streamElements: new StreamElementsProvider({
                defaultVoice: this.ttsPreferences.voiceName || "Brian",
                rate: this.ttsPreferences.rate || 1.0,
                pitch: this.ttsPreferences.pitch || 1.0,
                volume: this.ttsPreferences.volume || 0.8
            }),
            responsiveVoice: new ResponsiveVoiceProvider({
                defaultVoice: this.ttsPreferences.voiceName || "UK English Male",
                rate: this.ttsPreferences.rate || 1.0,
                pitch: this.ttsPreferences.pitch || 1.0,
                volume: this.ttsPreferences.volume || 1.0
            }),
            webSpeech: new WebSpeechProvider({
                defaultVoice: this.ttsPreferences.voiceName,
                rate: this.ttsPreferences.rate || 1.0,
                pitch: this.ttsPreferences.pitch || 1.0,
                volume: this.ttsPreferences.volume || 1.0
            })
        };

        // Inicializar cada proveedor
        for (const [name, provider] of Object.entries(this.ttsProviders)) {
            try {
                const success = await provider.initialize();
                console.log(`Proveedor TTS ${name} inicializado: ${success ? 'OK' : 'Falló'}`);
            } catch (error) {
                console.error(`Error al inicializar proveedor TTS ${name}:`, error);
            }
        }

        // Establecer el proveedor actual según las preferencias
        this.currentProvider = this.ttsProviders[this.ttsPreferences.provider] || 
                              this.ttsProviders.streamElements; // Fallback a StreamElements
    }

    /**
     * Cambia el proveedor TTS activo.
     * 
     * @param {string} providerName - Nombre del proveedor ("streamElements", "responsiveVoice", "webSpeech")
     * @returns {boolean} - True si el cambio fue exitoso
     */
    setTTSProvider(providerName) {
        if (this.isReading) {
            console.warn("No se puede cambiar el proveedor mientras se está reproduciendo audio");
            return false;
        }

        const provider = this.ttsProviders[providerName];
        if (!provider) {
            console.error(`Proveedor TTS "${providerName}" no encontrado`);
            return false;
        }

        if (!provider.isAvailable()) {
            console.error(`Proveedor TTS "${providerName}" no está disponible`);
            return false;
        }

        this.currentProvider = provider;
        this.ttsPreferences.provider = providerName;
        console.log(`Proveedor TTS cambiado a ${providerName}`);
        return true;
    }

    /**
     * Clasifica un array de comentarios utilizando el servicio de IA configurado.
     * 
     * @param {Array<Object>} comments - Array de comentarios a clasificar
     * @param {Object} [options] - Opciones adicionales para la clasificación
     * @param {string[]} [options.categories] - Categorías específicas a considerar
     * @param {number} [options.minConfidence=0.7] - Confianza mínima para aceptar una clasificación
     * @returns {Promise<ClassifiedComment[]>} Comentarios clasificados
     */
    async classifyComments(comments, options = {}) {
        const minConfidence = options.minConfidence || 0.7;
        
        try {
            // Preparar datos para la API
            const requestData = {
                comments: comments.map(c => ({
                    id: c.id,
                    text: c.text,
                    author: c.author,
                    timestamp: c.timestamp
                })),
                options: {
                    categories: options.categories || null,
                    minConfidence: minConfidence
                }
            };

            // Llamar a la API de clasificación
            const response = await fetch(this.aiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`Error en la API: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Procesar y devolver los comentarios clasificados
            return result.classifiedComments;
            
        } catch (error) {
            console.error("Error al clasificar comentarios:", error);
            
            // En caso de error, devolver una clasificación básica
            return comments.map(comment => ({
                ...comment,
                classification: {
                    category: "error",
                    confidence: 0,
                    tags: ["error_processing"],
                    sentiment: "neutral"
                }
            }));
        }
    }

    /**
     * Simula la clasificación de comentarios cuando no hay API disponible.
     * Útil para pruebas o cuando la API está en desarrollo.
     * 
     * @param {Array<Object>} comments - Array de comentarios a clasificar
     * @returns {ClassifiedComment[]} Comentarios con clasificación simulada
     */
    simulateClassification(comments) {
        const categories = ["positivo", "negativo", "pregunta", "spam"];
        const sentiments = ["positivo", "negativo", "neutral"];
        
        return comments.map(comment => {
            // Análisis simple basado en palabras clave
            let category = "default";
            let confidence = 0.7;
            let sentiment = "neutral";
            const tags = [];
            
            const text = comment.text.toLowerCase();
            
            // Detección simple de preguntas
            if (text.includes("?") || 
                text.startsWith("cómo") || 
                text.startsWith("qué") || 
                text.startsWith("cuándo") ||
                text.startsWith("dónde") ||
                text.startsWith("por qué")) {
                category = "pregunta";
                confidence = 0.85;
                tags.push("question");
            } 
            // Detección simple de spam
            else if (text.includes("ganar dinero") || 
                    text.includes("click aquí") || 
                    text.includes("link") ||
                    text.includes("suscríbete") ||
                    text.includes("visita mi")) {
                category = "spam";
                confidence = 0.75;
                tags.push("promotional");
            }
            // Detección simple de sentimiento positivo
            else if (text.includes("bueno") || 
                    text.includes("genial") || 
                    text.includes("excelente") ||
                    text.includes("me gusta") ||
                    text.includes("increíble")) {
                category = "positivo";
                confidence = 0.8;
                sentiment = "positivo";
                tags.push("praise");
            }
            // Detección simple de sentimiento negativo
            else if (text.includes("malo") || 
                    text.includes("terrible") || 
                    text.includes("horrible") ||
                    text.includes("no me gusta") ||
                    text.includes("pésimo")) {
                category = "negativo";
                confidence = 0.8;
                sentiment = "negativo";
                tags.push("criticism");
            }
            
            return {
                ...comment,
                classification: {
                    category,
                    confidence,
                    tags,
                    sentiment
                }
            };
        });
    }

    /**
     * Lee en voz alta un comentario clasificado.
     * 
     * @param {ClassifiedComment} comment - Comentario clasificado a leer
     * @param {TTSSpeakOptions} [overrideOptions] - Opciones que sobrescriben las predeterminadas
     * @returns {Promise<void>}
     */
    async readComment(comment, overrideOptions = {}) {
        if (!this.currentProvider || !this.currentProvider.isAvailable()) {
            console.error("No hay un proveedor TTS disponible");
            return;
        }

        // Detener cualquier lectura en curso
        this.stopReading();
        
        // Determinar opciones de voz basadas en la categoría
        const category = comment.classification.category;
        const categoryOptions = this.categoryVoiceMap[category] || this.categoryVoiceMap.default;
        
        // Combinar opciones (prioridad: override > categoría > default)
        const speakOptions = {
            ...categoryOptions,
            ...overrideOptions
        };

        // Preparar el texto a leer (puede incluir metadatos del comentario)
        let textToRead = `${comment.author} dice: ${comment.text}`;
        
        try {
            this.isReading = true;
            await this.currentProvider.speak(textToRead, speakOptions);
            this.isReading = false;
            
            // Procesar siguiente comentario en cola si existe
            this._processQueue();
            
            return true;
        } catch (error) {
            console.error("Error al leer comentario:", error);
            this.isReading = false;
            return false;
        }
    }

    /**
     * Añade un comentario a la cola de lectura.
     * 
     * @param {ClassifiedComment} comment - Comentario clasificado a encolar
     * @param {TTSSpeakOptions} [options] - Opciones de voz específicas
     */
    queueComment(comment, options = {}) {
        this.commentQueue.push({ comment, options });
        
        // Si no está leyendo actualmente, iniciar procesamiento
        if (!this.isReading) {
            this._processQueue();
        }
    }

    /**
     * Procesa el siguiente comentario en la cola.
     * @private
     */
    async _processQueue() {
        if (this.isReading || this.commentQueue.length === 0) {
            return;
        }
        
        const { comment, options } = this.commentQueue.shift();
        await this.readComment(comment, options);
    }

    /**
     * Detiene cualquier lectura en curso.
     */
    stopReading() {
        if (this.currentProvider) {
            this.currentProvider.stop();
        }
        this.isReading = false;
    }

    /**
     * Limpia la cola de comentarios pendientes.
     */
    clearQueue() {
        this.commentQueue = [];
    }

    /**
     * Clasifica y lee una lista de comentarios.
     * 
     * @param {Array<Object>} comments - Lista de comentarios a procesar
     * @param {Object} [options] - Opciones para la clasificación y lectura
     * @param {boolean} [options.readAll=false] - Si es true, lee todos los comentarios; si es false, solo los destacados
     * @param {number} [options.minConfidence=0.8] - Confianza mínima para considerar un comentario destacado
     * @param {string[]} [options.priorityCategories=['pregunta', 'positivo']] - Categorías a priorizar para lectura
     * @returns {Promise<ClassifiedComment[]>} Comentarios clasificados
     */
    async processComments(comments, options = {}) {
        const {
            readAll = false,
            minConfidence = 0.8,
            priorityCategories = ['pregunta', 'positivo']
        } = options;

        // 1. Clasificar todos los comentarios
        const classifiedComments = await this.classifyComments(comments);
        
        // 2. Filtrar comentarios a leer según las opciones
        const commentsToRead = readAll 
            ? classifiedComments 
            : classifiedComments.filter(comment => 
                comment.classification.confidence >= minConfidence &&
                (priorityCategories.includes(comment.classification.category))
            );
        
        // 3. Encolar comentarios para lectura
        commentsToRead.forEach(comment => {
            this.queueComment(comment);
        });
        
        return classifiedComments;
    }
}

// Ejemplo de uso
async function demoCommentClassifier() {
    // Ejemplo de comentarios
    const sampleComments = [
        {
            id: "1",
            text: "¡Este video es increíble! Me encanta tu contenido.",
            author: "Usuario1",
            timestamp: new Date()
        },
        {
            id: "2",
            text: "¿Cuándo vas a hacer un tutorial sobre este tema?",
            author: "Usuario2",
            timestamp: new Date()
        },
        {
            id: "3",
            text: "La calidad del audio es terrible, no se entiende nada.",
            author: "Usuario3",
            timestamp: new Date()
        },
        {
            id: "4",
            text: "Visita mi canal y suscríbete para más contenido como este!",
            author: "Usuario4",
            timestamp: new Date()
        }
    ];

    // Crear instancia del clasificador
    const classifier = new CommentClassifier({
        aiEndpoint: "http://localhost:3000/api/classify", // Endpoint local
        ttsPreferences: {
            provider: "streamElements",
            voiceName: "Brian",
            rate: 1.0,
            volume: 0.9
        }
    });

    // Esperar a que se inicialicen los proveedores TTS
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Opción 1: Clasificar y procesar automáticamente
    // const classifiedComments = await classifier.processComments(sampleComments, {
    //     readAll: true
    // });

    // Opción 2: Clasificación simulada (sin API)
    const classifiedComments = classifier.simulateClassification(sampleComments);
    
    // Mostrar resultados de clasificación
    console.log("Comentarios clasificados:", classifiedComments);
    
    // Leer comentarios uno por uno
    for (const comment of classifiedComments) {
        console.log(`Leyendo comentario de ${comment.author} (${comment.classification.category})`);
        await classifier.readComment(comment);
        // Pausa entre comentarios
        await new Promise(resolve => setTimeout(resolve, 500));
    }
}

// Exportar la clase y funciones de utilidad
export { CommentClassifier, demoCommentClassifier };
