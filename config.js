/**
 * Configuración de la Extensión - JavaScript
 */

const defaultConfig = {
    buttons: [
        { id: 1, label: 'Botón 1', icon: '🗣️' },
        { id: 2, label: 'Botón 2', icon: '🗣️' },
        { id: 3, label: 'Botón 3', icon: '🗣️' },
        { id: 4, label: 'Botón 4', icon: '🗣️' },
        { id: 5, label: 'Botón 5', icon: '🗣️' },
        { id: 6, label: 'Botón 6', icon: '🗣️' }
    ],
    defaultText: 'Escribe tu mensaje aquí...'
};

// Estado
let twitch = null;
let isReady = false;

/**
 * Inicializar
 */
function init() {
    // Verificar Twitch Extension Helper
    if (typeof Twitch !== 'undefined' && Twitch.ext) {
        twitch = Twitch.ext;
        
        twitch.onAuthorized(function(auth) {
            isReady = true;
            loadSavedConfig();
            console.log('Configuracion autorizada');
        });

        twitch.onError(function(err) {
            showStatus('Error de conexion', 'error');
            console.error('Error:', err);
        });
    } else {
        console.log('Modo desarrollo local');
        isReady = true;
    }

    // Event listeners
    document.getElementById('save-config').addEventListener('click', saveConfig);
    document.getElementById('reset-config').addEventListener('click', resetConfig);
}

/**
 * Cargar configuración guardada
 */
function loadSavedConfig() {
    if (twitch && twitch.configuration && twitch.configuration.broadcaster) {
        try {
            const config = JSON.parse(twitch.configuration.broadcaster.content);
            applyConfig(config);
            console.log('Configuracion cargada:', config);
        } catch (e) {
            console.log('Sin configuracion previa');
        }
    }
}

/**
 * Aplicar configuración a los inputs
 */
function applyConfig(config) {
    if (config.buttons) {
        config.buttons.forEach(btn => {
            const iconInput = document.getElementById(`icon-${btn.id}`);
            const labelInput = document.getElementById(`label-${btn.id}`);
            
            if (iconInput && btn.icon) iconInput.value = btn.icon;
            if (labelInput && btn.label) labelInput.value = btn.label;
        });
    }
    
    if (config.defaultText) {
        document.getElementById('default-text').value = config.defaultText;
    }
}

/**
 * Guardar configuración
 */
function saveConfig() {
    const config = {
        buttons: [],
        defaultText: document.getElementById('default-text').value
    };

    // Recoger datos de los botones
    for (let i = 1; i <= 6; i++) {
        config.buttons.push({
            id: i,
            icon: document.getElementById(`icon-${i}`).value || defaultConfig.buttons[i-1].icon,
            label: document.getElementById(`label-${i}`).value || `Botón ${i}`
        });
    }

    console.log('Guardando configuracion:', config);

    // Guardar en Twitch
    if (twitch && isReady) {
        twitch.configuration.set('broadcaster', '1', JSON.stringify(config));
        showStatus('Configuracion guardada', 'success');
    } else {
        // Modo local - guardar en localStorage
        localStorage.setItem('twitch-ext-config', JSON.stringify(config));
        showStatus('Guardado localmente', 'success');
    }
}

/**
 * Restablecer configuración
 */
function resetConfig() {
    applyConfig(defaultConfig);
    showStatus('Configuracion restablecida', 'success');
}

/**
 * Mostrar mensaje de estado
 */
function showStatus(message, type) {
    const statusEl = document.querySelector('.status-message');
    statusEl.textContent = message;
    statusEl.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusEl.textContent = '';
        statusEl.className = 'status-message';
    }, 3000);
}

// Iniciar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
