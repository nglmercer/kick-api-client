class ChatMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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
      this.render();
    }
  }

  set data(value) {
    this._data = value || {};
    this.setAttribute('nickname', value?.nickname || '');
    this.setAttribute('comment', value?.comment || '');
    this.setAttribute('profile-picture-url', value?.profilePictureUrl || '');
    this.setAttribute('color', value?.color || '#ffffff');
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
    container.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent('message-context', {
        bubbles: true,
        composed: true,
        detail: {data:this._data,
          element: container
        }
      }));
    });

    const menuDots = this.shadowRoot.querySelector('.menu-dots');
    if (menuDots) {
      menuDots.addEventListener('click', (e) => {
        e.stopPropagation();
        this.dispatchEvent(new CustomEvent('message-menu', {
          bubbles: true,
          composed: true,
          detail: {data:this._data,
            element: menuDots
          }
        }));
      });
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  processMessageWithEmotes(comment, emotes) {
    if (!comment || !comment.trim()) return '';
    const escapedComment = this.escapeHtml(comment);
    if (!Array.isArray(emotes) || emotes.length === 0) return escapedComment;
    
    let processedComment = escapedComment;
    const placeholderMap = new Map();
    // Track which emotes were found in the message
    const usedEmotes = new Set();
    
    emotes.forEach((emote, index) => {
      if (!emote || !emote.id || !emote.name || !emote.url) return;
      const emotePattern = `[emote:${emote.id}:${emote.name}]`;
      const placeholder = `__EMOTE_PLACEHOLDER_${index}__`;
      if (processedComment.includes(emotePattern)) {
        processedComment = processedComment.split(emotePattern).join(placeholder);
        placeholderMap.set(placeholder, `<img src="${emote.url}" alt="${emote.name}" class="emote" />`);
        usedEmotes.add(emote.id);
      }
    });
    
    placeholderMap.forEach((htmlContent, placeholder) => {
      processedComment = processedComment.split(placeholder).join(htmlContent);
    });
    
    // Append unused emotes at the end of the message
    const unusedEmotes = emotes.filter(emote => emote && emote.id && emote.name && emote.url && !usedEmotes.has(emote.id));
    if (unusedEmotes.length > 0) {
      processedComment += ' ';
      unusedEmotes.forEach(emote => {
        processedComment += `<img src="${emote.url}" alt="${emote.name}" class="emote" /> `;
      });
    }
    
    return processedComment;
  }

  render() {
    const nickname = this.getAttribute('nickname') || '';
    const comment = this.getAttribute('comment') || '';
    const profilePictureUrl = this.getAttribute('profile-picture-url') || '';
    const color = this.getAttribute('color') || '#ffffff';
    const emotes = Array.isArray(this._emotes) ? this._emotes : [];
    const processedComment = this.processMessageWithEmotes(comment, emotes);
    console.log("processedComment", processedComment, emotes);
    
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
        .comment img {
          max-width: min(100%, 2rem);
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
    this.addEventListeners();
  }
}

customElements.define('chat-message', ChatMessage);

export default ChatMessage;