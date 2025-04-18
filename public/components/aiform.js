/**
 * command Form Implementation
 * This file creates a form for managing command triggers using the FormGenerator class
 */
import { FormGenerator } from './formGenerator.js';
/**
 * Initialize the command form
 * @param {string} containerId - ID of the container element to inject the form
 */
const TRANSLATIONS = [
  { label: "traducción al español", value: "spanish" },
  { label: "traducción al inglés", value: "english" },
  { label: "traducción al japonés", value: "japanese" },
  { label: "traducción al portugués", value: "portuguese" },
  { label: "traducción al francés", value: "french" },
  { label: "traducción al italiano", value: "italian" }
];
function initcommandForm(containerId) {
  // Define the form configuration
  const commandFormConfig = {
    formId: 'translateAPI',
    modalId: 'translateAPIModal',
    fields: [
      {
        id: 'apikey_input',
        name: 'apikey_input',
        label: 'API Key',
        type: 'text',
        placeholder: 'API Key',
        required: true
      },
      {
        id: 'select_language',
        name: 'select_language',
        label: 'Select Language',
        type: 'radio',
        options: JSON.stringify(TRANSLATIONS),
        value: 'es'
      }
    ],
    validation: {
      conditionalFields: true,
      fieldToCheck: '',
      valueToCheck: 'any',
      excludeFields: ['command_value', 'id']
    },
    savecallback: () => {
      const newdata = getModaldata();
      console.log('Save clicked', newdata);
      localStorage.setItem('AI_Control', JSON.stringify(newdata));
    }

  };

  // Create the form generator and initialize it
  const commandForm = new FormGenerator(commandFormConfig);
  commandForm.init(containerId);
  const lastformdata = localStorage.getItem('AI_Control');
  commandForm.setFormData(lastformdata ? JSON.parse(lastformdata) : {});
  return commandForm;
}
function getModaldata(getelements = false) {
  let allvalues = [];
  const apikey_input = document.querySelector('#apikey_input');
  const select_language = document.querySelector('#select_language');
  const formelements = {
    "apikey_input": apikey_input,
    "select_language": select_language
  };
  Object.keys(formelements).forEach(key => {
    allvalues[key] = formelements[key].getInputValues();
    // format form with resetInputValues
    //  formelements[key].resetInputValues();
  });
  //console.log(formelements);
  if (getelements) return formelements;
  return { ...allvalues };
}
function validateModaldata(data,values) {
  let isValid = true;
  Object.keys(data).forEach(key => {
    //values is array of keys to validate
    if (values && values.includes(key)) {
      if (data[key] === null || data[key] === undefined || data[key] === '') {
          isValid = false;
      }
    }
  });
  return isValid;
}
function getkeysObject(data, exclude = []) {
  let keys = [];
  Object.keys(data).forEach(key => {
    if (exclude.includes(key)) return;
    keys.push(key);
  });
  return keys;
}
export { initcommandForm };