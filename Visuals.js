class WaveformVisual {
    constructor(waveform, source) {
        this.waveform = waveform;
        this.source = source;
    }

    updateSource (source) {
        this.source = source;
    }

    draw() {
        push();
        stroke(255);
        noFill();
        beginShape();
        translate(0, height*0.8);
        for (let i = 0; i < this.waveform.length; i++) {
            let x = map(i, 0, this.waveform.length, 0, width);
            let y = map(this.waveform[i], -1, 1, height*0.1, 0);
            vertex(x, y);
        }
        endShape();
        pop();

        if (this.source.isPlaying()) {
            let currentTime = this.source.currentTime();
            let duration = this.source.duration();
            let currentSample = floor(map(currentTime, 0, duration, 0, this.waveform.length));
            let x = map(currentSample, 0, this.waveform.length, 0, width);
            let y = map(this.waveform[currentSample], -1, 1, height*0.1, 0);
            fill(255, 0, 0);
            ellipse(x, height*0.8 + y, 10, 10);
        }

    }
}