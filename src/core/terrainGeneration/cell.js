import { Graphics } from "pixi.js";

export class Cell {
    constructor(app, pixiX, pixiY, width, height) {
        this.app = app;
        this.graphics = new Graphics();
        this.width = width;
        this.height = height;
        this.pixiX = pixiX;
        this.pixiY = pixiY;
    }

    initialiseCellGraphics() {
        this.graphics.rect(this.pixiX, this.pixiY, this.width, this.height);
        this.graphics.fill(0x745D55);
    }

    drawCell() {
        this.initialiseCellGraphics();
        this.app.stage.addChild(this.graphics);
    }

    getPixiPos() {

    }
}
