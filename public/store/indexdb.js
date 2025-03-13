const databases = {
    ActionsDB: { name: 'Actions', version: 1, store: 'actions' },
    eventsDB: { name: 'Events', version: 1, store: 'events' },
    commandsDB: { name: 'Commands', version: 1, store: 'commands' },
    giftsDB : { name: 'Gifts', version: 1, store: 'gifts' },
  };

  /**
   * Class for managing IndexedDB operations
   * @class IndexedDBManager
   */
  class IndexedDBManager {
    /**
     * Creates an instance of IndexedDBManager.
     * @param {Object} dbConfig - Configuration for the database with properties: name, version, and store
     * @param {Object} [idbObserver] - Observer for database events
     * @throws {Error} If dbConfig is missing or invalid
     */
    constructor(dbConfig, idbObserver) {
        if (!dbConfig) {
            throw new Error('Database configuration is required. Please provide a valid dbConfig object.');
        }
        
        if (!dbConfig.name || !dbConfig.version || !dbConfig.store) {
            throw new Error('Invalid database configuration. dbConfig must contain name, version, and store properties.');
        }
        
        this.dbConfig = dbConfig;
        this.idbObserver = idbObserver;
        this.db = null;
    }

    /**
     * Validates that dbConfig exists before performing operations
     * @private
     * @throws {Error} If dbConfig is undefined
     */
    _validateDbConfig() {
        if (!this.dbConfig) {
            throw new Error('Database configuration is undefined. Make sure to initialize the IndexedDBManager with a valid dbConfig.');
        }
    }
    
    async updateDataById(id, updatedData) {
        this._validateDbConfig();
        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                // Convertir el id a número si es necesario y es requerido por la clave
                const numericId = typeof id === 'number' ? id : Number(id);
    
                if (isNaN(numericId)) {
                    return reject(new Error(`Invalid id: ${id}. The id must be a valid number.`));
                }
    
                // Intentar obtener el registro con el id especificado
                const getRequest = store.get(numericId);
    
                getRequest.onsuccess = () => {
                    if (getRequest.result) {
                        // Mezcla los datos existentes con los nuevos datos, manteniendo el id original
                        const newData = { ...getRequest.result, ...updatedData, id: numericId };
                        const putRequest = store.put(newData);
    
                        putRequest.onsuccess = () => {
                            this.idbObserver?.notify('update', newData);
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
                // Convertir el id a número si es necesario
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
            // Buscar IDs faltantes
            const missingIds = this.findMissingIds(allData);
            
            if (missingIds.length > 0) {
                // Si hay IDs faltantes, usar el primer ID disponible
                targetId = missingIds[0];
            } else {
                // Si no hay IDs faltantes, usar el siguiente ID después del máximo
                const maxId = allData.length > 0 ? Math.max(...allData.map(item => item.id)) : -1;
                targetId = maxId + 1;
            }
        } else {
            targetId = data.id;
        }

        const newData = { ...data, id: targetId };
        const saveOrUpdate = data.id || targetId >= 0 ? 'update' : 'save';   
        console.log("saveOrUpdate", saveOrUpdate, data, targetId);
        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.put(newData);
                request.onsuccess = () => {
                    this.idbObserver?.notify(saveOrUpdate, newData);
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
                    this.idbObserver?.notify('delete', id);
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
                    this.idbObserver?.notify('clear', null);
                    resolve();
                };
                request.onerror = () => reject(request.error);
            });
        });
    }

    /**
     * Creates a new IndexedDBManager instance with the specified database configuration
     * @static
     * @param {Object} dbConfig - Database configuration object
     * @param {Object} [idbObserver] - Observer for database events
     * @returns {IndexedDBManager} A new IndexedDBManager instance
     * @throws {Error} If dbConfig is missing or invalid
     */
    static create(dbConfig, idbObserver) {
        return new IndexedDBManager(dbConfig, idbObserver);
    }

    /**
     * Gets all data from a database or creates the database if it doesn't exist
     * @static
     * @param {Object} dbConfig - Database configuration object
     * @param {Array} [indexes=[]] - Array of index configurations
     * @returns {Promise<Array>} Array of all data in the database
     */
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
                    // Crear índices adicionales si se proporcionan
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

/**
 * Gets all data from a database or returns an empty array if the database doesn't exist
 * @param {Object} databaseConfig - Database configuration object with name, version, and store properties
 * @returns {Promise<Array>} Array of all data in the database or empty array if database doesn't exist
 */
async function getAllDataFromDatabase(databaseConfig) {
    if (!databaseConfig || !databaseConfig.name || !databaseConfig.version || !databaseConfig.store) {
        throw new Error('Invalid database configuration. databaseConfig must contain name, version, and store properties.');
    }
    
    return new Promise((resolve) => {
        const request = indexedDB.open(databaseConfig.name, databaseConfig.version);

        request.onupgradeneeded = (event) => {
            // Crear el almacén de objetos si no existe
            const db = event.target.result;
            if (!db.objectStoreNames.contains(databaseConfig.store)) {
                db.createObjectStore(databaseConfig.store, { keyPath: 'id' });
            }
        };

        request.onsuccess = () => {
            const db = request.result;

            // Verificar si el almacén de objetos existe
            if (!db.objectStoreNames.contains(databaseConfig.store)) {
                db.close();
                resolve([]); // Retorna un array vacío si no existe el almacén
                return;
            }

            // Si existe, realizar la transacción para obtener todos los datos
            const transaction = db.transaction([databaseConfig.store], 'readonly');
            const store = transaction.objectStore(databaseConfig.store);

            const getAllRequest = store.getAll();

            getAllRequest.onsuccess = () => {
                resolve(getAllRequest.result);
                db.close();
            };

            getAllRequest.onerror = () => {
                resolve([]); // Retorna un array vacío si ocurre un error al leer
                db.close();
            };
        };

        request.onerror = () => {
            resolve([]); // Retorna un array vacío si no se puede abrir la base de datos
        };
    });
}

/**
 * Observer class for database events
 * @class DBObserver
 */
class DBObserver {
constructor() {
    this.listeners = [];
}

subscribe(callback) {
    this.listeners.push(callback);
}

unsubscribe(callback) {
    this.listeners = this.listeners.filter(listener => listener !== callback);
}

notify(action, data) {
    this.listeners.forEach(listener => listener(action, data));
}
}
export { databases, IndexedDBManager, DBObserver, getAllDataFromDatabase } 
  
  // Usage example
  // const dbManager = IndexedDBManager.create(databases.ActionsDB);
  // dbManager.saveData({ name: 'User 1', points: 100 });
  