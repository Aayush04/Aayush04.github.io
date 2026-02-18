const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 400;
canvas.height = 600;

// Game variables
let gameRunning = false;
let gameOver = false;
let score = 0;
let level = 1;
let lives = 3;

// Player car
const playerCar = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 60,
    speed: 5,
    dx: 0,
    draw() {
        // Car body
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Car windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.x + 5, this.y + 10, 30, 15);
        ctx.fillRect(this.x + 5, this.y + 30, 30, 15);
        
        // Car wheels
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y - 5, 8, 8);
        ctx.fillRect(this.x + 27, this.y - 5, 8, 8);
        ctx.fillRect(this.x + 5, this.y + this.height - 3, 8, 8);
        ctx.fillRect(this.x + 27, this.y + this.height - 3, 8, 8);
    },
    update() {
        this.x += this.dx;
        
        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x + this.width > canvas.width) this.x = canvas.width - this.width;
    }
};

// Enemy cars
let enemyCars = [];

class EnemyCar {
    constructor() {
        this.width = 40;
        this.height = 60;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = -this.height;
        this.speed = 3 + level * 0.5;
        this.color = this.getRandomColor();
    }
    
    getRandomColor() {
        const colors = ['#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff'];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(this.x + 5, this.y + 10, 30, 15);
        
        // Wheels
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x + 5, this.y - 5, 8, 8);
        ctx.fillRect(this.x + 27, this.y - 5, 8, 8);
    }
    
    update() {
        this.y += this.speed;
    }
}

// Road markings
function drawRoad() {
    ctx.strokeStyle = '#ffff00';
    ctx.lineWidth = 3;
    ctx.setLineDash([20, 15]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Draw road edges
function drawRoadEdges() {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, canvas.height);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(canvas.width, 0);
    ctx.lineTo(canvas.width, canvas.height);
    ctx.stroke();
}

// Collision detection
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update game
function update() {
    if (!gameRunning || gameOver) return;
    
    // Update player
    playerCar.update();
    
    // Update enemy cars
    for (let i = enemyCars.length - 1; i >= 0; i--) {
        enemyCars[i].update();
        
        // Check collision
        if (checkCollision(playerCar, enemyCars[i])) {
            lives--;
            document.getElementById('lives').textContent = lives;
            enemyCars.splice(i, 1);
            
            if (lives <= 0) {
                endGame();
            }
            continue;
        }
        
        // Remove if off screen and add score
        if (enemyCars[i].y > canvas.height) {
            score += 10;
            document.getElementById('score').textContent = score;
            
            // Level up every 200 points
            if (score % 200 === 0 && score > 0) {
                level++;
                document.getElementById('level').textContent = level;
            }
            
            enemyCars.splice(i, 1);
        }
    }
    
    // Spawn new enemy cars
    if (Math.random() < 0.02 + level * 0.005) {
        enemyCars.push(new EnemyCar());
    }
}

// Draw game
function draw() {
    // Clear canvas with background
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road
    drawRoadEdges();
    drawRoad();
    
    // Draw player
    playerCar.draw();
    
    // Draw enemies
    enemyCars.forEach(car => car.draw());
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// End game
function endGame() {
    gameRunning = false;
    gameOver = true;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').classList.add('show');
}

// Restart game
function restartGame() {
    score = 0;
    level = 1;
    lives = 3;
    gameRunning = true;
    gameOver = false;
    enemyCars = [];
    
    playerCar.x = canvas.width / 2 - 20;
    playerCar.y = canvas.height - 80;
    playerCar.dx = 0;
    
    document.getElementById('score').textContent = score;
    document.getElementById('level').textContent = level;
    document.getElementById('lives').textContent = lives;
    document.getElementById('gameOverScreen').classList.remove('show');
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') playerCar.dx = -playerCar.speed;
    if (e.key === 'ArrowRight') playerCar.dx = playerCar.speed;
    if (e.key === ' ') {
        e.preventDefault();
        if (!gameRunning && !gameOver) gameRunning = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') playerCar.dx = 0;
});

// Mouse controls for mobile-like experience
document.addEventListener('mousemove', (e) => {
    if (gameRunning && !gameOver) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        
        if (mouseX < playerCar.x) {
            playerCar.dx = -playerCar.speed;
        } else if (mouseX > playerCar.x + playerCar.width) {
            playerCar.dx = playerCar.speed;
        } else {
            playerCar.dx = 0;
        }
    }
});

// Start game loop
gameLoop();
