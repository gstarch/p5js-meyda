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
    constructor(x = 0, y = 0, width = 2, height = 0, color = [0, 0, 100]) {
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
        this.alpha = 100;
    }

    update(features) {
        // Use RMS from features to update the radius
        if (features && features.rms !== undefined) {
            let newRadius = map(features.rms, 0, 0.1, this.minRadius, 200);
            if (newRadius > this.radius) {
                this.radius = newRadius;
            } else {
                // Decay the radius
                this.radius *= this.decayRate;
                if (this.radius < this.minRadius) {
                    this.radius = this.minRadius;
                }
            }
            this.alpha = map(features.rms, 0, 0.2, 200, 0);
        }
        this.draw();
    }

    draw() {
        push();
        fill(255, 0, 100, this.alpha);
        stroke(0, 0, 100,);
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
        this.lifespan = random(2000, 10000);
        this.rotation = random(-0.01, 0.01);
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.lifespan > 0) {
                this.lifespan--;
        }

        // Bounce off the edges
        if (this.x < this.size / 2 || this.x > width - this.size / 2) {
            this.speedX *= -1;
        }
        if (this.y < this.size / 2 || this.y > height - this.size / 2) {
            this.speedY *= -1;
        }

        this.rotation += 0.01;
        this.draw();
    }
    draw() {
        push();
        rectMode(CENTER);
        fill(this.color);
        translate(this.x, this.y);
        rotate(this.rotation);
        rect(0, 0, this.size, this.size);
        
        // Draw lines to the scrubber
        pop();
        
        push()
        stroke(this.color);
        line(this.x, this.y, this.scrubber.x, this.scrubber.y);
        line(this.x, this.y, this.scrubber.x, this.scrubber.y + this.scrubber.height);
        pop();
    }
    
    isAlive() {
        return this.lifespan > 0;
    }
}

class CubeManager {
    constructor(scrubber) {
        this.cubes = [];
        this.scrubber = scrubber;
    }

    addCube(x, y, size, color) {
        if (this.cubes.length < 20) {
            this.cubes.push(new Cube(x, y, size, color, this.scrubber));
        }
    }

    update(features) {
        this.cubes = this.cubes.filter(cube => cube.isAlive());

        for (let cube of this.cubes) {
            // update cube properties based on Meyda analyzer RMS and ZCR features
            cube.size = map(features.rms, 0, 0.1, 10, 100);
            cube.color = color(map(features.zcr, 0, 100, 0, 360), 100, 100);
            cube.update();
        }
    this.cubes = this.cubes.filter(cube => cube.isAlive());

    }
}


class PolarSpectrum {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.rotationAngle = 0;
        this.skipFirstLastBins = 20; // number of bins to skip at the beginning and end of spectrum

        // Initialize colorStyle as an object with properties
        this.colorStyles = {
            SPECTRUM: 'spectrum',
            FOCUSED: 'focused'
        };
        this.colorStyle = this.colorStyles.SPECTRUM; // Set initial color style

        this.cycleColorStyle = () => {
            if (this.colorStyle === this.colorStyles.SPECTRUM) {
                this.colorStyle = this.colorStyles.FOCUSED;
            } else {
                this.colorStyle = this.colorStyles.SPECTRUM;
            }
        };
    }

    update(amplitudeSpectrum) {
        this.rotationAngle += 0.01;
        this.draw(amplitudeSpectrum);
    }

    draw(amplitudeSpectrum) {
        if (!amplitudeSpectrum) return; // Ensure amplitudeSpectrum is available

        push();
        translate(this.x, this.y);
        rotate(this.rotationAngle); //rotation makes the spectrum more dynamic and hide dull areas
        noFill();
        strokeWeight(4);
        
        // Use only a portion of the spectrum (highest frequencies don't occur that often)
        let usableSpectrumLength = floor(amplitudeSpectrum.length * 0.8);
        let angleStep = TWO_PI / (usableSpectrumLength - this.skipFirstLastBins * 2);

        let step = 1;

        for (let i = this.skipFirstLastBins; i < usableSpectrumLength - this.skipFirstLastBins; i += step) {
            let amplitude = amplitudeSpectrum[i];
            let angle = i * angleStep;

            let c, sat, brt, alpha;
            if (this.colorStyle === this.colorStyles.SPECTRUM) {
                // Map amplitude to a color
                c = map(amplitude, 0, 1, 200, 300);
                c = c % 360;
                sat = 80;
                brt = 100;
                alpha = map(amplitude, 0, 1, 100, 200);
            } else if (this.colorStyle === this.colorStyles.FOCUSED) {
                // Map amplitude to alpha
                c = 0;
                sat = 0;
                brt = 100;
                alpha = map(amplitude, 0, 1, 100, 200);
            }

            stroke(c, sat, brt, alpha);
            
            let r = map(amplitude, 0, 1, 100, this.radius);
            // polar to cartesian 
            let x = r * cos(angle);
            let y = r * sin(angle);

            // line from the center to the edge
            strokeWeight(10);
            line(0, 0, x, y);
        }
        pop();
    }
}

class ChromaCircles {
    constructor(yPosition, circleRadius = 20) {
        this.yPosition = yPosition;
        this.circleRadius = circleRadius;
        this.circles = Array(12).fill().map((_, i) => ({
            x: map(i, 0, 11, 50, width - 50), // spread circles evenly
            size: circleRadius,
            brightness: 100
        }));
    }

    update(chroma) {
        if (chroma) {
            for (let i = 0; i < this.circles.length; i++) {
                let chromaValue = chroma[i];
                this.circles[i].size = map(chromaValue, 0, 1, 8, 100);
                this.circles[i].brightness = map(chromaValue, 0, 1, 0, 100);
                this.circles[i].yPosition = map(chromaValue, 0, 1, 520, 630);
            }
        }
    }

    draw() {
        push();
        noStroke();
        for (let circle of this.circles) {
            fill(220, circle.brightness, circle.brightness, 100);
            ellipse(circle.x, circle.yPosition, circle.size, circle.size);
        }
        pop();
    }
}


