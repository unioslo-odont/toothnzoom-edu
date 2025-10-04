/**
 * Radiograph Image Viewer - Utility Functions
 * ENHANCED: Better error handling, performance utilities
 */

import languageManager from './language-manager.js';

/**
 * Setup UI utility handlers
 * @param {RadiographViewer} viewer - Viewer instance
 */
export function setupUIHandlers(viewer) {
    setupServerLoader(viewer);
}

/**
 * Setup server image loading functionality
 * @private
 */
function setupServerLoader(viewer) {
    const urlInput = document.getElementById('urlInput');
    const imageUrlField = document.getElementById('imageUrl');

    // Toggle server load dialog
    document.getElementById('loadServerBtn').addEventListener('click', () => {
        urlInput.classList.toggle('visible');
        if (urlInput.classList.contains('visible')) {
            imageUrlField.focus();
        }
    });

    // Close button
    document.getElementById('closeUrlBtn').addEventListener('click', () => {
        urlInput.classList.remove('visible');
    });

    // Load from URL
    document.getElementById('loadUrlBtn').addEventListener('click', () => {
        loadFromUrl(viewer);
    });

    // Enter key in URL field
    imageUrlField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loadFromUrl(viewer);
        }
    });

    // Scan server images button
    document.getElementById('scanImagesBtn').addEventListener('click', () => {
        scanServerImages(viewer);
    });
}

/**
 * Load image from URL
 * @private
 */
async function loadFromUrl(viewer) {
    const input = document.getElementById('imageUrl');
    const url = input.value.trim();

    if (!url) {
        languageManager.showMessage('messages.noUrl');
        return;
    }

    // Handle different URL formats
    let imageUrl;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        imageUrl = url;
    } else if (url.startsWith('/')) {
        imageUrl = url;
    } else {
        imageUrl = `./images/${url}`;

        if (window.location.protocol === 'file:') {
            console.warn('Running from local file. Image loading may be restricted by browser security.');
            const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            imageUrl = `${basePath}/images/${url}`;
        }
    }

    try {
        await viewer.loadImageFromUrl(imageUrl);
        input.value = '';
        document.getElementById('urlInput').classList.remove('visible');
    } catch (error) {
        console.error('Failed to load image:', error);
        languageManager.showMessage('messages.loadFailed');
    }
}

/**
 * Scan for server images
 * @private
 */
async function scanServerImages(viewer) {
    const grid = document.getElementById('thumbnailGrid');
    const scanBtn = document.getElementById('scanImagesBtn');
    const originalText = scanBtn.textContent;

    // Disable button and show loading state
    scanBtn.disabled = true;
    scanBtn.textContent = languageManager.get('messages.scanningButton');
    grid.innerHTML = `<div class="loading">${languageManager.get('messages.scanning')}</div>`;
    grid.style.display = 'block';

    // Check if running locally
    if (window.location.protocol === 'file:') {
        grid.innerHTML = `
            <div class="loading" style="color: #ffaa00;">
                ⚠️ Running locally - Server browsing requires a web server.<br><br>
                To use server browsing:<br>
                1. Run a local server: <code>python -m http.server 8000</code><br>
                2. Or manually enter image filenames<br>
                3. Or use "Open Image" to browse local files
            </div>
        `;
        setTimeout(() => {
            scanBtn.textContent = originalText;
            scanBtn.disabled = false;
        }, 100);
        return;
    }

    try {
        const response = await fetch('./images/file_list.json');

        if (!response.ok) {
            throw new Error('file_list.json not found');
        }

        const imageNames = await response.json();

        if (!Array.isArray(imageNames) || imageNames.length === 0) {
            grid.innerHTML = `<div class="loading">${languageManager.get('messages.noImages')}</div>`;
            return;
        }

        await loadThumbnails(viewer, imageNames);
        scanBtn.textContent = languageManager.get('messages.foundImages', { count: imageNames.length });
    } catch (error) {
        console.error('Failed to scan images:', error);

        grid.innerHTML = `
            <div class="loading" style="color: #ffaa00;">
                ${languageManager.get('messages.serverError')}<br><br>
                To fix this:<br>
                1. Create <code>images/file_list.json</code> with:<br>
                <code style="display: block; margin: 10px; padding: 5px; background: #1a1a1a; border-radius: 3px;">
                ["image1.jpg", "image2.png", ...]
                </code>
                2. Add your images to the <code>images/</code> folder<br>
                3. Run a web server (not file://)
            </div>
        `;
    } finally {
        setTimeout(() => {
            scanBtn.textContent = originalText;
            scanBtn.disabled = false;
        }, 3000);
    }
}

