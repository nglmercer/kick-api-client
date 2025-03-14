// TODO: Implement translations
function getTranslation(key) {
  return key;
}
class LocalStorageManager {
  constructor(key) {
    this.key = key;
    this.initializeStorage();
  }

  async initializeStorage() {
    try {
      const currentData = await this.getAll();
      if (!currentData.length) {
        await this.saveItems([]);
      }
    } catch (error) {
      this.handleError('Error initializing storage', error);
    }
  }

  deepCopy(obj) {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      this.handleError('Error creating deep copy', error);
      return null;
    }
  }

  // Método para generar un nuevo ID único o reusar un ID existente
  generateUniqueId(items, proposedId = null) {
    // Convertir ID a número si es un string
    proposedId = proposedId !== null ? Number(proposedId) : null;

    const existingIds = new Set(items.map(item => item.id));
    
    // Encontrar espacios vacíos
    const findEmptySpace = () => {
      for (let i = 0; i <= items.length; i++) {
        if (!existingIds.has(i)) {
          return i;
        }
      }
      return items.length;
    };

    // Si se propone un ID específico
    if (proposedId !== null) {
      // Si el ID propuesto no existe, usarlo
      if (!existingIds.has(proposedId)) {
        return proposedId;
      }
      
      // Buscar el primer espacio vacío
      return findEmptySpace();
    }
    
    // Si no hay ID propuesto, encontrar el primer espacio vacío
    return findEmptySpace();
  }

  // Método para asegurar que un objeto tenga un ID único
  ensureObjectHasId(item, items) {
    const itemCopy = this.deepCopy(item);
    
    // Convertir ID a número si es un string
    if (itemCopy.id !== undefined) {
      itemCopy.id = Number(itemCopy.id);
    }
    
    // Generar o ajustar el ID
    itemCopy.id = this.generateUniqueId(items, itemCopy.id);
    
    return itemCopy;
  }

  async add(item) {
    try {
      const items = await this.getAll();
      
      // Aseguramos que el item tenga un ID único
      const itemWithId = this.ensureObjectHasId(item, items);
      
      // Verificamos si ya existe un objeto similar
      const exists = items.some(existingItem =>
        this.areObjectsEqual(existingItem, itemWithId)
      );
      
      if (!exists) {
        items.push(itemWithId);
        await this.saveItems(items);
        return itemWithId.id;
      }
      
      return false;
    } catch (error) {
      this.handleError('Error adding item', error);
    }
  }

  // Los demás métodos permanecen igual que en la versión anterior
  async remove(identifier) {
    try {
      const items = await this.getAll();
      // Convertir identificador a número si es posible
      const numIdentifier = isNaN(Number(identifier)) ? identifier : Number(identifier);
      
      const updatedItems = items.filter(item =>
        item.id !== numIdentifier && item.name !== numIdentifier
      );
      
      if (updatedItems.length !== items.length) {
        await this.saveItems(updatedItems);
        return true;
      }
      return false;
    } catch (error) {
      this.handleError('Error removing item', error);
    }
  }

  async get(identifier) {
    try {
      const items = await this.getAll();
      // Convertir identificador a número si es posible
      const numIdentifier = isNaN(Number(identifier)) ? identifier : Number(identifier);
      
      const item = items.find(item =>
        item.id === numIdentifier || item.name === numIdentifier
      );
      
      return item ? this.deepCopy(item) : null;
    } catch (error) {
      this.handleError('Error getting item', error);
    }
  }

  async getAll() {
    try {
      const items = localStorage.getItem(this.key);
      return items ? this.deepCopy(JSON.parse(items)) : [];
    } catch (error) {
      this.handleError('Error getting all items', error);
    }
  }

  async saveItems(items) {
    try {
      const itemsCopy = this.deepCopy(items);
      localStorage.setItem(this.key, JSON.stringify(itemsCopy));
    } catch (error) {
      this.handleError('Error saving items', error);
    }
  }

  async clear() {
    try {
      await this.saveItems([]);
    } catch (error) {
      this.handleError('Error clearing storage', error);
    }
  }

  async exists(item) {
    try {
      const items = await this.getAll();
      const itemWithId = this.ensureObjectHasId(item, items);
      
      return items.some(existingItem =>
        this.areObjectsEqual(existingItem, itemWithId)
      );
    } catch (error) {
      this.handleError('Error checking existence', error);
    }
  }

  areObjectsEqual(obj1, obj2) {
    try {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    } catch (error) {
      this.handleError('Error comparing objects', error);
      return false;
    }
  }

  handleError(message, error) {
    console.error(message, error);
    throw error;
  }
}
class TypeofData {
    // Verificar si el valor es un objeto
    static isObject(value) {
      return value !== null && typeof value === 'object';
    }
    static ObjectStringify(value) {
      if (typeof value === 'string') {
        try {
          // Intenta analizar la cadena como JSON
          JSON.parse(value);
          // Si no hay error, asumimos que ya es una cadena JSON válida
        } catch (e) {
          // Si no es JSON válido, lo convertimos a JSON
          value = JSON.stringify(value);
        }
      } else if (typeof value === 'object') {
        // Si es un objeto, lo convertimos a JSON
        value = JSON.stringify(value);
      }
      return value;
    }
    static returnArray(value) {
      if (this.isArray(value)) {
        return value;
      } else if (this.isString(value)) {
        return value.split(',');
      } else if (this.isObject(value)) {
        return Object.values(value);
      }
      return [];
    }
    // Verificar si el valor es un array
    static isArray(value) {
      return Array.isArray(value);
    }
  
