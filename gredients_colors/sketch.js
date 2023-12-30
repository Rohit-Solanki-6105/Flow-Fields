let cols, rows;
let scl = 20; // Grid scale
let flowfield;
let particles = [];
let c1, c2;
let pc1, pc2;
const angleMove = 0.1;
const xoff_val = 0.05;
const yoff_val = 0.05;
const move_max = 5;

function setup() {
  createCanvas(innerWidth, innerHeight);
  cols = floor(width / scl);
  rows = floor(height / scl);
  flowfield = new Array(cols * rows);

  c1 = color(7, 12, 16);
  c2 = color(22, 47, 68);

  pc1 = color(40, 50, 60);
  pc2 = color(70, 110, 150);

  for (let i = 0; i < 700; i++) {
    particles.push(new Particle());
  }
}

function draw() {
  setGradient(0, 0, width, height, c1, c2, 60, -35); // Set alpha to 255 for full opacity and angle to 45 degrees
  generateFlowfield();
  updateParticles();
}

function setGradient(x, y, w, h, c1, c2, alpha, angle) {
  let gradient = drawingContext.createLinearGradient(x, y, x + w * cos(radians(angle)), y + h * sin(radians(angle)));
  gradient.addColorStop(0, color(c1.levels[0], c1.levels[1], c1.levels[2], alpha).toString());
  gradient.addColorStop(1, color(c2.levels[0], c2.levels[1], c2.levels[2], alpha).toString());
  drawingContext.fillStyle = gradient;
  drawingContext.fillRect(x, y, w, h);
}

function generateFlowfield() {
  let yoff = 0;
  for (let y = 0; y < rows; y++) {
    let xoff = 0;
    for (let x = 0; x < cols; x++) {
      let index = x + y * cols;
      let angle = noise(xoff, yoff, frameCount * angleMove) * TWO_PI * 4;
      let v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += xoff_val;
    }
    yoff += yoff_val;
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
    this.maxspeed = move_max;
    this.prevPos = this.pos.copy();
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
    this.pos.x = lerp(this.prevPos.x, this.pos.x, 0.5);
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
    let colorBetweenTwoColors = lerpColor(pc1, pc2, map(this.pos.x, 0, width, 0, 1));
    stroke(colorBetweenTwoColors);
    strokeWeight(5);
    point(this.pos.x, this.pos.y);
    this.updatePrev();
  }
  // show() {
  //   stroke(50, 50);
  //   strokeWeight(10);
  //   point(this.pos.x, this.pos.y);
  //   this.updatePrev();
  // }

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
