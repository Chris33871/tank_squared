import { Application, Assets } from "pixi.js";
import { Slider } from "./core/slider.js";
import { TankPlayer } from "./core/player";
import { Ground } from "./core/ground.js";
import { Background } from "./scenes/mapImage.js";
import { World, Circle, Vec2, Edge } from "planck";
import { BulletProjectile } from "./core/bullet.js";

(async () => {

    const app = new Application();
    await app.init({
        resizeTo: window
    });

    // creating the 'world' object to do physics calculations
    let world = new World({
        gravity: new Vec2(0.0, -10.0) // defining a gravity vector (arguments are x, y)
    });

    app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);
    const [appHeight, appWidth] = [app.renderer.height, app.renderer.width];

    // Adding ground
    const activeGround = new Ground(app, world)
    await activeGround.initialiseGround();
    //app.stage.addChild(activeGround.getGround());

    // Adding background
    const background = new Background(appHeight - 150, appWidth);
    await background.initialiseBackground();
    //app.stage.addChild(background.getBackground());
  
    // Adding player
    const playerOneTexture = await Assets.load('assets/images/tank.png');
    const playerOne = new TankPlayer(appWidth / 10, appHeight - 300, app, playerOneTexture);
    await playerOne.initialisePlayerSprite();
    app.stage.addChild(playerOne.getSprite());
    playerOne.setupKeyboardControls();

    // Adding second player
    const playerTwoTexture = await Assets.load('assets/images/tank.png');
    const playerTwo = new TankPlayer(appWidth / 1.2, appHeight - 300, app, playerTwoTexture);
    await playerTwo.initialisePlayerSprite();
    app.stage.addChild(playerTwo.getSprite());
    playerTwo.setupKeyboardControls();


    // Adding projectile mechanism
    // TODO: Re-Add the Sliders once they are working
    const sliderLaunchAngle = new Slider(100, 200, app, 320, "Launch Angle");
    const sliderVelocity = new Slider(100, 100, app, 320, "Initial Velocity");
    sliderLaunchAngle.addGraphicsToStage();
    sliderVelocity.addGraphicsToStage();

    // Checking ground collision
    activeGround.isThereCollision(playerOne);
    activeGround.isThereCollision(playerTwo);
    let [isPlayerOneFalling, isPlayerTwoFalling] = [true, true];
    let playerTurn = true;
    let [playerOneMoveDist, playerTwoMoveDist] = [20, 20];

 
    const sf = 25; // scale factor to scale metric unit system of planckjs to pixijs pixel system
    // need to convert from planck.js coord sys to pixijs coord sys, and back
    function convertPlanckYToPixiY(planckY) {
        return (app.renderer.height - (planckY * sf));
    }

    function convertPlanckXtoPixiX(planckX) {
        return (planckX * sf);
    }

    function convertPixiXtoPlanckX(pixiX) {
        return pixiX / 25;
    }

    function convertPixiYToPlanckY(pixiY) {
        return (app.renderer.height - pixiY) / sf;
    }
   
    // create projectile rigid body in planck.js
    const projectileUserBody = world.createBody({
        position: Vec2(convertPixiXtoPlanckX(playerOne.getX()), convertPixiYToPlanckY(playerOne.getY())),
        type: 'dynamic'
    })


    // create test projectile to visualise planck.js 
    let testProjectile = new BulletProjectile(convertPlanckXtoPixiX(projectileUserBody.getPosition().x), convertPlanckYToPixiY(projectileUserBody.getPosition().y), app);
    await testProjectile.initialiseBulletSprite();
    app.stage.addChild(testProjectile.getSprite());

    function convertDegreesToRadians(degrees) {
        return degrees * (Math.PI / 180); 
    }

    // Gameloop
    app.ticker.add(() => {
        const launchAngle = convertDegreesToRadians(sliderLaunchAngle.getNormalisedSliderValue() * 180);
        const magnitudeVelocity = sliderVelocity.getNormalisedSliderValue() * 10;
        const velX = magnitudeVelocity * Math.cos(launchAngle);
        const velY = magnitudeVelocity * Math.sin(launchAngle);
        //console.log("\n Angle (radians): ", launchAngle);
        //console.log("Magnitude Velocity (ms^(-1)): ", magnitudeVelocity);
        //console.log("Velx: ", velX);
        //console.log("VelY: ", velY);

        projectileUserBody.setLinearVelocity(Vec2(velX, velY));

        // planck.js 
        if (projectileUserBody.getPosition().y > 0) {
            world.step(1/10);
            console.log("\n");

            let pixiX = convertPlanckXtoPixiX(projectileUserBody.getPosition().x);
            let pixiY = convertPlanckYToPixiY(projectileUserBody.getPosition().y) ;
            //console.log("x (planck.js enviro): ", pixiX);
            //console.log("y (planck.js enviro): ", pixiY);
            testProjectile.updateBulletTest(pixiX, pixiY);
        }

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
