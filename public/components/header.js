// header.js
export class HeaderComponent {
    constructor(containerId) {
      this.container = document.getElementById(containerId);
      this.isLoggedIn = false;
      this.userPicture = '';
      this.username = '';
      
      // Load state from localStorage on initialization
      this.loadState();
      
      // Render the initial state
      this.render();
    }
    
    // Save current state to localStorage
    saveState() {
      const state = {
        isLoggedIn: this.isLoggedIn,
        userPicture: this.userPicture,
        username: this.username
      };
      localStorage.setItem('headerState', JSON.stringify(state));
    }
    
    // Load state from localStorage
    loadState() {
      const savedState = localStorage.getItem('headerState');
      if (savedState) {
        const state = JSON.parse(savedState);
        this.isLoggedIn = state.isLoggedIn;
        this.userPicture = state.userPicture;
        this.username = state.username;
      }
    }
    
    // Set user information and update state
    setUser(username, pictureUrl) {
      this.username = username;
      this.userPicture = pictureUrl;
      this.isLoggedIn = true;
      this.saveState();
      this.render();
    }
    
    // Clear user information (logout)
    clearUser() {
      this.username = '';
      this.userPicture = '';
      this.isLoggedIn = false;
      this.saveState();
      this.render();
    }
    
    // Login handler
    login(username = "Carlos_Streamer", pictureUrl = "/assets/user.svg") {
      // In a real app, this would trigger authentication
      // For demo purposes, we'll use mock data
      this.setUser(username, pictureUrl);
    }
    
    // Logout handler
    logout() {
      this.clearUser();
    }
    
    // Render the header based on current state
    render() {
      // Create the HTML structure
      this.container.innerHTML = `
        <div class="header">
          <div class="header-left">
            ${this.isLoggedIn && this.userPicture 
              ? `<div class="user-profile">
                  <img class="profile-picture" src="${this.userPicture}" alt="${this.username}">
                  <span class="username">${this.username}</span>
                  <span class="status-indicator"></span>
                </div>`
              : '<div class="logo">Kick MAI</div>'
            }
          </div>
          <div class="header-right">
            <button class="auth-button" id="authButton">
              ${this.isLoggedIn ? 'Cerrar Sesión' : 'Iniciar Sesión'}
            </button>
          </div>
        </div>
      `;
      
      // Add event listener to the button
      const authButton = this.container.querySelector('#authButton');
      authButton.addEventListener('click', () => {
        if (this.isLoggedIn) {
          this.logout();
        } else {
          this.login();
        }
      });
    }
  }
  
  // Usage:
  
  // Initialize the header when DOM is loaded
    const header = new HeaderComponent('header-container');
    
    // Expose the header instance to the global scope for debugging/testing
    window.headerComponent = header;
