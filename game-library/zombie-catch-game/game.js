// Game Configuration
const CONFIG = {
    GRID_SIZE: 50,
    CELL_SIZE: 14,
    INITIAL_PLAYERS: 7,
    INITIAL_ZOMBIES: 6,
    INFECTION_CHANCE: 0.65, // 65% chance
    ZOMBIE_SPEED: {
        day: 800,    // Slower during day
        night: 400   // Faster at night
    },
    PLAYER_SPEED: 200,
    DAY_LENGTH: 30000, // 30 seconds
    INFECTION_RANGE: 1,
    
    // Zones
    SURVIVOR_BLOCK: { x: 2, y: 2, width: 8, height: 8 },
    QUARANTINE_ZONE: { x: 42, y: 2, width: 6, height: 6 },
    LIQUIDATION_POINT: { x: 22, y: 42, width: 6, height: 6 },
    
    // Obstacles
    OBSTACLES: [
        // Vertical walls (avoiding zones)
        { x: 15, y: 10, width: 1, height: 15 },
        { x: 30, y: 15, width: 1, height: 20 },
        { x: 25, y: 10, width: 1, height: 12 },
        { x: 40, y: 20, width: 1, height: 18 },
        { x: 8, y: 30, width: 1, height: 10 },
        { x: 35, y: 12, width: 1, height: 10 },
        { x: 12, y: 15, width: 1, height: 8 },
        { x: 45, y: 25, width: 1, height: 12 },
        { x: 18, y: 35, width: 1, height: 6 },
        { x: 5, y: 12, width: 1, height: 15 },
        { x: 38, y: 10, width: 1, height: 8 },
        { x: 32, y: 35, width: 1, height: 6 },
        { x: 48, y: 10, width: 1, height: 15 },
        { x: 11, y: 20, width: 1, height: 10 },
        // Horizontal walls (avoiding zones)
        { x: 10, y: 25, width: 12, height: 1 },
        { x: 35, y: 35, width: 6, height: 1 },
        { x: 15, y: 18, width: 8, height: 1 },
        { x: 29, y: 41, width: 12, height: 1 },
        { x: 32, y: 10, width: 9, height: 1 },
        { x: 12, y: 12, width: 10, height: 1 },
        { x: 29, y: 30, width: 8, height: 1 },
        { x: 8, y: 20, width: 6, height: 1 },
        { x: 29, y: 49, width: 10, height: 1 },
        { x: 10, y: 41, width: 11, height: 1 },
        { x: 33, y: 22, width: 10, height: 1 },
        { x: 5, y: 28, width: 7, height: 1 },
        { x: 24, y: 18, width: 9, height: 1 },
        { x: 11, y: 11, width: 8, height: 1 },
        // L-shaped and corner walls (avoiding zones)
        { x: 20, y: 35, width: 1, height: 6 },
        { x: 15, y: 35, width: 5, height: 1 },
        { x: 45, y: 40, width: 1, height: 5 },
        { x: 45, y: 44, width: 4, height: 1 }
    ]
};

// Game State
const gameState = {
    running: false,
    paused: false,
    day: 1,
    isNight: false,
    survivalTime: 0,
    players: [],
    zombies: [],
    obstacles: [],
    selectedPlayer: null,
    resources: {
        food: 100,
        water: 100,
        weapons: 10,
        medicine: 5
    },
    eventLog: [],
    difficulty: 'medium'
};

// Canvas Setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;
canvas.height = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE;

// Helper Functions
function isObstacle(x, y) {
    return gameState.obstacles.some(obstacle => 
        x >= obstacle.x && x < obstacle.x + obstacle.width &&
        y >= obstacle.y && y < obstacle.y + obstacle.height
    );
}

