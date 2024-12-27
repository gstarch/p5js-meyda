let mySound;
let controls;
let fileInput;

let analyzer;
let circleRadius;


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

  // Initialize Analyzer
  circleRadius = 0;
  if (typeof Meyda !== "undefined") {
    analyzer = Meyda.createMeydaAnalyzer({
      "audioContext": getAudioContext(),
      "source": mySound,
      "bufferSize": 512,
      "featureExtractors": ["rms", "zcr"],
      "callback": (features) => {
        console.log(features);
      } 
    });
    analyzer.start();
  }
  else {
    console.error('Meyda was not found');
  }

  // Initialize Controls
  controls = new Controls(mySound, analyzer);

  // Load file
  fileInput = createFileInput(file => {
    if (file.type === 'audio') {
      mySound = loadSound(file, () => {
        controls.sound = mySound;
        
        // Update analyzer source to the new sound
        if (analyzer) {
          analyzer.setSource(mySound);
        }
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
  // put drawing code here
  controls.update();
}

