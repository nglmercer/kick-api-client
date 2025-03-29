# Guía de Uso: Clasificador de Comentarios con TTS

Esta guía explica cómo utilizar el sistema de clasificación de comentarios con síntesis de voz (TTS) para analizar y leer comentarios automáticamente.

## Descripción General

El sistema permite:

1. **Clasificar comentarios** utilizando IA para determinar su categoría (positivo, negativo, pregunta, spam, etc.)
2. **Leer comentarios en voz alta** utilizando diferentes proveedores de síntesis de voz
3. **Personalizar voces según la categoría** del comentario para una experiencia más dinámica

## Requisitos

- Navegador web moderno
- Acceso a internet (para StreamElements TTS)
- Opcional: API de clasificación de IA (se incluye simulación para demostración)

## Integración con IA para Clasificación

El sistema está diseñado para trabajar con cualquier API de clasificación de texto que siga el formato especificado. Puedes:

1. **Usar una API externa** configurando el endpoint en la inicialización
2. **Implementar tu propia API** que devuelva resultados en el formato esperado
3. **Usar la simulación integrada** para pruebas y demostración

### Formato de API

La API debe aceptar peticiones POST con el siguiente formato:

```json
{
  "comments": [
    {
      "id": "1",
      "text": "Texto del comentario",
      "author": "Nombre del autor",
      "timestamp": "2023-03-28T15:30:00Z"
    }
  ],
  "options": {
    "categories": ["positivo", "negativo", "pregunta", "spam"],
    "minConfidence": 0.7
  }
}
```

Y debe devolver:

```json
{
  "classifiedComments": [
    {
      "id": "1",
      "text": "Texto del comentario",
      "author": "Nombre del autor",
      "timestamp": "2023-03-28T15:30:00Z",
      "classification": {
        "category": "positivo",
        "confidence": 0.85,
        "tags": ["praise", "enthusiasm"],
        "sentiment": "positivo"
      }
    }
  ]
}
```

## Guía de Implementación

### 1. Importar el Módulo

```javascript
import { CommentClassifier } from './comment-classifier.js';
```

### 2. Inicializar el Clasificador

```javascript
const classifier = new CommentClassifier({
  aiEndpoint: "https://tu-api.com/classify",  // URL de tu API de clasificación
  apiKey: "tu-api-key",                       // Opcional: clave API si es necesaria
  ttsPreferences: {
    provider: "streamElements",               // Proveedor TTS: "streamElements", "responsiveVoice" o "webSpeech"
    voiceName: "Brian",                       // Nombre de la voz por defecto
    rate: 1.0,                                // Velocidad de habla (0.5-2.0)
    pitch: 1.0,                               // Tono de voz (0.5-2.0)
    volume: 0.8                               // Volumen (0-1)
  },
  // Opcional: personalizar voces por categoría
  categoryVoiceMap: {
    positivo: { voiceName: "Amy", rate: 1.1, pitch: 1.1 },
    negativo: { voiceName: "Brian", rate: 0.9, pitch: 0.9 },
    // ...otras categorías
  }
});

// Inicializar (importante para cargar voces)
await classifier.initialize();
```

### 3. Clasificar Comentarios

```javascript
// Opción 1: Usando la API configurada
const classifiedComments = await classifier.classifyComments(comments);

// Opción 2: Usando la simulación (sin API)
const classifiedComments = classifier.simulateClassification(comments);
```

### 4. Leer Comentarios

```javascript
// Leer un comentario específico
await classifier.readComment(comment, {
  voiceName: "Brian",
  rate: 1.0,
  pitch: 1.0,
  volume: 0.8
});

// Encolar múltiples comentarios para lectura secuencial
classifier.queueComment(comment1);
classifier.queueComment(comment2);

// Detener la lectura en cualquier momento
classifier.stopReading();

// Limpiar la cola de comentarios
classifier.clearQueue();
```

### 5. Procesar Comentarios (Clasificar y Leer)

```javascript
// Clasificar y leer automáticamente comentarios destacados
const classifiedComments = await classifier.processComments(comments, {
  readAll: false,                           // false = solo leer comentarios destacados
  minConfidence: 0.8,                       // confianza mínima para considerar destacado
  priorityCategories: ['pregunta', 'positivo'] // categorías a priorizar
});
```