// Entity Classes
class Player {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.infected = false;
        this.health = 100;
        this.hasWeapon = false;
        this.alive = true;
    }
    
    move(dx, dy) {
        const newX = Math.max(0, Math.min(CONFIG.GRID_SIZE - 1, this.x + dx));
        const newY = Math.max(0, Math.min(CONFIG.GRID_SIZE - 1, this.y + dy));
        
        // Check if new position is an obstacle
        if (isObstacle(newX, newY)) {
            addEvent('🚧 Blocked by obstacle!', 'event-info');
            return false;
        }
        
        // Check if in survivor block and trying to leave while infected
        if (this.infected && this.isInSurvivorBlock() && !this.isInSurvivorBlock(newX, newY)) {
            addEvent('🚫 Infected players cannot leave the Survivor Block!', 'event-info');
            return false;
        }
        
        this.x = newX;
        this.y = newY;
        
        // Check if entered liquidation point
        if (this.isInLiquidationPoint()) {
            if (this.infected) {
                addEvent(`💀 Infected player ${this.id} eliminated in Liquidation Point!`, 'event-kill');
                this.alive = false;
                return false;
            }
        }
        
        return true;
    }
    
    isInSurvivorBlock(x = this.x, y = this.y) {
        const sb = CONFIG.SURVIVOR_BLOCK;
        return x >= sb.x && x < sb.x + sb.width && y >= sb.y && y < sb.y + sb.height;
    }
    
    isInQuarantineZone() {
        const qz = CONFIG.QUARANTINE_ZONE;
        return this.x >= qz.x && this.x < qz.x + qz.width && 
               this.y >= qz.y && this.y < qz.y + qz.height;
    }
    
    isInLiquidationPoint() {
        const lp = CONFIG.LIQUIDATION_POINT;
        return this.x >= lp.x && this.x < lp.x + lp.width && 
               this.y >= lp.y && this.y < lp.y + lp.height;
    }
    
    infect() {
        if (!this.infected && !this.isInSurvivorBlock()) {
            this.infected = true;
            this.health = 50;
            addEvent(`😷 Player ${this.id} has been infected!`, 'event-infection');
            
            // Move to quarantine zone after short delay
            setTimeout(() => {
                if (this.alive && this.infected) {
                    const qz = CONFIG.QUARANTINE_ZONE;
                    this.x = qz.x + Math.floor(qz.width / 2);
                    this.y = qz.y + Math.floor(qz.height / 2);
                    addEvent(`🏥 Player ${this.id} moved to Quarantine Zone`, 'event-info');
                }
            }, 2000);
        }
    }
}

class Zombie {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.alive = true;
        this.moveCounter = 0;
    }
    
    move() {
        if (!this.alive) return;
        
        // Zombies avoid survivor block
        const sb = CONFIG.SURVIVOR_BLOCK;
        if (this.x >= sb.x && this.x < sb.x + sb.width && 
            this.y >= sb.y && this.y < sb.y + sb.height) {
            // Move away from survivor block
            if (this.x < sb.x + sb.width / 2) this.x--;
            else this.x++;
            return;
        }
        
        // Check if in liquidation point - kill zombie
        if (this.isInLiquidationPoint()) {
            this.alive = false;
            addEvent(`💀 Zombie ${this.id} eliminated in Liquidation Point!`, 'event-kill');
            return;
        }
        
        // Find nearest player
        let nearestPlayer = null;
        let minDistance = Infinity;
        
        gameState.players.forEach(player => {
            if (player.alive && !player.isInSurvivorBlock()) {
                const distance = Math.abs(this.x - player.x) + Math.abs(this.y - player.y);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPlayer = player;
                }
            }
        });
        
        // Move toward nearest player
        if (nearestPlayer) {
            const dx = nearestPlayer.x - this.x;
            const dy = nearestPlayer.y - this.y;
            
            let newX = this.x;
            let newY = this.y;
            
            if (Math.abs(dx) > Math.abs(dy)) {
                newX = this.x + Math.sign(dx);
            } else {
                newY = this.y + Math.sign(dy);
            }
            
            // Check if new position is blocked by obstacle
            if (!isObstacle(newX, newY)) {
                this.x = newX;
                this.y = newY;
            } else {
                // Try alternate direction if blocked
                if (Math.abs(dx) > Math.abs(dy)) {
                    newY = this.y + Math.sign(dy);
                    if (!isObstacle(this.x, newY)) {
                        this.y = newY;
                    }
                } else {
                    newX = this.x + Math.sign(dx);
                    if (!isObstacle(newX, this.y)) {
                        this.x = newX;
                    }
                }
            }
        } else {
            // Random movement if no target
            const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const newX = Math.max(0, Math.min(CONFIG.GRID_SIZE - 1, this.x + dir[0]));
            const newY = Math.max(0, Math.min(CONFIG.GRID_SIZE - 1, this.y + dir[1]));
            
            // Only move if not blocked
            if (!isObstacle(newX, newY)) {
                this.x = newX;
                this.y = newY;
            }
        }
        
        // Check for infection
        this.checkInfection();
    }
    
    checkInfection() {
        gameState.players.forEach(player => {
            if (player.alive && !player.infected) {
                const distance = Math.max(
                    Math.abs(this.x - player.x),
                    Math.abs(this.y - player.y)
                );
                
                if (distance <= CONFIG.INFECTION_RANGE) {
                    if (Math.random() < CONFIG.INFECTION_CHANCE) {
                        player.infect();
                    }
                }
            }
        });
    }
    
    isInLiquidationPoint() {
        const lp = CONFIG.LIQUIDATION_POINT;
        return this.x >= lp.x && this.x < lp.x + lp.width && 
               this.y >= lp.y && this.y < lp.y + lp.height;
    }
}

