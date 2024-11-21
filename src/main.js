import { Application, Assets, Text, Graphics, Sprite, SCALE_MODES } from "pixi.js";
import { Slider } from "./core/slider.js";
import { TankPlayer } from "./core/player";
import { Ground } from "./core/ground";
import { Background } from "./scenes/mapImage.js";
import { TrajectoryCalculator } from "./core/trajectoryCalculator.js";

(async () => {

    const app = new Application();
    await app.init({
        resizeTo: window
    });

    //app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);
    const [appHeight, appWidth] = [app.renderer.height, app.renderer.width];

    // Adding background
    const background = new Background(appHeight - 150, appWidth, app);
    await background.initialiseBackground();
    app.stage.addChild(background.getBackground());

    // Adding ground
    const activeGround = new Ground(app)
    await activeGround.initialiseGround();
    app.stage.addChild(activeGround.getGround());

    // Adding player
    let [playerOneX, playerOneY] = [550, appHeight - 300];
    const playerOneTexture = await Assets.load('assets/images/tank.png');
    const playerOne = new TankPlayer(playerOneX, playerOneY, app, playerOneTexture);
    await playerOne.initialisePlayerSprite();
    app.stage.addChild(playerOne.getSprite());
    playerOne.setupKeyboardControls();

    // Adding second player
    const playerTwoTexture = await Assets.load('assets/images/tank.png');
    const playerTwo = new TankPlayer(playerOneX - 400, playerOneY, app, playerTwoTexture);
    await playerTwo.initialisePlayerSprite();
    app.stage.addChild(playerTwo.getSprite());
    playerTwo.setupKeyboardControls();


    // Adding projectile mechanism
    const sliderLaunchAngle = new Slider(100, 200, app, 320, "Launch Angle");
    sliderLaunchAngle.addGraphicsToStage();

    const sliderVelocity = new Slider(100, 100, app, 320, "Initial Velocity");
    sliderVelocity.addGraphicsToStage();

    // Checking ground collision
    activeGround.isThereCollision(playerOne);
    activeGround.isThereCollision(playerTwo);
    let [isPlayerOneFalling, isPlayerTwoFalling] = [true, true];
    let playerTurn = true;
    let [playerOneMoveDist, playerTwoMoveDist] = [20, 20];

    // Create ticker in order to update sprite positioning
    app.ticker.add(() => {
        playerOne.updateBullets();
        playerTwo.updateBullets();
        if (playerOne.checkSpaceBarInput() && playerTurn) {
            playerOne.createBullet();
        } else if (playerTwo.checkSpaceBarInput() && !playerTurn) {
            playerTwo.createBullet();
        }

        // Ground collision and movement detection
        playerOne.updatePlayerPosition();
        playerTwo.updatePlayerPosition();
        activeGround.isThereCollision(playerOne);
        if (isPlayerOneFalling){
            playerOne.applyGravity();
        }
        activeGround.isThereCollision(playerTwo);
        if (isPlayerTwoFalling){
            playerTwo.applyGravity();
        }

        if (playerTurn){
            if (playerOne.moveDist > 0){
                playerOne.movePlayer();
            } else {
                playerTurn = false;
                playerTwo.resetMoveDist();
            }
        } else {
            if (playerTwo.moveDist > 0){
                playerTwo.movePlayer();
            } else {
                playerTurn = true;
                playerOne.resetMoveDist();
            }
        }
    })
})();
