/**
 * @class Body
 * A single body within a world.
 *
 * Properties:
 * @property {Vector} position: the position of the body's center of mass
 * @property {Vector} velocity: the velocity of the body
 * @property {Vector} acceleration: the acceleration of the body
 * @property {Vector} force: the force applied on the body
 * @property {Vector} globalForce: the force applied on the body by its world
 * @property {number} mass: the mass of the body
 * @property {number} angle: the angle of the body relative to the positive x-axis
 * @property {number} angularVelocity: the angular velocity of the body
 * @property {number} angularAcceleration: the angular acceleration of the body
 * @property {number} torque: the torque on the body
 * @property {number} rotationalInertia: the moment of inertia of the body
 *  - Rotational inertia is only set in the body subclasses
 * @property {boolean} isStatic: determines whether the body is static or dynamic
 * @property {World} world: the world to which the body belongs
 * @property {Object} render: render options for the body (color, border width, etc.)
 *
 * Methods:
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

  constructor(options) {

    const defaults = {
      tag: 'body',
      position: new Vector(0, 0),
      angle: 0,
      velocity: new Vector(0, 0),
      angularVelocity: 0,
      mass: 1,
      force: new Vector(0, 0),
      torque: 0,
      isStatic: false,
      render: {}
    };
    const settings = Object.assign({}, defaults, options);

    let position = settings.position;
    let angle = settings.angle;
    let velocity = settings.velocity;
    let angularVelocity = settings.angularVelocity;
    let acceleration = new Vector(0, 0);
    let angularAcceleration = 0;
    let mass = (settings.isStatic) ? Infinity : settings.mass;
    let force = settings.force;
    let torque = settings.torque;
    let isStatic = settings.isStatic;

    Object.defineProperties(this, {

      // Public properties:
      "tag": {
        value: settings.tag,
        enumerable: true,
        writable: true
      },
      "render": {
        value: settings.render,
        writable: true
      },

      // Private properties:
      "position": {
        enumerable: true,
        get: () => Object.assign({}, position),
        set: newPos => position.set(newPos)
      },
      "angle": {
        enumerable: true,
        get: () => angle,
        set: newAng => angle = newAng
      },
      "velocity": {
        enumerable: true,
        get: () => velocity,
        set: newVelocity => velocity.set(newVelocity)
      },
      "angularVelocity": {
        enumerable: true,
        get: () => angularVelocity,
        set: newAngVel => angularVelocity = newAngVel
      },
      "acceleration": {
        enumerable: true,
        get: () => acceleration,
        set: newAcc => acceleration.set(newAcc)
      },
      "angularAcceleration": {
        enumerable: true,
        get: () => angularAcceleration,
        set: newAngAcc => angularAcceleration = newAngAcc
      },
      "mass": {
        enumerable: true,
        get: () => mass,
        set: newMass => {
          if (this.rotationalInertia) this.rotationalInertia *= newMass / mass;
          mass = newMass;
        }
      },
      "force": {
        enumerable: true,
        get: () => force,
        set: newForce => force.set(newForce)
      },
      "torque": {
        enumerable: true,
        get: () => torque,
        set: newTorque => torque = newTorque
      },
      "isStatic": {
        enumerable: true,
        get: () => isStatic,
        set: newVal => {
          if (newVal) this.mass = Infinity;
          isStatic = newVal;
        }
      },

      // Constant properties (unchanged by the user):
      "type": {
        value: 'body',
        configurable: true,
        enumerable: true
      },
      "rotationalInertia": {
        value: undefined,
        configurable: true,
        enumerable: true
      },
      "world": {
        value: undefined,
        configurable: true,
        enumerable: true
      },
    });
  }

  /**
   * @method translate
   * Translates the body by a given vector
   * @param {Vector} translation
   */
  translate(translation) {
    this.position = Vector.sum(this.position, translation);
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
    this.force.add(force);
    if (timeout) {
      const self = this;
      setTimeout(function() {self.applyForce(force.inverse);}, timeout * 1000);
    }
  }

  /**
   * @method applyTorque
   * Applies torque to the body
   * @param {number} force: force that creates a rotation
   * @param {number} radius: perpendicular distance from the force to the point of rotation
   * @param {number} timeout: (optional) the time in seconds until the torque is reset
   */
  applyTorque(force, radius, timeout = 0) {
    this.torque += force * radius;
    if (timeout) {
      const self = this;
      setTimeout(function() {self.applyTorque(-force, radius);}, timeout * 1000);
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
    this.velocity.add(this.acceleration);
  }

  /**
   * @method updateAcceleration
   * Updates the body's acceleration
   */
  updateAcceleration() {
    if (this.isStatic) return;
    this.acceleration = Vector.sum(
      this.world.gravity.multipliedBy(this.mass),
      this.world.force,
      this.force
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
    this.angularVelocity += this.angularAcceleration;
  }

  /**
   * @method updateAngularAcceleration
   * Updates the body's angular acceleration
   */
  updateAngularAcceleration() {
    if (this.isStatic) return;
    this.angularAcceleration = this.torque / this.rotationalInertia;
  }

  get boundingBox() {
    throw "the body's bounding box has not been defined";
  }
}
