/**
 * @class Body
 * A single body within a world.
 *
 * Properties:
 * @property {string} type: the type of body it is
 * @property {string} tag: a unique tag used to identify the body
 * @property {Vector} position: the position of the body's center of mass
 * @property {Vector} velocity: the velocity of the body
 * @property {Vector} acceleration: the acceleration of the body
 * @property {Vector} forces: the force applied on the body
 * @property {number} mass: the mass of the body
 * @property {number} angle: the angle of the body relative to the positive x-axis
 * @property {number} angularVelocity: the angular velocity of the body
 * @property {number} angularAcceleration: the angular acceleration of the body
 * @property {number} torques: the torque on the body
 * @property {number} rotationalInertia: the moment of inertia of the body
 *  - Rotational inertia is only set in the body subclasses
 * @property {boolean} isStatic: determines whether the body is static or dynamic
 * @property {World} world: the world to which the body belongs
 * @property {Object} render: render options for the body (color, border width, etc.)
 *
 * Methods:
 * @method translate(): translates the body by a given vector
 * @method rotate(): rotates the body by a given scalar
 * @method applyForce(): applies force on the body
 * @method applyTorque(): applies torque on the body
 * @method update(): updates the properties of the body
 * @method updatePosition(): updates the body's position
 * @method updateVelocity(): updates the body's velocity
 * @method updateAcceleration(): updates the body's acceleration
 * @method updateAngle(): updates the body's angular position
 * @method updateAngularVelocity(): updates the body's angular velocity
 * @method updateAngularAcceleration(): updates the body's angular acceleration
 */
class Body {

  /**
   * @constructor
   * @param {number} x: starting x position of the body
   * @param {number} y: starting y position of the body
   * @param {Object} options: see {Body}
   */
  constructor(x, y, options) {

    const defaults = {
      tag: randomString(),
      angle: 0,
      velocity: new Vector(0, 0),
      angularVelocity: 0,
      acceleration: new Vector(0, 0),
      angularAcceleration: 0,
      mass: 1,
      forces: [],
      torques: [],
      isStatic: false,
      render: {}
    };
    const props = Object.assign({}, defaults, options);

    // Private properties:
    this.type = 'body';
    this.world = undefined;
    this.rotationalInertia = props.mass;

    // Public properties:
    this.tag = props.tag;
    this.render = props.render;
    this.position = new Vector(x, y);
    this.angle = props.angle;
    this.velocity = props.velocity;
    this.angularVelocity = props.angularVelocity;
    this.acceleration = props.acceleration;
    this.angularAcceleration = props.angularAcceleration;
    this._totalAcceleration = new Vector(this.acceleration.x, this.acceleration.y);
    this._totalAngularAcceleration = this.angularAcceleration;
    this.mass = (props.isStatic) ? Infinity : props.mass;
    this.forces = [];
    this.torques = [];
    this.isStatic = props.isStatic;
  }

  /**
   * @method translate
   * Translates the body by a given vector
   * @param {Vector} translationVector
   */
  translate(translationVector) {
    this.position = Vector.sum(this.position, translationVector);
  }

  /**
   * @method rotate
   * Rotates the body by a given angle
   * @param {number} angle
   */
  rotate(angle) {
    this.angle += angle;
    if (this.angle > Math.PI * 2) {
      this.angle %= Math.PI * 2;
    } else if (this.angle < 0) {
      this.angle = Math.PI * 2 + (this.angle % Math.PI * 2);
    }
  }

  /**
   * @method applyForce
   * Applies a local force to the body
   * @param {Vector} force: the force vector to apply
   * @param {number} timeout: (optional) the time in seconds until the force is removed
   */
  applyForce(force, timeout = 0) {
    this.forces.push(force);
    if (timeout) {
      setTimeout(() => this.forces.splice(this.forces.indexOf(force)), timeout * 1000);
    }
  }

  resetForce() {
    this.forces = [];
  }

  resetTorque() {
    this.torques = [];
  }

  /**
   * @method applyTorque
   * Applies torque to the body
   * @param {number} force: force that creates a rotation
   * @param {number} radius: perpendicular distance from the force to the point of rotation
   * @param {number} timeout: (optional) the time in seconds until the torque is reset
   */
  applyTorque(force, radius, timeout = 0) {
    let torque = force * radius;
    this.torques.push(force * radius);
    if (timeout) {
      setTimeout(() => this.torques.splice(this.torques.indexOf(torque)), timeout * 1000);
    }
  }

  /**
   * @method update
   * Updates the body's properties
   */
  update() {
    this.updateAcceleration();
    this.updateVelocity();
    this.updatePosition();
    this.updateAngularAcceleration();
    this.updateAngularVelocity();
    this.updateAngle();
  }

  /**
   * @method updatePosition
   * Updates the body's position
   */
  updatePosition() {
    this.translate(this.velocity);
  }

  /**
   * @method updateVelocity
   * Updates the body's velocity
   */
  updateVelocity() {
    this.velocity.add(this._totalAcceleration);
  }

  /**
   * @method updateAcceleration
   * Updates the body's acceleration
   */
  updateAcceleration() {
    if (this.isStatic) return;
    this._totalAcceleration = Vector.sum(
      this.world.gravity.multipliedBy(this.mass),
      this.world.force,
      this.acceleration,
      ...this.forces
    ).dividedBy(this.mass);
  }

  /**
   * @method updateAngle
   * Updates the body's angular position
   */
  updateAngle() {
    this.rotate(this.angularVelocity);
  }

  /**
   * @method updateAngularVelocity
   * Updates the body's angular velocity
   */
  updateAngularVelocity() {
    this.angularVelocity += this._totalAngularAcceleration;
  }

  /**
   * @method updateAngularAcceleration
   * Updates the body's angular acceleration
   */
  updateAngularAcceleration() {
    if (this.isStatic) return;
    this._totalAngularAcceleration = this.torques.reduce((a, b) => a + b, 0) / this.rotationalInertia
      + this.angularAcceleration;
  }

  get boundingBox() {
    throw "the body's bounding box has not been defined";
  }
}
