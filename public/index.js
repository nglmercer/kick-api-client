// KickAPI Class - Handles all API requests to Kick.com
class KickAPI {
    constructor(token) {
        this.token = token || window.localStorage.accessToken || "M2ZLOTRLZJITOTA0NI0ZN2UXLWI0YTQTMTJHODLLMMU2YTM3";
        this.baseUrl = "https://api.kick.com/public/v1";
        this.defaultHeaders = {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    // Generic request method
    async request(endpoint, method = 'GET', body = null, customHeaders = {}) {
        try {
            const url = `${this.baseUrl}${endpoint}`;
            const headers = { ...this.defaultHeaders, ...customHeaders };
            
            const options = {
                method,
                headers
            };

            if (body && (method === 'POST' || method === 'PATCH')) {
                options.body = JSON.stringify(body);
            }

            const response = await fetch(url, options);
            
            // Handle common error status codes
            if (response.status === 401) throw new UnauthorizedError();
            if (response.status === 403) throw new ForbiddenError();
            if (!response.ok) throw new KickApiError(`HTTP error! status: ${response.status}`, response.status);
            
            // For 204 No Content responses
            if (response.status === 204) {
                return { success: true };
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error in ${method} request to ${endpoint}:`, error);
            throw error;
        }
    }

    // GET request wrapper
    async get(endpoint, customHeaders = {}) {
        return this.request(endpoint, 'GET', null, customHeaders);
    }

    // POST request wrapper
    async post(endpoint, body, customHeaders = {}) {
        return this.request(endpoint, 'POST', body, customHeaders);
    }

    // PATCH request wrapper
    async patch(endpoint, body, customHeaders = {}) {
        return this.request(endpoint, 'PATCH', body, customHeaders);
    }

    // Events API
    async getEvents() {
        const data = await this.get('/events/subscriptions');
        console.log(data);
        return data;
    }

    async postEvent(events = null) {
        const defaultEvents = alleventsArray.map(event => ({
            name: event,
            version: 1
        }));
        console.log("events", events);
        const body = {
            events: await events || defaultEvents,
            method: "webhook",
            webhookUrl: "https://webhook-js.onrender.com/webhook"
        };

        const data = await this.post('/events/subscriptions', body);
        console.log('Evento creado:', data);
        return data;
    }

    // Categories API
    async getCategories() {
        const data = await this.get('/categories');
        console.log('Categorias:', data);
        return data;
    }

    // Chat API
    async sendChatMessage(content = "Hola desde el cliente!", broadcasterId = 4496857, type = "user") {
        const body = {
            broadcaster_user_id: broadcasterId,
            content: content,
            type: type
        };

        const data = await this.post('/chat', body);
        console.log('Mensaje enviado:', data);
        return data;
    }

    // Channels API
    async getChannels(broadcasterIds = []) {
        let endpoint = '/channels';
        
        if (broadcasterIds.length > 0) {
            const url = new URL(`${this.baseUrl}${endpoint}`);
            broadcasterIds.forEach(id => 
                url.searchParams.append('broadcaster_user_id[]', id)
            );
            endpoint = url.pathname + url.search.replace(this.baseUrl, '');
        }

        const data = await this.get(endpoint);
        console.log('Canales:', data);
        return data;
    }

    async updateChannel(options) {
        const body = {};
        if (options.categoryId) body.category_id = options.categoryId;
        if (options.streamTitle) body.stream_title = options.streamTitle;

        const result = await this.patch('/channels', body);
        return result.success;
    }
}

// Error classes
class KickApiError extends Error {
    constructor(message, status) {
        super(message);
        this.name = 'KickApiError';
        this.status = status;
    }
}

class UnauthorizedError extends KickApiError {
    constructor(message = 'Unauthorized') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

class ForbiddenError extends KickApiError {
    constructor(message = 'Forbidden') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

// Helper function to parse JSON safely
function parseIfJson(str) {
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === "object" && parsed !== null ? parsed : str;
    } catch (e) {
        return str; // No es un JSON válido, devolver el string original
    }
}

// Event types
const alleventsArray = [
    "chat.message.sent",
    "channel.followed",
    "channel.subscription.renewal",
    "channel.subscription.gifts",
    "channel.subscription.new",
];

// Initialize API client
const kickAPI = new KickAPI();

// WebSocket connection
const socket = new WebSocket("wss://webhook-js.onrender.com/ws");

socket.onopen = () => {
  console.log("Conectado al WebSocket");
  socket.send(JSON.stringify({ message: "Hola desde el cliente!" }));
};

socket.onmessage = (event) => {
  const message = parseIfJson(event.data);
  console.log("Mensaje recibido:", message);
};

socket.onclose = () => {
  console.log("Conexión cerrada");
};

socket.onerror = (error) => {
  console.error("Error en WebSocket:", error);
};

// Helper function to map events
async function mapEvents(data) {
    if (!data) return;
    return data.map((ev) => {
        return {
            name: ev.event,
            ...ev,
        };
    });
}

// Initialize events
async function initializeEvents() {
    const events = await kickAPI.getEvents();
    console.log("events", events);
    if (events && events.data) {
        kickAPI.postEvent(mapEvents(events.data));
    }
}

// Function to send data to webhook server
async function fetchserver() {
    try {
        fetch('https://webhook-js.onrender.com/webhook',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: alleventsArray.map(event => ({
                        name: event,
                        version: 1
                    }))
                })
            }
        )
    } catch (error) {
        console.error('Error al enviar datos al servidor:', error);
    }
}

// Execute API calls
kickAPI.getCategories();
initializeEvents();
kickAPI.sendChatMessage();
kickAPI.getChannels();
kickAPI.updateChannel({
    streamTitle: 'test1234!'
});

// Uncomment to enable periodic calls to the server
// setInterval(fetchserver, 4000);
// setTimeout(fetchserver, 1000);