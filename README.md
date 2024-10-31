### File Structur

my-pixi-game/\
│\
├── assets/               # All game assets (images, sounds, etc.)\
│   ├── images/           # Sprites, backgrounds, UI elements\
│   ├── sounds/           # Sound effects, music\
│   └── fonts/            # Custom fonts, if any\
│\
├── src/                  # All source code\
│   ├── core/             # Core game logic\
│   │   ├── Game.js       # Main game setup and loop\
│   │   ├── Loader.js     # Asset loading logic\
│   │   ├── SceneManager.js # Manages different scenes (e.g., menus, game levels)\
│   │   └── Utils.js      # Utility functions\
│   │
│   ├── scenes/           # Individual game scenes (menu, game, game over)\
│   │   ├── MainMenu.js   # Main menu scene\
│   │   ├── GameScene.js  # Main game scene\
│   │   └── GameOver.js   # Game over scene\
│   │\
│   ├── objects/          # Game objects (player, enemies, items, etc.)\
│   │   ├── Player.js     # Player character class\
│   │   ├── Enemy.js      # Enemy character class\
│   │   └── Item.js       # Collectible item class\
│   │\
│   ├── ui/               # UI elements (scoreboard, health bar, etc.)\
│   │   ├── Button.js     # Reusable button class\
│   │   └── Scoreboard.js # Scoreboard display\
│   │\
│   └── main.js           # Entry point of the application (sets up PixiJS)\
│\
├── config/               # Configuration files\
│   └── settings.js       # Game settings (e.g., screen width, height, game speed)\
│\
├── index.html            # Main HTML file to load the game\
├── styles.css            # Optional: CSS for the game's HTML container\
└── package.json          # Project metadata and dependencies\


### Development
Ideas/Possible Development paths:
- Large background that goes off screen. When the player moves, he can discover more of the background.
- Make the space larger
- Add nicer background
- Add enemy tank
- Add turn by turn tactic
- Calculate distance travelled so that the tanks the tanks have limited movement per turn

### We are currently working on:
- [ ] Implementing Bullet Tragectory
- [ ] Collisions between players and environment
- [ ] Adding terrain variability
- [ ] Functional game screens/loops
- [ ] Animations for both players and environment
- [ ] Update Sprites for players, background and other props
- [ ] Implement Keyboard setups for local players

### Possible features:
- [ ] Mutliplayer functionality between different computers
- [ ] Terrain destruction
- [ ] Coin System with additional Shop for purchases
