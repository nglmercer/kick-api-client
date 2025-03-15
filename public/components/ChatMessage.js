class ChatMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    
    // Initialize all data properties with defaults
    this._data = null;
    this._emotes = [];
    this._uniqueId = '';
    this._type = '';
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
      // Only render when attributes actually change
      this.render();
    }
  }

  set data(value) {
    // Store the complete data object
    this._data = value || {};
    
    // Set attributes from data (these will trigger attributeChangedCallback)
    this.setAttribute('nickname', value?.nickname || '');
    this.setAttribute('comment', value?.comment || '');
    this.setAttribute('profile-picture-url', value?.profilePictureUrl || '');
    this.setAttribute('color', value?.color || '#ffffff');
    
    // Store other properties that aren't attributes
    this._emotes = Array.isArray(value?.emotes) ? value.emotes : [];
    this._uniqueId = value?.uniqueId || '';
    this._type = value?.type || '';
  }

  get data() {
    return this._data;
  }

  addEventListeners() {
    const container = this.shadowRoot.querySelector('.chat-message-container');
    if (!container) return;
    
    // Add right-click event listener
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('message-context', {
        bubbles: true,
        composed: true,
        detail: this._data
      }));
    });

    // Add three dots menu click event listener
    const menuDots = this.shadowRoot.querySelector('.menu-dots');
    if (menuDots) {
      menuDots.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('message-menu', {
          bubbles: true,
          composed: true,
          detail: this._data
        }));
      });
    }
  }

  processMessageWithEmotes(comment, emotes) {
    // Early return if comment is empty or emotes is not an array
    if (!comment || !comment.trim()) return '';
    if (!Array.isArray(emotes) || emotes.length === 0) return comment;
    
    // Create a working copy
    let processedComment = comment;
    
    // Check if any emotes are present in the comment
    const hasEmotes = emotes.some(emote => {
      if (!emote || !emote.id || !emote.name) return false;
      const pattern = `[emote:${emote.id}:${emote.name}]`;
      return processedComment.includes(pattern);
    });
    
    // If no emotes are found, return the original comment
    if (!hasEmotes) return comment;
    
    // Map for placeholder replacement
    const placeholderMap = new Map();
    
    // First pass: replace emotes with placeholders
    emotes.forEach((emote, index) => {
      if (!emote || !emote.id || !emote.name || !emote.url) return;
      
      const emotePattern = `[emote:${emote.id}:${emote.name}]`;
      const placeholder = `__EMOTE_PLACEHOLDER_${index}__`;
      
      // Only process if the pattern exists
      if (processedComment.includes(emotePattern)) {
        processedComment = processedComment.split(emotePattern).join(placeholder);
        placeholderMap.set(
          placeholder, 
          `<img src="${emote.url}" alt="${emote.name}" class="emote" />`
        );
      }
    });
    
    // Second pass: replace placeholders with HTML
    placeholderMap.forEach((htmlContent, placeholder) => {
      processedComment = processedComment.split(placeholder).join(htmlContent);
    });
    
    return processedComment;
  }

  render() {
    // Get attribute values with defaults
    const nickname = this.getAttribute('nickname') || '';
    const comment = this.getAttribute('comment') || '';
    const profilePictureUrl = this.getAttribute('profile-picture-url') || '';
    const color = this.getAttribute('color') || '#ffffff';
    
    // Ensure emotes is always an array
    const emotes = Array.isArray(this._emotes) ? this._emotes : [];
    
    // Process comment with emotes
    const processedComment = this.processMessageWithEmotes(comment, emotes);
    console.log("processedComment", processedComment, comment, emotes);
    
    // Set the HTML content
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
          img {
            max-width: min(100%, 2rem);
          }
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
    
    // Add event listeners after DOM is created
    this.addEventListeners();
  }
}

customElements.define('chat-message', ChatMessage);

export default ChatMessage;