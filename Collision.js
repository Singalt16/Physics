/**
 * @function detectCollision
 * Detects whether or not a collision has occurred between two bodies
 * @param {Body} bodyA
 * @param {Body} bodyB
 */
function detectCollision(bodyA, bodyB) {

  // check bounding boxes for collision first for efficiency
  if (!detectBoxBox(bodyA.boundingBox, bodyB.boundingBox)) return false;
  if (bodyA instanceof Circle && bodyB instanceof Circle) return detectCircleCircle(bodyA, bodyB);
  else if (bodyA instanceof Polygon || bodyB instanceof Polygon) return separatingAxis(bodyA, bodyB);
}

/**
 * @function getNewVelocities
 * Calculates the post-collision velocities of two colliding bodies
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @return {{a: Vector, b: Vector}}
 * Formula for the calculation found here:
 *   https://en.wikipedia.org/wiki/Elastic_collision
 * Thanks to Dr. Nate Magee for helping with the solution to this problem
 */
function getNewVelocities(bodyA, bodyB) {
  let v1 = bodyA.velocity;
  let v2 = bodyB.velocity;
  let x1 = bodyA.position;
  let x2 = bodyB.position;
  let m1 = bodyA.mass;
  let m2 = bodyB.mass;

  let vDiff1 = Vector.difference(v1, v2);
  let vDiff2 = vDiff1.multipliedBy(-1);
  let xDiff1 = Vector.difference(x1, x2);
  let xDiff2 = xDiff1.multipliedBy(-1);

  let f1 = (2 * m2) / (m1 + m2);
  let f2 = Vector.dot(vDiff1, xDiff1) / Math.pow(xDiff1.magnitude, 2);
  let v1f = Vector.difference(v1, xDiff1.multipliedBy(f1 * f2));

  let f3 = (2 * m1) / (m1 + m2);
  let f4 = Vector.dot(vDiff2, xDiff2) / Math.pow(xDiff2.magnitude, 2);
  let v2f = Vector.difference(v2, xDiff2.multipliedBy(f3 * f4));

  return {'a': v1f, 'b': v2f};
}

/**
 * @function resolveCollision
 * Corrects a collision between two bodies if one has occurred
 * @param {Body} bodyA
 * @param {Body} bodyB
 * TODO: add option to resolve inelastic colls
 */
function resolveCollision(bodyA, bodyB) {
  let mtv = detectCollision(bodyA, bodyB);
  if (!mtv) return;

  // separates the two bodies
  if (bodyA.isStatic) bodyB.translate(mtv.multipliedBy(-1));
  else bodyA.translate(mtv);

  // assigns the new velocities to the bodies
  let velocitiesAfter = getNewVelocities(bodyA, bodyB);
  if (!bodyA.isStatic) {
    bodyA.velocity.set(velocitiesAfter['a']);
  }
  if (!bodyB.isStatic) {
    bodyB.velocity.set(velocitiesAfter['b']);
  }
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
 * @return {(Boolean | Vector)}: minimum-translation vector
 */
function detectCircleCircle(circleA, circleB) {
  let diff = Vector.difference(circleA.position, circleB.position);
  let distance = diff.magnitude;
  let radiiAdded = circleA.radius + circleB.radius;
  if (distance > radiiAdded) return false;

  // returns the minimum-translation vector
  return diff.unit().multipliedBy(radiiAdded - distance);
}

/**
 * @function separatingAxis
 * Uses the separating axis theorem to detect collision between two bodies
 * One of the bodies must be a polygon object
 * @param {Body} bodyA
 * @param {Body} bodyB
 * @returns {(Boolean | Vector)}:
 * Returns false if no collision
 * Otherwise returns minimum-translation vector (smallest vector
 *   that will separate the bodies)
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
  // beyond this point a collision was detected

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
  if (bodies[smallestPenetrationIndex] === 'b') mtv.multiply(-1);
  return mtv;
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