// Game Initialization
function initGame() {
    gameState.players = [];
    gameState.zombies = [];
    gameState.obstacles = CONFIG.OBSTACLES;
    gameState.selectedPlayer = null;
    gameState.day = 1;
    gameState.isNight = false;
    gameState.survivalTime = 0;
    gameState.eventLog = [];
    gameState.resources = { food: 100, water: 100, weapons: 10, medicine: 5 };
    
    // Apply difficulty settings
    switch (gameState.difficulty) {
        case 'easy':
            CONFIG.INFECTION_CHANCE = 0.5;
            CONFIG.INITIAL_ZOMBIES = 4;
            CONFIG.ZOMBIE_SPEED.day = 1000;
            CONFIG.ZOMBIE_SPEED.night = 600;
            break;
        case 'hard':
            CONFIG.INFECTION_CHANCE = 0.8;
            CONFIG.INITIAL_ZOMBIES = 8;
            CONFIG.ZOMBIE_SPEED.day = 600;
            CONFIG.ZOMBIE_SPEED.night = 300;
            break;
        default: // medium
            CONFIG.INFECTION_CHANCE = 0.65;
            CONFIG.INITIAL_ZOMBIES = 6;
            CONFIG.ZOMBIE_SPEED.day = 800;
            CONFIG.ZOMBIE_SPEED.night = 400;
    }
    
    // Create players in survivor block
    const sb = CONFIG.SURVIVOR_BLOCK;
    for (let i = 0; i < CONFIG.INITIAL_PLAYERS; i++) {
        const x = sb.x + Math.floor(Math.random() * sb.width);
        const y = sb.y + Math.floor(Math.random() * sb.height);
        gameState.players.push(new Player(i + 1, x, y));
    }
    
    // Create zombies (not in survivor block)
    for (let i = 0; i < CONFIG.INITIAL_ZOMBIES; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
            y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        } while (
            (x >= sb.x && x < sb.x + sb.width && y >= sb.y && y < sb.y + sb.height) ||
            isNearPlayers(x, y, 5) ||
            isObstacle(x, y)
        );
        gameState.zombies.push(new Zombie(i + 1, x, y));
    }
    
    clearEventLog();
    addEvent('🎮 Game Started! Survive as long as possible!', 'event-info');
    addEvent('💡 Use arrow keys to move selected player', 'event-info');
}

