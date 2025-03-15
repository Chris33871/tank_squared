import { Sprite, Graphics } from "pixi.js";
import { Vec2, Circle, RevoluteJoint, Polygon } from "planck";

export class TankPlayer {
    constructor(playerX, playerY, app, playerTexture, scale, coordConverter, world, shellTexture) {
        this.hp = 100;
        this.hpRedBarGraphic = null;
        this.hpGreenBarGraphic = null;
        this.world = world;
        this.coordConverter = coordConverter;
        this.app = app;
        this.playerX = playerX;
        this.playerY = playerY;
        this.playerSpeed = 27.5;
        this.keys = {};
        this.mouse = { x: 0, y: 0 };
        this.bullets = [];
        this.moveDist = 30;
        this.playerTexture = playerTexture;
        this.world = world;
        this.playerBody = null;
        this.scale = scale;
        this.wheelFront = null;
        this.springFront = null;
        this.springBack = null;
        this.spring = null;
        this.physicalShell = null;
        this.shellTexture = shellTexture;
        this.shellSprite = null;
        this.playerCannon = null;
    }

    async initialisePlayerSprite() {

        //INFO: Player physical body
        this.playerBody = this.world.createBody({
            type: "dynamic",
            position: Vec2(this.playerX / this.scale, this.playerY / this.scale),
            gravityScale: 2, fixedRotation: false,
        })

        const vertices = [Vec2(-1.7, -1), Vec2(1, -1), Vec2(2, -0.25), Vec2(1, 1), Vec2(-1.7, 1)];
        this.playerBody.createFixture({
            shape: Polygon(vertices),
            density: 0.5,
            friction: 0.5,
            restitution: 0.01
        })
        console.log("Tank Body:", this.playerBody);

        let [playerBodyX, playerBodyY] = [this.playerBody.getPosition().x, this.playerBody.getPosition().y] // x,y position according to planck
        const wheelFD = { density: 1, friction: 1 }

        let wheelBack = this.world.createBody({ type: "dynamic", position: Vec2(playerBodyX - 1.4, playerBodyY - 1.2) })
        wheelBack.createFixture(new Circle(0.2), wheelFD)

        let wheelMiddleBack = this.world.createBody({ type: "dynamic", position: Vec2(playerBodyX - 0.7, playerBodyY - 1.2) })
        wheelMiddleBack.createFixture(new Circle(0.2), wheelFD)

        let wheelMiddleFront = this.world.createBody({ type: "dynamic", position: Vec2(playerBodyX + 0.3, playerBodyY - 1.2) })
        wheelMiddleFront.createFixture(new Circle(0.2), wheelFD)

        let wheelFront = this.world.createBody({ type: "dynamic", position: Vec2(playerBodyX + 1, playerBodyY - 1.2) })
        wheelFront.createFixture(new Circle(0.2), wheelFD)

        class WheelSpring {
            constructor(world, playerBody, wheel) {
                this.world = world;
                this.playerBody = playerBody;
                this.wheel = wheel;
            }

            createSpring() {
                this.spring = this.world.createJoint(
                    new RevoluteJoint({
                        motorSpeed: 0, maxMotorTorque: 50, enableMotor: true,
                        frequencyHz: 0.2, dampingRatio: 1, restitution: 0.005, collideConnected: false
                    }, this.playerBody, this.wheel, this.wheel.getPosition())
                );
            }
        }

        this.springBack = new WheelSpring(this.world, this.playerBody, wheelBack);
        this.springMiddleBack = new WheelSpring(this.world, this.playerBody, wheelMiddleBack);
        this.springMiddleFront = new WheelSpring(this.world, this.playerBody, wheelMiddleFront);
        this.springFront = new WheelSpring(this.world, this.playerBody, wheelFront);

        this.springBack.createSpring();
        this.springMiddleBack.createSpring();
        this.springMiddleFront.createSpring();
        this.springFront.createSpring();


        // INFO: Player Sprite
        const playerSprite = Sprite.from(this.playerTexture);
        playerSprite.anchor.set(0.5, 0.5);

        const [spriteWidth, spriteHeight] = [100, 70];
        playerSprite.scale.set(spriteWidth / this.playerTexture.width, spriteHeight / this.playerTexture.height);
        playerSprite.x = this.playerX;
        playerSprite.y = this.playerY;
        this.playerSprite = playerSprite;

        this.app.stage.addChild(this.playerSprite);



        // INFO: Cannon Body
        this.playerCannon = this.world.createBody({
            type: "dynamic",
            position: Vec2(playerBodyX + 0.1, playerBodyY + 1.8),
            fixedRotation: true
        });
        this.playerCannon.createFixture({ shape: planck.Box(0.1, 0.8), density: 1, friction: 1 });

        const cannonJoint = this.world.createJoint(
            new RevoluteJoint({
                collideConnected: true
            }, this.playerBody, this.playerCannon, Vec2(playerBodyX + 0.1, playerBodyY + 1.2))
        );
        this.cannonJoint = cannonJoint;

        // INFO: Cannon Sprite
        console.log("playerSpritePos", this.playerSprite.x / this.scale, this.playerSprite.y);
        const playerCannonSprite = new Graphics()
            .rect(
                this.playerX, this.playerY,
                spriteWidth / this.scale, 38
            )
            .fill(0x3f553c);

        playerCannonSprite.y = this.playerSprite.y - spriteHeight / 2.5
        this.playerCannonSprite = playerCannonSprite;
        this.app.stage.addChild(playerCannonSprite);
    }


