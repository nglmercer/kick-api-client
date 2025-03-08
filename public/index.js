const defaultToken = window.localStorage.accessToken || "M2ZLOTRLZJITOTA0NI0ZN2UXLWI0YTQTMTJHODLLMMU2YTM3";
const alleventsArray = [
    "chat.message.sent",
    "channel.followed",
    "channel.subscription.renewal",
    "channel.subscription.gifts",
    "channel.subscription.new",
];
const arrayobj = alleventsArray.map((event) => {
    return {
        name: event,
        version: 1,
    };
});
async function getEvents() {
    try {
        const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`
            },
            method: 'GET',
        });
        const data = await response.json();
        console.log(data);
        return data;
    } catch (error) {
        console.error('Error al obtener eventos:', error);                      
    }
}

async function postEvent(arrayevents) {
    console.log("arrayevents", arrayevents);
    try {
        const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "events": await arrayevents ||  arrayobj,
                "method": "webhook",
                // Si la API requiere enviar la URL del webhook, podrías incluir algo como:
                "webhookUrl": "https://webhook-js.onrender.com/webhook"
              }),
        });
        const data = await response.json();
        console.log('Evento creado:', data, arrayobj);
    } catch (error) {
        console.error('Error al crear evento:', error);
    }
}
async function initializeEvents(){
    const events = await getEvents();
    console.log("events", events);
    postEvent(mapEvents(events.data));
}
async function mapEvents(data) {
    if (!data) return;
    return data.map((ev) => {
        return {
            name: ev.event,
            ...ev,
        };
    });
}
async function getcategory() {
    try {
        const response = await fetch('https://api.kick.com/public/v1/categories', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${defaultToken}`
            },
        });
        
        const data = await response.json();
        console.log('Categorias:', data);
        return data;
    } catch (error) {
        console.error('Error al obtener categorias:', error);
    }
}
getcategory();
initializeEvents();
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

async function fetchserver() {
    try {
        fetch('https://webhook-js.onrender.com/webhook',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: arrayobj
                })
                
            }
        )
    } catch (error) {
        
        console.error('Error al obtener el token:', error);
    }
}

// setInterval(fetchserver, 4000);
// setTimeout(fetchserver, 1000);
function parseIfJson(str) {
    try {
        const parsed = JSON.parse(str);
        return typeof parsed === "object" && parsed !== null ? parsed : str;
    } catch (e) {
        return str; // No es un JSON válido, devolver el string original
    }
}

async function sendchatmessage(test = "Hola desde el cliente!") {
    const jsonobj = {
        "broadcaster_user_id": 4496857,// this get with getchannels()
        "content": test,
        "type": "user"// user, bot
      };
    const urlbase = "https://api.kick.com/"
    try {
        const response = await fetch(urlbase + 'public/v1/chat', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(jsonobj),
        });
        const data = await response.json();
        console.log('Mensaje enviado:', data);
    } catch (error) {
        console.error('Error al enviar mensaje:', error);
    }
}
sendchatmessage();
async function getchannels() {
    try {
        const response = await fetch('https://api.kick.com/public/v1/channels', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${defaultToken}`
            },
        });
        
        const data = await response.json();
        console.log('Canales:', data);
    } catch (error) {
        console.error('Error al obtener canales:', error);
    }
}
getchannels();
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

class ChannelsService {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.baseUrl = 'https://api.kick.com/public/v1/channels';
    }

    async getChannels(broadcasterIds = [], token) {
        const url = new URL(this.baseUrl);
        
        if (broadcasterIds.length > 0) {
            broadcasterIds.forEach(id => 
                url.searchParams.append('broadcaster_user_id[]', id)
            );
        }

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return await response.json();
    }

    async updateChannel(options, token) {
        const response = await fetch(this.baseUrl, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                category_id: options.categoryId,
                stream_title: options.streamTitle
            })
        });

        if (response.status === 401) throw new UnauthorizedError();
        if (response.status === 403) throw new ForbiddenError();
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        return response.status === 204;
    }
}
const channelsService = new ChannelsService();
channelsService.updateChannel({
    streamTitle: 'test1234!'
}, defaultToken);