function isNearPlayers(x, y, range) {
    return gameState.players.some(p => 
        Math.abs(p.x - x) < range && Math.abs(p.y - y) < range
    );
}

// Rendering
function drawGrid() {
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= CONFIG.GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CONFIG.CELL_SIZE, 0);
        ctx.lineTo(i * CONFIG.CELL_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CONFIG.CELL_SIZE);
        ctx.lineTo(canvas.width, i * CONFIG.CELL_SIZE);
        ctx.stroke();
    }
}

function drawZones() {
    // Survivor Block
    ctx.fillStyle = 'rgba(46, 204, 113, 0.2)';
    ctx.fillRect(
        CONFIG.SURVIVOR_BLOCK.x * CONFIG.CELL_SIZE,
        CONFIG.SURVIVOR_BLOCK.y * CONFIG.CELL_SIZE,
        CONFIG.SURVIVOR_BLOCK.width * CONFIG.CELL_SIZE,
        CONFIG.SURVIVOR_BLOCK.height * CONFIG.CELL_SIZE
    );
    ctx.strokeStyle = '#2ecc71';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        CONFIG.SURVIVOR_BLOCK.x * CONFIG.CELL_SIZE,
        CONFIG.SURVIVOR_BLOCK.y * CONFIG.CELL_SIZE,
        CONFIG.SURVIVOR_BLOCK.width * CONFIG.CELL_SIZE,
        CONFIG.SURVIVOR_BLOCK.height * CONFIG.CELL_SIZE
    );
    
    // Quarantine Zone
    ctx.fillStyle = 'rgba(243, 156, 18, 0.2)';
    ctx.fillRect(
        CONFIG.QUARANTINE_ZONE.x * CONFIG.CELL_SIZE,
        CONFIG.QUARANTINE_ZONE.y * CONFIG.CELL_SIZE,
        CONFIG.QUARANTINE_ZONE.width * CONFIG.CELL_SIZE,
        CONFIG.QUARANTINE_ZONE.height * CONFIG.CELL_SIZE
    );
    ctx.strokeStyle = '#f39c12';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        CONFIG.QUARANTINE_ZONE.x * CONFIG.CELL_SIZE,
        CONFIG.QUARANTINE_ZONE.y * CONFIG.CELL_SIZE,
        CONFIG.QUARANTINE_ZONE.width * CONFIG.CELL_SIZE,
        CONFIG.QUARANTINE_ZONE.height * CONFIG.CELL_SIZE
    );
    
    // Liquidation Point
    ctx.fillStyle = 'rgba(155, 89, 182, 0.3)';
    ctx.fillRect(
        CONFIG.LIQUIDATION_POINT.x * CONFIG.CELL_SIZE,
        CONFIG.LIQUIDATION_POINT.y * CONFIG.CELL_SIZE,
        CONFIG.LIQUIDATION_POINT.width * CONFIG.CELL_SIZE,
        CONFIG.LIQUIDATION_POINT.height * CONFIG.CELL_SIZE
    );
    ctx.strokeStyle = '#9b59b6';
    ctx.lineWidth = 2;
    ctx.strokeRect(
        CONFIG.LIQUIDATION_POINT.x * CONFIG.CELL_SIZE,
        CONFIG.LIQUIDATION_POINT.y * CONFIG.CELL_SIZE,
        CONFIG.LIQUIDATION_POINT.width * CONFIG.CELL_SIZE,
        CONFIG.LIQUIDATION_POINT.height * CONFIG.CELL_SIZE
    );
}

function drawObstacles() {
    // Draw obstacles as thin walls (grid-edge style)
    gameState.obstacles.forEach(obstacle => {
        ctx.fillStyle = '#34495e';
        ctx.fillRect(
            obstacle.x * CONFIG.CELL_SIZE,
            obstacle.y * CONFIG.CELL_SIZE,
            obstacle.width * CONFIG.CELL_SIZE,
            obstacle.height * CONFIG.CELL_SIZE
        );
        
        // Add subtle border
        ctx.strokeStyle = '#2c3e50';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            obstacle.x * CONFIG.CELL_SIZE,
            obstacle.y * CONFIG.CELL_SIZE,
            obstacle.width * CONFIG.CELL_SIZE,
            obstacle.height * CONFIG.CELL_SIZE
        );
    });
}

