/**
 * command Form Implementation
 * This file creates a form for managing command triggers using the FormGenerator class
 */
import { FormGenerator } from './formGenerator.js';
import { databases, IndexedDBManager, DBObserver, getAllDataFromDatabase } from '../store/indexdb.js';
const dbObserver = new DBObserver();
const commandsDB = databases.commandsDB;
const commandStore = new IndexedDBManager(commandsDB, dbObserver);
/**
 * Initialize the command form
 * @param {string} containerId - ID of the container element to inject the form
 */
function initcommandForm(containerId) {
  // Define the form configuration
  const commandFormConfig = {
    formId: 'command',
    modalId: 'commandModal',
    dbName: 'commandsDB',
    fields: [
      {
        id: 'command_name',
        name: 'command_name',
        label: 'command Name',
        type: 'text',
        placeholder: '{{command.name}}',
        required: true
      },
      {
        id: 'command_trigger',
        name: 'command_trigger',
        label: 'Trigger Type',
        type: 'radio',
        options: '[{"value": "any", "label": "any donation"},{"value": "contains", "label": "contains"}, {"value": "startswith", "label": "starts with"}, {"value": "endswith", "label": "ends with"}, {"value": "exact", "label": "exact"}]',
        value: 'any'
      },
      {
        id: 'command_value',
        name: 'command_value',
        label: 'command Value',
        type: 'text',
        placeholder: '{{command.value}}',
        conditionalDisplay: {
          parentField: 'command_trigger',
          parentValue: 'any',
          displayWhen: 'notEqual'
        }
      }
    ],
    validation: {
      conditionalFields: true,
      fieldToCheck: 'command_trigger',
      valueToCheck: 'any',
      excludeFields: ['command_value', 'id']
    },
    savecallback: () => {
      const newdata = getModaldata();
      console.log('Save clicked', newdata);
      const keystovalues = getModaldata().command_trigger === "any" ?getkeysObject(getModaldata(true),["command_value","id"]) :  getkeysObject(getModaldata(true),["id"]);
      console.log("keystovalues",keystovalues);
      if (validateModaldata(newdata,keystovalues)) {
        commandStore.saveData(newdata);
      //  userModal.hide();
      }
    }

  };

  // Create the form generator and initialize it
  const commandForm = new FormGenerator(commandFormConfig);
  commandForm.init(containerId);
}
function getModaldata(getelements = false) {
  let allvalues = [];
  const command_name = document.querySelector('#command_name');
  const command_trigger = document.querySelector('#command_trigger');
  const command_value = document.querySelector('#command_value');
  const form_id = document.querySelector('#form_id');
  const formelements = {
    "name": command_name,
    "command_trigger": command_trigger,
    "command_value": command_value,
    "id": form_id,
  }
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