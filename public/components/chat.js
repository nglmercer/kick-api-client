import './ChatMessage.js';
import { GetAvatarUrlKick } from '../api/kickapi.js';
import {setPopupOptions, returnMenuOption, openPopup, hoverStyles} from '../options/popupoptions.js'
import { sendText } from '../actions/ai/src/translate.js';
// src/main.js

// Example of how to use the component
document.addEventListener('DOMContentLoaded', async () => {
  
  // Example data
  const exampleMessages = [
    {
      content: "Hola ",
      type: "message",
      sender: {
        username: "melserngi",
        slug: "CoolUser",
        indentity: {
          color: "#FF5733"
        }
      },
      emotes: [
        {
          id: "37215",
          name: "AYAYA",
          src: getEmoteUrl("Hola [emote:37215:AYAYA] mundo").emotes[0].url,
          url: getEmoteUrl("Hola [emote:37215:AYAYA] mundo").emotes[0].url
        }
      ]
    },
    {
      content: "Hola [emote:1730752:emojiAngel] mundo",
      type: "message",
      sender: {
        username: "melserngi",  
        slug: "StreamerFan",
        indentity: {
          color: "#33FF57"
        }
      },
      emotes: getEmoteUrl("Hola [emote:1730752:emojiAngel] mundo").emotes
    }
  ];

  // Create and append chat messages
  for (const messageData of exampleMessages) {
    createmessage(messageData);
  }

  // Handle custom events
  document.addEventListener('message-context', (e) => {
    console.log('Right-click on message:', e.detail);
    // You can show a context menu here
    setandOpenPopup(e.detail.element, "#message-popup", e);
  });

  document.addEventListener('message-menu', (e) => {
    console.log('Menu clicked for message:', e.detail);
    // You can show a dropdown menu here
    setandOpenPopup(e.detail.element, "#message-popup", e);
  });
});
function setandOpenPopup(element, popupId = "custom-popup", e) {
    const baseOptions = [
      //<span class="material-symbols-outlined">language_japanese_kana</span>
      returnMenuOption("translate_command", "Traducir Comando", "translate", () => translateCommand(e.detail.data)),
      returnMenuOption("play_command", "Reproducir Comando", "play_circle", () => playCommand(e.detail.data)),
  ];
  const popupOptions = baseOptions.map(option => ({
      html: `${hoverStyles}
          <div class="dropdown-item">
              <span class="material-symbols-rounded">${option.icon}</span>
              <span class="default-font">${option.text}</span>
          </div>
      `,
      callback: (e) => option.callback(e)
  }));
  setPopupOptions(popupOptions);
  openPopup(element, popupId);
}
function translateCommand(data) {
  console.log("translateCommand",data);
  sendText(JSON.stringify(data));
}
function playCommand(data) {
  console.log("playCommand",data);
}
// utils/mappers.js
async function mapChatMessagetochat(data) {
  console.log("emotes", data.emotes || getEmoteUrl(data.content).emotes);
  return {
    id: data.id || data.message_id,
    comment: data.content,
    type: data.type || "message",
    uniqueId: data.sender?.username,
    nickname: data.sender?.slug || data.sender?.channel_slug,
    color: data.sender?.indentity?.color,
    emotes: data.emotes || getEmoteUrl(data.content).emotes, // this is array of emotes
    profilePictureUrl: await GetAvatarUrlKick.getProfilePic(data.sender?.username),
  };
}

// Mock implementation of GetAvatarUrlKick for the example
/* const GetAvatarUrlKick = {
  async getProfilePic(username) {
    // In a real app, this would fetch the actual profile pic URL
    return `https://placehold.co/600x400?text=${username}`;
  }
}; */
async function createmessage(messageData) {
  const chatContainer = document.getElementById('chat-container');

  try {
    const chatData = await mapChatMessagetochat(messageData);
    const chatMessage = document.createElement('chat-message');
    chatMessage.data = chatData;
    
    chatContainer.appendChild(chatMessage);
  } catch (error) {
    console.error('Error creating chat message:', error);
  }
}
// https://files.kick.com/emotes/1730752/fullsize"
function getEmoteUrl(message = "Hola [emote:1730752:emojiAngel] mundo") {
  const regex = /\[emote:(\d+):([a-zA-Z0-9]+)\]/g;
  const emotes = [];
  let html = message;
  let content = message;

  // Extraer todos los emotes y construir los resultados
  let match;
  while ((match = regex.exec(message)) !== null) {
    const id = match[1];
    const name = match[2];
    const imageUrl = `https://files.kick.com/emotes/${id}/fullsize`;

    // Agregar el emote al array de emotes
    emotes.push({ id, name, url: imageUrl });

    // Reemplazar en el HTML con la etiqueta <img>
    html = html.replace(match[0], `<img src="${imageUrl}" alt="${name}">`);

    // Reemplazar en el content con un espacio (o nada) para eliminar el emote
    content = content.replace(match[0], " ");
  }

  // Limpiar el content para eliminar espacios múltiples
  content = content.replace(/\s+/g, " ").trim();

  return {
    html,           // Mensaje con etiquetas <img> para los emotes
    content,       // Mensaje sin emotes, solo texto limpio
    emotes         // Array con los emotes encontrados
  };
}
window.createmessage = createmessage;
console.log(getEmoteUrl("Hola [emote:1730752:emojiAngel] mundo"));

function findChatMessageById(containerId, messageId) {
  const chatContainer = document.getElementById(containerId);
  if (!chatContainer) {
    console.error(`Container with ID ${containerId} not found`);
    return null;
  }
  
  // Get all chat message components in the container
  const chatMessages = chatContainer.querySelectorAll('chat-message');
  
  // Find the message with the matching uniqueId
  for (const message of chatMessages) {
    if (message.data && message.data.uniqueId === messageId) {
      return message;
    }
  }
  
  console.warn(`Message with ID ${messageId} not found`);
  return null;
}

// Function to update chat message content
function updateChatMessage(containerId, messageId, updates) {
  const chatMessage = findChatMessageById(containerId, messageId);
  if (!chatMessage) return false;
  
  // Make a copy of the current data
  const updatedData = { ...chatMessage.data };
  
  // Apply updates
  Object.keys(updates).forEach(key => {
    // Special handling for nested properties
    if (key.includes('.')) {
      const parts = key.split('.');
      let obj = updatedData;
      
      for (let i = 0; i < parts.length - 1; i++) {
        if (!obj[parts[i]]) obj[parts[i]] = {};
        obj = obj[parts[i]];
      }
      
      obj[parts[parts.length - 1]] = updates[key];
    } else {
      updatedData[key] = updates[key];
    }
  });
  
  // Update the component data
  chatMessage.data = updatedData;
  return true;
}

export {createmessage, mapChatMessagetochat, GetAvatarUrlKick, getEmoteUrl};