function drawEntities() {
    // Draw players
    gameState.players.forEach(player => {
        if (!player.alive) return;
        
        const x = player.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const y = player.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const radius = CONFIG.CELL_SIZE * 0.8 - 1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        
        if (player.infected) {
            ctx.fillStyle = '#e67e22';
        } else {
            ctx.fillStyle = '#3498db';
        }
        ctx.fill();
        
        // Highlight selected player
        if (gameState.selectedPlayer === player) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        
        // Draw player number
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(player.id, x, y);
    });
    
    // Draw zombies
    gameState.zombies.forEach(zombie => {
        if (!zombie.alive) return;
        
        const x = zombie.x * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const y = zombie.y * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
        const radius = CONFIG.CELL_SIZE * 0.8 - 1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Draw Z symbol
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Z', x, y);
    });
}

function render() {
    drawGrid();
    drawZones();
    drawObstacles();
    drawEntities();
}

// Game Loop
let zombieTimer = null;
let dayNightTimer = null;
let survivalTimer = null;

function startGame() {
    if (gameState.running) return;
    
    initGame();
    gameState.running = true;
    gameState.paused = false;
    
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    document.getElementById('difficulty').disabled = true;
    
    render();
    startGameLoops();
    updateUI();
}

function startGameLoops() {
    // Zombie movement loop
    const zombieSpeed = gameState.isNight ? CONFIG.ZOMBIE_SPEED.night : CONFIG.ZOMBIE_SPEED.day;
    zombieTimer = setInterval(() => {
        if (!gameState.paused && gameState.running) {
            gameState.zombies.forEach(zombie => zombie.move());
            render();
            checkGameOver();
        }
    }, zombieSpeed);
    
    // Day/Night cycle
    dayNightTimer = setInterval(() => {
        if (!gameState.paused && gameState.running) {
            gameState.isNight = !gameState.isNight;
            if (!gameState.isNight) {
                gameState.day++;
                addEvent(`☀️ Day ${gameState.day} has begun!`, 'event-info');
                
                // Spawn more zombies at higher days
                if (gameState.day % 3 === 0) {
                    spawnZombie();
                }
            } else {
                addEvent('🌙 Night has fallen! Zombies move faster!', 'event-info');
            }
            
            // Restart zombie timer with new speed
            clearInterval(zombieTimer);
            const speed = gameState.isNight ? CONFIG.ZOMBIE_SPEED.night : CONFIG.ZOMBIE_SPEED.day;
            zombieTimer = setInterval(() => {
                if (!gameState.paused && gameState.running) {
                    gameState.zombies.forEach(zombie => zombie.move());
                    render();
                    checkGameOver();
                }
            }, speed);
            
            updateUI();
        }
    }, CONFIG.DAY_LENGTH);
    
    // Survival time counter
    survivalTimer = setInterval(() => {
        if (!gameState.paused && gameState.running) {
            gameState.survivalTime++;
            
            // Consume resources
            if (gameState.survivalTime % 10 === 0) {
                consumeResources();
            }
            
            updateUI();
        }
    }, 1000);
}

function spawnZombie() {
    const sb = CONFIG.SURVIVOR_BLOCK;
    let x, y;
    do {
        x = Math.floor(Math.random() * CONFIG.GRID_SIZE);
        y = Math.floor(Math.random() * CONFIG.GRID_SIZE);
    } while (
        (x >= sb.x && x < sb.x + sb.width && y >= sb.y && y < sb.y + sb.height) ||
        isNearPlayers(x, y, 5)
    );
    
    const newZombie = new Zombie(gameState.zombies.length + 1, x, y);
    gameState.zombies.push(newZombie);
    addEvent('🧟 A new zombie has appeared!', 'event-infection');
}

