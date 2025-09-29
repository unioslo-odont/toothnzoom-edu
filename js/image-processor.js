/**
 * Radiograph Image Viewer - Image Processing Module
 * Handles all image manipulation algorithms including brightness, contrast, edge enhancement, and inversion
 */

/**
 * ImageProcessor class for handling all image processing operations
 * @class
 */
export class ImageProcessor {
    /**
     * Process image data with given parameters
     * @param {ImageData} imageData - Canvas image data
     * @param {Object} params - Processing parameters
     * @param {number} params.brightness - Brightness adjustment (-100 to 100)
     * @param {number} params.contrast - Contrast adjustment (-100 to 100)
     * @param {number} params.edgeEnhancement - Edge enhancement strength (0 to 10)
     * @param {boolean} params.invert - Whether to invert the image
     * @returns {ImageData} Processed image data
     */
    process(imageData, params) {
        const { brightness = 0, contrast = 0, edgeEnhancement = 0, invert = false } = params;
        
        // Clone the image data to avoid modifying the original
        const data = new Uint8ClampedArray(imageData.data);
        const processedData = new ImageData(data, imageData.width, imageData.height);
        
        // Apply brightness and contrast first
        if (brightness !== 0 || contrast !== 0) {
            this.applyBrightnessContrast(processedData.data, brightness, contrast);
        }
        
        // Apply inversion if requested
        if (invert) {
            this.applyInversion(processedData.data);
        }
        
        // Apply edge enhancement last (if needed)
        if (edgeEnhancement > 0) {
            return this.applyEdgeEnhancement(processedData, edgeEnhancement);
        }
        
        return processedData;
    }
    
 
    /**
     * Apply brightness and contrast adjustments
     * @private
     * @param {Uint8ClampedArray} data - Image pixel data
     * @param {number} brightness - Brightness value (-100 to 100)
     * @param {number} contrast - Contrast value (-100 to 100)
     */
    applyBrightnessContrast(data, brightness, contrast) {
        // For extreme contrast values (above 50), use a different algorithm
        const useExtremeContrast = contrast > 50;
        
        if (useExtremeContrast) {
            // Map contrast 50-100 to threshold 128-10
            // Higher contrast = lower threshold (more black/white)
            const threshold = 128 - ((contrast - 50) * 2.36);
            const smoothing = Math.max(1, 100 - contrast); // Less smoothing at higher contrast
            
            for (let i = 0; i < data.length; i += 4) {
                // Calculate luminance
                const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
                
                // Apply brightness first
                const adjustedLum = lum + brightness;
                
                // Apply sigmoid-like curve for extreme contrast
                let value;
                if (contrast >= 95) {
                    // Near 100: Hard threshold (true black/white)
                    value = adjustedLum > threshold ? 255 : 0;
                } else {
                    // Smooth transition using sigmoid
                    const k = smoothing / 10; // Steepness factor
                    const x = (adjustedLum - threshold) / k;
                    value = 255 / (1 + Math.exp(-x));
                }
                
                // Apply to all channels equally to maintain grayscale
                data[i] = value;
                data[i + 1] = value;
                data[i + 2] = value;
            }
        } else {
            // Original algorithm for normal contrast range (-100 to 50)
            const contrastFactor = contrast <= 0 
                ? (contrast + 100) / 100  // 0 to 1 for negative contrast
                : 1 + (contrast / 50) * 3;  // 1 to 4 for positive contrast up to 50
            
            for (let i = 0; i < data.length; i += 4) {
                for (let channel = 0; channel < 3; channel++) {
                    let value = data[i + channel];
                    
                    // Apply contrast: adjust distance from middle gray (128)
                    value = ((value - 128) * contrastFactor) + 128;
                    
                    // Apply brightness: simple addition
                    value += brightness;
                    
                    // Clamp to valid range [0, 255]
                    data[i + channel] = Math.max(0, Math.min(255, value));
                }
            }
        }
    }
    
    /**
     * Apply image inversion (negative effect)
     * @private
     * @param {Uint8ClampedArray} data - Image pixel data
     */
    applyInversion(data) {
        // Invert each pixel's RGB values
        for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];         // Red
            data[i + 1] = 255 - data[i + 1]; // Green
            data[i + 2] = 255 - data[i + 2]; // Blue
            // Alpha channel (i + 3) remains unchanged
        }
    }
    
    /**
     * Apply edge enhancement using Laplacian filter
     * @private
     * @param {ImageData} imageData - Image data to process
     * @param {number} strength - Enhancement strength (0 to 10)
     * @returns {ImageData} Enhanced image data
     */
    applyEdgeEnhancement(imageData, strength) {
        const src = imageData.data;
        const width = imageData.width;
        const height = imageData.height;
        const dst = new Uint8ClampedArray(src);
        
        // Laplacian kernel for edge detection
        // This kernel emphasizes edges while preserving the original image
        const kernel = [
            0, -1,  0,
           -1,  4, -1,
            0, -1,  0
        ];
        
        // Normalize strength to a reasonable range
        const intensity = strength * 0.1; // Convert 0-10 to 0-1
        
        // Apply convolution, skipping image borders
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                // Process each color channel
                for (let channel = 0; channel < 3; channel++) {
                    let sum = 0;
                    let kernelIndex = 0;
                    
                    // Apply 3x3 kernel
                    for (let ky = -1; ky <= 1; ky++) {
                        for (let kx = -1; kx <= 1; kx++) {
                            const pixelIndex = ((y + ky) * width + (x + kx)) * 4 + channel;
                            sum += src[pixelIndex] * kernel[kernelIndex++];
                        }
                    }
                    
                    // Blend edge detection with original image
                    const originalIndex = (y * width + x) * 4 + channel;
                    const enhanced = src[originalIndex] + (sum * intensity);
                    
                    // Store result with clamping
                    dst[originalIndex] = Math.max(0, Math.min(255, enhanced));
                }
            }
        }
        
        return new ImageData(dst, width, height);
    }
    
    /**
     * Calculate image histogram
     * @param {ImageData} imageData - Image data to analyze
     * @returns {Object} Histogram data for RGB channels
     */
    calculateHistogram(imageData) {
        const histogram = {
            red: new Array(256).fill(0),
            green: new Array(256).fill(0),
            blue: new Array(256).fill(0),
            luminance: new Array(256).fill(0)
        };
        
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            histogram.red[r]++;
            histogram.green[g]++;
            histogram.blue[b]++;
            
            // Calculate luminance using standard formula
            const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            histogram.luminance[luminance]++;
        }
        
        return histogram;
    }
    
    /**
     * Apply Gaussian blur (for future implementation)
     * @param {ImageData} imageData - Image data to blur
     * @param {number} radius - Blur radius
     * @returns {ImageData} Blurred image data
     */
    applyGaussianBlur(imageData, radius) {
        // TODO: Implement Gaussian blur for noise reduction
        console.warn('Gaussian blur not yet implemented');
        return imageData;
    }
    
    /**
     * Apply histogram equalization (for future implementation)
     * @param {ImageData} imageData - Image data to equalize
     * @returns {ImageData} Equalized image data
     */
    applyHistogramEqualization(imageData) {
        // TODO: Implement histogram equalization for contrast enhancement
        console.warn('Histogram equalization not yet implemented');
        return imageData;
    }
}