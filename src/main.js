import { Application, Assets } from "pixi.js";
import { Slider } from "./core/slider.js";
import { TankPlayer } from "./core/player";
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

    // adding mapgenerator, and drawing the terrain
    const mapGenerator = new MapGenerator(app);
    let terrainPoints = mapGenerator.generateTerrain(128, 256, 2, 2);
    mapGenerator.drawTerrain(terrainPoints, world, scaleFactor, app);

    // Adding player
    const shellTexture = await Assets.load("assets/images/bullet.png");
    const playerOneTexture = await Assets.load('assets/images/tank.png');
    const playerOneX = appWidth / 10;
    const playerOneY = appHeight-mapGenerator.getHeightAt(playerOneX) + 40;
    console.log("Player 1",playerOneX, playerOneY);
    const playerOne = new TankPlayer(playerOneX, playerOneY, app, playerOneTexture, scaleFactor, converter, world, shellTexture);
    await playerOne.initialisePlayerSprite();
    await playerOne.initialiseShellSprite();
    await playerOne.initialisePlayerHealthBar();
    playerOne.setupKeyboardControls();

    // Adding second player
    const playerTwoTexture = await Assets.load('assets/images/tank.png');
    const playerTwoX = appWidth / 1.2;
    const playerTwoY = appHeight-mapGenerator.getHeightAt(playerTwoX) + 40;
    console.log("Player 2",playerTwoX, playerTwoY);
    const playerTwo = new TankPlayer(playerTwoX, playerTwoY, app, playerTwoTexture, scaleFactor, converter, world, shellTexture);
    await playerTwo.initialisePlayerSprite();
    await playerTwo.initialiseShellSprite();
    await playerTwo.initialisePlayerHealthBar();
    playerTwo.setupKeyboardControls();

    let playerTurn = true;
    app.ticker.maxFPS = 60;
    const debugRenderer = new DebugRenderer(world, app, scaleFactor);


    const fireCooldown = 1000;
    let lastFireTime = 0;
    let shellVisible = false;

    let isPlayerTwoHit = false;
    let isPlayerOneHit = false;

    // change this value so the hpbar will hide every x seconds
    const hpBarHideCooldown = 5;

    app.ticker.add(() => {

        world.step(1 / 60);
        const currentTime = Date.now();

        if (playerTurn) {
            // check if player one's projectile has hit the ground, if it has switch turns
            if (playerOne.getCollisions() == "ChainCircleContact") {
                playerTurn = false
                playerOne.resetPlayerMotorSpeed();
            } else if (playerOne.getCollisions() == "PolygonCircleContact") {
                isPlayerTwoHit = true;
                playerTurn = false;
                playerOne.resetPlayerMotorSpeed();
            }

            if (playerOne.shotOutOfBounds) {
                playerOne.shotOutOfBounds = false;
                playerTurn = false;
                playerOne.resetPlayerMotorSpeed();
            }

            if (playerOne.checkSpaceBarInput() && currentTime - lastFireTime >= fireCooldown) {
                playerOne.openFire();
                playerOne.resetPlayerMotorSpeed();
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
                playerTwo.resetPlayerMotorSpeed();
            } else if (playerTwo.getCollisions() == "PolygonCircleContact") {
                isPlayerOneHit = true;
                playerTurn = true;
                playerTwo.resetPlayerMotorSpeed();
            }

            if (playerTwo.shotOutOfBounds) {
                playerTwo.shotOutOfBounds = false;
                playerTurn = true;
                playerTwo.resetPlayerMotorSpeed();
            }

            if (playerTwo.checkSpaceBarInput() && currentTime - lastFireTime >= fireCooldown) {
                playerTwo.openFire();
                playerTwo.resetPlayerMotorSpeed();
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
            const shellActive = playerOne.updateShell(mapGenerator, isPlayerOneHit) || playerTwo.updateShell(mapGenerator, isPlayerTwoHit);
            // TODO: Change from a visible flag to a collided with flag
            if (shellActive == 0) {
                shellVisible = false;
            }
        }

        playerOne.updatePlayer();
        playerOne.updatePosPlayerHealthBar();

        playerTwo.updatePosPlayerHealthBar();
        playerTwo.updatePlayer();

        if (isPlayerOneHit) {
            playerOne.revealHPBar();
        } else if (isPlayerTwoHit) {
            playerTwo.revealHPBar();
        }

        let time = performance.now();
        time /= 1000;
        time = Math.floor(time % 60);
        if (time % hpBarHideCooldown == 0 && time > 0) {
            playerOne.hideHPBar();
            playerTwo.hideHPBar();
        }

        isPlayerOneHit = false;
        isPlayerTwoHit = false;

        // debugRenderer.render();

    })
}


createMainMenu();