function consumeResources() {
    const alivePlayers = gameState.players.filter(p => p.alive).length;
    
    if (gameState.resources.food > 0) {
        gameState.resources.food = Math.max(0, gameState.resources.food - alivePlayers * 0.5);
    }
    if (gameState.resources.water > 0) {
        gameState.resources.water = Math.max(0, gameState.resources.water - alivePlayers * 0.5);
    }
    
    // If resources are depleted, players lose health
    if (gameState.resources.food === 0 || gameState.resources.water === 0) {
        gameState.players.forEach(player => {
            if (player.alive) {
                player.health = Math.max(0, player.health - 5);
                if (player.health === 0) {
                    player.alive = false;
                    addEvent(`💀 Player ${player.id} died from starvation!`, 'event-kill');
                }
            }
        });
    }
}

function pauseGame() {
    gameState.paused = !gameState.paused;
    const pauseBtn = document.getElementById('pauseBtn');
    pauseBtn.textContent = gameState.paused ? 'Resume' : 'Pause';
    
    if (gameState.paused) {
        showMessage('⏸️ GAME PAUSED');
    } else {
        hideMessage();
    }
}

function restartGame() {
    stopGame();
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('difficulty').disabled = false;
    document.getElementById('gameOverModal').classList.remove('show');
    hideMessage();
    
    // Clear canvas
    ctx.fillStyle = '#0f0f0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function stopGame() {
    gameState.running = false;
    gameState.paused = false;
    clearInterval(zombieTimer);
    clearInterval(dayNightTimer);
    clearInterval(survivalTimer);
}

function checkGameOver() {
    const alivePlayers = gameState.players.filter(p => p.alive && !p.infected).length;
    const aliveZombies = gameState.zombies.filter(z => z.alive).length;
    
    if (alivePlayers === 0) {
        gameOver('All survivors have been infected or died! 😢');
    } else if (aliveZombies === 0 && gameState.day >= 5) {
        gameOver('Victory! All zombies eliminated! 🎉');
    }
}

function gameOver(message) {
    stopGame();
    
    const modal = document.getElementById('gameOverModal');
    const messageEl = document.getElementById('gameOverMessage');
    const statsEl = document.getElementById('finalStats');
    
    messageEl.textContent = message;
    
    const alivePlayers = gameState.players.filter(p => p.alive).length;
    const infectedPlayers = gameState.players.filter(p => p.infected).length;
    const aliveZombies = gameState.zombies.filter(z => z.alive).length;
    
    statsEl.innerHTML = `
        <p><strong>Survival Time:</strong> ${gameState.survivalTime}s</p>
        <p><strong>Days Survived:</strong> ${gameState.day}</p>
        <p><strong>Survivors:</strong> ${alivePlayers - infectedPlayers}</p>
        <p><strong>Infected:</strong> ${infectedPlayers}</p>
        <p><strong>Zombies Remaining:</strong> ${aliveZombies}</p>
        <p><strong>Zombies Eliminated:</strong> ${gameState.zombies.length - aliveZombies}</p>
    `;
    
    modal.classList.add('show');
}

// UI Updates
function updateUI() {
    document.getElementById('day').textContent = gameState.day;
    document.getElementById('time').textContent = gameState.isNight ? '🌙 Night' : '☀️ Day';
    
    const alivePlayers = gameState.players.filter(p => p.alive && !p.infected).length;
    const infectedPlayers = gameState.players.filter(p => p.alive && p.infected).length;
    const aliveZombies = gameState.zombies.filter(z => z.alive).length;
    
    document.getElementById('survivors').textContent = alivePlayers;
    document.getElementById('infected').textContent = infectedPlayers;
    document.getElementById('zombies').textContent = aliveZombies;
    document.getElementById('survivalTime').textContent = gameState.survivalTime + 's';
    
    document.getElementById('food').textContent = Math.round(gameState.resources.food);
    document.getElementById('water').textContent = Math.round(gameState.resources.water);
    document.getElementById('weapons').textContent = gameState.resources.weapons;
    document.getElementById('medicine').textContent = gameState.resources.medicine;
    
    updatePlayerInfo();
}

