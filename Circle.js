/**
 * @class Circle
 * A circle body.
 *
 * Properties:
 * @property {number} radius: the circle's radius
 */
class Circle extends Body {

  /**
   * @constructor
   * @param {number} x: starting x position of the circle
   * @param {number} y: starting y position of the circle
   * @param {number} radius: radius of the circle
   * @param {object} options: see {Body}
   */
  constructor(x, y, radius, options) {

    super(x, y, options);

    this.type = 'circle';
    this.radius = radius;
    this.rotationalInertia = (1 / 2) * this.mass * Math.pow(this.radius, 2);
  }

  /**
   * @method boundingBox
   * Returns the circle's bounding box
   * @returns {Object}
   */
  get boundingBox() {
    return {
      x: this.position.x - this.radius,
      y: this.position.y - this.radius,
      w: this.radius * 2,
      h: this.radius * 2
    };
  }
}