## Personalización de Voces por Categoría

El sistema permite asignar diferentes voces y configuraciones según la categoría del comentario:

```javascript
const CATEGORY_VOICE_MAP = {
  positivo: { voiceName: "Amy", rate: 1.1, pitch: 1.1, volume: 0.9 },
  negativo: { voiceName: "Brian", rate: 0.9, pitch: 0.9, volume: 0.8 },
  pregunta: { voiceName: "Emma", rate: 1.0, pitch: 1.2, volume: 0.9 },
  spam: { voiceName: "Russell", rate: 1.3, pitch: 0.8, volume: 0.7 },
  default: { voiceName: "Brian", rate: 1.0, pitch: 1.0, volume: 0.8 }
};
```

## Proveedores TTS Disponibles

El sistema soporta tres proveedores de síntesis de voz:

1. **StreamElements** (`streamElements`): Servicio web que ofrece voces de alta calidad. Requiere conexión a internet.
2. **ResponsiveVoice** (`responsiveVoice`): Biblioteca TTS que debe estar cargada en la página. Ofrece buena calidad y variedad de voces.
3. **Web Speech API** (`webSpeech`): API nativa del navegador. La calidad y disponibilidad de voces varía según el navegador.

## Ejemplo de Uso Completo

```javascript
// Inicializar clasificador
const classifier = new CommentClassifier({
  aiEndpoint: "http://localhost:3000/api/classify",
  ttsPreferences: {
    provider: "streamElements",
    voiceName: "Brian"
  }
});

// Esperar inicialización
await classifier.initialize();

// Comentarios de ejemplo
const comments = [
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
  }
];

// Clasificar comentarios
const classifiedComments = classifier.simulateClassification(comments);

// Leer solo comentarios de preguntas
const questions = classifiedComments.filter(c => c.classification.category === 'pregunta');
for (const question of questions) {
  await classifier.readComment(question);
}
```

## Integración con Sistemas de Streaming

Este sistema es ideal para integrarse con plataformas de streaming como Twitch, YouTube Live o Kick, permitiendo:

1. **Lectura automática de comentarios destacados** durante transmisiones en vivo
2. **Filtrado de spam y contenido inapropiado** mediante la clasificación
3. **Priorización de preguntas y comentarios positivos** para mejorar la interacción

Para integrar con una plataforma de streaming:

1. Conecta a la API de chat de la plataforma
2. Envía los comentarios recibidos al clasificador
3. Configura reglas para determinar qué comentarios leer automáticamente

## Personalización Avanzada

### Implementar tu Propio Clasificador de IA

Si deseas implementar tu propio sistema de clasificación en lugar de usar una API externa:

1. Extiende la clase `CommentClassifier`
2. Sobrescribe el método `classifyComments`
3. Implementa tu lógica de clasificación (usando TensorFlow.js, por ejemplo)

```javascript
class MyCustomClassifier extends CommentClassifier {
  async classifyComments(comments) {
    // Tu lógica de clasificación personalizada
    return comments.map(comment => ({
      ...comment,
      classification: {
        // Resultado de tu clasificación
      }
    }));
  }
}
```

### Añadir Nuevos Proveedores TTS

Para añadir soporte para otros proveedores TTS:

1. Crea una nueva clase que extienda `TTSProvider`
2. Implementa los métodos requeridos (`initialize`, `isAvailable`, `getVoices`, `speak`, etc.)
3. Añade tu proveedor al objeto `ttsProviders` en el constructor de `CommentClassifier`

## Solución de Problemas

### No se escucha audio

- Verifica que el proveedor TTS esté disponible (`isAvailable()` devuelve `true`)
- Asegúrate de que el volumen no esté en 0
- Comprueba que no haya errores en la consola
- Prueba con otro proveedor TTS

### Errores de clasificación

- Verifica la conexión con la API de clasificación
- Asegúrate de que el formato de los datos sea correcto
- Usa `simulateClassification` para pruebas si la API no está disponible

### Voces no disponibles

- Algunos proveedores requieren interacción del usuario antes de poder reproducir audio
- ResponsiveVoice requiere que la biblioteca esté cargada en la página
- Web Speech API puede tener disponibilidad limitada en algunos navegadores
