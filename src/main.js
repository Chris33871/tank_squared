import { Application, Sprite, Assets, Ticker } from "pixi.js"; // import application class
import { tankPlayer } from "./core/player"; // import player class from js file
import { Ground } from "./core/ground";

(async() => { // https://developer.mozilla.org/en-US/docs/Glossary/IIFE IIFE (Immediately Invoked Function Expression) JS function that runs as soon as it is defined

    // app setup 
    const app = new Application(); // instantiating a new instance of application class
    await app.init({ // sets up the 'canvas'; this is the area on the webpage that is controlled and managed by pixijs
        resizeTo: window
    });
    app.canvas.style.position = 'absolute'; // line required in order to get rid of side bars
    document.body.appendChild(app.canvas); // adds canvas to body

    // Adding ground
    const activeGround = new Ground(app)
    await activeGround.initialiseGround();
    app.stage.addChild(activeGround.getGround());

    // Adding player
    console.log("render height", app.renderer.height)
    const testPlayer = new tankPlayer(400, app.renderer.height - 291);
    await testPlayer.initialiseSprite();
    testPlayer.addToStage(app);
    // Adds ground collision
    await activeGround.isThereCollision(testPlayer);

    testPlayer.setupKeyboardControls();

    // create ticker in order to update sprite positioning
    app.ticker.add(() => {
        testPlayer.updatePlayerPosition();
    })

    testPlayer.gravity();
})();

