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
     * Set the current image and reset the viewer state.
     * @private
     * @param {HTMLImageElement} img - Image element
     */
    setImage(img) {
        this.originalImage = img;

        // FIX: The order of operations is now correct and reliable.
        // 1. Reset the view. This resizes and clears the canvas for the new image.
        this.resetView();
        
        // 2. Reset adjustments. This sets sliders to default AND calls processImage() 
        //    to draw the new, clean image on the canvas.
        this.resetAdjustments(); 

        // 3. Now that everything is reset and drawn, save this clean state.
        this.saveOriginalState();


        // 4. Update the UI panels.
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('infoPanel').style.display = 'block';
        this.updateHistogram();
    }

    /**
     * Reset all settings to default values and update UI controls.
     * This is the function that should be used to reset adjustments.
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
        document.getElementById('invertBtn').classList.remove('active');

        // Redraw the image with the default settings
        this.processImage();
    }
    
    /**
     * Reset view to fit image in viewport. This also resizes and clears the canvas.
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

        if (this.originalImage.width > containerWidth || this.originalImage.height > containerHeight) {
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
     * Process and render the image with current adjustments.
     */
    processImage() {
        if (!this.originalImage) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.originalImage, 0, 0);

        let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

        imageData = this.imageProcessor.process(imageData, {
            brightness: this.brightness,
            contrast: this.contrast,
            edgeEnhancement: this.edgeEnhancement,
            invert: this.isInverted
        });

        this.ctx.putImageData(imageData, 0, 0);
        this.updateHistogram();
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
     * Get current image histogram data
     * @returns {Object|null} Histogram data or null if no image
     */
    getHistogramData() {
        if (!this.originalImage) return null;
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        return this.imageProcessor.calculateHistogram(imageData);
    }
    
    /**
     * Draw histogram in the histogram panel.
     */
    drawHistogram() {
        const canvas = document.getElementById('histogramCanvas');
        if (!canvas || !this.hasImage()) return;

        const ctx = canvas.getContext('2d');
        const histData = this.getHistogramData();
        if (!histData) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const width = canvas.width;
        const height = canvas.height;
        const maxValue = Math.max(...histData.luminance);

        ctx.fillStyle = '#ffffff';

        for (let i = 0; i < 256; i++) {
            const barHeight = (histData.luminance[i] / maxValue) * height;
            const x = (i / 256) * width;
            const barWidth = width / 256;
            ctx.fillRect(x, height - barHeight, barWidth, barHeight);
        }
    }
    
    /**
     * Update histogram display if it's visible.
     * @private
     */
    updateHistogram() {
        const histogramPanel = document.getElementById('histogramPanel');
        if (histogramPanel && histogramPanel.style.display !== 'none') {
            this.drawHistogram();
        }
    }
    
    // Unchanged methods below...
    zoomAtPoint(pointX, pointY, zoomFactor) {
        const newZoom = this.zoom * zoomFactor;
        if (newZoom < CONFIG.MIN_ZOOM || newZoom > CONFIG.MAX_ZOOM) return;
        const zoomOriginX = (pointX - this.panX) / this.zoom;
        const zoomOriginY = (pointY - this.panY) / this.zoom;
        this.zoom = newZoom;
        this.panX = pointX - zoomOriginX * this.zoom;
        this.panY = pointY - zoomOriginY * this.zoom;
        this.updateZoomDisplay();
        this.updateCanvasTransform();
    }

    pan(deltaX, deltaY) {
        this.panX += deltaX;
        this.panY += deltaY;
        this.updateCanvasTransform();
    }

    updateCanvasTransform() {
        this.canvas.style.transform = `translate(${this.panX}px, ${this.panY}px) scale(${this.zoom})`;
    }

    updateZoomDisplay() {
        const percent = Math.round(this.zoom * 100);
        document.getElementById('zoomDisplay').textContent = `${percent}%`;
        document.getElementById('infoZoom').textContent = `${percent}%`;
    }

    updateInfo(name, size) {
        document.getElementById('imageName').textContent = name;
        document.getElementById('imageSize').textContent = size;
    }

    saveOriginalState() {
        this.originalState = {
            brightness: 0,
            contrast: 0,
            edgeEnhancement: 0,
            isInverted: false
        };
    }

    hasUnsavedChanges() {
        if (!this.originalState) return false;
        return this.brightness !== this.originalState.brightness ||
               this.contrast !== this.originalState.contrast ||
               this.edgeEnhancement !== this.originalState.edgeEnhancement ||
               this.isInverted !== this.originalState.isInverted;
    }

    hasImage() {
        return this.originalImage !== null;
    }
}