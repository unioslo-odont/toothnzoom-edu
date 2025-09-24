/**
 * Radiograph Image Viewer - Core Viewer Class
 * Handles the main image viewing functionality, transformations, and state management
 */

import { ImageProcessor } from './image-processor.js';
import { CONFIG } from './controls.js';

/**
 * Main RadiographViewer class
 * @class
 */
export class RadiographViewer {
    /**
     * Create a new RadiographViewer instance
     * @param {string} canvasId - ID of the canvas element
     */
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            throw new Error(`Canvas element with ID '${canvasId}' not found`);
        }
        
        this.ctx = this.canvas.getContext('2d');
        this.originalImage = null;
        this.imageProcessor = new ImageProcessor();
        
        // View state
        this.zoom = 1;
        this.panX = 0;
        this.panY = 0;
        
        // Processing parameters
        this.brightness = 0;
        this.contrast = 0;
        this.edgeEnhancement = 0;
        this.isInverted = false;
        
        // Track unsaved changes
        this.originalState = null;
        
        // Initialize
        this.setupCanvas();
    }
    
    /**
     * Setup canvas initial properties
     * @private
     */
    setupCanvas() {
        this.canvas.style.transformOrigin = '0 0';
        this.canvas.style.cursor = 'grab';
    }
    
    /**
     * Load an image from a File object
     * @param {File} file - Image file to load
     * @returns {Promise<void>}
     */
    loadImage(file) {
        return new Promise((resolve, reject) => {
            if (!file || !file.type.startsWith('image/')) {
                reject(new Error('Invalid image file'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const img = new Image();
                
                img.onload = () => {
                    this.setImage(img);
                    this.updateInfo(file.name, `${img.width} × ${img.height}px`);
                    resolve();
                };
                
                img.onerror = () => reject(new Error('Failed to load image'));
                img.src = e.target.result;
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }
    
    /**
     * Load an image from a URL
     * @param {string} url - Image URL
     * @returns {Promise<void>}
     */
    loadImageFromUrl(url) {
        return new Promise((resolve, reject) => {
            if (!url) {
                reject(new Error('No URL provided'));
                return;
            }
            
            const img = new Image();
            img.crossOrigin = 'anonymous';
            
            img.onload = () => {
                const filename = url.split('/').pop() || 'image';
                this.setImage(img);
                this.updateInfo(filename, `${img.width} × ${img.height}px`);
                resolve();
            };
            
            img.onerror = () => reject(new Error('Failed to load image from URL'));
            img.src = url;
        });
    }
    
    /**
     * Set the current image
     * @private
     * @param {HTMLImageElement} img - Image element
     */
    setImage(img) {
        this.originalImage = img;
        this.saveOriginalState();
        this.resetView();
        this.processImage();
        
        // Update UI
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('infoPanel').style.display = 'block';
    }
    
    /**
     * Reset view to fit image in viewport
     */
    resetView() {
        if (!this.originalImage) return;
        
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Set canvas size to match image
        this.canvas.width = this.originalImage.width;
        this.canvas.height = this.originalImage.height;
        
        // Calculate scale to fit
        const scaleX = containerWidth / this.originalImage.width;
        const scaleY = containerHeight / this.originalImage.height;
        
        // Only scale down if image is larger than container
        if (this.originalImage.width > containerWidth || 
            this.originalImage.height > containerHeight) {
            this.zoom = Math.min(scaleX, scaleY);
        } else {
            this.zoom = 1;
        }
        
        // Center the image
        this.panX = 0;
        this.panY = 0;
        
        this.updateZoomDisplay();
        this.updateCanvasTransform();
    }
    
    /**
     * Process and render the image with current adjustments
     */
    processImage() {
        if (!this.originalImage) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw original image
        this.ctx.drawImage(this.originalImage, 0, 0);
        
        // Get image data
        let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        
        // Apply processing
        imageData = this.imageProcessor.process(imageData, {
            brightness: this.brightness,
            contrast: this.contrast,
            edgeEnhancement: this.edgeEnhancement,
            invert: this.isInverted
        });
        
        // Put processed image back
        this.ctx.putImageData(imageData, 0, 0);
    }
    
    /**
     * Zoom at a specific point
     * @param {number} pointX - X coordinate in canvas space
     * @param {number} pointY - Y coordinate in canvas space
     * @param {number} zoomFactor - Zoom multiplication factor
     */
    zoomAtPoint(pointX, pointY, zoomFactor) {
        const newZoom = this.zoom * zoomFactor;
        
        // Enforce zoom limits
        if (newZoom < CONFIG.MIN_ZOOM || newZoom > CONFIG.MAX_ZOOM) {
            return;
        }
        
        // Calculate zoom origin in image space
        const zoomOriginX = (pointX - this.panX) / this.zoom;
        const zoomOriginY = (pointY - this.panY) / this.zoom;
        
        // Apply new zoom
        this.zoom = newZoom;
        
        // Adjust pan to keep zoom origin fixed
        this.panX = pointX - zoomOriginX * this.zoom;
        this.panY = pointY - zoomOriginY * this.zoom;
        
        this.updateZoomDisplay();
        this.updateCanvasTransform();
    }
    
    /**
     * Pan the image
     * @param {number} deltaX - Horizontal pan distance
     * @param {number} deltaY - Vertical pan distance
     */
    pan(deltaX, deltaY) {
        this.panX += deltaX;
        this.panY += deltaY;
        this.updateCanvasTransform();
    }
    
    /**
     * Set brightness value
     * @param {number} value - Brightness value (-100 to 100)
     */
    setBrightness(value) {
        this.brightness = Math.max(-100, Math.min(100, value));
        this.processImage();
    }
    
    /**
     * Set contrast value
     * @param {number} value - Contrast value (-100 to 100)
     */
    setContrast(value) {
        this.contrast = Math.max(-100, Math.min(100, value));
        this.processImage();
    }
    
    /**
     * Set edge enhancement value
     * @param {number} value - Edge enhancement value (0 to 10)
     */
    setEdgeEnhancement(value) {
        this.edgeEnhancement = Math.max(0, Math.min(10, value));
        this.processImage();
    }
    
    /**
     * Toggle image inversion
     */
    toggleInvert() {
        if (!this.originalImage) return;
        this.isInverted = !this.isInverted;
        this.processImage();
    }
    
    /**
     * Reset all adjustments to default
     */
    resetAdjustments() {
        this.brightness = 0;
        this.contrast = 0;
        this.edgeEnhancement = 0;
        this.isInverted = false;
        
        // Update UI controls
        document.getElementById('brightness').value = 0;
        document.getElementById('contrast').value = 0;
        document.getElementById('edgeEnhancement').value = 0;
        document.getElementById('brightnessValue').textContent = '0';
        document.getElementById('contrastValue').textContent = '0';
        document.getElementById('edgeValue').textContent = '0';
        
        this.processImage();
    }
    
    /**
     * Update canvas transform based on current pan and zoom
     * @private
     */
    updateCanvasTransform() {
        this.canvas.style.transform = 
            `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }
    
    /**
     * Update zoom display in UI
     * @private
     */
    updateZoomDisplay() {
        const percent = Math.round(this.zoom * 100);
        document.getElementById('zoomDisplay').textContent = `${percent}%`;
        document.getElementById('infoZoom').textContent = `${percent}%`;
    }
    
    /**
     * Update image info display
     * @private
     * @param {string} name - Image name
     * @param {string} size - Image dimensions
     */
    updateInfo(name, size) {
        document.getElementById('imageName').textContent = name;
        document.getElementById('imageSize').textContent = size;
    }
    
    /**
     * Save the original state for comparison
     * @private
     */
    saveOriginalState() {
        this.originalState = {
            brightness: this.brightness,
            contrast: this.contrast,
            edgeEnhancement: this.edgeEnhancement,
            isInverted: this.isInverted
        };
    }
    
    /**
     * Check if there are unsaved changes
     * @returns {boolean}
     */
    hasUnsavedChanges() {
        if (!this.originalState) return false;
        
        return this.brightness !== this.originalState.brightness ||
               this.contrast !== this.originalState.contrast ||
               this.edgeEnhancement !== this.originalState.edgeEnhancement ||
               this.isInverted !== this.originalState.isInverted;
    }
    
    /**
     * Check if an image is loaded
     * @returns {boolean}
     */
    hasImage() {
        return this.originalImage !== null;
    }
    
    /**
     * Get current zoom level
     * @returns {number}
     */
    getZoom() {
        return this.zoom;
    }
    
    /**
     * Set zoom level directly
     * @param {number} zoomLevel - New zoom level
     */
    setZoom(zoomLevel) {
        this.zoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, zoomLevel));
        this.updateZoomDisplay();
        this.updateCanvasTransform();
    }
}