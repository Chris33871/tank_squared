import { Application, Assets, Graphics } from "pixi.js";
import { Slider } from "./core/slider.js";
import { TankPlayer } from "./core/player";
// import { Background } from "./scenes/mapImage.js";
import { DebugRenderer } from "./core/debugOutlines.js";
import { World, Vec2 } from "planck";
import { MapGenerator } from "./core/terrainGeneration/mapGenerator.js";
import { Converter } from "./core/Converter.js";
import { createMainMenu } from './menu.js';

export async function startGame() {

    const app = new Application();
    await app.init({
        resizeTo: window
    });

    let world = new World({
        gravity: Vec2(0, -9.8),
    });

    const scaleFactor = 25;

    app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);
    const [appHeight, appWidth] = [app.renderer.height, app.renderer.width];

    // Creating the converter
    let converter = new Converter(scaleFactor);

    // Adding player
    const shellTexture = await Assets.load("assets/images/bullet.png");
    const playerOneTexture = await Assets.load('assets/images/tank.png');
    const playerOne = new TankPlayer(appWidth / 10, appHeight - 300, app, playerOneTexture, scaleFactor, converter, world, shellTexture);
    await playerOne.initialisePlayerSprite();
    await playerOne.initialiseShellSprite();
    playerOne.initialisePlayerHealthBar();
    playerOne.setupKeyboardControls();

    // Adding second player
    const playerTwoTexture = await Assets.load('assets/images/tank.png');
    const playerTwo = new TankPlayer(appWidth / 1.2, appHeight - 300, app, playerTwoTexture, scaleFactor, converter, world, shellTexture);
    await playerTwo.initialisePlayerSprite();
    await playerTwo.initialiseShellSprite();
    playerTwo.initialisePlayerHealthBar();
    playerTwo.setupKeyboardControls();

    // Adding projectile mechanism
    const sliderLaunchAngle = new Slider(100, 200, app, 320, "Launch Angle");
    const sliderVelocity = new Slider(100, 100, app, 320, "Initial Velocity");
    sliderLaunchAngle.addGraphicsToStage();
    sliderVelocity.addGraphicsToStage();

    let magnitudeVelocity = 0;
    let launchAngle = 0;
    let playerTurn = true;

    app.ticker.maxFPS = 60;
    const debugRenderer = new DebugRenderer(world, app, scaleFactor);

    // adding mapgenerator, and drawing the terrain
    const mapGenerator = new MapGenerator(app);
    let terrainPoints = mapGenerator.generateTerrain(128, 256, 2, 2);
    mapGenerator.drawTerrain(terrainPoints, world, scaleFactor, app);

    const fireCooldown = 1000;
    let lastFireTime = 0;
    let shellVisible = false;

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

        world.step(1 / 60);
        const currentTime = Date.now();
        if (playerTurn) {
            //TODO: Need to enable hit detection, and player turn switching if projectile hits opponent

            // check if player one's projectile has hit the ground, if it has switch turns
            if (playerOne.getCollisions() == "ChainCircleContact") {
                playerTurn = false
                playerOne.resetPlayerMotorSpeed();
            } else if (playerOne.getCollisions() == "PolygonCircleContact") {
                console.log("Hit Player Two!");
                playerTurn = false;
                playerOne.resetPlayerMotorSpeed();
            }

            if (playerOne.checkSpaceBarInput() && currentTime - lastFireTime >= fireCooldown) {
                playerOne.openFire(velX, velY);
                shellVisible = true;
                lastFireTime = currentTime;
                playerTwo.resetMoveDist();
                playerOne.moveDist = -1;

            } else {
                if (playerOne.moveDist > 0) {
                    playerOne.movePlayer()
                }
            }
        } else {

            // check if player two's projectile has hit the ground, if it has switch turns
            if (playerTwo.getCollisions() == "ChainCircleContact") {
                playerTurn = true
                playerOne.resetPlayerMotorSpeed();
            } else if (playerTwo.getCollisions() == "PolygonCircleContact") {
                console.log("Hit Player One!");
                playerTurn = true;
                playerOne.resetPlayerMotorSpeed();
            }

            if (playerTwo.checkSpaceBarInput() && currentTime - lastFireTime >= fireCooldown) {
                playerTwo.openFire(velX, velY);
                shellVisible = true;
                lastFireTime = currentTime;
                playerOne.resetMoveDist();
                playerTwo.moveDist = -1;
            } else {
                if (playerTwo.moveDist > 0) {
                    playerTwo.movePlayer();
                }
            }
        }

        // TODO: While visible, run the action
        if (shellVisible) {
            const shellActive = playerOne.updateShell(mapGenerator) || playerTwo.updateShell(mapGenerator);
            // TODO: Change from a visible flag to a collided with flag
            if (shellActive == 0) {
                shellVisible = false;
            }
        }

        playerOne.updatePlayer();
        playerOne.updatePosPlayerHealthBar();
        playerOne.damagePlayerHealthBar();
        playerTwo.updatePosPlayerHealthBar();
        playerTwo.updatePlayer();
        // debugRenderer.render();
    })
}

createMainMenu();
