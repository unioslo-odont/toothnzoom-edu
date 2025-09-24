/**
 * Radiograph Image Viewer - Utility Functions
 * Helper functions and UI utilities
 */

import languageManager from './language-manager.js';

/**
 * Setup UI utility handlers
 * @param {RadiographViewer} viewer - Viewer instance
 */
export function setupUIHandlers(viewer) {
    setupServerLoader(viewer);
    setupKeyboardShortcuts(viewer);
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
        // Full URL or data URL
        imageUrl = url;
    } else if (url.startsWith('/')) {
        // Absolute path
        imageUrl = url;
    } else {
        // Relative path - prepend ./images/
        imageUrl = `./images/${url}`;
        
        // If running from file:// protocol, try to construct proper path
        if (window.location.protocol === 'file:') {
            console.warn('Running from local file. Image loading may be restricted by browser security.');
            // Try to use the full file path
            const basePath = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
            imageUrl = `${basePath}/images/${url}`;
        }
    }
    
    try {
        await viewer.loadImageFromUrl(imageUrl);
        input.value = '';
        document.getElementById('urlInput').classList.remove('visible');
    } catch (error) {
        languageManager.showMessage('messages.loadFailed');
        console.error('Failed to load image:', error);
    }
}

/**
 * Scan for server images
 * @private
 */
async function scanServerImages(viewer) {
    const grid = document.getElementById('thumbnailGrid');
    const scanBtn = document.getElementById('scanImagesBtn');
    
    // Show loading state
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
            scanBtn.textContent = languageManager.get('buttons.scanImages');
            scanBtn.disabled = false;
        }, 100);
        return;
    }
    
    try {
        // Try to load file list from server
        const response = await fetch('./images/file_list.json');
        
        if (!response.ok) {
            throw new Error('file_list.json not found');
        }
        
        const imageNames = await response.json();
        
        if (!Array.isArray(imageNames) || imageNames.length === 0) {
            grid.innerHTML = `<div class="loading">${languageManager.get('messages.noImages')}</div>`;
            return;
        }
        
        // Load and display thumbnails
        await loadThumbnails(viewer, imageNames);
        
        scanBtn.textContent = languageManager.get('messages.foundImages', { count: imageNames.length });
    } catch (error) {
        console.error('Failed to scan images:', error);
        
        // Provide helpful error message
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
        // Reset button after delay
        setTimeout(() => {
            scanBtn.textContent = languageManager.get('buttons.scanImages');
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
    
    // Load each image
    for (const name of imageNames) {
        try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            const url = `./images/${name}`;
            
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    loadedImages.push({ name, url, image: img });
                    resolve();
                };
                img.onerror = reject;
                img.src = url;
            });
        } catch (error) {
            console.warn(`Failed to load thumbnail for ${name}:`, error);
        }
    }
    
    // Display thumbnails
    if (loadedImages.length === 0) {
        grid.innerHTML = `<div class="loading">${languageManager.get('messages.noImages')}</div>`;
        return;
    }
    
    loadedImages.forEach(imageData => {
        const item = document.createElement('div');
        item.className = 'thumbnail-item';
        item.onclick = () => loadServerImage(viewer, imageData);
        
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
        languageManager.showMessage('messages.loadFailed');
    }
}

/**
 * Setup keyboard shortcuts
 * @private
 */
function setupKeyboardShortcuts(viewer) {
    document.addEventListener('keydown', (e) => {
        // Skip if typing in an input field
        if (e.target.tagName === 'INPUT') return;
        
        if (!viewer.hasImage()) return;
        
        switch (e.key) {
            case '+':
            case '=':
                // Zoom in
                e.preventDefault();
                const rect = viewer.canvas.getBoundingClientRect();
                viewer.zoomAtPoint(rect.width / 2, rect.height / 2, 1.2);
                break;
                
            case '-':
                // Zoom out
                e.preventDefault();
                viewer.zoomAtPoint(
                    viewer.canvas.width / 2, 
                    viewer.canvas.height / 2, 
                    1 / 1.2
                );
                break;
                
            case '0':
                // Reset zoom
                e.preventDefault();
                viewer.resetView();
                break;
                
            case 'r':
            case 'R':
                // Reset all adjustments
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    viewer.resetAdjustments();
                }
                break;
                
            case 'i':
            case 'I':
                // Toggle invert
                e.preventDefault();
                viewer.toggleInvert();
                document.getElementById('invertBtn').classList.toggle('active');
                break;
                
            case 'ArrowLeft':
                // Pan left
                e.preventDefault();
                viewer.pan(-20, 0);
                break;
                
            case 'ArrowRight':
                // Pan right
                e.preventDefault();
                viewer.pan(20, 0);
                break;
                
            case 'ArrowUp':
                // Pan up
                e.preventDefault();
                viewer.pan(0, -20);
                break;
                
            case 'ArrowDown':
                // Pan down
                e.preventDefault();
                viewer.pan(0, 20);
                break;
        }
    });
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