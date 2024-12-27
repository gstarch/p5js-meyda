let mySound;
let playButton;
let windowWidth = 800;
let windowHeight = 600;
let volumeSlider;
let speedSlider;
let panSlider;
let jumpButton;


function setup() {
  soundFormats('wav','mp3');
  mySound = loadSound('../sounds/Kalte Ohren (Remix).mp3');

  
  mySound.onended(() => {
    playButton.html('Play');
  });

  createCanvas(windowWidth, windowHeight);
  background(0);
  
  // Play button
  playButton = createButton('Play');
  playButton.position(10, 10);
  playButton.mousePressed(playStopSound);

  // Jump button
  jumpButton = createButton('Jump');
  jumpButton.position(70, 10);
  jumpButton.mousePressed(jumpSound);

  // Volume slider
  volumeSlider = createSlider(0, 1, 0.5, 0.01);
  volumeSlider.position(10, 40);

  // Speed slider
  speedSlider = createSlider(0, 2, 1, 0.01);
  speedSlider.position(10, 80);

  // Pan slider
  panSlider = createSlider(-1, 1, 0, 0.01);
  panSlider.position(10, 120);

  fill(255);
  text('Volume', 53, 75);
  text('Speed', 53, 115);
  text('Pan', 53, 155);
}

function playStopSound() {
  if (mySound.isPlaying()) {
    console.log('Pausing');
    mySound.pause();
    playButton.html('Play');
  } else {
    console.log('Playing');
    mySound.play();
    playButton.html('Pause');
  }
}

function setVolume() {
  mySound.setVolume(volumeSlider.value());
}

function setSpeed() {
  mySound.rate(speedSlider.value());
}

function setPan() {
  mySound.pan(panSlider.value());
}

function jumpSound() {
  let duration = mySound.duration();
  let newPosition = random(0, duration);
  mySound.jump(newPosition);
}

function draw() {
  // put drawing code here
  setVolume();
  setSpeed();
  setPan();
}

