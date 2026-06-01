# AI-Powered Procedural Dungeon Survival Game

A complete React + Vite + HTML Canvas survival game where every dungeon run is generated differently. The game includes procedural rooms, enemy AI, an AI-style event director, adaptive difficulty, inventory, leveling, save/load, and a polished dark-fantasy interface.

## Features
- Dark fantasy roguelike UI with glowing HUD panels, minimap, quick slots, cooldown indicators, and polished menus
- Five-floor dungeon progression: portals advance to the next floor until the final escape

- Procedural dungeon generation with connected rooms and corridors
- Spawn room, combat rooms, treasure rooms, trap rooms, healing rooms, boss room, and exit room
- Enemy AI finite state machine: idle, patrol, chase, attack, flee, and search
- Dynamic difficulty manager based on player performance
- AI Director that creates ambushes, treasure, healing, traps, and mini-boss events
- Player health, stamina, XP, gold, inventory, attacks, dash, and upgrades
- Loot rarity system: Common, Rare, Epic, Legendary
- Level-up upgrade choices
- Save/load using localStorage
- Main menu, pause menu, inventory, settings, how-to-play, game over, and victory screens
- Screen shake, floating damage numbers, glowing loot, and animated portal
- Windows and Mac/Linux one-command run scripts

## Tech Stack

- React
- Vite
- JavaScript
- HTML Canvas
- CSS
- localStorage

## Installation

```bash
npm install
npm run dev
```

Open the local URL shown in your terminal.

## Windows Run

Double-click:

```bash
RUN-WINDOWS.bat
```

## Mac/Linux Run

```bash
chmod +x RUN-MAC-LINUX.sh
./RUN-MAC-LINUX.sh
```

## Controls

| Action | Key |
|---|---|
| Move | WASD |
| Attack | Space or Left Mouse Click |
| Dash | Shift |
| Pick up / Interact | E |
| Inventory | I |
| Pause | ESC |

## AI Systems

### Enemy AI
Enemies use a finite state machine. They can patrol, chase, attack, flee when low health, and search when they lose the player.

### Dynamic Difficulty AI
The game tracks rooms cleared, enemies killed, player health, time survived, and damage taken. If the player performs well, enemies scale higher. If the player struggles, the game becomes slightly more forgiving.

### AI Director
The director chooses room events based on player status. It can create ambushes, spawn healing, place traps, add treasure, or trigger a mini-boss.

## Folder Structure

```text
AI-Dungeon-Survival/
├── README.md
├── package.json
├── .gitignore
├── RUN-WINDOWS.bat
├── RUN-MAC-LINUX.sh
├── public/
│   ├── assets/
│   └── sounds/
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── styles/global.css
    ├── game/
    ├── systems/
    ├── entities/
    ├── components/
    └── utils/
```

## How to Test

1. Start a new game.
2. Move with WASD.
3. Attack enemies with Space or mouse click.
4. Pick up items with E.
5. Open inventory with I and use potions.
6. Clear rooms until the exit portal appears.
7. Save happens automatically during play.
8. Return to the main menu and use Continue Game.

## Troubleshooting

### `npm` is not recognized
Install Node.js LTS, then restart your terminal.

### Blank screen
Run:

```bash
npm install
npm run dev
```

Then check the browser console for errors.

### Windows runner closes immediately
Open Command Prompt inside the folder and run:

```bash
RUN-WINDOWS.bat
```

The script includes `pause`, so errors should remain visible.

## Future Improvements

- Real pixel-art sprites
- Online leaderboard
- More enemy abilities
- More dungeon biomes
- Boss cutscenes
- Mobile touch controls

## Author

Created as a portfolio-ready game project.


## Floor Progression Update

The dungeon now has 5 floors. Entering the exit portal on Floors 1-4 generates a new procedural floor, keeps your player stats/inventory/gold, slightly heals you, and increases difficulty. Entering the portal on Floor 5 triggers final victory.

## UI Update

The interface uses a dark fantasy roguelike style: bronze/gold borders, glass panels, a top HUD, minimap, quick item bar, cooldown indicators, rarity-colored inventory cards, and upgraded victory/game-over screens.

## Vercel Deployment Notes

This project includes `vercel.json` and `.npmrc` for Vercel deployment.

Recommended Vercel settings:
- Framework Preset: Vite
- Install Command: npm install --no-audit --no-fund
- Build Command: npm run build
- Output Directory: dist
- Node.js Version: 20.x

If deployment fails during dependency installation, delete `package-lock.json`, run `npm install` locally, commit the new lock file, and redeploy.
