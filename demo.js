let colors = ["#00ffff", "#f0ffff", "#f5f5dc", "#000000", "#0000ff", "#a52a2a", "#00ffff", "#00008b", "#008b8b", "#a9a9a9", "#006400", "#bdb76b", "#8b008b", "#556b2f", "#ff8c00", "#9932cc", "#8b0000", "#e9967a", "#9400d3", "#ff00ff", "#ffd700", "#008000", "#4b0082", "#f0e68c", "#add8e6", "#e0ffff", "#90ee90", "#d3d3d3", "#ffb6c1", "#ffffe0", "#00ff00", "#ff00ff", "#800000", "#000080", "#808000", "#ffa500", "#ffc0cb", "#800080", "#800080", "#ff0000", "#c0c0c0", "#ffffff", "#ffff00"];

let canvas = document.getElementById("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

let engine = new Engine();
let renderer = new Renderer(canvas);
let world = new World({gravity: new Vector(0, 0)});
engine.addWorld(world);

function createTriangle(x, y, r, c) {
  return new RegularPolygon(new Vector(x, y), 3, r, {render: {borderColor: c} });
}

function getInitialGeneration() {
  let triangles = [];
  for (let i = 0; i < 100; i++) {
    let tri = createTriangle(100, innerHeight / 2, 15, colors[i % colors.length]);
    triangles.push(tri);
    tri.dead = false;
    tri.forces = [];
    for (let j = 0; j < 20; j++) {
      tri.forces.push(new Vector((Math.random()*2-1)/10, (Math.random()*2-1)/10));
    }
  }
  return triangles;
}

function getTotalScore() {
  return generation.reduce((a, b) => a + b.score, 0);
}

function createObstacles() {
  // let circles = [];
  // circles.push(new Circle({
  //   position: new Vector(window.innerWidth/2, window.innerHeight - 400),
  //   radius: 400,
  //   render: {borderWidth: 2, borderColor: 'blue'}
  // }));
  // return circles;
  return [new RegularPolygon(new Vector(window.innerWidth/2, window.innerHeight - 200), 4, 400, {render: {borderWidth: 2, borderColor: 'blue'}, angle: Math.PI/4})]
}

let generation = getInitialGeneration();
let obstacles = createObstacles();
let target = new Circle({
  position: new Vector(innerWidth / 2 + 500, innerHeight / 2),
  radius: 100,
  render: {fill: true, fillColor: 'red'},
  isStatic: true
});
generation.forEach(b => world.addBody(b));
obstacles.forEach(o => world.addBody(o));
world.addBody(target);

function distance(body1, body2) {
  return Vector.difference(body1.position, body2.position).magnitude;
}

function assignScore(b) {
  // return Math.min(Math.pow((3000 / distance(b, target)),2), 20);
  return Math.min(Math.pow(b.position.x / 300, 3), 150);
}

let secs;
let interval;
function beginRound() {
  secs = 0;
  if (interval) clearInterval(interval);
  interval = setInterval(function() {
    generation.forEach(b => {
      if (!b.dead) {
        b.applyForce(b.forces[secs], .5);
      }
    });
    secs++;
    if (secs >= 20) clearInterval(interval);
  }, 1000);

  setTimeout(function() {
    generation.forEach(b => b.score = assignScore(b));
  }, 20000);
  engine.run();
}

function wallCollision(b) {
  return b.position.x < 0 || b.position.x > innerWidth
    || b.position.y < 0 || b.position.y > innerHeight;
}

let alive = generation.length;

function breed(p1, p2) {
  let body = createTriangle(100, innerHeight / 2, 15, colors[Math.floor(Math.random() * colors.length)]);
  body.forces = [];
  for (let i = 0; i < 20; i++) {
    if (Math.floor(Math.random() * 50) === 0) {
      body.forces.push(new Vector((Math.random()*2-1)/10, (Math.random()*2-1)/10));
    }
    if (Math.round(Math.random()) === 0) {
      body.forces.push(p1.forces[i])
    } else body.forces.push(p2.forces[i])
  }
  return body;
}

function breedGeneration() {
  let breedPool = [];
  generation.forEach(b => {
    for (let i = 0; i < b.score; b++) {
      breedPool.push(b);
    }
  });

  let newGen = [];
  for (let i = 0; i < 100; i++) {
    let body = breed(
      breedPool[Math.floor(Math.random() * breedPool.length)],
      breedPool[Math.floor(Math.random() * breedPool.length)]
    );
    newGen.push(body);
  }
  generation = newGen;
  generation.forEach(b => world.addBody(b));
  alive = generation.length;
}

function reset() {
  engine = new Engine();
  world = new World({gravity: new Vector(0, 0)});
  obstacles.forEach(o => world.addBody(o));
  world.addBody(target);
  engine.addWorld(world);
  breedGeneration();
  beginRound();
}

function animate() {
  requestAnimationFrame(animate);
  renderer.clearAll();
  generation.forEach(b => {
    obstacles.forEach(o => {
      const coll = detectCollision(b, o);
      if (coll || wallCollision(b)) {
        if (!b.dead) {
          b.dead = true;
          alive--;
        }
        b.force.set(new Vector(0, 0));
        b.velocity = new Vector(0,0);
      }
    });
    if (!b.dead) b.rotate(b.velocity.angle - b.angle);
    const coll = detectCollision(b, target);
    if (coll || wallCollision(b)) {
      if (!b.dead) {
        b.dead = true;
        alive--;
      }
      b.force.set(new Vector(0, 0));
      b.velocity = new Vector(0,0);
    }
  });

  renderer.renderEngine(engine);
  if (alive === 0) {
    console.log('resetting');
    generation.forEach(b => b.score = assignScore(b));
    console.log(getTotalScore());
    reset();
  }
}
animate();
beginRound();
