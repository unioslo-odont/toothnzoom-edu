/**
 * Radiograph Image Viewer - Main Application Entry Point
 * Initializes the viewer and sets up all event handlers
 */

import { RadiographViewer } from './viewer.js';
import { setupControls } from './controls.js';
import { setupUIHandlers } from './utils.js';
import languageManager from './language-manager.js';

// Global viewer instance
let viewer = null;

/**
 * Initialize the application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async () => {
    console.log('Initializing Radiograph Viewer...');
    
    try {
        // Initialize language manager first and wait for it to complete
        await languageManager.init();
        console.log('Language manager initialized:', languageManager.getCurrentLanguage());
        
        // Small delay to ensure DOM is fully ready
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create the main viewer instance
        viewer = new RadiographViewer('imageCanvas');
        
        // Setup all control handlers
        setupControls(viewer);
        
        // Setup UI utility handlers
        setupUIHandlers(viewer);
        
        // Make viewer and language manager globally accessible for debugging
        window.radiographViewer = viewer;
        window.languageManager = languageManager;
        
        // Force re-apply translations to ensure all elements are updated
        await languageManager.applyTranslations();
        
        console.log('Radiograph Viewer initialized successfully');
    } catch (error) {
        console.error('Failed to initialize Radiograph Viewer:', error);
    }
});

/**
 * Handle window resize events
 */
window.addEventListener('resize', () => {
    if (viewer && viewer.hasImage()) {
        viewer.resetView();
    }
});

/**
 * Prevent accidental navigation away with unsaved changes
 */
window.addEventListener('beforeunload', (e) => {
    if (viewer && viewer.hasImage() && viewer.hasUnsavedChanges()) {
        e.preventDefault();
        e.returnValue = languageManager.get('messages.unsavedChanges');
    }
});

/**
 * Export the viewer instance for use in other modules if needed
 */
export { viewer };