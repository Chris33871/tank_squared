import { Body, Fixture, Chain, Vec2 } from "planck";
import { Graphics } from "pixi.js";

export class Map {
    constructor(terrainPoints, world, scaleFactor, app) {
        this.terrainGraphic = null;
        this.app = app;
        this.scaleFactor = scaleFactor;
        this.world = world;
        this.terrainPoints = terrainPoints;
        this.terrainShape = null;
        this.terrainFixture = null;
        this.terrainBody = null;
        this.vectorPoints = [];
    }

    getTerrainPoints() {
        return this.terrainPoints;
    }

    getTerrainBody() {
        if (this.terrainBody) {
            return this.terrainBody;
        }
    }

    initialiseMap() {
        this.terrainBody = this.world.createBody({ type: "static", position: new Vec2(0, 0) });
        const groundFD = { density: 1, friction: 0.6 } // FD stands for friction density

        for (let i = 0; i < this.terrainPoints.length; i++) {
            this.vectorPoints.push(Vec2(i * (1 / this.scaleFactor), (this.app.renderer.height - this.terrainPoints[i]) / this.scaleFactor));
        }

        this.terrainChainShape = new Chain(this.vectorPoints, false);
        this.terrainBody.createFixture(this.terrainChainShape, groundFD);
        this.terrainBody.setUserData({ type: 'terrain', generator: this });
    }

    createBoundaries() {
        const canvas = this.app.canvas;
        const boundaryProperties = { density: 1, friction: 1, restitution: 1 };

        const corners = [
            new Vec2(0, 0),
            new Vec2(canvas.width / this.scaleFactor, 0),
            new Vec2(canvas.width / this.scaleFactor, canvas.height / this.scaleFactor),
            new Vec2(0, canvas.height / this.scaleFactor)
        ];

        const boundaryBody = this.world.createBody({ type: "static" });
        boundaryBody.createFixture(new Chain(corners, true), boundaryProperties);
    }

    destroyTerrainGraphic() {
        this.terrainGraphic.destroy();
    }

    visualiseTerrain(app) {
        if (this.terrainBody) {
            this.terrainGraphic = new Graphics();
            this.terrainGraphic.moveTo(0, this.terrainPoints[0]);

            for (let x = 1; x < this.terrainPoints.length; x++) {
                this.terrainGraphic.lineTo(x, this.terrainPoints[x]);
            }

            this.terrainGraphic.lineTo(this.app.canvas.width + 100000, this.app.canvas.height);
            this.terrainGraphic.lineTo(0, this.app.canvas.height);
            this.terrainGraphic.lineTo(0, this.terrainPoints[0]);
            this.terrainGraphic.stroke({ width: 2, color: 0xffffff });
            this.terrainGraphic.fill(0x4d1a00);
            this.app.stage.addChild(this.terrainGraphic);
        }
    }
}
