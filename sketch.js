let balloons = [];
let attractor;
let repeller;

function setup() {
  createCanvas(1000, 1000);
  attractor = new Attractor();
  repeller = new Repeller(width / 2, height / 2);
}

function draw() {
  background(220);

  attractor.update(mouseX, mouseY); // 마우스 위치에 따라 중력이 서서히 적용

  for (let i = 0; i < balloons.length; i++) {
    balloons[i].update();
    balloons[i].display();
  }

  balloons = balloons.filter((balloon) => !balloon.finished());
}

function mousePressed() {
  let balloon = new Balloon(mouseX, mouseY, attractor, repeller);
  balloons.push(balloon);
}

class Particle {
  constructor(x, y, attractor, repeller) {
    this.position = createVector(x, y);
    this.velocity = createVector(random(-1, 1), random(-1, 1));
    this.acceleration = createVector(0, 0);
    this.color = color(random(255), random(255), random(255));
    this.lifespan = 255; // 수명 추가
    this.attractor = attractor;
    this.repeller = repeller;
    this.mass = 1;
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  update() {
    this.velocity.add(this.acceleration);
    this.position.add(this.velocity);
    this.acceleration.mult(0);
    this.lifespan -= 1.5; // 수명 감소
    // Attractor에 대한 힘을 적용
    let attractForce = this.attractor.attract(this);
    this.applyForce(attractForce);

    // Repeller에 대한 힘을 적용
    let repelForce = this.repeller.repel(this);
    this.applyForce(repelForce);
  }

  display() {
    noStroke();
    fill(
      this.color.levels[0],
      this.color.levels[1],
      this.color.levels[2],
      this.lifespan
    );
    ellipse(this.position.x, this.position.y, 8, 8);
  }

  isDead() {
    return this.lifespan <= 0;
  }
}

class Balloon {
  constructor(x, y, attractor, repeller) {
    this.x = x;
    this.y = y;
    this.radius = 10;
    this.particles = [];
    this.color = color(random(255), random(255), random(255));
    this.isPopped = false;
    this.alpha = 255;
    this.attractor = attractor;
    this.repeller = repeller;
  }

  update() {
    if (!this.isPopped) {
      this.radius += 2;

      if (this.radius >= dist(this.x, this.y, width / 2, height / 2)) {
        this.pop();
      }
    }

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
  }

  display() {
    fill(
      this.color.levels[0],
      this.color.levels[1],
      this.color.levels[2],
      this.alpha
    );
    ellipse(this.x, this.y, this.radius * 2, this.radius * 2);

    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].display();
    }
  }

  pop() {
    this.isPopped = true;
    this.alpha = 0;
    for (let i = 0; i < 100; i++) {
      let particle = new Particle(
        this.x,
        this.y,
        this.attractor,
        this.repeller
      );
      this.particles.push(particle);
    }
  }

  finished() {
    return this.isPopped && this.particles.length === 0;
  }
}

class Repeller {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.strength = -20; // 중력의 강도를 더 크게 수정
  }

  repel(particle) {
    let force = p5.Vector.sub(this.position, particle.position);
    let distance = force.mag();
    distance = constrain(distance, 5, 50);
    force.normalize();

    let strength = (this.strength * particle.mass) / (distance * distance);
    force.mult(strength);

    return force;
  }
}

class Attractor {
  constructor() {
    this.mass = 20;
    this.position = createVector(); // 초기 위치를 설정하지 않음
    this.strength = 0; // 중력의 강도 초기값
  }

  update(mouseX, mouseY) {
    this.position.set(mouseX, mouseY);
    // 중력의 강도를 서서히 증가시킴
    this.strength = lerp(this.strength, 55, 0.02); // 중력 강도를 55으로 수정
  }

  attract(particle) {
    let force = p5.Vector.sub(this.position, particle.position);
    let distance = force.mag();
    distance = constrain(distance, 5, 50);
    force.normalize();

    let strength = (0.4 * this.mass * particle.mass) / (distance * distance);
    force.mult(strength * this.strength); // 중력의 강도 적용

    return force;
  }
}
