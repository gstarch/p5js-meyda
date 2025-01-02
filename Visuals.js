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
        
        // draw the rectangle around the waveform
        rect(this.x, this.y, this.width, this.height);

        // draw the skyline waveform
        translate(this.x, this.y + this.height / 2);
        for (let i = 0; i < this.waveform.length; i++) {
            let x = map(i, 0, this.waveform.length, 0, this.width);
            let y = map(this.waveform[i], -1, 1, this.height / 2, -this.height / 2);
            strokeWeight(1);
            let brt = map(this.waveform[i], 1, -1, 80, 255);
            let alpha = map(abs(this.waveform[i]), 0, 1, 0, 205);
            stroke(brt, 80, 100, alpha);
            rect(x, (this.height / 4)-2, 5, -abs(y));
            stroke(brt, 100, 100, 20);
            strokeWeight(4);
            rect(x, (this.height / 4)-2, 2, abs(y/2));

        }
        pop();

        //draw scrubber to show current position
        if (this.source && this.source.isPlaying()) {
            push();
            let currentTime = this.source.currentTime();
            let duration = this.source.duration();
            let currentSample = floor(map(currentTime, 0, duration, 0, this.waveform.length));
            let x = map(currentSample, 0, this.waveform.length, 0, this.width);
            let y = map(this.waveform[currentSample], -1, 1, this.height / 2, -this.height / 2);
            stroke(255, 0, 0);
            noFill();
            rect(this.x + x, this.y+2, 2, this.height-4);
            pop();
        }
    }
}