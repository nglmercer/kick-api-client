/**
 * FormGenerator - A utility class to dynamically generate forms using web components
 * This allows creating different forms (commands, gifts, etc.) with the same structure
 * but different field names and validation rules
 */
import { databases, IndexedDBManager, DBObserver, getAllDataFromDatabase } from '../store/indexdb.js';

class FormGenerator {
  /**
   * Create a new form generator
   * @param {Object} config - Configuration for the form
   * @param {string} config.formId - ID for the form container
   * @param {string} config.modalId - ID for the modal container
   * @param {string} config.dbName - Database name in IndexedDB
   * @param {Array} config.fields - Array of field configurations
   * @param {Object} config.validation - Validation rules for fields
   */
  constructor(config) {
    this.config = config;
    this.formId = config.formId;
    this.modalId = config.modalId;
    this.dbName = config.dbName;
    this.fields = config.fields;
    this.validation = config.validation || {};
    this.dbObserver = null;
    this.dbStore = null;
    this.formElements = {};
  }

  /**
   * Initialize the database connection
   * @returns {IndexedDBManager} The database store instance
   */
  initDatabase() {
    this.dbObserver = new DBObserver();
    const dbConfig = databases[this.dbName];
    if (!dbConfig) {
      console.error(`Database ${this.dbName} not found in databases configuration`);
      return null;
    }
    this.dbStore = new IndexedDBManager(dbConfig, this.dbObserver);
    return this.dbStore;
  }

  /**
   * Generate the HTML for the form
   * @returns {string} HTML string for the form
   */
  generateFormHTML() {
    let html = `
    <div class="form ${this.formId}" id="form_${this.formId}">
    `;

    // Generate HTML for each field
    this.fields.forEach(field => {
      html += `
      <div class="row" id="${field.id}_container">
        <span id="${field.id}-label" lang="en">${field.label}</span>
        <custom-input
          type="${field.type}"
          id="${field.id}"
          name="${field.id}"
          placeholder="${field.placeholder || ''}"
          ${field.options ? `options='${field.options}'` : ''}
          ${field.value ? `value="${field.value}"` : ''}
          ${field.required ? 'required' : ''}
        ></custom-input>
      </div>
      `;

      // Initial display state for conditional fields
      if (field.conditionalDisplay) {
        const { parentField, parentValue, displayWhen } = field.conditionalDisplay;
        // We'll handle the actual display logic in setupEventListeners()
      }
    });

    // Add hidden ID field
    html += `
      <custom-input
        type="number"
        id="form_id"
        name="form_id"
      ></custom-input>
    </div>
    `;

    return html;
  }

  /**
   * Generate the modal HTML with the form inside
   * @returns {string} HTML string for the modal
   */
  generateModalHTML() {
    return `
    <dialog-container id="${this.modalId}" style="padding: 4px; margin: 4px;">
      ${this.generateFormHTML()}
      <custom-dialog id="${this.modalId}_dialog"
        style="border: 0px solid red;"
        theme="dark">
      </custom-dialog>
    </dialog-container>
    `;
  }

  /**
   * Initialize the form with event listeners and database connection
   * @param {string} containerId - ID of the container element to inject the form
   */
  async init(containerId) {
    // Get the container element
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Container element with ID ${containerId} not found`);
      return;
    }
    
    // Generate and inject the modal HTML
    container.innerHTML = this.generateModalHTML();
    
    // Initialize database
    this.initDatabase();
    
    // Setup UI elements
    this.setupUI();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Load data from database
    await this.loadData();
  }

  /**
   * Setup UI elements and references
   */
  setupUI() {
    // Get modal elements
    this.modal = document.querySelector(`#${this.modalId}`);
    this.modal.show();
    
    this.modalDialog = document.querySelector(`#${this.modalId}_dialog`);
    
    // Setup dialog options
    this.modalDialog.options = [
      {
        label: 'Save',
        class: 'btn btn-sm btn-outlined save-btn',
        callback: () => this.handleSave()
      },
      {
        label: 'Cancel',
        class: 'btn btn-sm btn-outlined save-btn',
        callback: () => this.handleCancel()
      }
    ];
    
    // Get form elements
    this.formElements = {};
    this.fields.forEach(field => {
      this.formElements[field.id.replace('_', '')] = document.querySelector(`#${field.id}`);
    });
    
    // Get form ID element
    this.formIdElement = document.querySelector('#form_id');
  }

