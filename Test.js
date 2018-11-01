let canvas = document.getElementById("canvas");
canvas.width = innerWidth;
canvas.height = innerHeight;

window.addEventListener('resize', () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;
});

let engine = new Engine();
let renderer = new Renderer(canvas);

let world = new World();
engine.addWorld(world);

let render1 = {
  borderWidth: 2,
  borderColor: 'blue'
};

let bodies = [];
for (let i = 0; i < 20; i++) {
  let x = Math.random() * innerWidth;
  let y = Math.random() * innerHeight;
  let sides = Math.ceil(Math.random() * 5) + 2;
  let radius = Math.random() * 10 + 40;
  bodies.push(new RegularPolygon(x, y, sides, radius, {mass: radius, render: render1}));
}
for (let i = 0; i < 0; i++) {
  let x = Math.random() * innerWidth;
  let y = Math.random() * innerHeight;
  let radius = Math.random() * 80 + 20;
  bodies.push(new Circle(x, y, radius, {mass: radius, render: render1}));
}
//bodies.push(new Circle({position: new Vector(100, 100), radius: 80, render: render1}));
bodies.forEach(b => world.addBody(b));
for (let i = 0; i < bodies.length; i++) {
  bodies[i].applyForce(new Vector(100 * (Math.random() - 0.5), 100 * (Math.random() - 0.5)), 0.1);
  // bodies[i].applyTorque(Math.random() * 200 - 100, 1, 4);
}
// setInterval(function(){
//   for (let i = 0; i < bodies.length; i++) {
//     bodies[i].applyForce(new Vector(Math.random() * 0.1 - 0.05, Math.random() * 0.1 - 0.05), 1);
//     bodies[i].applyTorque(Math.random() * 200 - 100, 0.005, 1);
//   }
// }, 1000);
engine.run();
function animate() {
  requestAnimationFrame(animate);
  renderer.clearAll();

  for (let i = 0; i < bodies.length; i++) {
    renderer.context.beginPath();
    renderer.context.fillStyle = 'black';
    renderer.context.arc(bodies[i].position.x, bodies[i].position.y, 2, 0, Math.PI * 2);
    renderer.context.fill();
    if (bodies[i].position.x > innerWidth || bodies[i].position.x < 0) {
      // if (bodies[i].position.x > innerWidth) bodies[i].position.x = innerWidth;
      // else bodies[i].position.x = 0;
      bodies[i].velocity.x = -bodies[i].velocity.x;
    }
    if (bodies[i].position.y > innerHeight || bodies[i].position.y < 0) {
    //   if (bodies[i].position.y > innerHeight) bodies[i].position.y = innerHeight;
    //   else bodies[i].position.y = 0;
      bodies[i].velocity.y = -bodies[i].velocity.y;
    }
    for (let j = i + 1; j < bodies.length; j++) {
      resolveCollision(bodies[i], bodies[j]);
    }
  }
  renderer.renderEngine(engine);
}
animate();