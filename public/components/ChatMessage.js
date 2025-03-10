// src/components/ChatMessage.js
class ChatMessage extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this._data = null;
    }
  
    static get observedAttributes() {
      return ['nickname', 'comment', 'profile-picture-url', 'color'];
    }
  
    connectedCallback() {
      this.render();
      this.addEventListeners();
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        this.render();
      }
    }
  
    set data(value) {
      this._data = value;
      this.setAttribute('nickname', value.nickname || '');
      this.setAttribute('comment', value.comment || '');
      this.setAttribute('profile-picture-url', value.profilePictureUrl || '');
      this.setAttribute('color', value.color || '#ffffff');
      
      // Store emotes and uniqueId as properties since they're not attributes
      this._emotes = value.emotes || [];
      this._uniqueId = value.uniqueId || '';
      this._type = value.type || '';
      
      this.render();
    }
  
    get data() {
      return this._data;
    }
  
    addEventListeners() {
      // Add right-click event listener
      this.shadowRoot.querySelector('.chat-message-container').addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.dispatchEvent(new CustomEvent('message-context', {
          bubbles: true,
          composed: true,
          detail: this._data
        }));
      });
  
      // Add three dots menu click event listener
      this.shadowRoot.querySelector('.menu-dots').addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('message-menu', {
          bubbles: true,
          composed: true,
          detail: this._data
        }));
      });
    }
  
    processMessageWithEmotes(comment, emotes) {
      if (!emotes || emotes.length === 0) return comment;
      
      let processedComment = comment;
      emotes.forEach(emote => {
        // Replace emote codes with actual emote images
        // This is a simplified implementation - you might need to adjust based on your emote format
        const emoteRegex = new RegExp(emote.code, 'g');
        processedComment = processedComment.replace(
          emoteRegex, 
          `<img src="${emote.url}" alt="${emote.code}" class="emote" />`
        );
      });
      
      return processedComment;
    }
  
    render() {
      const nickname = this.getAttribute('nickname') || '';
      const comment = this.getAttribute('comment') || '';
      const profilePictureUrl = this.getAttribute('profile-picture-url') || '';
      const color = this.getAttribute('color') || '#ffffff';
      
      // Process comment with emotes
      const processedComment = this.processMessageWithEmotes(comment, this._emotes);
  
      this.shadowRoot.innerHTML = `
        <style>
          :host {
            display: block;
            margin-bottom: 8px;
          }
          
          .chat-message-container {
            display: flex;
            padding: 8px;
            border-radius: 4px;
            background-color: rgba(0, 0, 0, 0.2);
            position: relative;
          }
          
          .profile-picture {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            margin-right: 8px;
            object-fit: cover;
          }
          
          .message-content {
            flex: 1;
          }
          
          .user-nickname {
            font-weight: bold;
            margin-bottom: 4px;
            color: ${color};
          }
          
          .comment {
            word-break: break-word;
            color: #ffffff;
          }
          
          .menu-dots {
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          
          .menu-dots:hover {
            background-color: rgba(255, 255, 255, 0.1);
          }
          
          .emote {
            display: inline-block;
            height: 20px;
            vertical-align: middle;
          }
        </style>
        
        <div class="chat-message-container">
          <img class="profile-picture" src="${profilePictureUrl}" alt="${nickname}" onerror="this.src='https://placehold.co/600x400'">
          
          <div class="message-content">
            <div class="user-nickname">${nickname}</div>
            <div class="comment">${processedComment}</div>
          </div>
          
          <div class="menu-dots">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.5"></circle>
              <circle cx="8" cy="8" r="1.5"></circle>
              <circle cx="8" cy="13" r="1.5"></circle>
            </svg>
          </div>
        </div>
      `;
    }
  }
  
  customElements.define('chat-message', ChatMessage);
  
  export default ChatMessage;