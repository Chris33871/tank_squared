import { Sprite, Assets, Texture } from "pixi.js";

export class Background {
    constructor(appHeight, appWidth) {
        this.backgroundImage = null;
        this.appHeight = appHeight;
        this.appWidth = appWidth;
    }

    async initialiseBackground() {
        const backgroundTexture = await Assets.load("../assets/images/tank_squared_background.png");
        const backgroundSprite = new Sprite(backgroundTexture);
        var containerWidth, containerHeight = [this.appWidth, this.appHeight]

        // Resizing
        var imageRatio = backgroundSprite.width / backgroundSprite.height;
        var containerRatio = this.appWidth / this.appHeight
        //
        //
        if (containerRatio > imageRatio) {
            console.log("if", containerRatio, "img", imageRatio);
            backgroundSprite.height = backgroundSprite.height / (backgroundSprite.width / containerWidth);
            backgroundSprite.width = containerWidth;
            backgroundSprite.position.x = 0;
            backgroundSprite.position.y = (containerHeight - backgroundSprite.height) / 2;
        } else {
            console.log("else", containerRatio, "img", imageRatio);
            backgroundSprite.width = backgroundSprite.width / (backgroundSprite.height / containerHeight);
            backgroundSprite.height = containerHeight;
            backgroundSprite.position.y = 0;
            backgroundSprite.position.x = (containerWidth - backgroundSprite.width) / 2;
        }

        //this.backgroundSprite = new Sprite(backgroundSprite);
        this.backgroundImage = backgroundSprite;
        //this.backgroundSprite.height = this.appHeight;
        //this.backgroundSprite.width = this.appWidth;
    }

    getBackground() {
        return this.backgroundImage;
    }
};

