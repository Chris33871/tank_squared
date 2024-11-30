import { Application, Assets } from "pixi.js";
import { Slider } from "./core/slider.js";
import { TankPlayer } from "./core/player";
import { Ground } from "./core/ground";
import { Background } from "./scenes/mapImage.js";
import { World, Circle, Vec2 } from "planck";
import { BulletProjectile } from "./core/bullet.js";

(async () => {

    const app = new Application();
    await app.init({
        resizeTo: window
    });

    app.canvas.style.position = 'absolute';
    document.body.appendChild(app.canvas);
    const [appHeight, appWidth] = [app.renderer.height, app.renderer.width];

    // Adding ground
    const activeGround = new Ground(app)
    await activeGround.initialiseGround();
    app.stage.addChild(activeGround.getGround());

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

    // creating the 'world' object to do physics calculations
    let world = new World();
 
    world.setGravity(Vec2(0, -9.8));

    const sf = 250; // scale factor to scale metric unit system of planckjs to pixijs pixel system
    // need to convert from planck.js coord sys to pixijs coord sys, and back
    function convertPlanckYToPixiY(planckY) {
        return (app.renderer.height - (planckY * sf));
    }

    function convertPlanckXtoPixiX(planckX) {
        return (planckX * sf);
    }

    function convertPixiXtoPlanckX(pixiX) {
        return pixiX / sf;
    }

    function convertPixiYToPlanckY(pixiY) {
        return (app.renderer.height - pixiY) / sf;
    }

    function convertDegreesToRadians(degrees) {
        return degrees * (Math.PI / 180); 
    }

    // this will keep track of the bullet sprite, as well as its corresponding 
    let bodies = [];

    // creates test bullet (bullet in this case is comprised of a body, and its corresponding sprite)
    async function createPlanckJSTestBullet(bodies, player, velX, velY) {
        // create projectile rigid body in planck.js
        const projectileUserBody = world.createBody({
            position: Vec2(convertPixiXtoPlanckX(player.getX()), convertPixiYToPlanckY(player.getY())),
            type: 'dynamic'
        })

        projectileUserBody.setLinearVelocity(Vec2(velX, velY));

        bodies.push(projectileUserBody);

        // create test projectile to visualise planck.js 
        const testProjectile = new BulletProjectile(convertPlanckXtoPixiX(projectileUserBody.getPosition().x), convertPlanckYToPixiY(projectileUserBody.getPosition().y), app);
        await testProjectile.initialiseBulletSprite();
        app.stage.addChild(testProjectile.getSprite());

        bodies.push(testProjectile);
    }

    app.ticker.maxFPS = 60;

    // Gameloop
    app.ticker.add(() => {
        // need to figure out how to shoot one bullet only, and also allow player to change slider values.
        // cannot be setting linear velocity constantly... it fucks with the physics engine 
        
        // takes values from the sliders, and calculates the vertical, and horizontal motion
        const launchAngle = convertDegreesToRadians(sliderLaunchAngle.getNormalisedSliderValue() * 180);
        const magnitudeVelocity = sliderVelocity.getNormalisedSliderValue() * 10;
        const velX = magnitudeVelocity * Math.cos(launchAngle);
        const velY = magnitudeVelocity * Math.sin(launchAngle);
        // console.log("\n Angle (degrees): ", sliderLaunchAngle.getNormalisedSliderValue() * 180);
        // console.log("Magnitude Velocity (ms^(-1)): ", magnitudeVelocity);
        // console.log("Velx: ", velX);
        // console.log("VelY: ", velY);

        // planck.js 
        // this only executes if the user has created a bullet
        // console.log("Bodies Length: ", bodies.length);
        if (bodies.length == 2) {
            const projectileUserBody = bodies[0];
            const testProjectile = bodies[1];

            // checks if the bullet's y position (on the cartesian planck.js coord sys) has gone below zero
            // and empties arr as required.
            // if it goes below zero, it is basically the same as saying it has gone below the bottom screen border
            if (projectileUserBody.getPosition().y < 0) {
                world.destroyBody(projectileUserBody);
                bodies.splice(0, 1);
                bodies.splice(0, 1);
            }

            if (projectileUserBody.getPosition().y > 0) {
                // allowing the world to run the physics simulation, if the projectile is within the screen
                world.step(1/60);

                let pixiX = convertPlanckXtoPixiX(projectileUserBody.getPosition().x);
                let pixiY = convertPlanckYToPixiY(projectileUserBody.getPosition().y);
                testProjectile.updateBulletTest(pixiX, pixiY);
            } 
        }

        // playerOne.updateBullets();
        // playerTwo.updateBullets();
        if (playerOne.checkSpaceBarInput() && playerTurn && bodies.length == 0) {
            createPlanckJSTestBullet(bodies, playerOne, velX, velY);
            playerTurn = false;
            // playerOne.createBullet();

        } else if (playerTwo.checkSpaceBarInput() && !playerTurn && bodies.length == 0) {
            createPlanckJSTestBullet(bodies, playerTwo, velX, velY);
            playerTurn = true;
            // playerTwo.createBullet();
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
