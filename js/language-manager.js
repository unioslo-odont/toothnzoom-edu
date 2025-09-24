/**
 * Radiograph Image Viewer - Language Manager
 * Handles internationalization (i18n) and language switching
 */

/**
 * LanguageManager class for handling translations and language switching
 * @class
 */
export class LanguageManager {
    constructor() {
        this.translations = {};
        this.currentLanguage = 'en';
        this.defaultLanguage = 'en';
        this.supportedLanguages = ['en', 'no'];
        this.initialized = false;
    }

    /**
     * Initialize the language manager
     * @returns {Promise<void>}
     */
    async init() {
        try {
            // Load translations
            const response = await fetch('./js/languages.json');
            if (!response.ok) {
                throw new Error('Failed to load language file');
            }

            this.translations = await response.json();

            // Get user's preferred language
            const savedLanguage = localStorage.getItem('preferredLanguage');
            const browserLanguage = navigator.language.substring(0, 2).toLowerCase();

            // Determine which language to use
            if (savedLanguage && this.supportedLanguages.includes(savedLanguage)) {
                this.currentLanguage = savedLanguage;
            } else if (this.supportedLanguages.includes(browserLanguage)) {
                this.currentLanguage = browserLanguage;
            } else {
                this.currentLanguage = this.defaultLanguage;
            }

            this.initialized = true;

            // Apply initial translations
            await this.applyTranslations();

            // Setup language selector if it exists
            this.setupLanguageSelector();

        } catch (error) {
            console.error('Failed to initialize language manager:', error);
            // Fall back to English if loading fails
            this.currentLanguage = 'en';
        }
    }

    /**
     * Get a translation by key path
     * @param {string} keyPath - Dot-notation path to translation (e.g., "buttons.openImage")
     * @param {Object} params - Optional parameters for string interpolation
     * @returns {string} Translated string
     */
    get(keyPath, params = {}) {
        if (!this.initialized) {
            console.warn('Language manager not initialized');
            return keyPath;
        }

        const keys = keyPath.split('.');
        let value = this.translations[this.currentLanguage];

        // Navigate through the object
        for (const key of keys) {
            if (value && value[key]) {
                value = value[key];
            } else {
                // Fall back to default language
                value = this.getFromLanguage(this.defaultLanguage, keyPath);
                if (!value) {
                    console.warn(`Translation not found: ${keyPath}`);
                    return keyPath;
                }
                break;
            }
        }

        // Handle string interpolation
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return this.interpolate(value, params);
        }

