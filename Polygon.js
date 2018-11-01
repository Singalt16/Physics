/**
 * @class Polygon
 * A polygon body.
 *
 * Properties:
 * @property {Vector[]} vertices: the polygon's vertices relative to global space
 * @property {Vector} centroid: the position of the geometric center of the polygon
 * @property {Vector} centerOfMass: the position of the center of mass of the polygon
 *
 * Methods:
 * @method update(): updates the polygon's properties
 * @method getAverageRadius(): returns the average distance from the polygon's center of mass to its vertices
 */
class Polygon extends Body {

  /**
   * @constructor
   * @param {Vector[]} vertices: the polygon's vertices relative to global space
   * @param {Object} options: see {Body}
   */
  constructor(vertices, options) {

    const centroid = Polygon.getCentroid(vertices);
    const sortedVertices = Polygon.sortVertices(vertices, centroid);
    const centerOfMass = Polygon.getCenterOfMass(sortedVertices);
    super(centerOfMass.x, centerOfMass.y, options);

    sortedVertices.forEach(v => v.rotate(this.angle, this.position));
    const sides = Polygon.getSides(sortedVertices);

    this.type = 'polygon';
    this.vertices = sortedVertices;
    this.centroid = centroid;
    this.sides = sides;
    this.rotationalInertia = (1 / 2) * this.mass * Math.pow(Polygon.getAvgRadius(this.vertices, this.position), 2)
  }

  /**
   * @method translate
   * Shifts the polygon's position by a given vector. Overrides Body.translate()
   * @param {Vector} translation: the vector to translate by
   * TODO: fix user changing position directly
   */
  translate(translation) {
    this.vertices.forEach(v => v.add(translation));
    this.centroid.add(translation);
    super.translate(translation);
  }

  /**
   * @method rotate
   * Rotates the polygon by a given angle. Overrides Body.rotate()
   * @param {number} angle
   * TODO: fix user changing angle directly
   */
  rotate(angle) {
    this.vertices.forEach(v => v.rotate(angle, this.position));
    this.centroid.rotate(angle, this.position);
    super.rotate(angle);
  }

  /**
   * @method boundingBox
   * Returns the polygon's bounding box
   * @return {Object}
   */
  get boundingBox() {
    const xs = this.vertices.map(v => v.x);
    const ys = this.vertices.map(v => v.y);
    const x = Math.min(...xs);
    const y = Math.min(...ys);
    return {
      x: x,
      y: y,
      w: Math.max(...xs) - x,
      h: Math.max(...ys) - y
    };
  }

  /**
   * @method getCentroid
   * Returns the geometric center of a group of vertices
   * @param {Vector[]} vertices
   * @returns {Vector}
   */
  static getCentroid(vertices) {
    return Vector.sum(...vertices).dividedBy(vertices.length);
  }

  /**
   * @method getCenterOfMass
   * Returns the center of mass of a (sorted) vertices array
   * Math explained:
   * https://en.wikipedia.org/wiki/Centroid
   * @param {Vector[]} vertices
   * @returns {Vector}
   */
  static getCenterOfMass(vertices) {

    // closed is a representation of the vertices where the first vertex is also the last vertex
    const closed = vertices.slice();
    closed.push(vertices[0]);

    // get the signed area of the polygon
    const area = (1 / 2) * sum(0, closed.length - 2, i =>
      (closed[i].x * closed[i + 1].y) - (closed[i + 1].x * closed[i].y));

    // get the x coordinate of the center of mass
    const x = (1 / (6 * area)) * sum(0, closed.length - 2, i => {
      let f = closed[i].x + closed[i + 1].x;
      let g = (closed[i].x * closed[i + 1].y) - (closed[i + 1].x * closed[i].y);
      return f * g;
    });

    // get the y coordinate of the center of mass
    const y = (1 / (6 * area)) * sum(0, closed.length - 2, i => {
      let f = closed[i].y + closed[i + 1].y;
      let g = (closed[i].x * closed[i + 1].y) - (closed[i + 1].x * closed[i].y);
      return f * g;
    });
    return new Vector(x, y);
  };

  /**
   * @method sortVertices
   * Arranges vertices by their angle relative to their centroid
   * @param {Vector[]} vertices
   * @param {Vector} centroid: geometric center of the vertices
   * @returns {Vector[]}
   */
  static sortVertices(vertices, centroid) {

    // gets the vertices relative to their centroid
    let relVertices = vertices.map(v => Vector.difference(v, centroid));

    // sorts the relative vertices by their angles from low to high
    const sortedRelVertices = relVertices.sort((a, b) => a.angle - b.angle);

    // returns the sorted vertices relative to global space
    return sortedRelVertices.map(v => Vector.sum(v, centroid));
  };

  /**
   * @method getAvgRadius
   * Returns the average distance from the polygon's center of mass to its vertices
   * @param {Vector[]} vertices
   * @param {Vector} centerOfMass
   * @returns {number}
   */
  static getAvgRadius(vertices, centerOfMass) {
    const radii = vertices.reduce((r, v) => r + Vector.difference(v, centerOfMass).magnitude, 0);
    return radii / vertices.length;
  };

  /**
   * @method getSides
   * Gets the sides of a polygon from its vertices
   * @param {Vector[]} vertices: the polygon's vertices
   * @returns {Line[]}
   */
  static getSides(vertices) {
    const closed = vertices.slice();
    closed.push(vertices[0]);
    return closed.reduce((sides, v, i, vs) => {
      if (i < vs.length - 1) sides.push(new Line(v, vs[i+1]));
      return sides;
    }, []);
  };
}

/**
 * @class RegularPolygon
 * Allows simple instantiation of a regular polygon (equilateral and equiangular).
 */
class RegularPolygon extends Polygon {

  /**
   * @constructor
   * @param {number} x: starting x position of the polygon
   * @param {number} y: starting y position of the polygon
   * @param {int} numSides: the number of sides of the polygon
   * @param {number} radius: the distance of each vertex from the center
   * @param {Object} options: see {Body}
   */
  constructor(x, y, numSides, radius, options) {
    let center = new Vector(x, y);
    let vertices = RegularPolygon.findVertices(center, numSides, radius);
    super(vertices, options);
  }

  static findVertices(center, numSides, radius) {
    let angle = 0;
    let vertices = [];
    for (let i = 0; i < numSides; i++) {
      let vertex = new Vector(1, 1);
      vertex.angle = angle;
      angle += Math.PI * 2 / numSides;
      vertex.magnitude = radius;
      vertex.add(center);
      vertices.push(vertex);
    }
    return vertices;
  }
}