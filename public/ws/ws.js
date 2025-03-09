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