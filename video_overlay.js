/**
 * Twitch Overlay Extension
 */

const PANEL_WIDTH = 260;
const PANEL_HEIGHT = 290;
const BTN_SIZE = 48;
const MARGIN = 10;

const elements = {
    widget: document.getElementById('overlay-widget'),
    toggleBtn: document.getElementById('toggle-btn'),
    closeBtn: document.getElementById('close-btn'),
    widgetPanel: document.getElementById('widget-panel'),
    textArea: document.getElementById('text-area'),
    sendBtn: document.getElementById('send-btn'),
    statusText: document.getElementById('status-text'),
    actionBtns: document.querySelectorAll('.action-btn')
};

let isOpen = false;
let isDragging = false;
let hasMoved = false;
let dragOffset = { x: 0, y: 0 };
let dragStartPos = { x: 0, y: 0 };

function init() {
    elements.toggleBtn.addEventListener('click', handleClick);
    elements.closeBtn.addEventListener('click', closePanel);

    elements.toggleBtn.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);

    elements.toggleBtn.addEventListener('touchstart', startDragTouch, { passive: false });
    document.addEventListener('touchmove', dragTouch, { passive: false });
    document.addEventListener('touchend', stopDrag);

    elements.actionBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            handleButtonClick(this.dataset.action);
        });
    });

    elements.sendBtn.addEventListener('click', handleSendText);

    if (typeof Twitch !== 'undefined' && Twitch.ext) {
        Twitch.ext.onAuthorized(function() {
            showStatus('Conectado a Twitch');
        });
    } else {
        showStatus('Modo local');
    }
}

function startDrag(e) {
    isDragging = true;
    hasMoved = false;
    const rect = elements.widget.getBoundingClientRect();
    dragOffset.x = e.clientX - rect.left;
    dragOffset.y = e.clientY - rect.top;
    dragStartPos.x = e.clientX;
    dragStartPos.y = e.clientY;
    elements.widget.style.transition = 'none';
    elements.toggleBtn.classList.add('dragging');
}

function startDragTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    isDragging = true;
    hasMoved = false;
    const rect = elements.widget.getBoundingClientRect();
    dragOffset.x = touch.clientX - rect.left;
    dragOffset.y = touch.clientY - rect.top;
    dragStartPos.x = touch.clientX;
    dragStartPos.y = touch.clientY;
    elements.widget.style.transition = 'none';
    elements.toggleBtn.classList.add('dragging');
}

function drag(e) {
    if (!isDragging) return;
    
    if (Math.abs(e.clientX - dragStartPos.x) > 3 || Math.abs(e.clientY - dragStartPos.y) > 3) {
        hasMoved = true;
    }
    
    if (!hasMoved) return;
    e.preventDefault();
    moveWidget(e.clientX, e.clientY);
}

function dragTouch(e) {
    if (!isDragging) return;
    const touch = e.touches[0];
    
    if (Math.abs(touch.clientX - dragStartPos.x) > 3 || Math.abs(touch.clientY - dragStartPos.y) > 3) {
        hasMoved = true;
    }
    
    if (!hasMoved) return;
    e.preventDefault();
    moveWidget(touch.clientX, touch.clientY);
}

function moveWidget(clientX, clientY) {
    let x = clientX - dragOffset.x;
    let y = clientY - dragOffset.y;
    
    // Mantener dentro de la pantalla
    x = Math.max(MARGIN, Math.min(x, window.innerWidth - BTN_SIZE - MARGIN));
    y = Math.max(MARGIN, Math.min(y, window.innerHeight - BTN_SIZE - MARGIN));
    
    elements.widget.style.left = x + 'px';
    elements.widget.style.top = y + 'px';
    elements.widget.style.right = 'auto';
    elements.widget.style.bottom = 'auto';
}

function stopDrag() {
    elements.widget.style.transition = '';
    elements.toggleBtn.classList.remove('dragging');
    isDragging = false;
}

function handleClick() {
    if (hasMoved) {
        hasMoved = false;
        return;
    }
    togglePanel();
}

function togglePanel() {
    isOpen = !isOpen;
    if (isOpen) {
        positionPanel();
        elements.widgetPanel.classList.add('open');
        elements.toggleBtn.classList.add('hidden');
    } else {
        closePanel();
    }
}

function positionPanel() {
    const rect = elements.widget.getBoundingClientRect();
    const panel = elements.widgetPanel;
    
    // Reset styles
    panel.style.top = '';
    panel.style.bottom = '';
    panel.style.left = '';
    panel.style.right = '';
    
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceLeft = rect.left;
    const spaceRight = window.innerWidth - rect.right;
    
    // Vertical position
    if (spaceAbove >= PANEL_HEIGHT + MARGIN) {
        // Arriba
        panel.style.bottom = (BTN_SIZE + 8) + 'px';
    } else if (spaceBelow >= PANEL_HEIGHT + MARGIN) {
        // Abajo
        panel.style.top = (BTN_SIZE + 8) + 'px';
    } else {
        // Centrar verticalmente si no hay espacio
        const centerY = -PANEL_HEIGHT / 2 + BTN_SIZE / 2;
        panel.style.top = centerY + 'px';
    }
    
    // Horizontal position
    if (spaceRight >= PANEL_WIDTH) {
        // A la derecha del boton
        panel.style.left = '0';
    } else if (spaceLeft >= PANEL_WIDTH) {
        // A la izquierda del boton
        panel.style.right = '0';
    } else {
        // Centrar horizontalmente
        panel.style.left = (-PANEL_WIDTH / 2 + BTN_SIZE / 2) + 'px';
    }
}

function closePanel() {
    isOpen = false;
    elements.widgetPanel.classList.remove('open');
    elements.toggleBtn.classList.remove('hidden');
}

function handleButtonClick(actionId) {
    const btn = document.querySelector(`[data-action="${actionId}"]`);
    btn.style.transform = 'scale(0.9)';
    setTimeout(() => btn.style.transform = '', 100);
    
    showStatus('Boton ' + actionId + ' activado');
}

function handleSendText() {
    const text = elements.textArea.value.trim();
    if (!text) return;
    
    elements.textArea.value = '';
    showStatus('Mensaje enviado');
}

function showStatus(message) {
    elements.statusText.textContent = message;
    
    // Volver al estado normal despues de 2s
    setTimeout(() => {
        if (typeof Twitch !== 'undefined' && Twitch.ext) {
            elements.statusText.textContent = 'Conectado';
        } else {
            elements.statusText.textContent = 'Modo local';
        }
    }, 2000);
}

document.addEventListener('DOMContentLoaded', init);
