class WaveformVisual {
    constructor(waveform = [], x = 0, y = 0, width = 0, height = 0) {
        this.waveform = waveform;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.source = null;
    }

    setSource(source) {
        this.source = source;
    }

    draw() {
        push();
        stroke(255);
        noFill();
        
        // Draw the rectangle around the waveform
        rect(this.x, this.y, this.width, this.height);

        // Draw the waveform
        beginShape();
        translate(this.x, this.y + this.height);
        for (let i = 0; i < this.waveform.length; i++) {
            let x = map(i, 0, this.waveform.length, 0, this.width);
            let y = map(this.waveform[i], -1, 1, this.height * 0.1, 0);
            vertex(x, y);
        }
        endShape();
        pop();

        if (this.source && this.source.isPlaying()) {
            push();
            let currentTime = this.source.currentTime();
            let duration = this.source.duration();
            let currentSample = floor(map(currentTime, 0, duration, 0, this.waveform.length));
            let x = map(currentSample, 0, this.waveform.length, 0, this.width);
            let y = map(this.waveform[currentSample], -1, 1, this.height * 0.1, 0);
            fill(255, 0, 0);
            stroke(255, 0, 0);
            line(this.x + x, this.y, this.x + x, this.y + this.height);
            pop();
        }
    }
}