    // Verificar si el valor es una función
    static isFunction(value) {
      return typeof value === 'function';
    }
  
    // Verificar si el valor es una string
    static isString(value) {
      return typeof value === 'string';
    }
  
    // Verificar si el valor es un número
    static isNumber(value) {
      return typeof value === 'number' && !isNaN(value);
    }
  
    // Verificar si el valor es un booleano
    static isBoolean(value) {
      return typeof value === 'boolean';
    }
  
    // Verificar si el valor es null
    static isNull(value) {
      return value === null;
    }
  
    // Verificar si el valor es undefined
    static isUndefined(value) {
      return value === undefined;
    }
  
    // Convertir string a número
    static toNumber(value) {
      if (this.isString(value) && !isNaN(value)) {
        return Number(value);
      } else if (this.isNumber(value)) {
        return value;
      }
      return null; // Devolver NaN si la conversión falla
    }
  
    // Convertir número a string
    static toString(value) {
      if (this.isNumber(value)) {
        return String(value);
      }
      if (this.isBoolean(value)) {
        return String(value);
      }
      if (this.isObject(value)) {
        return JSON.stringify(value);
      }
      return '';
    }
    static toStringParse(value) {
      if (!value) return value; // Devuelve el valor original si no es una cadena
      if (this.isString(value)) {
        try {
          return JSON.parse(value);
        } catch (error) {
          console.warn("Failed to parse JSON string:", value);
          return value; // Devuelve el valor original si no se puede analizar
        }
      }
      return value; // Devuelve el valor original si no es una cadena
    }
    // Verificar si un string puede ser convertido a número
    static canBeNumber(value) {
      return this.isString(value) && !isNaN(value);
    }
  
    // Obtener el tipo del valor en forma de string
    static getType(value) {
      if (this.isObject(value)) return 'object';
      if (this.isArray(value)) return 'array';
      if (this.isFunction(value)) return 'function';
      if (this.isString(value)) return 'string';
      if (this.isNumber(value)) return 'number';
      if (this.isBoolean(value)) return 'boolean';
      if (this.isNull(value)) return 'null';
      if (this.isUndefined(value)) return 'undefined';
      return 'unknown';
    }
}
function flattenObject(obj, separator = '_') {
  const result = {};

  function recurse(current, path = '') {
      // Maneja valores primitivos y null
      if (Object(current) !== current) {
          result[path.slice(0, -1)] = current;
          return;
      }

      // Maneja arrays
      if (Array.isArray(current)) {
          result[path.slice(0, -1)] = current; // Guarda el array como tal
          return;
      }

      // Maneja objetos
      for (const key in current) {
          const newPath = path + key + separator;
          recurse(current[key], newPath);
      }
  }

  recurse(obj);
  return result;
}

// Función para reconstituir un objeto plano a su forma original
function unflattenObject(obj, separator = '_') {
  const result = {};

  for (const key in obj) {
      const parts = key.split(separator);
      let current = result;

      for (let i = 0; i < parts.length - 1; i++) {
          const part = parts[i];
          if (!(part in current)) {
              current[part] = {};
          }
          current = current[part];
      }

      const lastPart = parts[parts.length - 1];

      // Detecta arrays al deshacer el aplanado
      if (Array.isArray(obj[key])) {
          current[lastPart] = obj[key];
      } else {
          current[lastPart] = obj[key];
      }
  }

  return result;
}

