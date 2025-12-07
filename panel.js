/**
 * Twitch Extension Panel - JavaScript
 */

// Estado de la extensión
const state = {
    isAuthorized: false,
    userId: null,
    channelId: null,
    config: {
        buttons: [
            { id: 1, label: 'Botón 1', icon: '🗣️' },
            { id: 2, label: 'Botón 2', icon: '🗣️' },
            { id: 3, label: 'Botón 3', icon: '🗣️' },
            { id: 4, label: 'Botón 4', icon: '🗣️' },
            { id: 5, label: 'Botón 5', icon: '🗣️' },
            { id: 6, label: 'Botón 6', icon: '🗣️' }
        ],
        defaultText: ''
    }
};

// Elementos del DOM
const elements = {
    buttons: document.querySelectorAll('.action-btn'),
    textArea: document.getElementById('text-area'),
    sendBtn: document.getElementById('send-btn'),
    statusBar: document.getElementById('status-bar'),
    statusText: document.querySelector('.status-text')
};

/**
 * Inicializar la extensión
 */
function init() {
    // Verificar si Twitch está disponible
    if (typeof Twitch !== 'undefined' && Twitch.ext) {
        initTwitchExtension();
    } else {
        console.log('Modo desarrollo: Twitch Extension Helper no disponible');
        updateStatus('Modo local', false);
    }

    // Configurar event listeners
    setupEventListeners();
    
    // Cargar configuración guardada
    loadConfiguration();
}

/**
 * Inicializar Twitch Extension Helper
 */
function initTwitchExtension() {
    // Cuando la extensión está autorizada
    Twitch.ext.onAuthorized(function(auth) {
        state.isAuthorized = true;
        state.userId = auth.userId;
        state.channelId = auth.channelId;
        
        console.log('Extensión autorizada:', {
            userId: auth.userId,
            channelId: auth.channelId
        });
        
        updateStatus('Conectado', false);
    });

    // Escuchar cambios de configuración
    Twitch.ext.configuration.onChanged(function() {
        loadConfiguration();
    });

    // Manejar errores
    Twitch.ext.onError(function(err) {
        console.error('Error de Twitch:', err);
        updateStatus('Error de conexión', true);
    });
}

/**
 * Configurar event listeners para botones y texto
 */
function setupEventListeners() {
    // Event listeners para los 6 botones
    elements.buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const action = this.dataset.action;
            handleButtonClick(action, this);
        });
    });

    // Event listener para enviar texto
    elements.sendBtn.addEventListener('click', handleSendText);

    // Enviar con Enter (Ctrl+Enter para nueva línea)
    elements.textArea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendText();
        }
    });
}

/**
 * Manejar click en botón
 */
function handleButtonClick(actionId, buttonElement) {
    console.log(`Botón ${actionId} presionado`);
    
    // Añadir efecto visual de click
    buttonElement.classList.add('clicked');
    setTimeout(() => buttonElement.classList.remove('clicked'), 600);
    
    // Obtener información del botón
    const buttonConfig = state.config.buttons.find(b => b.id == actionId);
    const label = buttonConfig ? buttonConfig.label : `Botón ${actionId}`;
    
    // Mostrar feedback en el área de texto
    showFeedback(`¡${label} activado!`);
    
    // Aquí puedes añadir lógica personalizada para cada botón
    switch(parseInt(actionId)) {
        case 1:
            // Acción del botón 1
            console.log('Acción botón 1');
            break;
        case 2:
            // Acción del botón 2
            console.log('Acción botón 2');
            break;
        case 3:
            // Acción del botón 3
            console.log('Acción botón 3');
            break;
        case 4:
            // Acción del botón 4
            console.log('Acción botón 4');
            break;
        case 5:
            // Acción del botón 5
            console.log('Acción botón 5');
            break;
        case 6:
            // Acción del botón 6
            console.log('Acción botón 6');
            break;
    }
    
    // Si hay conexión con Twitch, enviar evento
    if (state.isAuthorized && typeof Twitch !== 'undefined') {
        // Ejemplo: Enviar a través de PubSub (requiere backend)
        // Twitch.ext.send('broadcast', 'application/json', { action: actionId });
    }
}

/**
 * Manejar envío de texto
 */
function handleSendText() {
    const text = elements.textArea.value.trim();
    
    if (!text) {
        showFeedback('Escribe un mensaje primero');
        elements.textArea.focus();
        return;
    }
    
    console.log('Texto enviado:', text);
    
    // Aquí puedes añadir lógica para enviar el texto
    // Por ejemplo: enviar al chat, guardar, etc.
    
    showFeedback('¡Mensaje enviado!');
    
    // Limpiar el área de texto
    elements.textArea.value = '';
    
    // Si hay conexión con Twitch
    if (state.isAuthorized && typeof Twitch !== 'undefined') {
        // Ejemplo: Enviar mensaje
        // Twitch.ext.send('broadcast', 'application/json', { type: 'text', content: text });
    }
}

/**
 * Mostrar feedback temporal
 */
function showFeedback(message) {
    const originalText = elements.statusText.textContent;
    elements.statusText.textContent = message;
    
    setTimeout(() => {
        elements.statusText.textContent = originalText;
    }, 2000);
}

/**
 * Actualizar estado de conexión
 */
function updateStatus(text, isError) {
    elements.statusText.textContent = text;
    
    if (isError) {
        elements.statusBar.classList.add('error');
    } else {
        elements.statusBar.classList.remove('error');
    }
}

/**
 * Cargar configuración
 */
function loadConfiguration() {
    if (typeof Twitch !== 'undefined' && Twitch.ext && Twitch.ext.configuration.broadcaster) {
        try {
            const config = JSON.parse(Twitch.ext.configuration.broadcaster.content);
            
            if (config.buttons) {
                state.config.buttons = config.buttons;
                updateButtonLabels();
            }
            
            if (config.defaultText) {
                state.config.defaultText = config.defaultText;
                elements.textArea.placeholder = config.defaultText;
            }
            
            console.log('Configuración cargada:', config);
        } catch (e) {
            console.log('No hay configuración guardada o es inválida');
        }
    }
}

/**
 * Actualizar etiquetas de los botones desde la configuración
 */
function updateButtonLabels() {
    state.config.buttons.forEach(buttonConfig => {
        const button = document.getElementById(`btn-${buttonConfig.id}`);
        if (button) {
            const labelSpan = button.querySelector('.btn-label');
            const iconSpan = button.querySelector('.btn-icon');
            
            if (labelSpan && buttonConfig.label) {
                labelSpan.textContent = buttonConfig.label;
            }
            if (iconSpan && buttonConfig.icon) {
                iconSpan.textContent = buttonConfig.icon;
            }
        }
    });
}

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
