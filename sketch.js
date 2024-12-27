let mySound;
let controls;
let windowWidth = 800;
let windowHeight = 600;

function setup() {
  soundFormats('wav', 'mp3');
  mySound = loadSound('../sounds/Kalte Ohren (Remix).mp3');

  mySound.onended(() => {
    controls.playButton.html('Play');
  });

  createCanvas(windowWidth, windowHeight);
  background(0);

  // Initialize Controls
  controls = new Controls(mySound);
}

function draw() {
  // put drawing code here
  controls.update();
}

