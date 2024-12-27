import { Sprite } from "pixi.js";
import { BulletProjectile } from "./bullet";
import { World, Vec2, WheelJoint, Circle, RevoluteJoint } from "planck";

export class TankPlayer {
    constructor(playerX, playerY, app, playerTexture, scale, coordConverter, world) {
        this.world = world;
        this.coordConverter = coordConverter;
        this.app = app;
        this.playerX = playerX;
        this.playerY = playerY;
        this.playerSpeed = 20;
        this.keys = {};
        this.bullets = [];
        this.moveDist = 30;
        this.playerTexture = playerTexture;
        this.world = world;
        this.playerBody = null;
        this.scale = scale;
        this.springFront = null;
        this.springBack = null;
    }

    // INFO: Player Code
    async initialisePlayerSprite(){
        //INFO: Player physical body
        //TODO: 1.Resize the cannon balls and make them shoot from proper point 2.Move bullet code to bullet.js instead of player.js 3.Re-Apply the turn by turn
        this.playerBody = this.world.createBody({
            type: "dynamic",
            position: Vec2(this.playerX / this.scale, this.playerY / this.scale),
            gravityScale: 3
        })
        const [playerWidth, playerHeight] = [100 / this.scale, 70 / this.scale];

        const vertices = [Vec2(-1.7,-1), Vec2(1,-1), Vec2(2,-0.25), Vec2(1,1), Vec2(-1.7,1)];
        this.playerBody.createFixture({
            shape: planck.Polygon(vertices),
            density: 1,
            friction: 0.6,
            restitution: 0.1
        })

        let [px, py] = [this.playerBody.getPosition().x, this.playerBody.getPosition().y] // x,y position according to planck
        const wheelFD = {density: 1, friction: 0.9}

        let wheelBack = this.world.createBody({type: "dynamic", position: Vec2(px - 1.4, py - 1.2)})
        wheelBack.createFixture(new Circle(0.2), wheelFD)
        let wheelFront = this.world.createBody({type: "dynamic", position: Vec2(px + 1, py - 1.2)})
        wheelFront.createFixture(new Circle(0.2), wheelFD)


        this.springBack = this.world.createJoint(
            new RevoluteJoint({
                motorSpeed: 0.0, maxMotorTorque: 20, 
                enableMotor: true, frequencyHz: 4, dampingRatio: 0.2
            }, this.playerBody, wheelBack, wheelBack.getPosition(), new Vec2(0.0, 1)));

        this.springFront = this.world.createJoint(
            new RevoluteJoint({
                motorSpeed: 0.0, maxMotorTorque: 20, 
                enableMotor: true, frequencyHz: 4, dampingRatio: 0.2
            }, this.playerBody, wheelFront, wheelFront.getPosition(),new Vec2(0.0, 1)));

        // INFO: Player Sprite
        const playerSprite = Sprite.from(this.playerTexture);
        playerSprite.anchor.set(0.5, 0.5);

        const [spriteWidth, spriteHeight] = [100, 70];
        playerSprite.scale.set(spriteWidth / this.playerTexture.width, spriteHeight / this.playerTexture.height); 
        playerSprite.x = this.playerX;
        playerSprite.y = this.playerY;
        this.playerSprite = playerSprite;

        this.app.stage.addChild(this.playerSprite);
    }

    updatePlayer(){
        const bodyPosition = this.playerBody.getPosition();

        this.playerSprite.x = bodyPosition.x * this.scale;
        this.playerSprite.y = this.app.renderer.height - (bodyPosition.y * this.scale);
        this.playerSprite.rotation = -this.playerBody.getAngle();
    }