/**
 * Load and display thumbnails
 * @private
 */
async function loadThumbnails(viewer, imageNames) {
    const grid = document.getElementById('thumbnailGrid');
    grid.innerHTML = '';
    grid.style.display = 'grid';

    const loadedImages = [];
    const maxConcurrent = 5;
    
    // Load images in batches to avoid overwhelming the browser
    for (let i = 0; i < imageNames.length; i += maxConcurrent) {
        const batch = imageNames.slice(i, i + maxConcurrent);
        const promises = batch.map(name => loadThumbnail(name));
        const results = await Promise.allSettled(promises);
        
        results.forEach((result, index) => {
            if (result.status === 'fulfilled') {
                loadedImages.push(result.value);
            } else {
                console.warn(`Failed to load thumbnail for ${batch[index]}:`, result.reason);
            }
        });
    }

    if (loadedImages.length === 0) {
        grid.innerHTML = `<div class="loading">${languageManager.get('messages.noImages')}</div>`;
        return;
    }

    loadedImages.forEach(imageData => {
        const item = document.createElement('div');
        item.className = 'thumbnail-item';
        item.onclick = () => loadServerImage(viewer, imageData);
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', `Load ${imageData.name}`);

        const img = document.createElement('img');
        img.className = 'thumbnail-image';
        img.src = imageData.url;
        img.alt = imageData.name;

        const label = document.createElement('div');
        label.className = 'thumbnail-label';
        label.textContent = imageData.name;

        item.appendChild(img);
        item.appendChild(label);
        grid.appendChild(item);

        // Keyboard support
        item.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                loadServerImage(viewer, imageData);
            }
        });
    });
}

/**
 * Load a single thumbnail
 * @private
 */
function loadThumbnail(name) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        const url = `./images/${name}`;

        img.onload = () => {
            resolve({ name, url, image: img });
        };
        
        img.onerror = () => {
            reject(new Error(`Failed to load ${name}`));
        };
        
        img.src = url;
    });
}

/**
 * Load a server image
 * @private
 */
async function loadServerImage(viewer, imageData) {
    try {
        await viewer.loadImageFromUrl(imageData.url);
        document.getElementById('urlInput').classList.remove('visible');
    } catch (error) {
        console.error('Failed to load server image:', error);
        languageManager.showMessage('messages.loadFailed');
    }
}

/**
 * Utility function to format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Utility function to get file extension
 * @param {string} filename - File name
 * @returns {string} File extension
 */
export function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Check if a file is a supported image format
 * @param {string} filename - File name to check
 * @returns {boolean} True if supported
 */
export function isSupportedImage(filename) {
    const supportedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'];
    const extension = getFileExtension(filename).toLowerCase();
    return supportedExtensions.includes(extension);
}

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
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
 * Throttle function for performance optimization
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Request animation frame polyfill
 */
export const requestAnimFrame = (function() {
    return window.requestAnimationFrame ||
           window.webkitRequestAnimationFrame ||
           window.mozRequestAnimationFrame ||
           function(callback) {
               window.setTimeout(callback, 1000 / 60);
           };
})();

/**
 * Validate image file
 * @param {File} file - File to validate
 * @throws {Error} If file is invalid
 */
export function validateImageFile(file) {
    const maxSize = 50 * 1024 * 1024; // 50MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp'];
    
    if (!file) {
        throw new Error('No file provided');
    }
    
    if (file.size > maxSize) {
        throw new Error('File too large (max 50MB)');
    }
    
    if (!allowedTypes.includes(file.type)) {
        throw new Error('Unsupported file type');
    }
    
    return true;
}