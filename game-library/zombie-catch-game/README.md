# 🧟 Zombie Catch: Survival Game

A strategic survival game set in a 50x50 grid city overrun by zombies. Manage survivors, avoid infection, and survive as long as possible!

## 🎮 Game Overview

The city has been infected with a deadly zombie virus. You control a group of 5-10 survivors trying to stay alive in a dangerous world filled with zombies. Strategic movement and resource management are key to survival.

## 🗺️ Game Zones

### 🏠 Survivor Block (Green Zone)
- **Location**: Top-left corner (2,2) - 8x8 grid
- **Features**: Safe haven with resources (food, water, weapons, medicine)
- **Protection**: Zombies cannot enter this zone
- **Restriction**: Infected players cannot leave this zone

### 🏥 Quarantine Zone (Orange Zone)
- **Location**: Top-right corner (42,2) - 6x6 grid
- **Purpose**: Isolation area for infected players
- **Mechanic**: Infected players are automatically relocated here after infection

### ⚠️ Liquidation Point (Purple Zone)
- **Location**: Bottom-center (22,42) - 6x6 grid
- **Function**: Instant elimination zone
- **Effect**: Automatically kills any zombie or infected player who enters
- **Strategy**: Can be used as a safe haven or escape route for healthy survivors

## 👥 Game Elements

### Survivors (Blue Circles)
- Start in the Survivor Block
- Controlled by player using arrow keys
- Can be infected if too close to zombies
- Must manage health and resources

### Infected Players (Orange Circles)
- Previously healthy survivors who got infected
- Automatically moved to Quarantine Zone
- Cannot leave Survivor Block if infected there
- Can be eliminated in Liquidation Point

### Zombies (Red Circles with 'Z')
- Move intelligently toward nearest player
- Avoid Survivor Block (cannot enter)
- Move faster at night
- Can infect players within 1 cell distance (50-80% chance)
- Die instantly in Liquidation Point

## 🎯 Game Objectives

### Primary Goal
Survive as long as possible by:
- Keeping survivors healthy and uninfected
- Managing limited resources
- Strategically avoiding zombies
- Using zones to your advantage

### Victory Condition
Eliminate all zombies and survive for at least 5 days

### Defeat Conditions
- All survivors are infected or dead
- Resources depleted and survivors die from starvation

## 🕹️ Controls

| Key | Action |
|-----|--------|
| **Arrow Keys** | Move selected player (Up/Down/Left/Right) |
| **Mouse Click** | Select a player on the grid |
| **Space** | Pause/Resume game |
| **R** | Restart game |

## 🎲 Gameplay Mechanics

### Day/Night Cycle
- Each cycle lasts 30 seconds
- **Day**: Zombies move slower (every 0.8s on medium)
- **Night**: Zombies move faster (every 0.4s on medium) ⚠️
- New zombies spawn every 3 days

### Infection System
- Zombies infect players within 1 cell distance (horizontal, vertical, or diagonal)
- Infection chance: 65% on medium difficulty
- Infected players are moved to Quarantine Zone after 2 seconds
- Safe in Survivor Block (zombies cannot enter)

### Resource Management
- **Food & Water**: Consumed every 10 seconds based on survivor count
- **Weapons**: Can be equipped by survivors (future feature)
- **Medicine**: Used to treat infections (future feature)
- Running out of food/water causes health loss (5% every 10s)
- Zero health = death

### Difficulty Levels

#### 🟢 Easy
- Infection chance: 50%
- Initial zombies: 4
- Slower zombie speed

#### 🟡 Medium (Default)
- Infection chance: 65%
- Initial zombies: 6
- Balanced zombie speed

#### 🔴 Hard
- Infection chance: 80%
- Initial zombies: 8
- Faster zombie speed

## 📊 Game Statistics

The game tracks:
- **Current Day**: Number of days survived
- **Time of Day**: Day or Night
- **Survivors**: Healthy, uninfected players
- **Infected**: Number of infected players
- **Zombies**: Active zombie count
- **Survival Time**: Total seconds survived
- **Resources**: Food, water, weapons, medicine levels

## 💡 Strategy Tips

1. **Stay in Safe Zones**: Use the Survivor Block for protection early on
2. **Watch the Clock**: Zombies are more dangerous at night
3. **Manage Resources**: Keep an eye on food and water levels
4. **Use Liquidation Point**: Lead zombies there for instant elimination
5. **Select Wisely**: Click on different players to control them strategically
6. **Quarantine Management**: Monitor infected players in the Quarantine Zone
7. **Spread Out**: Don't cluster survivors - makes infection spread easier
8. **Plan Movements**: Think ahead about zombie positions and movement patterns

## 🚀 How to Play

1. Open `index.html` in a modern web browser
2. Select difficulty level (Easy/Medium/Hard)
3. Click "Start Game"
4. Click on a survivor to select them
5. Use arrow keys to move the selected survivor
6. Survive as long as possible!

## 🛠️ Technical Features

- **Canvas-based rendering**: Smooth 50x50 grid visualization
- **Real-time gameplay**: Dynamic zombie AI and player movement
- **Event logging**: Track all important game events
- **Responsive design**: Adapts to different screen sizes
- **Multiple difficulty settings**: Customizable challenge levels
- **Day/night cycle**: Dynamic gameplay changes
- **Zone mechanics**: Complex interaction between different areas

## 📝 Game Stats Display

- Real-time day counter
- Day/night indicator
- Live survivor/zombie counts
- Resource levels
- Survival timer
- Selected player details
- Event log with categorized messages

## 🎨 Visual Design

- Dark theme optimized for long play sessions
- Color-coded zones for easy identification
- Clear entity differentiation (survivors, infected, zombies)
- Professional UI with panels and controls
- Animated effects and transitions

## 🔮 Future Enhancements

Potential features for future versions:
- Weapon usage system
- Medicine to cure infections
- Multiple survivor classes with special abilities
- Power-ups and collectibles scattered on the map
- More zombie types with different behaviors
- Achievements and high score system
- Multiplayer mode
- Random map generation
- Weather effects influencing gameplay

## 📜 License

This is a demonstration game created for educational purposes. Feel free to modify and enhance!

---

**Survive the outbreak! Good luck! 🧟‍♂️💀**