// Ejemplo de usoquerySnapshot.forEach
// console.log(TypeofData.isString("hello")); // true
// console.log(TypeofData.isNumber(123)); // true
// console.log(TypeofData.isArray([1, 2, 3])); // true
// console.log(TypeofData.toNumber("123")); // 123
// console.log(TypeofData.toString(123)); // "123"
// console.log(TypeofData.getType({})); // "object"
// console.log(TypeofData.canBeNumber("456")); // true
class Counter {
    constructor(initialValue = 0, interval = 1000) {
      this.value = initialValue;
      this.interval = interval;
      this.intervalId = null;
    }
  
    start() {
      if (!this.intervalId) {
        this.intervalId = setInterval(() => {
          this.increment();
          // console.log(`ID generado: ${this.value}`);
        }, this.interval);
      }
    }
  
    stop() {
      if (this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    }
  
    increment() {
      this.value++;
      return this.value;
    }
  
    getCurrentValue() {
      return this.value;
    }
}
class ComboTracker {
  constructor(resetInterval = 30000) {
    this.comboCounters = {}; // Almacena los contadores por tipo y uniqueId
    this.resetInterval = resetInterval; // Intervalo en milisegundos para reiniciar los contadores

    // Iniciar el temporizador para restablecer los contadores
    this.startResetTimer();
  }

  // Método general para manejar combos entrantes (like, comment, etc.) y retornar el total acumulado
  addCombo(data, comboType = 'likeCount') {
    const { uniqueId, value } = data;

    if (!this.comboCounters[uniqueId]) {
      // Inicializar el contador para este uniqueId
      this.comboCounters[uniqueId] = {};
    }

    if (!this.comboCounters[uniqueId][comboType]) {
      // Inicializar el contador para este comboType si no existe
      this.comboCounters[uniqueId][comboType] = 0;
    }

    // Sumar el valor al contador correspondiente
    this.comboCounters[uniqueId][comboType] += value;

    // Retornar el total acumulado de combos para este uniqueId y comboType
    return this.comboCounters[uniqueId][comboType];
  }

  // Método para obtener el total de todos los combos de todos los tipos
  getTotalCombos() {
    let total = 0;
    Object.values(this.comboCounters).forEach(userCombos => {
      Object.values(userCombos).forEach(count => {
        total += count;
      });
    });
    return total;
  }

  // Método para restablecer los contadores de todos los tipos
  resetComboCounters() {
    Object.keys(this.comboCounters).forEach(uniqueId => {
      Object.keys(this.comboCounters[uniqueId]).forEach(comboType => {
        this.comboCounters[uniqueId][comboType] = 0; // Reinicia el contador para cada tipo
      });
    });
  }

  // Iniciar el temporizador que restablece los contadores periódicamente
  startResetTimer() {
    setInterval(() => {
      this.resetComboCounters();
      // console.log("Los contadores de combos han sido restablecidos.");
    }, this.resetInterval);
  }
}
class LikeTracker {
  constructor(resetInterval = 30000) { // Intervalo de reinicio por defecto: 30 segundos
    this.likeCounters = {}; // Almacena los contadores de likes por uniqueId
    this.resetInterval = resetInterval; // Intervalo en milisegundos para reiniciar los contadores

    // Iniciar el temporizador para restablecer los contadores
    this.startResetTimer();
  }

  // Método para manejar likes entrantes y retornar el total acumulado
  addLike(data) {
    const { uniqueId, likeCount } = data;

    if (!this.likeCounters[uniqueId]) {
      // Inicializar el contador en 0 si no existe
      this.likeCounters[uniqueId] = 0;
    }

    // Sumar los nuevos likes al contador existente
    this.likeCounters[uniqueId] += likeCount;

    // Retornar el total acumulado de likes para este usuario
    return this.likeCounters[uniqueId];
  }

  // Método para restablecer los contadores de likes
  resetLikeCounters() {
    Object.keys(this.likeCounters).forEach(uniqueId => {
      this.likeCounters[uniqueId] = 0; // Reinicia el contador para cada usuario
    });
  }

