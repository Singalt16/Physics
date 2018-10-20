/**
 * @function detectCollision
 * Detects the collision between two bodies
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @returns {}
 */
function detectCollision2(bodyA, bodyB) {

  // check bounding boxes for collision first
  if (!detectBoxBox(bodyA.boundingBox, bodyB.boundingBox)) return false;
  if (bodyA instanceof Circle && bodyB instanceof Circle) return detectCircleCircle(bodyA, bodyB);
  else if (bodyA instanceof Polygon || bodyB instanceof Polygon) return separatingAxis(bodyA, bodyB);
}

// Temp code to test detection and mtv
function detectCollision(bodyA, bodyB) {
  let coll = detectCollision2(bodyA, bodyB);
  if (!coll) return false;
  let body = coll.body;
  let mtv = coll.mtv;
  if (body === 'a') bodyA.translate(mtv);
  else if (body === 'b') bodyB.translate(mtv);
  // bodyA.velocity.x = -bodyA.velocity.x;
  // bodyA.velocity.y = -bodyA.velocity.y;
  // bodyB.velocity.x = -bodyB.velocity.x;
  // bodyB.velocity.y = -bodyB.velocity.y;

  // let va = new Vector(bodyA.velocity.x, bodyA.velocity.y);
  // bodyA.velocity.x = bodyB.velocity.x * (bodyB.mass / bodyA.mass);
  // bodyA.velocity.y = bodyB.velocity.y * (bodyB.mass / bodyA.mass);
  // bodyB.velocity.x = va.x * (bodyA.mass / bodyB.mass);
  // bodyB.velocity.y = va.y * (bodyA.mass / bodyB.mass);
  return true;
}

/**
 * @function detectBoxBox
 * Checks whether or not the bounding boxes of two bodies intersect
 * @param {Object} bbA: the bounding box of the first body
 * @param {Object} bbB: the bounding box of the second body
 * @returns {boolean}
 */
function detectBoxBox(bbA, bbB) {
  if (bbA.x + bbA.w > bbB.x) {
    if (bbB.x + bbB.w > bbA.x) {
      if (bbA.y + bbA.h > bbB.y) {
        return (bbB.y + bbB.h > bbA.y);
      }
    }
  }
  return false;
}

/**
 * @function detectCircleCircle
 * Detects the collision between two circles
 * @param {Circle} circleA
 * @param {Circle} circleB
 * @return {Boolean | {mtv, body}}: minimum-translation vector
 */
function detectCircleCircle(circleA, circleB) {
  let diff = Vector.difference(circleA.position, circleB.position);
  let distance = diff.magnitude;
  let radiiAdded = circleA.radius + circleB.radius;
  if (distance > radiiAdded) return false;

  // returns the minimum-translation vector
  return {body: 'a', mtv: diff.unit().multipliedBy(radiiAdded - distance)};
}

/**
 * Uses the separating axis theorem to detect collision between two bodies
 * One of the bodies must be a polygon object
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @returns {Boolean | {mtv, body}}:
 * Returns false if no collision
 * Otherwise returns minimum-translation vector (smallest vector that will separate the bodies)
 * and the body to add it to
 */
function separatingAxis(bodyA, bodyB) {

  if (!(bodyA instanceof Polygon || bodyB instanceof Polygon))
    throw new Error("One of the bodies must be a polygon to use the SAT");

  // gets the unit vector of each polygon's sides to represent the axes to test
  let axes = getAxes(bodyA, bodyB);

  let tmp = axes.map(a => getPenetration(bodyA, bodyB, a));
  let bodies = tmp.map(t => t.body);
  let penetrations = tmp.map(t => t.penetration);

  // if there is a 0 penetration then a separating axis exists and there is no collision
  if (penetrations.includes(0)) return false;
  // beyond this point, a collision was already detected

  // finds the smallest penetration
  let smallestPenetrationIndex = -1;
  let smallestPenetration = 10000000;
  for (let i = 0; i < penetrations.length; i++) {
    if (penetrations[i] < smallestPenetration) {
      smallestPenetration = penetrations[i];
      smallestPenetrationIndex = i;
    }
  }

  // finds the minimum translation vector
  let mtv = new Vector(axes[smallestPenetrationIndex].x, axes[smallestPenetrationIndex].y);
  mtv.magnitude = penetrations[smallestPenetrationIndex];
  return {mtv, body: bodies[smallestPenetrationIndex]};
}

/**
 * Returns all axes that need to be tested for the SAT to work
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @return {Vector[]}
 */
function getAxes(bodyA, bodyB) {

  let axes = [];
  if (bodyA instanceof Polygon) axes.push(...getNormals(bodyA.sides).map(n => n.unit()));
  else axes.push(...circleAxes(bodyA, bodyB).map(a => a.unit()));
  if (bodyB instanceof Polygon) axes.push(...getNormals(bodyB.sides).map(n => n.unit()));
  else axes.push(...circleAxes(bodyB, bodyA).map(a => a.unit()));

  return axes;
}

/**
 * Returns the axes between a circle's center and a polygon's vertices
 * @param {Circle} circle
 * @param {Polygon} polygon
 * @return {Vector[]}
 */
function circleAxes(circle, polygon) {
  return polygon.vertices.map(v => Vector.difference(circle.position, v));
}

/**
 * Returns the normals (perpendicular vectors) of a polygon's sides
 * @param {Line[]} sides
 * @returns {Vector[]}
 */
function getNormals(sides) {
  return sides.map(s => {
    let axis = Vector.difference(s.pointB, s.pointA);
    return new Vector(-axis.y, axis.x); // opposite reciprocal
  })
}

/**
 * Returns the amount of overlap of the two bodies' projections on an axis
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @param {Vector} axis
 * @returns {{body, penetration}}:
 * body: the body to add the mtv to if the penetration is the smallest (char)
 * penetration: the overlap of the bodies
 */
function getPenetration(bodyA, bodyB, axis) {
  let projectionsA, projectionsB;
  if (bodyA instanceof Polygon) projectionsA = projectPolygon(bodyA, axis);
  else if (bodyA instanceof Circle) projectionsA = projectCircle(bodyA, axis);
  if (bodyB instanceof Polygon) projectionsB = projectPolygon(bodyB, axis);
  else if (bodyB instanceof Circle) projectionsB = projectCircle(bodyB, axis);

  if (projectionsA.min > projectionsB.min) {
    return {body: 'a', penetration: Math.max(projectionsB.max - projectionsA.min, 0)};
  } else return {body: 'b', penetration: Math.max(projectionsA.max - projectionsB.min, 0)};
}

/**
 * Returns min and max values of the projection (shadow) of a polygon on an axis
 * @param {Polygon} polygon
 * @param {Vector} axis
 * @returns {{min: number, max: number}}
 */
function projectPolygon(polygon, axis) {
  let projections = polygon.vertices.map(v => Vector.dot(v, axis));
  return {min: Math.min(...projections), max: Math.max(...projections)};
}

/**
 * Returns min and max values of the projection (shadow) of a circle on an axis
 * @param {Circle} circle
 * @param {Vector} axis
 * @returns {{min: number, max: number}}
 */
function projectCircle(circle, axis) {
  let min = Vector.dot(Vector.difference(circle.position, axis.multipliedBy(circle.radius)), axis);
  let max = Vector.dot(Vector.sum(circle.position, axis.multipliedBy(circle.radius)), axis);
  return {min, max};
}