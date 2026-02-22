// Need for Speed: Heat - Game Logic

class NeedForSpeedGame {
    constructor() {
        // Game state
        this.money = 10000;
        this.reputation = 0;
        this.currentScreen = 'main-menu';
        this.isRacing = false;
        this.isDayMode = true;
        
        // Current car
        this.currentCar = {
            name: 'Nissan 350Z',
            speed: 180,
            acceleration: 75,
            handling: 80,
            upgrades: {
                engine: 0,
                turbo: 0,
                suspension: 0,
                tires: 0
            }
        };
        
        // Available cars for purchase
        this.availableCars = [
            { name: 'Honda Civic Type R', price: 15000, speed: 200, acceleration: 80, handling: 85 },
            { name: 'BMW M3', price: 25000, speed: 230, acceleration: 85, handling: 88 },
            { name: 'Porsche 911', price: 45000, speed: 260, acceleration: 90, handling: 92 },
            { name: 'Lamborghini Huracan', price: 85000, speed: 310, acceleration: 95, handling: 90 }
        ];
        
        // Race state
        this.raceState = {
            speed: 0,
            maxSpeed: 0,
            position: 1,
            totalRacers: 4,
            lap: 1,
            totalLaps: 3,
            time: 0,
            nitrous: 100,
            isNitrousActive: false,
            isDrifting: false,
            damage: 0,
            policeHeat: 0,
            checkpointsPassed: 0,
            totalCheckpoints: 10
        };
        
        // Canvas and rendering
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.minimapCanvas = document.getElementById('minimap-canvas');
        this.minimapCtx = this.minimapCanvas ? this.minimapCanvas.getContext('2d') : null;
        
        // Player car position
        this.playerCar = {
            x: 0,
            y: 0,
            angle: 0,
            velocityX: 0,
            velocityY: 0
        };
        
        // AI cars
        this.aiCars = [];
        
        // Track - straight road
        this.track = {
            roadWidth: 400,
            roadLeft: 0,
            roadRight: 0,
            scrollPosition: 0, // Track how far we've scrolled
            finishLine: 10000 // Distance to finish line
        };
        
        // Road decorations (trees, buildings, etc.)
        this.roadDecorations = [];
        
        // Controls
        this.keys = {
            up: false,
            down: false,
            left: false,
            right: false,
            space: false,
            shift: false
        };
        
        // Timer
        this.raceTimer = null;
        this.animationFrame = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateUI();
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }
    
    handleKeyDown(e) {
        if (!this.isRacing) return;
        
        const key = e.key.toLowerCase();
        
        if (key === 'arrowup' || key === 'w') {
            this.keys.up = true;
        }
        if (key === 'arrowdown' || key === 's') {
            this.keys.down = true;
        }
        if (key === 'arrowleft' || key === 'a') {
            this.keys.left = true;
        }
        if (key === 'arrowright' || key === 'd') {
            this.keys.right = true;
        }
        if (key === ' ') {
            e.preventDefault();
            this.keys.space = true;
            this.activateNitrous();
        }
        if (key === 'shift') {
            this.keys.shift = true;
        }
    }
    
    handleKeyUp(e) {
        const key = e.key.toLowerCase();
        
        if (key === 'arrowup' || key === 'w') {
            this.keys.up = false;
        }
        if (key === 'arrowdown' || key === 's') {
            this.keys.down = false;
        }
        if (key === 'arrowleft' || key === 'a') {
            this.keys.left = false;
        }
        if (key === 'arrowright' || key === 'd') {
            this.keys.right = false;
        }
        if (key === ' ') {
            this.keys.space = false;
            this.deactivateNitrous();
        }
        if (key === 'shift') {
            this.keys.shift = false;
        }
    }
    
