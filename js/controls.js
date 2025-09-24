/**
 * Radiograph Image Viewer - Controls Module
 * Handles all user input including mouse, touch, and UI controls
 */

import languageManager from './language-manager.js';

/**
 * Configuration constants for controls
 */
export const CONFIG = {
    ZOOM_WHEEL_FACTOR: 1.1,
    ZOOM_BUTTON_FACTOR: 1.2,
    BRIGHTNESS_SENSITIVITY: 0.5,
    CONTRAST_SENSITIVITY: 0.5,
    TOUCH_ZOOM_SENSITIVITY: 0.01,
    MAX_ZOOM: 10,
    MIN_ZOOM: 0.1,
    HINT_DURATION: 1500
};

/**
 * Setup all control event handlers
 * @param {RadiographViewer} viewer - Viewer instance
 */
export function setupControls(viewer) {
    setupFileControls(viewer);
    setupAdjustmentControls(viewer);
    setupMouseControls(viewer);
    setupTouchControls(viewer);
    setupZoomControls(viewer);
    setupDragDropControls(viewer);
}

/**
 * Setup file loading controls
 * @private
 */
function setupFileControls(viewer) {
    // File input
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                await viewer.loadImage(e.target.files[0]);
            } catch (error) {
                languageManager.showMessage('messages.loadFailed');
            }
        }
    });
    
    // Open file button
    document.getElementById('openFileBtn').addEventListener('click', () => {
        fileInput.click();
    });
}

/**
 * Setup image adjustment controls
 * @private
 */
function setupAdjustmentControls(viewer) {
    // Brightness slider
    const brightnessSlider = document.getElementById('brightness');
    brightnessSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        viewer.setBrightness(value);
        document.getElementById('brightnessValue').textContent = value;
    });
    
    // Contrast slider
    const contrastSlider = document.getElementById('contrast');
    contrastSlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value, 10);
        viewer.setContrast(value);
        document.getElementById('contrastValue').textContent = value;
    });
    
    // Edge enhancement slider
    const edgeSlider = document.getElementById('edgeEnhancement');
    edgeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        viewer.setEdgeEnhancement(value);
        document.getElementById('edgeValue').textContent = value.toFixed(1);
    });
    
    // Invert button
    document.getElementById('invertBtn').addEventListener('click', () => {
        viewer.toggleInvert();
        document.getElementById('invertBtn').classList.toggle('active');
    });
    
    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        viewer.resetAdjustments();
        document.getElementById('invertBtn').classList.remove('active');
    });
}

/**
 * Mouse control handler class
 * @private
 */
