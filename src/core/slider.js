import { Graphics, Text } from "pixi.js";

export class Slider {
  constructor(sliderX, sliderY, app, sliderWidth, label) {
    this.sliderY = sliderY;
    this.sliderX = sliderX;
    this.app = app;
    this.sliderWidth = sliderWidth;

    // value representation
    this.normalisedSliderValue = 0;

    // Graphics
    this.slider = new Graphics().rect(0, 0, sliderWidth, 4).fill({ color: 0x272d37 });
    this.slider.x = this.sliderX;
    this.slider.y = this.sliderY;

    // drawing handle 
    this.handle = new Graphics().circle(0, 0, 8).fill({ color: 0xffffff });
    this.handle.y = this.slider.height / 2;
    this.handle.x = this.sliderWidth / 2;
    this.handle.eventMode = 'static';
    this.handle.cursor = 'pointer';

    // Bind methods to the current instance (avoids issues that are caused by the key word 'this') 
    this.onDragStart = this.onDragStart.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
    this.onDrag = this.onDrag.bind(this);

    // set up the interactivity for user
    this.handle.on('pointerdown', this.onDragStart);
    this.handle.on('pointerup', this.onDragEnd);
    this.handle.on('pointerupoutside', this.onDragEnd);

    // Label text 
    this.label = new Text({
      text: label,
      style: {
        fill: '#FFFFFF',
        fontFamily: 'Roboto',
        fontSize: 20,
        align: 'center',
      },
    });
  }

  onDragStart() {
    console.log("On drag start!");
    this.app.stage.eventMode = 'static';
    this.app.stage.addEventListener('pointermove', this.onDrag);
  }

  onDragEnd(e) {
    console.log("On drag end!");
    this.app.stage.eventMode = 'auto';
    this.app.stage.removeEventListener('pointermove', this.onDrag);
  }

  onDrag(e) {
    const halfHandleWidth = this.handle.width / 2;
    // Set handle y-position to match pointer, clamped to (4, screen.height - 4).

    this.handle.x = Math.max(halfHandleWidth, Math.min(this.slider.toLocal(e.global).x, this.sliderWidth - halfHandleWidth));

    // normalised the values from 0 - 1
    this.normalisedSliderValue = this.handle.x / this.sliderWidth;
  }

  addGraphicsToStage() {
    this.app.stage.addChild(this.slider);
    this.slider.addChild(this.handle);

    // positioning the label correctly in correspondence with the slider itself
    this.label.x = this.sliderX;
    this.label.y = this.sliderY - 30;
    this.app.stage.addChild(this.label);
  }

  getNormalisedSliderValue() {
    return this.normalisedSliderValue;
  }

}
