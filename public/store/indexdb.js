const databases = {
    ActionsDB: { name: 'Actions', version: 1, store: 'actions' },
    eventsDB: { name: 'Events', version: 1, store: 'events' },
    commandsDB: { name: 'Commands', version: 1, store: 'commands' },
    giftsDB: { name: 'Gifts', version: 1, store: 'gifts' },
  };
  
  class GlobalEventEmitter {
    constructor() {
      this.listeners = {};
      this.instances = {};
    }
  
    registerInstance(instanceName, instance) {
      this.instances[instanceName] = instance;
      return instanceName;
    }
  
    on(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return this;
    }
  
    off(event, callback) {
      if (this.listeners[event]) {
        this.listeners[event] = this.listeners[event].filter(listener => listener !== callback);
      }
      return this;
    }
  
    emit(source, action, data) {
      const event = `${source}:${action}`;
      if (this.listeners[event]) {
        this.listeners[event].forEach(listener => listener(data));
      }
      
      if (this.listeners['*']) {
        this.listeners['*'].forEach(listener => listener(source, action, data));
      }
      return this;
    }
  
    getInstance(instanceName) {
      return this.instances[instanceName];
    }
  
    getAllInstances() {
      return this.instances;
    }
  }
  
  const globalEmitter = new GlobalEventEmitter();
  
  class IndexedDBManager {
    constructor(dbConfig, instanceName = null) {
      if (!dbConfig) {
        throw new Error('Database configuration is required. Please provide a valid dbConfig object.');
      }
      
      if (!dbConfig.name || !dbConfig.version || !dbConfig.store) {
        throw new Error('Invalid database configuration. dbConfig must contain name, version, and store properties.');
      }
      
      this.dbConfig = dbConfig;
      this.db = null;
      this.instanceName = instanceName || `${dbConfig.name}_${Date.now()}`;
      
      globalEmitter.registerInstance(this.instanceName, this);
    }
  
    _validateDbConfig() {
      if (!this.dbConfig) {
        throw new Error('Database configuration is undefined. Make sure to initialize the IndexedDBManager with a valid dbConfig.');
      }
    }
    
    async updateDataById(id, updatedData) {
      this._validateDbConfig();
      return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const numericId = typeof id === 'number' ? id : Number(id);
  
          if (isNaN(numericId)) {
            return reject(new Error(`Invalid id: ${id}. The id must be a valid number.`));
          }
  
          const getRequest = store.get(numericId);
  
          getRequest.onsuccess = () => {
            if (getRequest.result) {
              const newData = { ...getRequest.result, ...updatedData, id: numericId };
              const putRequest = store.put(newData);
  
              putRequest.onsuccess = () => {
                globalEmitter.emit(this.instanceName, 'update', newData);
                resolve(newData);
              };
              putRequest.onerror = () => reject(putRequest.error);
            } else {
              reject(new Error(`No data found with id ${numericId}`));
            }
          };
  
          getRequest.onerror = () => reject(getRequest.error);
        });
      });
    } 
    
    async getDataById(id) {
      this._validateDbConfig();
      return this.executeTransaction(this.dbConfig.store, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const numericId = typeof id === 'number' ? id : Number(id);
          
          if (isNaN(numericId)) {
            return reject(new Error(`Invalid id: ${id}. The id must be a valid number.`));
          }
  
          const request = store.get(numericId);
  
          request.onsuccess = () => {
            if (request.result) {
              resolve(request.result);
            } else {
              reject(new Error(`No data found with id ${numericId}`));
            }
          };
  
          request.onerror = () => reject(request.error);
        });
      });
    }
  
    async openDatabase() {
      this._validateDbConfig();
      if (this.db) return this.db;
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbConfig.name, this.dbConfig.version);
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(this.dbConfig.store)) {
            const objectStore = db.createObjectStore(this.dbConfig.store, { keyPath: 'id' });
            objectStore.createIndex('name', 'name', { unique: true });
            objectStore.createIndex('type', 'type', { unique: false });
            objectStore.createIndex('path', 'path', { unique: false });
          }
        };
        
        request.onsuccess = () => {
          this.db = request.result;
          globalEmitter.emit(this.instanceName, 'open', this.dbConfig.name);
          resolve(this.db);
        };
        
        request.onerror = () => reject(request.error);
      });
    }
    
    async executeTransaction(storeName, mode, callback) {
      this._validateDbConfig();
      const db = await this.openDatabase();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction([storeName], mode);
        const store = transaction.objectStore(storeName);
        
        let result = null;
        
        transaction.oncomplete = () => resolve(result);
        transaction.onerror = () => reject(transaction.error);
        transaction.onabort = () => reject(new Error('Transaction aborted'));
        
        try {
          result = callback(store);
        } catch (error) {
          transaction.abort();
          reject(error);
        }
      });
    }
  
    async getAllData() {
      this._validateDbConfig();
      return this.executeTransaction(this.dbConfig.store, 'readonly', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.getAll();
          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      });
    }
  
    findMissingIds(allData) {
      const existingIds = allData.map(item => item.id).sort((a, b) => a - b);
      const missingIds = [];
      let expectedId = 0;
  
      for (const id of existingIds) {
        while (expectedId < id) {
          missingIds.push(expectedId);
          expectedId++;
        }
        expectedId = id + 1;
      }
  
      return missingIds;
    }
  
    async saveData(data) {
      this._validateDbConfig();
      const allData = await this.getAllData();
      let targetId;
  
      if (typeof data.id !== 'number' || data.id < 0) {
        const missingIds = this.findMissingIds(allData);
        
        if (missingIds.length > 0) {
          targetId = missingIds[0];
        } else {
          const maxId = allData.length > 0 ? Math.max(...allData.map(item => item.id)) : -1;
          targetId = maxId + 1;
        }
      } else {
        targetId = data.id;
      }
  
      const newData = { ...data, id: targetId };
      const saveOrUpdate = (typeof data.id === 'number' && data.id >= 0) ? 'update' : 'save';
      return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.put(newData);
          request.onsuccess = () => {
            globalEmitter.emit(this.instanceName, saveOrUpdate, newData);
            console.log("saveOrUpdate", saveOrUpdate, data);
            resolve(newData);
          };
          request.onerror = () => reject(request.error);
        });
      });
    }
  
    async deleteData(id) {
      this._validateDbConfig();
      return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.delete(Number(id));
          request.onsuccess = () => {
            globalEmitter.emit(this.instanceName, 'delete', id);
            resolve(id);
          };
          request.onerror = () => reject(request.error);
        });
      });
    }
  
    async clearDatabase() {
      this._validateDbConfig();
      return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
        return new Promise((resolve, reject) => {
          const request = store.clear();
          request.onsuccess = () => {
            globalEmitter.emit(this.instanceName, 'clear', null);
            resolve();
          };
          request.onerror = () => reject(request.error);
        });
      });
    }
  
    static create(dbConfig, instanceName = null) {
      return new IndexedDBManager(dbConfig, instanceName);
    }
  
    static async getAllOrCreate(dbConfig, indexes = []) {
      if (!dbConfig) {
        throw new Error('Database configuration is required for getAllOrCreate');
      }
      
      if (!dbConfig.name || !dbConfig.version || !dbConfig.store) {
        throw new Error('Invalid database configuration. dbConfig must contain name, version, and store properties.');
      }
      
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbConfig.name, dbConfig.version);
  
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains(dbConfig.store)) {
            const objectStore = db.createObjectStore(dbConfig.store, { keyPath: 'id' });
            indexes.forEach(index => {
              objectStore.createIndex(index.name, index.keyPath, { unique: index.unique });
            });
          }
        };
  
        request.onsuccess = () => {
          const db = request.result;
  
          const transaction = db.transaction([dbConfig.store], 'readonly');
          const store = transaction.objectStore(dbConfig.store);
  
          const getAllRequest = store.getAll();
  
          getAllRequest.onsuccess = () => {
            resolve(getAllRequest.result);
            db.close();
          };
  
          getAllRequest.onerror = () => {
            reject(getAllRequest.error);
            db.close();
          };
        };
  
        request.onerror = () => {
          reject(request.error);
        };
      });
    }
  }
  
  async function getAllDataFromDatabase(databaseConfig) {
    if (!databaseConfig || !databaseConfig.name || !databaseConfig.version || !databaseConfig.store) {
      throw new Error('Invalid database configuration. databaseConfig must contain name, version, and store properties.');
    }
    
    return new Promise((resolve) => {
      const request = indexedDB.open(databaseConfig.name, databaseConfig.version);
  
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(databaseConfig.store)) {
          db.createObjectStore(databaseConfig.store, { keyPath: 'id' });
        }
      };
  
      request.onsuccess = () => {
        const db = request.result;
  
        if (!db.objectStoreNames.contains(databaseConfig.store)) {
          db.close();
          resolve([]);
          return;
        }
  
        const transaction = db.transaction([databaseConfig.store], 'readonly');
        const store = transaction.objectStore(databaseConfig.store);
  
        const getAllRequest = store.getAll();
  
        getAllRequest.onsuccess = () => {
          resolve(getAllRequest.result);
          db.close();
        };
  
        getAllRequest.onerror = () => {
          resolve([]);
          db.close();
        };
      };
  
      request.onerror = () => {
        resolve([]);
      };
    });
  }
  
  export { databases, IndexedDBManager, globalEmitter, getAllDataFromDatabase }
  
  // Ejemplo de uso
  // const actionsDB = IndexedDBManager.create(databases.ActionsDB, 'actionsInstance');
  // const eventsDB = IndexedDBManager.create(databases.eventsDB, 'eventsInstance');
  
  // Escuchar eventos de una instancia específica
  // globalEmitter.on('actionsInstance:update', (data) => {
  //   console.log('Action updated:', data);
  // });
  
  // Escuchar todos los eventos
  // globalEmitter.on('*', (source, action, data) => {
  //   console.log(`${source} emitted ${action} with data:`, data);
  // });