class MouseHandler {
    constructor(viewer, canvas) {
        this.viewer = viewer;
        this.canvas = canvas;
        this.isDragging = false;
        this.dragMode = 'pan';
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        this.hintTimeout = null;
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());
        this.canvas.addEventListener('wheel', (e) => this.onWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    onMouseDown(e) {
        e.preventDefault();
        this.isDragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
        
        if (e.button === 1) { // Middle button
            this.dragMode = 'adjust';
            this.canvas.classList.add('adjusting');
            languageManager.showHint('hints.brightness');
        } else if (e.button === 0 && e.ctrlKey) { // Left + Ctrl
            this.dragMode = 'zoom';
            this.canvas.classList.add('zooming');
            languageManager.showHint('hints.zoom');
        } else if (e.button === 0) { // Left button
            this.dragMode = 'pan';
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    onMouseMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        
        const deltaX = e.clientX - this.lastMouseX;
        const deltaY = e.clientY - this.lastMouseY;
        
        switch (this.dragMode) {
            case 'pan':
                this.viewer.pan(deltaX, deltaY);
                break;
                
            case 'adjust':
                const newBrightness = this.viewer.brightness + deltaX * CONFIG.BRIGHTNESS_SENSITIVITY;
                const newContrast = this.viewer.contrast - deltaY * CONFIG.CONTRAST_SENSITIVITY;
                
                this.viewer.setBrightness(newBrightness);
                this.viewer.setContrast(newContrast);
                
                // Update UI
                document.getElementById('brightness').value = Math.round(this.viewer.brightness);
                document.getElementById('contrast').value = Math.round(this.viewer.contrast);
                document.getElementById('brightnessValue').textContent = Math.round(this.viewer.brightness);
                document.getElementById('contrastValue').textContent = Math.round(this.viewer.contrast);
                break;
                
            case 'zoom':
                const zoomFactor = 1 - deltaY * 0.01;
                const rect = this.canvas.getBoundingClientRect();
                this.viewer.zoomAtPoint(rect.width / 2, rect.height / 2, zoomFactor);
                break;
        }
        
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
    }
    
    onMouseUp() {
        this.isDragging = false;
        this.dragMode = 'pan';
        this.canvas.style.cursor = 'grab';
        this.canvas.classList.remove('adjusting', 'zooming');
    }
    
    onWheel(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const zoomFactor = e.deltaY > 0 ? 1 / CONFIG.ZOOM_WHEEL_FACTOR : CONFIG.ZOOM_WHEEL_FACTOR;
        this.viewer.zoomAtPoint(mouseX, mouseY, zoomFactor);
    }
    
    showHint(message) {
        const hint = document.getElementById('mouseHint');
        hint.textContent = message;
        hint.classList.add('visible');
        
        clearTimeout(this.hintTimeout);
        this.hintTimeout = setTimeout(() => {
            hint.classList.remove('visible');
        }, CONFIG.HINT_DURATION);
    }
}

/**
 * Touch control handler class
 * @private
 */
class TouchHandler {
    constructor(viewer, canvas) {
        this.viewer = viewer;
        this.canvas = canvas;
        this.touches = new Map();
        this.initialPinchDistance = 0;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        
        this.bindEvents();
    }
    
    bindEvents() {
        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        this.canvas.addEventListener('touchcancel', (e) => this.onTouchEnd(e));
    }
    
    onTouchStart(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Single touch - prepare for pan
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Two touches - prepare for pinch or adjust
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            this.initialPinchDistance = Math.sqrt(dx * dx + dy * dy);
            this.lastTouchX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            this.lastTouchY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
        }
    }
    
    onTouchMove(e) {
        e.preventDefault();
        
        if (e.touches.length === 1) {
            // Single touch - pan
            const deltaX = e.touches[0].clientX - this.lastTouchX;
            const deltaY = e.touches[0].clientY - this.lastTouchY;
            
            this.viewer.pan(deltaX, deltaY);
            
            this.lastTouchX = e.touches[0].clientX;
            this.lastTouchY = e.touches[0].clientY;
        } else if (e.touches.length === 2) {
            // Two touches - pinch zoom or adjust
            const currentMidX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
            const currentMidY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            const currentDistance = Math.sqrt(dx * dx + dy * dy);
            
            // Determine gesture type
            const pinchDelta = Math.abs(currentDistance - this.initialPinchDistance);
            const moveDelta = Math.sqrt(
                Math.pow(currentMidX - this.lastTouchX, 2) + 
                Math.pow(currentMidY - this.lastTouchY, 2)
            );
            
            if (pinchDelta > moveDelta && pinchDelta > 5) {
                // Pinch zoom
                const zoomFactor = currentDistance / this.initialPinchDistance;
                const rect = this.canvas.getBoundingClientRect();
                const zoomPointX = currentMidX - rect.left;
                const zoomPointY = currentMidY - rect.top;
                
                this.viewer.zoomAtPoint(zoomPointX, zoomPointY, zoomFactor);
                this.initialPinchDistance = currentDistance;
            } else if (moveDelta > 2) {
                // Two-finger drag for brightness/contrast
                const deltaX = currentMidX - this.lastTouchX;
                const deltaY = currentMidY - this.lastTouchY;
                
                const newBrightness = this.viewer.brightness + deltaX;
                const newContrast = this.viewer.contrast - deltaY;
                
                this.viewer.setBrightness(newBrightness);
                this.viewer.setContrast(newContrast);
                
                // Update UI
                document.getElementById('brightness').value = Math.round(this.viewer.brightness);
                document.getElementById('contrast').value = Math.round(this.viewer.contrast);
                document.getElementById('brightnessValue').textContent = Math.round(this.viewer.brightness);
                document.getElementById('contrastValue').textContent = Math.round(this.viewer.contrast);
                
                languageManager.showHint('hints.brightness');
            }
            
            this.lastTouchX = currentMidX;
            this.lastTouchY = currentMidY;
        }
    }
    
    onTouchEnd(e) {
        if (e.touches.length === 0) {
            this.initialPinchDistance = 0;
        }
    }
    
    showHint(message) {
        const hint = document.getElementById('mouseHint');
        hint.textContent = message;
        hint.classList.add('visible');
        
        setTimeout(() => {
            hint.classList.remove('visible');
        }, CONFIG.HINT_DURATION);
    }
}

/**
 * Setup mouse controls
 * @private
 */
function setupMouseControls(viewer) {
    const canvas = viewer.canvas;
    new MouseHandler(viewer, canvas);
}

/**
 * Setup touch controls
 * @private
 */
function setupTouchControls(viewer) {
    const canvas = viewer.canvas;
    new TouchHandler(viewer, canvas);
}

/**
 * Setup zoom button controls
 * @private
 */
function setupZoomControls(viewer) {
    document.getElementById('zoomInBtn').addEventListener('click', () => {
        if (viewer.hasImage()) {
            const rect = viewer.canvas.getBoundingClientRect();
            viewer.zoomAtPoint(rect.width / 2, rect.height / 2, CONFIG.ZOOM_BUTTON_FACTOR);
        }
    });
    
    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        if (viewer.hasImage()) {
            const rect = viewer.canvas.getBoundingClientRect();
            viewer.zoomAtPoint(rect.width / 2, rect.height / 2, 1 / CONFIG.ZOOM_BUTTON_FACTOR);
        }
    });
    
    document.getElementById('resetZoomBtn').addEventListener('click', () => {
        if (viewer.hasImage()) {
            viewer.resetView();
        }
    });
}

/**
 * Setup drag and drop controls
 * @private
 */
function setupDragDropControls(viewer) {
    const dropZone = document.getElementById('dropZone');
    const viewerContainer = document.querySelector('.viewer-container');
    
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        viewerContainer.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
    });
    
    ['dragenter', 'dragover'].forEach(eventName => {
        viewerContainer.addEventListener(eventName, () => {
            dropZone.classList.add('active');
        });
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        viewerContainer.addEventListener(eventName, () => {
            dropZone.classList.remove('active');
        });
    });
    
    viewerContainer.addEventListener('drop', async (e) => {
        const files = Array.from(e.dataTransfer.files).filter(file => 
            file.type.startsWith('image/'));
        
        if (files.length > 0) {
            try {
                await viewer.loadImage(files[0]);
            } catch (error) {
                alert(`Failed to load image: ${error.message}`);
            }
        }
    });
}