import { Application, Assets, Graphics } from "pixi.js";
import { Slider } from "./core/slider.js";
import { TankPlayer } from "./core/player";
import { Ground } from "./core/ground.js";
import { Background } from "./scenes/mapImage.js";
import { DebugRenderer } from "./core/debugOutlines.js";
import { World, Vec2 } from "planck";
import { coordConverter } from "./core/coordConverter.js";
import { MapGenerator } from "./core/terrainGeneration/mapGenerator.js";
import { Cell } from "./core/terrainGeneration/cell.js";
import { TerrainCell } from "./core/terrainGeneration/terrainCell.js";

(async () => {

    const app = new Application();
    await app.init({
        resizeTo: window
    });

    let world = new World({
        gravity: Vec2(0, -9.8),
    });
    const sf = 25;

    app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);
    const [appHeight, appWidth] = [app.renderer.height, app.renderer.width];

    // Adding ground
    const activeGround = new Ground(app, world, sf)
    await activeGround.initialiseGround();

    // Adding background
    const background = new Background(appHeight - 150, appWidth);
    await background.initialiseBackground();
    //app.stage.addChild(background.getBackground());

    let converter = new coordConverter(250); 
  
    // Adding player
    const playerOneTexture = await Assets.load('assets/images/tank.png');
    const playerOne = new TankPlayer(appWidth / 10, appHeight - 300, app, playerOneTexture, sf, converter, world); 
    await playerOne.initialisePlayerSprite();
    app.stage.addChild(playerOne.getSprite());
    playerOne.setupKeyboardControls();

    // Adding second player
    const playerTwoTexture = await Assets.load('assets/images/tank.png');
    const playerTwo = new TankPlayer(appWidth / 1.2, appHeight - 300, app, playerTwoTexture, sf, converter, world);
    await playerTwo.initialisePlayerSprite();
    app.stage.addChild(playerTwo.getSprite());
    playerTwo.setupKeyboardControls();

    // Adding projectile mechanism
    const sliderLaunchAngle = new Slider(100, 200, app, 320, "Launch Angle");
    const sliderVelocity = new Slider(100, 100, app, 320, "Initial Velocity");
    sliderLaunchAngle.addGraphicsToStage();
    sliderVelocity.addGraphicsToStage();

    let magnitudeVelocity = 0;
    let launchAngle = 0;

    let [isPlayerOneFalling, isPlayerTwoFalling] = [true, true];
    let playerTurn = true;
    let [playerOneMoveDist, playerTwoMoveDist] = [20, 20];

    app.ticker.maxFPS = 60;
    const debugRenderer = new DebugRenderer(world, app, sf);

    // adding mapgenerator
    const mapGenerator = new MapGenerator(app);
const terrain = mapGenerator.generateTerrain(app, 128, 256, 2, 2);
    mapGenerator.drawTerrain(app, terrain);

    app.ticker.add(() => {
        // takes values from the sliders, and calculates the vertical, and horizontal motion
        if (sliderLaunchAngle.getNormalisedSliderValue() == 0) {
            launchAngle = converter.convertDegreesToRadians(90);
        } else {
            launchAngle = converter.convertDegreesToRadians(sliderLaunchAngle.getNormalisedSliderValue() * 180);
        }
        if (sliderVelocity.getNormalisedSliderValue() == 0) {
            magnitudeVelocity = 5;
        } else {
            magnitudeVelocity = sliderVelocity.getNormalisedSliderValue() * 10;
        } 

        const velX = magnitudeVelocity * Math.cos(launchAngle);
        const velY = magnitudeVelocity * Math.sin(launchAngle);

        world.step(1/60);
        if (!(playerOne.checkIfBulletIsPresent() || playerTwo.checkIfBulletIsPresent())) {
            if (playerTurn) {
                if (playerOne.checkSpaceBarInput()) {
                    playerOne.createBullet(velX, velY);
                    playerTurn = false
                    playerTwo.resetMoveDist();
                } else {
                    if (playerOne.moveDist > 0) {
                        playerOne.movePlayer()
                    } else {
                        playerTurn = false;
                        playerTwo.resetMoveDist();
                    }
                }
            } else {
                if (playerTwo.checkSpaceBarInput()) {
                    playerTwo.createBullet(velX, velY);
                    playerTurn = true;
                    playerOne.resetMoveDist();
                } else {
                    if (playerTwo.moveDist > 0) {
                        playerTwo.movePlayer();
                    } else {
                        playerTurn = true;
                        playerOne.resetMoveDist();
                    }
                }
            }
        }

        playerOne.updateBullets();
        playerTwo.updateBullets();

        playerOne.updatePlayer();
        playerTwo.updatePlayer();
    })
})();
