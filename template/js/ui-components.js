/**
 * Bible RPG Template - UI Components
 * Version: 1.0.0
 * Description: Modular UI components with accessibility features
 */

'use strict';

/**
 * UI Components module for Bible RPG
 * @namespace BibleRPG.UI
 */
BibleRPG.UI = (function() {
    
    // Component registry
    const components = new Map();
    
    /**
     * Base Component class
     */
    class Component {
        constructor(element, options = {}) {
            if (typeof element === 'string') {
                this.element = document.querySelector(element);
            } else {
                this.element = element;
            }
            
            if (!this.element) {
                throw new Error('Component element not found');
            }
            
            this.options = { ...this.defaultOptions, ...options };
            this.isInitialized = false;
            this.listeners = [];
            
            this.init();
        }
        
        get defaultOptions() {
            return {};
        }
        
        init() {
            if (this.isInitialized) return;
            
            this.bindEvents();
            this.render();
            this.isInitialized = true;
            
            // Register component
            const componentId = this.element.id || BibleRPG.Utils.generateId('component');
            components.set(componentId, this);
        }
        
        bindEvents() {
            // Override in subclasses
        }
        
        render() {
            // Override in subclasses
        }
        
        addEventListener(event, handler, options = {}) {
            const cleanup = BibleRPG.Utils.Events.on(this.element, event, handler, options);
            this.listeners.push(cleanup);
            return cleanup;
        }
        
        destroy() {
            // Clean up event listeners
            this.listeners.forEach(cleanup => cleanup());
            this.listeners = [];
            
            // Remove from registry
            const componentId = this.element.id || BibleRPG.Utils.generateId('component');
            components.delete(componentId);
            
            this.isInitialized = false;
        }
        
        emit(eventName, detail = null) {
            BibleRPG.Utils.Events.emit(this.element, eventName, detail);
        }
        
        show() {
            this.element.style.display = '';
            this.element.setAttribute('aria-hidden', 'false');
        }
        
        hide() {
            this.element.style.display = 'none';
            this.element.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Modal component
     */
    class Modal extends Component {
        get defaultOptions() {
            return {
                closeOnEscape: true,
                closeOnBackdrop: true,
                autoFocus: true,
                restoreFocus: true
            };
        }
        
        init() {
            super.init();
            this.previousFocus = null;
            this.isOpen = false;
        }
        
        bindEvents() {
            // Close button
            const closeBtn = this.element.querySelector('.modal-close');
            if (closeBtn) {
                this.addEventListener('click', (e) => {
                    if (e.target === closeBtn) {
                        this.close();
                    }
                });
            }
            
            // Backdrop click
            if (this.options.closeOnBackdrop) {
                const overlay = this.element.querySelector('.modal-overlay');
                if (overlay) {
                    this.addEventListener('click', (e) => {
                        if (e.target === overlay) {
                            this.close();
                        }
                    });
                }
            }
            
            // Escape key
            if (this.options.closeOnEscape) {
                this.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen) {
                        this.close();
                    }
                });
            }
            
            // Trap focus
            this.addEventListener('keydown', (e) => {
                if (e.key === 'Tab' && this.isOpen) {
                    this.trapFocus(e);
                }
            });
        }
        
        open() {
            if (this.isOpen) return;
            
            this.previousFocus = document.activeElement;
            this.isOpen = true;
            
            this.element.style.display = 'flex';
            this.element.setAttribute('aria-hidden', 'false');
            
            if (this.options.autoFocus) {
                const firstFocusable = this.getFirstFocusableElement();
                if (firstFocusable) {
                    firstFocusable.focus();
                } else {
                    this.element.focus();
                }
            }
            
            // Prevent body scroll
            document.body.style.overflow = 'hidden';
            
            this.emit('modal:opened');
        }
        
        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            this.element.style.display = 'none';
            this.element.setAttribute('aria-hidden', 'true');
            
            // Restore body scroll
            document.body.style.overflow = '';
            
            // Restore focus
            if (this.options.restoreFocus && this.previousFocus) {
                this.previousFocus.focus();
            }
            
            this.emit('modal:closed');
        }
        
        trapFocus(e) {
            const focusableElements = this.getFocusableElements();
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
        }
        
        getFocusableElements() {
            const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
            return Array.from(this.element.querySelectorAll(selector))
                .filter(el => !el.disabled && !el.hidden);
        }
        
        getFirstFocusableElement() {
            return this.getFocusableElements()[0] || null;
        }
    }

    /**
     * Progress Bar component
     */
    class ProgressBar extends Component {
        get defaultOptions() {
            return {
                min: 0,
                max: 100,
                value: 0,
                animated: false,
                striped: false,
                label: true
            };
        }
        
        init() {
            super.init();
            this.currentValue = this.options.value;
        }
        
        render() {
            const { min, max, animated, striped, label } = this.options;
            
            this.element.setAttribute('role', 'progressbar');
            this.element.setAttribute('aria-valuemin', min);
            this.element.setAttribute('aria-valuemax', max);
            this.element.setAttribute('aria-valuenow', this.currentValue);
            
            if (!this.element.querySelector('.progress-bar')) {
                const progressBar = document.createElement('div');
                progressBar.className = `progress-bar${striped ? ' progress-striped' : ''}${animated ? ' progress-animated' : ''}`;
                this.element.appendChild(progressBar);
            }
            
            this.updateProgress();
        }
        
        setValue(value, animate = true) {
            const { min, max } = this.options;
            this.currentValue = BibleRPG.Utils.clamp(value, min, max);
            
            this.element.setAttribute('aria-valuenow', this.currentValue);
            
            if (animate && !BibleRPG.Utils.prefersReducedMotion()) {
                this.animateProgress();
            } else {
                this.updateProgress();
            }
            
            this.emit('progress:changed', { value: this.currentValue });
        }
        
        updateProgress() {
            const { min, max } = this.options;
            const percentage = ((this.currentValue - min) / (max - min)) * 100;
            
            const progressBar = this.element.querySelector('.progress-bar');
            if (progressBar) {
                progressBar.style.width = `${percentage}%`;
            }
        }
        
        animateProgress() {
            const { min, max } = this.options;
            const targetPercentage = ((this.currentValue - min) / (max - min)) * 100;
            const progressBar = this.element.querySelector('.progress-bar');
            
            if (!progressBar) return;
            
            const currentWidth = parseFloat(progressBar.style.width) || 0;
            
            BibleRPG.Utils.Animation.animate({
                duration: 500,
                easing: t => t * t * (3 - 2 * t), // Smooth step
                onUpdate: (progress) => {
                    const width = BibleRPG.Utils.lerp(currentWidth, targetPercentage, progress);
                    progressBar.style.width = `${width}%`;
                }
            }).start();
        }
    }

    /**
     * Notification component
     */
    class Notification extends Component {
        get defaultOptions() {
            return {
                type: 'info', // 'success', 'warning', 'error', 'info'
                autoClose: true,
                duration: 5000,
                closable: true,
                position: 'top-right'
            };
        }
        
        render() {
            const { type, closable } = this.options;
            
            this.element.className = `notification notification-${type}`;
            this.element.setAttribute('role', 'alert');
            this.element.setAttribute('aria-live', 'assertive');
            
            if (closable) {
                const closeBtn = document.createElement('button');
                closeBtn.className = 'notification-close btn btn-ghost btn-sm';
                closeBtn.innerHTML = '&times;';
                closeBtn.setAttribute('aria-label', 'Close notification');
                this.element.appendChild(closeBtn);
            }
            
            this.show();
        }
        
        bindEvents() {
            if (this.options.closable) {
                const closeBtn = this.element.querySelector('.notification-close');
                if (closeBtn) {
                    this.addEventListener('click', (e) => {
                        if (e.target === closeBtn) {
                            this.close();
                        }
                    });
                }
            }
            
            if (this.options.autoClose) {
                setTimeout(() => this.close(), this.options.duration);
            }
        }
        
        show() {
            super.show();
            
            // Add to notification container
            let container = document.querySelector('.notification-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'notification-container';
                document.body.appendChild(container);
            }
            
            container.appendChild(this.element);
            
            // Animate in
            requestAnimationFrame(() => {
                this.element.style.opacity = '1';
                this.element.style.transform = 'translateX(0)';
            });
        }
        
        close() {
            // Animate out
            this.element.style.opacity = '0';
            this.element.style.transform = 'translateX(100%)';
            
            setTimeout(() => {
                if (this.element.parentNode) {
                    this.element.parentNode.removeChild(this.element);
                }
                this.destroy();
            }, 300);
            
            this.emit('notification:closed');
        }
        
        static show(message, options = {}) {
            const notification = document.createElement('div');
            notification.innerHTML = `
                <div class="notification-content">
                    <div class="notification-message">${message}</div>
                </div>
            `;
            
            return new Notification(notification, options);
        }
    }

    /**
     * Dropdown component
     */
    class Dropdown extends Component {
        get defaultOptions() {
            return {
                trigger: 'click', // 'click', 'hover'
                closeOnClickOutside: true,
                closeOnEscape: true
            };
        }
        
        init() {
            super.init();
            this.isOpen = false;
            this.trigger = this.element.querySelector('[data-dropdown-trigger]');
            this.menu = this.element.querySelector('.dropdown-menu');
            
            if (!this.trigger || !this.menu) {
                throw new Error('Dropdown requires trigger and menu elements');
            }
        }
        
        bindEvents() {
            const { trigger, closeOnClickOutside, closeOnEscape } = this.options;
            
            if (trigger === 'click') {
                this.addEventListener('click', (e) => {
                    if (this.trigger.contains(e.target)) {
                        e.preventDefault();
                        this.toggle();
                    }
                });
            } else if (trigger === 'hover') {
                this.addEventListener('mouseenter', () => this.open());
                this.addEventListener('mouseleave', () => this.close());
            }
            
            // Menu item clicks
            this.addEventListener('click', (e) => {
                if (e.target.matches('.dropdown-item')) {
                    this.emit('dropdown:item-selected', { item: e.target });
                    this.close();
                }
            });
            
            // Close on outside click
            if (closeOnClickOutside) {
                document.addEventListener('click', (e) => {
                    if (!this.element.contains(e.target) && this.isOpen) {
                        this.close();
                    }
                });
            }
            
            // Close on escape
            if (closeOnEscape) {
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape' && this.isOpen) {
                        this.close();
                    }
                });
            }
            
            // Arrow key navigation
            this.addEventListener('keydown', (e) => {
                if (this.isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    e.preventDefault();
                    this.navigateItems(e.key === 'ArrowDown' ? 1 : -1);
                }
            });
        }
        
        open() {
            if (this.isOpen) return;
            
            this.isOpen = true;
            this.element.classList.add('open');
            this.trigger.setAttribute('aria-expanded', 'true');
            this.menu.style.display = 'block';
            
            this.emit('dropdown:opened');
        }
        
        close() {
            if (!this.isOpen) return;
            
            this.isOpen = false;
            this.element.classList.remove('open');
            this.trigger.setAttribute('aria-expanded', 'false');
            this.menu.style.display = 'none';
            
            this.emit('dropdown:closed');
        }
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        }
        
        navigateItems(direction) {
            const items = Array.from(this.menu.querySelectorAll('.dropdown-item:not(:disabled)'));
            const currentIndex = items.indexOf(document.activeElement);
            
            let nextIndex;
            if (currentIndex === -1) {
                nextIndex = direction > 0 ? 0 : items.length - 1;
            } else {
                nextIndex = (currentIndex + direction + items.length) % items.length;
            }
            
            if (items[nextIndex]) {
                items[nextIndex].focus();
            }
        }
    }

    /**
     * Tabs component
     */
    class Tabs extends Component {
        init() {
            super.init();
            this.tabButtons = Array.from(this.element.querySelectorAll('.tab-button'));
            this.tabPanels = Array.from(this.element.querySelectorAll('.tab-panel'));
            this.activeIndex = 0;
            
            // Set initial active tab
            const activeButton = this.element.querySelector('.tab-button[aria-selected="true"]');
            if (activeButton) {
                this.activeIndex = this.tabButtons.indexOf(activeButton);
            }
            
            this.render();
        }
        
        bindEvents() {
            this.tabButtons.forEach((button, index) => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.setActiveTab(index);
                });
                
                button.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                        e.preventDefault();
                        const direction = e.key === 'ArrowRight' ? 1 : -1;
                        const nextIndex = (index + direction + this.tabButtons.length) % this.tabButtons.length;
                        this.setActiveTab(nextIndex);
                        this.tabButtons[nextIndex].focus();
                    }
                });
            });
        }
        
        render() {
            this.tabButtons.forEach((button, index) => {
                const isActive = index === this.activeIndex;
                button.setAttribute('aria-selected', isActive.toString());
                button.setAttribute('tabindex', isActive ? '0' : '-1');
            });
            
            this.tabPanels.forEach((panel, index) => {
                const isActive = index === this.activeIndex;
                panel.hidden = !isActive;
                panel.setAttribute('aria-hidden', (!isActive).toString());
            });
        }
        
        setActiveTab(index) {
            if (index < 0 || index >= this.tabButtons.length) return;
            
            const previousIndex = this.activeIndex;
            this.activeIndex = index;
            this.render();
            
            this.emit('tab:changed', { 
                activeIndex: index, 
                previousIndex,
                activePanel: this.tabPanels[index]
            });
        }
    }

    /**
     * HUD (Heads-Up Display) Manager
     */
    class HUDManager {
        constructor() {
            this.elements = {
                health: null,
                xp: null,
                inventory: null,
                questLog: null
            };
            
            this.init();
        }
        
        init() {
            // Find HUD elements
            this.elements.health = document.getElementById('health-value');
            this.elements.xp = document.getElementById('xp-value');
            this.elements.inventory = document.getElementById('inventory-btn');
            this.elements.questLog = document.getElementById('quest-log-content');
            
            // Initialize progress bars
            const healthBar = document.querySelector('.health-bar .progress-bar');
            const xpBar = document.querySelector('.xp-bar .progress-bar');
            
            if (healthBar) {
                this.healthProgress = new ProgressBar(healthBar);
            }
            
            if (xpBar) {
                this.xpProgress = new ProgressBar(xpBar);
            }
            
            this.bindGameEvents();
        }
        
        bindGameEvents() {
            if (typeof BibleRPG.GameEngine !== 'undefined') {
                BibleRPG.GameEngine.GameEvents.on('player-damaged', (data) => {
                    this.updateHealth(data.health);
                });
                
                BibleRPG.GameEngine.GameEvents.on('player-healed', (data) => {
                    this.updateHealth(data.health);
                });
                
                BibleRPG.GameEngine.GameEvents.on('xp-gained', (data) => {
                    this.updateXP(data.total);
                });
                
                BibleRPG.GameEngine.GameEvents.on('item-collected', (data) => {
                    this.showNotification(`Collected: ${data.item.name}`, 'success');
                });
                
                BibleRPG.GameEngine.GameEvents.on('player-level-up', (data) => {
                    this.showNotification(`Level Up! You are now level ${data.level}`, 'success');
                });
            }
        }
        
        updateHealth(health) {
            if (this.elements.health) {
                this.elements.health.textContent = Math.round(health);
            }
            
            if (this.healthProgress) {
                this.healthProgress.setValue(health);
            }
        }
        
        updateXP(xp) {
            if (this.elements.xp) {
                this.elements.xp.textContent = Math.round(xp);
            }
            
            if (this.xpProgress) {
                const level = Math.floor(xp / 100);
                const levelXP = xp % 100;
                this.xpProgress.setValue(levelXP);
            }
        }
        
        showNotification(message, type = 'info') {
            Notification.show(message, { type, duration: 3000 });
        }
        
        updateQuestLog(quests) {
            if (!this.elements.questLog) return;
            
            if (quests.length === 0) {
                this.elements.questLog.innerHTML = '<p class="placeholder-text">No active quests</p>';
                return;
            }
            
            const questHTML = quests.map(quest => `
                <div class="quest-item">
                    <h4>${quest.title}</h4>
                    <p>${quest.description}</p>
                    <div class="quest-progress">
                        <small>${quest.progress}/${quest.total} completed</small>
                    </div>
                </div>
            `).join('');
            
            this.elements.questLog.innerHTML = questHTML;
        }
    }

    /**
     * Initialize all UI components
     */
    const initialize = () => {
        // Auto-initialize components with data attributes
        document.querySelectorAll('[data-component]').forEach(element => {
            const componentType = element.getAttribute('data-component');
            const options = element.hasAttribute('data-options') 
                ? JSON.parse(element.getAttribute('data-options'))
                : {};
            
            createComponent(componentType, element, options);
        });
        
        // Initialize HUD
        const hudManager = new HUDManager();
        
        return hudManager;
    };

    /**
     * Create a component instance
     * @param {string} type - Component type
     * @param {Element} element - DOM element
     * @param {Object} options - Component options
     * @returns {Component} Component instance
     */
    const createComponent = (type, element, options = {}) => {
        const componentClasses = {
            'modal': Modal,
            'progress-bar': ProgressBar,
            'notification': Notification,
            'dropdown': Dropdown,
            'tabs': Tabs
        };
        
        const ComponentClass = componentClasses[type];
        if (!ComponentClass) {
            console.warn(`Unknown component type: ${type}`);
            return null;
        }
        
        return new ComponentClass(element, options);
    };

    /**
     * Get component instance by element or ID
     * @param {string|Element} elementOrId - Element or element ID
     * @returns {Component|null} Component instance
     */
    const getComponent = (elementOrId) => {
        const id = typeof elementOrId === 'string' ? elementOrId : elementOrId.id;
        return components.get(id) || null;
    };

    // Public API
    return {
        Component,
        Modal,
        ProgressBar,
        Notification,
        Dropdown,
        Tabs,
        HUDManager,
        initialize,
        createComponent,
        getComponent
    };

})();