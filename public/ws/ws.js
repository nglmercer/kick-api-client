// WebSocket connection
const alleventsArray = {
  "chat.message.sent": "chat",
  "channel.followed": "follow",
  "channel.subscription.renewal" : "subscription:renewal",
  "channel.subscription.gifts" : "subscription:gifts",
  "channel.subscription.new" : "subscription:new",
}
const socket = new WebSocket("wss://webhook-js.onrender.com/ws");
function parseIfJson(str) {
  try {
      const parsed = JSON.parse(str);
      return typeof parsed === "object" && parsed !== null ? parsed : str;
  } catch (e) {
      return str; // No es un JSON válido, devolver el string original
  }
}
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