import { Sprite, Assets } from "pixi.js";

export class BulletProjectile {
    constructor(bulletX, bulletY, app) {
        this.bulletX = bulletX;
        this.bulletY = bulletY;
        this.app = app;

        // when sliders are implemented, these values should be manipulated roughly 
        this.bulletSpeedX = 100;
        this.bulletSpeedY = 50;
        this.gravity = 5;
    }

    getX() {
        return this.bulletX;
    }

    getY() {
        return this.bulletY;
    }

    async initialiseBulletSprite() {
        // load texture of player, and convert into sprite.
        const bulletTexture = await Assets.load('assets/images/bullet.png');
        const bulletSprite = Sprite.from(bulletTexture);
        bulletSprite.anchor.set(0.5, 0.5); // set anchor point to centre of the sprite

        // initialise x, y to arguements passed through via constructor
        bulletSprite.x = this.bulletX;
        bulletSprite.y = this.bulletY;
        bulletSprite.width = 30;
        bulletSprite.height = 30;
        this.bulletSprite = bulletSprite;
    }

    getSprite() {
        if (this.bulletSprite) {
            return this.bulletSprite;
        }
    }

    updateBullet() {
        this.bulletX += this.bulletSpeedX;
        this.bulletSprite.x = this.bulletX;

        this.bulletY -= this.bulletSpeedY;
        this.bulletSprite.y = this.bulletY;
    }

    updateBulletTest(newBulletX, newBulletY) {
        this.bulletSprite.x = newBulletX;
        this.bulletSprite.y = newBulletY;
    }
    
    applyGravityToVerticalMotion() {
        this.bulletSpeedY -= this.gravity;
    }
}
