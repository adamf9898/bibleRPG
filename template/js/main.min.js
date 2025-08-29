/**
 * Bible RPG Template - Main Application
 * Version: 1.0.0
 * Description: Main application initialization and coordination
 */

'use strict';

/**
 * Main Application module for Bible RPG
 * @namespace BibleRPG.App
 */
BibleRPG.App = (function() {
    
    // Application state
    let isInitialized = false;
    let gameEngine = null;
    let uiManager = null;
    let accessibilityManager = null;
    let loadingManager = null;
    
    // Configuration
    const CONFIG = {
        LOADING_DURATION: 3000,
        SAVE_INTERVAL: 30000, // Auto-save every 30 seconds
        VERSION: '1.0.0'
    };

    /**
     * Loading Manager
     * Handles application loading states and progress
     */
    class LoadingManager {
        constructor() {
            this.loadingScreen = null;
            this.progressBar = null;
            this.loadingText = null;
            this.loadingSteps = [];
            this.currentStep = 0;
            this.init();
        }

        init() {
            this.loadingScreen = document.getElementById('loading-screen');
            this.progressBar = document.querySelector('.loading-bar');
            this.loadingText = document.querySelector('.loading-text');
            
            if (!this.loadingScreen || !this.progressBar || !this.loadingText) {
                console.warn('Loading screen elements not found');
                return;
            }

            // Define loading steps
            this.loadingSteps = [
                { message: 'Preparing your spiritual journey...', duration: 500 },
                { message: 'Loading biblical lands...', duration: 800 },
                { message: 'Gathering sacred texts...', duration: 600 },
                { message: 'Blessing your character...', duration: 700 },
                { message: 'Opening the gates of faith...', duration: 400 }
            ];
        }

        /**
         * Start loading sequence
         * @returns {Promise} Promise that resolves when loading is complete
         */
        start() {
            return new Promise((resolve) => {
                if (!this.loadingScreen) {
                    resolve();
                    return;
                }

                this.loadingScreen.style.display = 'flex';
                this.loadingScreen.setAttribute('aria-hidden', 'false');
                this.currentStep = 0;
                
                this.executeLoadingSteps().then(() => {
                    this.hide();
                    resolve();
                });
            });
        }

        /**
         * Execute loading steps with progress updates
         * @returns {Promise} Promise that resolves when all steps complete
         */
        async executeLoadingSteps() {
            for (let i = 0; i < this.loadingSteps.length; i++) {
                const step = this.loadingSteps[i];
                const progress = ((i + 1) / this.loadingSteps.length) * 100;
                
                this.updateProgress(progress, step.message);
                await this.delay(step.duration);
            }
        }

        /**
         * Update loading progress
         * @param {number} progress - Progress percentage (0-100)
         * @param {string} message - Loading message
         */
        updateProgress(progress, message) {
            if (this.progressBar) {
                this.progressBar.style.width = `${progress}%`;
                this.progressBar.setAttribute('aria-valuenow', progress);
            }
            
            if (this.loadingText && message) {
                this.loadingText.textContent = message;
            }
        }

        /**
         * Hide loading screen
         */
        hide() {
            if (!this.loadingScreen) return;
            
            this.loadingScreen.setAttribute('aria-hidden', 'true');
            
            // Fade out animation
            this.loadingScreen.style.opacity = '0';
            setTimeout(() => {
                this.loadingScreen.style.display = 'none';
                this.loadingScreen.style.opacity = '1'; // Reset for next time
            }, 500);
        }

        /**
         * Utility delay function
         * @param {number} ms - Delay in milliseconds
         * @returns {Promise} Promise that resolves after delay
         */
        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }
    }

    /**
     * Settings Manager
     * Handles game settings and preferences
     */
    class SettingsManager {
        constructor() {
            this.modal = null;
            this.form = null;
            this.settings = {
                volume: 100,
                musicVolume: 80,
                sfxVolume: 90,
                reducedMotion: BibleRPG.Utils.prefersReducedMotion(),
                highContrast: false,
                largeText: false,
                autoSave: true,
                announcementsEnabled: true
            };
            this.init();
        }

        init() {
            this.modal = document.getElementById('settings-modal');
            this.form = this.modal?.querySelector('.settings-form');
            
            if (this.modal && typeof BibleRPG.UI !== 'undefined') {
                this.modalComponent = new BibleRPG.UI.Modal(this.modal);
            }

            this.loadSettings();
            this.bindEvents();
        }

        bindEvents() {
            // Settings button
            const settingsBtn = document.getElementById('settings-btn');
            if (settingsBtn) {
                settingsBtn.addEventListener('click', () => {
                    this.openSettings();
                });
            }

            // Form changes
            if (this.form) {
                this.form.addEventListener('change', (e) => {
                    this.handleSettingChange(e.target);
                });

                this.form.addEventListener('input', (e) => {
                    if (e.target.type === 'range') {
                        this.handleSettingChange(e.target);
                    }
                });
            }
        }

        /**
         * Open settings modal
         */
        openSettings() {
            if (!this.modalComponent) return;
            
            this.populateForm();
            this.modalComponent.open();
        }

        /**
         * Handle setting change
         * @param {Element} input - Input element that changed
         */
        handleSettingChange(input) {
            const setting = input.id.replace('-', '');
            let value = input.type === 'checkbox' ? input.checked : input.value;
            
            // Convert to number if needed
            if (input.type === 'range' || input.type === 'number') {
                value = Number(value);
            }
            
            this.settings[setting] = value;
            this.applySetting(setting, value);
            this.saveSettings();
        }

        /**
         * Apply a setting change
         * @param {string} setting - Setting name
         * @param {*} value - Setting value
         */
        applySetting(setting, value) {
            switch (setting) {
                case 'reducedMotion':
                    if (typeof BibleRPG.Accessibility !== 'undefined') {
                        if (value) {
                            BibleRPG.Accessibility.ThemeManager.toggleReducedMotion();
                        }
                    }
                    break;
                case 'highContrast':
                    if (typeof BibleRPG.Accessibility !== 'undefined') {
                        if (value) {
                            BibleRPG.Accessibility.ThemeManager.toggleHighContrast();
                        }
                    }
                    break;
                case 'largeText':
                    if (typeof BibleRPG.Accessibility !== 'undefined') {
                        if (value) {
                            BibleRPG.Accessibility.ThemeManager.toggleLargeText();
                        }
                    }
                    break;
                case 'volume':
                case 'musicVolume':
                case 'sfxVolume':
                    // Audio management would go here
                    console.log(`${setting} set to ${value}`);
                    break;
            }
        }

        /**
         * Populate form with current settings
         */
        populateForm() {
            if (!this.form) return;
            
            Object.entries(this.settings).forEach(([key, value]) => {
                const input = this.form.querySelector(`#${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else {
                        input.value = value;
                    }
                }
            });
        }

        /**
         * Load settings from storage
         */
        loadSettings() {
            const saved = BibleRPG.Utils.Storage.get('bibleRPG_settings', {});
            this.settings = { ...this.settings, ...saved };
            
            // Apply loaded settings
            Object.entries(this.settings).forEach(([key, value]) => {
                this.applySetting(key, value);
            });
        }

        /**
         * Save settings to storage
         */
        saveSettings() {
            BibleRPG.Utils.Storage.set('bibleRPG_settings', this.settings);
        }
    }

    /**
     * Application Error Handler
     */
    class ErrorHandler {
        constructor() {
            this.init();
        }

        init() {
            // Global error handling
            window.addEventListener('error', (e) => {
                this.handleError(e.error, 'JavaScript Error');
            });

            window.addEventListener('unhandledrejection', (e) => {
                this.handleError(e.reason, 'Unhandled Promise Rejection');
            });
        }

        /**
         * Handle application errors
         * @param {Error} error - Error object
         * @param {string} context - Error context
         */
        handleError(error, context = 'Unknown') {
            console.error(`${context}:`, error);
            
            // Show user-friendly error message
            if (typeof BibleRPG.UI !== 'undefined') {
                BibleRPG.UI.Notification.show(
                    'An error occurred. The game will continue, but some features may not work correctly.',
                    { type: 'error', duration: 8000 }
                );
            }

            // Log error details for debugging
            const errorInfo = {
                message: error.message || 'Unknown error',
                stack: error.stack || 'No stack trace available',
                context,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href
            };

            // Store error for debugging (in development)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                console.table(errorInfo);
            }
        }
    }

    /**
     * Auto-save Manager
     */
    class AutoSaveManager {
        constructor() {
            this.interval = null;
            this.isEnabled = true;
        }

        /**
         * Start auto-save
         */
        start() {
            if (!this.isEnabled || this.interval) return;
            
            this.interval = setInterval(() => {
                this.save();
            }, CONFIG.SAVE_INTERVAL);
        }

        /**
         * Stop auto-save
         */
        stop() {
            if (this.interval) {
                clearInterval(this.interval);
                this.interval = null;
            }
        }

        /**
         * Save game
         */
        save() {
            if (typeof BibleRPG.GameEngine !== 'undefined' && BibleRPG.GameEngine.SaveSystem) {
                const success = BibleRPG.GameEngine.SaveSystem.save();
                if (success) {
                    console.log('Auto-saved game');
                    
                    // Show subtle save indicator
                    this.showSaveIndicator();
                }
            }
        }

        /**
         * Show save indicator
         */
        showSaveIndicator() {
            if (typeof BibleRPG.UI === 'undefined') return;
            
            BibleRPG.UI.Notification.show('Game saved', {
                type: 'success',
                duration: 2000,
                autoClose: true
            });
        }

        /**
         * Enable/disable auto-save
         * @param {boolean} enabled - Whether to enable auto-save
         */
        setEnabled(enabled) {
            this.isEnabled = enabled;
            if (enabled) {
                this.start();
            } else {
                this.stop();
            }
        }
    }

    /**
     * Performance Monitor
     */
    class PerformanceMonitor {
        constructor() {
            this.metrics = {
                fps: 0,
                frameTime: 0,
                memoryUsage: 0
            };
            this.lastTime = 0;
            this.frameCount = 0;
            this.isMonitoring = false;
        }

        /**
         * Start performance monitoring
         */
        start() {
            if (this.isMonitoring) return;
            
            this.isMonitoring = true;
            this.lastTime = performance.now();
            this.monitor();
        }

        /**
         * Stop performance monitoring
         */
        stop() {
            this.isMonitoring = false;
        }

        /**
         * Monitor performance metrics
         */
        monitor() {
            if (!this.isMonitoring) return;
            
            const currentTime = performance.now();
            const deltaTime = currentTime - this.lastTime;
            
            this.frameCount++;
            this.metrics.frameTime = deltaTime;
            
            // Calculate FPS every second
            if (this.frameCount >= 60) {
                this.metrics.fps = Math.round(1000 / (deltaTime / this.frameCount));
                this.frameCount = 0;
            }
            
            // Memory usage (if available)
            if (performance.memory) {
                this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
            }
            
            this.lastTime = currentTime;
            
            requestAnimationFrame(() => this.monitor());
        }

        /**
         * Get current metrics
         * @returns {Object} Performance metrics
         */
        getMetrics() {
            return { ...this.metrics };
        }
    }

    /**
     * Initialize the application
     * @returns {Promise} Promise that resolves when initialization is complete
     */
    const initialize = async () => {
        if (isInitialized) {
            console.warn('Application already initialized');
            return;
        }

        console.log(`Bible RPG Template v${CONFIG.VERSION} - Initializing...`);

        // Initialize error handling first
        new ErrorHandler();

        // Initialize loading manager
        loadingManager = new LoadingManager();
        
        // Start loading sequence
        await loadingManager.start();

        try {
            // Initialize accessibility features
            if (typeof BibleRPG.Accessibility !== 'undefined') {
                BibleRPG.Accessibility.initialize();
                accessibilityManager = BibleRPG.Accessibility;
                console.log('✓ Accessibility features initialized');
            }

            // Initialize UI components
            if (typeof BibleRPG.UI !== 'undefined') {
                uiManager = BibleRPG.UI.initialize();
                console.log('✓ UI components initialized');
            }

            // Initialize game engine
            if (typeof BibleRPG.GameEngine !== 'undefined') {
                const canvas = document.getElementById('gameCanvas');
                const success = BibleRPG.GameEngine.initialize(canvas);
                if (success) {
                    gameEngine = BibleRPG.GameEngine;
                    console.log('✓ Game engine initialized');
                } else {
                    throw new Error('Failed to initialize game engine');
                }
            }

            // Initialize settings
            new SettingsManager();
            console.log('✓ Settings manager initialized');

            // Initialize auto-save
            const autoSave = new AutoSaveManager();
            autoSave.start();
            console.log('✓ Auto-save enabled');

            // Initialize performance monitoring (development only)
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                const perfMonitor = new PerformanceMonitor();
                perfMonitor.start();
                window.BibleRPG_PerformanceMonitor = perfMonitor;
            }

            // Bind global events
            bindGlobalEvents();

            // Set up template placeholders
            setupTemplatePlaceholders();

            // Mark as initialized
            isInitialized = true;

            console.log('✓ Bible RPG Template initialization complete');

            // Announce to accessibility tools
            if (accessibilityManager) {
                setTimeout(() => {
                    accessibilityManager.announce('Bible RPG is ready to play. Press Tab to navigate or use arrow keys to move.', 'polite');
                }, 1000);
            }

            // Start game if engine is available
            if (gameEngine) {
                gameEngine.GameLoop.start();
            }

        } catch (error) {
            console.error('Failed to initialize application:', error);
            
            // Show error to user
            if (typeof BibleRPG.UI !== 'undefined') {
                BibleRPG.UI.Notification.show(
                    'Failed to initialize the game. Please refresh the page and try again.',
                    { type: 'error', duration: 10000 }
                );
            }
            
            throw error;
        }
    };

    /**
     * Bind global application events
     */
    const bindGlobalEvents = () => {
        // Page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Pause game when tab is hidden
                if (gameEngine && gameEngine.GameLoop) {
                    gameEngine.GameLoop.stop();
                }
            } else {
                // Resume game when tab is visible
                if (gameEngine && gameEngine.GameLoop) {
                    gameEngine.GameLoop.start();
                }
            }
        });

        // Window beforeunload
        window.addEventListener('beforeunload', (e) => {
            // Save game before leaving
            if (gameEngine && gameEngine.SaveSystem) {
                gameEngine.SaveSystem.save();
            }
        });

        // Online/offline status
        window.addEventListener('online', () => {
            if (typeof BibleRPG.UI !== 'undefined') {
                BibleRPG.UI.Notification.show('Connection restored', { type: 'success' });
            }
        });

        window.addEventListener('offline', () => {
            if (typeof BibleRPG.UI !== 'undefined') {
                BibleRPG.UI.Notification.show('You are offline. Game will continue, but features may be limited.', { type: 'warning' });
            }
        });

        // Game-specific events
        if (gameEngine) {
            gameEngine.GameEvents.on('game-saved', () => {
                console.log('Game saved successfully');
            });

            gameEngine.GameEvents.on('save-failed', (error) => {
                console.error('Failed to save game:', error);
                if (typeof BibleRPG.UI !== 'undefined') {
                    BibleRPG.UI.Notification.show('Failed to save game', { type: 'error' });
                }
            });
        }
    };

    /**
     * Set up template placeholders with dynamic content
     */
    const setupTemplatePlaceholders = () => {
        const placeholders = {
            '{{GAME_TITLE}}': 'Bible RPG: Spiritual Journey',
            '{{GAME_DESCRIPTION}}': 'A chaotic role-playing game that immerses players in an open world, weaving through stories and parables from the Gospel and Scripture of the King James Version of the Bible.',
            '{{CANONICAL_URL}}': window.location.href,
            '{{OG_IMAGE_URL}}': new URL('./assets/images/og-image.png', window.location.origin).href,
            '{{TWITTER_IMAGE_URL}}': new URL('./assets/images/twitter-card.png', window.location.origin).href,
            '{{VERSION}}': CONFIG.VERSION,
            '{{CURRENT_YEAR}}': new Date().getFullYear().toString()
        };

        // Replace placeholders in document
        Object.entries(placeholders).forEach(([placeholder, value]) => {
            const elements = document.querySelectorAll(`[data-placeholder="${placeholder}"]`);
            elements.forEach(element => {
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    element.value = value;
                } else {
                    element.textContent = value;
                }
            });

            // Replace in text content
            document.body.innerHTML = document.body.innerHTML.replace(new RegExp(placeholder, 'g'), value);
        });
    };

    /**
     * Get application status
     * @returns {Object} Application status information
     */
    const getStatus = () => {
        return {
            isInitialized,
            version: CONFIG.VERSION,
            modules: {
                gameEngine: !!gameEngine,
                uiManager: !!uiManager,
                accessibilityManager: !!accessibilityManager
            },
            performance: window.BibleRPG_PerformanceMonitor?.getMetrics() || null
        };
    };

    /**
     * Restart the application
     */
    const restart = () => {
        if (gameEngine && gameEngine.GameLoop) {
            gameEngine.GameLoop.stop();
        }

        // Clear any intervals/timeouts
        // Reset state
        isInitialized = false;
        
        // Reinitialize
        initialize();
    };

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        // DOM is already ready
        setTimeout(initialize, 0);
    }

    // Public API
    return {
        initialize,
        restart,
        getStatus,
        CONFIG,
        
        // Getters
        get isInitialized() { return isInitialized; },
        get gameEngine() { return gameEngine; },
        get uiManager() { return uiManager; },
        get accessibilityManager() { return accessibilityManager; }
    };

})();

// Make application available globally for debugging
window.BibleRPG_App = BibleRPG.App;