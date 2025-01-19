import { Sprite, Assets } from "pixi.js";
import { Vec2, Circle } from "planck";

export class Bullet {
    constructor(app, world, scale) {
        this.shellTexture = null;
        this.scale = scale;
        this.app = app;
        this.world = world;
        this.physicalPlanckJSShell = null;
        this.shellSprite = null;
    }

    updateShell(showBullet) {
        if (this.physicalPlanckJSShell) {
            const bodyPos = this.physicalPlanckJSShell.getPosition();
            this.shellSprite.x = bodyPos.x * this.scale;
            this.shellSprite.y = this.app.renderer.height - (bodyPos.y * this.scale);

            // TODO: replace this with dissapear if collision with something
            //console.log("Check collision", this.physicalShell.getContactList());
            const isOutOfBounds = bodyPos.y < -10 || bodyPos.x < -10;
            if (isOutOfBounds) {
                this.shellSprite.visible = false;
                this.world.destroyBody(this.physicalPlanckJSShell);
                this.physicalPlanckJSShell = null; // Reset the shell
            } else if (showBullet) {
                this.shellSprite.visible = false;
                this.world.destroyBody(this.physicalPlanckJSShell);
                this.physicalPlanckJSShell = null;
            }
        }
    }

    async openFire(playerPos, velX, velY) {
        await this.initialiseShellSprite(playerPos, velX, velY);
        const bodyPos = playerPos;

        this.physicalPlanckJSShell = this.world.createBody({
            type: "dynamic",
            position: Vec2(bodyPos.x, bodyPos.y + 1),
            fixedRotation: true,
            gravityScale: 0.5,
            bullet: true,
            linearVelocity: Vec2(velX, velY * 2),
        });

        const shellFD = { friction: 0.3, density: 1 };
        this.physicalPlanckJSShell.createFixture(new Circle(0.2), shellFD);

        this.shellSprite.x = bodyPos.x * this.scale;
        this.shellSprite.y = this.app.renderer.height - (bodyPos.y * this.scale);
        this.shellSprite.visible = true;
    }

    async initialiseShellSprite(playerPos, velX, velY) {
        const bodyPos = playerPos;
        this.shellTexture = await Assets.load('assets/images/bullet.png');
        this.physicalPlanckJSShell = this.world.createBody({
            type: "dynamic",
            position: Vec2(bodyPos.x, bodyPos.y + 1),
            fixedRotation: true,
            gravityScale: 0.5,
            bullet: true,
            linearVelocity: Vec2(velX, velY * 2),
        });

        // INFO: Creating the shell sprite
        const shellSprite = Sprite.from(this.shellTexture);
        shellSprite.anchor.set(0.5, 0.5);

        const [spriteWidth, spriteHeight] = [10, 10];
        shellSprite.scale.set(spriteWidth / this.shellTexture.width, spriteHeight / this.shellTexture.height);
        shellSprite.x = bodyPos.x * this.scale;
        shellSprite.y = this.app.renderer.height - (bodyPos.y * this.scale) + 1;

        this.shellSprite = shellSprite;
        this.app.stage.addChild(this.shellSprite);
        this.shellSprite.visible = false;

    }
}
