/**
 * Aplicación principal para comunicación multimodal con Gemini API
 * Maneja entrada/salida de audio, video, pantalla y herramientas de IA
 */
import './style.css';
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
  let apikey = JSON.parse(localStorage.getItem("configAPI"))?.apikey;
  if (apikey && apikey !== "") {
    return apikey;
  } else {
    apikey = import.meta.env.VITE_GEMINI_API_KEY;
  }
  return apikey;
}
// Validación de API Key
if (typeof API_KEY !== "string" || API_KEY.length < 1) {
  throw new Error("set REACT_APP_GEMINI_API_KEY in .env");
}
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
console.log(JSON.parse(localStorage.getItem("configAPI"))?.stringInstruction)
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
    parts: [{ text: JSON.parse(localStorage.getItem("configAPI"))?.stringInstruction || `Eres una IA de traducción. Tu tarea es recibir un texto en español y devolver un JSON con las traducciones al inglés y japonés. 
      o tambien si no se entiende o se hacen gestos acciones o onomatopeyas puedes narrarlo en el formato deseado.
    Formato de salida:  
    {  
      "input": "<texto original en español usando muchos terminos en ingles tambien>"
      "traducciones": {
        "es": "<traducción al español>",
        "en": "<traducción al inglés>",  
        "jp": "<traducción al japonés>",
        "pt": "<traducción al portugués>"
      }  
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

const callControlBar = document.querySelector('call-control-bar');

// Event Listeners
callControlBar.addEventListener('button-click', handleControlButton);
mediaConfig.audioRecorder.on("data", data => sendData("audio/pcm;rate=16000", data));

async function handleControlButton(e) {
  const { buttonType, buttonState } = e.detail;
  console.log('Control:', buttonType, buttonState);
  
  switch(buttonType) {
    case "mic":
      buttonState ? mediaConfig.audioRecorder.start() : mediaConfig.audioRecorder.stop();
      break;
    case "screen":
      buttonState ? startScreenCapture() : stopScreenCapture();
      break;
    case "video":
      buttonState ? startWebcam() : stopWebcam();
      break;
    case "configure":
      document.querySelector('#modal_content').open();
      // create modal to change configuration
      break;
    case "connect":
      buttonState ? apiInstance.disconnect() : apiInstance.connect(config);
      break;
  }
}
setTimeout(()=>{
  mediaConfig.audioRecorder.start();
},1000
)
const videoManager = new VideoContainerManager();
videoManager.updateContainerVisibility();
// Funciones de manejo de medios
async function startScreenCapture() {
  mediaConfig.screenCapture.start();
  const video = document.getElementById("screen");
  mediaConfig.screenCapture.setVideoElement(video);
  videoManager.addActiveVideoSource("screen");
  await processMediaFrames("screen");
}

async function startWebcam() {
  mediaConfig.webcam.start();
  const video = document.getElementById("webcam");
  mediaConfig.webcam.setVideoElement(video);
  videoManager.addActiveVideoSource("webcam");
  await processMediaFrames("webcam");
}
function stopScreenCapture() {
  mediaConfig.screenCapture.stop();
  videoManager.removeActiveVideoSource("screen");
}

function stopWebcam() {
  mediaConfig.webcam.stop();
  videoManager.removeActiveVideoSource("webcam");
}
async function processMediaFrames(source) {
  const extractor = mediaConfig.extractors[source];
  const media = source === "webcam" ? mediaConfig.webcam : mediaConfig.screenCapture;

  if (!mediaConfig.active[source]) {
    try {
      await media.start();
      mediaConfig.active[source] = true;
      extractor.setMediaCapture(media);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      extractor.start(frame => {
        apiInstance.client.sendRealtimeInput([{
          mimeType: frame.mimeType,
          data: frame.data
        }]);
      });
    } catch (error) {
      console.error(`Error en ${source}:`, error);
      mediaConfig.active[source] = false;
      media.stop();
      extractor.stop();
    }
  }
}

// Funciones de utilidad
function sendData(type, data) {
  apiInstance.client.sendRealtimeInput([{ mimeType: type, data }]);
}

function onSubmit(textInput = "texto de prueba", e) {
  if (e) e.preventDefault();
  apiInstance.client.send([{ text: textInput }]);
}

function setJSONString(jsonString) {
  // Implementar lógica de renderizado de gráficos
  console.log("Recibido JSON para renderizar:", jsonString);
}