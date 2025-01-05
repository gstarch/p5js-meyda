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

    update(scrubber){
        this.draw(scrubber);
    }

    draw(scrubber) {
        push();
        stroke(255);
        noFill();

        // draw the skyline waveform
        translate(this.x, this.y + this.height / 2);
        for (let i = 0; i < this.waveform.length; i++) {
            let x = map(i, 0, this.waveform.length, 0, this.width);
            let y = map(this.waveform[i], -1, 1, this.height / 2, -this.height / 2);
            strokeWeight(1);

            //skyline
            let hue = map(this.waveform[i], 1, -1, 250, 380);
            hue = hue % 360;
            let sat = 100;
            let brt = 100;
            let alpha = map(abs(this.waveform[i]), 0, 1, 0, 100);
            stroke(hue, sat, brt, alpha);
            rect(x, (this.height / 4)-2, 5, -abs(y));
            
            //reflection
            stroke(hue, 50, 50, 30);
            strokeWeight(4);
            rect(x, (this.height / 4)-2, 2, abs(y/2));
        
        }
        pop();

        //draw scrubber to show current position
        if (this.source && scrubber) {
            let currentTime = this.source.currentTime();
            let duration = this.source.duration();
            let currentSample = floor(map(currentTime, 0, duration, 0, this.waveform.length));
            scrubber.updatePosition(currentSample, this.waveform.length, this.x, this.width);
            scrubber.draw();
        }
    }
}

class Scrubber {
    constructor(x = 0, y = 0, width = 2, height = 0, color = [0, 100, 100]) {
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


class Cube {
    constructor(x, y, size, color, scrubber) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.speedX = random(-2, 2);
        this.speedY = random(-2, 2);
        this.scrubber = scrubber;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Bounce off the edges
        if (this.x < this.size / 2 || this.x > width - this.size / 2) {
            this.speedX *= -1;
        }
        if (this.y < this.size / 2 || this.y > height - this.size / 2) {
            this.speedY *= -1;
        }

        this.draw();
    }

    draw() {
        push();
        rectMode(CENTER);
        fill(this.color);
        rect(this.x, this.y, this.size, this.size);

        // Draw lines to the scrubber
        stroke(255);
        line(this.x, this.y, this.scrubber.x, this.scrubber.y);
        line(this.x, this.y, this.scrubber.x + this.scrubber.width, this.scrubber.y);
        
        pop();
    }
}

class CubeManager {
    constructor(scrubber) {
        this.cubes = [];
        this.scrubber = scrubber;
    }

    addCube(x, y, size, color) {
        this.cubes.push(new Cube(x, y, size, color, this.scrubber));
    }

    removeCube(index) {
        if (index >= 0 && index < this.cubes.length) {
            this.cubes.splice(index, 1);
        }
    }

    update(features) {
        for (let cube of this.cubes) {
            // Update cube properties based on Meyda analyzer features
            cube.size = map(features.rms, 0, 0.1, 10, 100);
            cube.color = color(map(features.zcr, 0, 1, 0, 360), 100, 100);
            cube.update();
        }
    }
}


class PolarSpectrum {
    constructor(x, y, radius, fftSize = 128) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.fft = new p5.FFT(0.8, fftSize);
        this.rotationAngle = 0;
        this.skipFirstLastBins = 20; //number of bins to skip at the beginning and end of spectrum
    }

    update() {
        let spectrum = this.fft.analyze();
        this.rotationAngle += 0.01;
        this.draw(spectrum);
    }

    draw(spectrum) {
        push();
        translate(this.x, this.y);
        rotate(this.rotationAngle);
        noFill();
        strokeWeight(4);
        
        // Use only a portion of the spectrum (highest frequencies don't occur that often)
        let usableSpectrumLength = floor(spectrum.length * 0.8);
        let angleStep = TWO_PI / (usableSpectrumLength - this.skipFirstLastBins * 2);

        let step = 1;

        for (let i = this.skipFirstLastBins; i < usableSpectrumLength - this.skipFirstLastBins; i += step) {
            let amplitude = spectrum[i];

            let angle = i * angleStep;
            // map amplitude to a color
            let c = map(amplitude, 0, 255, 250, 550);
            c = c % 360;
            let sat = 100;
            let brt = 100;
            let alpha = map(amplitude, 0, 255, 100, 255);

            stroke(c, sat, brt, alpha);
            
            let r = map(amplitude, 0, 255, 0, this.radius);

            // Convert polar to cartesian coordinates
            let x = r * cos(angle);
            let y = r * sin(angle);

            // Draw a line from the center to the edge
            line(0, 0, x, y);
        }

        pop();
    }
}