function updatePlayerInfo() {
    const infoDiv = document.getElementById('playerInfo');
    
    if (gameState.selectedPlayer && gameState.selectedPlayer.alive) {
        const p = gameState.selectedPlayer;
        infoDiv.innerHTML = `
            <p><strong>Player ${p.id}</strong></p>
            <p>Status: ${p.infected ? '🤒 Infected' : '✅ Healthy'}</p>
            <p>Health: ${p.health}%</p>
            <p>Position: (${p.x}, ${p.y})</p>
            <p>Weapon: ${p.hasWeapon ? '🔫 Yes' : '❌ No'}</p>
            <p>${p.isInSurvivorBlock() ? '🏠 In Safe Zone' : ''}</p>
            <p>${p.isInQuarantineZone() ? '🏥 In Quarantine' : ''}</p>
            <p>${p.isInLiquidationPoint() ? '⚠️ In Liquidation Point' : ''}</p>
        `;
    } else {
        infoDiv.innerHTML = '<p>Click on a player to see details</p>';
    }
}

function addEvent(message, className = '') {
    gameState.eventLog.unshift({ message, className, time: Date.now() });
    if (gameState.eventLog.length > 50) {
        gameState.eventLog.pop();
    }
    updateEventLog();
}

function updateEventLog() {
    const logDiv = document.getElementById('eventLog');
    logDiv.innerHTML = gameState.eventLog
        .map(event => `<p class="${event.className}">${event.message}</p>`)
        .join('');
}

function clearEventLog() {
    gameState.eventLog = [];
    updateEventLog();
}

function showMessage(text) {
    const msg = document.getElementById('gameMessage');
    msg.textContent = text;
    msg.classList.add('show');
}

function hideMessage() {
    const msg = document.getElementById('gameMessage');
    msg.classList.remove('show');
}

// Event Listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', pauseGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('playAgainBtn').addEventListener('click', restartGame);

document.getElementById('difficulty').addEventListener('change', (e) => {
    gameState.difficulty = e.target.value;
});

canvas.addEventListener('click', (e) => {
    if (!gameState.running) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CONFIG.CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CONFIG.CELL_SIZE);
    
    // Find clicked player
    const clickedPlayer = gameState.players.find(p => 
        p.alive && p.x === x && p.y === y
    );
    
    if (clickedPlayer) {
        gameState.selectedPlayer = clickedPlayer;
        addEvent(`👆 Selected Player ${clickedPlayer.id}`, 'event-info');
        render();
        updateUI();
    }
});

document.addEventListener('keydown', (e) => {
    if (!gameState.running || gameState.paused) {
        if (e.key === ' ') {
            e.preventDefault();
            if (gameState.running) pauseGame();
        }
        if (e.key.toLowerCase() === 'r') {
            restartGame();
        }
        return;
    }
    
    if (!gameState.selectedPlayer || !gameState.selectedPlayer.alive) return;
    
    let moved = false;
    switch(e.key) {
        case 'ArrowUp':
            moved = gameState.selectedPlayer.move(0, -1);
            e.preventDefault();
            break;
        case 'ArrowDown':
            moved = gameState.selectedPlayer.move(0, 1);
            e.preventDefault();
            break;
        case 'ArrowLeft':
            moved = gameState.selectedPlayer.move(-1, 0);
            e.preventDefault();
            break;
        case 'ArrowRight':
            moved = gameState.selectedPlayer.move(1, 0);
            e.preventDefault();
            break;
        case ' ':
            e.preventDefault();
            pauseGame();
            return;
        case 'r':
        case 'R':
            restartGame();
            return;
    }
    
    if (moved) {
        render();
        updateUI();
    }
});

// Initialize
render();
updateUI();