  // Iniciar el temporizador que restablece los contadores periódicamente
  startResetTimer() {
    setInterval(() => {
      this.resetLikeCounters();
      // console.log("Los contadores de likes han sido restablecidos.");
    }, this.resetInterval);
  }
}
const EvaluerLikes = new LikeTracker(5000);
const replaceVariables = (command, data, iscommand = false ) => {
  let playerName = localStorage.getItem('playerNameInput') || localStorage.getItem('playerName');

  if (!command || typeof command !== 'string') {
    console.warn("Error: 'command' debe ser una cadena de texto.", typeof command);
    return command; // O lanzar un error si prefieres: throw new Error("'command' debe ser una cadena de texto.");
  }
  if (iscommand && command.includes(" ")) {
    // Dividimos el string en máximo 2 partes usando el espacio como separador
    command = command.split(" ", 2)[1];
  }
  // Reemplazar variables en el comando
  let replacedCommand = command
    .replace(/uniqueId/g, data.uniqueId || 'testUser')
    .replace(/uniqueid/g, data.uniqueId || 'testUser')
    .replace(/nickname/g, data.nickname || 'testUser')
    .replace(/comment/g, data.comment || 'testComment')
    .replace(/{milestoneLikes}/g, data.likeCount || '50testLikes')
    .replace(/{likes}/g, data.likeCount || '50testLikes')
    .replace(/message/g, data.comment || 'testcomment')
    .replace(/giftName/g, data.giftName || 'testgiftName')
    .replace(/giftname/g, data.giftName || 'testgiftName')
    .replace(/repeatCount/g, data.repeatCount || '123')
    .replace(/repeatcount/g, data.repeatCount || '123')
    .replace(/playername/g, playerName || '@a') // Reemplazar el nombre del jugador
    .replace(/diamonds/g, data.diamondCount || '50testDiamonds')
    .replace(/likecount/g, data.likeCount || '50testLikes')
    .replace(/followRole/g, data.followRole || 'followRole 0')
    .replace(/userId/g, data.userId || '1235646')
    .replace(/teamMemberLevel/g, data.teamMemberLevel || 'teamMemberLevel 0')
    .replace(/subMonth/g, data.subMonth || 'subMonth 0');

  // Eliminar todos los backslashes
  replacedCommand = replacedCommand.replace(/\\/g, '');

  return replacedCommand;
};

class ObjectComparator {
  constructor(mainObject) {
    this.mainObject = mainObject;
  }

  compareKeys(objectsToCompare, keysToCheck, includeTrueValues = false) {
    if (Array.isArray(objectsToCompare)) {
      return objectsToCompare.map(obj => {
        return this.compareSingleObject(obj, keysToCheck, includeTrueValues);
      });
    } else {
      return this.compareSingleObject(objectsToCompare, keysToCheck, includeTrueValues);
    }
  }

  compareSingleObject(obj, keysToCheck, includeTrueValues = false) {
    const result = {};
    keysToCheck.forEach(key => {
      const keyName = typeof key === 'object' ? key.key : key;
      const compareType =
        typeof key === 'object' && key.compare ? key.compare : 'isEqual';
      
      result[keyName] = this.compareValues(
        this.mainObject[keyName],
        obj[keyName],
        compareType,
        includeTrueValues
      );
    });
    return result;
  }

  compareValues(value1, value2, compareType = 'isEqual', includeTrueValues = false) {
    // If includeTrueValues is true, allow special 'true' value matching
    if (includeTrueValues && (value2 === 'true' || value1 === 'true')) {
      return { 
        isEqual: true, 
        contains: true,
        startsWith: true,
        endsWith: true,
        isInRange: true,
        isLess: true,
        isGreater: true,
        isLessOrEqual: true,
        isGreaterOrEqual: true
      };
    }

    if (typeof value1 === 'string' && typeof value2 === 'string') {
      return this.compareStrings(value1, value2);
    } else if (typeof value1 === 'number' && typeof value2 === 'number') {
      return this.compareNumbers(value1, value2);
    } else {
      return { isEqual: value1 === value2 };
    }
  }

  // Rest of the methods remain the same as in the original code
  compareStrings(str1, str2) {
    return {
      isEqual: str1 === str2,
      contains: str1.includes(str2),
      startsWith: str1.startsWith(str2),
      endsWith: str1.endsWith(str2),
      exists: str1 !== undefined && str2 !== undefined,
    };
  }

