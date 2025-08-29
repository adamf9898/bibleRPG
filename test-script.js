// Bible RPG Test Script - Scene Management & Character Creation

// ----------------------------
// Scene Management System
// ----------------------------
class SceneManager {
  constructor() {
    this.currentScene = null;
    this.scenes = {};
    this.canvas = null;
    this.ctx = null;
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.setupCanvas();
  }

  setupCanvas() {
    // Set canvas size
    this.canvas.width = 800;
    this.canvas.height = 400;
    
    // Enable high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.canvas.style.width = rect.width + 'px';
    this.canvas.style.height = rect.height + 'px';
  }

  registerScene(name, scene) {
    this.scenes[name] = scene;
    scene.sceneManager = this;
  }

  switchTo(sceneName, data = {}) {
    this.showLoading();
    
    setTimeout(() => {
      if (this.currentScene) {
        this.currentScene.exit();
      }
      
      this.currentScene = this.scenes[sceneName];
      if (this.currentScene) {
        this.currentScene.enter(data);
        this.currentScene.render();
      }
      
      this.hideLoading();
    }, 300);
  }

  showLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.remove('hidden');
    }
  }

  hideLoading() {
    const overlay = document.querySelector('.loading-overlay');
    if (overlay) {
      overlay.classList.add('hidden');
    }
  }

  update() {
    if (this.currentScene && this.currentScene.update) {
      this.currentScene.update();
    }
  }

  render() {
    if (this.currentScene && this.currentScene.render) {
      this.currentScene.render();
    }
  }

  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

// ----------------------------
// Base Scene Class
// ----------------------------
class Scene {
  constructor(name) {
    this.name = name;
    this.sceneManager = null;
  }

  enter(data) {
    // Override in subclasses
  }

  exit() {
    // Override in subclasses
  }

  update() {
    // Override in subclasses
  }

  render() {
    // Override in subclasses
  }
}

// ----------------------------
// Character Creation Scene
// ----------------------------
class CharacterCreationScene extends Scene {
  constructor() {
    super('CharacterCreation');
    this.character = {
      name: '',
      faith: 1,
      wisdom: 1,
      service: 1
    };
    this.availablePoints = 5;
    this.maxStat = 5;
  }

  enter(data) {
    this.setupUI();
    this.render();
  }

