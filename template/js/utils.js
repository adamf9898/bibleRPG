/**
 * Bible RPG Template - Utility Functions
 * Version: 1.0.0
 * Description: Core utility functions and helpers for the Bible RPG template
 */

'use strict';

/**
 * Namespace for all Bible RPG utilities
 * @namespace BibleRPG
 */
const BibleRPG = window.BibleRPG || {};

/**
 * Utility functions module
 * @namespace BibleRPG.Utils
 */
BibleRPG.Utils = (function() {
    
    /**
     * Debounce function to limit the rate of function execution
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @param {boolean} immediate - Execute immediately on first call
     * @returns {Function} Debounced function
     */
    const debounce = (func, wait, immediate = false) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    };

    /**
     * Throttle function to limit function execution rate
     * @param {Function} func - Function to throttle
     * @param {number} limit - Limit in milliseconds
     * @returns {Function} Throttled function
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    /**
     * Deep clone an object or array
     * @param {*} obj - Object to clone
     * @returns {*} Cloned object
     */
    const deepClone = (obj) => {
        if (obj === null || typeof obj !== 'object') return obj;
        if (obj instanceof Date) return new Date(obj.getTime());
        if (obj instanceof Array) return obj.map(item => deepClone(item));
        if (typeof obj === 'object') {
            const copy = {};
            Object.keys(obj).forEach(key => {
                copy[key] = deepClone(obj[key]);
            });
            return copy;
        }
    };

    /**
     * Generate a unique ID
     * @param {string} prefix - Optional prefix for the ID
     * @returns {string} Unique ID
     */
    const generateId = (prefix = 'id') => {
        return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now().toString(36)}`;
    };

    /**
     * Format number with thousands separator
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    /**
     * Clamp a number between min and max values
     * @param {number} num - Number to clamp
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} Clamped number
     */
    const clamp = (num, min, max) => {
        return Math.min(Math.max(num, min), max);
    };

    /**
     * Linear interpolation between two values
     * @param {number} start - Start value
     * @param {number} end - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} Interpolated value
     */
    const lerp = (start, end, t) => {
        return start + (end - start) * clamp(t, 0, 1);
    };

    /**
     * Map a value from one range to another
     * @param {number} value - Value to map
     * @param {number} inMin - Input minimum
     * @param {number} inMax - Input maximum
     * @param {number} outMin - Output minimum
     * @param {number} outMax - Output maximum
     * @returns {number} Mapped value
     */
    const mapRange = (value, inMin, inMax, outMin, outMax) => {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    };

    /**
     * Check if device supports touch
     * @returns {boolean} True if touch is supported
     */
    const isTouchDevice = () => {
        return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    };

    /**
     * Check if device is mobile
     * @returns {boolean} True if mobile device
     */
    const isMobile = () => {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    /**
     * Get device type
     * @returns {string} Device type: 'mobile', 'tablet', or 'desktop'
     */
    const getDeviceType = () => {
        const width = window.innerWidth;
        if (width < 768) return 'mobile';
        if (width < 1024) return 'tablet';
        return 'desktop';
    };

    /**
     * Check if user prefers reduced motion
     * @returns {boolean} True if reduced motion is preferred
     */
    const prefersReducedMotion = () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    };

    /**
     * Check if user prefers dark mode
     * @returns {boolean} True if dark mode is preferred
     */
    const prefersDarkMode = () => {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    /**
     * Get CSS custom property value
     * @param {string} property - CSS custom property name
     * @param {Element} element - Element to get property from (defaults to document.documentElement)
     * @returns {string} Property value
     */
    const getCSSProperty = (property, element = document.documentElement) => {
        return getComputedStyle(element).getPropertyValue(property).trim();
    };

    /**
     * Set CSS custom property value
     * @param {string} property - CSS custom property name
     * @param {string} value - Property value
     * @param {Element} element - Element to set property on (defaults to document.documentElement)
     */
    const setCSSProperty = (property, value, element = document.documentElement) => {
        element.style.setProperty(property, value);
    };

    /**
     * Load script dynamically
     * @param {string} src - Script source URL
     * @param {Object} options - Loading options
     * @returns {Promise} Promise that resolves when script is loaded
     */
    const loadScript = (src, options = {}) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.async = options.async !== false;
            script.defer = options.defer || false;
            
            script.onload = () => resolve(script);
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            
            if (options.attributes) {
                Object.entries(options.attributes).forEach(([key, value]) => {
                    script.setAttribute(key, value);
                });
            }
            
            document.head.appendChild(script);
        });
    };

    /**
     * Load CSS dynamically
     * @param {string} href - CSS file URL
     * @param {Object} options - Loading options
     * @returns {Promise} Promise that resolves when CSS is loaded
     */
    const loadCSS = (href, options = {}) => {
        return new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            
            link.onload = () => resolve(link);
            link.onerror = () => reject(new Error(`Failed to load CSS: ${href}`));
            
            if (options.media) link.media = options.media;
            if (options.attributes) {
                Object.entries(options.attributes).forEach(([key, value]) => {
                    link.setAttribute(key, value);
                });
            }
            
            document.head.appendChild(link);
        });
    };

    /**
     * Storage utilities
     */
    const Storage = {
        /**
         * Set item in localStorage with optional expiration
         * @param {string} key - Storage key
         * @param {*} value - Value to store
         * @param {number} ttl - Time to live in milliseconds
         */
        set(key, value, ttl) {
            const item = {
                value,
                timestamp: Date.now(),
                ttl
            };
            try {
                localStorage.setItem(key, JSON.stringify(item));
            } catch (error) {
                console.warn('localStorage.setItem failed:', error);
            }
        },

        /**
         * Get item from localStorage
         * @param {string} key - Storage key
         * @param {*} defaultValue - Default value if key doesn't exist
         * @returns {*} Stored value or default
         */
        get(key, defaultValue = null) {
            try {
                const item = localStorage.getItem(key);
                if (!item) return defaultValue;
                
                const parsed = JSON.parse(item);
                
                // Check if item has expired
                if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
                    localStorage.removeItem(key);
                    return defaultValue;
                }
                
                return parsed.value;
            } catch (error) {
                console.warn('localStorage.getItem failed:', error);
                return defaultValue;
            }
        },

        /**
         * Remove item from localStorage
         * @param {string} key - Storage key
         */
        remove(key) {
            try {
                localStorage.removeItem(key);
            } catch (error) {
                console.warn('localStorage.removeItem failed:', error);
            }
        },

        /**
         * Clear all localStorage
         */
        clear() {
            try {
                localStorage.clear();
            } catch (error) {
                console.warn('localStorage.clear failed:', error);
            }
        }
    };

    /**
     * Event utilities
     */
    const Events = {
        /**
         * Add event listener with automatic cleanup
         * @param {Element} element - Element to add listener to
         * @param {string} event - Event name
         * @param {Function} handler - Event handler
         * @param {Object} options - Event options
         * @returns {Function} Cleanup function
         */
        on(element, event, handler, options = {}) {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
        },

        /**
         * Add event listener that fires once
         * @param {Element} element - Element to add listener to
         * @param {string} event - Event name
         * @param {Function} handler - Event handler
         * @param {Object} options - Event options
         */
        once(element, event, handler, options = {}) {
            const cleanup = this.on(element, event, function(...args) {
                cleanup();
                handler.apply(this, args);
            }, options);
        },

        /**
         * Create custom event
         * @param {string} name - Event name
         * @param {*} detail - Event detail data
         * @param {Object} options - Event options
         * @returns {CustomEvent} Custom event
         */
        create(name, detail = null, options = {}) {
            return new CustomEvent(name, {
                detail,
                bubbles: options.bubbles !== false,
                cancelable: options.cancelable !== false,
                ...options
            });
        },

        /**
         * Emit custom event
         * @param {Element} element - Element to emit event on
         * @param {string} name - Event name
         * @param {*} detail - Event detail data
         * @param {Object} options - Event options
         */
        emit(element, name, detail = null, options = {}) {
            const event = this.create(name, detail, options);
            element.dispatchEvent(event);
        }
    };

    /**
     * Animation utilities
     */
    const Animation = {
        /**
         * Request animation frame with fallback
         * @param {Function} callback - Animation callback
         * @returns {number} Animation frame ID
         */
        frame(callback) {
            return requestAnimationFrame(callback);
        },

        /**
         * Cancel animation frame
         * @param {number} id - Animation frame ID
         */
        cancelFrame(id) {
            cancelAnimationFrame(id);
        },

        /**
         * Simple animation function
         * @param {Object} options - Animation options
         * @returns {Object} Animation controller
         */
        animate(options) {
            const {
                duration = 1000,
                easing = t => t,
                onUpdate = () => {},
                onComplete = () => {}
            } = options;

            let startTime = null;
            let animationId = null;
            let isRunning = false;

            const step = (currentTime) => {
                if (!startTime) startTime = currentTime;
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easing(progress);

                onUpdate(easedProgress);

                if (progress < 1 && isRunning) {
                    animationId = this.frame(step);
                } else {
                    isRunning = false;
                    onComplete();
                }
            };

            return {
                start() {
                    if (!isRunning) {
                        isRunning = true;
                        startTime = null;
                        animationId = this.frame(step);
                    }
                },
                stop() {
                    isRunning = false;
                    if (animationId) {
                        this.cancelFrame(animationId);
                        animationId = null;
                    }
                },
                isRunning() {
                    return isRunning;
                }
            };
        }
    };

    // Public API
    return {
        debounce,
        throttle,
        deepClone,
        generateId,
        formatNumber,
        clamp,
        lerp,
        mapRange,
        isTouchDevice,
        isMobile,
        getDeviceType,
        prefersReducedMotion,
        prefersDarkMode,
        getCSSProperty,
        setCSSProperty,
        loadScript,
        loadCSS,
        Storage,
        Events,
        Animation
    };

})();

// Make BibleRPG available globally
window.BibleRPG = BibleRPG;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BibleRPG.Utils;
}