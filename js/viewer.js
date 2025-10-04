/**
 * Radiograph Image Viewer - Core Viewer Class
 * FIXED: GPU acceleration for Edge compatibility, performance optimizations
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

        this.ctx = this.canvas.getContext('2d', { 
            alpha: false,
            willReadFrequently: true 
        });
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

        // Performance optimization flags
        this.needsRedraw = false;
        this.isProcessing = false;
        this.processingQueued = false;

        // Debounced functions
        this.processImageDebounced = this.debounce(() => {
            this.processImage();
        }, 16); // ~60fps

        // Initialize
        this.setupCanvas();
    }

    /**
     * Debounce utility
     * @private
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
     * Show loading spinner
     * @private
     */
    showLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.add('active');
    }

    /**
     * Hide loading spinner
     * @private
     */
    hideLoading() {
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) spinner.classList.remove('active');
    }

    /**
     * Announce to screen readers
     * @private
     */
    announceToScreenReader(message) {
        const liveRegion = document.getElementById('liveRegion');
        if (liveRegion) {
            liveRegion.textContent = message;
        }
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

            this.showLoading();

            const reader = new FileReader();

            reader.onload = (e) => {
                const img = new Image();

                img.onload = () => {
                    this.setImage(img);
                    this.updateInfo(file.name, `${img.width} x ${img.height}px`);
                    this.announceToScreenReader(`Image loaded: ${file.name}, ${img.width} by ${img.height} pixels`);
                    this.hideLoading();
                    resolve();
                };

                img.onerror = () => {
                    this.hideLoading();
                    reject(new Error('Failed to load image'));
                };
                img.src = e.target.result;
            };

            reader.onerror = () => {
                this.hideLoading();
                reject(new Error('Failed to read file'));
            };
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

            this.showLoading();

            const img = new Image();
            img.crossOrigin = 'anonymous';

            img.onload = () => {
                const filename = url.split('/').pop() || 'image';
                this.setImage(img);
                this.updateInfo(filename, `${img.width} x ${img.height}px`);
                this.announceToScreenReader(`Image loaded: ${filename}, ${img.width} by ${img.height} pixels`);
                this.hideLoading();
                resolve();
            };

            img.onerror = () => {
                this.hideLoading();
                reject(new Error('Failed to load image from URL'));
            };
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

        // Reset all settings to defaults first
        this.brightness = 0;
        this.contrast = 0;
        this.edgeEnhancement = 0;
        this.isInverted = false;

        // Update UI controls to reflect defaults
        this.updateUIControls();

        // Set up the view and draw the image
        this.resetView();

        // Save the clean state
        this.saveOriginalState();

        // Update UI panels
        document.getElementById('instructions').style.display = 'none';
        document.getElementById('infoPanel').style.display = 'block';
        
        // Update histogram if visible
        this.updateHistogram();
    }

    /**
     * Update UI controls to match current state
     * @private
     */
    updateUIControls() {
        document.getElementById('brightness').value = this.brightness;
        document.getElementById('contrast').value = this.contrast;
        document.getElementById('edgeEnhancement').value = this.edgeEnhancement;
        document.getElementById('brightnessValue').textContent = Math.round(this.brightness);
        document.getElementById('contrastValue').textContent = Math.round(this.contrast);
        document.getElementById('edgeValue').textContent = this.edgeEnhancement.toFixed(1);
        
        const invertBtn = document.getElementById('invertBtn');
        if (this.isInverted) {
            invertBtn.classList.add('active');
            invertBtn.setAttribute('aria-pressed', 'true');
        } else {
            invertBtn.classList.remove('active');
            invertBtn.setAttribute('aria-pressed', 'false');
        }
    }

    /**
     * Reset all settings to default values and update UI controls.
     */
    resetAdjustments() {
        this.brightness = 0;
        this.contrast = 0;
        this.edgeEnhancement = 0;
        this.isInverted = false;

        // Update UI controls
        this.updateUIControls();

        // Redraw the image with default settings
        this.processImage();
        
        this.announceToScreenReader('All adjustments reset to default');
    }
    
    /**
     * Complete reset - both view and adjustments
     */
    resetAll() {
        this.resetView();
        this.resetAdjustments();
    }
    
    /**
     * Reset view to fit image in viewport and draw the image
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
        
        // Draw the image after setting up the view
        this.processImage();
        
        this.announceToScreenReader(`View reset, zoom at ${Math.round(this.zoom * 100)}%`);
    }
    
    /**
     * Process and render the image with current adjustments.
     * OPTIMIZED: Prevents unnecessary redraws
     */
    processImage() {
        if (!this.originalImage) return;

        // Prevent concurrent processing
        if (this.isProcessing) {
            this.processingQueued = true;
            return;
        }

        this.isProcessing = true;

        // Use requestAnimationFrame for smoother rendering
        requestAnimationFrame(() => {
            try {
                // Clear and draw original image
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.drawImage(this.originalImage, 0, 0);

                // Only apply processing if there are actual adjustments
                const hasAdjustments = this.brightness !== 0 || 
                                      this.contrast !== 0 || 
                                      this.edgeEnhancement !== 0 || 
                                      this.isInverted;

                if (hasAdjustments) {
                    let imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);

                    imageData = this.imageProcessor.process(imageData, {
                        brightness: this.brightness,
                        contrast: this.contrast,
                        edgeEnhancement: this.edgeEnhancement,
                        invert: this.isInverted
                    });

                    this.ctx.putImageData(imageData, 0, 0);
                }
                
                this.updateHistogram();
            } finally {
                this.isProcessing = false;

                // Process queued request if any
                if (this.processingQueued) {
                    this.processingQueued = false;
                    this.processImage();
                }
            }
        });
    }
    
    /**
     * Set brightness value
     * @param {number} value - Brightness value (-100 to 100)
     */
    setBrightness(value) {
        this.brightness = Math.max(-100, Math.min(100, value));
        this.processImageDebounced();
    }

    /**
     * Set contrast value
     * @param {number} value - Contrast value (-100 to 100)
     */
    setContrast(value) {
        this.contrast = Math.max(-100, Math.min(100, value));
        this.processImageDebounced();
    }

    /**
     * Set edge enhancement value
     * @param {number} value - Edge enhancement value (0 to 10)
     */
    setEdgeEnhancement(value) {
        this.edgeEnhancement = Math.max(0, Math.min(10, value));
        this.processImageDebounced();
    }

    /**
     * Toggle image inversion
     */
    toggleInvert() {
        if (!this.originalImage) return;
        this.isInverted = !this.isInverted;
        
        const invertBtn = document.getElementById('invertBtn');
        invertBtn.setAttribute('aria-pressed', this.isInverted ? 'true' : 'false');
        
        this.processImage();
        this.announceToScreenReader(this.isInverted ? 'Image inverted' : 'Image normal');
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
     * Draw histogram in the histogram panel with transfer curve overlay.
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

        if (maxValue === 0) return;

        // Draw histogram bars
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 256; i++) {
            const barHeight = (histData.luminance[i] / maxValue) * height * 0.8;
            const x = (i / 255) * width;
            ctx.fillRect(x, height - barHeight, width / 256, barHeight);
        }

        // Draw grid lines
        ctx.strokeStyle = '#444444';
        ctx.lineWidth = 0.5;
        
        for (let i = 0; i <= 4; i++) {
            const x = (i / 4) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // Draw transfer curve
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const brightness = this.brightness;
        const contrast = this.contrast;
        const isInverted = this.isInverted;

        for (let input = 0; input <= 255; input++) {
            let output = input;

            if (contrast > 50) {
                const threshold = 128 - ((contrast - 50) * 2.36);
                const smoothing = Math.max(1, 100 - contrast);
                const adjustedValue = input + brightness;
                
                if (contrast >= 95) {
                    output = adjustedValue > threshold ? 255 : 0;
                } else {
                    const k = smoothing / 10;
                    const sigmoidInput = (adjustedValue - threshold) / k;
                    output = 255 / (1 + Math.exp(-sigmoidInput));
                }
            } else {
                const contrastFactor = contrast <= 0 
                    ? (contrast + 100) / 100
                    : 1 + (contrast / 50) * 3;
                output = ((input - 128) * contrastFactor) + 128 + brightness;
            }

            output = Math.max(0, Math.min(255, output));

            // Apply inversion to the curve if inverted
            if (isInverted) {
                output = 255 - output;
            }

            const x = (input / 255) * width;
            const y = height - (output / 255) * height;

            if (input === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();

        // Draw diagonal reference line
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, 0);
        ctx.stroke();
        ctx.setLineDash([]);

        // Add axis labels
        ctx.fillStyle = '#888888';
        ctx.font = '10px sans-serif';
        ctx.fillText('0', 2, height - 2);
        ctx.fillText('255', width - 20, height - 2);
        ctx.fillText('Input →', width / 2 - 20, height - 2);
        
        ctx.save();
        ctx.translate(10, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Output →', -25, 0);
        ctx.restore();
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
    
    /**
     * Zoom at a specific point
     * @param {number} pointX - X coordinate to zoom at
     * @param {number} pointY - Y coordinate to zoom at
     * @param {number} zoomFactor - Factor to zoom by
     */
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

    /**
     * Pan the image
     * @param {number} deltaX - X distance to pan
     * @param {number} deltaY - Y distance to pan
     */
    pan(deltaX, deltaY) {
        this.panX += deltaX;
        this.panY += deltaY;
        this.updateCanvasTransform();
    }

    /**
     * Update canvas CSS transform
     * FIXED: Using translate3d for GPU acceleration
     * @private
     */
    updateCanvasTransform() {
        // Use translate3d instead of translate for better GPU acceleration
        this.canvas.style.transform = `translate3d(${this.panX}px, ${this.panY}px, 0) scale(${this.zoom})`;
    }

    /**
     * Update zoom display in UI
     * @private
     */
    updateZoomDisplay() {
        const percent = Math.round(this.zoom * 100);
        document.getElementById('zoomDisplay').textContent = `${percent}%`;
        document.getElementById('infoZoom').textContent = `${percent}%`;
        
        // Update ARIA values
        const zoomDisplay = document.getElementById('zoomDisplay');
        if (zoomDisplay) {
            zoomDisplay.setAttribute('aria-valuenow', percent);
        }
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
     * Save original state for change tracking
     * @private
     */
    saveOriginalState() {
        this.originalState = {
            brightness: 0,
            contrast: 0,
            edgeEnhancement: 0,
            isInverted: false
        };
    }

    /**
     * Check if there are unsaved changes
     * @returns {boolean} True if there are unsaved changes
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
     * @returns {boolean} True if image is loaded
     */
    hasImage() {
        return this.originalImage !== null;
    }

    /**
     * Get current zoom level
     * @returns {number} Current zoom level
     */
    getZoom() {
        return this.zoom;
    }

    /**
     * Set zoom level
     * @param {number} zoomLevel - New zoom level
     */
    setZoom(zoomLevel) {
        this.zoom = Math.max(CONFIG.MIN_ZOOM, Math.min(CONFIG.MAX_ZOOM, zoomLevel));
        this.updateZoomDisplay();
        this.updateCanvasTransform();
    }

    /**
     * Export current image to file
     * @param {string} format - Image format (png, jpeg)
     * @param {number} quality - Quality for JPEG (0-1)
     */
    exportImage(format = 'png', quality = 0.95) {
        if (!this.hasImage()) return;

        try {
            const dataUrl = this.canvas.toDataURL(`image/${format}`, quality);
            const link = document.createElement('a');
            link.download = `radiograph-adjusted.${format}`;
            link.href = dataUrl;
            link.click();
            this.announceToScreenReader('Image exported successfully');
        } catch (error) {
            console.error('Export failed:', error);
            this.announceToScreenReader('Image export failed');
        }
    }
}