    updatePlayer() {
        // INFO: Update the player sprite
        const bodyPosition = this.playerBody.getPosition();
        this.playerSprite.x = bodyPosition.x * this.scale;
        this.playerSprite.y = this.app.renderer.height - (bodyPosition.y * this.scale);
        this.playerSprite.rotation = -this.playerBody.getAngle();


        // INFO: Update cannon graphics
        const cannonPosition = this.playerCannon.getPosition();
        const cannonAngle = -this.playerCannon.getAngle();

        this.playerCannonSprite.clear();

        this.playerCannonSprite
            .beginFill(0x3f553c)
            .drawRect(
                -0.1 * this.scale,
                -0.8 * this.scale,
                0.2 * this.scale,
                38
            )
            .endFill();

        this.playerCannonSprite.x = cannonPosition.x * this.scale;
        this.playerCannonSprite.y = this.app.renderer.height - (cannonPosition.y * this.scale);
        this.playerCannonSprite.rotation = cannonAngle;
    }


    updateCannon() {
        let angleChange = 0.02;

        if (this.keys['87']) {
            this.playerCannon.setAngle(this.playerCannon.getAngle() + angleChange);
        } else if (this.keys['83']) {
            this.playerCannon.setAngle(this.playerCannon.getAngle() - angleChange);
        }
    }


    getPlayerMotorSpeed() {
        return this.springFront.spring.getMotorSpeed();
    }

    resetPlayerMotorSpeed() {
        this.springBack.spring.setMotorSpeed(0);
        this.springMiddleBack.spring.setMotorSpeed(0);
        this.springMiddleFront.spring.setMotorSpeed(0);
        this.springFront.spring.setMotorSpeed(0);
    }


    movePlayer() {
        if (this.moveDist > 0) {
            if (this.keys['68']) {
                this.springBack.spring.setMotorSpeed(-this.playerSpeed);
                this.springMiddleBack.spring.setMotorSpeed(-this.playerSpeed);
                this.springMiddleFront.spring.setMotorSpeed(-this.playerSpeed);
                this.springFront.spring.setMotorSpeed(-this.playerSpeed);

                this.playerSprite.scale.x = Math.abs(this.playerSprite.scale.x);
            } else if (this.keys['65']) {
                this.springBack.spring.setMotorSpeed(+this.playerSpeed);
                this.springMiddleBack.spring.setMotorSpeed(+this.playerSpeed);
                this.springMiddleFront.spring.setMotorSpeed(+this.playerSpeed);
                this.springFront.spring.setMotorSpeed(+this.playerSpeed);

                this.playerSprite.scale.x = -Math.abs(this.playerSprite.scale.x);
            } else if (!this.keys["65"] || !this.keys["68"]) {
                this.springBack.spring.setMotorSpeed(0);
                this.springMiddleBack.spring.setMotorSpeed(0);
                this.springMiddleFront.spring.setMotorSpeed(0);
                this.springFront.spring.setMotorSpeed(0);
            }
        }

        this.updateCannon();
    }


