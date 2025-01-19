import { Bullet } from "./bullet";
import { Sprite } from "pixi.js";
import { Vec2, Circle, RevoluteJoint } from "planck";

export class TankPlayer {
    constructor(tankX, tankY, app, tankTexture, scale, converter, world, shellTexture) {
        // application, and scaling related 
        this.converter = converter;
        this.app = app;
        this.world = world;
        this.scale = scale;

        // tank related 
        this.shellTexture = shellTexture;
        this.wheelFront = null;
        this.springFront = null;
        this.springBack = null;
        this.bullet = null;
        this.playerTexture = tankTexture;
        this.tankX = tankX;
        this.tankY = tankY;
        this.tankSpeed = 35;
        this.keys = {};
        this.moveDist = 30;
        this.tankBody = null;

        // Bind methods to this instance
        // this.getTankBodyPos = this.getTankBodyPos.bind(this);
        this.createNewBullet = this.createNewBullet.bind(this);
        this.getBullet = this.getBullet.bind(this);
    }

    createNewBullet() {
        this.bullet = new Bullet(this.app, this.world, this.scale);
    }

    getTankBodyPos() {
        return this.tankBody.getPosition();
    }

    getBullet() {
        if (this.bullet) {
            return this.bullet;
        }
        return null;
    }

    // INFO: Player Code
    async initialisePlayerSprite() {
        //INFO: Player physical body
        //TODO: 1.Resize the cannon balls and make them shoot from proper point 2.Move bullet code to bullet.js instead of player.js 3.Re-Apply the turn by turn
        this.tankBody = this.world.createBody({
            type: "dynamic",
            position: Vec2(this.tankX / this.scale, this.tankY / this.scale),
            gravityScale: 3
        })
        const [playerWidth, playerHeight] = [100 / this.scale, 70 / this.scale];

        const vertices = [Vec2(-1.7, -1), Vec2(1, -1), Vec2(2, -0.25), Vec2(1, 1), Vec2(-1.7, 1)];
        this.tankBody.createFixture({
            shape: planck.Polygon(vertices),
            density: 0.75,
            friction: 0.6,
            restitution: 0.01
        })

        let [planckX, planckY] = [this.tankBody.getPosition().x, this.tankBody.getPosition().y] // x,y position according to planck
        const wheelFD = { density: 1, friction: 0.9 }

        let wheelBack = this.world.createBody({ type: "dynamic", position: Vec2(planckX - 1.4, planckY - 1.2) })
        wheelBack.createFixture(new Circle(0.2), wheelFD)
        let wheelFront = this.world.createBody({ type: "dynamic", position: Vec2(planckX + 1, planckY - 1.2) })
        wheelFront.createFixture(new Circle(0.2), wheelFD)
        this.wheelFront = wheelFront;

        const restitutionValue = 0.05;
        const maxMotorTorque = 50;
        const initialMotorSpeed = 0.0;
        const frequencyHz = 4;
        const dampingRatio = 1;

        this.springBack = this.world.createJoint(
            new RevoluteJoint({
                motorSpeed: initialMotorSpeed, maxMotorTorque: maxMotorTorque, restitution: restitutionValue,
                enableMotor: true, frequencyHz: frequencyHz, dampingRatio: dampingRatio
            }, this.tankBody, wheelBack, wheelBack.getPosition()));

        this.springFront = this.world.createJoint(
            new RevoluteJoint({
                motorSpeed: initialMotorSpeed, maxMotorTorque: maxMotorTorque, restitution: restitutionValue,
                enableMotor: true, frequencyHz: frequencyHz, dampingRatio: dampingRatio
            }, this.tankBody, wheelFront, wheelFront.getPosition()));


        // INFO: Player Sprite
        const playerSprite = Sprite.from(this.playerTexture);
        playerSprite.anchor.set(0.5, 0.5);

        const [spriteWidth, spriteHeight] = [100, 70];
        playerSprite.scale.set(spriteWidth / this.playerTexture.width, spriteHeight / this.playerTexture.height);
        playerSprite.x = this.tankX;
        playerSprite.y = this.tankY;
        this.playerSprite = playerSprite;

        this.app.stage.addChild(this.playerSprite);
    }

    updatePlayer() {
        const bodyPosition = this.tankBody.getPosition();
        // console.log("SB Joint Speed: ", this.springBack.getJointSpeed(), "SF Joint Speed: ", this.springFront.getJointSpeed());

        this.playerSprite.x = bodyPosition.x * this.scale;
        this.playerSprite.y = this.app.renderer.height - (bodyPosition.y * this.scale);
        this.playerSprite.rotation = -this.tankBody.getAngle();
    }


    movePlayer() {
        if (this.moveDist > 0) {
            if (this.keys['68']) {
                this.springFront.setMotorSpeed(-this.tankSpeed);
                this.springFront.enableMotor(true);
                this.springBack.setMotorSpeed(-this.tankSpeed);
                this.springBack.enableMotor(true);

                this.playerSprite.scale.x = Math.abs(this.playerSprite.scale.x);
            } else if (this.keys['65']) {
                this.springFront.setMotorSpeed(+this.tankSpeed);
                this.springFront.enableMotor(true);
                this.springBack.setMotorSpeed(+this.tankSpeed);
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

    resetMoveDist() {
        this.moveDist = 30;
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