  /**
   * Setup event listeners for form elements
   */
  setupEventListeners() {
    // Setup conditional display listeners
    this.fields
      .filter(field => field.conditionalDisplay)
      .forEach(field => {
        const { parentField, parentValue, displayWhen } = field.conditionalDisplay;
        const parentElement = document.querySelector(`#${parentField}`);
        const fieldContainer = document.querySelector(`#${field.id}_container`);
        
        // Set initial display state
        this.updateFieldVisibility(parentElement, fieldContainer, parentValue, displayWhen);
        
        // Add change event listener
        parentElement.addEventListener('change', (e) => {
          this.updateFieldVisibility(parentElement, fieldContainer, parentValue, displayWhen);
        });
      });
  }

  /**
   * Update field visibility based on parent field value
   * @param {HTMLElement} parentElement - The parent field element
   * @param {HTMLElement} fieldContainer - The field container element
   * @param {string} parentValue - The parent value to check against
   * @param {string} displayWhen - When to display the field ('equal' or 'notEqual')
   */
  updateFieldVisibility(parentElement, fieldContainer, parentValue, displayWhen) {
    const currentValue = parentElement.getInputValues();
    const shouldDisplay = displayWhen === 'notEqual' 
      ? currentValue !== parentValue 
      : currentValue === parentValue;
    
    fieldContainer.style.display = shouldDisplay ? 'block' : 'none';
  }

  /**
   * Handle save button click
   */
  handleSave() {
    const formData = this.getFormData();
    console.log('Save clicked', formData);
    
    // Validate form data
    const keysToValidate = this.getKeysToValidate(formData);
    console.log('Keys to validate', keysToValidate);
    
    if (this.validateFormData(formData, keysToValidate)) {
      this.dbStore.saveData(formData);
      // this.modal.hide(); // Uncomment to hide modal after save
    }
  }

  /**
   * Handle cancel button click
   */
  handleCancel() {
    console.log('Cancel clicked');
    // this.modal.hide(); // Uncomment to hide modal after cancel
  }

  /**
   * Get form data from input elements
   * @param {boolean} [getElements=false] - Whether to return form elements instead of values
   * @returns {Object} Form data object
   */
  getFormData(getElements = false) {
    if (getElements) {
      return this.formElements;
    }
    
    const formData = {};
    Object.keys(this.formElements).forEach(key => {
      formData[key] = this.formElements[key].getInputValues();
    });
    
    return formData;
  }

  /**
   * Get keys to validate based on form configuration
   * @param {Object} formData - Form data object
   * @returns {Array} Array of keys to validate
   */
  getKeysToValidate(formData) {
    if (!this.validation || !this.validation.conditionalFields) {
      return this.getKeysObject(formData, ['id']);
    }

    const { fieldToCheck, valueToCheck, excludeFields } = this.validation;
    
    return formData[fieldToCheck] === valueToCheck
      ? this.getKeysObject(formData, excludeFields)
      : this.getKeysObject(formData, ['id']);
  }

  /**
   * Get object keys excluding specified keys
   * @param {Object} data - Object to get keys from
   * @param {Array} exclude - Array of keys to exclude
   * @returns {Array} Array of keys
   */
  getKeysObject(data, exclude = []) {
    const keys = [];
    Object.keys(data).forEach(key => {
      if (!exclude.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }

  /**
   * Validate form data
   * @param {Object} data - Form data object
   * @param {Array} keys - Array of keys to validate
   * @returns {boolean} Whether the form data is valid
   */
  validateFormData(data, keys) {
    let isValid = true;
    keys.forEach(key => {
      if (data[key] === null || data[key] === undefined || data[key] === '') {
        isValid = false;
      }
    });
    return isValid;
  }

  /**
   * Load data from database
   */
  async loadData() {
    try {
      const items = await this.dbStore.getAllData();
      console.log(`${this.formId} data`, items);
      if (items && items.length > 0) {
        this.setFormData(items[0]);
      }
      return items;
    } catch (error) {
      console.error('Error loading data:', error);
      return [];
    }
  }

  /**
   * Set form data from database
   * @param {Object} data - Data object to set in form
   */
  setFormData(data) {
    if (!data) return;
    // Set field values
    this.fields.forEach(field => {
      const key = field.id.replace('_', '');
      if (data[key] !== undefined) {
        this.formElements[key].setInputValues(data[key]);
      }
    });
    
    // Set form ID
    if (data.id !== undefined) {
      this.formIdElement.setInputValues(data.id);
    }
  }
}

export { FormGenerator };