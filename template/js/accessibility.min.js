/**
 * Bible RPG Template - Accessibility Features
 * Version: 1.0.0
 * Description: Comprehensive accessibility features and WCAG compliance utilities
 */

'use strict';

/**
 * Accessibility module for Bible RPG
 * @namespace BibleRPG.Accessibility
 */
BibleRPG.Accessibility = (function() {
    
    // Configuration
    const CONFIG = {
        FOCUS_RING_CLASS: 'focus-visible',
        HIGH_CONTRAST_CLASS: 'high-contrast',
        LARGE_TEXT_CLASS: 'large-text',
        REDUCED_MOTION_CLASS: 'reduced-motion',
        STORAGE_KEYS: {
            HIGH_CONTRAST: 'a11y_high_contrast',
            LARGE_TEXT: 'a11y_large_text',
            REDUCED_MOTION: 'a11y_reduced_motion',
            SCREEN_READER_ANNOUNCEMENTS: 'a11y_sr_announcements'
        }
    };

    // State
    let isInitialized = false;
    let announcer = null;
    let focusManager = null;
    let keyboardNavigationEnabled = true;

    /**
     * Screen Reader Announcer
     * Manages ARIA live regions for screen reader announcements
     */
    class ScreenReaderAnnouncer {
        constructor() {
            this.politeRegion = null;
            this.assertiveRegion = null;
            this.statusRegion = null;
            this.init();
        }

        init() {
            // Create polite announcement region
            this.politeRegion = this.createLiveRegion('polite', 'sr-announcer-polite');
            
            // Create assertive announcement region
            this.assertiveRegion = this.createLiveRegion('assertive', 'sr-announcer-assertive');
            
            // Create status region
            this.statusRegion = this.createLiveRegion('polite', 'sr-announcer-status');
            this.statusRegion.setAttribute('role', 'status');
        }

        createLiveRegion(politeness, id) {
            const region = document.createElement('div');
            region.id = id;
            region.setAttribute('aria-live', politeness);
            region.setAttribute('aria-atomic', 'true');
            region.className = 'visually-hidden';
            region.style.position = 'absolute';
            region.style.left = '-10000px';
            region.style.width = '1px';
            region.style.height = '1px';
            region.style.overflow = 'hidden';
            
            document.body.appendChild(region);
            return region;
        }

        /**
         * Announce message to screen readers
         * @param {string} message - Message to announce
         * @param {string} priority - 'polite' or 'assertive'
         * @param {number} delay - Delay before announcement (for timing)
         */
        announce(message, priority = 'polite', delay = 100) {
            if (!message || typeof message !== 'string') return;

            const region = priority === 'assertive' ? this.assertiveRegion : this.politeRegion;
            
            // Clear previous message
            region.textContent = '';
            
            // Announce new message after slight delay
            setTimeout(() => {
                region.textContent = message;
                
                // Clear message after announcement
                setTimeout(() => {
                    region.textContent = '';
                }, 1000);
            }, delay);
        }

        /**
         * Announce status change
         * @param {string} status - Status message
         */
        announceStatus(status) {
            if (!status || typeof status !== 'string') return;
            
            this.statusRegion.textContent = status;
            
            setTimeout(() => {
                this.statusRegion.textContent = '';
            }, 2000);
        }

        /**
         * Announce game events
         * @param {string} event - Event type
         * @param {Object} data - Event data
         */
        announceGameEvent(event, data = {}) {
            let message = '';
            
            switch (event) {
                case 'player-moved':
                    // Don't announce every movement to avoid spam
                    break;
                case 'npc-encounter':
                    message = `Encountered ${data.npc}. Press space to interact.`;
                    break;
                case 'item-collected':
                    message = `Collected ${data.item.name}.`;
                    break;
                case 'player-level-up':
                    message = `Congratulations! You reached level ${data.level}.`;
                    break;
                case 'player-damaged':
                    message = `Health reduced to ${data.health}.`;
                    break;
                case 'player-healed':
                    message = `Health restored to ${data.health}.`;
                    break;
                case 'quest-started':
                    message = `New quest: ${data.quest.title}.`;
                    break;
                case 'quest-completed':
                    message = `Quest completed: ${data.quest.title}.`;
                    break;
                case 'location-enter':
                    message = `Entered ${data.location}.`;
                    break;
                default:
                    return;
            }
            
            if (message) {
                this.announce(message, 'polite');
            }
        }
    }

    /**
     * Focus Management
     * Handles focus trapping, restoration, and keyboard navigation
     */
    class FocusManager {
        constructor() {
            this.focusStack = [];
            this.trapStack = [];
            this.init();
        }

        init() {
            this.bindGlobalEvents();
        }

        bindGlobalEvents() {
            // Handle focus-visible for keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Tab') {
                    document.documentElement.classList.add(CONFIG.FOCUS_RING_CLASS);
                }
            });

            document.addEventListener('mousedown', () => {
                document.documentElement.classList.remove(CONFIG.FOCUS_RING_CLASS);
            });

            // Skip link functionality
            const skipLinks = document.querySelectorAll('.skip-link');
            skipLinks.forEach(link => {
                link.addEventListener('click', (e) => {
                    const target = document.querySelector(link.getAttribute('href'));
                    if (target) {
                        e.preventDefault();
                        target.focus();
                        target.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
        }

        /**
         * Store current focus for later restoration
         */
        storeFocus() {
            const activeElement = document.activeElement;
            if (activeElement && activeElement !== document.body) {
                this.focusStack.push(activeElement);
            }
        }

        /**
         * Restore previously stored focus
         */
        restoreFocus() {
            const element = this.focusStack.pop();
            if (element && typeof element.focus === 'function') {
                element.focus();
            }
        }

        /**
         * Trap focus within an element
         * @param {Element} element - Element to trap focus within
         * @returns {Function} Function to release the trap
         */
        trapFocus(element) {
            if (!element) return () => {};

            const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            
            const handleKeyDown = (e) => {
                if (e.key !== 'Tab') return;

                const focusableElements = Array.from(element.querySelectorAll(focusableSelector))
                    .filter(el => !el.disabled && !el.hidden && el.offsetParent !== null);

                if (focusableElements.length === 0) return;

                const firstElement = focusableElements[0];
                const lastElement = focusableElements[focusableElements.length - 1];

                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            };

            element.addEventListener('keydown', handleKeyDown);
            this.trapStack.push({ element, handler: handleKeyDown });

            // Focus first element
            const firstFocusable = element.querySelector(focusableSelector);
            if (firstFocusable) {
                firstFocusable.focus();
            }

            // Return cleanup function
            return () => {
                element.removeEventListener('keydown', handleKeyDown);
                const index = this.trapStack.findIndex(trap => trap.element === element);
                if (index > -1) {
                    this.trapStack.splice(index, 1);
                }
            };
        }

        /**
         * Make element focusable and focus it
         * @param {Element} element - Element to focus
         */
        focusElement(element) {
            if (!element) return;

            if (element.tabIndex < 0) {
                element.tabIndex = -1;
            }
            element.focus();
        }

        /**
         * Set up roving tabindex for a group of elements
         * @param {NodeList|Array} elements - Elements to manage
         * @param {number} activeIndex - Initially active index
         */
        setupRovingTabindex(elements, activeIndex = 0) {
            const elementsArray = Array.from(elements);
            
            elementsArray.forEach((element, index) => {
                element.tabIndex = index === activeIndex ? 0 : -1;
                
                element.addEventListener('keydown', (e) => {
                    let newIndex = index;
                    
                    switch (e.key) {
                        case 'ArrowRight':
                        case 'ArrowDown':
                            e.preventDefault();
                            newIndex = (index + 1) % elementsArray.length;
                            break;
                        case 'ArrowLeft':
                        case 'ArrowUp':
                            e.preventDefault();
                            newIndex = (index - 1 + elementsArray.length) % elementsArray.length;
                            break;
                        case 'Home':
                            e.preventDefault();
                            newIndex = 0;
                            break;
                        case 'End':
                            e.preventDefault();
                            newIndex = elementsArray.length - 1;
                            break;
                        default:
                            return;
                    }
                    
                    // Update tabindex
                    elementsArray.forEach((el, i) => {
                        el.tabIndex = i === newIndex ? 0 : -1;
                    });
                    
                    elementsArray[newIndex].focus();
                });
            });
        }
    }

    /**
     * Theme and Display Settings
     */
    const ThemeManager = {
        /**
         * Toggle high contrast mode
         */
        toggleHighContrast() {
            const isEnabled = document.documentElement.classList.contains(CONFIG.HIGH_CONTRAST_CLASS);
            
            if (isEnabled) {
                document.documentElement.classList.remove(CONFIG.HIGH_CONTRAST_CLASS);
                BibleRPG.Utils.Storage.set(CONFIG.STORAGE_KEYS.HIGH_CONTRAST, false);
                announcer.announceStatus('High contrast mode disabled');
            } else {
                document.documentElement.classList.add(CONFIG.HIGH_CONTRAST_CLASS);
                BibleRPG.Utils.Storage.set(CONFIG.STORAGE_KEYS.HIGH_CONTRAST, true);
                announcer.announceStatus('High contrast mode enabled');
            }
            
            return !isEnabled;
        },

        /**
         * Toggle large text mode
         */
        toggleLargeText() {
            const isEnabled = document.documentElement.classList.contains(CONFIG.LARGE_TEXT_CLASS);
            
            if (isEnabled) {
                document.documentElement.classList.remove(CONFIG.LARGE_TEXT_CLASS);
                BibleRPG.Utils.Storage.set(CONFIG.STORAGE_KEYS.LARGE_TEXT, false);
                announcer.announceStatus('Large text mode disabled');
            } else {
                document.documentElement.classList.add(CONFIG.LARGE_TEXT_CLASS);
                BibleRPG.Utils.Storage.set(CONFIG.STORAGE_KEYS.LARGE_TEXT, true);
                announcer.announceStatus('Large text mode enabled');
            }
            
            return !isEnabled;
        },

        /**
         * Toggle reduced motion mode
         */
        toggleReducedMotion() {
            const isEnabled = document.documentElement.classList.contains(CONFIG.REDUCED_MOTION_CLASS);
            
            if (isEnabled) {
                document.documentElement.classList.remove(CONFIG.REDUCED_MOTION_CLASS);
                BibleRPG.Utils.Storage.set(CONFIG.STORAGE_KEYS.REDUCED_MOTION, false);
                announcer.announceStatus('Animations restored');
            } else {
                document.documentElement.classList.add(CONFIG.REDUCED_MOTION_CLASS);
                BibleRPG.Utils.Storage.set(CONFIG.STORAGE_KEYS.REDUCED_MOTION, true);
                announcer.announceStatus('Animations reduced');
            }
            
            return !isEnabled;
        },

        /**
         * Load saved theme preferences
         */
        loadPreferences() {
            const highContrast = BibleRPG.Utils.Storage.get(CONFIG.STORAGE_KEYS.HIGH_CONTRAST, false);
            const largeText = BibleRPG.Utils.Storage.get(CONFIG.STORAGE_KEYS.LARGE_TEXT, false);
            const reducedMotion = BibleRPG.Utils.Storage.get(CONFIG.STORAGE_KEYS.REDUCED_MOTION, BibleRPG.Utils.prefersReducedMotion());

            if (highContrast) {
                document.documentElement.classList.add(CONFIG.HIGH_CONTRAST_CLASS);
            }

            if (largeText) {
                document.documentElement.classList.add(CONFIG.LARGE_TEXT_CLASS);
            }

            if (reducedMotion) {
                document.documentElement.classList.add(CONFIG.REDUCED_MOTION_CLASS);
            }
        }
    };

    /**
     * Keyboard Navigation Handler
     */
    const KeyboardHandler = {
        /**
         * Set up game-specific keyboard shortcuts
         */
        setupGameControls() {
            document.addEventListener('keydown', (e) => {
                if (!keyboardNavigationEnabled) return;

                // Game controls
                if (typeof BibleRPG.GameEngine !== 'undefined') {
                    const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'Escape'];
                    
                    if (validKeys.includes(e.code)) {
                        // Only handle if not in a form element
                        if (!['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
                            e.preventDefault();
                            BibleRPG.GameEngine.handleInput(e.code);
                        }
                    }
                }

                // Accessibility shortcuts
                if (e.altKey) {
                    switch (e.key) {
                        case 'c':
                            e.preventDefault();
                            ThemeManager.toggleHighContrast();
                            break;
                        case 't':
                            e.preventDefault();
                            ThemeManager.toggleLargeText();
                            break;
                        case 'm':
                            e.preventDefault();
                            ThemeManager.toggleReducedMotion();
                            break;
                    }
                }
            });
        },

        /**
         * Enable/disable keyboard navigation
         * @param {boolean} enabled - Whether to enable keyboard navigation
         */
        setEnabled(enabled) {
            keyboardNavigationEnabled = enabled;
        }
    };

    /**
     * Form Accessibility Enhancements
     */
    const FormAccessibility = {
        /**
         * Enhance all forms with accessibility features
         */
        enhanceAllForms() {
            document.querySelectorAll('form').forEach(form => {
                this.enhanceForm(form);
            });
        },

        /**
         * Enhance a specific form
         * @param {Element} form - Form element to enhance
         */
        enhanceForm(form) {
            // Associate labels with inputs
            const inputs = form.querySelectorAll('input, select, textarea');
            inputs.forEach(input => {
                if (!input.id) {
                    input.id = BibleRPG.Utils.generateId('field');
                }

                // Find associated label
                let label = form.querySelector(`label[for="${input.id}"]`);
                if (!label) {
                    label = input.closest('label');
                }

                if (label && !label.getAttribute('for')) {
                    label.setAttribute('for', input.id);
                }

                // Add aria-describedby for help text
                const helpText = form.querySelector(`[data-help-for="${input.id}"]`);
                if (helpText) {
                    if (!helpText.id) {
                        helpText.id = BibleRPG.Utils.generateId('help');
                    }
                    input.setAttribute('aria-describedby', helpText.id);
                }

                // Add validation attributes
                this.enhanceValidation(input);
            });

            // Handle form submission
            form.addEventListener('submit', (e) => {
                const isValid = this.validateForm(form);
                if (!isValid) {
                    e.preventDefault();
                    this.focusFirstError(form);
                }
            });
        },

        /**
         * Enhance input validation
         * @param {Element} input - Input element
         */
        enhanceValidation(input) {
            input.addEventListener('invalid', (e) => {
                e.preventDefault();
                this.showValidationError(input);
            });

            input.addEventListener('input', () => {
                if (input.validity.valid) {
                    this.clearValidationError(input);
                }
            });
        },

        /**
         * Show validation error
         * @param {Element} input - Input element with error
         */
        showValidationError(input) {
            const errorId = `${input.id}-error`;
            let errorElement = document.getElementById(errorId);

            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.id = errorId;
                errorElement.className = 'form-error';
                errorElement.setAttribute('role', 'alert');
                input.parentNode.appendChild(errorElement);
            }

            errorElement.textContent = input.validationMessage;
            input.setAttribute('aria-describedby', errorId);
            input.setAttribute('aria-invalid', 'true');

            announcer.announce(`Error: ${input.validationMessage}`, 'assertive');
        },

        /**
         * Clear validation error
         * @param {Element} input - Input element
         */
        clearValidationError(input) {
            const errorId = `${input.id}-error`;
            const errorElement = document.getElementById(errorId);

            if (errorElement) {
                errorElement.remove();
            }

            input.removeAttribute('aria-describedby');
            input.removeAttribute('aria-invalid');
        },

        /**
         * Validate entire form
         * @param {Element} form - Form to validate
         * @returns {boolean} Whether form is valid
         */
        validateForm(form) {
            const inputs = form.querySelectorAll('input, select, textarea');
            let isValid = true;

            inputs.forEach(input => {
                if (!input.validity.valid) {
                    this.showValidationError(input);
                    isValid = false;
                }
            });

            return isValid;
        },

        /**
         * Focus first error in form
         * @param {Element} form - Form element
         */
        focusFirstError(form) {
            const firstError = form.querySelector('[aria-invalid="true"]');
            if (firstError) {
                firstError.focus();
            }
        }
    };

    /**
     * Game Canvas Accessibility
     */
    const CanvasAccessibility = {
        /**
         * Make game canvas accessible
         * @param {Element} canvas - Canvas element
         */
        enhanceCanvas(canvas) {
            if (!canvas) return;

            // Add keyboard support
            canvas.setAttribute('tabindex', '0');
            canvas.setAttribute('role', 'application');
            
            // Provide text alternative
            if (!canvas.getAttribute('aria-label')) {
                canvas.setAttribute('aria-label', 'Bible RPG game world. Use arrow keys to move, space to interact.');
            }

            // Add game state descriptions
            if (typeof BibleRPG.GameEngine !== 'undefined') {
                BibleRPG.GameEngine.GameEvents.on('player-moved', (data) => {
                    this.announcePosition(data);
                });

                BibleRPG.GameEngine.GameEvents.on('location-enter', (data) => {
                    announcer.announce(`Entered ${data.location}`, 'polite');
                });
            }

            // Handle focus
            canvas.addEventListener('focus', () => {
                announcer.announce('Game canvas focused. Use arrow keys to move your character.', 'polite');
            });
        },

        /**
         * Announce player position
         * @param {Object} data - Position data
         */
        announcePosition(data) {
            // Only announce position occasionally to avoid spam
            if (Math.random() < 0.1) { // 10% chance
                announcer.announce(`Position ${data.x}, ${data.y}`, 'polite');
            }
        }
    };

    /**
     * Initialize accessibility features
     */
    const initialize = () => {
        if (isInitialized) return;

        // Create instances
        announcer = new ScreenReaderAnnouncer();
        focusManager = new FocusManager();

        // Load preferences
        ThemeManager.loadPreferences();

        // Set up keyboard controls
        KeyboardHandler.setupGameControls();

        // Enhance forms
        FormAccessibility.enhanceAllForms();

        // Enhance canvas
        const gameCanvas = document.getElementById('gameCanvas');
        CanvasAccessibility.enhanceCanvas(gameCanvas);

        // Set up accessibility control buttons
        setupAccessibilityControls();

        // Bind game events
        bindGameEvents();

        isInitialized = true;

        // Announce initialization
        setTimeout(() => {
            announcer.announce('Bible RPG loaded. Accessibility features enabled.', 'polite');
        }, 1000);
    };

    /**
     * Set up accessibility control buttons
     */
    const setupAccessibilityControls = () => {
        const themeToggle = document.getElementById('theme-toggle');
        const textSizeToggle = document.getElementById('text-size-toggle');

        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                ThemeManager.toggleHighContrast();
            });
        }

        if (textSizeToggle) {
            textSizeToggle.addEventListener('click', () => {
                ThemeManager.toggleLargeText();
            });
        }
    };

    /**
     * Bind game events for accessibility announcements
     */
    const bindGameEvents = () => {
        if (typeof BibleRPG.GameEngine === 'undefined') return;

        const gameEvents = [
            'npc-encounter',
            'item-collected',
            'player-level-up',
            'player-damaged',
            'player-healed',
            'quest-started',
            'quest-completed',
            'location-enter'
        ];

        gameEvents.forEach(event => {
            BibleRPG.GameEngine.GameEvents.on(event, (data) => {
                announcer.announceGameEvent(event, data);
            });
        });
    };

    // Public API
    return {
        initialize,
        ScreenReaderAnnouncer,
        FocusManager,
        ThemeManager,
        KeyboardHandler,
        FormAccessibility,
        CanvasAccessibility,
        
        // Getters
        get announcer() { return announcer; },
        get focusManager() { return focusManager; },
        get isInitialized() { return isInitialized; },
        
        // Utilities
        announce: (message, priority) => announcer?.announce(message, priority),
        storeFocus: () => focusManager?.storeFocus(),
        restoreFocus: () => focusManager?.restoreFocus(),
        trapFocus: (element) => focusManager?.trapFocus(element)
    };

})();