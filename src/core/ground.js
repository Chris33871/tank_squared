import { Graphics } from "pixi.js";
import { World, Circle, Vec2, Edge } from "planck";

export class Ground {
    constructor(app, world, scale){
        this.app = app;
        this.world = world;
        this.appHeight = this.app.renderer.height;
        this.appWidth = this.app.renderer.width;
        this.groundGraphics = new Graphics();
        this.groundPoints = [];
        this.scale = scale;
    };

    async initialiseGround() {

        this.groundPoints = [
            { x: 0, y: this.appHeight - 200 },
            { x: this.appWidth / 20, y: this.appHeight - 180 },
            { x: this.appWidth / 7, y: this.appHeight - 180 },
            { x: this.appWidth / 4.5, y: this.appHeight - 170 },
            { x: this.appWidth / 3.5, y: this.appHeight - 250 },
            { x: this.appWidth / 3.1, y: this.appHeight - 250 },
            { x: this.appWidth / 2.75, y: this.appHeight - 180 },
            { x: this.appWidth / 2.3, y: this.appHeight - 140 },
            { x: this.appWidth / 1.95, y: this.appHeight - 150 },
            { x: this.appWidth / 1.73, y: this.appHeight - 190 },
            { x: this.appWidth / 1.54, y: this.appHeight - 250 },
            { x: this.appWidth / 1.45, y: this.appHeight - 250 },
            { x: this.appWidth / 1.32, y: this.appHeight - 150 },
            { x: this.appWidth / 1.18, y: this.appHeight - 140 },
            { x: this.appWidth / 1.06, y: this.appHeight - 110 },
            { x: this.appWidth, y: this.appHeight - 250 }
        ];

        // INFO: Applying Physics
        const screenWidth = this.appWidth / this.scale;

        var ground = this.world.createBody({
            type: "static",
            position: new Vec2(0.0, -10.0),
        });
        const groundFD = {density: 10, friction: 10.6} // FD stands for friction density

        //ground.createFixture(new Edge(new Vec2(-screenWidth / 2, 0), new Vec2(screenWidth / 2, 0)), groundFD);
        //for (let i = 1; i < this.groundPoints.length; i++){
        //    const vec1 = new Vec2(this.groundPoints[i - 1].x / this.scale, -(this.groundPoints[i - 1].y / this.scale));
        //    const vec2 = new Vec2(this.groundPoints[i].x / this.scale, -(this.groundPoints[i].y / this.scale));
        //
        //    ground.createFixture(new Edge(vec1, vec2), groundFD);
        //}


        // INFO: Applying Graphics
        //this.groundGraphics.beginFill(0x654321);
        //this.groundGraphics.moveTo(this.groundPoints[0].x, this.groundPoints[0].y);
        //for (let i = 1; i < this.groundPoints.length; i++) {
        //    this.groundGraphics.lineTo(this.groundPoints[i].x, this.groundPoints[i].y);
        //}
        //
        //this.groundGraphics // Used to close off the ground
        //    .lineTo(this.appWidth, this.appHeight)
        //    .lineTo(0, this.appHeight)
        //    .closePath()
        //    .endFill();
        //
        //this.app.stage.addChild(this.groundGraphics);

        // INFO: Testing on flat ground
        ground.createFixture(new Edge(new Vec2(-screenWidth / 2, 0), new Vec2(screenWidth / 2, 0)), groundFD)
        this.groundGraphics.rect(
            -(this.appWidth / 2), // Center horizontally
            100, // Height above the baseline
            this.appWidth, // Full screen width
            10 // Thickness
        );
        this.groundGraphics.fill(0xFFFFFF);

        this.groundGraphics.x = this.appWidth / 2; 
        this.groundGraphics.y = this.appHeight - (10 * this.scale);
        this.app.stage.addChild(this.groundGraphics);
    }

    getGround(){
        return this.groundGraphics;
    }

    isThereCollision(collidingSprite) {
        //const groundHeightAtSprite = this.getGroundHeightAtX(collidingSprite.playerX);
        const groundHeightAtSprite = 500;
        const spriteBottomY = collidingSprite.playerY + 50;

        if (spriteBottomY > groundHeightAtSprite) {
            collidingSprite.playerY = groundHeightAtSprite - 50;
        }
    }
}
