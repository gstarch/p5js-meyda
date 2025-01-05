let mySound;
let controls;
let fileInput;

let analyzer;
let circleRadius;
let backgroundColor;
let waveform = [];
let waveformVisual;
let circleVisual;
let polarSpectrum;
let scrubber;
let cubeManager;

function setup() {
  colorMode(HSB, 360, 100, 100, 255);
  
  backgroundColor = color(Constants.backgroundColor[0], Constants.backgroundColor[1], Constants.backgroundColor[2]);

  soundFormats('wav', 'mp3');
  mySound = loadSound('../sounds/Kalte Ohren (Remix).mp3', () => {
    waveform = mySound.getPeaks();
    // initialize Visuals after sound is loaded
    waveformVisual = new WaveformVisual(waveform, 20, 300, 910, 255);  
    waveformVisual.setSource(mySound);
  });

  mySound.onended(() => {
    controls.playButton.html('Play');
  });
  
  createCanvas(Constants.windowWidth, Constants.windowHeight);
  background(Constants.backgroundColor);

  // initialize Visuals after canvas setup
  waveformVisual = new WaveformVisual();
  waveformVisual.setSource(mySound);
  circleVisual = new CircleVisual(width / 2, height / 2, 10, 0.96);

  // Initialize PolarSpectrum
  polarSpectrum = new PolarSpectrum(width / 2, height / 2, 300);

  // Initialize scrubber
  scrubber = new Scrubber(20, 300 + 255 * 0.7, 2, 30);

  // initialize Analyzer
  circleRadius = 0;
  if (typeof Meyda !== "undefined") {
    analyzer = Meyda.createMeydaAnalyzer({
      "audioContext": getAudioContext(),
      "source": mySound,
      "bufferSize": 512,
      "featureExtractors": ["rms", "zcr", "chroma"],
      "callback": (features) => {
        console.log(features);
        circleRadius = map(features.rms, 0, 0.1, 0, 200);
        cubeManager.update(features);
        
      } 
    });
    analyzer.start();
  }
  else {
    console.error('Meyda was not found');
  }

  // initialize Controls
  controls = new Controls(mySound, analyzer);

  // initialize CubeManager with the scrubber
  cubeManager = new CubeManager(scrubber);

  // ioad file
  fileInput = createFileInput(file => {
    if (file.type === 'audio') {
      mySound = loadSound(file, () => {
        controls.sound = mySound;
        
        // Update analyzer source to the new sound
        if (analyzer) {
          analyzer.setSource(mySound);
        }

        // Update waveform and source in the visualizer
        waveform = mySound.getPeaks();
        waveformVisual.waveform = waveform;
        waveformVisual.setSource(mySound);

      }, () => {
        console.error('Failed to load the audio file.');
      });
    } else {
      console.error('Invalid file type. Please upload an audio file.');
    }
  });
  fileInput.position(170, 10);
  fileInput.style('color', 'white');
  fileInput.style('font-size', '16px');
  fileInput.style('font-family', 'monospace');
  fileInput.style('border', '1px solid white');
  fileInput.style('border-radius', '5px');
  fileInput.style('width', '750px');
}

function draw() {
  background(backgroundColor);

  // put drawing code here
  controls.update();
  circleVisual.update(circleRadius); //TODO: move to Meyda callback
  waveformVisual.update(scrubber);
  polarSpectrum.update();
  drawFileName();
}

function mousePressed() {
  cubeManager.addCube(mouseX, mouseY, 10, color(random(360), 100, 100));
  polarSpectrum.cycleColorStyle();
}

function drawFileName() {
  fill(255);
  textAlign(CENTER, BOTTOM);
  textSize(16);
  text(fileInput.elt.files[0] ? fileInput.elt.files[0].name : 'No file selected', width / 2, height - 50);
}
