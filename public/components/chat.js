// src/main.js
import './ChatMessage.js';

// Example of how to use the component
document.addEventListener('DOMContentLoaded', async () => {
  const chatContainer = document.getElementById('chat-container');
  
  // Example data
  const exampleMessages = [
    {
      content: "Hello everyone! How's it going? KappaHD",
      type: "message",
      sender: {
        username: "user123",
        slug: "CoolUser",
        indentity: {
          color: "#FF5733"
        }
      },
      emotes: [
        { code: "KappaHD", url: "https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0" }
      ]
    },
    {
      content: "Just hanging out LUL watching the stream",
      type: "message",
      sender: {
        username: "streamer_fan",
        slug: "StreamerFan",
        indentity: {
          color: "#33FF57"
        }
      },
      emotes: [
        { code: "LUL", url: "https://static-cdn.jtvnw.net/emoticons/v2/25/default/dark/1.0" }
      ]
    }
  ];

  // Create and append chat messages
  for (const messageData of exampleMessages) {
    try {
      const chatData = await mapChatMessagetochat(messageData);
      const chatMessage = document.createElement('chat-message');
      chatMessage.data = chatData;
      
      chatContainer.appendChild(chatMessage);
    } catch (error) {
      console.error('Error creating chat message:', error);
    }
  }

  // Handle custom events
  document.addEventListener('message-context', (e) => {
    console.log('Right-click on message:', e.detail);
    // You can show a context menu here
  });

  document.addEventListener('message-menu', (e) => {
    console.log('Menu clicked for message:', e.detail);
    // You can show a dropdown menu here
  });
});

// utils/mappers.js
export async function mapChatMessagetochat(data) {
  return {
    comment: data.content,
    type: data.type,
    uniqueId: data.sender?.username,
    nickname: data.sender?.slug,
    color: data.sender?.indentity?.color,
    emotes: data.emotes, // this is array of emotes
    profilePictureUrl: await GetAvatarUrlKick.getProfilePic(data.sender?.username),
  };
}

// Mock implementation of GetAvatarUrlKick for the example
export const GetAvatarUrlKick = {
  async getProfilePic(username) {
    // In a real app, this would fetch the actual profile pic URL
    return `https://placehold.co/600x400?text=${username}`;
  }
};