  compareNumbers(num1, num2) {
    const maxRange2 = num2 * 1.1; // 110% of num2 value
    const minRange2 = num2 * 0.9; // 90% of num2 value
    return {
      isEqual: num1 === num2,
      isLess: num1 < num2,
      isGreater: num1 > num2,
      isLessOrEqual: num1 <= num2,
      isGreaterOrEqual: num1 >= num2,
      isInRange: num1 >= minRange2 && num1 <= maxRange2,
      exists: num1 !== undefined && num2 !== undefined,
    };
  }
}

function compareObjects(mainObject, objectsToCompare, keysToCheck, callback, includeTrueValues = false) {
  const comparator = new ObjectComparator(mainObject);
  const comparisonResults = comparator.compareKeys(
    objectsToCompare,
    keysToCheck,
    includeTrueValues
  );
  const validResults = [];
  let coincidentobjects = {};

  if (callback && typeof callback === 'function') {
    comparisonResults.forEach((comparisonResult, index) => {
      const allComparisonsTrue = getComparisonValues(
        comparisonResult,
        keysToCheck
      );
     
      if (allComparisonsTrue.allTrue) {
        callback(objectsToCompare[index], index, allComparisonsTrue);
        validResults.push(objectsToCompare[index]);
        coincidentobjects = allComparisonsTrue;
      }
    });
  }

  return { comparisonResults, validResults, coincidentobjects };
}

function getComparisonValues(obj, keysToCheck) {
  const result = {};
  let allTrue = true;
  keysToCheck.forEach(({ key, compare }) => {
    if (obj[key] && obj[key][compare] !== undefined) {
      result[key] = obj[key][compare];
      if (!obj[key][compare]) {
        allTrue = false;
      }
    }
  });
  result.allTrue = allTrue;
  return result;
}
class Logger {
  constructor(categories = {}, showCategoryName = true) {
      this.categories = categories; // Objeto para almacenar las categorías de log
      this.showCategoryName = showCategoryName; // Control para mostrar el nombre de la categoría al inicio del log
  }

  // Método para agregar una nueva categoría y su estado inicial (activada/desactivada)
  addCategory(category, enabled = true) {
      if (!this.categories.hasOwnProperty(category)) {
          this.categories[category] = enabled;
      } else {
          console.warn(`La categoría '${category}' ya existe.`);
      }
  }

  // Método para activar o desactivar logs de una categoría específica
  toggleCategory(category, enabled) {
      if (this.categories.hasOwnProperty(category)) {
          this.categories[category] = enabled;
      } else {
          console.warn(`La categoría '${category}' no existe. Usa addCategory() para agregarla.`);
      }
  }

  // Método para activar o desactivar la visualización del nombre de la categoría en los logs
  toggleShowCategoryName(show) {
      this.showCategoryName = show;
  }

  // Método para verificar si una categoría está habilitada
  isCategoryEnabled(category) {
      return !!this.categories[category];
  }

  // Método para crear un log en una categoría específica, soporta varios tipos de datos
  log(category, ...messages) {
      if (this.isCategoryEnabled(category)) {
          console.group(`[${category.toUpperCase()}]`);
          messages.forEach(message => {
              let logMessage = this.showCategoryName ? `${category}: ` : '';
              
              if (typeof message === 'object') {
                  console.log(message); // Formato tabular para arrays y objetos
              } else {
                  console.log(logMessage + message);  // Agrega prefijo de categoría en el caso de strings y otros tipos
              }
          });
          console.groupEnd();
      }
  }