  setupUI() {
    const gameContainer = document.querySelector('#gameContent');
    gameContainer.innerHTML = `
      <div class="character-creation scene" role="main" aria-labelledby="char-title">
        <div class="card">
          <h2 id="char-title">Create Your Character</h2>
          <div class="section">
            <div class="character-form">
              <div class="form-group">
                <label for="characterName">Character Name:</label>
                <input type="text" id="characterName" class="input" 
                       placeholder="Enter your name" 
                       aria-describedby="name-help"
                       maxlength="20">
                <small id="name-help" class="muted">Choose a name for your biblical journey</small>
              </div>
              
              <div class="form-group">
                <div class="points-remaining" role="status" aria-live="polite">
                  Points Remaining: <span id="pointsRemaining">${this.availablePoints}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Faith: <span id="faithDesc" class="muted">Trust in divine guidance</span></label>
                <div class="stat-controls" role="group" aria-labelledby="faith-label">
                  <button class="btn stat-btn" id="faithDown" aria-label="Decrease Faith">-</button>
                  <span class="stat-value" id="faithValue" aria-live="polite">${this.character.faith}</span>
                  <button class="btn stat-btn" id="faithUp" aria-label="Increase Faith">+</button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Wisdom: <span id="wisdomDesc" class="muted">Knowledge and understanding</span></label>
                <div class="stat-controls" role="group" aria-labelledby="wisdom-label">
                  <button class="btn stat-btn" id="wisdomDown" aria-label="Decrease Wisdom">-</button>
                  <span class="stat-value" id="wisdomValue" aria-live="polite">${this.character.wisdom}</span>
                  <button class="btn stat-btn" id="wisdomUp" aria-label="Increase Wisdom">+</button>
                </div>
              </div>
              
              <div class="form-group">
                <label>Service: <span id="serviceDesc" class="muted">Helping others in need</span></label>
                <div class="stat-controls" role="group" aria-labelledby="service-label">
                  <button class="btn stat-btn" id="serviceDown" aria-label="Decrease Service">-</button>
                  <span class="stat-value" id="serviceValue" aria-live="polite">${this.character.service}</span>
                  <button class="btn stat-btn" id="serviceUp" aria-label="Increase Service">+</button>
                </div>
              </div>
              
              <div class="btn-row">
                <button class="btn" id="startJourney" disabled aria-describedby="start-help">
                  ✨ Begin Your Journey
                </button>
                <button class="btn" id="randomizeStats">🎲 Randomize</button>
              </div>
              <small id="start-help" class="muted">Enter a name and distribute all points to begin</small>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.updateUI();
  }

  bindEvents() {
    // Name input
    document.getElementById('characterName').addEventListener('input', (e) => {
      this.character.name = e.target.value.trim();
      this.updateUI();
    });

    // Stat controls
    ['faith', 'wisdom', 'service'].forEach(stat => {
      document.getElementById(`${stat}Up`).addEventListener('click', () => {
        this.increaseStat(stat);
      });
      document.getElementById(`${stat}Down`).addEventListener('click', () => {
        this.decreaseStat(stat);
      });
    });

    // Action buttons
    document.getElementById('startJourney').addEventListener('click', () => {
      this.startGame();
    });

    document.getElementById('randomizeStats').addEventListener('click', () => {
      this.randomizeStats();
    });
  }

  increaseStat(stat) {
    if (this.character[stat] < this.maxStat && this.availablePoints > 0) {
      this.character[stat]++;
      this.availablePoints--;
      this.updateUI();
    }
  }

  decreaseStat(stat) {
    if (this.character[stat] > 1) {
      this.character[stat]--;
      this.availablePoints++;
      this.updateUI();
    }
  }

  randomizeStats() {
    // Reset to base stats
    this.character.faith = 1;
    this.character.wisdom = 1;
    this.character.service = 1;
    this.availablePoints = 5;

    // Randomly distribute points
    while (this.availablePoints > 0) {
      const stats = ['faith', 'wisdom', 'service'];
      const stat = stats[Math.floor(Math.random() * stats.length)];
      if (this.character[stat] < this.maxStat) {
        this.character[stat]++;
        this.availablePoints--;
      }
    }

    this.updateUI();
  }

  updateUI() {
    // Update stat displays
    document.getElementById('faithValue').textContent = this.character.faith;
    document.getElementById('wisdomValue').textContent = this.character.wisdom;
    document.getElementById('serviceValue').textContent = this.character.service;
    document.getElementById('pointsRemaining').textContent = this.availablePoints;

    // Update button states
    ['faith', 'wisdom', 'service'].forEach(stat => {
      const upBtn = document.getElementById(`${stat}Up`);
      const downBtn = document.getElementById(`${stat}Down`);
      
      upBtn.disabled = this.character[stat] >= this.maxStat || this.availablePoints <= 0;
      downBtn.disabled = this.character[stat] <= 1;
    });

    // Update start button
    const startBtn = document.getElementById('startJourney');
    startBtn.disabled = !this.character.name || this.availablePoints > 0;
  }

  startGame() {
    // Save character to state
    state.characterName = this.character.name;
    state.stats = {
      faith: this.character.faith,
      wisdom: this.character.wisdom,
      service: this.character.service
    };
    
    // Add initial log entry
    addLog(`🌟 ${this.character.name} begins their biblical journey with Faith ${this.character.faith}, Wisdom ${this.character.wisdom}, and Service ${this.character.service}.`);
    
    save();
    
    // Switch to main game scene
    this.sceneManager.switchTo('MainGame');
  }

  render() {
    // Canvas rendering for character creation
    const ctx = this.sceneManager.ctx;
    ctx.clearRect(0, 0, this.sceneManager.canvas.width, this.sceneManager.canvas.height);
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, this.sceneManager.canvas.height);
    gradient.addColorStop(0, '#0f1222');
    gradient.addColorStop(0.5, '#1a1f48');
    gradient.addColorStop(1, '#0f1222');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.sceneManager.canvas.width, this.sceneManager.canvas.height);
    
    // Draw title
    ctx.fillStyle = '#e9ebff';
    ctx.font = 'bold 24px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('✝️ Character Creation', this.sceneManager.canvas.width / 2, 50);
    
    // Draw character preview
    this.drawCharacterPreview(ctx);
  }

  drawCharacterPreview(ctx) {
    const centerX = this.sceneManager.canvas.width / 2;
    const centerY = this.sceneManager.canvas.height / 2;
    
    // Draw character silhouette
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // Body
    ctx.fillStyle = '#7aa2ff';
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Stat indicators around character
    const stats = [
      { name: 'Faith', value: this.character.faith, angle: -Math.PI / 2, color: '#70f0c4' },
      { name: 'Wisdom', value: this.character.wisdom, angle: Math.PI / 6, color: '#ffd166' },
      { name: 'Service', value: this.character.service, angle: 5 * Math.PI / 6, color: '#ff6b6b' }
    ];
    
    stats.forEach(stat => {
      const radius = 60;
      const x = Math.cos(stat.angle) * radius;
      const y = Math.sin(stat.angle) * radius;
      
      // Draw stat orb
      ctx.fillStyle = stat.color;
      ctx.globalAlpha = 0.7;
      ctx.beginPath();
      ctx.arc(x, y, stat.value * 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw stat label
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#e9ebff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`${stat.name}: ${stat.value}`, x, y + 25);
    });
    
    ctx.restore();
  }
}

// ----------------------------
// Main Game Scene
// ----------------------------
class MainGameScene extends Scene {
  constructor() {
    super('MainGame');
  }

  enter(data) {
    this.setupUI();
    this.render();
  }

  setupUI() {
    const gameContainer = document.querySelector('#gameContent');
    gameContainer.innerHTML = originalGameHTML;
    
    // Re-initialize the original game UI
    initUI();
    
    // First-time arrival narrative
    if (state.log.length <= 1) { // Only the character creation log
      enterLocation('Galilee', { announce: true });
    } else {
      // Ensure scenario shows something on reload
      document.querySelector('#scenario').innerHTML = state.log.slice(0, 3).reverse().map(l => `<p>${l}</p>`).join('');
    }
    
    render();
  }

  render() {
    // Canvas rendering for main game
    const ctx = this.sceneManager.ctx;
    ctx.clearRect(0, 0, this.sceneManager.canvas.width, this.sceneManager.canvas.height);
    
    // Draw a simple map or location visualization
    this.drawLocationView(ctx);
  }

  drawLocationView(ctx) {
    const gradient = ctx.createRadialGradient(
      this.sceneManager.canvas.width / 2, 
      this.sceneManager.canvas.height / 2, 
      0,
      this.sceneManager.canvas.width / 2, 
      this.sceneManager.canvas.height / 2, 
      Math.max(this.sceneManager.canvas.width, this.sceneManager.canvas.height) / 2
    );
    gradient.addColorStop(0, '#1a1f48');
    gradient.addColorStop(1, '#0f1222');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.sceneManager.canvas.width, this.sceneManager.canvas.height);
    
    // Draw location name
    ctx.fillStyle = '#e9ebff';
    ctx.font = 'bold 20px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(`📍 ${state.location || 'Unknown Location'}`, this.sceneManager.canvas.width / 2, 50);
    
    // Draw simple location icon
    ctx.fillStyle = '#70f0c4';
    ctx.font = '48px system-ui';
    ctx.fillText('🏛️', this.sceneManager.canvas.width / 2, this.sceneManager.canvas.height / 2);
  }
}

// ----------------------------
// Game State Management
// ----------------------------
const LOCATIONS = ['Galilee','Jerusalem', 'Bethlehem', 'Damascus', 'Wilderness', 'Israel', 'Sea of Galilee', 'Babylon'];

const locationFlavors = {
  Galilee: [
    'You arrive by the Sea of Galilee as dawn gilds the water.',
    'Fishermen mend their nets; gulls arc over the tide.',
    'A hush falls as the wind softens across the shore.'
  ],
  Jerusalem: [
    'Stone steps climb toward the Temple courts, alive with voices.',
    'Shadows of pillars stretch long across the courtyard.',
    'Whispers of prophecy linger in the narrow streets.'
  ]
};

const questPool = {
  Galilee: [
    {
      id:'fishers_of_men',
      description:'Share the Good News with the villagers by the shore.',
      requirements:{faith:2},
      reward:{type:'title', value:'Fisher of Men'},
      scripture:'Matthew 4:19'
    },
    {
      id:'calm_the_storm',
      description:'Pray for calm as the winds rise over the sea.',
      requirements:{faith:4, wisdom:2},
      reward:{type:'miracle', value:'Calmed Storm'},
      scripture:'Mark 4:39'
    }
  ],
  Jerusalem: [
    {
      id:'teach_in_temple',
      description:'Engage in debate with the teachers in the temple courts.',
      requirements:{wisdom:3},
      reward:{type:'item', value:'Scroll of Insight'},
      scripture:'Luke 2:46-47'
    }
  ]
};

const milestones = {
  faith: { 5: { type:'miracle', value:'Parted Waters' } },
  wisdom:{ 5: { type:'miracle', value:'Prophetic Vision' } },
  service:{ 5: { type:'miracle', value:'Feeding the Multitude' } }
};

const locationBlessings = {
  Galilee: [
    {
      requirements:{faith:3},
      blessing:{type:'vision', value:'A net overflowing with fish — a promise of abundance.'},
      scripture:'Luke 5:6'
    }
  ],
  Jerusalem: [
    {
      requirements:{wisdom:4, service:2},
      blessing:{type:'favor', value:'The elders grant you access to the inner courts.'},
      scripture:'Acts 6:10'
    }
  ]
};

const choicesData = [
  { id:'faith_choice', label:'🙏 Wait upon the Lord\'s guidance', stat:'faith', scripture:'Isaiah 40:31' },
  { id:'wisdom_choice', label:'📖 Seek counsel from the elders', stat:'wisdom', scripture:'Proverbs 11:14' },
  { id:'service_choice', label:'🤝 Help the wounded traveler', stat:'service', scripture:'Luke 10:33–34' }
];

// State & persistence
const STORAGE_KEY = 'gospel_rpg_state_v2';

const defaultState = () => ({
  characterName: '',
  stats: { faith: 0, wisdom: 0, service: 0 },
  location: 'Galilee',
  rewards: [],
  items: [],
  title: '',
  achievedMilestones: {},
  currentQuest: null,
  log: []
});

let state = load();

function save() { 
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultState();
  } catch { 
    return defaultState();
  }
}

function reset() {
  state = defaultState();
  addLog('🔄 Progress reset.');
  sceneManager.switchTo('CharacterCreation');
}

// Helpers
const $ = sel => document.querySelector(sel);

function el(tag, props = {}, children = []) {
  const e = document.createElement(tag);
  Object.entries(props).forEach(([k, v]) => {
    if (k === 'class') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else e.setAttribute(k, v);
  });
  [].concat(children).forEach(c => {
    if (typeof c === 'string') e.appendChild(document.createTextNode(c));
    else if (c) e.appendChild(c);
  });
  return e;
}

const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const meets = (stats, reqs) => Object.entries(reqs).every(([s, val]) => (stats[s] || 0) >= val);
const rewardKey = r => `${r.type}:${r.value}`;
const hasReward = r => state.rewards.some(x => rewardKey(x) === rewardKey(r));

function addLog(line) {
  state.log.unshift(line);
  state.log = state.log.slice(0, 80);
}

// Core game systems (same as original)
function scenarioFor(location) {
  return pick(locationFlavors[location] || ['You continue on your way.']);
}

function assignQuest(location) {
  const pool = questPool[location] || [];
  const candidates = pool.filter(q => meets(state.stats, q.requirements));
  if (!candidates.length) return null;
  return pick(candidates);
}

function applyReward(reward) {
  if (!hasReward(reward)) state.rewards.push(reward);

  switch (reward.type) {
    case 'miracle':
      addLog(`🌟 Miracle! ${reward.value}`);
      return `🌟 Miracle! ${reward.value}`;
    case 'title':
      state.title = reward.value;
      addLog(`🏅 You are now known as "${reward.value}".`);
      return `🏅 You are now known as "${reward.value}".`;
    case 'item':
      if (!state.items.includes(reward.value)) state.items.push(reward.value);
      addLog(`📦 You obtained: ${reward.value}`);
      return `📦 You obtained: ${reward.value}`;
    case 'vision':
      addLog(`👁️ Vision: ${reward.value}`);
      return `👁️ Vision: ${reward.value}`;
    case 'favor':
      addLog(`💠 Favor: ${reward.value}`);
      return `💠 Favor: ${reward.value}`;
    default:
      return '';
  }
}

function checkMilestones() {
  const notes = [];
  for (const stat of Object.keys(milestones)) {
    const cur = state.stats[stat] || 0;
    const table = milestones[stat] || {};
    if (table[cur]) {
      const key = `${stat}:${cur}`;
      if (!state.achievedMilestones[key]) {
        state.achievedMilestones[key] = true;
        notes.push(applyReward(table[cur]));
      }
    }
  }
  return notes;
}

function checkLocationBlessings(location) {
  const list = locationBlessings[location] || [];
  const notes = [];
  list.forEach(b => {
    if (meets(state.stats, b.requirements)) {
      notes.push(`${applyReward(b.blessing)} (${b.scripture})`);
    }
  });
  return notes;
}

function enterLocation(location, { announce = true } = {}) {
  state.location = location;
  const lines = [];

  if (announce) {
    lines.push(`🧭 You arrive in ${location}.`);
  }
  lines.push(scenarioFor(location));

  const blessings = checkLocationBlessings(location);
  if (blessings.length) lines.push(...blessings);

  const q = assignQuest(location);
  state.currentQuest = q;
  if (q) {
    lines.push(`🗡️ Quest: ${q.description} (${q.scripture})`);
    const rewardMsg = applyReward(q.reward);
    lines.push(`✅ Quest Completed: ${q.description}`);
    if (rewardMsg) lines.push(rewardMsg);
  } else {
    lines.push('🗡️ No quests available yet. Grow in your stats to unlock more.');
  }

  addLog(lines.join(' '));
  const scenario = document.querySelector('#scenario');
  if (scenario) {
    scenario.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
  }
  save();
  
  // Update canvas if in main game scene
  if (sceneManager.currentScene && sceneManager.currentScene.name === 'MainGame') {
    sceneManager.currentScene.render();
  }
}

function handleChoice(choiceId) {
  const choice = choicesData.find(c => c.id === choiceId);
  if (!choice) return;

  const stat = choice.stat;
  state.stats[stat] = (state.stats[stat] || 0) + 1;

  const choiceLine = `✨ You chose: ${choice.label} (${choice.scripture})`;
  addLog(choiceLine);

  const milestoneNotes = checkMilestones();
  const nextIndex = (LOCATIONS.indexOf(state.location) + 1) % LOCATIONS.length;
  const nextLoc = LOCATIONS[nextIndex];

  const lines = [choiceLine];
  if (milestoneNotes.length) lines.push(...milestoneNotes);

  const scenario = document.querySelector('#scenario');
  if (scenario) {
    scenario.innerHTML = lines.map(l => `<p>${l}</p>`).join('');
  }

  setTimeout(() => {
    enterLocation(nextLoc);
    render();
  }, 400);

  render();
  save();
}

// UI functions
function render() {
  if (!document.querySelector('#locName')) return; // UI not ready

  document.querySelector('#locName').textContent = state.location;
  document.querySelector('#faithVal').textContent = state.stats.faith;
  document.querySelector('#wisdomVal').textContent = state.stats.wisdom;
  document.querySelector('#serviceVal').textContent = state.stats.service;

  const cap = v => Math.max(0, Math.min(10, v));
  document.querySelector('#faithBar').style.width = (cap(state.stats.faith) * 10) + '%';
  document.querySelector('#wisdomBar').style.width = (cap(state.stats.wisdom) * 10) + '%';
  document.querySelector('#serviceBar').style.width = (cap(state.stats.service) * 10) + '%';

  document.querySelector('#titleValue').textContent = state.title || 'No title yet';

  const rewardsBox = document.querySelector('#rewards');
  rewardsBox.innerHTML = '';
  if (!state.rewards.length) {
    rewardsBox.appendChild(el('div', { class: 'muted' }, ['No rewards yet']));
  } else {
    state.rewards.forEach(r => {
      rewardsBox.appendChild(el('span', { class: 'token' }, [`${iconFor(r.type)} ${r.value}`]));
    });
  }

  const qb = document.querySelector('#questBox');
  qb.innerHTML = '';
  if (state.currentQuest) {
    qb.appendChild(el('div', { class: 'stack' }, [
      el('div', { class: 'row' }, [el('span', { class: 'pill' }, [`📜 `, el('strong', {}, ['Description'])]), el('span', {}, [state.currentQuest.description])]),
      el('div', { class: 'row' }, [el('span', { class: 'pill' }, [`📖 `, el('strong', {}, ['Scripture'])]), el('span', {}, [state.currentQuest.scripture])]),
      el('div', { class: 'row' }, [el('span', { class: 'pill' }, [`🎯 `, el('strong', {}, ['Requirements'])]),
        el('span', {}, [reqText(state.currentQuest.requirements)])]),
      el('div', { class: 'row' }, [el('span', { class: 'pill' }, [`🎁 `, el('strong', {}, ['Reward'])]),
        el('span', {}, [`${state.currentQuest.reward.type}: ${state.currentQuest.reward.value}`])])
    ]));
  } else {
    qb.appendChild(el('div', { class: 'muted' }, ['No active quest.']));
  }

  const choices = document.querySelector('#choices');
  if (choices) {
    choices.innerHTML = '';
    choicesData.forEach(c => {
      const btn = el('button', { class: 'btn', id: c.id }, [c.label]);
      const sub = el('small', {}, [c.scripture]);
      const wrap = el('div', { class: 'choice' }, [btn, sub]);
      btn.addEventListener('click', () => handleChoice(c.id));
      choices.appendChild(wrap);
    });
  }

  const log = document.querySelector('#log');
  if (log) {
    log.innerHTML = state.log.map(line => `<p>${line}</p>`).join('');
  }
}

function iconFor(type) {
  switch (type) {
    case 'miracle': return '🌟';
    case 'title': return '🏅';
    case 'item': return '📦';
    case 'vision': return '👁️';
    case 'favor': return '💠';
    default: return '🎁';
  }
}

function reqText(reqs) {
  const parts = [];
  if ('faith' in reqs) parts.push(`Faith ${reqs.faith}+`);
  if ('wisdom' in reqs) parts.push(`Wisdom ${reqs.wisdom}+`);
  if ('service' in reqs) parts.push(`Service ${reqs.service}+`);
  return parts.join(', ') || 'None';
}

function initUI() {
  const sel = document.querySelector('#travelSelect');
  if (!sel) return;
  
  sel.innerHTML = '';
  LOCATIONS.forEach(loc => {
    const o = el('option', { value: loc }, [loc]);
    sel.appendChild(o);
  });
  sel.value = state.location;
  
  document.querySelector('#travelBtn').addEventListener('click', () => {
    const dest = sel.value;
    if (dest && dest !== state.location) {
      enterLocation(dest);
      render();
      save();
    }
  });
  
  document.querySelector('#resetBtn').addEventListener('click', reset);
}

// Store original game HTML for scene switching
const originalGameHTML = `
  <section class="card" aria-live="polite" aria-atomic="true">
    <h2>Adventure</h2>
    <div class="section stack">
      <div class="row" id="locationRow">
        <span class="pill">📍 <strong id="locName">Location</strong></span>
        <label class="pill" for="travelSelect">🧭 <strong>Travel</strong></label>
        <select id="travelSelect" aria-label="Choose destination"></select>
        <button class="btn" id="travelBtn">Go</button>
        <button class="btn" id="resetBtn" title="Clear progress">Reset</button>
      </div>

      <div class="stack">
        <div id="scenario" class="section" style="background:#0f132e;border:1px solid #262f68;border-radius:10px"></div>
        <div class="btn-row" id="choices"></div>
      </div>

      <div class="stack">
        <div class="kv">
          <div>Faith</div>
          <div class="bar" title="Faith"><i id="faithBar"></i></div>
          <div>Wisdom</div>
          <div class="bar" title="Wisdom"><i id="wisdomBar"></i></div>
          <div>Service</div>
          <div class="bar" title="Service"><i id="serviceBar"></i></div>
        </div>
        <div class="divider"></div>
        <div class="row">
          <div class="title-ribbon">🏅 <span id="titleValue">Service Title</span></div>
        </div>
      </div>

      <div>
        <h3 style="margin:8px 0 6px;font-size:14px;color:var(--muted);text-transform:uppercase;letter-spacing:.4px">Event log</h3>
        <div class="log" id="log" role="log" aria-live="polite"></div>
      </div>
    </div>
  </section>

  <aside class="card">
    <h2>Profile</h2>
    <div class="section stack">
      <div class="stack">
        <div class="row"><span class="pill">📊 <strong>Stats</strong></span></div>
        <div class="kv">
          <div>Faith:</div><div id="faithVal">0</div>
          <div>Wisdom:</div><div id="wisdomVal">0</div>
          <div>Service:</div><div id="serviceVal">0</div>
        </div>
      </div>

      <div class="divider"></div>

      <div class="stack">
        <div class="row"><span class="pill">🎁 <strong>Rewards:</strong></span></div>
        <div id="rewards" class="row"></div>
      </div>

      <div class="divider"></div>

      <div class="stack">
        <div class="row"><span class="pill">🗡️ <strong>Quest:</strong></span></div>
        <div id="questBox" class="stack"></div>
      </div>
    </div>
  </aside>
`;

// Global scene manager
let sceneManager = null;

// Game loop for animations
function gameLoop() {
  if (sceneManager) {
    sceneManager.update();
    sceneManager.render();
  }
  requestAnimationFrame(gameLoop);
}

// Initialize the game
window.addEventListener('DOMContentLoaded', () => {
  // Initialize scene manager
  sceneManager = new SceneManager();
  sceneManager.init('gameCanvas');
  
  // Register scenes
  sceneManager.registerScene('CharacterCreation', new CharacterCreationScene());
  sceneManager.registerScene('MainGame', new MainGameScene());
  
  // Start game loop
  gameLoop();
  
  // Determine starting scene
  if (!state.characterName) {
    sceneManager.switchTo('CharacterCreation');
  } else {
    sceneManager.switchTo('MainGame');
  }
});