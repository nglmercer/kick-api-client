class EventEmitter {
    constructor() {
        this.events = new Map();
    }

    /**
     * Registra un listener para un evento específico.
     * @param {string} eventName - Nombre del evento.
     * @param {Function} listener - Función callback a ejecutar cuando se emita el evento.
     */
    on(eventName, listener) {
        if (!this.events.has(eventName)) {
            this.events.set(eventName, []);
        }
        this.events.get(eventName).push(listener);
    }

    /**
     * Registra un listener que se ejecutará una sola vez y luego se eliminará.
     * @param {string} eventName - Nombre del evento.
     * @param {Function} listener - Función callback a ejecutar cuando se emita el evento.
     */
    once(eventName, listener) {
        const wrappedListener = (...args) => {
            this.off(eventName, wrappedListener);
            listener(...args);
        };
        this.on(eventName, wrappedListener);
    }

    /**
     * Elimina un listener específico para un evento.
     * @param {string} eventName - Nombre del evento.
     * @param {Function} listener - Función callback a eliminar.
     */
    off(eventName, listener) {
        if (!this.events.has(eventName)) return;
        const listeners = this.events.get(eventName);
        const filteredListeners = listeners.filter(l => l !== listener);
        if (filteredListeners.length > 0) {
            this.events.set(eventName, filteredListeners);
        } else {
            this.events.delete(eventName);
        }
    }

    /**
     * Emite un evento, ejecutando todos los listeners registrados para ese evento.
     * @param {string} eventName - Nombre del evento.
     * @param {...any} args - Argumentos para pasar a los listeners.
     */
    emit(eventName, ...args) {
        if (!this.events.has(eventName)) return;
        const listeners = this.events.get(eventName).slice();
        for (const listener of listeners) {
            try {
                listener(...args);
            } catch (error) {
                console.error(`Error in listener for event ${eventName}:`, error);
            }
        }
    }
}

// Crear un emisor de eventos global
const globalEmitter = new EventEmitter();

// Definir las configuraciones de las bases de datos
const databases = {
    ActionsDB: { name: 'Actions', version: 1, store: 'actions' },
    eventsDB: { name: 'Events', version: 1, store: 'events' },
    commandsDB: { name: 'Commands', version: 1, store: 'commands' },
    giftsDB: { name: 'Gifts', version: 1, store: 'gifts' },
};

/**
 * Class for managing IndexedDB operations
 * @class IndexedDBManager
 */
class IndexedDBManager {
    /**
     * Creates an instance of IndexedDBManager.
     * @param {Object} dbConfig - Configuration for the database with properties: name, version, and store
     * @throws {Error} If dbConfig is missing or invalid
     */
    constructor(dbConfig) {
        if (!dbConfig) {
            throw new Error('Database configuration is required. Please provide a valid dbConfig object.');
        }
        
        if (!dbConfig.name || !dbConfig.version || !dbConfig.store) {
            throw new Error('Invalid database configuration. dbConfig must contain name, version, and store properties.');
        }
        
        this.dbConfig = dbConfig;
        this.db = null;
        // Prefijo para los eventos basado en el nombre de la base de datos
        this.eventPrefix = `${dbConfig.name}:`;
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
                            globalEmitter.emit(`${this.eventPrefix}update`, newData);
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
        const saveOrUpdate = data.id || targetId >= 0 ? 'update' : 'save';   
        return this.executeTransaction(this.dbConfig.store, 'readwrite', (store) => {
            return new Promise((resolve, reject) => {
                const request = store.put(newData);
                request.onsuccess = () => {
                    globalEmitter.emit(`${this.eventPrefix}${saveOrUpdate}`, newData);
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
                    globalEmitter.emit(`${this.eventPrefix}delete`, id);
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
                    globalEmitter.emit(`${this.eventPrefix}clear`, null);
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
     * @returns {IndexedDBManager} A new IndexedDBManager instance
     * @throws {Error} If dbConfig is missing or invalid
     */
    static create(dbConfig) {
        return new IndexedDBManager(dbConfig);
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

// Exportar las clases y funciones
export { databases, IndexedDBManager, globalEmitter, getAllDataFromDatabase };