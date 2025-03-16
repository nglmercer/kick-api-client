class CallControlBar extends HTMLElement {
  constructor() {
    super();
    
    // Create shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // Initialize state
    this.state = 'inactive';
    this.buttonStates = {
      mic: false,
      video: false,
      screen: false,
      connect: false,
      configure: false
    };
    
    // Icon mappings
    this.activeIcons = {
      "mic": "mic_off",
      "video": "hangout_video_off",
      "pause": "play_arrow",
      "connect": "play_arrow",
      "screen": "cancel_presentation",
      "configure": "settings"
    };
    
    this.inactiveIcons = {
      "mic": "mic",
      "video": "videocam",
      "pause": "pause",
      "connect": "pause",
      "screen": "screen_share",
      "configure": "settings"
    };
    
    // Render the component
    this.render();
  }
  
  // Called when the element is connected to the DOM
  connectedCallback() {
    this.setupEventListeners();
  }
  
  // Called when attributes are changed
  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'state' && oldValue !== newValue) {
      this.state = newValue;
      this.handleStateChange();
    }
  }
  
  // Define which attributes to observe
  static get observedAttributes() {
    return ['state'];
  }
  
  // Handle state changes
  handleStateChange() {
    const nav = this.shadowRoot.querySelector('.actions-nav');
    if (this.state === 'active') {
      nav.classList.remove('disabled');
    } else {
      nav.classList.add('disabled');
    }
  }
  
  // Set up all event listeners
  setupEventListeners() {
    const allButtons = this.shadowRoot.querySelectorAll('button');
    allButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        const buttonType = button.getAttribute('data-type');
        
        // Toggle button state if it's a toggleable button
        if (buttonType in this.buttonStates) {
          this.toggleButtonState(buttonType);
        }
        
        // Dispatch event
        this.dispatchEvent(new CustomEvent('button-click', {
          detail: { 
            button,
            buttonType,
            state: this.state,
            buttonState: this.buttonStates[buttonType]
          },
          bubbles: true,
          composed: true,
        }));
      });
    });
  }
  
  // Toggle button state
  toggleButtonState(buttonType) {
    this.buttonStates[buttonType] = !this.buttonStates[buttonType];
    this.updateButtonUI(buttonType);
  }
  
  // Update button UI after state change
  updateButtonUI(buttonType) {
    const button = this.shadowRoot.querySelector(`[data-type="${buttonType}"]`);
    if (!button) return;
    
    // Update active class
    if (this.buttonStates[buttonType]) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
    
    // Update icon
    const iconSpan = button.querySelector('.material-symbols-outlined');
    if (iconSpan) {
      iconSpan.textContent = this.getButtonIcon(buttonType);
    }
  }
  
  // Get the appropriate icon based on button state
  getButtonIcon(type) {
    if (this.buttonStates[type]) {
      return this.activeIcons[type] || type;
    }
    return this.inactiveIcons[type] || type;
  }
  
  // Create a button element
  createButton(type, className = 'action-button') {
    const button = document.createElement('button');
    button.className = `${className} ${type}-button ${this.buttonStates[type] ? 'active' : ''}`;
    button.setAttribute('data-type', type);
    
    const span = document.createElement('span');
    span.className = 'material-symbols-outlined';
    span.textContent = this.getButtonIcon(type);
    
    button.appendChild(span);
    return button;
  }
  
  // Render the component
  render() {
    // Create styles
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        font-family: 'Material Symbols Outlined', sans-serif;
      }
      
      .control-tray {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        padding: 10px;
        border-radius: 10px;
        color: white;
      }
      
      .actions-nav {
        display: flex;
        justify-content: center;
        gap: 10px;
        opacity: 1;
        transition: opacity 0.3s;
      }
      
      .actions-nav.disabled {
        opacity: 0.5;
        pointer-events: none;
      }
      
      .action-button {
        background: #3c3c3c;
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .btn-base {
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        display: flex;
        justify-content: center;
        align-items: center;
        cursor: pointer;
        transition: background-color 0.3s;
      }
      
      .action-button:hover {
        background: #5c5c5c;
      }
      
      .action-button .material-symbols-outlined {
        font-size: 24px;
      }
      
      .connection-container {
        display: flex;
        align-items: center;
        margin: 1rem;
      }
      
      .text-indicator {
        margin-left: 10px;
      }
      
      .action-button.active {
        background: #5c5c5c;
      }
    `;
    
    // Create font link
    const fontLink = document.createElement('link');
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined';
    fontLink.rel = 'stylesheet';
    
    // Create main container
    const controlTray = document.createElement('section');
    controlTray.className = 'control-tray';
    
    // Create hidden canvas
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 270;
    canvas.style.display = 'none';
    
    // Create actions nav
    const actionsNav = document.createElement('nav');
    actionsNav.className = `actions-nav ${this.state === 'inactive' ? 'disabled' : ''}`;
    
    // Add media control buttons
    ['mic', 'video', 'screen'].forEach(type => {
      actionsNav.appendChild(this.createButton(type));
    });
    
    // Create connection container
    const connectionContainer = document.createElement('div');
    connectionContainer.className = 'connection-container';
    
    // Create connection button container
    const connectionButtonContainer = document.createElement('div');
    connectionButtonContainer.className = 'connection-button-container';
    connectionButtonContainer.appendChild(this.createButton('connect'));
    
    // Create state button
    const stateButton = document.createElement('button');
    stateButton.className = 'btn-base';
    stateButton.setAttribute('data-type', 'state');
    
    const stateSpan = document.createElement('span');
    stateSpan.className = 'material-symbols-outlined';
    stateSpan.textContent = this.state === 'active' ? 'Stream' : 'cloud_off';
    stateButton.appendChild(stateSpan);
    
    // Add everything to connection container
    connectionContainer.appendChild(connectionButtonContainer);
    connectionContainer.appendChild(stateButton);
    connectionContainer.appendChild(this.createButton('configure', 'btn-base action-button'));
    
    // Build the DOM
    controlTray.appendChild(canvas);
    controlTray.appendChild(actionsNav);
    controlTray.appendChild(connectionContainer);
    
    // Append everything to shadow DOM
    this.shadowRoot.appendChild(fontLink);
    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(controlTray);
  }
}

// Define the custom element
customElements.define('call-control-bar', CallControlBar);