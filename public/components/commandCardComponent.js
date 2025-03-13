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
  }

  /**
   * Lifecycle method when component is disconnected from DOM
   */
  disconnectedCallback() {
    this.removeEventListener('contextmenu', this._handleContextMenu.bind(this));
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
          justify-content: space-between;
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
        
      </style>
      
      <div class="command-card">
        <div class="command-header">
          <h3 class="command-name">${this._data.name || 'Command'}</h3>
          <div class="command-icon" id="menuIcon">
          ︙
          </div>
        </div>
        
        <div class="command-content">
          <code class="command-trigger">${this._data.command || this._data.command_value|| 'any command'}</code>
          <p class="command-description">${this._data.description || this._data.command_trigger||'Stream chat command'}</p>
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
    // add event listener to menuIcon command-icon menuIcon
    this.shadowRoot.querySelector('#menuIcon').addEventListener('click', (e) => {
      this._handleContextMenu(e);
    });
    // Add click event to card for quick execution
    this.shadowRoot.querySelector('.command-card').addEventListener('dblclick', (e) => {
      // Don't trigger if clicking on context menu
      if (!e.composedPath().some(el => el.classList && el.classList.contains('context-menu'))) {
        this._handleAction('execute');
      }
    });
  }

}

// Register the custom element
customElements.define('command-card', CommandCardComponent);

export default CommandCardComponent;
