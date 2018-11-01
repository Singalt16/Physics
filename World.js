/**
 * @class World
 * A container that controls the physics for its inhabitants.
 *
 * Properties:
 * @property {Body[]} bodies: the bodies within the world
 * @property {number} gravity: the world's gravitational acceleration
 * @property {number} airResistance: the world's air resistance
 *
 * Methods:
 * @method update(): updates the world and its bodies
 * @method addBody(): adds a body to the world
 */
class World {

  /**
   * @constructor
   * @param {Object} options
   */
  constructor(options={}) {
    const defaults = {
      label: 'world',
      tag: 'world',
      gravity: new Vector(0, 0),
      force: new Vector(0, 0),
      bodies: [],
      airResistance: 0
    };
    Object.assign(this, defaults, options);

    this.bodies.forEach(b => Object.defineProperty(b, "world", {
      value: this
    }));
  }

  /**
   * @method addBody
   * Adds a body to the world
   * @param {Body} body
   */
  addBody(body) {
    Object.defineProperty(body, "world", {
      value: this
    });
    this.bodies.push(body);
  }

  /**
   * @method removeBody
   * Removes a body from the world
   * @param {string} tag: identifier used to find the body
   *   Must be a unique tag to work properly.
   */
  removeBody(tag) {
    let index = this.bodies.find(b => b.tag === tag);
    if (index) this.bodies.splice(index, 1);
  }

  /**
   * @method update
   * updates the world's bodies
   */
  update() {
    this.bodies.forEach(b => b.update());
  }
}
