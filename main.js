// Game constants
const TILE_SIZE = 32;
const MAP_WIDTH = 20;
const MAP_HEIGHT = 15;
const MOVE_ANIMATION_DURATION = 180;
const SAVE_DEBOUNCE_DELAY = 500;

// DOM elements cache
const gameElements = {
    canvas: null,
    ctx: null,
    dialogue: null,
    quest: null,
    healthValue: null,
    xpValue: null,
    inventory: null,
    questLog: null,
    scriptureModal: null,
    scriptureContent: null,
    minimap: null,
    minimapCtx: null
};

// Initialize DOM elements
function initializeDOM() {
    gameElements.canvas = document.getElementById('gameCanvas');
    gameElements.ctx = gameElements.canvas.getContext('2d');
    gameElements.dialogue = document.getElementById('dialogue');
    gameElements.quest = document.getElementById('quest');
    gameElements.healthValue = document.getElementById('health-value');
    gameElements.xpValue = document.getElementById('xp-value');
    gameElements.inventory = document.getElementById('inventory');
    gameElements.questLog = document.getElementById('quest-log');
    gameElements.scriptureModal = document.getElementById('scripture-modal');
    gameElements.scriptureContent = document.getElementById('scripture-content');
    gameElements.minimap = document.getElementById('minimap');
    gameElements.minimapCtx = gameElements.minimap.getContext('2d');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDOM);
} else {
    initializeDOM();
}

// Tile types: 0=grass, 1=tree, 2=water, 3=path, 4=NPC1, 5=NPC2, 6=item
const map = [];
for (let y = 0; y < MAP_HEIGHT; y++) {
    map[y] = [];
    for (let x = 0; x < MAP_WIDTH; x++) {
        if ((x === 5 && y === 5)) map[y][x] = 4; // NPC1
        else if ((x === 10 && y === 8)) map[y][x] = 5; // NPC2
        else if ((x === 3 && y === 3) || (x === 7 && y === 10)) map[y][x] = 1; // Tree
        else if ((x === 2 && y === 12) || (x === 15 && y === 2)) map[y][x] = 2; // Water
        else if ((x === 8 && y === 7)) map[y][x] = 6; // Item
        else if ((x > 0 && x < 19 && y === 1) || (y > 0 && y < 14 && x === 1)) map[y][x] = 3; // Path
        else map[y][x] = 0;
    }
}

const player = {
    x: 1,
    y: 1,
    px: 1, // for animation
    py: 1,
    moving: false,
    moveDir: null,
    quests: [],
    inventory: [],
    health: 100,
    xp: 0,
};

// Save system with error handling and debouncing
let saveTimeout = null;
let lastSaveTime = 0;

function saveGame() {
    const now = Date.now();
    if (now - lastSaveTime < SAVE_DEBOUNCE_DELAY) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveGame, SAVE_DEBOUNCE_DELAY);
        return;
    }
    
    try {
        const saveData = {
            player: { ...player },
            map: map.map(row => [...row]),
            QUESTS: QUESTS.map(q => ({ ...q })),
            timestamp: now
        };
        localStorage.setItem('bibleRPGSave', JSON.stringify(saveData));
        lastSaveTime = now;
        showSaveIndicator();
    } catch (error) {
        console.error('Failed to save game:', error);
        showDialogue('⚠️ Save failed - storage may be full');
    }
}

function loadGame() {
    try {
        const data = localStorage.getItem('bibleRPGSave');
        if (data) {
            const save = JSON.parse(data);
            Object.assign(player, save.player);
            for (let y = 0; y < MAP_HEIGHT; y++)
                for (let x = 0; x < MAP_WIDTH; x++)
                    map[y][x] = save.map[y][x];
            for (let i = 0; i < QUESTS.length; i++)
                Object.assign(QUESTS[i], save.QUESTS[i]);
            console.log('Game loaded successfully');
            return true;
        }
    } catch (error) {
        console.error('Failed to load game:', error);
        showDialogue('⚠️ Load failed - save file may be corrupted');
    }
    return false;
}

function showSaveIndicator() {
    const indicator = document.createElement('div');
    indicator.textContent = '💾 Saved';
    indicator.style.cssText = `
        position: fixed; top: 20px; right: 20px; 
        background: #4a7a3c; color: white; padding: 8px 16px; 
        border-radius: 4px; font-size: 14px; z-index: 1000;
        opacity: 0; transition: opacity 0.3s ease;
    `;
    document.body.appendChild(indicator);
    
    requestAnimationFrame(() => {
        indicator.style.opacity = '1';
        setTimeout(() => {
            indicator.style.opacity = '0';
            setTimeout(() => document.body.removeChild(indicator), 300);
        }, 1500);
    });
}