    resizeCanvas() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }
    
    // UI Methods
    showMainMenu() {
        this.hideAllScreens();
        document.getElementById('main-menu').classList.remove('hidden');
        this.currentScreen = 'main-menu';
        this.updateUI();
    }
    
    showGarage() {
        this.hideAllScreens();
        document.getElementById('garage-screen').classList.remove('hidden');
        this.currentScreen = 'garage';
        this.updateGarageUI();
    }
    
    showControls() {
        this.hideAllScreens();
        document.getElementById('controls-screen').classList.remove('hidden');
        this.currentScreen = 'controls';
    }
    
    hideAllScreens() {
        const screens = ['main-menu', 'garage-screen', 'controls-screen', 'race-screen', 'results-screen'];
        screens.forEach(screen => {
            document.getElementById(screen).classList.add('hidden');
        });
    }
    
    updateUI() {
        document.getElementById('money').textContent = `$${this.money.toLocaleString()}`;
        document.getElementById('reputation').textContent = this.reputation;
    }
    
    updateGarageUI() {
        // Update current car info
        document.getElementById('car-name').textContent = this.currentCar.name;
        document.getElementById('speed-stat').textContent = this.currentCar.speed;
        document.getElementById('accel-stat').textContent = this.currentCar.acceleration;
        document.getElementById('handling-stat').textContent = this.currentCar.handling;
        
        // Update stat bars
        document.getElementById('speed-bar').style.width = `${(this.currentCar.speed / 350) * 100}%`;
        document.getElementById('accel-bar').style.width = `${this.currentCar.acceleration}%`;
        document.getElementById('handling-bar').style.width = `${this.currentCar.handling}%`;
        
        // Populate car shop
        const carShop = document.getElementById('car-shop');
        carShop.innerHTML = '';
        
        this.availableCars.forEach((car, index) => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card';
            carCard.innerHTML = `
                <div class="car-info">
                    <div class="car-name">🚗 ${car.name}</div>
                    <div class="car-specs">Speed: ${car.speed} | Accel: ${car.acceleration} | Handling: ${car.handling}</div>
                </div>
                <div class="car-price">$${car.price.toLocaleString()}</div>
            `;
            carCard.onclick = () => this.buyCar(index);
            carShop.appendChild(carCard);
        });
    }
    
    // Upgrade System
    buyUpgrade(type) {
        const upgradePrices = {
            engine: 2500,
            turbo: 3000,
            suspension: 1500,
            tires: 1000
        };
        
        const price = upgradePrices[type];
        
        if (this.money < price) {
            this.showMessage('❌ Not enough money!');
            return;
        }
        
        if (this.currentCar.upgrades[type] >= 3) {
            this.showMessage('⚠️ Maximum upgrade level reached!');
            return;
        }
        
        this.money -= price;
        this.currentCar.upgrades[type]++;
        
        // Apply upgrade effects
        switch(type) {
            case 'engine':
                this.currentCar.speed += 15;
                this.currentCar.acceleration += 5;
                break;
            case 'turbo':
                this.currentCar.speed += 20;
                this.currentCar.acceleration += 8;
                break;
            case 'suspension':
                this.currentCar.handling += 5;
                break;
            case 'tires':
                this.currentCar.handling += 3;
                this.currentCar.acceleration += 3;
                break;
        }
        
        this.updateUI();
        this.updateGarageUI();
        this.showMessage(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} upgraded!`);
    }
    
    buyCar(index) {
        const car = this.availableCars[index];
        
        if (this.money < car.price) {
            this.showMessage('❌ Not enough money!');
            return;
        }
        
        this.money -= car.price;
        this.currentCar = {
            name: car.name,
            speed: car.speed,
            acceleration: car.acceleration,
            handling: car.handling,
            upgrades: {
                engine: 0,
                turbo: 0,
                suspension: 0,
                tires: 0
            }
        };
        
        this.updateUI();
        this.updateGarageUI();
        this.showMessage(`✅ Purchased ${car.name}!`);
    }
    
    showMessage(message) {
        const msgElement = document.getElementById('warning-message');
        if (msgElement) {
            msgElement.textContent = message;
            setTimeout(() => {
                msgElement.textContent = '';
            }, 3000);
        }
    }
    
    // Race Methods
    startDayRace() {
        this.isDayMode = true;
        this.startRace();
    }
    
    startNightRace() {
        this.isDayMode = false;
        this.startRace();
    }
    
    startRace() {
        this.hideAllScreens();
        document.getElementById('race-screen').classList.remove('hidden');
        this.currentScreen = 'race';
        
        // Update time mode
        const timeModeElement = document.getElementById('time-mode');
        if (this.isDayMode) {
            timeModeElement.textContent = '☀️ DAY MODE';
            timeModeElement.className = 'day-mode';
            document.getElementById('police-warning').classList.add('hidden');
        } else {
            timeModeElement.textContent = '🌙 NIGHT MODE';
            timeModeElement.className = 'night-mode';
        }
        
        // Reset race state
        this.raceState = {
            speed: 0,
            maxSpeed: this.currentCar.speed,
            position: 1, // Everyone starts in position 1
            totalRacers: 4,
            lap: 1,
            totalLaps: 3,
            time: 0,
            nitrous: 100,
            isNitrousActive: false,
            isDrifting: false,
            damage: 0,
            policeHeat: 0,
            distance: 0, // Distance traveled
            totalDistance: 10000, // Total race distance
            countdown: 3, // Countdown from 3
            raceStarted: false // Race hasn't started yet
        };
        
        // Initialize player car - center of road at starting line
        const roadCenterX = this.canvas.width / 2;
        this.playerCar = {
            x: roadCenterX,
            y: this.canvas.height - 200,
            angle: 0,
            velocityX: 0,
            velocityY: 0
        };
        
        // Initialize AI cars
        this.initAICars();
        
        // Initialize track
        this.initTrack();
        
        this.isRacing = true;
        
        // Start countdown
        this.startCountdown();
        
        // Start game loop immediately (for rendering countdown)
        this.gameLoop();
    }
    
    startCountdown() {
        const countdownInterval = setInterval(() => {
            this.raceState.countdown--;
            
            if (this.raceState.countdown === 0) {
                // Show "GO!"
                setTimeout(() => {
                    this.raceState.countdown = -1; // Hide countdown
                    this.raceState.raceStarted = true;
                    
                    // Start race timer
                    this.raceTimer = setInterval(() => {
                        this.raceState.time++;
                        this.updateRaceHUD();
                    }, 1000);
                }, 500);
                clearInterval(countdownInterval);
            }
        }, 1000);
    }
    
    initAICars() {
        this.aiCars = [];
        const roadCenterX = this.canvas.width / 2;
        const laneWidth = this.track.roadWidth / 4;
        
        // All cars start at the starting line (distance = 0)
        for (let i = 0; i < 3; i++) {
            const lane = Math.floor(Math.random() * 3) - 1; // -1, 0, or 1
            this.aiCars.push({
                x: roadCenterX + (lane * laneWidth),
                y: this.canvas.height - 200 - (i * 80), // Slightly staggered on starting line
                speed: 140 + Math.random() * 30, // Reduced speed range: 140-170
                distance: 0, // All start at 0 distance
                lane: lane,
                targetX: roadCenterX + (lane * laneWidth),
                laneChangeTimer: 0
            });
        }
    }
    
    initTrack() {
        // Set road boundaries
        this.track.roadLeft = this.canvas.width / 2 - this.track.roadWidth / 2;
        this.track.roadRight = this.canvas.width / 2 + this.track.roadWidth / 2;
        this.track.scrollPosition = 0;
        
        // Generate road decorations
        this.roadDecorations = [];
        for (let i = 0; i < 50; i++) {
            const side = Math.random() < 0.5 ? 'left' : 'right';
            const xPos = side === 'left' ? 
                this.track.roadLeft - 50 - Math.random() * 100 :
                this.track.roadRight + 50 + Math.random() * 100;
            
            this.roadDecorations.push({
                x: xPos,
                y: -i * 200 - Math.random() * 200,
                type: Math.random() < 0.5 ? 'tree' : 'building',
                side: side
            });
        }
    }
    
    gameLoop() {
        if (!this.isRacing) return;
        
        this.update();
        this.render();
        
        this.animationFrame = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        // Don't update car movement during countdown
        if (this.raceState.raceStarted) {
            // Update player car physics
            this.updatePlayerCar();
            
            // Update AI cars
            this.updateAICars();
            
            // Update race distance and position
            this.updateRaceProgress();
            
            // Regenerate nitrous
            if (this.raceState.nitrous < 100 && !this.raceState.isNitrousActive) {
                this.raceState.nitrous += 0.2;
            }
            
            // Night mode police
            if (!this.isDayMode && this.raceState.speed > 200) {
                this.raceState.policeHeat += 0.01;
                if (this.raceState.policeHeat > 20) {
                    this.showPoliceWarning();
                }
            }
            
            // Check if race is complete - only when player crosses finish line visually
            const distanceToFinish = this.raceState.totalDistance - this.raceState.distance;
            if (distanceToFinish < 500) {
                const finishY = this.canvas.height / 2 - (distanceToFinish * 0.5);
                const playerY = this.canvas.height - 200;
                
                // End race when finish line passes player car position
                if (finishY >= playerY) {
                    this.endRace();
                }
            }
        }
        
        // Update HUD
        this.updateRaceHUD();
    }
    
    updatePlayerCar() {
        const acceleration = this.currentCar.acceleration / 100;
        const handling = this.currentCar.handling / 100;
        
        // Acceleration
        if (this.keys.up) {
            const maxSpeed = this.raceState.isNitrousActive ? 
                this.raceState.maxSpeed * 1.5 : this.raceState.maxSpeed;
            this.raceState.speed = Math.min(this.raceState.speed + acceleration * 2, maxSpeed);
        }
        
        // Braking
        if (this.keys.down) {
            this.raceState.speed = Math.max(this.raceState.speed - acceleration * 3, -50);
        }
        
        // Natural deceleration
        if (!this.keys.up && !this.keys.down) {
            this.raceState.speed *= 0.98;
        }
        
        // Horizontal steering (left/right movement)
        const moveSpeed = 5 * handling;
        if (this.keys.left && this.raceState.speed > 10) {
            this.playerCar.x -= moveSpeed;
        }
        if (this.keys.right && this.raceState.speed > 10) {
            this.playerCar.x += moveSpeed;
        }
        
        // Enforce road boundaries - car cannot cross
        const carWidth = 40;
        if (this.playerCar.x - carWidth/2 < this.track.roadLeft) {
            this.playerCar.x = this.track.roadLeft + carWidth/2;
            // Hit boundary - reduce speed and add damage
            this.raceState.speed *= 0.8;
            this.raceState.damage += 0.5;
            this.showMessage('⚠️ Stay on the road!');
        }
        if (this.playerCar.x + carWidth/2 > this.track.roadRight) {
            this.playerCar.x = this.track.roadRight - carWidth/2;
            // Hit boundary - reduce speed and add damage
            this.raceState.speed *= 0.8;
            this.raceState.damage += 0.5;
            this.showMessage('⚠️ Stay on the road!');
        }
        
        // Drifting
        this.raceState.isDrifting = this.keys.shift && this.raceState.speed > 80;
        
        // Update distance traveled
        this.raceState.distance += this.raceState.speed * 0.1;
        
        // Scroll the world (move decorations and AI cars down)
        const scrollSpeed = this.raceState.speed * 0.1;
        this.track.scrollPosition += scrollSpeed;
        
        // Move road decorations
        this.roadDecorations.forEach(deco => {
            deco.y += scrollSpeed;
            
            // Respawn decoration at top if it goes off bottom
            if (deco.y > this.canvas.height + 100) {
                deco.y = -100 - Math.random() * 200;
            }
        });
    }
    
    updateAICars() {
        const roadCenterX = this.canvas.width / 2;
        const laneWidth = this.track.roadWidth / 4;
        
        this.aiCars.forEach(ai => {
            // More realistic AI speed variation - slower and more stable
            ai.speed += (Math.random() - 0.5) * 0.5;
            ai.speed = Math.max(130, Math.min(160, ai.speed)); // Reduced max speed: 130-160
            
            // AI distance traveled (they move forward independently)
            ai.distance += ai.speed * 0.1;
            
            // Calculate visual Y position based on distance from player
            // Distance difference determines where AI car appears on screen
            const distanceDiff = ai.distance - this.raceState.distance;
            
            // Convert distance difference to screen position
            // Negative distanceDiff = AI is behind = lower on screen (higher Y)
            // Positive distanceDiff = AI is ahead = higher on screen (lower Y)
            const playerCarY = this.canvas.height - 200;
            ai.y = playerCarY - (distanceDiff * 0.5);
            
            // AI cars are only rendered if they're on or near the screen
            // (The render function will check this)
            
            // Smooth lane changing
            ai.laneChangeTimer++;
            if (ai.laneChangeTimer > 200 && Math.random() < 0.02) {
                // Change lane occasionally
                const newLane = Math.floor(Math.random() * 3) - 1;
                ai.lane = newLane;
                ai.targetX = roadCenterX + (newLane * laneWidth);
                ai.laneChangeTimer = 0;
            }
            
            // Smooth movement toward target lane
            if (Math.abs(ai.x - ai.targetX) > 2) {
                const moveSpeed = 3;
                if (ai.x < ai.targetX) {
                    ai.x += moveSpeed;
                } else {
                    ai.x -= moveSpeed;
                }
            } else {
                ai.x = ai.targetX;
            }
        });
    }
    
    updateRaceProgress() {
        // Update position based on distance
        let playersAhead = 0;
        this.aiCars.forEach(ai => {
            if (ai.distance > this.raceState.distance) {
                playersAhead++;
            }
        });
        this.raceState.position = playersAhead + 1;
        
        // Update lap based on distance
        const lapDistance = this.raceState.totalDistance / this.raceState.totalLaps;
        this.raceState.lap = Math.min(
            Math.floor(this.raceState.distance / lapDistance) + 1,
            this.raceState.totalLaps
        );
    }
    
    activateNitrous() {
        if (this.raceState.nitrous > 10) {
            this.raceState.isNitrousActive = true;
        }
    }
    
    deactivateNitrous() {
        this.raceState.isNitrousActive = false;
    }
    
    showPoliceWarning() {
        const policeWarning = document.getElementById('police-warning');
        if (policeWarning && this.raceState.policeHeat > 20) {
            policeWarning.classList.remove('hidden');
            const stars = Math.min(5, Math.floor(this.raceState.policeHeat / 20));
            document.getElementById('heat-level').textContent = 
                `Heat Level: ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`;
        }
    }
    
    updateRaceHUD() {
        document.getElementById('speed-display').textContent = Math.floor(this.raceState.speed);
        document.getElementById('lap-counter').textContent = 
            `Lap ${Math.min(this.raceState.lap, this.raceState.totalLaps)}/${this.raceState.totalLaps}`;
        
        const minutes = Math.floor(this.raceState.time / 60);
        const seconds = this.raceState.time % 60;
        document.getElementById('race-timer').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const nitrousBar = document.getElementById('nitrous-bar');
        if (nitrousBar) {
            nitrousBar.style.width = `${this.raceState.nitrous}%`;
        }
        
        if (this.raceState.isNitrousActive && this.raceState.nitrous > 0) {
            this.raceState.nitrous -= 0.5;
        }
        
        const positionSuffix = ['st', 'nd', 'rd', 'th'];
        const suffix = positionSuffix[Math.min(this.raceState.position - 1, 3)];
        document.getElementById('position-display').textContent = 
            `${this.raceState.position}${suffix} / ${this.raceState.totalRacers}`;
    }
    
    render() {
        if (!this.ctx) return;
        
        // Clear canvas - sky/background
        if (this.isDayMode) {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#87ceeb');
            gradient.addColorStop(1, '#e0e0e0');
            this.ctx.fillStyle = gradient;
        } else {
            const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            gradient.addColorStop(0, '#1a1a2e');
            gradient.addColorStop(1, '#0f0f1e');
            this.ctx.fillStyle = gradient;
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw road decorations (trees, buildings) behind road
        this.roadDecorations.forEach(deco => {
            if (deco.type === 'tree') {
                // Tree
                this.ctx.fillStyle = this.isDayMode ? '#2d5016' : '#1a3010';
                this.ctx.beginPath();
                this.ctx.arc(deco.x, deco.y, 20, 0, Math.PI * 2);
                this.ctx.fill();
                // Trunk
                this.ctx.fillStyle = this.isDayMode ? '#654321' : '#3a2510';
                this.ctx.fillRect(deco.x - 5, deco.y + 15, 10, 20);
            } else {
                // Building
                this.ctx.fillStyle = this.isDayMode ? '#808080' : '#404040';
                this.ctx.fillRect(deco.x - 30, deco.y - 40, 60, 80);
                // Windows
                this.ctx.fillStyle = this.isDayMode ? '#ffff00' : '#ff8800';
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 4; j++) {
                        this.ctx.fillRect(deco.x - 25 + i * 20, deco.y - 35 + j * 18, 12, 12);
                    }
                }
            }
        });
        
        // Draw road surface
        this.ctx.fillStyle = this.isDayMode ? '#404040' : '#2a2a3e';
        this.ctx.fillRect(this.track.roadLeft, 0, this.track.roadWidth, this.canvas.height);
        
        // Draw road markings (center line and lane dividers)
        this.ctx.strokeStyle = this.isDayMode ? '#ffff00' : '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.setLineDash([30, 20]);
        
        // Center line
        const centerX = this.canvas.width / 2;
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, 0);
        this.ctx.lineTo(centerX, this.canvas.height);
        this.ctx.stroke();
        
        // Left lane divider
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - this.track.roadWidth / 4, 0);
        this.ctx.lineTo(centerX - this.track.roadWidth / 4, this.canvas.height);
        this.ctx.stroke();
        
        // Right lane divider
        this.ctx.beginPath();
        this.ctx.moveTo(centerX + this.track.roadWidth / 4, 0);
        this.ctx.lineTo(centerX + this.track.roadWidth / 4, this.canvas.height);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
        
        // Draw road boundaries (edges)
        this.ctx.strokeStyle = this.isDayMode ? '#ffffff' : '#888888';
        this.ctx.lineWidth = 5;
        
        // Left boundary
        this.ctx.beginPath();
        this.ctx.moveTo(this.track.roadLeft, 0);
        this.ctx.lineTo(this.track.roadLeft, this.canvas.height);
        this.ctx.stroke();
        
        // Right boundary
        this.ctx.beginPath();
        this.ctx.moveTo(this.track.roadRight, 0);
        this.ctx.lineTo(this.track.roadRight, this.canvas.height);
        this.ctx.stroke();
        
        // Draw distance markers
        const markerInterval = 1000;
        const currentMarker = Math.floor(this.raceState.distance / markerInterval);
        for (let i = currentMarker - 1; i <= currentMarker + 3; i++) {
            const markerDistance = i * markerInterval;
            const offset = (markerDistance - this.raceState.distance) * 0.5;
            const markerY = this.canvas.height / 2 - offset;
            
            if (markerY > -50 && markerY < this.canvas.height + 50) {
                this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                this.ctx.font = 'bold 20px Arial';
                this.ctx.fillText(`${markerDistance}m`, this.track.roadLeft - 80, markerY);
            }
        }
        
        // Draw AI cars (only if they're visible on screen)
        this.aiCars.forEach(ai => {
            // Only draw AI cars that are within visible range
            // Add buffer zone so they smoothly appear/disappear
            if (ai.y > -100 && ai.y < this.canvas.height + 100) {
                this.ctx.save();
                this.ctx.translate(ai.x, ai.y);
                
                // Car body
                this.ctx.fillStyle = '#ff3333';
                this.ctx.fillRect(-20, -35, 40, 70);
                
                // Car windows
                this.ctx.fillStyle = '#000000';
                this.ctx.fillRect(-15, -25, 30, 20);
                
                // Headlights (front)
                this.ctx.fillStyle = this.isDayMode ? '#ffff88' : '#ffffff';
                this.ctx.fillRect(-15, -38, 10, 5);
                this.ctx.fillRect(5, -38, 10, 5);
                
                this.ctx.restore();
            }
        });
        
        // Draw player car
        this.ctx.save();
        this.ctx.translate(this.playerCar.x, this.playerCar.y);
        
        // Car body
        this.ctx.fillStyle = '#00e5ff';
        this.ctx.fillRect(-20, -35, 40, 70);
        
        // Car windows
        this.ctx.fillStyle = '#1a1a2e';
        this.ctx.fillRect(-15, -25, 30, 20);
        
        // Headlights (front)
        this.ctx.fillStyle = this.isDayMode ? '#ffff88' : '#ffffff';
        this.ctx.fillRect(-15, -38, 10, 5);
        this.ctx.fillRect(5, -38, 10, 5);
        
        // Drift smoke
        if (this.raceState.isDrifting) {
            this.ctx.fillStyle = 'rgba(200, 200, 200, 0.5)';
            this.ctx.beginPath();
            this.ctx.arc(-25, 30, 15, 0, Math.PI * 2);
            this.ctx.arc(25, 30, 15, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        // Nitrous effect
        if (this.raceState.isNitrousActive) {
            this.ctx.fillStyle = 'rgba(0, 229, 255, 0.8)';
            this.ctx.beginPath();
            this.ctx.arc(-15, 40, 10, 0, Math.PI * 2);
            this.ctx.arc(15, 40, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
        
        // Draw finish line if close
        const distanceToFinish = this.raceState.totalDistance - this.raceState.distance;
        if (distanceToFinish < 500) {
            const finishY = this.canvas.height / 2 - (distanceToFinish * 0.5);
            if (finishY > 0 && finishY < this.canvas.height) {
                // Checkered pattern
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(this.track.roadLeft, finishY - 20, this.track.roadWidth, 40);
                this.ctx.fillStyle = '#000000';
                const squareSize = 20;
                for (let x = 0; x < this.track.roadWidth / squareSize; x++) {
                    for (let y = 0; y < 2; y++) {
                        if ((x + y) % 2 === 0) {
                            this.ctx.fillRect(
                                this.track.roadLeft + x * squareSize,
                                finishY - 20 + y * squareSize,
                                squareSize,
                                squareSize
                            );
                        }
                    }
                }
            }
        }
        
        // Draw countdown overlay
        if (this.raceState.countdown > 0) {
            // Semi-transparent overlay
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Countdown number
            this.ctx.save();
            this.ctx.font = 'bold 150px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            // Gradient text
            const gradient = this.ctx.createLinearGradient(
                this.canvas.width / 2 - 75,
                this.canvas.height / 2 - 75,
                this.canvas.width / 2 + 75,
                this.canvas.height / 2 + 75
            );
            gradient.addColorStop(0, '#00e5ff');
            gradient.addColorStop(1, '#0091ea');
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 5;
            
            this.ctx.strokeText(this.raceState.countdown.toString(), this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText(this.raceState.countdown.toString(), this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.restore();
        } else if (this.raceState.countdown === 0) {
            // Show "GO!"
            this.ctx.save();
            this.ctx.font = 'bold 120px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.textBaseline = 'middle';
            
            const gradient = this.ctx.createLinearGradient(
                this.canvas.width / 2 - 60,
                this.canvas.height / 2 - 60,
                this.canvas.width / 2 + 60,
                this.canvas.height / 2 + 60
            );
            gradient.addColorStop(0, '#00ff88');
            gradient.addColorStop(1, '#00e5ff');
            
            this.ctx.fillStyle = gradient;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 5;
            
            this.ctx.strokeText('GO!', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.fillText('GO!', this.canvas.width / 2, this.canvas.height / 2);
            
            this.ctx.restore();
        }
        
        // Draw minimap
        this.drawMinimap();
    }
    
    drawMinimap() {
        if (!this.minimapCtx) return;
        
        const ctx = this.minimapCtx;
        const size = 150;
        
        // Clear
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(0, 0, size, size);
        
        // Draw road as vertical rectangle
        ctx.fillStyle = '#404040';
        const roadWidth = 40;
        const roadLeft = size / 2 - roadWidth / 2;
        ctx.fillRect(roadLeft, 0, roadWidth, size);
        
        // Draw road edges
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(roadLeft, 0, roadWidth, size);
        
        // Calculate positions based on distance
        const progress = this.raceState.distance / this.raceState.totalDistance;
        
        // Draw player position
        const py = size - (progress * size);
        const px = size / 2;
        
        ctx.fillStyle = '#00e5ff';
        ctx.beginPath();
        ctx.arc(px, py, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw AI cars
        this.aiCars.forEach(ai => {
            const aiProgress = ai.distance / this.raceState.totalDistance;
            const ay = size - (aiProgress * size);
            const ax = size / 2 + ((ai.lane || 0) * 10); // Offset by lane
            
            ctx.fillStyle = '#ff3333';
            ctx.beginPath();
            ctx.arc(ax, ay, 4, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw finish line
        ctx.strokeStyle = '#00ff88';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(roadLeft, 0);
        ctx.lineTo(roadLeft + roadWidth, 0);
        ctx.stroke();
    }
    
    endRace() {
        this.isRacing = false;
        clearInterval(this.raceTimer);
        cancelAnimationFrame(this.animationFrame);
        
        // Calculate rewards
        const baseReward = this.isDayMode ? 3000 : 5000;
        const positionMultiplier = [2, 1.5, 1, 0.5][this.raceState.position - 1] || 0.5;
        const moneyEarned = Math.floor(baseReward * positionMultiplier);
        const repEarned = this.isDayMode ? 50 : 150;
        
        // Police fine for night races
        const policeFine = !this.isDayMode ? Math.floor(this.raceState.policeHeat * 50) : 0;
        
        // Damage cost
        const damageCost = Math.floor(this.raceState.damage * 100);
        
        // Update totals
        this.money += moneyEarned - policeFine - damageCost;
        this.reputation += repEarned;
        
        // Show results
        this.showResults(moneyEarned, repEarned, policeFine, damageCost);
        
        this.updateUI();
    }
    
    showResults(moneyEarned, repEarned, policeFine, damageCost) {
        this.hideAllScreens();
        document.getElementById('results-screen').classList.remove('hidden');
        
        const positionText = ['🥇 1st Place!', '🥈 2nd Place', '🥉 3rd Place', '4th Place'][this.raceState.position - 1] || '4th Place';
        document.getElementById('result-title').textContent = positionText;
        
        const positionSuffix = ['st', 'nd', 'rd', 'th'];
        const suffix = positionSuffix[Math.min(this.raceState.position - 1, 3)];
        document.getElementById('final-position').textContent = `${this.raceState.position}${suffix}`;
        
        const minutes = Math.floor(this.raceState.time / 60);
        const seconds = this.raceState.time % 60;
        document.getElementById('final-time').textContent = 
            `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('money-earned').textContent = `+$${moneyEarned.toLocaleString()}`;
        document.getElementById('rep-earned').textContent = `+${repEarned}`;
        
        const damageCostItem = document.getElementById('damage-cost-item');
        if (damageCost > 0 || policeFine > 0) {
            const totalCost = damageCost + policeFine;
            document.getElementById('damage-cost').textContent = `-$${totalCost.toLocaleString()}`;
            damageCostItem.style.display = 'flex';
        } else {
            damageCostItem.style.display = 'none';
        }
    }
}

// Initialize game when page loads
let game;
window.addEventListener('DOMContentLoaded', () => {
    game = new NeedForSpeedGame();
});
