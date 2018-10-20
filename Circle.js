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
   * @param {object} options: see {Body}
   */
  constructor(options) {

    super(options);

    Object.defineProperties(this, {
      "type": {
        value: 'circle'
      },
      "radius": {
        value: options.radius,
        enumerable: true
      }
    });

    Object.defineProperty(this, "rotationalInertia", {
      value: (1 / 2) * this.mass * Math.pow(this.radius, 2)
    });
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