function drawMap() {
    const ctx = gameElements.ctx;
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            switch (map[y][x]) {
                case 0: ctx.fillStyle = '#4a7a3c'; break; // grass
                case 1: ctx.fillStyle = '#2e3d1f'; break; // tree
                case 2: ctx.fillStyle = '#3ac6f7'; break; // water
                case 3: ctx.fillStyle = '#bfa76f'; break; // path
                case 4: case 5: ctx.fillStyle = '#4a7a3c'; break; // NPC on grass
                case 6: ctx.fillStyle = '#4a7a3c'; break; // item on grass
            }
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            // Draw tree/water overlay
            if (map[y][x] === 1) {
                ctx.fillStyle = '#2e3d1f';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 14, 0, 2 * Math.PI);
                ctx.fill();
            }
            if (map[y][x] === 2) {
                ctx.fillStyle = '#3ac6f7';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                ctx.globalAlpha = 1;
            }
            if (map[y][x] === 6) {
                ctx.fillStyle = '#f1c40f';
                ctx.beginPath();
                ctx.arc(x * TILE_SIZE + 16, y * TILE_SIZE + 16, 7, 0, 2 * Math.PI);
                ctx.fill();
            }
        }
    }
    // Draw NPCs
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            if (map[y][x] === 4) drawNPC(x, y, 1);
            if (map[y][x] === 5) drawNPC(x, y, 2);
        }
    }
}

function drawNPC(x, y, type) {
    const ctx = gameElements.ctx;
    ctx.save();
    ctx.translate(x * TILE_SIZE + 16, y * TILE_SIZE + 16);
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, 2 * Math.PI);
    ctx.fillStyle = type === 1 ? '#c9b037' : '#e67e22';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawPlayer() {
    const ctx = gameElements.ctx;
    // Smooth movement animation
    let px = player.x, py = player.y;
    if (player.moving && player.moveDir && player.moveStartTime) {
        const elapsed = performance.now() - player.moveStartTime;
        const progress = Math.min(elapsed / MOVE_ANIMATION_DURATION, 1);
        const eased = easeInOutQuad(progress);
        
        if (player.moveDir === 'up') py = player.py + (player.y - player.py) * eased;
        if (player.moveDir === 'down') py = player.py + (player.y - player.py) * eased;
        if (player.moveDir === 'left') px = player.px + (player.x - player.px) * eased;
        if (player.moveDir === 'right') px = player.px + (player.x - player.px) * eased;
    }
    
    ctx.save();
    ctx.translate(px * TILE_SIZE + 16, py * TILE_SIZE + 16);
    
    // Add subtle pulse animation
    const pulse = 1 + Math.sin(performance.now() * 0.005) * 0.05;
    ctx.scale(pulse, pulse);
    
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, 2 * Math.PI);
    ctx.fillStyle = '#3af';
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function drawMinimap() {
    const mini = gameElements.minimapCtx;
    mini.clearRect(0, 0, 100, 75);
    for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
            switch (map[y][x]) {
                case 0: mini.fillStyle = '#4a7a3c'; break;
                case 1: mini.fillStyle = '#2e3d1f'; break;
                case 2: mini.fillStyle = '#3ac6f7'; break;
                case 3: mini.fillStyle = '#bfa76f'; break;
                case 4: case 5: mini.fillStyle = '#c9b037'; break;
                case 6: mini.fillStyle = '#f1c40f'; break;
            }
            mini.fillRect(x * 5, y * 5, 5, 5);
        }
    }
    // Player with pulse
    const pulse = 0.8 + Math.sin(performance.now() * 0.008) * 0.2;
    mini.fillStyle = `rgba(51, 170, 255, ${pulse})`;
    mini.fillRect(player.x * 5, player.y * 5, 5, 5);
}

// Easing function for smooth animations
function easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
}

// Render state management for optimization
let needsRender = true;
let lastRenderTime = 0;

function render() {
    const ctx = gameElements.ctx;
    ctx.clearRect(0, 0, gameElements.canvas.width, gameElements.canvas.height);
    drawMap();
    drawPlayer();
    drawMinimap();
    updateHUD();
    updateQuestLog();
    needsRender = false;
}

function showDialogue(text) {
    if (gameElements.dialogue) {
        gameElements.dialogue.innerText = text;
        addDialogueAnimation();
    }
}

function showQuest(text) {
    if (gameElements.quest) {
        gameElements.quest.innerHTML = text;
        addQuestAnimation();
    }
}

function updateHUD() {
    if (gameElements.healthValue) {
        animateValueChange(gameElements.healthValue, player.health);
    }
    if (gameElements.xpValue) {
        animateValueChange(gameElements.xpValue, player.xp);
    }
    if (gameElements.inventory) {
        gameElements.inventory.innerText = "Inventory: " + 
            (player.inventory.length ? player.inventory.join(', ') : 'Empty');
    }
}

