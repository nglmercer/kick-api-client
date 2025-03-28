import { databases, IndexedDBManager, globalEmitter, getAllDataFromDatabase } from '../store/indexdb.js';
import { initcommandForm } from './chatform.js';
const commandsDB = databases.commandsDB;
const commandStore = new IndexedDBManager(commandsDB, "dbObserver");
import CommandCardComponent from './commandCardComponent.js';
const hoverStyles = `
    <style>
        .dropdown-item {
            background: #222c3a;
            border-radius: 8px;
            padding: 4px 8px;
            display: flex;
            flex-direction: row;
            align-items: center;
            cursor: pointer;
            height: 48px;
            font-size: 12pt;
            width: 100%;
        }
        .dropdown-item:hover {
            background: #2e3e53;
        }
    </style>
    `;
async function getCommands() {
    const commands = await commandStore.getAllData();
    console.log("commands",commands);
    return commands;
}
function setPopupOptions(popupOptions, popupId = "custom-popup"){
    const popupElement = document.querySelector(popupId);
    popupElement.options = popupOptions;
}
function returnMenuOption(idName, textName, iconName, callback) {
    return  {
    id: idName,
    text: textName,
    icon: iconName,
    callback: () => {
        callback();
    }
    }
}

function openPopup(element, popupId = "custom-popup") {
    const popupElement = document.querySelector(popupId);
    if (!popupElement) return;
    if (typeof element === "string") {
        const buttonElement  = document.querySelector(element);
            popupElement.showAtElement(buttonElement);
    } else {
        const buttonElement = element;
        popupElement.showAtElement(buttonElement);
    }
}
// Datos de ejemplo para los comandos
/* const sampleCommands = [
    {
        name: 'Saludo',
        command_trigger: 'startWith',
        command_value: '!hola',
        description: 'Saluda al usuario en el chat',
        id: 1
    },
    {
        name: 'Información',
        command_trigger: 'startWith',
        command_value: '!info',
        description: 'Muestra información sobre el canal y horarios',
        id: 2
    },
    {
        name: 'Redes Sociales',
        command_trigger: 'startWith',
        command_value: '!redes',
        description: 'Muestra enlaces a todas las redes sociales',
        id: 3   
    },
    {
        name: 'Música',
        command_trigger: 'startWith',
        command_value: '!song',
        description: 'Muestra la canción que está sonando actualmente',
        id: 4
    },
    {
        name: 'Donación',
        command_trigger: 'startWith',
        command_value: '!donate',
        description: 'Muestra enlaces para realizar donaciones',
        id: 5
    }
]; */

// Referencias a elementos del DOM
const commandContainer = document.getElementById('commandContainer');
const addCommandBtn = document.getElementById('addCommand');
const logEntries = document.getElementById('logEntries');

// Función para agregar una entrada al registro de eventos
function logEvent(message, data = null) {
    console.log("logEvent",message,data);
//    return;
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    
    const timestamp = new Date().toLocaleTimeString();
    let logText = `[${timestamp}] ${message}`;
    
    if (data) {
        logText += `: ${JSON.stringify(data, null, 2)}`;
    }
    
    entry.textContent = logText;
    logEntries.prepend(entry);
}

// Función para crear un comando con datos aleatorios
function createCardCommand(commandData) {
    if (!commandData) return;
    // Crear el componente de comando
    const commandCard = new CommandCardComponent();
    commandCard.setData(commandData);
    
    // Agregar event listeners
    commandCard.addEventListener('command-action', (e) => {
        logEvent(`Acción en comando: ${e.detail.action}`, e.detail.data);
        
        // Manejar la acción de eliminar
        if (e.detail.action === 'delete') {
            commandCard.delete();
        }
        
        // Manejar la acción de ejecutar
        if (e.detail.action === 'execute') {
            console.log("Ejecutando comando", e.detail.data);
            // Aquí se podría implementar la lógica para ejecutar el comando
        }
    });
    
    commandCard.addEventListener('command-delete', (e) => {
        logEvent('Comando eliminado', e.detail);
    });
    
    commandCard.addEventListener('command-context-menu', (e) => {
        logEvent('Menú contextual abierto', {
            position: { x: e.detail.x, y: e.detail.y },
            data: e.detail.data
        });
        console.log("e.details",e.detail, e);
        const baseOptions = [
            returnMenuOption("update_command", "Actualizar Comando", "edit", () => updateRandomCommand(e.detail.data)),
            returnMenuOption("clear_commands", "Limpiar Comandos", "delete", () => clearCommands(e.detail.data)),
        ];
        const popupOptions = baseOptions.map(option => ({
            html: `${hoverStyles}
                <div class="dropdown-item">
                    <span class="material-symbols-rounded">${option.icon}</span>
                    <span class="default-font">${option.text}</span>
                </div>
            `,
            callback: (e) => option.callback(e)
        }));
        setPopupOptions(popupOptions, "#commandPopup");
        openPopup(e.detail.target, "#commandPopup");
    });
    
    return commandCard;
}
function updateRandomCommand(data) {
    console.log("updateRandomCommand",data);
    const commandForm = initcommandForm('commandFormContainer');
    commandForm.setFormData(data);
}
function clearCommands(data) {
    console.log("clearCommands",data);
    commandStore.deleteData(data.id);
}
// Event listener para agregar un comando
addCommandBtn.addEventListener('click', () => {
    const commandForm = initcommandForm('commandFormContainer');
});
// Inicializar con algunos comandos de ejemplo
window.addEventListener('DOMContentLoaded', async () => {
    // Agregar algunos comandos iniciales
    const allCommands = await getCommands();
    console.log("allCommands",allCommands);
    allCommands.forEach(command => {
        const commandCard = createCardCommand(command);
        commandContainer.appendChild(commandCard);
    });
    
});
globalEmitter.on('*', (source, action, data) => {
    /// source is dbObserver
    console.log("globalEmitter", source, action, data);
    let Card;
    switch (action) {
        case 'update':
            logEvent('Comando actualizado', data);
            Card = getCardElement(data.id);
            if (Card) Card.setData(data);
            break;
        case 'delete':
            Card = getCardElement(data);
            logEvent('Comando eliminado', data, Card);
            if (Card) Card.delete();
            break;
        case 'clear':
            logEvent('Todos los comandos han sido eliminados');
            break;
        case 'open':
            logEvent('Base de datos abierta', data);
            break;
        case 'save':
            Card = createCardCommand(data);
            commandContainer.appendChild(Card);
            logEvent('Comando guardado', data);
            break;
        default:
        console.log(`${source} emitted ${action} with data:`, data);

    }
});
function getCardElement(number) {
    // Intentar convertir el valor a número si es un string numérico
    const id = typeof number === 'number' ? number : Number(number);

    // Validación: debe ser un número válido y mayor o igual a 0
    if (isNaN(id) || id < 0) return null;

    // Buscar entre todos los componentes <command-card>
    return [...document.querySelectorAll('command-card')]
        .find(card => card.getData()?.id === id) || null;
}
