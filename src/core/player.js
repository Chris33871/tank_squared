import { Assets, Sprite, Application, Point } from "pixi.js";

export class tankPlayer {
    constructor(playerX, playerY){
        // setup the x, y co-ordinates
        this.playerX = playerX;
        this.playerY = playerY;
        this.playerSpeed = 5;
        this.keys = {}; // dict setup
    }

    async initialiseSprite(){
        // load texture of player, and convert into sprite.
        const texture = await Assets.load('assets/images/tank.png'); // 'await' keyword used for asynchronous texture loading
        const sprite = Sprite.from(texture);
        sprite.anchor.set(0.5, 0.5); // set anchor point to centre of the sprite

        // resizing the texture
        const desiredWidth = 150;
        const desiredHeight = 105;
        sprite.scale.set(desiredWidth / texture.width, desiredHeight / texture.height); // set the scale so there is no sprite distortion

        // initialise x, y to arguements passed through via constructor
        sprite.x = this.playerX;
        sprite.y = this.playerY;
        this.sprite = sprite;
    }

    addToStage(app) {
        app.stage.addChild(this.sprite);
    }

    updatePlayerPosition(){
        // console.log(this.keys);
        this.sprite.x = this.playerX;
        this.sprite.y = this.playerY;
        if (this.keys['68']) {
            this.playerX += this.playerSpeed;
            this.sprite.scale.x = Math.abs(this.sprite.scale.x); // make sprite face right
        } else if (this.keys['65']) {
            this.playerX -= this.playerSpeed;
            this.sprite.scale.x = -Math.abs(this.sprite.scale.x); // make sprite face left
        }
    }

    setupKeyboardControls() {
        // window.addEventListener("keydown", this.keysDown);

        // 'this.keysDown.bind(this)', cannot be 'this.keysDown' as this is passed through as an event listener
        // this therefore loses the 'this' property therefore it won't be referencing the 'tankPlayer' object
        // this therefore causes 'this.playerX', and 'this.playerY' to be undefined 
        window.addEventListener("keydown", this.keysDown.bind(this));
        window.addEventListener("keyup", this.keysUp.bind(this)); 
    }

    keysDown(e) {
        if (e.keyCode == 68) {
            this.keys[e.keyCode] = true;
        } else if (e.keyCode == 65) {
            this.keys[e.keyCode] = true;
        }
    }

    keysUp(e) {
        if (e.keyCode == 68) {
            this.keys[e.keyCode] = false;
        } else if (e.keyCode == 65) {
            this.keys[e.keyCode] = false;
        }
    }

    // TODO: Add gravity to the tank
    gravity(){
        const movementSpeed = 0.5;
        let pointObject = new Point(0)
        console.log("point object", pointObject);
    }
}
