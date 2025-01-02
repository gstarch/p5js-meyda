let mySound;
let controls;
let fileInput;

let analyzer;
let circleRadius;
let backgroundColor;
let waveform = [];
let waveformVisual;

function setup() {
  backgroundColor = color(Constants.backgroundColor[0], Constants.backgroundColor[1], Constants.backgroundColor[2]);

  soundFormats('wav', 'mp3');
  mySound = loadSound('../sounds/Kalte Ohren (Remix).mp3', () => {
    waveform = mySound.getPeaks();
    waveformVisual = new WaveformVisual(waveform, 50, 450, 700, 100);  
    waveformVisual.setSource(mySound);
  });

  mySound.onended(() => {
    controls.playButton.html('Play');
  });
  
  createCanvas(Constants.windowWidth, Constants.windowHeight);
  background(Constants.backgroundColor);

  // re-initialize Visuals after canvas setup
  waveformVisual = new WaveformVisual();
  waveformVisual.setSource(mySound);

  // initialize Analyzer
  circleRadius = 0;
  if (typeof Meyda !== "undefined") {
    analyzer = Meyda.createMeydaAnalyzer({
      "audioContext": getAudioContext(),
      "source": mySound,
      "bufferSize": 512,
      "featureExtractors": ["rms", "zcr"],
      "callback": (features) => {
        console.log(features);
        circleRadius = map(features.rms, 0, 0.1, 0, 200);
      } 
    });
    analyzer.start();
  }
  else {
    console.error('Meyda was not found');
  }

  // initialize Controls
  controls = new Controls(mySound, analyzer);

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
  fileInput.style('width', '600px');
}

function draw() {
  background(backgroundColor);
  // put drawing code here
  controls.update();
  waveformVisual.draw();

  // Draw circle
  fill(255);
  ellipse(width / 2, height / 2, circleRadius, circleRadius);
}