    resetMoveDist() {
        this.moveDist = 30;
    }


    async initialiseShellSprite() {
        const bodyPos = this.playerBody.getPosition();
        // INFO: Creating the shell sprite
        const shellSprite = Sprite.from(this.shellTexture);
        shellSprite.anchor.set(0.5, 0.5);

        const [spriteWidth, spriteHeight] = [10, 10];
        shellSprite.scale.set(spriteWidth / this.shellTexture.width, spriteHeight / this.shellTexture.height);
        shellSprite.x = bodyPos.x * this.scale;
        shellSprite.y = this.app.renderer.height - (bodyPos.y * this.scale) + 1;

        this.shellSprite = shellSprite;
    }

    async openFire() {
        var cannonAngle = -this.playerCannon.getAngle();
        const magnitudeVelocity = 10
        // TODO: need to add fix so that bullet actually comes out at the end of the barrel
        var velX = magnitudeVelocity * Math.sin(cannonAngle);
        var velY = magnitudeVelocity * Math.cos(cannonAngle);
        console.log("Velx, Vely", velX, velY);

        const bodyPos = this.playerCannon.getPosition();

        this.physicalShell = this.world.createBody({
            type: "dynamic",
            position: Vec2(bodyPos.x, bodyPos.y + 2.2),
            fixedRotation: true,
            gravityScale: 0.5,
            bullet: true,
            linearVelocity: Vec2(velX, velY * 2),
        });

        const shellFD = { friction: 0.3, density: 1 };
        this.physicalShell.createFixture(new Circle(0.2), shellFD);

        this.shellSprite.x = bodyPos.x * this.scale;
        this.shellSprite.y = this.app.renderer.height - (bodyPos.y * this.scale);
        this.shellSprite.visible = true;

        this.app.stage.addChild(this.shellSprite);
    }


    updateShell(mapGenerator, playerHit) {

        if (playerHit) {
            this.updatePlayerHealthBar();
        }

        if (this.physicalShell) {
            const bodyPos = this.physicalShell.getPosition();
            let contactType = this.getCollisions();
            this.shellSprite.x = bodyPos.x * this.scale;
            this.shellSprite.y = this.app.renderer.height - (bodyPos.y * this.scale);

            // check if out of bounds
            if (this.shellSprite.x >= this.app.renderer.width || this.shellSprite.x <= 0 || this.shellSprite.y >= this.app.renderer.height) {
                this.resetAndDestroyShell();
            }

            // check for other collision types
            if (contactType == "ChainCircleContact") {
                this.destroyTerrain(mapGenerator);
                this.resetAndDestroyShell();
            }



            if (contactType == "PolygonCircleContact") {
                //TODO: Setup the Damage Checks...
                console.log("Bullet has collided with the body of a tank!");
                this.resetAndDestroyShell();
            }
        }
    }

    resetAndDestroyShell() {
        if (this.physicalShell) {
            this.shellSprite.visible = false;
            this.world.destroyBody(this.physicalShell);
            this.physicalShell = null; // Reset the shell
        }
    }

    async initialisePlayerHealthBar() {
        const redGraphics = new Graphics();
        const greenGraphics = new Graphics();

        const path = [0, 0, this.hp, 0, this.hp, 10, 0, 10];
        greenGraphics.poly(path);
        redGraphics.rect(-52, -60, 100, 10);
        redGraphics.fill(0xde3249);
        greenGraphics.fill(0x2ee651);

        this.app.stage.addChild(redGraphics);
        this.app.stage.addChild(greenGraphics);
        this.hpRedBarGraphic = redGraphics;
        this.hpRedBarGraphic.zIndex = 1000;
        this.hpGreenBarGraphic = greenGraphics;
        this.hpGreenBarGraphic.zIndex = 1000;
    }