  // Método para listar todas las categorías de log existentes
  listCategories() {
      return Object.keys(this.categories);
  }
}

// Ejemplo de uso:
const logger = new Logger({debug: true, info: true}, false);


// Añadir categorías dinámicamente
// logger.addCategory('datos'); // Habilitada por defecto
// logger.addCategory('valores'); // Habilitada por defecto
logger.addCategory('speechchat', true);
logger.addCategory('minecraft', false);
logger.addCategory('Event', true);
logger.addCategory('Action', true);
logger.addCategory('EventAction', true);
logger.addCategory('renderhtml', true);
logger.toggleCategory('renderhtml', false);
logger.toggleCategory('debug', true);
logger.toggleCategory('speechchat', false);
console.log(logger.listCategories());
// // Logs en diferentes categorías
// logger.log('datos', 'Este es un mensaje de la categoría datos', {
// aasdasd: 'asdasdaaaa',
// basdasd: 'asdasdaaaa',
// });
// logger.log('valores', 'Este es un mensaje de la categoría valores', [1, 2, 3]);

// // Desactivar la categoría "datos"
// logger.toggleCategory('datos', false);

// // Este log no se imprimirá porque la categoría "datos" está desactivada
// logger.log('datos', 'Este mensaje no se mostrará');

// // Activar y loggear en "debug"
// logger.toggleCategory('debug', true);
// logger.log('debug', 'Mensaje de depuración', { x: 10, y: 20 }, [1, 2, 3],123123123);

// // Listar todas las categorías
// console.log('Categorías disponibles:', logger.listCategories());

// Crear múltiples contadores con diferentes intervalos
// const counter1 = new Counter(0, 1000); // Genera ID cada 1 segundo
// // Usar los IDs generados
// setInterval(() => {
//   const id1 = counter1.increment();
//   console.log(id1);
// }, 3000);
/* const tracker = new ComboTracker();

// Agregamos likes y comentarios para 'user1' y 'user2'
tracker.addCombo({ uniqueId: 'user1', value: 5 }, 'likeCount'); // 5 likes
tracker.addCombo({ uniqueId: 'user1', value: 2 }, 'commentCount'); // 2 comentarios

tracker.addCombo({ uniqueId: 'user2', value: 4 }, 'likeCount'); // 4 likes para 'user2'
tracker.addCombo({ uniqueId: 'user2', value: 1 }, 'commentCount'); // 1 comentario para 'user2'

// Verificamos los contadores
console.log(tracker.comboCounters); 
// {
//   user1: { likeCount: 5, commentCount: 2 },
//   user2: { likeCount: 4, commentCount: 1 }
// }


// Crear una instancia del tracker
const tracker = new UserInteractionTracker({
  // Opcional: destruir automáticamente después de la primera interacción
  autoDestroy: true
});

// Añadir un listener para el evento de interacción
function handleUserInteraction(event) {
  console.log('Interacción detectada:', event.detail);
  // Este callback solo se ejecutará una vez
}

// Agregar el listener de interacción
tracker.addInteractionListener(handleUserInteraction);

// Ejemplo de cómo se comportará
document.addEventListener('DOMContentLoaded', () => {
  // Supongamos que tenemos algunos elementos interactivos
  const button = document.getElementById('myButton');
  const input = document.getElementById('myInput');

  // El primer evento que ocurra (click, scroll, etc.) 
  // activará el listener una única vez
  button.addEventListener('click', () => {
    console.log('Botón clickeado');
  });

  input.addEventListener('input', () => {
    console.log('Input modificado');
  });

  // Si quieres reiniciar manualmente para permitir otra interacción
  // tracker.reset();
});

// Opcional: manejar el evento de destrucción del tracker
document.addEventListener('trackerDestroyed', (event) => {
  console.log('Tracker destruido con estado final:', event.detail.finalState);
});
export default UserInteractionTracker;
// Total acumulado de todos los combos (likes + comentarios)
console.log('Total de combos acumulados:', tracker.getTotalCombos()); // 12 */
class UserInteractionTracker {
  constructor(options = {}) {
    // Estado de interacción general
    this.hasInteracted = false;
    // Bandera para controlar la emisión única del evento
    this.eventEmitted = false;
    // Mapa para seguir tipos específicos de interacciones
    this.interactions = new Map();
    // Lista de eventos que consideramos como interacción
    this.interactionEvents = [
      'click',
      'touchstart',
      'keydown',
      'input',
    ];
    // Callbacks almacenados
    this.callbacks = new Set();
    // Opciones de configuración
    this.options = {
      autoDestroy: false, // Destruir automáticamente después de la primera interacción
      destroyCondition: null, // Función personalizada para determinar cuándo destruir
      ...options
    };
    // Bind del método para mantener el contexto
    this._handleInteraction = this._handleInteraction.bind(this);
    // Inicializar listeners
    this.initializeTracking();
  }

  initializeTracking() {
    // Agregar listeners para cada tipo de evento
    this.interactionEvents.forEach(eventType => {
      document.addEventListener(eventType, this._handleInteraction);
      this.interactions.set(eventType, false);
    });
  }

  _handleInteraction(event) {
    // Actualizar estado general
    this.hasInteracted = true;
    // Actualizar estado específico del tipo de evento
    this.interactions.set(event.type, true);
    
    // Disparar evento personalizado solo una vez
    if (!this.eventEmitted) {
      this._dispatchInteractionEvent(event.type);
      this.eventEmitted = true;
    }

    // Verificar si debemos destruir los listeners
    if (this.shouldDestroy()) {
      this.destroy();
    }
  }

