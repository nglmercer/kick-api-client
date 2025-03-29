/**
 * @fileoverview API de ejemplo para clasificación de comentarios
 * 
 * Este archivo proporciona un ejemplo de implementación de una API local
 * para clasificar comentarios que puede ser utilizada con el CommentClassifier.
 * 
 * Para usar en producción, reemplazar con una implementación real de IA.
 */

// Importar dependencias (si se usa en Node.js)
// const express = require('express');
// const cors = require('cors');
// const bodyParser = require('body-parser');

/**
 * Palabras clave para cada categoría
 * Estas listas se utilizan para la clasificación simple basada en reglas
 */
const KEYWORDS = {
  positivo: [
    'bueno', 'genial', 'excelente', 'increíble', 'fantástico', 'maravilloso',
    'me gusta', 'me encanta', 'impresionante', 'asombroso', 'perfecto',
    'gracias', 'felicidades', 'bien hecho', 'bravo', 'espectacular'
  ],
  negativo: [
    'malo', 'terrible', 'horrible', 'pésimo', 'no me gusta', 'odio',
    'decepcionante', 'decepción', 'aburrido', 'mediocre', 'deficiente',
    'feo', 'peor', 'desagradable', 'inútil', 'basura', 'desperdicio'
  ],
  pregunta: [
    '?', 'cómo', 'qué', 'cuándo', 'dónde', 'por qué', 'cuál', 'quién',
    'cuánto', 'puedes', 'podrías', 'sabes', 'conoces', 'explica'
  ],
  spam: [
    'ganar dinero', 'click aquí', 'link', 'suscríbete', 'visita mi',
    'sígueme', 'gratis', 'oferta', 'descuento', 'promoción', 'sorteo',
    'premio', 'gana', 'compra', 'venta', 'producto', 'servicio'
  ]
};

/**
 * Clasifica un texto basado en palabras clave
 * @param {string} text - Texto a clasificar
 * @returns {Object} Resultado de la clasificación
 */
function classifyText(text) {
  const lowerText = text.toLowerCase();
  
  // Inicializar puntuaciones para cada categoría
  const scores = {
    positivo: 0,
    negativo: 0,
    pregunta: 0,
    spam: 0
  };
  
  // Calcular puntuación para cada categoría basada en palabras clave
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        // Incrementar puntuación basada en la especificidad de la palabra clave
        scores[category] += keyword.length > 3 ? 0.2 : 0.1;
        
        // Bonus para coincidencias exactas de palabras
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        if (regex.test(lowerText)) {
          scores[category] += 0.3;
        }
      }
    }
  }
  
  // Ajustes especiales
  // Preguntas tienen prioridad si contienen signos de interrogación
  if (lowerText.includes('?')) {
    scores.pregunta += 0.5;
  }
  
  // Detectar emojis positivos/negativos
  const positiveEmojis = ['😊', '😁', '👍', '❤️', '🙏', '😍'];
  const negativeEmojis = ['😠', '👎', '😡', '😢', '😭', '💔'];
  
  for (const emoji of positiveEmojis) {
    if (text.includes(emoji)) scores.positivo += 0.3;
  }
  
  for (const emoji of negativeEmojis) {
    if (text.includes(emoji)) scores.negativo += 0.3;
  }
  
  // Determinar la categoría con mayor puntuación
  let maxScore = 0;
  let category = 'default';
  
  for (const [cat, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      category = cat;
    }
  }
  
  // Si ninguna categoría tiene puntuación significativa, usar 'default'
  if (maxScore < 0.3) {
    category = 'default';
    maxScore = 0.7; // Confianza moderada para la categoría por defecto
  } else {
    // Normalizar confianza entre 0.7 y 0.95
    maxScore = Math.min(0.95, Math.max(0.7, maxScore));
  }
  
  // Generar etiquetas basadas en palabras clave detectadas
  const tags = [];
  
  if (scores.positivo > 0.3) tags.push('praise');
  if (scores.negativo > 0.3) tags.push('criticism');
  if (scores.pregunta > 0.3) tags.push('question');
  if (scores.spam > 0.3) tags.push('promotional');
  
  // Determinar sentimiento
  let sentiment = 'neutral';
  if (scores.positivo > scores.negativo && scores.positivo > 0.3) {
    sentiment = 'positivo';
  } else if (scores.negativo > scores.positivo && scores.negativo > 0.3) {
    sentiment = 'negativo';
  }
  
  return {
    category,
    confidence: maxScore,
    tags,
    sentiment
  };
}

/**
 * Procesa una solicitud de clasificación de comentarios
 * @param {Object} requestData - Datos de la solicitud
 * @returns {Object} Respuesta con comentarios clasificados
 */
function processClassificationRequest(requestData) {
  const { comments, options = {} } = requestData;
  
  // Validar entrada
  if (!Array.isArray(comments)) {
    throw new Error('El campo "comments" debe ser un array');
  }
  
  // Clasificar cada comentario
  const classifiedComments = comments.map(comment => {
    const classification = classifyText(comment.text);
    
    return {
      ...comment,
      classification
    };
  });
  
  // Filtrar por confianza mínima si se especifica
  const minConfidence = options.minConfidence || 0;
  const filteredComments = classifiedComments.filter(
    comment => comment.classification.confidence >= minConfidence
  );
  
  // Filtrar por categorías específicas si se especifican
  const categories = options.categories || null;
  const finalComments = categories 
    ? filteredComments.filter(comment => categories.includes(comment.classification.category))
    : filteredComments;
  
  return {
    classifiedComments: finalComments
  };
}

// Ejemplo de uso en navegador
function setupBrowserAPI() {
  // Simular un endpoint de API en el navegador
  window.classifyComments = function(comments, options = {}) {
    const requestData = { comments, options };
    return processClassificationRequest(requestData);
  };
}

// Ejemplo de uso en Node.js con Express
function setupExpressAPI() {
  /*
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  
  app.post('/api/classify', (req, res) => {
    try {
      const result = processClassificationRequest(req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  });
  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`API de clasificación ejecutándose en puerto ${PORT}`);
  });
  */
}

// Ejemplo de integración con TensorFlow.js para clasificación más avanzada
function setupTensorFlowClassifier() {
  /*
  // Cargar modelo pre-entrenado
  async function loadModel() {
    const model = await tf.loadLayersModel('path/to/model.json');
    return model;
  }
  
  // Preprocesar texto para el modelo
  function preprocessText(text) {
    // Implementar tokenización, padding, etc.
    return tensor;
  }
  
  // Clasificar con TensorFlow.js
  async function classifyWithTensorFlow(text) {
    const model = await loadModel();
    const tensor = preprocessText(text);
    const prediction = model.predict(tensor);
    
    // Procesar predicción y devolver en formato esperado
    return {
      category: getCategoryFromPrediction(prediction),
      confidence: getConfidenceFromPrediction(prediction),
      tags: getTagsFromPrediction(prediction),
      sentiment: getSentimentFromPrediction(prediction)
    };
  }
  */
}

// Exportar funciones para uso en diferentes entornos
export {
  classifyText,
  processClassificationRequest,
  setupBrowserAPI
};

// Si se ejecuta directamente en el navegador, configurar API global
if (typeof window !== 'undefined') {
  setupBrowserAPI();
}