    updatePosPlayerHealthBar() {
        this.hpRedBarGraphic.x = this.playerSprite.x;
        this.hpRedBarGraphic.y = this.playerSprite.y + 110;
        this.hpGreenBarGraphic.x = this.playerSprite.x - 52;
        this.hpGreenBarGraphic.y = this.playerSprite.y + 50;
    }

    updatePlayerHealthBar() {
        //TODO: implement playerhp damage simulating hpbar decrease

        if (this.hp > 0) {
            this.hp -= 20;
        }
        this.app.stage.removeChild(this.hpGreenBarGraphic);
        this.hpGreenBarGraphic = new Graphics();

        const path = [0, 0, this.hp, 0, this.hp, 10, 0, 10];
        this.hpGreenBarGraphic.poly(path);
        this.hpGreenBarGraphic.fill(0x2ee651);
        this.hpGreenBarGraphic.x = this.playerSprite.x - 52;
        this.hpGreenBarGraphic.y = this.playerSprite.y + 50;
        this.app.stage.addChild(this.hpGreenBarGraphic);
    }

    getCollisions() {
        if (this.physicalShell) {
            for (let contactList = this.physicalShell.getContactList(); contactList; contactList = contactList.next) {
                let contact = contactList.contact;
                let contactType = contact.m_evaluateFcn.name;
                return contactType;
            }
        }
    }

    destroyTerrain(mapGenerator) {
        // set up the original metadata of map
        let originalTerrainPoints = mapGenerator.getTerrainPointsFromMap();
        let originalTerrainBody = mapGenerator.getTerrainBodyFromMap();
        let originalTerrainFixture = originalTerrainBody.getFixtureList();

        // prepare new map data to be used
        let newTerrainPoints = [];
        const pixiBlastRadius = 40;

        let leftX, leftY, rightX, rightY;
        // get points left, and right from the centre of circle (pixijs system), will be used as boundaries
        for (let i = 0; i < originalTerrainPoints.length; i++) {
            if (i < this.shellSprite.x - pixiBlastRadius) {
                leftX = i;
                leftY = originalTerrainPoints[i];
            }

            if (i > (this.shellSprite.x + pixiBlastRadius)) {
                rightX = i;
                rightY = originalTerrainPoints[i];
                i = originalTerrainPoints.length;
            }
        }

        // create the new points to accomadate the crater that was formed
        let circleY = 0;
        for (let i = 0; i < originalTerrainPoints.length; i++) {
            if (i >= leftX && i <= rightX) {
                circleY = this.shellSprite.y + Math.sqrt((pixiBlastRadius * pixiBlastRadius) - ((i - this.shellSprite.x) * (i - this.shellSprite.x)));
                if (circleY >= originalTerrainPoints[i]) {
                    newTerrainPoints.push(circleY);
                } else { // catch any points that are less than the value of originalTerrainPoints[i] 
                    newTerrainPoints.push(originalTerrainPoints[i]);
                }
            } else {
                newTerrainPoints.push(originalTerrainPoints[i]);
            }
        }

        // reset map body, graphic, and fixture
        originalTerrainBody.destroyFixture(originalTerrainFixture);
        this.world.destroyBody(originalTerrainBody);
        mapGenerator.destroyTerrainGraphicFromMap();
        mapGenerator.drawTerrain(newTerrainPoints, this.world, this.scale, this.app);
    }

    checkSpaceBarInput() {
        return this.keys['32'] === true;
    }

    setupKeyboardControls() {
        window.addEventListener("keydown", this.keysDown.bind(this));
        window.addEventListener("keyup", this.keysUp.bind(this));
    }

    keysDown(e) {
        if (e.keyCode == 68) { // D
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 65) { // A
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 32) { // Space
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 87) { // W
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 83) { // S
            this.keys[e.keyCode] = true;
        }
    }

    keysUp(e) {
        if ([68, 65, 32, 87, 83].includes(e.keyCode)) {
            this.keys[e.keyCode] = false;
        }
    }
};
