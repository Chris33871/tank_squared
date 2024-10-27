const app = new PIXI.Application();
await app.init({ width: window.innerWidth, height: window.innerHeight });
window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
});


let ground = new PIXI.Graphics();
ground.beginFill(0x654321);
ground.drawRect(0, app.renderer.height - 250, app.renderer.width, 250);
ground.endFill();
app.stage.addChild(ground);

// load the PNG asynchronously
await PIXI.Assets.load('images/sample.png');
await PIXI.Assets.load('images/basic_background.png');
let sprite = PIXI.Sprite.from('images/sample.png');
let basic_background = PIXI.Sprite.from('images/basic_background.png');

// Set the background to the bottom of the image
basic_background.anchor.set(0.3, 1);
//basic_background.y = app.renderer.height - basic_background.height * basic_background.scale.y
basic_background.x = app.screen.width;
basic_background.y = app.screen.height;

document.body.appendChild(app.canvas);
app.stage.addChild(basic_background);
app.stage.addChild(sprite);
// Add a variable to count up the seconds our demo has been running
let elapsed = 0.0;
// Tell our application's ticker to run a new callback every frame, passing
// in the amount of time that has passed since the last tick
app.ticker.add((ticker) => {
    // Add the time to our total elapsed time
    elapsed += ticker.deltaTime;
    // Update the sprite's X position based on the cosine of our elapsed time.  We divide
    // by 50 to slow the animation down a bit...
    sprite.x = 100.0 + Math.cos(elapsed/50.0) * 100.0;
});