function updateQuestLog() {
    if (gameElements.questLog) {
        gameElements.questLog.innerHTML = "<b>Quest Log:</b><ul>" +
            QUESTS.map(q =>
                `<li>${q.completed ? '✅' : '⬜'} <b>${q.title}</b> - ${q.completed ? 'Complete' : 'Incomplete'}</li>`
            ).join('') + "</ul>";
    }
}

// Animation helpers
function addDialogueAnimation() {
    if (gameElements.dialogue) {
        gameElements.dialogue.style.transform = 'scale(1.02)';
        setTimeout(() => {
            if (gameElements.dialogue) {
                gameElements.dialogue.style.transform = 'scale(1)';
            }
        }, 150);
    }
}

function addQuestAnimation() {
    if (gameElements.quest) {
        gameElements.quest.style.transform = 'scale(1.02)';
        setTimeout(() => {
            if (gameElements.quest) {
                gameElements.quest.style.transform = 'scale(1)';
            }
        }, 150);
    }
}

function animateValueChange(element, newValue) {
    if (!element) return;
    const currentValue = parseInt(element.innerText) || 0;
    if (currentValue !== newValue) {
        element.style.color = newValue > currentValue ? '#2ecc71' : '#e74c3c';
        element.innerText = newValue;
        setTimeout(() => {
            if (element) {
                element.style.color = '';
            }
        }, 1000);
    }
}

// Particle system for visual effects
const particles = [];

function createParticle(x, y, type = 'xp') {
    const particle = {
        x: x * TILE_SIZE + 16,
        y: y * TILE_SIZE + 16,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4 - 2,
        life: 1.0,
        decay: 0.02,
        type: type,
        size: Math.random() * 4 + 2
    };
    particles.push(particle);
}

function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life -= p.decay;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function drawParticles() {
    const ctx = gameElements.ctx;
    ctx.save();
    for (const p of particles) {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.type === 'xp' ? '#f1c40f' : '#2ecc71';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, 2 * Math.PI);
        ctx.fill();
    }
    ctx.restore();
}

function interact() {
    // Check for NPC at adjacent tile
    const dirs = [
        [0, -1], [1, 0], [0, 1], [-1, 0]
    ];
    for (const [dx, dy] of dirs) {
        const nx = player.x + dx, ny = player.y + dy;
        if (map[ny] && (map[ny][nx] === 4 || map[ny][nx] === 5)) {
            const npcId = map[ny][nx] === 4 ? 1 : 2;
            const quest = getCurrentQuest(npcId);
            if (quest) {
                showDialogue(quest.dialogue);
                showScriptureButton(quest);
                if (!player.quests.includes(quest.id)) {
                    player.quests.push(quest.id);
                    showQuest(`Quest started: ${quest.title}`);
                    createParticle(nx, ny, 'quest');
                } else if (!quest.completed) {
                    quest.completed = true;
                    player.xp += 20;
                    showQuest(`Quest completed: ${quest.title}`);
                    showDialogue(quest.completion);
                    showScriptureButton(quest);
                    // Create celebration particles
                    for (let i = 0; i < 10; i++) {
                        createParticle(nx, ny, 'xp');
                    }
                    showQuestCompleteEffect();
                }
            } else {
                showDialogue("NPC: May the Lord guide you!");
            }
            saveGame();
            return;
        }
    }
    
    // Check for item
    if (map[player.y][player.x] === 6) {
        player.inventory.push('Golden Scroll');
        player.xp += 10;
        map[player.y][player.x] = 0;
        showDialogue("You found a Golden Scroll! XP +10");
        
        // Create item collection particles
        for (let i = 0; i < 8; i++) {
            createParticle(player.x, player.y, 'xp');
        }
        
        saveGame();
        needsRender = true;
        return;
    }
    showDialogue("There's nothing to interact with here.");
}

function showQuestCompleteEffect() {
    // Flash effect for quest completion
    if (gameElements.canvas) {
        gameElements.canvas.style.filter = 'brightness(1.3)';
        setTimeout(() => {
            if (gameElements.canvas) {
                gameElements.canvas.style.filter = 'brightness(1)';
            }
        }, 200);
    }
}

function showScriptureButton(quest) {
    showQuest(`Scripture: <button onclick="showScripture('${quest.scripture}')" class="scripture-btn">📖 View ${quest.scripture}</button>`);
}

