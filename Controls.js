class Controls {
  constructor(sound) {
    this.sound = sound;
    this.playButton = createButton('Play');
    this.jumpButton = createButton('Jump');
    this.volumeSlider = createSlider(0, 1, 0.5, 0.01);
    this.speedSlider = createSlider(0, 2, 1, 0.01);
    this.panSlider = createSlider(-1, 1, 0, 0.01);

    this.setupUI();
  }

  setupUI() {
    this.playButton.position(10, 10);
    this.playButton.mousePressed(() => this.playStopSound());

    this.jumpButton.position(70, 10);
    this.jumpButton.mousePressed(() => this.jumpSound());

    this.volumeSlider.position(10, 40);
    this.speedSlider.position(10, 80);
    this.panSlider.position(10, 120);

    fill(255);
    text('Volume', 53, 75);
    text('Speed', 53, 115);
    text('Pan', 53, 155);
  }

  playStopSound() {
    if (this.sound.isPlaying()) {
      console.log('Pausing');
      this.sound.pause();
    } else {
      console.log('Playing');
      this.sound.play();
    }
    this.updatePlayButton();
  }

  updatePlayButton() {
    if (this.sound.isPlaying()) {
      this.playButton.html('Pause');
    } else {
      this.playButton.html('Play');
    }
  }

  setVolume() {
    this.sound.setVolume(this.volumeSlider.value());
  }

  setSpeed() {
    this.sound.rate(this.speedSlider.value());
  }

  setPan() {
    this.sound.pan(this.panSlider.value());
  }

  jumpSound() {
    let duration = this.sound.duration();
    let newPosition = random(0, duration);
    this.sound.jump(newPosition);
    console.log('Jumped to', newPosition);
    console.log('isPlaying:', this.sound.isPlaying());
    //setTimeout(() => this.updatePlayButton(), 100); // avoids play state mismatch on jump
  }

  update() {
    this.setVolume();
    this.setSpeed();
    this.setPan();
  }
} 
