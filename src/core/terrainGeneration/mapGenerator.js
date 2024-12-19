import { LCG } from "./LCG";
import { Graphics } from "pixi.js";

export class MapGenerator {
    constructor(app, seed) {
        this.app = app;
        this.terrain = [];
        // if no argument is passed into mapgenerator then it will just create a random terrain
        if (seed == undefined) {
            this.LCG = new LCG();
        } else {
            this.LCG = new LCG(seed);
        }
    }

    generatePerlinNoiseLayer(amplitude, wavelength, canvasWidth) {
        // amplitude tells us how high the peaks should be
        // wavelength tells us how far adjacent troughs should be to one another
        // this will be used to dictate the size of a single Perlin segment betweeen points A and points B
        let x = 0;
        let pseudoRandomNumberGenerator = this.LCG;
        let pointA = pseudoRandomNumberGenerator.next();
        let pointB = pseudoRandomNumberGenerator.next();
        let verticalDisplacementValues = [];

        while (x < canvasWidth) {
            // check base case, if current x position is a multiple of wavelength, if it is
            // then we know we are at the end of a segment, and should begin the next one.
            if (x % wavelength == 0) {
                // move to next segment of perlin noise generation
                pointA = pointB;
                pointB = pseudoRandomNumberGenerator.next();
                verticalDisplacementValues.push(pointA * amplitude);
            } else {
                let interpolationPosition  = ((x % wavelength) / wavelength);
                let interpolatedValue = this.interpolatePoints(pointA, pointB, interpolationPosition) * amplitude;
                verticalDisplacementValues.push(interpolatedValue);
            }
            x++; // go to the next x position
        }

        return verticalDisplacementValues;
    }

    generatePerlinNoiseOctaves(amplitude, wavelength, numberOfOctaves, reductionFactor, canvasWidth) {
        var perlinOctaveLayers = [];
        for (let i = 0; i < numberOfOctaves; i++) {
            // generate multiple perlin noise octave layers 
            // the more octaves, the more detailed the terrain will be
            perlinOctaveLayers.push(this.generatePerlinNoiseLayer(amplitude, wavelength, canvasWidth));
            amplitude = amplitude / reductionFactor;
            wavelength /= reductionFactor;
        }

        return perlinOctaveLayers;
    }

    combinePerlin(perlinOctaveLayers) {
        let combinedPerlin = [];
        for (let i = 0; i < perlinOctaveLayers[0].length; i++) {
            let totalCombinedValue = 0;
            for (let j = 0; j < perlinOctaveLayers.length; j ++) {
                totalCombinedValue += perlinOctaveLayers[j][i];
            }
            combinedPerlin.push(totalCombinedValue);
        }
        return combinedPerlin;
    }

    // smooth interpolation function
    interpolatePoints(pointA, pointB, interpolationPos) {
        var scaledInterpolationPos  = interpolationPos * Math.PI;
        var interpolationFactor = (1 - Math.cos(scaledInterpolationPos )) * 0.5;
        return (pointA * (1 - interpolationFactor)) + (pointB * interpolationFactor);
    }

    scalePerlinNoiseValuesToPixi(perlinNoise, canvasHeight, amplitude) {
        let scaledPixiValues = [];
        const yMin = Math.min(...perlinNoise);
        const yMax = Math.max(...perlinNoise);
        for (let i = 0; i < perlinNoise.length; i++) {
            let normalisedYValue = (perlinNoise[i] - yMin) / (yMax - yMin);
            let scaledYValue = ((normalisedYValue * canvasHeight) /(100 / Math.sqrt(amplitude))) + (canvasHeight / 1.4);
            scaledPixiValues.push(scaledYValue);
        }
        return scaledPixiValues;
    }

    generateTerrain(app, amplitude, wavelength, numberOfOctaves, reductionFactor) {
        const perlinNoise = this.combinePerlin(this.generatePerlinNoiseOctaves(amplitude, wavelength, numberOfOctaves, reductionFactor, this.app.canvas.width));
        const scaledValues = this.scalePerlinNoiseValuesToPixi(perlinNoise, this.app.canvas.height, amplitude);
        return scaledValues;
    }

    drawTerrain(app, terrainPoints) {
        let graphic = new Graphics();
        graphic.moveTo(0, terrainPoints[0]);
        for (let x = 1; x < terrainPoints.length; x++) {
            graphic.lineTo(x, terrainPoints[x]);
        }
        graphic.lineTo(app.canvas.width, app.canvas.height);
        graphic.lineTo(0, app.canvas.height);
        graphic.lineTo(0, terrainPoints[0]);
        graphic.stroke({ width: 2, color: 0xffffff });
        graphic.fill(0x4d1a00);
        app.stage.addChild(graphic);
    }
}
