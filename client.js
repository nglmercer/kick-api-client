const WebSocket = require('ws');
const axios = require('axios');
const EventEmitter = require('events');

/**
 * Cliente para conectarse y manejar eventos de Kick.com
 */
class KickEventsClient extends EventEmitter {
  /**
   * Constructor del cliente
   * @param {Object} config - Configuración del cliente
   * @param {string} config.clientId - ID de cliente de Kick
   * @param {string} config.clientSecret - Clave secreta del cliente
   * @param {string} config.baseUrl - URL base de la API (por defecto: 'https://kick.com/api')
   * @param {string} config.wsUrl - URL para WebSocket (por defecto: 'wss://ws.kick.com')
   */
  constructor(config) {
    super();
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.baseUrl = config.baseUrl || 'https://kick.com/api';
    this.wsUrl = config.wsUrl || 'wss://ws.kick.com';
    this.token = null;
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectTimeout = 5000; // 5 segundos
    this.eventHandlers = {};
  }

  /**
   * Inicializa el cliente y se conecta al servicio
   */
  async connect() {
    try {
      // Primero obtener el token de autenticación
      await this.authenticate();
      
      // Iniciar conexión WebSocket
      this._connectWebSocket();
      
      return true;
    } catch (error) {
      console.error('Error al conectar el cliente:', error);
      this.emit('error', error);
      return false;
    }
  }

  /**
   * Autenticación con la API de Kick para obtener el token
   * @private
   */
  async authenticate() {
    try {
      const response = await axios.post(`${this.baseUrl}/oauth/token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        grant_type: 'client_credentials'
      });
      
      this.token = response.data.access_token;
      return this.token;
    } catch (error) {
      console.error('Error de autenticación:', error);
      throw new Error('Falló la autenticación con Kick API');
    }
  }

  /**
   * Establece la conexión WebSocket
   * @private
   */
  _connectWebSocket() {
    // Cerrar cualquier conexión existente
    if (this.ws) {
      this.ws.terminate();
    }

    // Crear nueva conexión WebSocket
    this.ws = new WebSocket(this.wsUrl, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    // Manejo de eventos de WebSocket
    this.ws.on('open', () => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      console.log('Conexión WebSocket establecida');
      this.emit('connected');
      
      // Suscribirse a todos los eventos disponibles
      this.subscribeToAllEvents();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        // Procesar el mensaje recibido
        this._handleMessage(message);
      } catch (error) {
        console.error('Error al procesar mensaje:', error);
      }
    });

    this.ws.on('error', (error) => {
      console.error('Error en la conexión WebSocket:', error);
      this.emit('error', error);
    });

    this.ws.on('close', (code, reason) => {
      this.isConnected = false;
      console.log(`Conexión WebSocket cerrada: ${code} - ${reason}`);
      this.emit('disconnected', { code, reason });
      
      // Intentar reconexión si no fue un cierre intencional
      this._attemptReconnect();
    });
  }

  /**
   * Intenta reconectarse al servicio
   * @private
   */
  _attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconexión ${this.reconnectAttempts}/${this.maxReconnectAttempts} en ${this.reconnectTimeout}ms`);
      
      setTimeout(async () => {
        try {
          await this.connect();
        } catch (error) {
          console.error('Error al reconectar:', error);
        }
      }, this.reconnectTimeout * this.reconnectAttempts);
    } else {
      console.error('Se alcanzó el máximo de intentos de reconexión');
      this.emit('reconnectFailed');
    }
  }

  /**
   * Procesa los mensajes recibidos a través de WebSocket
   * @param {Object} message - Mensaje recibido
   * @private
   */
  _handleMessage(message) {
    if (message.event) {
      // Emitir el evento específico
      this.emit(message.event, message.data);
      
      // Ejecutar los manejadores específicos para este evento
      if (this.eventHandlers[message.event]) {
        this.eventHandlers[message.event].forEach(handler => {
          try {
            handler(message.data);
          } catch (error) {
            console.error(`Error en manejador para evento ${message.event}:`, error);
          }
        });
      }
      
      // También emitir un evento general
      this.emit('message', message);
    }
  }

  /**
   * Suscribe a todos los eventos disponibles
   */
  subscribeToAllEvents() {
    // Lista de eventos basados en la documentación
    const availableEvents = [
      'channel.follow',
      'channel.unfollow',
      'channel.update',
      'channel.subscription',
      'channel.subscription.gifted',
      'channel.subscription.end',
      'channel.chat_message',
      'channel.poll.start',
      'channel.poll.vote',
      'channel.poll.end',
      'channel.ban',
      'channel.unban',
      'channel.moderator.add',
      'channel.moderator.remove',
      'channel.host.start',
      'channel.host.stop',
      'channel.raid',
      'chatroom.join',
      'chatroom.leave',
      'user.update',
      'livestream.start',
      'livestream.end',
      'livestream.viewer_count'
    ];

    // Suscribirse a cada evento
    availableEvents.forEach(eventName => {
      this._subscribe(eventName);
    });

    console.log('Suscrito a todos los eventos disponibles');
  }

  /**
   * Envía una suscripción a un evento específico
   * @param {string} eventName - Nombre del evento
   * @private
   */
  _subscribe(eventName) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      const subscriptionMessage = {
        action: 'subscribe',
        event: eventName
      };
      
