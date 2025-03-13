/**
 * Gift Form Implementation
 * This file creates a form for managing gift triggers using the FormGenerator class
 */
import { FormGenerator } from './formGenerator.js';

// Add the gifts database configuration if it doesn't exist
if (!window.databases) {
  window.databases = {};
}

if (!window.databases.giftsDB) {
  window.databases.giftsDB = { name: 'Gifts', version: 1, store: 'gifts' };
}

/**
 * Initialize the gift form
 * @param {string} containerId - ID of the container element to inject the form
 */
function initGiftForm(containerId) {
  // Define the form configuration
  const giftFormConfig = {
    formId: 'gift',
    modalId: 'giftModal',
    dbName: 'giftsDB',
    fields: [
      {
        id: 'gift_name',
        label: 'Gift Name',
        type: 'text',
        placeholder: '{{gift.name}}',
        required: true
      },
      {
        id: 'gift_trigger',
        label: 'Trigger Type',
        type: 'radio',
        options: '[{"value": "any", "label": "any donation"},{"value": "contains", "label": "contains"}, {"value": "startswith", "label": "starts with"}, {"value": "endswith", "label": "ends with"}, {"value": "exact", "label": "exact"}]',
        value: 'any'
      },
      {
        id: 'gift_value',
        label: 'Gift Value',
        type: 'text',
        placeholder: '{{gift.value}}',
        conditionalDisplay: {
          parentField: 'gift_trigger',
          parentValue: 'any',
          displayWhen: 'notEqual'
        }
      }
    ],
    validation: {
      conditionalFields: true,
      fieldToCheck: 'gift_trigger',
      valueToCheck: 'any',
      excludeFields: ['gift_value', 'id']
    }
  };

  // Create the form generator and initialize it
  const giftForm = new FormGenerator(giftFormConfig);
  giftForm.init(containerId);
}

export { initGiftForm };