        return value;
    }

    /**
     * Get translation from specific language
     * @private
     */
    getFromLanguage(language, keyPath) {
        const keys = keyPath.split('.');
        let value = this.translations[language];

        for (const key of keys) {
            if (value && value[key]) {
                value = value[key];
            } else {
                return null;
            }
        }

        return value;
    }

    /**
     * Interpolate parameters into string
     * @private
     */
    interpolate(str, params) {
        return str.replace(/\{(\w+)\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    /**
     * Set current language
     * @param {string} language - Language code (e.g., 'en', 'no')
     */
    async setLanguage(language) {
        if (!this.supportedLanguages.includes(language)) {
            console.error(`Unsupported language: ${language}`);
            return;
        }

        this.currentLanguage = language;
        localStorage.setItem('preferredLanguage', language);

        // Apply translations to UI
        await this.applyTranslations();

        // Dispatch event for components that need to react
        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { language }
        }));
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get all supported languages
     * @returns {Array} Array of language objects
     */
    getSupportedLanguages() {
        return this.supportedLanguages.map(code => ({
            code,
            name: this.translations[code]?.name || code
        }));
    }

    /**
     * Apply translations to all UI elements
     * @private
     */
    async applyTranslations() {
        // Apply text content translations
        this.applyElementTranslations();

        // Apply placeholder translations
        this.applyPlaceholderTranslations();

        // Apply title/tooltip translations
        this.applyTooltipTranslations();

        // Update document language
        document.documentElement.lang = this.currentLanguage;
    }

    /**
     * Apply translations to elements with data-i18n attribute
     * @private
     */
    applyElementTranslations() {
        // Buttons
        const buttonMappings = {
            'openFileBtn': 'buttons.openImage',
            'loadServerBtn': 'buttons.loadServer',
            'invertBtn': 'buttons.invert',
            'resetBtn': 'buttons.reset',
            'loadUrlBtn': 'buttons.loadUrl',
            'scanImagesBtn': 'buttons.scanImages',
            'closeUrlBtn': 'buttons.close'
        };

        for (const [id, key] of Object.entries(buttonMappings)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = this.get(key);
            } else {
                console.warn(`Button element not found: ${id}`);
            }
        }

        // FIX: Simplified the logic for updating control group labels
        const labelMappings = {
            'zoomDisplay': 'labels.zoom',
            'brightness': 'labels.brightness',
            'contrast': 'labels.contrast',
            'edgeEnhancement': 'labels.edge'
        };

        for (const [controlId, key] of Object.entries(labelMappings)) {
            const control = document.getElementById(controlId);
            if (control) {
                const label = control.parentElement?.querySelector('label');
                if (label) {
                    label.textContent = this.get(key) + ':';
                }
            }
        }

        // Instructions
        const instructions = document.querySelector('.instructions');
        if (instructions) {
            // FIX: Removed hardcoded characters; they are now in the JSON file.
            instructions.innerHTML = `
                <h2>${this.get('instructions.title')}</h2>
                <p>${this.get('instructions.subtitle')}</p>
                <small>
                    <strong>${this.get('instructions.mouseControls')}:</strong><br>
                    ${this.get('instructions.mouseDetails')}<br>
                    <strong>${this.get('instructions.touchControls')}:</strong><br>
                    ${this.get('instructions.touchDetails')}
                </small>
            `;
        }

        // Server dialog
        const urlDialog = document.getElementById('urlInput');
        if (urlDialog) {
            const title = urlDialog.querySelector('h3');
            if (title) {
                title.textContent = this.get('serverDialog.title');
            }

            const examples = urlDialog.querySelector('.url-examples');
            if (examples) {
                // FIX: Removed hardcoded characters.
                examples.innerHTML = `
                    ${this.get('serverDialog.examples')}:<br>
                    ${this.get('serverDialog.exampleLocal')}<br>
                    ${this.get('serverDialog.exampleUrl')}
                `;
            }
        }

        // Drop zone
        const dropZone = document.getElementById('dropZone');
        if (dropZone) {
            dropZone.textContent = this.get('hints.dropImage');
        }

        // Info panel
        const infoPanel = document.getElementById('infoPanel');
        if (infoPanel) {
            const labels = infoPanel.querySelectorAll('div');
            if (labels[0]) {
                labels[0].innerHTML = `${this.get('labels.image')}: <span id="imageName"></span>`;
            }
            if (labels[1]) {
                labels[1].innerHTML = `${this.get('labels.size')}: <span id="imageSize"></span>`;
            }
            if (labels[2]) {
                labels[2].innerHTML = `${this.get('labels.zoom')}: <span id="infoZoom">100%</span>`;
            }
        }
    }

    /**
     * Apply placeholder translations
     * @private
     */
    applyPlaceholderTranslations() {
        const imageUrlInput = document.getElementById('imageUrl');
        if (imageUrlInput) {
            imageUrlInput.placeholder = this.get('serverDialog.placeholder');
        }
    }

    /**
     * Apply tooltip translations
     * @private
     */
    applyTooltipTranslations() {
        const tooltipMappings = {
            'zoomInBtn': 'tooltips.zoomIn',
            'zoomOutBtn': 'tooltips.zoomOut',
            'resetZoomBtn': 'tooltips.resetZoom',
            'openFileBtn': 'tooltips.openFile',
            'loadServerBtn': 'tooltips.loadServer',
            'invertBtn': 'tooltips.invertImage',
            'resetBtn': 'tooltips.resetAdjustments'
        };

        for (const [id, key] of Object.entries(tooltipMappings)) {
            const element = document.getElementById(id);
            if (element) {
                element.title = this.get(key);
            }
        }
    }

    /**
     * Setup language selector UI
     * @private
     */
    setupLanguageSelector() {
        // Create language selector if it doesn't exist
        let selector = document.getElementById('languageSelector');
        if (!selector) {
            const container = this.createLanguageSelector();
            document.querySelector('.header').appendChild(container);
            selector = container.querySelector('select');
        }

        // Update selector value
        selector.value = this.currentLanguage;

        // Add change event listener
        selector.addEventListener('change', (e) => {
            this.setLanguage(e.target.value);
        });
    }

    /**
     * Create language selector element
     * @private
     */
    createLanguageSelector() {
        const container = document.createElement('div');
        container.className = 'language-selector';
        container.style.cssText = 'margin-left: auto; display: flex; align-items: center; gap: 10px;';

        const icon = document.createElement('span');
        // FIX: Replaced corrupted text with a proper globe emoji icon.
        icon.textContent = '🌐';
        icon.style.fontSize = '20px';

        const select = document.createElement('select');
        select.id = 'languageSelector';
        select.className = 'language-select';
        select.style.cssText = `
            background: #3a3a3a;
            color: white;
            border: 1px solid #555;
            padding: 5px 10px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 14px;
        `;

        // Add options
        this.getSupportedLanguages().forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            select.appendChild(option);
        });

        container.appendChild(icon);
        container.appendChild(select);

        return container;
    }

    /**
     * Show a translated message/alert
     * @param {string} messageKey - Translation key for the message
     * @param {Object} params - Optional parameters for interpolation
     */
    showMessage(messageKey, params = {}) {
        const message = this.get(messageKey, params);
        alert(message);
    }

    /**
     * Show a translated hint
     * @param {string} hintKey - Translation key for the hint
     */
    showHint(hintKey) {
        const hint = document.getElementById('mouseHint');
        if (hint) {
            hint.textContent = this.get(hintKey);
            hint.classList.add('visible');

            setTimeout(() => {
                hint.classList.remove('visible');
            }, 1500);
        }
    }
}

// Create singleton instance
const languageManager = new LanguageManager();

// Export singleton
export default languageManager;