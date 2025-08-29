/**
 * Bible RPG Template - Game Engine
 * Version: 1.0.0
 * Description: Core game engine with modular architecture and biblical themes
 */

'use strict';

/**
 * Game Engine module for Bible RPG
 * @namespace BibleRPG.GameEngine
 */
BibleRPG.GameEngine = (function() {
    
    // Private variables
    let gameState = null;
    let canvas = null;
    let context = null;
    let isRunning = false;
    let lastFrameTime = 0;
    let deltaTime = 0;
    
    // Game configuration
    const CONFIG = {
        TILE_SIZE: 32,
        MAP_WIDTH: 20,
        MAP_HEIGHT: 15,
        TARGET_FPS: 60,
        MAX_DELTA_TIME: 1000 / 30, // Cap at 30 FPS minimum
        SAVE_KEY: 'bibleRPG_save'
    };

    // Tile types enumeration
    const TILE_TYPES = {
        GRASS: 0,
        TREE: 1,
        WATER: 2,
        PATH: 3,
        NPC_MOSES: 4,
        NPC_DAVID: 5,
        HOLY_ITEM: 6,
        TEMPLE: 7,
        MOUNTAIN: 8,
        DESERT: 9
    };

    // Game states enumeration
    const GAME_STATES = {
        LOADING: 'loading',
        MENU: 'menu',
        PLAYING: 'playing',
        PAUSED: 'paused',
        DIALOGUE: 'dialogue',
        INVENTORY: 'inventory',
        GAME_OVER: 'game_over'
    };

    /**
     * Player class representing the game character
     */
    class Player {
        constructor(x = 1, y = 1) {
            this.x = x;
            this.y = y;
            this.px = x; // Previous position for smooth animation
            this.py = y;
            this.moving = false;
            this.moveDir = null;
            this.moveProgress = 0;
            this.health = 100;
            this.maxHealth = 100;
            this.xp = 0;
            this.level = 1;
            this.faith = 0;
            this.wisdom = 0;
            this.compassion = 0;
            this.inventory = [];
            this.quests = [];
            this.miracles = [];
            this.visitedLocations = new Set();
            this.color = '#4a7a3c';
        }

        /**
         * Move player in specified direction
         * @param {string} direction - Direction to move ('up', 'down', 'left', 'right')
         * @returns {boolean} True if movement is valid
         */
        move(direction) {
            if (this.moving) return false;

            let newX = this.x;
            let newY = this.y;

            switch (direction) {
                case 'up': newY--; break;
                case 'down': newY++; break;
                case 'left': newX--; break;
                case 'right': newX++; break;
                default: return false;
            }

            // Check bounds and collision
            if (newX < 0 || newX >= CONFIG.MAP_WIDTH || 
                newY < 0 || newY >= CONFIG.MAP_HEIGHT) {
                return false;
            }

            const tile = gameState.map[newY][newX];
            if (tile === TILE_TYPES.WATER || tile === TILE_TYPES.TREE) {
                return false; // Blocked tiles
            }

            // Start movement animation
            this.px = this.x;
            this.py = this.y;
            this.x = newX;
            this.y = newY;
            this.moving = true;
            this.moveDir = direction;
            this.moveProgress = 0;

            // Mark location as visited
            this.visitedLocations.add(`${newX},${newY}`);

            // Trigger events based on tile type
            this.handleTileInteraction(tile);

            return true;
        }

        /**
         * Handle interaction with different tile types
         * @param {number} tileType - Type of tile being stepped on
         */
        handleTileInteraction(tileType) {
            switch (tileType) {
                case TILE_TYPES.NPC_MOSES:
                    GameEvents.trigger('npc-encounter', { npc: 'Moses', x: this.x, y: this.y });
                    break;
                case TILE_TYPES.NPC_DAVID:
                    GameEvents.trigger('npc-encounter', { npc: 'David', x: this.x, y: this.y });
                    break;
                case TILE_TYPES.HOLY_ITEM:
                    this.collectItem({ type: 'holy', name: 'Blessed Scroll', value: 'wisdom' });
                    break;
                case TILE_TYPES.TEMPLE:
                    GameEvents.trigger('location-enter', { location: 'Temple', x: this.x, y: this.y });
                    break;
                case TILE_TYPES.MOUNTAIN:
                    GameEvents.trigger('location-enter', { location: 'Mount Sinai', x: this.x, y: this.y });
                    break;
            }
        }

        /**
         * Collect an item and add to inventory
         * @param {Object} item - Item to collect
         */
        collectItem(item) {
            this.inventory.push({
                ...item,
                id: BibleRPG.Utils.generateId('item'),
                collected: Date.now()
            });

            // Apply item effects
            if (item.value === 'wisdom') this.wisdom += 10;
            if (item.value === 'faith') this.faith += 10;
            if (item.value === 'compassion') this.compassion += 10;

            GameEvents.trigger('item-collected', { item, player: this });
        }

        /**
         * Update player animation and state
         * @param {number} deltaTime - Time elapsed since last frame
         */
        update(deltaTime) {
            if (this.moving) {
                this.moveProgress += deltaTime / 300; // 300ms move duration
                if (this.moveProgress >= 1) {
                    this.moveProgress = 1;
                    this.moving = false;
                    this.moveDir = null;
                    GameEvents.trigger('player-moved', { x: this.x, y: this.y });
                }
            }
        }

        /**
         * Get current render position (for smooth animation)
         * @returns {Object} Render position {x, y}
         */
        getRenderPosition() {
            if (!this.moving) {
                return { x: this.x, y: this.y };
            }

            const t = BibleRPG.Utils.lerp(0, 1, this.moveProgress);
            return {
                x: BibleRPG.Utils.lerp(this.px, this.x, t),
                y: BibleRPG.Utils.lerp(this.py, this.y, t)
            };
        }

        /**
         * Gain experience points
         * @param {number} amount - Amount of XP to gain
         */
        gainXP(amount) {
            this.xp += amount;
            const newLevel = Math.floor(this.xp / 100) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                this.maxHealth += 20;
                this.health = this.maxHealth; // Full heal on level up
                GameEvents.trigger('player-level-up', { level: this.level, player: this });
            }
            GameEvents.trigger('xp-gained', { amount, total: this.xp, player: this });
        }

        /**
         * Take damage
         * @param {number} amount - Amount of damage
         * @param {string} source - Source of damage
         */
        takeDamage(amount, source = 'unknown') {
            this.health = Math.max(0, this.health - amount);
            GameEvents.trigger('player-damaged', { amount, health: this.health, source });
            
            if (this.health <= 0) {
                GameEvents.trigger('player-died');
            }
        }

        /**
         * Heal the player
         * @param {number} amount - Amount to heal
         */
        heal(amount) {
            this.health = Math.min(this.maxHealth, this.health + amount);
            GameEvents.trigger('player-healed', { amount, health: this.health });
        }

        /**
         * Serialize player data for saving
         * @returns {Object} Serialized player data
         */
        serialize() {
            return {
                x: this.x,
                y: this.y,
                health: this.health,
                maxHealth: this.maxHealth,
                xp: this.xp,
                level: this.level,
                faith: this.faith,
                wisdom: this.wisdom,
                compassion: this.compassion,
                inventory: this.inventory,
                quests: this.quests,
                miracles: this.miracles,
                visitedLocations: Array.from(this.visitedLocations)
            };
        }

        /**
         * Deserialize player data from save
         * @param {Object} data - Saved player data
         */
        deserialize(data) {
            Object.assign(this, data);
            this.visitedLocations = new Set(data.visitedLocations || []);
            this.px = this.x;
            this.py = this.y;
            this.moving = false;
            this.moveDir = null;
            this.moveProgress = 0;
        }
    }

    /**
     * Game map and world management
     */
    const WorldManager = {
        /**
         * Generate a procedural map with biblical locations
         * @returns {Array} 2D array representing the map
         */
        generateMap() {
            const map = [];
            
            // Initialize with grass
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
                map[y] = [];
                for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                    map[y][x] = TILE_TYPES.GRASS;
                }
            }

            // Create paths
            this.createPath(map, 1, 1, 18, 1); // Horizontal path
            this.createPath(map, 1, 1, 1, 13); // Vertical path
            this.createPath(map, 10, 5, 10, 10); // Temple approach
            
            // Place special locations
            map[5][5] = TILE_TYPES.NPC_MOSES; // Moses in the wilderness
            map[8][10] = TILE_TYPES.NPC_DAVID; // David near the path
            map[3][3] = TILE_TYPES.HOLY_ITEM; // Blessed item
            map[10][12] = TILE_TYPES.TEMPLE; // Temple
            map[2][15] = TILE_TYPES.MOUNTAIN; // Mount Sinai
            
            // Add trees and water features
            this.addNaturalFeatures(map);
            
            return map;
        },

        /**
         * Create a path between two points
         * @param {Array} map - Map array to modify
         * @param {number} x1 - Start x coordinate
         * @param {number} y1 - Start y coordinate
         * @param {number} x2 - End x coordinate
         * @param {number} y2 - End y coordinate
         */
        createPath(map, x1, y1, x2, y2) {
            let currentX = x1;
            let currentY = y1;
            
            while (currentX !== x2 || currentY !== y2) {
                if (map[currentY] && map[currentY][currentX] !== undefined) {
                    map[currentY][currentX] = TILE_TYPES.PATH;
                }
                
                if (currentX < x2) currentX++;
                else if (currentX > x2) currentX--;
                else if (currentY < y2) currentY++;
                else if (currentY > y2) currentY--;
            }
            
            if (map[y2] && map[y2][x2] !== undefined) {
                map[y2][x2] = TILE_TYPES.PATH;
            }
        },

        /**
         * Add natural features like trees and water
         * @param {Array} map - Map array to modify
         */
        addNaturalFeatures(map) {
            // Add some trees
            const treePositions = [
                [7, 3], [12, 4], [15, 8], [4, 11], [16, 12], [8, 13]
            ];
            
            treePositions.forEach(([x, y]) => {
                if (map[y] && map[y][x] === TILE_TYPES.GRASS) {
                    map[y][x] = TILE_TYPES.TREE;
                }
            });

            // Add water features
            const waterPositions = [
                [6, 7], [7, 7], [8, 7], // Small river
                [14, 2], [15, 2], [16, 2] // Oasis
            ];
            
            waterPositions.forEach(([x, y]) => {
                if (map[y] && map[y][x] === TILE_TYPES.GRASS) {
                    map[y][x] = TILE_TYPES.WATER;
                }
            });
        },

        /**
         * Get tile color for rendering
         * @param {number} tileType - Type of tile
         * @returns {string} Color string
         */
        getTileColor(tileType) {
            const colors = {
                [TILE_TYPES.GRASS]: '#4a7c3c',
                [TILE_TYPES.TREE]: '#2d5016',
                [TILE_TYPES.WATER]: '#3e6eb0',
                [TILE_TYPES.PATH]: '#8b7355',
                [TILE_TYPES.NPC_MOSES]: '#d4af37',
                [TILE_TYPES.NPC_DAVID]: '#b8860b',
                [TILE_TYPES.HOLY_ITEM]: '#ffd700',
                [TILE_TYPES.TEMPLE]: '#daa520',
                [TILE_TYPES.MOUNTAIN]: '#696969',
                [TILE_TYPES.DESERT]: '#f4a460'
            };
            return colors[tileType] || '#4a7c3c';
        },

        /**
         * Get tile symbol for rendering
         * @param {number} tileType - Type of tile
         * @returns {string} Symbol string
         */
        getTileSymbol(tileType) {
            const symbols = {
                [TILE_TYPES.NPC_MOSES]: '👨‍🦳',
                [TILE_TYPES.NPC_DAVID]: '👑',
                [TILE_TYPES.HOLY_ITEM]: '📜',
                [TILE_TYPES.TEMPLE]: '⛪',
                [TILE_TYPES.MOUNTAIN]: '⛰️',
                [TILE_TYPES.TREE]: '🌳',
                [TILE_TYPES.WATER]: '💧'
            };
            return symbols[tileType] || '';
        }
    };

    /**
     * Game event system for decoupled communication
     */
    const GameEvents = {
        listeners: {},

        /**
         * Add event listener
         * @param {string} event - Event name
         * @param {Function} callback - Event callback
         * @returns {Function} Unsubscribe function
         */
        on(event, callback) {
            if (!this.listeners[event]) {
                this.listeners[event] = [];
            }
            this.listeners[event].push(callback);

            // Return unsubscribe function
            return () => {
                const index = this.listeners[event].indexOf(callback);
                if (index > -1) {
                    this.listeners[event].splice(index, 1);
                }
            };
        },

        /**
         * Trigger event
         * @param {string} event - Event name
         * @param {*} data - Event data
         */
        trigger(event, data = null) {
            if (this.listeners[event]) {
                this.listeners[event].forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        console.error(`Error in event listener for ${event}:`, error);
                    }
                });
            }
        },

        /**
         * Remove all listeners for an event
         * @param {string} event - Event name
         */
        off(event) {
            delete this.listeners[event];
        }
    };

    /**
     * Rendering system
     */
    const Renderer = {
        /**
         * Render the game world
         */
        render() {
            if (!context || !gameState) return;

            // Clear canvas
            context.fillStyle = '#2d3a4a';
            context.fillRect(0, 0, canvas.width, canvas.height);

            // Render map
            this.renderMap();
            
            // Render player
            this.renderPlayer();
            
            // Render UI elements
            this.renderMinimap();
        },

        /**
         * Render the game map
         */
        renderMap() {
            const { map } = gameState;
            
            for (let y = 0; y < CONFIG.MAP_HEIGHT; y++) {
                for (let x = 0; x < CONFIG.MAP_WIDTH; x++) {
                    const tileType = map[y][x];
                    const color = WorldManager.getTileColor(tileType);
                    const symbol = WorldManager.getTileSymbol(tileType);
                    
                    // Draw tile background
                    context.fillStyle = color;
                    context.fillRect(
                        x * CONFIG.TILE_SIZE,
                        y * CONFIG.TILE_SIZE,
                        CONFIG.TILE_SIZE,
                        CONFIG.TILE_SIZE
                    );
                    
                    // Draw tile symbol if available
                    if (symbol) {
                        context.font = '20px Arial';
                        context.textAlign = 'center';
                        context.textBaseline = 'middle';
                        context.fillText(
                            symbol,
                            x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                            y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2
                        );
                    }
                }
            }
        },

        /**
         * Render the player character
         */
        renderPlayer() {
            const { player } = gameState;
            const pos = player.getRenderPosition();
            
            // Player circle
            context.fillStyle = player.color;
            context.beginPath();
            context.arc(
                pos.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                pos.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                CONFIG.TILE_SIZE / 3,
                0,
                Math.PI * 2
            );
            context.fill();
            
            // Player symbol
            context.fillStyle = '#ffffff';
            context.font = '16px Arial';
            context.textAlign = 'center';
            context.textBaseline = 'middle';
            context.fillText(
                '✝',
                pos.x * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2,
                pos.y * CONFIG.TILE_SIZE + CONFIG.TILE_SIZE / 2
            );
        },

        /**
         * Render minimap
         */
        renderMinimap() {
            const minimapCanvas = document.getElementById('minimap');
            if (!minimapCanvas) return;
            
            const minimapCtx = minimapCanvas.getContext('2d');
            const scale = minimapCanvas.width / CONFIG.MAP_WIDTH;
            
            // Clear minimap
            minimapCtx.fillStyle = '#111';
            minimapCtx.fillRect(0, 0, minimapCanvas.width, minimapCanvas.height);
            
            // Draw visited areas
            gameState.player.visitedLocations.forEach(location => {
                const [x, y] = location.split(',').map(Number);
                minimapCtx.fillStyle = '#4a7c3c';
                minimapCtx.fillRect(x * scale, y * scale, scale, scale);
            });
            
            // Draw player position
            const playerPos = gameState.player.getRenderPosition();
            minimapCtx.fillStyle = '#ffd700';
            minimapCtx.fillRect(
                playerPos.x * scale - 1,
                playerPos.y * scale - 1,
                scale + 2,
                scale + 2
            );
        }
    };

    /**
     * Game loop and core systems
     */
    const GameLoop = {
        animationId: null,

        /**
         * Start the game loop
         */
        start() {
            if (isRunning) return;
            
            isRunning = true;
            lastFrameTime = performance.now();
            this.animationId = requestAnimationFrame(this.frame.bind(this));
            
            GameEvents.trigger('game-started');
        },

        /**
         * Stop the game loop
         */
        stop() {
            if (!isRunning) return;
            
            isRunning = false;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            
            GameEvents.trigger('game-stopped');
        },

        /**
         * Main game loop frame
         * @param {number} currentTime - Current timestamp
         */
        frame(currentTime) {
            if (!isRunning) return;
            
            // Calculate delta time
            deltaTime = Math.min(currentTime - lastFrameTime, CONFIG.MAX_DELTA_TIME);
            lastFrameTime = currentTime;
            
            // Update game state
            this.update(deltaTime);
            
            // Render frame
            Renderer.render();
            
            // Schedule next frame
            this.animationId = requestAnimationFrame(this.frame.bind(this));
        },

        /**
         * Update game state
         * @param {number} deltaTime - Time elapsed since last frame
         */
        update(deltaTime) {
            if (!gameState || gameState.currentState !== GAME_STATES.PLAYING) return;
            
            // Update player
            gameState.player.update(deltaTime);
            
            // Update other game systems
            GameEvents.trigger('game-update', { deltaTime });
        }
    };

    /**
     * Save/Load system
     */
    const SaveSystem = {
        /**
         * Save current game state
         */
        save() {
            if (!gameState) return false;
            
            const saveData = {
                version: '1.0.0',
                timestamp: Date.now(),
                player: gameState.player.serialize(),
                map: gameState.map,
                currentState: gameState.currentState,
                gameTime: gameState.gameTime || 0
            };
            
            try {
                BibleRPG.Utils.Storage.set(CONFIG.SAVE_KEY, saveData);
                GameEvents.trigger('game-saved', saveData);
                return true;
            } catch (error) {
                console.error('Failed to save game:', error);
                GameEvents.trigger('save-failed', error);
                return false;
            }
        },

        /**
         * Load saved game state
         * @returns {boolean} True if load was successful
         */
        load() {
            try {
                const saveData = BibleRPG.Utils.Storage.get(CONFIG.SAVE_KEY);
                if (!saveData) return false;
                
                // Create new game state
                gameState = {
                    player: new Player(),
                    map: saveData.map || WorldManager.generateMap(),
                    currentState: saveData.currentState || GAME_STATES.PLAYING,
                    gameTime: saveData.gameTime || 0
                };
                
                // Restore player data
                gameState.player.deserialize(saveData.player);
                
                GameEvents.trigger('game-loaded', saveData);
                return true;
            } catch (error) {
                console.error('Failed to load game:', error);
                GameEvents.trigger('load-failed', error);
                return false;
            }
        },

        /**
         * Check if save data exists
         * @returns {boolean} True if save exists
         */
        hasSave() {
            return BibleRPG.Utils.Storage.get(CONFIG.SAVE_KEY) !== null;
        },

        /**
         * Delete saved game
         */
        deleteSave() {
            BibleRPG.Utils.Storage.remove(CONFIG.SAVE_KEY);
            GameEvents.trigger('save-deleted');
        }
    };

    /**
     * Initialize the game engine
     * @param {HTMLCanvasElement} gameCanvas - Canvas element for rendering
     * @returns {boolean} True if initialization was successful
     */
    const initialize = (gameCanvas) => {
        if (!gameCanvas) {
            console.error('Canvas element is required for game initialization');
            return false;
        }

        canvas = gameCanvas;
        context = canvas.getContext('2d');
        
        if (!context) {
            console.error('Failed to get canvas 2D context');
            return false;
        }

        // Initialize game state
        if (!SaveSystem.load()) {
            // Create new game
            gameState = {
                player: new Player(),
                map: WorldManager.generateMap(),
                currentState: GAME_STATES.PLAYING,
                gameTime: 0
            };
        }

        GameEvents.trigger('game-initialized');
        return true;
    };

    /**
     * Start a new game
     */
    const newGame = () => {
        gameState = {
            player: new Player(),
            map: WorldManager.generateMap(),
            currentState: GAME_STATES.PLAYING,
            gameTime: 0
        };
        
        GameEvents.trigger('new-game-started');
    };

    /**
     * Handle player input
     * @param {string} input - Input command
     */
    const handleInput = (input) => {
        if (!gameState || gameState.currentState !== GAME_STATES.PLAYING) return;
        
        switch (input) {
            case 'ArrowUp':
            case 'KeyW':
                gameState.player.move('up');
                break;
            case 'ArrowDown':
            case 'KeyS':
                gameState.player.move('down');
                break;
            case 'ArrowLeft':
            case 'KeyA':
                gameState.player.move('left');
                break;
            case 'ArrowRight':
            case 'KeyD':
                gameState.player.move('right');
                break;
            case 'Space':
                // Interact/action
                GameEvents.trigger('player-action');
                break;
            case 'Escape':
                // Pause/menu
                gameState.currentState = GAME_STATES.PAUSED;
                GameEvents.trigger('game-paused');
                break;
        }
    };

    // Public API
    return {
        initialize,
        newGame,
        handleInput,
        GameLoop,
        SaveSystem,
        GameEvents,
        Player,
        TILE_TYPES,
        GAME_STATES,
        CONFIG,
        
        // Getters
        get gameState() { return gameState; },
        get isRunning() { return isRunning; },
        get canvas() { return canvas; },
        get context() { return context; }
    };

})();