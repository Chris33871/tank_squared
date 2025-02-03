import { Graphics } from "pixi.js";

export class DebugRenderer {
    constructor(world, app, scale) {
        this.world = world; // Planck.js world
        this.app = app;     // Pixi.js application
        this.scale = scale; // Scale factor for meters to pixels
        this.graphics = new Graphics();
        this.app.stage.addChild(this.graphics);
    }

    render() {
        this.graphics.clear();
        this.graphics.lineStyle(1, 0xff0000, 1); // Red outlines for physics objects

        // Iterate over all bodies in the physics world
        for (let body = this.world.getBodyList(); body; body = body.getNext()) {
            const position = body.getPosition();
            const angle = body.getAngle();

            // Loop through each fixture of the body
            for (let fixture = body.getFixtureList(); fixture; fixture = fixture.getNext()) {
                const shape = fixture.getShape();
                // console.log("Shape: ", shape.getType());
                if (shape.getType() === "circle") {
                    this.drawCircle(shape, position, angle);
                } else if (shape.getType() === "polygon") {
                    this.drawPolygon(shape, position, angle);
                } else if (shape.getType() === "edge") {
                    this.drawEdge(shape, position, angle);
                } else if (shape.getType() == "chain") {
                     this.drawChain(shape, position, angle);
                }
            }
        }
    }

    drawChain(shape, position, angle) {
        for (let i = 0; i < shape.m_vertices.length - 1; i++) {
            this.graphics.moveTo((shape.m_vertices[i].x + position.x) * this.scale, this.app.renderer.height - (shape.m_vertices[i].y + position.y) * this.scale);
            this.graphics.lineTo((shape.m_vertices[i + 1].x + position.x) * this.scale, this.app.renderer.height - (shape.m_vertices[i + 1].y + position.y) * this.scale);
        }
    }

    drawCircle(shape, position, angle) {
        const radius = shape.m_radius * this.scale;
        const center = shape.m_p;
        const worldCenter = {
            x: (position.x + center.x) * this.scale,
            y: this.app.renderer.height - (position.y + center.y) * this.scale,
        };

        this.graphics.beginFill(0xff0000, 0.2);
        this.graphics.drawCircle(worldCenter.x, worldCenter.y, radius);
        this.graphics.endFill();

        // Draw a line indicating the rotation
        const anglePoint = {
            x: worldCenter.x + Math.cos(angle) * radius,
            y: worldCenter.y - Math.sin(angle) * radius,
        };
        this.graphics.moveTo(worldCenter.x, worldCenter.y);
        this.graphics.lineTo(anglePoint.x, anglePoint.y);
    }

    drawPolygon(shape, position, angle) {
        const vertices = shape.m_vertices.map((v) => ({
            x: (v.x + position.x) * this.scale,
            y: this.app.renderer.height - (v.y + position.y) * this.scale,
        }));

        this.graphics.beginFill(0x00ff00, 0.2); // Transparent green fill
        this.graphics.moveTo(vertices[0].x, vertices[0].y);
        for (let i = 1; i < vertices.length; i++) {
            this.graphics.lineTo(vertices[i].x, vertices[i].y);
        }
        this.graphics.closePath();
        this.graphics.endFill();
    }

    drawEdge(shape, position, angle) {
        const v1 = {
            x: (shape.m_vertex1.x + position.x) * this.scale,
            y: this.app.renderer.height - (shape.m_vertex1.y + position.y) * this.scale,
        };
        const v2 = {
            x: (shape.m_vertex2.x + position.x) * this.scale,
            y: this.app.renderer.height - (shape.m_vertex2.y + position.y) * this.scale,
        };

        this.graphics.moveTo(v1.x, v1.y);
        this.graphics.lineTo(v2.x, v2.y);
    }
}
