/**
 * Aplicación principal para comunicación multimodal con Gemini API
 * Maneja entrada/salida de audio, video, pantalla y herramientas de IA
 */
import './components/state.js';
import './components/voicecomponent.js';
import './components/audioviewer.js';
import './components/formcomponent.js';
import { AudioRecorder } from './media/audiorecorder.js';
import { WebcamCapture, ScreenCapture, MediaFrameExtractor,VideoContainerManager } from './media/videocapture.js';
import { MultimodalLiveAPI } from "./clientemit.js";
const SchemaType = { STRING: "string", NUMBER: "number", INTEGER: "integer", BOOLEAN: "boolean", ARRAY: "array", OBJECT: "object" }
console.log("SchemaType", SchemaType);
// Configuración de conexión
const host = "generativelanguage.googleapis.com";
const uri = `wss://${host}/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent`;
const API_KEY = verifyAPIKey();
function verifyAPIKey() {
  // if exist api in local storage
  let apikey = JSON.parse(localStorage.getItem("AI_Control"))?.apikey_input;
  if (apikey && apikey !== "") {
    return apikey;
  } else {
    apikey ="AIzaSyCN6e1rxJtbWbCO6Kruoj7m9vaEtxTuVaw";// import.meta.env.VITE_GEMINI_API_KEY;
  }
  return apikey;
}
// Validación de API Key
/* if (typeof API_KEY !== "string" || API_KEY.length < 1) {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
} */
console.log("API_KEY", API_KEY);
// Configuración de herramientas para el modelo
const declaration = {
  name: "render_altair",
  description: "Displays an altair graph in json format.",
  parameters: {
    type: SchemaType.OBJECT,
    properties: {
      json_graph: {
        type: SchemaType.STRING,
        description: "JSON STRING representation of the graph to render."
      },
    },
    required: ["json_graph"],
  },
};
// Configuración principal del modelo
//console.log(JSON.parse(localStorage.getItem("configAPI"))?.stringInstruction)
const config = {
  model: "models/gemini-2.0-flash-exp",
  generationConfig: {
    temperature: 1,
    top_p: 0.95,
    top_k: 40,
    responseModalities: "TEXT",
    speechConfig: {
      voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } },
    },
  },
  systemInstruction: {
    parts: [{ text: `Tu eres google translator y recibes texto y devuelves un JSON.("dont use programing language")
    Formato de salida:  
    {  
      "original_text": "texto a traducir",
      "translation": "texto traducido a ${(JSON.parse(localStorage.getItem("AI_Control"))?.select_language || "español")}",
      "originaInput": "objeto o texto original"
    }  `
    }],

  },
  tools: [
    { googleSearch: { /* Configuración de búsqueda */ } },
    { functionDeclarations: [declaration] }
  ],
};
// Inicialización de la API
const apiInstance = MultimodalLiveAPI.getInstance({ url: uri, apiKey: API_KEY, config });

// Configurar manejadores de eventos
const handleToolCall = function(toolCall) {
  const fc = toolCall.functionCalls.find(fc => fc.name === declaration.name);
  if (fc) setJSONString(fc.args.json_graph);
  
  if (toolCall.functionCalls.length) {
    setTimeout(() => apiInstance.sendToolResponse({
      functionResponses: toolCall.functionCalls.map(fc => ({
        response: { output: { success: true } },
        id: fc.id
      }))
    }), 200);
  }
};

// Configurar eventos
apiInstance.client
  .on("toolcall", handleToolCall)
  .on("setupcomplete", () => console.log("Setup complete"))
  .on("interrupted", () => console.log("Interrupted"))
  .on("turncomplete", () => console.log("Turn complete"));


// Configuración de medios
const mediaConfig = {
  audioRecorder: new AudioRecorder(),
  screenCapture: new ScreenCapture(),
  webcam: new WebcamCapture(),
  extractors: {
    webcam: new MediaFrameExtractor({ fps: 1, scale: 0.5, quality: 0.8 }),
    screen: new MediaFrameExtractor({ fps: 1, scale: 0.5, quality: 0.8 })
  },
  active: { webcam: false, screen: false }
};

// Inicialización de componentes
apiInstance.connect(config);

mediaConfig.audioRecorder.on("data", data => sendData("audio/pcm;rate=16000", data));

/* const videoManager = new VideoContainerManager();
videoManager.updateContainerVisibility(); */



// Funciones de utilidad
function sendData(type, data) {
  apiInstance.client.sendRealtimeInput([{ mimeType: type, data }]);
}

function sendText(textInput = "texto de prueba", e) {
  if (e) e.preventDefault();
  apiInstance.client.send([{ text: textInput }]);
}

function setJSONString(jsonString) {
  // Implementar lógica de renderizado de gráficos
  console.log("Recibido JSON para renderizar:", jsonString);
}
export { sendText}