      this.ws.send(JSON.stringify(subscriptionMessage));
      console.log(`Suscrito al evento: ${eventName}`);
    } else {
      console.error('No se puede suscribir, WebSocket no está conectado');
    }
  }

  /**
   * Registra un manejador para un evento específico
   * @param {string} eventName - Nombre del evento
   * @param {Function} handler - Función manejadora
   */
  on(eventName, handler) {
    // Usar el sistema de EventEmitter para eventos generales
    super.on(eventName, handler);
    
    // También guardar manejadores específicos
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    
    this.eventHandlers[eventName].push(handler);
    
    // Si ya estamos conectados, asegurarse de que estamos suscritos a este evento
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      this._subscribe(eventName);
    }
  }

  /**
   * Cancela la suscripción a un evento específico
   * @param {string} eventName - Nombre del evento
   */
  unsubscribe(eventName) {
    if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
      const unsubscribeMessage = {
        action: 'unsubscribe',
        event: eventName
      };
      
      this.ws.send(JSON.stringify(unsubscribeMessage));
      console.log(`Cancelada suscripción al evento: ${eventName}`);
      
      // Eliminar los manejadores específicos
      delete this.eventHandlers[eventName];
      
      // Pero no podemos eliminar listeners de EventEmitter fácilmente
      // sin referencia a la función exacta
    }
  }

  /**
   * Cierra la conexión con el servicio
   */
  disconnect() {
    if (this.ws) {
      this.ws.close(1000, 'Cierre solicitado por el cliente');
      this.ws = null;
      this.isConnected = false;
      console.log('Cliente desconectado intencionalmente');
    }
  }
}
const express = require('express');
const http = require('http');

// Configuración
const PORT = process.env.PORT || 3002;
const KICK_CLIENT_ID = process.env.KICK_CLIENT_ID || '01JNCXQG2JYCC8B7JW09QWE8BC';
const KICK_CLIENT_SECRET = process.env.KICK_CLIENT_SECRET || '445e7a6136aea58ebe258660eabce8848104d0f2ec26873c19013b0e0bdc8a71';

// Inicializar Express
const app = express();
const server = http.createServer(app);

// Configurar middlewares
app.use(express.json());

// Crear instancia del cliente Kick
const kickClient = new KickEventsClient({
  clientId: KICK_CLIENT_ID,
  clientSecret: KICK_CLIENT_SECRET
});

// Rutas API
app.get('/api/status', (req, res) => {
  res.json({
    connected: kickClient.isConnected,
    reconnectAttempts: kickClient.reconnectAttempts
  });
});

// Conectar con Kick.com al iniciar el servidor
async function initializeKickClient() {
  try {
    console.log('Conectando con Kick.com...');
    const connected = await kickClient.connect();
    
    if (connected) {
      console.log('Conexión exitosa con Kick.com');
      
      // Configurar manejadores de eventos
      setupEventHandlers();
    } else {
      console.error('No se pudo conectar con Kick.com');
    }
  } catch (error) {
    console.error('Error al inicializar el cliente Kick:', error);
  }
}

// Configurar manejadores para los diferentes eventos
function setupEventHandlers() {
  // Evento de nuevo seguidor
  kickClient.on('channel.follow', (data) => {
    console.log(`Nuevo seguidor: ${data.username} siguió al canal ${data.channel_name}`);
    // Aquí puedes guardar en base de datos, enviar notificaciones, etc.
  });
  
  // Evento de nueva suscripción
  kickClient.on('channel.subscription', (data) => {
    console.log(`Nueva suscripción: ${data.username} se suscribió al canal ${data.channel_name}`);
    // Lógica para manejar suscripciones
  });
  
  // Evento de mensaje en el chat
  kickClient.on('channel.chat_message', (data) => {
    console.log(`Mensaje: ${data.username}: ${data.content}`);
    // Procesar mensajes del chat
  });
  
  // Evento de inicio de transmisión
  kickClient.on('livestream.start', (data) => {
    console.log(`¡El canal ${data.channel_name} comenzó a transmitir!`);
    // Lógica para cuando inicia una transmisión
  });
  
  // Evento de fin de transmisión
  kickClient.on('livestream.end', (data) => {
    console.log(`El canal ${data.channel_name} finalizó su transmisión`);
    // Lógica para cuando finaliza una transmisión
  });
  
  // Evento de actualización de conteo de espectadores
  kickClient.on('livestream.viewer_count', (data) => {
    console.log(`Canal ${data.channel_name}: ${data.viewer_count} espectadores`);
    // Actualizar estadísticas
  });
  
  // Evento general para recibir todos los mensajes (útil para depuración)
  kickClient.on('message', (message) => {
    // Aquí puedes registrar todos los eventos para análisis
    // console.log('Evento recibido:', message);
  });
  
  // Manejo de errores
  kickClient.on('error', (error) => {
    console.error('Error en el cliente Kick:', error);
  });
  
  // Eventos de conexión
  kickClient.on('connected', () => {
    console.log('Cliente Kick conectado y listo');
  });
  
  kickClient.on('disconnected', (info) => {
    console.log(`Cliente Kick desconectado: ${info.code} - ${info.reason}`);
  });
  
  kickClient.on('reconnectFailed', () => {
    console.error('Se agotaron los intentos de reconexión');
    // Notificar al administrador
  });
}

// Iniciar servidor
server.listen(PORT, async () => {
  console.log(`Servidor iniciado en puerto ${PORT}`);
  await initializeKickClient();
});

// Manejar cierre del servidor
process.on('SIGINT', () => {
  console.log('Cerrando servidor...');
  kickClient.disconnect();
  server.close(() => {
    console.log('Servidor cerrado correctamente');
    process.exit(0);
  });
});
