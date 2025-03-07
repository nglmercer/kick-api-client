const defaultToken = "OWY2YTVMZJMTYZDMZC0ZOTG2LTGYZJATMZDKMMVMMJHLOTFH";
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
    } catch (error) {
        console.error('Error al obtener eventos:', error);                      
    }
}

async function postEvent() {
    try {
        const response = await fetch('https://api.kick.com/public/v1/events/subscriptions', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify({
                "events":arrayobj,
                "method": "webhook",
                "webhookUrl": "https://lively-pond-2fda.nglmercer.workers.dev/webhook",
                // Si la API requiere enviar la URL del webhook, podrías incluir algo como:
                // "webhookUrl": "https://tu-dominio.com/tu-endpoint"
              }),
        });
        const data = await response.json();
        console.log('Evento creado:', data);
    } catch (error) {
        console.error('Error al crear evento:', error);
    }
}

getEvents();
postEvent();
async function getPublicKey() {
    try {
        const response = await fetch('https://api.kick.com/public/v1/public-key', {
            headers: {
                'Authorization': `Bearer ${defaultToken}`
            },
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log('Public Key:', data.data.public_key);
    } catch (error) {
        console.error('Error al obtener la clave pública:', error);
    }
}

getPublicKey();
const socket = new WebSocket("wss://lively-pond-2fda.nglmercer.workers.dev/ws");

socket.onmessage = (event) => {
  console.log("Evento de Kick recibido:", JSON.parse(event.data));
};

socket.onopen = () => {
  console.log("Conectado al WebSocket");
};

socket.onerror = (error) => {
  console.error("Error en el WebSocket:", error);
};

socket.onclose = () => {
  console.log("Conexión WebSocket cerrada");
};
