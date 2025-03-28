import { LCG } from "./LCG";
import { Map } from "../map";

export class MapGenerator {
    constructor(app, seed) {
        this.map = null;
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
                let interpolationPosition = ((x % wavelength) / wavelength);
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
            for (let j = 0; j < perlinOctaveLayers.length; j++) {
                totalCombinedValue += perlinOctaveLayers[j][i];
            }
            combinedPerlin.push(totalCombinedValue);
        }
        return combinedPerlin;
    }

    // smooth interpolation function
    interpolatePoints(pointA, pointB, interpolationPos) {
        var scaledInterpolationPos = interpolationPos * Math.PI;
        var interpolationFactor = (1 - Math.cos(scaledInterpolationPos)) * 0.5;
        return (pointA * (1 - interpolationFactor)) + (pointB * interpolationFactor);
    }

    scalePerlinNoiseValuesToPixi(perlinNoise, canvasHeight, amplitude) {
        let scaledPixiValues = [];
        const yMin = Math.min(...perlinNoise);
        const yMax = Math.max(...perlinNoise);
        for (let i = 0; i < perlinNoise.length; i++) {
            let normalisedYValue = (perlinNoise[i] - yMin) / (yMax - yMin);
            let scaledYValue = ((normalisedYValue * canvasHeight) / (100 / Math.sqrt(amplitude))) + (canvasHeight / 1.4);
            scaledPixiValues.push(scaledYValue);
        }
        return scaledPixiValues;
    }

    generateTerrain(amplitude, wavelength, numberOfOctaves, reductionFactor) {
        // console.log("Generating terrain points...");
        // const start = performance.now();
        const perlinNoise = this.combinePerlin(this.generatePerlinNoiseOctaves(amplitude, wavelength, numberOfOctaves, reductionFactor, this.app.canvas.width));
        const scaledValues = this.scalePerlinNoiseValuesToPixi(perlinNoise, this.app.canvas.height, amplitude);
        // const end = performance.now();
        // console.log(`Internal terrain generation time: ${(end - start).toFixed(4)} ms`);
        return scaledValues;
    }

    destroyTerrainGraphicFromMap() {
        if (this.map) {
            this.map.destroyTerrainGraphic();
        }
    }

    getTerrainBodyFromMap() {
        if (this.map) {
            return this.map.getTerrainBody();
        }
    }

    getTerrainPointsFromMap() {
        if (this.map) {
            return this.map.getTerrainPoints();
        }
    }

    getHeightAt(x) {
        const points = this.getTerrainPointsFromMap();
        if (x < 0 || x >= points.length) {
            return null; // Out of bounds
        }
        console.log(points[Math.floor(x)]);
        return points[Math.floor(x)]; // Return the height at the given x coordinate
    }

    drawTerrain(terrainPoints, world, sf, app) {
        this.map = new Map(terrainPoints, world, sf, this.app);
        this.map.initialiseMap(app);
        this.map.visualiseTerrain();
    }
}
