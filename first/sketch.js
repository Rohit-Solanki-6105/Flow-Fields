let cols, rows;
let scl = 20; // Grid scale
let flowfield;
let particles = [];

function setup() {
  createCanvas(innerWidth, innerHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);

  for (let i = 0; i < 1000; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  // background(255);
  generateFlowfield();
  updateParticles();
}

function generateFlowfield() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * 0.01) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += 0.1;
    }
    yoff += 0.1;
  }
}

function updateParticles() {
  for (let i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }
}

class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector(0, 0);
    this.acc = createVector(0, 0);
    this.maxspeed = 3;
    this.prevPos = this.pos.copy();
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.pos.x = lerp(this.prevPos.x, this.pos.x, 0.5); // Smoother interpolation
    this.pos.y = lerp(this.prevPos.y, this.pos.y, 0.5);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  follow(flowfield) {
    let x = floor(this.pos.x / scl);
    let y = floor(this.pos.y / scl);
    let index = x + y * cols;
    let force = flowfield[index];
    if (force) {
      this.applyForce(force);
    }
  }

  show() {
    stroke(0, 5);
    strokeWeight(1);
    point(this.pos.x, this.pos.y); // Draw a point at the particle's position
    this.updatePrev();
  }

  updatePrev() {
    this.prevPos.x = this.pos.x;
    this.prevPos.y = this.pos.y;
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }
}
