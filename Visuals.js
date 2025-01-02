class WaveformVisual {
    constructor(waveform = [], x = 0, y = 0, width = 0, height = 0) {
        this.waveform = waveform;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.source = null;
        this.scrubber = new Scrubber(this.x, this.y + 2, 2, this.height - 4);
    }

    setSource(source) {
        this.source = source;
    }

    update(){
        this.draw();
    }

    draw() {
        push();
        stroke(255);
        noFill();
        
        // draw a rectangle around the waveform
        //rect(this.x, this.y, this.width, this.height);

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
            let currentTime = this.source.currentTime();
            let duration = this.source.duration();
            let currentSample = floor(map(currentTime, 0, duration, 0, this.waveform.length));
            this.scrubber.updatePosition(currentSample, this.waveform.length, this.x, this.width);
            this.scrubber.draw();
        }
    }
}

class Scrubber {
    constructor(x = 0, y = 0, width = 2, height = 0, color = [255, 0, 0]) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }

    draw() {
        push();
        stroke(...this.color);
        noFill();
        rect(this.x, this.y, this.width, this.height);
        pop();
    }

    updatePosition(currentSample, waveformLength, visualX, visualWidth) {
        this.x = map(currentSample, 0, waveformLength, visualX, visualWidth);
    }
}

class CircleVisual {
    constructor(x = 0, y = 0, minRadius = 10, decayRate = 0.95) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.minRadius = minRadius; 
        this.decayRate = decayRate; 
    }

    update(radius) {
        //when a beat is detected, update the radius
        if (radius > this.radius) {
            this.radius = radius;
        } else {
            // otherwise decay
            this.radius *= this.decayRate;
            // ensure the radius doesn't go below the minimum radius
            if (this.radius < this.minRadius) {
                this.radius = this.minRadius;
            }
        }
        this.draw();
    }

    draw() {
        push();
        fill(255);
        ellipse(this.x, this.y, this.radius, this.radius);
        pop();
    }
}