  shouldDestroy() {
    if (this.options.destroyCondition) {
      return this.options.destroyCondition(this.getAllInteractions());
    }
    if (this.options.autoDestroy) {
      return this.hasInteracted;
    }
    return false;
  }

  _dispatchInteractionEvent(type) {
    const event = new CustomEvent('userInteraction', {
      detail: {
        type,
        timestamp: new Date().getTime(),
        interactions: this.getAllInteractions()
      },
    });
    document.dispatchEvent(event);
  }

  hasUserInteracted() {
    return this.hasInteracted;
  }

  hasSpecificInteraction(type) {
    return this.interactions.get(type) || false;
  }

  getAllInteractions() {
    return Object.fromEntries(this.interactions);
  }

  getAllInteractionsByArray(array) {
    return array.some(eventType => this.interactions.get(eventType));
  }

  addInteractionListener(callback) {
    document.addEventListener('userInteraction', callback);
    this.callbacks.add(callback);
  }

  removeInteractionListener(callback) {
    document.removeEventListener('userInteraction', callback);
    this.callbacks.delete(callback);
  }

  destroy() {
    // Eliminar todos los event listeners del documento
    this.interactionEvents.forEach(eventType => {
      document.removeEventListener(eventType, this._handleInteraction);
    });
    
    // Eliminar todos los callbacks registrados
    this.callbacks.forEach(callback => {
      document.removeEventListener('userInteraction', callback);
    });
    this.callbacks.clear();
    
    // Disparar un evento final de destrucción
    const destroyEvent = new CustomEvent('trackerDestroyed', {
      detail: {
        finalState: this.getAllInteractions(),
        timestamp: new Date().getTime()
      }
    });
    document.dispatchEvent(destroyEvent);
  }

  reset() {
    this.hasInteracted = false;
    this.eventEmitted = false;
    this.interactionEvents.forEach(eventType => {
      this.interactions.set(eventType, false);
    });
  }
}
class ArrayStorageManager {
  constructor(storageKey) {
      this.storageKey = storageKey;
      this.items = this.getAll();
  }

  getAll() {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
  }

  saveToStorage() {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
  }

  validateInput(item) {
      if (typeof item !== 'string') return false;
      if (item.length <= 1) return false;
      return true;
  }

  existInItems(text) {
      const normalizedText = text.toLowerCase();
      return this.items.some(item =>
          item.toLowerCase() === normalizedText
      );
  }
  // Verificar si algún item está contenido en el texto
  containswordInitems(text) {
      const normalizedText = text.toLowerCase();
      return this.items.some(item =>
          normalizedText.includes(item.toLowerCase())
      );
  }

  // Verificar si el texto existe como item o contiene algún item
  containword(text) {
      if (!this.validateInput(text)) return false;
      return this.existInItems(text) || this.containswordInitems(text);
  }
  add(item) {
      if (!this.validateInput(item)) return false;
      if (!this.existInItems(item)) {
          this.items.push(item);
          this.saveToStorage();
          return true;
      }
      return false;
  }

  remove(item) {
      const initialLength = this.items.length;
      this.items = this.items.filter(existingItem =>
          existingItem.toLowerCase() !== item.toLowerCase()
      );
      if (this.items.length !== initialLength) {
          this.saveToStorage();
          return true;
      }
      return false;
  }
}
class ArrayManagerUI {
  constructor(storageManager,defaultelements) {
      this.manager = storageManager;
      this.defaultelements = defaultelements;
  }

  // Genera el contenedor del HTML como un nodo DOM
  createElement(tag, options = {}, children = []) {
      const element = document.createElement(tag);
      
      // Asignar propiedades del elemento
      if (options.classes) element.className = options.classes;
      if (options.attributes) {
          Object.entries(options.attributes).forEach(([key, value]) => {
              element.setAttribute(key, value);
          });
      }
      if (options.textContent) element.textContent = options.textContent;
      if (options.html) element.innerHTML = options.html;

      // Añadir hijos
      children.forEach(child => {
          element.appendChild(child);
      });

      return element;
  }

