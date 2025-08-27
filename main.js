const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const TILE_SIZE = 32;
const MAP_WIDTH = 20, MAP_HEIGHT = 15;

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

function saveGame() {
    localStorage.setItem('bibleRPGSave', JSON.stringify({
        player, map, QUESTS
    }));
}
function loadGame() {
    const data = localStorage.getItem('bibleRPGSave');
    if (data) {
        const save = JSON.parse(data);
        Object.assign(player, save.player);
        for (let y = 0; y < MAP_HEIGHT; y++)
            for (let x = 0; x < MAP_WIDTH; x++)
                map[y][x] = save.map[y][x];
        for (let i = 0; i < QUESTS.length; i++)
            Object.assign(QUESTS[i], save.QUESTS[i]);
    }
}

function drawMap() {
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
    // Animate movement
    let px = player.px, py = player.py;
    if (player.moving && player.moveDir) {
        const t = (performance.now() % 200) / 200;
        if (player.moveDir === 'up') py = player.y + (1 - t);
        if (player.moveDir === 'down') py = player.y - (1 - t);
        if (player.moveDir === 'left') px = player.x + (1 - t);
        if (player.moveDir === 'right') px = player.x - (1 - t);
    }
    ctx.save();
    ctx.translate(px * TILE_SIZE + 16, py * TILE_SIZE + 16);
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
    const mini = document.getElementById('minimap').getContext('2d');
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
    // Player
    mini.fillStyle = '#3af';
    mini.fillRect(player.x * 5, player.y * 5, 5, 5);
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap();
    drawPlayer();
    drawMinimap();
    updateHUD();
    updateQuestLog();
}

function showDialogue(text) {
    document.getElementById('dialogue').innerText = text;
}
function showQuest(text) {
    document.getElementById('quest').innerText = text;
}
function updateHUD() {
    document.getElementById('health-value').innerText = player.health;
    document.getElementById('xp-value').innerText = player.xp;
    document.getElementById('inventory').innerText = "Inventory: " + (player.inventory.length ? player.inventory.join(', ') : 'Empty');
}
function updateQuestLog() {
    const log = document.getElementById('quest-log');
    log.innerHTML = "<b>Quest Log:</b><ul>" +
        QUESTS.map(q =>
            `<li>${q.completed ? '✅' : '⬜'} <b>${q.title}</b> - ${q.completed ? 'Complete' : 'Incomplete'}</li>`
        ).join('') + "</ul>";
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
                } else if (!quest.completed) {
                    quest.completed = true;
                    player.xp += 20;
                    showQuest(`Quest completed: ${quest.title}`);
                    showDialogue(quest.completion);
                    showScriptureButton(quest);
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
        saveGame();
        render();
        return;
    }
    showDialogue("There's nothing to interact with here.");
}

function showScriptureButton(quest) {
    showQuest(`Scripture: <button onclick="showScripture('${quest.scripture}')">View</button>`);
}
window.showScripture = function(ref) {
    const q = QUESTS.find(q => q.scripture === ref);
    if (!q) return;
    document.getElementById('scripture-content').innerHTML =
        `<b>${q.scripture}</b><br><br>${q.scriptureText}`;
    document.getElementById('scripture-modal').classList.remove('hidden');
};
document.getElementById('close-scripture').onclick = () => {
    document.getElementById('scripture-modal').classList.add('hidden');
};

function getCurrentQuest(npcId) {
    // Each NPC gives a different quest
    for (const q of QUESTS) {
        if (q.npc === npcId && (!player.quests.includes(q.id) || !q.completed)) return q;
    }
    return null;
}

let moveCooldown = false;
document.addEventListener('keydown', (e) => {
    if (player.moving || moveCooldown) return;
    let moved = false, dir = null;
    if (e.key === 'ArrowUp' && player.y > 0 && !isBlocked(player.x, player.y - 1)) {
        player.py = player.y; player.y--; dir = 'up'; moved = true;
    }
    if (e.key === 'ArrowDown' && player.y < MAP_HEIGHT - 1 && !isBlocked(player.x, player.y + 1)) {
        player.py = player.y; player.y++; dir = 'down'; moved = true;
    }
    if (e.key === 'ArrowLeft' && player.x > 0 && !isBlocked(player.x - 1, player.y)) {
        player.px = player.x; player.x--; dir = 'left'; moved = true;
    }
    if (e.key === 'ArrowRight' && player.x < MAP_WIDTH - 1 && !isBlocked(player.x + 1, player.y)) {
        player.px = player.x; player.x++; dir = 'right'; moved = true;
    }
    if (e.key === ' ') {
        interact();
    }
    if (moved) {
        player.moving = true;
        player.moveDir = dir;
        moveCooldown = true;
        setTimeout(() => {
            player.moving = false;
            player.moveDir = null;
            moveCooldown = false;
            render();
        }, 180);
        render();
        showDialogue('');
        saveGame();
    }
});

function isBlocked(x, y) {
    if (map[y] && (map[y][x] === 1 || map[y][x] === 2)) return true;
    return false;
}

function gameLoop() {
    render();
    showQuest(getCurrentQuest(1) || getCurrentQuest(2)
        ? `Current Quest: ${(getCurrentQuest(1) || getCurrentQuest(2)).title}` : "All quests complete!");
}
loadGame();
gameLoop();
showDialogue("Use arrow keys to move. Space to interact. Progress is saved.");
