/**
 * Command Card Component - Web Component for displaying stream chat command cards
 * Features:
 * - Dark mode by default
 * - Right-click context menu to access command details
 * - Methods to update and delete command data
 * - Custom event dispatching for various actions
 * - Designed for stream chat commands management
 */
class CommandCardComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._data = {};
    this._isContextMenuOpen = false;
    this._render();
  }

  /**
   * Observed attributes for the component
   */
  static get observedAttributes() {
    return ['name', 'command', 'description', 'icon'];
  }

  /**
   * Called when attributes are changed
   */
  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this._data[name] = newValue;
      this._render();
    }
  }

  /**
   * Lifecycle method when component is connected to DOM
   */
  connectedCallback() {
    this.addEventListener('contextmenu', this._handleContextMenu.bind(this));
    document.addEventListener('click', this._handleDocumentClick.bind(this));
  }

  /**
   * Lifecycle method when component is disconnected from DOM
   */
  disconnectedCallback() {
    this.removeEventListener('contextmenu', this._handleContextMenu.bind(this));
    document.removeEventListener('click', this._handleDocumentClick.bind(this));
  }

  /**
   * Set command data
   * @param {Object} data - Command data
   */
  setData(data) {
    this._data = { ...this._data, ...data };
    this._render();
    return this;
  }

  /**
   * Get command data
   * @returns {Object} - Command data
   */
  getData() {
    return { ...this._data };
  }

  /**
   * Delete this command card element
   */
  delete() {
    this.dispatchEvent(new CustomEvent('command-delete', {
      bubbles: true,
      composed: true,
      detail: this._data
    }));
    this.remove();
  }

  /**
   * Handle right-click context menu
   * @param {Event} event - Context menu event
   */
  _handleContextMenu(event) {
    event.preventDefault();
    this._isContextMenuOpen = true;
    
    const contextMenu = this.shadowRoot.querySelector('.context-menu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${event.offsetX}px`;
    contextMenu.style.top = `${event.offsetY}px`;
    
    // Dispatch context menu open event with command details
    this.dispatchEvent(new CustomEvent('command-context-menu', {
      bubbles: true,
      composed: true,
      detail: {
        data: this._data,
        x: event.clientX,
        y: event.clientY
      }
    }));
  }

  /**
   * Handle document click to close context menu
   */
  _handleDocumentClick(event) {
    if (this._isContextMenuOpen && !event.composedPath().includes(this.shadowRoot.querySelector('.context-menu'))) {
      this.shadowRoot.querySelector('.context-menu').style.display = 'none';
      this._isContextMenuOpen = false;
    }
  }

  /**
   * Handle action button clicks
   * @param {string} action - Action type
   */
  _handleAction(action) {
    this.dispatchEvent(new CustomEvent('command-action', {
      bubbles: true,
      composed: true,
      detail: {
        action,
        data: this._data
      }
    }));
    
    // Close context menu
    this.shadowRoot.querySelector('.context-menu').style.display = 'none';
    this._isContextMenuOpen = false;
  }

  /**
   * Render the component
   */
  _render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: 'Arial', sans-serif;
        }
        
        .command-card {
          background-color: #2d2d2d;
          color: #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin: 8px;
          position: relative;
          cursor: pointer;
        }
        
        .command-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
        }
        
        .command-header {
          display: flex;
          align-items: center;
          padding: 12px 16px;
          background-color: #252525;
          border-bottom: 1px solid #444;
        }
        
        .command-icon {
          width: 24px;
          height: 24px;
          margin-right: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #3a3a3a;
          border-radius: 4px;
          color: #ffffff;
        }
        
        .command-content {
          padding: 12px 16px;
        }
        
        .command-name {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
          color: #ffffff;
        }
        
        .command-trigger {
          font-size: 0.9rem;
          color: #b0b0b0;
          margin: 4px 0 0 0;
          font-family: monospace;
          background-color: #3a3a3a;
          padding: 2px 6px;
          border-radius: 4px;
          display: inline-block;
        }
        
        .command-description {
          font-size: 0.95rem;
          line-height: 1.4;
          color: #b0b0b0;
          margin-top: 8px;
        }
        
        .context-menu {
          display: none;
          position: absolute;
          background-color: #333;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
          z-index: 1000;
          min-width: 180px;
        }
        
        .context-menu-item {
          padding: 8px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          transition: background-color 0.2s;
        }
        
        .context-menu-item:hover {
          background-color: #444;
        }
        
        .divider {
          height: 1px;
          background-color: #444;
          margin: 4px 0;
        }
        
        /* Icons */
        .icon {
          display: inline-block;
          width: 16px;
          height: 16px;
          margin-right: 8px;
          background-repeat: no-repeat;
          background-position: center;
          background-size: contain;
        }
        
        .icon-edit {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z'/%3E%3C/svg%3E");
        }
        
        .icon-delete {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'/%3E%3C/svg%3E");
        }
        
        .icon-execute {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M8 5v14l11-7z'/%3E%3C/svg%3E");
        }
        
        .icon-copy {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z'/%3E%3C/svg%3E");
        }
        
        .icon-details {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23e0e0e0'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z'/%3E%3C/svg%3E");
        }
      </style>
      
      <div class="command-card">
        <div class="command-header">
          <div class="command-icon">
            ${this._getIconContent()}
          </div>
          <h3 class="command-name">${this._data.name || 'Command'}</h3>
        </div>
        
        <div class="command-content">
          <code class="command-trigger">${this._data.command || '!command'}</code>
          <p class="command-description">${this._data.description || 'Stream chat command'}</p>
        </div>
        
        <div class="context-menu">
          <div class="context-menu-item" @click="${() => this._handleAction('execute')}">
            <span class="icon icon-execute"></span>Ejecutar
          </div>
          <div class="context-menu-item" @click="${() => this._handleAction('edit')}">
            <span class="icon icon-edit"></span>Editar
          </div>
          <div class="context-menu-item" @click="${() => this._handleAction('copy')}">
            <span class="icon icon-copy"></span>Copiar
          </div>
          <div class="context-menu-item" @click="${() => this._handleAction('details')}">
            <span class="icon icon-details"></span>Ver detalles
          </div>
          <div class="divider"></div>
          <div class="context-menu-item" @click="${() => this._handleAction('delete')}">
            <span class="icon icon-delete"></span>Eliminar
          </div>
        </div>
      </div>
    `;

    // Add event listeners to context menu items
    this.shadowRoot.querySelectorAll('.context-menu-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action') || 
                      e.currentTarget.textContent.trim().toLowerCase();
        this._handleAction(action);
      });
    });

    // Add click event to card for quick execution
    this.shadowRoot.querySelector('.command-card').addEventListener('click', (e) => {
      // Don't trigger if clicking on context menu
      if (!e.composedPath().some(el => el.classList && el.classList.contains('context-menu'))) {
        this._handleAction('execute');
      }
    });
  }

  /**
   * Get icon content based on data or default
   * @returns {string} - Icon HTML content
   */
  _getIconContent() {
    if (this._data.icon) {
      // If icon is a URL
      if (this._data.icon.startsWith('http') || this._data.icon.startsWith('data:')) {
        return `<img src="${this._data.icon}" alt="Command icon" style="width: 100%; height: 100%;">`;
      }
      // If icon is a text/emoji
      return this._data.icon;
    }
    // Default icon (first letter of command name)
    return (this._data.name || 'C').charAt(0).toUpperCase();
  }
}

// Register the custom element
customElements.define('command-card', CommandCardComponent);

export default CommandCardComponent;