window.showScripture = function(ref) {
    const q = QUESTS.find(q => q.scripture === ref);
    if (!q) return;
    
    if (gameElements.scriptureContent) {
        gameElements.scriptureContent.innerHTML =
            `<b>${q.scripture}</b><br><br>${q.scriptureText}`;
    }
    
    if (gameElements.scriptureModal) {
        gameElements.scriptureModal.classList.remove('hidden');
        gameElements.scriptureModal.style.opacity = '0';
        requestAnimationFrame(() => {
            if (gameElements.scriptureModal) {
                gameElements.scriptureModal.style.opacity = '1';
            }
        });
    }
};

// Enhanced modal closing with animation
function closeScripture() {
    if (gameElements.scriptureModal) {
        gameElements.scriptureModal.style.opacity = '0';
        setTimeout(() => {
            if (gameElements.scriptureModal) {
                gameElements.scriptureModal.classList.add('hidden');
            }
        }, 300);
    }
}

// Initialize modal event listeners when DOM is ready
function initializeModalEvents() {
    const closeBtn = document.getElementById('close-scripture');
    if (closeBtn) {
        closeBtn.onclick = closeScripture;
    }
    
    // Close modal when clicking outside
    if (gameElements.scriptureModal) {
        gameElements.scriptureModal.addEventListener('click', (e) => {
            if (e.target === gameElements.scriptureModal) {
                closeScripture();
            }
        });
    }
}

function getCurrentQuest(npcId) {
    // Each NPC gives a different quest
    for (const q of QUESTS) {
        if (q.npc === npcId && (!player.quests.includes(q.id) || !q.completed)) return q;
    }
    return null;
}

let moveCooldown = false;

// Enhanced keyboard event handling
document.addEventListener('keydown', (e) => {
    // Handle modal shortcuts
    if (!gameElements.scriptureModal?.classList.contains('hidden')) {
        if (e.key === 'Escape') {
            closeScripture();
            e.preventDefault();
            return;
        }
        return; // Don't handle other keys when modal is open
    }
    
    if (player.moving || moveCooldown) return;
    
    let moved = false, dir = null;
    
    // Movement with WASD or arrow keys
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && 
        player.y > 0 && !isBlocked(player.x, player.y - 1)) {
        player.py = player.y; 
        player.y--; 
        dir = 'up'; 
        moved = true;
    }
    if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && 
        player.y < MAP_HEIGHT - 1 && !isBlocked(player.x, player.y + 1)) {
        player.py = player.y; 
        player.y++; 
        dir = 'down'; 
        moved = true;
    }
    if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && 
        player.x > 0 && !isBlocked(player.x - 1, player.y)) {
        player.px = player.x; 
        player.x--; 
        dir = 'left'; 
        moved = true;
    }
    if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && 
        player.x < MAP_WIDTH - 1 && !isBlocked(player.x + 1, player.y)) {
        player.px = player.x; 
        player.x++; 
        dir = 'right'; 
        moved = true;
    }
    
    // Interaction with Space or Enter
    if (e.key === ' ' || e.key === 'Enter') {
        interact();
        e.preventDefault();
    }
    
    if (moved) {
        player.moving = true;
        player.moveDir = dir;
        player.moveStartTime = performance.now();
        moveCooldown = true;
        
        setTimeout(() => {
            player.moving = false;
            player.moveDir = null;
            moveCooldown = false;
            needsRender = true;
        }, MOVE_ANIMATION_DURATION);
        
        needsRender = true;
        showDialogue('');
        saveGame();
        e.preventDefault();
    }
});

function isBlocked(x, y) {
    if (map[y] && (map[y][x] === 1 || map[y][x] === 2)) return true;
    return false;
}

// Enhanced game loop with requestAnimationFrame
function gameLoop() {
    updateParticles();
    
    if (needsRender || particles.length > 0 || player.moving) {
        render();
        drawParticles();
    }
    
    // Update quest display
    const currentQuest = getCurrentQuest(1) || getCurrentQuest(2);
    if (currentQuest) {
        showQuest(`Current Quest: ${currentQuest.title}`);
    } else {
        showQuest("All quests complete! 🎉");
    }
    
    requestAnimationFrame(gameLoop);
}

// Enhanced initialization
function initializeGame() {
    initializeDOM();
    initializeModalEvents();
    
    // Add player movement properties
    player.moveStartTime = 0;
    
    // Load saved game
    const loaded = loadGame();
    if (loaded) {
        showDialogue("Game loaded! Use WASD/Arrow keys to move. Space/Enter to interact.");
    } else {
        showDialogue("Welcome to BibleRPG! Use WASD/Arrow keys to move. Space/Enter to interact. Progress is auto-saved.");
    }
    
    // Start the game loop
    needsRender = true;
    gameLoop();
}

// Start the game when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeGame);
} else {
    initializeGame();
}