  // Retorna el contenedor HTML como nodo DOM
  getHTML() {
      const storageKeyname = this.manager.storageKey;

      const title = this.createElement('h2', {
          classes: 'modal-title',
          html: `<translate-text key="${storageKeyname}"></translate-text>`,
      });

      const input = this.createElement('input', {
          classes: 'array-manager-input',
          attributes: {
              type: 'text',
              placeholder: getTranslation('addelement'),
          },
      });

      const addButton = this.createElement('button', {
          classes: 'array-manager-add open-modal-btn',
          textContent: getTranslation('add'),
      });

      const defaultButton = this.createElement('button', {
          classes: 'array-manager-default open-modal-btn',
          textContent: `${getTranslation('default')} ${getTranslation(storageKeyname)}`,
      });

      const inputContainer = this.createElement('div', {
          classes: 'input-container',
      }, [input, addButton, defaultButton]);

      const errorMessage = this.createElement('div', {
          classes: 'array-manager-error error-message',
          textContent: 'El texto debe tener al menos 2 caracteres',
      });

      const itemsContainer = this.createElement('div', {
          classes: 'array-manager-items items-container',
      });

      const container = this.createElement('div', {
          classes: 'array-manager-container',
          attributes: { 'data-component': 'array-manager' },
      }, [title, inputContainer, errorMessage, itemsContainer]);

      return container;
  }

  // Método para inicializar los event listeners
  initializeEventListeners(containerElement) {
      if (!containerElement) {
          console.error('No se proporcionó un elemento contenedor válido');
          return;
      }

      const input = containerElement.querySelector('.array-manager-input');
      const addButton = containerElement.querySelector('.array-manager-add');
      const defaultButton = containerElement.querySelector('.array-manager-default');
      const errorMessage = containerElement.querySelector('.array-manager-error');
      const itemsContainer = containerElement.querySelector('.array-manager-items');

      const createItemElement = (text) => {
          const itemDiv = this.createElement('div', { classes: 'item' }, [
              this.createElement('span', { textContent: text }),
              this.createElement('button', {
                  classes: 'delete-btn',
                  textContent: '×',
              }),
          ]);

          const deleteButton = itemDiv.querySelector('.delete-btn');
          deleteButton.addEventListener('click', () => {
              this.manager.remove(text);
              itemDiv.remove();
          });

          itemsContainer.appendChild(itemDiv);
      };

      const handleAddItem = (text = input.value.trim()) => {
          errorMessage.style.display = 'none';
          if (this.manager.validateInput(text)) {
              if (this.manager.add(text)) {
                  createItemElement(text);
                  if (text === input.value.trim()) {
                      input.value = '';
                  }
              }
          } else {
              errorMessage.style.display = 'block';
          }
      };

      const loadItems = () => {
          itemsContainer.innerHTML = '';
          this.manager.getAll().forEach(item => createItemElement(item));
      };

      const handleAddDefault = () => {
        this.defaultelements.forEach(text => handleAddItem(text));
      };

      addButton.addEventListener('click', () => handleAddItem());
      defaultButton.addEventListener('click', handleAddDefault);
      input.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') handleAddItem();
      });

      loadItems();

      return { loadItems, addItem: handleAddItem, addDefault: handleAddDefault };
  }
}
function getallfilesmap(objetc) {
  try {
    logger.log("renderhtml","getallfilesmap",objetc);
    const filesmap = objetc.map(file => ({
      value: file.id,
      label: file.nombre,
      path: file.path,
      mediaType: file.mediaType || file.type,
      mediaUrl: file.mediaUrl || file.path,
      id: file.id,
    }));
    logger.log("renderhtml","filesmap",filesmap);
    return filesmap;
  } catch (error) {
    console.error('Error getting all files:', error);
    return {};
  }
}
function showAlert(type='info', message, duration = 3000,data) {
  const alert = document.createElement('app-alert');
  alert.setAttribute('type', type);
  alert.setAttribute('message', message);
  if (data) alert.setAttribute('details', JSON.stringify(data));
  alert.setAttribute('dark-mode', ''); // Enables dark mode
  alert.setAttribute('duration', duration); // Enables close button
/*   switch (type) {
    case 'success':
        alert.classList.add('alert-success');
        break;
    case 'info':
        alert.classList.add('alert-info');
        break;
    case 'warning':
        alert.classList.add('alert-warning');
        break;
    case 'error':
        alert.classList.add('alert-error');
        break;
    default:
        alert.classList.add('alert-info');
} */
document.body.appendChild(alert);

}
export {
  LocalStorageManager,
  unflattenObject,
  showAlert,
  flattenObject, 
  Counter, 
  TypeofData,
  ComboTracker, 
  replaceVariables, 
  compareObjects, 
  logger, 
  UserInteractionTracker, 
  EvaluerLikes, 
  ArrayStorageManager, 
  ArrayManagerUI,
  getallfilesmap 
};
  