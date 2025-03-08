const defaultToken = "NMMZNDLHYJCTNWFMOC0ZNMYXLTK4ZTQTMDEXNTC1ODNKZWY0";
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
const socket = new WebSocket("ws://localhost:3030/ws");

socket.onopen = () => {
  console.log("Conectado al WebSocket");
  socket.send(JSON.stringify({ message: "Hola desde el cliente!" }));
};

socket.onmessage = (event) => {
  console.log("Mensaje recibido del servidor:", event.data);
};

socket.onclose = () => {
  console.log("Conexión cerrada");
};

socket.onerror = (error) => {
  console.error("Error en WebSocket:", error);
};

async function fetchserver() {
    try {
        fetch('http://localhost:3030/webhook',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    event: {
                        name: "chat.message.sent",
                        version: 1,
                    },
                    payload: {
                        message: {
                            content: "Hola, soy un bot con Webhooks",
                            type: "bot",
                        },
                    },
                })
                
            }
        )
    } catch (error) {
        
        console.error('Error al obtener el token:', error);
    }
}

setInterval(fetchserver, 4000);