    movePlayer() {
        if (this.moveDist > 0){
            if (this.keys['68']) {
                this.springFront.setMotorSpeed(-this.playerSpeed);
                this.springFront.enableMotor(true);
                this.springBack.setMotorSpeed(-this.playerSpeed);
                this.springBack.enableMotor(true);

                this.playerSprite.scale.x = Math.abs(this.playerSprite.scale.x);
            } else if (this.keys['65']) {
                this.springFront.setMotorSpeed(+this.playerSpeed);
                this.springFront.enableMotor(true);
                this.springBack.setMotorSpeed(+this.playerSpeed);
                this.springBack.enableMotor(true);

                this.playerSprite.scale.x = -Math.abs(this.playerSprite.scale.x);
            } else if (!this.keys["65"] || !this.keys["68"]) {
                this.springFront.setMotorSpeed(0);
                this.springFront.enableMotor(false);
                this.springBack.setMotorSpeed(0);
                this.springBack.enableMotor(false);
            }
        }
    }

    resetMoveDist(){
        this.moveDist = 30;
    }


    // TODO: Create a function that spawns the above ball on-click
    openFire(velX, velY) {
        const bodyPos = this.playerBody.getPosition();
        let cannonBall = this.world.createBody({
            type: "kinematic", 
            position: Vec2(bodyPos.x, bodyPos.y + 1),
            fixedRotation: false,
            gravityScale: 0.5,
            bullet: true
        });
        cannonBall.createFixture(new Circle(0.2));
        // TODO: upon creation, add velocity and movement
       

        return cannonBall;
    }

    // INFO: Projectile Code
    checkIfBulletIsPresent() {
        if (this.bullets.length == 1) {
            return true;
        } 
        return false;
    }

    async createBullet(velX, velY) {
        const projectileUserBody = this.world.createBody({
            position: Vec2(
                this.coordConverter.convertPixiXtoPlanckX(this.playerX), 
                this.coordConverter.convertPixiYToPlanckY(this.app, this.playerY)
            ),
            type: 'dynamic'
        })
        projectileUserBody.setLinearVelocity(Vec2(velX, velY));

        // create the projecilte 
        const bulletProjectile = new BulletProjectile(
            this.coordConverter.convertPlanckXtoPixiX(projectileUserBody.getPosition().x), 
            this.coordConverter.convertPlanckYToPixiY(this.app, projectileUserBody.getPosition().y), 
            this.app, projectileUserBody);
        await bulletProjectile.initialiseBulletSprite();
        this.app.stage.addChild(bulletProjectile.getSprite());

        this.bullets.push(bulletProjectile);
    }

    updateBullets() {
        if (this.checkIfBulletIsPresent()) {
            const bulletProjectile = this.bullets[0];
            const projectileUserBody = bulletProjectile.getProjectileUserBody();

            // checks if the bullet's y position (on the cartesian planck.js coord sys) has gone below zero
            // and empties arr as required.
            // if it goes below zero, it is basically the same as saying it has gone below the bottom screen border
            if (projectileUserBody.getPosition().y < 0) {
                this.world.destroyBody(projectileUserBody);
                this.bullets.splice(0, 1);
            }

            if (projectileUserBody.getPosition().y > 0) {


                let pixiX = this.coordConverter.convertPlanckXtoPixiX(projectileUserBody.getPosition().x);
                let pixiY = this.coordConverter.convertPlanckYToPixiY(this.app, projectileUserBody.getPosition().y);
                bulletProjectile.updateBullet(pixiX, pixiY);
            } 
        }
    }

    checkSpaceBarInput() {
        return this.keys['32'] === true;
    }

    // INFO: Keyboard control
    setupKeyboardControls() {
        window.addEventListener("keydown", this.keysDown.bind(this));
        window.addEventListener("keyup", this.keysUp.bind(this));
    }

    keysDown(e) {
        if (e.keyCode == 68) {
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 65) {
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 32 && (this.keys["68"] == false || this.keys["65"] == false)) {
            this.keys[e.keyCode] = true;
        }
    }

    keysUp(e) {
        if (e.keyCode == 68) {
            this.keys[e.keyCode] = false;
        } else if (e.keyCode == 65) {
            this.keys[e.keyCode] = false;
        } else if (e.keyCode == 32) {
            this.keys[e.keyCode] = false;
        }
    }
};
